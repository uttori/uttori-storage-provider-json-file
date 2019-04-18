const debug = require('debug')('Uttori.StorageProvider.JSON');
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const R = require('ramda');
const path = require('path');

class StorageProvider {
  constructor(config) {
    debug('constructor', config);
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
      spaces_article: null,
      spaces_data: null,
      spaces_history: null,
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

  async all() {
    debug('all');
    return Promise.all(this.documents);
  }

  async tags() {
    debug('tags');
    const all = await this.all();
    let tags = R.pluck('tags')(all);
    tags = R.uniq(R.flatten(tags));
    tags = R.filter(R.identity)(tags);
    tags = R.sort((a, b) => a.localeCompare(b), tags);
    debug('tags:', tags);
    return tags;
  }

  async getTaggedDocuments(tag, fields) {
    debug('getTaggedDocuments:', tag, fields);
    const all = await this.all();
    return R.sort(
      (a, b) => a.title.localeCompare(b.title),
      R.filter(
        document => document.tags.includes(tag),
        all,
      ),
    );
  }

  async getRecentDocuments(limit, fields) {
    debug('getRecentDocuments:', limit, fields);
    const all = await this.all();
    return R.take(
      limit,
      R.sort(
        (a, b) => (b.updateDate - a.updateDate),
        R.reject(
          document => !document.updateDate,
          all,
        ),
      ),
    );
  }

  async getPopularDocuments(limit, fields) {
    debug('getPopularDocuments:', limit, fields);
    const visits = await this.readObject('visits');
    const all = await this.all();
    return R.take(
      limit,
      R.sort(
        (a, b) => visits[b.slug] - visits[a.slug],
        R.reject(
          document => (visits[document.slug] || 0) === 0,
          all,
        ),
      ),
    );
  }

  async getRandomDocuments(limit, fields) {
    debug('getRandomDocuments:', limit, fields);
    const all = await this.all();
    return R.take(
      limit,
      R.sort(
        (_a, _b) => Math.random() - Math.random(),
        all,
      ),
    );
  }

  async augmentDocuments(documents, _fields) {
    debug('augmentDocuments:', documents, _fields);
    const all = await this.all();
    return R.reject(
      R.isNil,
      R.map(
        result => R.find(
          R.propEq('slug', result.slug),
          all,
        ),
        documents,
      ),
    );
  }

  async get(slug) {
    debug('get', slug);
    if (!slug) {
      debug('Cannot get document without slug.', slug);
      return undefined;
    }
    const document = R.clone(
      R.find(
        R.propEq('slug', slug),
      )(await this.all()),
    );

    // Analytics: Update Page Views
    if (document) await this.incrementObject('visits', slug, 1);

    return document;
  }

  async getHistory(slug) {
    debug('getHistory', slug);
    if (!slug) {
      debug('Cannot get document history without slug.', slug);
      return undefined;
    }
    const folder = path.join(this.config.history_dir, sanitize(`${slug}`));
    return this.readFolder(folder);
  }

  async getRevision(slug, revision) {
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
    const document = await this.readFile(folder, revision);
    if (!document) {
      debug(`Document history not found for "${slug}", with revision "${revision}"`);
    }
    return document;
  }

  async add(document) {
    debug('Add document:', document);
    const existing = await this.get(document.slug);
    if (!existing) {
      debug('Adding document.', document);
      document.createDate = Date.now();
      document.updateDate = document.createDate;
      document.tags = R.isEmpty(document.tags) ? [] : document.tags;
      document.customData = R.isEmpty(document.customData) ? {} : document.customData;
      await this.updateHistory(document.slug, JSON.stringify(document, null, this.config.spaces_history));
      await this.writeFile(this.config.content_dir, document.slug, JSON.stringify(document, null, this.config.spaces_article));
      await this.refresh();
    } else {
      debug('Cannot add, existing document!');
    }
  }

  async updateValid(document, originalSlug) {
    document.updateDate = Date.now();
    document.tags = R.isEmpty(document.tags) ? [] : document.tags;
    document.customData = R.isEmpty(document.customData) ? {} : document.customData;
    await this.updateHistory(document.slug, JSON.stringify(document, null, this.config.spaces_history), originalSlug);
    await this.writeFile(this.config.content_dir, document.slug, JSON.stringify(document, null, this.config.spaces_article));
    await this.refresh();
  }

  async update(document, originalSlug) {
    debug('Update:', document, originalSlug);
    const existing = await this.get(document.slug);
    const original = await this.get(originalSlug);

    if (existing && original && original.slug !== existing.slug) {
      debug('Cannot update, existing document!');
    } else if (existing && original && original.slug === existing.slug) {
      debug('Updating document:', document);
      await this.updateValid(document, originalSlug);
    } else if (!existing && original) {
      debug('Updating document and updating slug:', document);
      await this.deleteFile(this.config.content_dir, originalSlug);
      await this.updateValid(document, originalSlug);
    } else {
      debug('No document found to update, adding document:', document);
      await this.add(document);
    }
  }

  async delete(slug) {
    debug('delete:', slug);
    const existing = await this.get(slug);
    if (existing) {
      debug('Document found, deleting document:', slug);
      await this.updateHistory(existing.slug, JSON.stringify(existing, null, this.config.spaces_history));
      await this.deleteFile(this.config.content_dir, slug);
      await this.refresh();
    } else {
      debug('Document not found:', slug);
    }
  }

  async storeObject(name, data) {
    debug('storeObject:', name, data);
    if (typeof data !== 'string') {
      data = JSON.stringify(data, null, this.config.spaces_data);
    }
    await this.writeFile(this.config.data_dir, name, data);
  }

  async updateObject(name, key, value) {
    debug('updateObject:', name, key, value);
    if (!name || !key) {
      return;
    }
    let content = await this.readObject(name);
    if (!content) {
      debug(`Object (${name}) has no content, creating.`);
      content = {};
    }
    content[key] = value;
    await this.storeObject(name, content);
  }

  async incrementObject(name, key, amount = 1) {
    debug('incrementObject:', name, key, amount);
    if (!name || !key) {
      return;
    }
    const content = await this.readObject(name);
    if (!content) {
      debug(`Object (${name}) has no content.`);
      return;
    }
    content[key] = (parseInt(content[key], 10) || 0) + amount;
    await this.storeObject(name, content);
  }

  async decrementObject(name, key, amount = 1) {
    debug('decrementObject:', name, key, amount);
    if (!name || !key) {
      return;
    }
    const content = await this.readObject(name);
    if (!content) {
      debug(`Object (${name}) has no content.`);
      return;
    }
    content[key] = (parseInt(content[key], 10) || 0) - amount;
    await this.storeObject(name, content);
  }

  async readObject(name, fallback) {
    debug('readObject:', name);
    if (!name) {
      return fallback;
    }
    const content = await this.readFile(this.config.data_dir, name);
    if (!content) {
      debug(`Object (${name}) has no content.`);
      return fallback;
    }
    return content;
  }

  async readObjectValue(name, key, fallback) {
    debug('readObjectValue:', name, key, fallback);
    if (!name || !key) {
      debug('Missing either name or key');
      return fallback;
    }
    const data = await this.readObject(name, {});
    return data[key] || fallback;
  }

  // Format Specific
  async refresh() {
    debug('refresh');
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

  async deleteFile(folder, name) {
    debug('Deleting:', folder, name);
    const target = `${folder}/${sanitize(`${name}`)}.${this.config.extension}`;
    debug('Deleting target:', target);
    try { await fs.unlink(target); } catch (error) {
      /* istanbul ignore next */
      debug('Error deleting file:', target, error);
    }
  }

  async readFile(folder, name) {
    debug('Reading File:', folder, name);
    const target = `${folder}/${sanitize(`${name}`)}.${this.config.extension}`;
    debug('Reading target:', target);
    let content;
    try { content = await fs.readFile(target, 'utf8'); } catch (error) {
      /* istanbul ignore next */
      debug('Error reading file:', target, error);
    }
    try { content = JSON.parse(content); } catch (error) {
      /* istanbul ignore next */
      debug('Error parsing JSON:', content, error);
    }
    return content;
  }

  async readFolder(folder) {
    debug('Reading Folder:', folder);
    if (await fs.exists(folder)) {
      const content = await fs.readdir(folder);
      return content.map(file => path.parse(file).name);
    }
    debug('Folder not found!');
    return [];
  }

  async writeFile(folder, name, content) {
    debug('writeFile:', folder, name, content);
    const target = `${folder}/${sanitize(`${name}`)}.${this.config.extension}`;
    debug('Writing target:', target);
    try { await fs.writeFile(target, content, 'utf8'); } catch (error) {
      /* istanbul ignore next */
      debug('Error writing file:', target, content, error);
    }
  }

  async updateHistory(slug, content, originalSlug) {
    debug('updateHistory', slug, content, originalSlug);
    const original_folder = path.join(this.config.history_dir, sanitize(`${originalSlug}`));
    const new_folder = path.join(this.config.history_dir, sanitize(`${slug}`));

    // Rename old history folder if one existed
    if (slug && originalSlug && originalSlug !== slug) {
      debug('Updating History...');
      /* istanbul ignore else */
      if (await fs.exists(original_folder)) {
        debug(`Renaming history folder from "${original_folder}" to "${new_folder}"`);
        try { await fs.move(original_folder, new_folder); } catch (error) {
          /* istanbul ignore next */
          debug(`Error renaming history folder from "${original_folder}" to "${new_folder}"`, error);
        }
      }
    }

    /* istanbul ignore else */
    if (!await fs.exists(new_folder)) {
      debug('Creating document history folder:', new_folder);
      /* istanbul ignore next */
      try { await fs.mkdir(new_folder, { recursive: true }); } catch (error) {
        /* istanbul ignore next */
        debug('Error creating document history folder:', new_folder, error);
      }
    }

    await this.writeFile(new_folder, Date.now(), content);
  }
}

module.exports = StorageProvider;
