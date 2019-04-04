const debug = require('debug')('Uttori.StorageProvider.JSON');
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const R = require('ramda');
const path = require('path');

class StorageProvider {
  constructor(config) {
    debug('Constructing...');
    if (!config) {
      debug('No config provided.');
      throw new Error('No config provided.');
    }
    if (!config.content_dir) {
      debug('No content directory provided.');
      throw new Error('No content directory provided.');
    }
    if (!config.history_dir) {
      debug('No history directory provided.');
      throw new Error('No history directory provided.');
    }
    if (!config.data_dir) {
      debug('No data directory provided.');
      throw new Error('No data directory provided.');
    }

    this.config = {
      extension: 'json',
      ...config,
    };

    this.documents = [];

    /* istanbul ignore next */
    try {
      fs.ensureDirSync(this.config.content_dir, { recursive: true });
      fs.ensureDirSync(this.config.history_dir, { recursive: true });
      fs.ensureDirSync(this.config.data_dir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        debug('Error creting directories:', error);
      }
    }

    this.refresh();
  }

  all() {
    debug('all');
    return this.documents;
  }

  get(slug) {
    debug('get', slug);
    if (!slug) {
      debug('Cannot get document without slug.', slug);
      return undefined;
    }
    return R.clone(R.find(R.propEq('slug', slug))(this.documents));
  }

  getHistory(slug) {
    debug('getHistory', slug);
    if (!slug) {
      debug('Cannot get document history without slug.', slug);
      return undefined;
    }
    const folder = path.join(this.config.history_dir, sanitize(`${slug}`));
    return this.readFolder(folder);
  }

  getRevision(slug, revision) {
    debug('getRevision', slug, revision);
    if (!slug) {
      debug('Cannot get document history without slug.', slug);
      return undefined;
    }
    if (!revision) {
      debug('Cannot get document history without revision.', revision);
      return undefined;
    }
    const folder = path.join(this.config.history_dir, sanitize(`${slug}`));
    const document = this.readFile(folder, revision);
    if (!document) {
      debug(`Document history not found for "${slug}", with revision "${revision}"`);
    }
    return document;
  }

  add(document) {
    debug('Add document:', document);
    const existing = this.get(document.slug);
    if (!existing) {
      debug('Adding document.', document);
      document.createDate = Date.now();
      document.updateDate = document.createDate;
      document.tags = R.isEmpty(document.tags) ? [] : document.tags;
      document.customData = R.isEmpty(document.customData) ? {} : document.customData;
      this.updateHistory(document.slug, JSON.stringify(document));
      this.writeFile(this.config.content_dir, document.slug, JSON.stringify(document));
      this.refresh();
    } else {
      debug('Cannot add, existing document!');
    }
  }

  updateValid(document, originalSlug) {
    document.updateDate = Date.now();
    document.tags = R.isEmpty(document.tags) ? [] : document.tags;
    document.customData = R.isEmpty(document.customData) ? {} : document.customData;
    this.updateHistory(document.slug, JSON.stringify(document), originalSlug);
    this.writeFile(this.config.content_dir, document.slug, JSON.stringify(document));
    this.refresh();
  }

  update(document, originalSlug) {
    debug('Update:', document, originalSlug);
    const existing = this.get(document.slug);
    const original = this.get(originalSlug);

    if (existing && original && original.slug !== existing.slug) {
      debug('Cannot update, existing document!');
    } else if (existing && original && original.slug === existing.slug) {
      debug('Updating document:', document);
      this.updateValid(document, originalSlug);
    } else if (!existing && original) {
      debug('Updating document and updating slug:', document);
      this.deleteFile(this.config.content_dir, originalSlug);
      this.updateValid(document, originalSlug);
    } else {
      debug('No document found to update, adding document:', document);
      this.add(document);
    }
  }

  delete(slug) {
    debug('Delete document:', slug);
    const existing = this.get(slug);
    if (existing) {
      debug('Document found, deleting document:', slug);
      this.updateHistory(existing.slug, JSON.stringify(existing));
      this.deleteFile(this.config.content_dir, slug);
      this.refresh();
    } else {
      debug('Document not found:', slug);
    }
  }

  storeObject(name, data) {
    debug('Storing Object:', name, data);
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    this.writeFile(this.config.data_dir, name, data);
  }

  readObject(name) {
    debug('Reading Object:', name);
    const content = this.readFile(this.config.data_dir, name);
    if (!content) {
      debug('Object has no content.');
      return undefined;
    }
    return content;
  }

  // Format Specific
  refresh() {
    debug('Refreshing documents.');
    let documents = [];
    try {
      const fileNames = fs.readdirSync(this.config.content_dir);
      const validFiles = R.filter(
        name => (name.length >= 6) && name.endsWith(this.config.extension),
        fileNames,
      );
      documents = R.map(
        name => this.readFile(this.config.content_dir, path.parse(name).name),
        validFiles,
      );
    } catch (error) {
      /* istanbul ignore next */
      debug('Error refreshing documents:', error);
    }

    this.documents = R.reject(R.isNil, documents);
  }

  deleteFile(folder, name) {
    debug('Deleting:', folder, name);
    const target = `${folder}/${sanitize(`${name}`)}.${this.config.extension}`;
    debug('Deleting target:', target);
    try { fs.unlinkSync(target); } catch (error) {
      /* istanbul ignore next */
      debug('Error deleting file:', target, error);
    }
  }

  readFile(folder, name) {
    debug('Reading File:', folder, name);
    const target = `${folder}/${sanitize(`${name}`)}.${this.config.extension}`;
    debug('Reading target:', target);
    let content;
    try { content = fs.readFileSync(target, 'utf8'); } catch (error) {
      /* istanbul ignore next */
      debug('Error reading file:', target, error);
    }
    try { content = JSON.parse(content); } catch (error) {
      /* istanbul ignore next */
      debug('Error parsing JSON:', content, error);
    }
    return content;
  }

  readFolder(folder) {
    debug('Reading Folder:', folder);
    if (fs.existsSync(folder)) {
      const content = fs.readdirSync(folder) || [];
      return content.map(file => path.parse(file).name);
    }
    debug('Folder not found!');
    return [];
  }

  writeFile(folder, name, content) {
    debug('writeFile:', folder, name, content);
    const target = `${folder}/${sanitize(`${name}`)}.${this.config.extension}`;
    debug('Writing target:', target);
    try { fs.writeFileSync(target, content, 'utf8'); } catch (error) {
      /* istanbul ignore next */
      debug('Error writing file:', target, content, error);
    }
  }

  updateHistory(slug, content, originalSlug) {
    debug('updateHistory', slug, content, originalSlug);
    const original_folder = path.join(this.config.history_dir, sanitize(`${originalSlug}`));
    const new_folder = path.join(this.config.history_dir, sanitize(`${slug}`));

    // Rename old history folder if one existed
    if (slug && originalSlug && originalSlug !== slug) {
      debug('Updating History...');
      /* istanbul ignore else */
      if (fs.existsSync(original_folder)) {
        debug(`Renaming history folder from "${original_folder}" to "${new_folder}"`);
        try { fs.moveSync(original_folder, new_folder); } catch (error) {
          /* istanbul ignore next */
          debug(`Error renaming history folder from "${original_folder}" to "${new_folder}"`, error);
        }
      }
    }

    /* istanbul ignore else */
    if (!fs.existsSync(new_folder)) {
      debug('Creating document history folder:', new_folder);
      /* istanbul ignore next */
      try { fs.mkdirSync(new_folder, { recursive: true }); } catch (error) {
        /* istanbul ignore next */
        debug('Error creating document history folder:', new_folder, error);
      }
    }

    this.writeFile(new_folder, Date.now(), content);
  }
}

module.exports = StorageProvider;
