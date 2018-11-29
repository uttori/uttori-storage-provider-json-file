const debug = require('debug')('Uttori.StorageProvider.JSON');
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const R = require('ramda');
const path = require('path');
const Document = require('uttori-document');

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
    } catch (e) {
      if (e.code !== 'EEXIST') {
        debug('Error creting directories:', e);
      }
    }

    this.refresh();
  }

  all() {
    return this.documents;
  }

  get(slug) {
    if (!slug) {
      debug('Cannot get document without slug.', slug);
      return null;
    }
    let document = R.clone(R.find(R.propEq('slug', slug))(this.documents));
    if (!document) {
      debug(`Document not found: ${slug}, creating.`);
      document = new Document();
      document.slug = slug;
      document.title = slug;
    }
    return document;
  }

  add(document) {
    debug('Add document:', document);
    const existing = this.get(document.slug);
    if (!existing.createDate && !existing.updateDate) {
      debug('Adding document.', document);
      document.createDate = Date.now();
      document.updateDate = document.createDate;
      document.tags = R.isEmpty(document.tags) ? [] : document.tags;
      document.customData = R.isEmpty(document.customData) ? {} : document.customData;
      this.updateHistory(document.slug, JSON.stringify(document));
      this.writeFile(this.config.content_dir, document.slug, JSON.stringify(document));
      this.refresh();
    } else {
      debug('Cannot add, existing document.');
    }
  }

  update(document, originalSlug) {
    debug('Update:', document, originalSlug);
    const existing = this.get(document.slug);

    if (existing.createDate || existing.updateDate) {
      debug('Updating document:', document);
      document.updateDate = Date.now();
      document.tags = R.isEmpty(document.tags) ? [] : document.tags;
      document.customData = R.isEmpty(document.customData) ? {} : document.customData;
      this.updateHistory(document.slug, JSON.stringify(document), originalSlug);
      this.writeFile(this.config.content_dir, document.slug, JSON.stringify(document));
    } else {
      debug('No document found to update, adding document:', document);
      this.add(document);
    }

    if (originalSlug && originalSlug !== existing.slug) {
      debug('Removing original file:', originalSlug);
      this.deleteFile(this.config.content_dir, originalSlug);
      this.updateHistory(document.slug, JSON.stringify(document), originalSlug);
    }

    this.refresh();
  }

  delete(slug) {
    debug('Delete document:', slug);
    const existing = this.get(slug);
    if (existing.createDate || existing.updateDate) {
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
    } catch (e) {
      /* istanbul ignore next */
      debug('Error refreshing documents:', e);
    }

    this.documents = R.reject(R.isNil, documents);
  }

  deleteFile(folder, name) {
    debug('Deleting:', folder, name);
    const target = `${folder}/${sanitize(`${name}`)}.${this.config.extension}`;
    debug('Deleting target:', target);
    try { fs.unlinkSync(target); } catch (e) {
      /* istanbul ignore next */
      debug('Error deleting file:', target, e);
    }
  }

  readFile(folder, name) {
    debug('Reading:', folder, name);
    const target = `${folder}/${sanitize(`${name}`)}.${this.config.extension}`;
    debug('Reading target:', target);
    let content;
    try { content = fs.readFileSync(target, 'utf8'); } catch (e) {
      /* istanbul ignore next */
      debug('Error reading file:', target, e);
    }
    try { content = JSON.parse(content); } catch (e) {
      /* istanbul ignore next */
      debug('Error parsing JSON:', content, e);
    }
    return content;
  }

  writeFile(folder, name, content) {
    debug('Writing:', folder, name, content);
    const target = `${folder}/${sanitize(`${name}`)}.${this.config.extension}`;
    debug('Writing target:', target);
    try { fs.writeFileSync(target, content, 'utf8'); } catch (e) {
      /* istanbul ignore next */
      debug('Error writing file:', target, content, e);
    }
  }

  updateHistory(slug, content, originalSlug) {
    debug('Updating History:', slug, content, originalSlug);
    // Rename old history folder if one existed
    const folder = path.join(this.config.history_dir, sanitize(`${slug}`));
    if (originalSlug && originalSlug.length > 0 && originalSlug !== slug) {
      /* istanbul ignore else */
      if (fs.existsSync(folder)) {
        const new_folder = path.join(this.config.history_dir, sanitize(`${slug}`));
        debug('Renaming history folder:', folder, new_folder);
        try { fs.moveSync(folder, new_folder); } catch (e) {
          /* istanbul ignore next */
          debug('Error renaming history folder:', folder, new_folder, e);
        }
      }
    }

    /* istanbul ignore else */
    if (!fs.existsSync(folder)) {
      /* istanbul ignore next */
      try { fs.mkdirSync(folder, { recursive: true }); } catch (e) {
        /* istanbul ignore next */
        debug('Error creating document history folder:', folder, e);
      }
    }
    this.writeFile(folder, Date.now(), content);
  }
}

module.exports = StorageProvider;
