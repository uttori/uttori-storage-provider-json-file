/** @type {Function} */
let debug = () => {}; try { debug = require('debug')('Uttori.StorageProvider.JSON'); } catch {}
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const path = require('path');
const { processQuery } = require('./query-tools');

/**
 * @typedef UttoriDocument The document object we store, with only the minimum methods we access listed.
 * @property {string} slug The unique identifier for the document.
 * @property {number|Date} [createDate] The creation date of the document.
 * @property {number|Date} [updateDate] The last date the document was updated.
 */

/**
 * Storage for Uttori documents using JSON files stored on the local file system.
 *
 * @property {object} config - The configuration object.
 * @property {string} config.content_directory - The directory to store documents.
 * @property {string} config.history_directory - The directory to store document histories.
 * @property {string} [config.extension='json'] - The file extension to use for file, name of the employee.
 * @property {number} [config.spaces_document=undefined] - The spaces parameter for JSON stringifying documents.
 * @property {number} [config.spaces_history=undefined] - The spaces parameter for JSON stringifying history.
 * @property {object} documents - The collection of documents where the slug is the key and the value is the document.
 * @example <caption>Init StorageProvider</caption>
 * const storageProvider = new StorageProvider({ content_directory: 'content', history_directory: 'history', spaces_document: 2 });
 * @class
 */
class StorageProvider {
/**
 * Creates an instance of StorageProvider.
 *
 * @param {object} config - A configuration object.
 * @param {string} config.content_directory - The directory to store documents.
 * @param {string} config.history_directory - The directory to store document histories.
 * @param {string} [config.extension=json] - The file extension to use for file, name of the employee.
 * @param {boolean} [config.update_timestamps=true] - Should update times be marked at the time of edit.
 * @param {boolean} [config.use_history=true] - Should history entries be created.
 * @param {boolean} [config.use_cache=true] - Should we cache files in memory?
 * @param {number} [config.spaces_document=undefined] - The spaces parameter for JSON stringifying documents.
 * @param {number} [config.spaces_history=undefined] - The spaces parameter for JSON stringifying history.
 * @class
 */
  constructor(config) {
    debug('constructor', config);
    if (!config) {
      debug('No config provided.');
      throw new Error('No config provided.');
    }
    if (!config.content_directory) {
      debug('No content directory provided.');
      throw new Error('No content directory provided.');
    }
    if (!config.history_directory) {
      debug('No history directory provided.');
      throw new Error('No history directory provided.');
    }

    this.config = {
      extension: 'json',
      update_timestamps: true,
      use_history: true,
      use_cache: true,
      spaces_document: undefined,
      spaces_history: undefined,
      ...config,
    };

    this.refresh = true;
    this.documents = {};
    fs.ensureDirSync(this.config.content_directory);
    fs.ensureDirSync(this.config.history_directory);

    this.all = this.all.bind(this);
    this.getQuery = this.getQuery.bind(this);
    this.get = this.get.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.getRevision = this.getRevision.bind(this);
    this.add = this.add.bind(this);
    this.updateValid = this.updateValid.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.updateHistory = this.updateHistory.bind(this);
  }

  /**
   * Returns all documents.
   *
   * @returns {object} All documents.
   * @example
   * storageProvider.all();
   * ➜ { first-document: { slug: 'first-document', ... }, ...}
   */
  all() {
    debug('all');
    if (this.config.use_cache && this.refresh === false) {
      return this.documents;
    }

    const documents = {};
    try {
      const fileNames = fs.readdirSync(this.config.content_directory);
      const validFiles = fileNames.filter((name) => (name.length >= 6) && name.endsWith(this.config.extension));
      for (const name of validFiles) {
        const file = path.join(this.config.content_directory, `${path.parse(name).name}.${this.config.extension}`);
        debug('all: Reading', file);
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);
        documents[data.slug] = data;
      }
      debug('all: found', Object.values(documents).length);
      if (this.config.use_cache) {
        this.documents = documents;
        this.refresh = false;
      }
    } catch (error) {
      /* istanbul ignore next */
      debug('all: Error:', error);
    }
    return documents;
  }

  /**
   * Returns all documents matching a given query.
   *
   * @async
   * @param {string} query - The conditions on which documents should be returned.
   * @returns {Promise<UttoriDocument[]|number>} Promise object represents all matching documents.
   */
  async getQuery(query) {
    debug('getQuery:', query);
    return processQuery(query, Object.values(this.all()));
  }

  /**
   * Returns a document for a given slug.
   *
   * @async
   * @param {string} slug - The slug of the document to be returned.
   * @returns {Promise<UttoriDocument|undefined>} Promise object represents the returned UttoriDocument.
   */
  async get(slug) {
    debug('get:', slug);
    if (!slug) {
      debug('get: Cannot get document without slug.');
      return undefined;
    }
    slug = sanitize(`${slug}`);

    // Check the cache, fall back to reading the file.
    if (this.config.use_cache && this.documents[slug]) {
      return { ...this.documents[slug] };
    }

    // Either not in cache or not using cache, read a document from a file.
    try {
      const file = path.join(this.config.content_directory, `${slug}.${this.config.extension}`);
      debug('get:', file);
      const content = await fs.readFile(file, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      debug(`get: Error reading "${slug}":`, error);
      return undefined;
    }
  }

  /**
   * Saves a document to the file system.
   *
   * @async
   * @param {UttoriDocument} document - The document to be added to the collection.
   */
  async add(document) {
    if (!document || !document.slug) {
      debug('add: Cannot add, missing slug.');
      return;
    }
    const existing = await this.get(document.slug);
    if (!existing) {
      debug('add: new document', document);
      document.createDate = Date.now();
      document.updateDate = document.createDate;
      if (this.config.use_history) {
        await this.updateHistory(document.slug, JSON.stringify(document, undefined, this.config.spaces_history));
      }
      if (this.config.use_cache) {
        this.documents[document.slug] = document;
      }

      try {
        const file = path.join(this.config.content_directory, `${document.slug}.${this.config.extension}`);
        debug('add: Creating content file:', file);
        await fs.writeFile(file, JSON.stringify(document, undefined, this.config.spaces_document), 'utf8');
      } catch (error) {
        /* istanbul ignore next */
        debug('add: Error creating content file:', error);
      }
    } else {
      debug('add: Cannot add, existing document!');
    }
  }

  /**
   * Updates a document and saves to the file system.
   *
   * @async
   * @private
   * @param {UttoriDocument} document - The document to be updated in the collection.
   * @param {string} originalSlug - The original slug identifying the document, or the slug if it has not changed.
   */
  async updateValid(document, originalSlug) {
    debug('updateValid');
    if (this.config.update_timestamps) {
      document.updateDate = Date.now();
    }
    if (this.config.use_history) {
      await this.updateHistory(document.slug, JSON.stringify(document, undefined, this.config.spaces_history), originalSlug);
    }
    if (this.config.use_cache) {
      this.documents[document.slug] = document;
    }

    try {
      const file = path.join(this.config.content_directory, `${document.slug}.${this.config.extension}`);
      debug('updateValid: Updating content file:', file);
      await fs.writeFile(file, JSON.stringify(document, undefined, this.config.spaces_document), 'utf8');
    } catch (error) {
      /* istanbul ignore next */
      debug('updateValid: Error updating content file:', error);
    }
  }

  /**
   * Updates a document and figures out how to save to the file system.
   *
   * @async
   * @param {object} params - The params object.
   * @param {UttoriDocument} params.document - The document to be updated in the collection.
   * @param {string} params.originalSlug - The original slug identifying the document, or the slug if it has not changed.
   */
  async update({ document, originalSlug }) {
    debug('update');
    if (!document || !document.slug) {
      debug('Cannot update, missing slug.');
      return;
    }
    debug('update:', document.slug, 'originalSlug:', originalSlug);
    const existing = await this.get(document.slug);
    let original;
    if (originalSlug) {
      original = await this.get(originalSlug);
    }
    if (existing && original && original.slug !== existing.slug) {
      debug(`update: Cannot update, existing document with new slug "${originalSlug}"!`);
    } else if (existing && original && original.slug === existing.slug) {
      debug(`update: Updating document with slug "${document.slug}"`);
      await this.updateValid(document, originalSlug);
    } else if (existing && !original) {
      debug(`update: Updating document with slug "${document.slug}" but no originalSlug`);
      await this.updateValid(document, document.slug);
    } else if (!existing && original) {
      debug(`update: Updating document and changing slug from "${originalSlug}" to "${document.slug}"`);
      if (this.config.use_cache) {
        delete this.documents[originalSlug];
      }
      /* istanbul ignore next */
      try {
        const file = path.join(this.config.content_directory, `${originalSlug}.${this.config.extension}`);
        debug('update: Deleting old file:', file);
        fs.unlink(file);
      } catch (error) {
        debug('update: Error deleteing old file:', error);
      }
      await this.updateValid(document, originalSlug);
    } else {
      debug(`update: No document found to update with slug "${originalSlug}", adding document with slug "${document.slug}"`);
      await this.add(document);
    }
  }

  /**
   * Removes a document from the file system.
   *
   * @async
   * @param {string} slug - The slug identifying the document.
   */
  async delete(slug) {
    debug('delete:', slug);
    const existing = await this.get(slug);
    if (existing) {
      debug('Document found, deleting document:', slug);
      if (this.config.use_history) {
        await this.updateHistory(slug, JSON.stringify(existing, undefined, this.config.spaces_history));
      }
      if (this.config.use_cache) {
        delete this.documents[slug];
      }
      /* istanbul ignore next */
      try {
        const file = path.join(this.config.content_directory, `${slug}.${this.config.extension}`);
        debug('delete: Deleting content file:', file);
        fs.unlink(file);
      } catch (error) {
        debug('delete: Error deleteing content file:', error);
      }
    } else {
      debug('Document not found:', slug);
    }
  }

  /**
   * Returns the history of edits for a given slug.
   *
   * @async
   * @param {string} slug - The slug of the document to get history for.
   * @returns {Promise<string[]>} Promise object represents the returned history.
   */
  async getHistory(slug) {
    debug('getHistory', slug);
    if (!slug) {
      debug('Cannot get document history without slug.', slug);
      return [];
    }

    let history = [];
    const directory = path.join(this.config.history_directory, sanitize(`${slug}`));
    debug('getHistory: directory', directory);
    // eslint-disable-next-line no-bitwise, no-promise-executor-return
    const access = await new Promise((resolve) => fs.access(directory, fs.constants.R_OK | fs.constants.W_OK, (err) => (!err ? resolve(true) : resolve(false))));
    if (access) {
      history = await fs.readdir(directory);
      // Return the filename without extension, just the timestamp.
      history = history.map((file) => path.basename(file, `.${this.config.extension}`));
    }
    debug('getHistory: history', history);
    return history;
  }

  /**
   * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
   *
   * @async
   * @param {object} params - The params object.
   * @param {string} params.slug - The slug of the document to be returned.
   * @param {string|number} params.revision - The unix timestamp of the history to be returned.
   * @returns {Promise<UttoriDocument|undefined>} Promise object represents the returned revision of the document.
   */
  async getRevision({ slug, revision }) {
    debug('getRevision', slug, revision);
    if (!slug) {
      debug('getRevision: Cannot get document history without slug.', slug);
      return undefined;
    }
    if (!revision) {
      debug('getRevision: Cannot get document history without revision.', revision);
      return undefined;
    }
    try {
      const file = path.join(this.config.history_directory, sanitize(`${slug}`), sanitize(`${revision}.${this.config.extension}`));
      debug('getRevision: Reading history file:', file);
      const content = await fs.readFile(file, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      debug('getRevision: Error reading history file:', error);
      return undefined;
    }
  }

  // Format Specific Methods

  /**
   * Updates History for a given slug, renaming the store file and history directory as needed.
   *
   * @async
   * @param {string} slug - The slug of the document to update history for.
   * @param {string} content - The revision of the document to be saved.
   * @param {string} [originalSlug] - The original slug identifying the document, or the slug if it has not changed.
   */
  async updateHistory(slug, content, originalSlug) {
    debug('updateHistory:', slug, content, originalSlug);
    const original_directory = path.join(this.config.history_directory, sanitize(`${originalSlug}`));
    const new_directory = path.join(this.config.history_directory, sanitize(`${slug}`));

    // Rename old history directory if one existed
    if (slug && originalSlug && originalSlug !== slug) {
      debug(`updateHistory: Updating history directory from "${originalSlug}" to "${slug}"`);
      /* istanbul ignore else */
      if (await fs.pathExists(original_directory)) {
        debug(`updateHistory: Renaming history directory from "${original_directory}" to "${new_directory}"`);
        try { await fs.move(original_directory, new_directory); } catch (error) {
          /* istanbul ignore next */
          debug(`updateHistory: Error renaming history directory from "${original_directory}" to "${new_directory}"`, error);
        }
      }
    }

    /* istanbul ignore else */
    const pathExists = await fs.pathExists(new_directory);
    if (!pathExists) {
      debug('updateHistory: Creating document history directory:', new_directory);
      /* istanbul ignore next */
      try {
        await fs.mkdir(new_directory);
      } catch (error) {
        /* istanbul ignore next */
        debug('updateHistory: Error creating document history directory:', new_directory, error);
      }
    }
    /* istanbul ignore next */
    try {
      let file = path.join(new_directory, `${Date.now()}.${this.config.extension}`);
      let fileExists = await fs.pathExists(file);
      while (fileExists) {
        file = path.join(new_directory, `${Date.now()}.${this.config.extension}`);
        // eslint-disable-next-line no-await-in-loop
        fileExists = await fs.pathExists(file);
      }
      debug('updateHistory: Creating history file:', file);
      await fs.writeFile(file, content, 'utf8');
    } catch (error) {
      debug('updateHistory: Error creating history file:', error);
    }
  }
}

module.exports = StorageProvider;
