/* eslint-disable unicorn/no-fn-reference-in-iterator */
const debug = require('debug')('Uttori.StorageProvider.JSON');
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const R = require('ramda');
const path = require('path');
const { FileUtility } = require('uttori-utilities');
const { process } = require('./query-tools');

/**
 * @typedef UttoriDocument The document object we store, with only the minimum methods we access listed.
 * @property {String} slug The unique identifier for the document.
 * @property {String} [title=''] The unique identifier for the document.
 * @property {Number | Date} [createDate] The creation date of the document.
 * @property {Number | Date} [updateDate] The last date the document was updated.
 * @property {String[]} [tags=[]] The unique identifier for the document.
 * @property {Object} [customData={}] Any extra meta data for the document.
 */

/**
  * Storage for Uttori documents using JSON files stored on the local file system.
  * @property {Object} config - The configuration object.
  * @property {String} config.content_directory - The directory to store documents.
  * @property {String} config.history_directory - The directory to store document histories.
  * @property {String} config.extension='json' - The file extension to use for file, name of the employee.
  * @property {Number} config.spaces_document=undefined - The spaces parameter for JSON stringifying documents.
  * @property {Number} config.spaces_history=undefined - The spaces parameter for JSON stringifying history.
  * @property {UttoriDocument[]} documents - The collection of documents.
  * @example <caption>Init StorageProvider</caption>
  * const storageProvider = new StorageProvider({ content_directory: 'content', history_directory: 'history', spaces_document: 2 });
  * @class
  */
class StorageProvider {
/**
  * Creates an instance of StorageProvider.
  * @param {Object} config - A configuration object.
  * @param {String} config.content_directory - The directory to store documents.
  * @param {String} config.history_directory - The directory to store document histories.
  * @param {String} [config.extension=json] - The file extension to use for file, name of the employee.
  * @param {Number} [config.spaces_document=undefined] - The spaces parameter for JSON stringifying documents.
  * @param {Number} [config.spaces_history=undefined] - The spaces parameter for JSON stringifying history.
  * @constructor
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
      spaces_document: undefined,
      spaces_history: undefined,
      ...config,
    };

    this.documents = [];
    FileUtility.ensureDirectorySync(this.config.content_directory);
    FileUtility.ensureDirectorySync(this.config.history_directory);

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
   * Returns all documents matching a given query.
   * @async
   * @param {String} query - The conditions on which documents should be returned.
   * @returns {Promise} Promise object represents all matching documents.
   * @memberof StorageProvider
   */
  async getQuery(query) {
    debug('getQuery:', query);
    const all = await this.all();
    return process(query, all);
  }

  /**
   * Returns a document for a given slug.
   * @async
   * @param {String} slug - The slug of the document to be returned.
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
    if (!document) {
      debug('No document found!');
      return undefined;
    }
    return document;
  }

  /**
   * Returns the history of edits for a given slug.
   * @async
   * @param {String} slug - The slug of the document to get history for.
   * @returns {Promise} Promise object represents the returned history.
   * @memberof StorageProvider
   */
  async getHistory(slug) {
    debug('getHistory', slug);
    if (!slug) {
      debug('Cannot get document history without slug.', slug);
      return undefined;
    }
    const folder = path.join(this.config.history_directory, sanitize(`${slug}`));
    return FileUtility.readFolder(folder);
  }

  /**
   * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
   * @async
   * @param {String} slug - The slug of the document to be returned.
   * @param {Number} revision - The unix timestamp of the history to be returned.
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
    const folder = path.join(this.config.history_directory, sanitize(`${slug}`));
    const document = await FileUtility.readJSON(folder, `${revision}`, this.config.extension);
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
    debug('add');
    if (!document || !document.slug) {
      debug('Cannot add, missing slug.');
      return;
    }
    debug('add:', document.slug);
    const existing = await this.get(document.slug);
    if (!existing) {
      debug('Adding document.', document);
      document.createDate = Date.now();
      document.updateDate = document.createDate;
      document.tags = R.isEmpty(document.tags) ? [] : document.tags;
      document.customData = R.isEmpty(document.customData) ? {} : document.customData;
      await this.updateHistory(document.slug, JSON.stringify(document, undefined, this.config.spaces_history));
      await FileUtility.writeFile(this.config.content_directory, document.slug, this.config.extension, JSON.stringify(document, undefined, this.config.spaces_document));
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
   * @param {String} originalSlug - The original slug identifying the document, or the slug if it has not changed.
   * @memberof StorageProvider
   */
  async updateValid(document, originalSlug) {
    debug('updateValid');
    document.updateDate = Date.now();
    document.tags = R.isEmpty(document.tags) ? [] : document.tags;
    document.customData = R.isEmpty(document.customData) ? {} : document.customData;
    await this.updateHistory(document.slug, JSON.stringify(document, undefined, this.config.spaces_history), originalSlug);
    await FileUtility.writeFile(this.config.content_directory, document.slug, this.config.extension, JSON.stringify(document, undefined, this.config.spaces_document));
    await this.refresh();
  }

  /**
   * Updates a document and figures out how to save to the file system.
   * @async
   * @param {UttoriDocument} document - The document to be updated in the collection.
   * @param {String} originalSlug - The original slug identifying the document, or the slug if it has not changed.
   * @memberof StorageProvider
   */
  async update(document, originalSlug) {
    debug('Update:', document, originalSlug);
    if (!document || !document.slug) {
      debug('Cannot update, missing slug.');
      return;
    }
    debug('update:', document.slug, originalSlug);
    const existing = await this.get(document.slug);
    const original = await this.get(originalSlug);
    if (existing && original && original.slug !== existing.slug) {
      debug(`Cannot update, existing document with slug "${originalSlug}"!`);
    } else if (existing && original && original.slug === existing.slug) {
      debug(`Updating document with slug "${document.slug}"`);
      await this.updateValid(document, originalSlug);
    } else if (!existing && original) {
      debug(`Updating document with slug from "${originalSlug}" to "${document.slug}"`);
      await FileUtility.deleteFile(this.config.content_directory, originalSlug, this.config.extension);
      await this.updateValid(document, originalSlug);
    } else {
      debug(`No document found to update with slug "${originalSlug}", adding document with slug "${document.slug}"`);
      await this.add(document);
    }
  }

  /**
   * Removes a document from the file system.
   * @async
   * @param {String} slug - The slug identifying the document.
   * @memberof StorageProvider
   */
  async delete(slug) {
    debug('delete:', slug);
    const existing = await this.get(slug);
    if (existing) {
      debug('Document found, deleting document:', slug);
      await this.updateHistory(existing.slug, JSON.stringify(existing, undefined, this.config.spaces_history));
      await FileUtility.deleteFile(this.config.content_directory, slug, this.config.extension);
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
      const fileNames = fs.readdirSync(this.config.content_directory);
      const validFiles = R.filter(
        (name) => (name.length >= 6) && name.endsWith(this.config.extension),
        fileNames,
      );
      documents = R.map(
        (name) => FileUtility.readJSON(this.config.content_directory, path.parse(name).name, this.config.extension),
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
   * @param {String} slug - The slug of the document to update history for.
   * @param {String} content - The revision of the document to be saved.
   * @param {String} [originalSlug] - The original slug identifying the document, or the slug if it has not changed.
   * @memberof StorageProvider
   */
  async updateHistory(slug, content, originalSlug) {
    debug('updateHistory', slug, content, originalSlug);
    const original_folder = path.join(this.config.history_directory, sanitize(`${originalSlug}`));
    const new_folder = path.join(this.config.history_directory, sanitize(`${slug}`));

    // Rename old history folder if one existed
    if (slug && originalSlug && originalSlug !== slug) {
      debug(`Updating history from "${originalSlug}" to "${slug}"`);
      /* istanbul ignore else */
      if (await fs.pathExists(original_folder)) {
        debug(`Renaming history folder from "${original_folder}" to "${new_folder}"`);
        try { await fs.move(original_folder, new_folder); } catch (error) {
          /* istanbul ignore next */
          debug(`Error renaming history folder from "${original_folder}" to "${new_folder}"`, error);
        }
      }
    }

    /* istanbul ignore else */
    if (!await fs.pathExists(new_folder)) {
      debug('Creating document history folder:', new_folder);
      /* istanbul ignore next */
      try { await FileUtility.ensureDirectory(new_folder); } catch (error) {
        /* istanbul ignore next */
        debug('Error creating document history folder:', new_folder, error);
      }
    }

    await FileUtility.writeFile(new_folder, `${Date.now()}`, this.config.extension, content);
  }
}

module.exports = StorageProvider;
