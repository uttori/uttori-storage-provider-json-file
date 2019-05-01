const debug = require('debug')('Uttori.StorageProvider.JSON');
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const R = require('ramda');
const path = require('path');

/**
  * Storage for Uttori documents using JSON files stored on the local file system.
  * @property {Object} config - The configuration object.
  * @property {UttoriDocument[]} documents - The collection of documents.
  * @example <caption>Init StorageProvider</caption>
  * const storageProvider = new StorageProvider({ content_dir: 'content', history_dir: 'history', data_dir: 'data', spaces_document: 2 });
  * @class
  */
class StorageProvider {
/**
  * Creates an instance of StorageProvider.
  * @param {Object} config - A configuration object.
  * @param {string} config.content_dir - The directory to store documents.
  * @param {string} config.history_dir - The directory to store document histories.
  * @param {string} config.data_dir - The directory to store objects.
  * @param {string} [config.extension=json] - The file extension to use for file, name of the employee.
  * @param {string} [config.analytics_file=visits] - The name of the file to store page views.
  * @param {number} [config.spaces_document=null] - The spaces parameter for JSON stringifying documents.
  * @param {number} [config.spaces_data=null] - The spaces parameter for JSON stringifying data.
  * @param {number} [config.spaces_history=null] - The spaces parameter for JSON stringifying history.
  * @constructor
  */
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
      analytics_file: 'visits',
      spaces_document: null,
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

  /**
   * Returns all documents.
   * @async
   * @returns {Promise} Promise object represents all documents.
   * @example
   * storageProvider.all();
   * ➜ [{ slug: 'first-document', ... }, ...]
   * @memberof StorageProvider
   */
  async all() {
    debug('all');
    return Promise.all(this.documents);
  }

  /**
   * Returns all unique tags.
   * @async
   * @returns {Promise} Promise object represents all documents.
   * @example
   * storageProvider.tags();
   * ➜ ['first-tag', ...]
   * @memberof StorageProvider
   */
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

  /**
   * Returns all documents matching a given tag.
   * @async
   * @param {string} tag - The tag to compare against other documents.
   * @param {number} [limit=1000] - The maximum number of documents to return.
   * @param {string[]} fields - Unused: the fields to return on the documents.
   * @returns {Promise} Promise object represents all matching documents.
   * @memberof StorageProvider
   */
  async getTaggedDocuments(tag, limit = 1000, fields) {
    debug('getTaggedDocuments:', tag, fields);
    const all = await this.all();
    return R.take(
      limit,
      R.sort(
        (a, b) => a.title.localeCompare(b.title),
        R.filter(
          document => document.tags.includes(tag),
          R.reject(
            R.propEq('slug', this.config.home_page),
            all,
          ),
        ),
      ),
    );
  }

  /**
   * Returns a given number of documents related to a given document by comparing tags.
   * @async
   * @param {UttoriDocument} document - The document to compare against other documents.
   * @param {number} limit - The maximum number of documents to return.
   * @param {string[]} fields - Unused: the fields to return on the documents.
   * @returns {Promise} Promise object represents all matching documents.
   * @memberof StorageProvider
   */
  async getRelatedDocuments(document, limit, fields) {
    debug('getTaggedDocuments:', document, limit, fields);
    if (!document) {
      return [];
    }
    const tags = document.tags || [];
    const all = await this.all();
    const overlaps = R.pipe(R.intersection, R.complement(R.isEmpty));

    return R.take(
      limit,
      R.sort(
        (a, b) => a.title.localeCompare(b.title),
        R.filter(
          d => overlaps(tags, d.tags),
          R.reject(
            R.propEq('slug', this.config.home_page) && R.propEq('slug', document.slug),
            all,
          ),
        ),
      ),
    );
  }

  /**
   * Returns a given number of documents sorted by most recently updated.
   * @async
   * @param {number} limit - The maximum number of documents to return.
   * @param {string[]} fields - Unused: the fields to return on the documents.
   * @returns {Promise} Promise object represents all matching documents.
   * @memberof StorageProvider
   */
  async getRecentDocuments(limit, fields) {
    debug('getRecentDocuments:', limit, fields);
    const all = await this.all();
    return R.take(
      limit,
      R.sort(
        (a, b) => (b.updateDate - a.updateDate),
        R.filter(
          document => document.updateDate,
          R.reject(
            R.propEq('slug', this.config.home_page),
            all,
          ),
        ),
      ),
    );
  }

  /**
   * Returns a given number of documents sorted by most visited.
   * @async
   * @param {number} limit - The maximum number of documents to return.
   * @param {string[]} fields - Unused: the fields to return on the documents.
   * @returns {Promise} Promise object represents all matching documents.
   * @memberof StorageProvider
   */
  async getPopularDocuments(limit, fields) {
    debug('getPopularDocuments:', limit, fields);
    const visits = await this.readObject(this.config.analytics_file, {});
    const all = await this.all();
    return R.take(
      limit,
      R.sort(
        (a, b) => visits[b.slug] - visits[a.slug],
        R.reject(
          document => (visits[document.slug] || 0) === 0,
          R.reject(
            R.propEq('slug', this.config.home_page),
            all,
          ),
        ),
      ),
    );
  }

  /**
   * Returns a given number of randomly selected documents.
   * @async
   * @param {number} limit - The maximum number of documents to return.
   * @param {string[]} fields - Unused: the fields to return on the documents.
   * @returns {Promise} Promise object represents all matching documents.
   * @memberof StorageProvider
   */
  async getRandomDocuments(limit, fields) {
    debug('getRandomDocuments:', limit, fields);
    const all = await this.all();
    return R.take(
      limit,
      R.sort(
        (_a, _b) => Math.random() - Math.random(),
        R.reject(
          R.propEq('slug', this.config.home_page),
          all,
        ),
      ),
    );
  }

  /**
   * Ensures a given set of fields are presenton on a given set of documents.
   * @async
   * @param {UttoriDocument[]} documents - The documents to ensure fields are set on.
   * @param {string[]} _fields - Unused: the fields to return on the documents.
   * @returns {Promise} Promise object represents all augmented documents.
   * @memberof StorageProvider
   */
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

  /**
   * Returns a document for a given slug.
   * @async
   * @param {string} slug - The slug of the document to be returned.
   * @returns {Promise} Promise object represents the returned UttoriDocument.
   * @memberof StorageProvider
   */
  async get(slug) {
    debug('get', slug);
    if (!slug) {
      debug('Cannot get document without slug.', slug);
      return undefined;
    }
    const all = await this.all();
    const document = R.clone(
      R.find(
        R.propEq('slug', slug),
      )(all),
    );

    // Analytics: Update Page Views
    if (document) {
      await this.incrementObject(this.config.analytics_file, slug, 1);
    }

    return document;
  }

  /**
   * Returns the history of edits for a given slug.
   * @async
   * @param {string} slug - The slug of the document to get history for.
   * @returns {Promise} Promise object represents the returned history.
   * @memberof StorageProvider
   */
  async getHistory(slug) {
    debug('getHistory', slug);
    if (!slug) {
      debug('Cannot get document history without slug.', slug);
      return undefined;
    }
    const folder = path.join(this.config.history_dir, sanitize(`${slug}`));
    return this.readFolder(folder);
  }

  /**
   * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
   * @async
   * @param {string} slug - The slug of the document to be returned.
   * @param {number} revision - The unix timestamp of the history to be returned.
   * @returns {Promise} Promise object represents the returned revision of the document.
   * @memberof StorageProvider
   */
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

  /**
   * Saves a document to the file system.
   * @async
   * @param {UttoriDocument} document - The document to be added to the collection.
   * @memberof StorageProvider
   */
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
      await this.writeFile(this.config.content_dir, document.slug, JSON.stringify(document, null, this.config.spaces_document));
      await this.refresh();
    } else {
      debug('Cannot add, existing document!');
    }
  }

  /**
   * Updates a document and saves to the file system.
   * @async
   * @private
   * @param {UttoriDocument} document - The document to be updated in the collection.
   * @param {string} originalSlug - The original slug identifying the document, or the slug if it has not changed.
   * @memberof StorageProvider
   */
  async updateValid(document, originalSlug) {
    document.updateDate = Date.now();
    document.tags = R.isEmpty(document.tags) ? [] : document.tags;
    document.customData = R.isEmpty(document.customData) ? {} : document.customData;
    await this.updateHistory(document.slug, JSON.stringify(document, null, this.config.spaces_history), originalSlug);
    await this.writeFile(this.config.content_dir, document.slug, JSON.stringify(document, null, this.config.spaces_document));
    await this.refresh();
  }

  /**
   * Updates a document and figures out how to save to the file system.
   * @async
   * @param {UttoriDocument} document - The document to be updated in the collection.
   * @param {string} originalSlug - The original slug identifying the document, or the slug if it has not changed.
   * @memberof StorageProvider
   */
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

  /**
   * Removes a document from the file system.
   * @async
   * @param {string} slug - The slug identifying the document.
   * @memberof StorageProvider
   */
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

  /**
   * Saves a JSON object to the file system.
   * @async
   * @param {string} name - The name of the file to be saved.
   * @param {string|Object} data - The JSON data for the file to be saved.
   * @memberof StorageProvider
   */
  async storeObject(name, data) {
    debug('storeObject:', name, data);
    if (typeof data !== 'string') {
      data = JSON.stringify(data, null, this.config.spaces_data);
    }
    await this.writeFile(this.config.data_dir, name, data);
  }

  /**
   * Updates a value in a JSON object on the file system.
   * @async
   * @param {string} name - The name of the file to be updated.
   * @param {string} key - The key of the value to be updated.
   * @param {Array|number|string|Object} value - The JSON data for the file to be saved.
   * @memberof StorageProvider
   */
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

  /**
   * Increment a value by a given amount in a JSON object on the file system.
   * @async
   * @param {string} name - The name of the file to be updated.
   * @param {string} key - The key of the value to be updated.
   * @param {number} [amount=1] - The value to be added.
   * @memberof StorageProvider
   */
  async incrementObject(name, key, amount = 1) {
    debug('incrementObject:', name, key, amount);
    if (!name || !key || amount === 0) {
      debug('Missing parameter.');
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

  /**
   * Decrement a value by a given amount in a JSON object on the file system.
   * @async
   * @param {string} name - The name of the file to be updated.
   * @param {string} key - The key of the value to be updated.
   * @param {number} [amount=1] - The value to be subtracted.
   * @memberof StorageProvider
   */
  async decrementObject(name, key, amount = 1) {
    debug('decrementObject:', name, key, amount);
    await this.incrementObject(name, key, -1 * amount);
  }

  /**
   * Reads a JSON object on the file system.
   * @async
   * @param {string} name - The name of the file to be read.
   * @param {Object} fallback - The backup value to use if no value is found.
   * @returns {Promise<Object>} Promise object represents the returned object.
   * @memberof StorageProvider
   */
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

  /**
   * Reads a specific value from a JSON object on the file system.
   * @async
   * @param {string} name - The name of the file to get the value from.
   * @param {string} key - The key of the value to be returned.
   * @param {Object} fallback - The backup value to use if no value is found.
   * @returns {Promise<Object>} Promise object represents the returned object.
   * @memberof StorageProvider
   */
  async readObjectValue(name, key, fallback) {
    debug('readObjectValue:', name, key, fallback);
    if (!name || !key) {
      debug('Missing either name or key');
      return fallback;
    }
    const data = await this.readObject(name, {});
    return data[key] || fallback;
  }

  // Format Specific Methods

  /**
   * Reloads all documents from the file system into the cache.
   * @async
   * @memberof StorageProvider
   */
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

  /**
   * Deletes a file from the file system.
   * @async
   * @param {string} folder - The folder of the file to be deleted.
   * @param {string} name - The name of the file to be deleted.
   * @memberof StorageProvider
   */
  async deleteFile(folder, name) {
    debug('deleteFile:', folder, name);
    const target = `${folder}/${sanitize(`${name}`)}.${this.config.extension}`;
    debug('Deleting target:', target);
    try { await fs.unlink(target); } catch (error) {
      /* istanbul ignore next */
      debug('Error deleting file:', target, error);
    }
  }

  /**
   * Reads a file from the file system.
   * @async
   * @param {string} folder - The folder of the file to be read.
   * @param {string} name - The name of the file to be read.
   * @returns {Object} - The parsed JSON file contents.
   * @memberof StorageProvider
   */
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

  /**
   * Reads a folder from the file system.
   * @async
   * @param {string} folder - The folder to be read.
   * @returns {string[]} - The file paths found in the folder.
   * @memberof StorageProvider
   */
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

  /**
 * Updates History for a given slug, renaming the store file and history folder as needed.
 * @async
 * @param {string} slug - The slug of the document to update history for.
 * @param {string} content - The revision of the document to be saved.
 * @param {string} originalSlug - The original slug identifying the document, or the slug if it has not changed.
 * @memberof StorageProvider
 */
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
