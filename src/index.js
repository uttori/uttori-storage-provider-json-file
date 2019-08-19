const debug = require('debug')('Uttori.StorageProvider.JSON');
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const R = require('ramda');
const path = require('path');
const { FileUtility } = require('uttori-utilities');
const { process } = require('./query-tools');

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
      spaces_document: null,
      spaces_data: null,
      spaces_history: null,
      ...config,
    };

    this.documents = [];
    FileUtility.ensureDirectorySync(this.config.content_dir);
    FileUtility.ensureDirectorySync(this.config.history_dir);
    FileUtility.ensureDirectorySync(this.config.data_dir);

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
   * Returns all documents matching a given query.
   * @async
   * @param {string} query - The conditions on which documents should be returned.
   * @returns {Promise} Promise object represents all matching documents.
   * @memberof StorageProvider
   */
  // TODO Use new tools and migrate to using this fully
  async getQuery(query) {
    debug('getQuery:', query);
    const all = await this.all();
    return process(query, all);
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
    return FileUtility.readFolder(folder);
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
    const document = await FileUtility.readJSON(folder, revision, this.config.extension);
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
      await FileUtility.writeFile(this.config.content_dir, document.slug, this.config.extension, JSON.stringify(document, null, this.config.spaces_document));
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
    await FileUtility.writeFile(this.config.content_dir, document.slug, this.config.extension, JSON.stringify(document, null, this.config.spaces_document));
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
      await FileUtility.deleteFile(this.config.content_dir, originalSlug, this.config.extension);
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
      await FileUtility.deleteFile(this.config.content_dir, slug, this.config.extension);
      await this.refresh();
    } else {
      debug('Document not found:', slug);
    }
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
        (name) => (name.length >= 6) && name.endsWith(this.config.extension),
        fileNames,
      );
      documents = R.map(
        (name) => FileUtility.readJSON(this.config.content_dir, path.parse(name).name, this.config.extension),
        validFiles,
      );
    } catch (error) {
      /* istanbul ignore next */
      debug('Error refreshing documents:', error);
    }

    this.documents = R.reject(R.isNil, documents);
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
      try { await FileUtility.ensureDirectory(new_folder); } catch (error) {
        /* istanbul ignore next */
        debug('Error creating document history folder:', new_folder, error);
      }
    }

    await FileUtility.writeFile(new_folder, Date.now(), this.config.extension, content);
  }
}

module.exports = StorageProvider;
