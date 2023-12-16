import { promises as fs } from 'fs';
import sanitize from 'sanitize-filename';
import path from 'path';
import processQuery from './query-tools.js';

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.StorageProvider.JSON'); } catch {}

/**
 * @typedef UttoriDocument The document object we store, with only the minimum methods we access listed.
 * @property {string} slug The unique identifier for the document.
 * @property {number|Date} [createDate] The creation date of the document.
 * @property {number|Date} [updateDate] The last date the document was updated.
 */

/**
 * Storage for Uttori documents using JSON files stored on the local file system.
 * @property {object} config - The configuration object.
 * @property {string} config.contentDirectory - The directory to store documents.
 * @property {string} config.historyDirectory - The directory to store document histories.
 * @property {string} [config.extension='json'] - The file extension to use for file, name of the employee.
 * @property {number} [config.spacesDocument=undefined] - The spaces parameter for JSON stringifying documents.
 * @property {number} [config.spacesHistory=undefined] - The spaces parameter for JSON stringifying history.
 * @property {object} documents - The collection of documents where the slug is the key and the value is the document.
 * @example <caption>Init StorageProvider</caption>
 * const storageProvider = new StorageProvider({ contentDirectory: 'content', historyDirectory: 'history', spacesDocument: 2 });
 * @class
 */
class StorageProvider {
/**
 * Creates an instance of StorageProvider.
 * @param {object} config - A configuration object.
 * @param {string} config.contentDirectory - The directory to store documents.
 * @param {string} config.historyDirectory - The directory to store document histories.
 * @param {string} [config.extension] - The file extension to use for file, name of the employee.
 * @param {boolean} [config.updateTimestamps] - Should update times be marked at the time of edit.
 * @param {boolean} [config.useHistory] - Should history entries be created.
 * @param {boolean} [config.useCache] - Should we cache files in memory?
 * @param {number} [config.spacesDocument] - The spaces parameter for JSON stringifying documents.
 * @param {number} [config.spacesHistory] - The spaces parameter for JSON stringifying history.
 * @class
 */
  constructor(config) {
    debug('constructor', config);
    if (!config) {
      debug('No config provided.');
      throw new Error('No config provided.');
    }
    if (!config.contentDirectory) {
      debug('No content directory provided.');
      throw new Error('No content directory provided.');
    }
    if (!config.historyDirectory) {
      debug('No history directory provided.');
      throw new Error('No history directory provided.');
    }

    this.config = {
      extension: 'json',
      updateTimestamps: true,
      useHistory: true,
      useCache: true,
      spacesDocument: undefined,
      spacesHistory: undefined,
      ...config,
    };

    this.refresh = true;
    this.documents = {};

    // Ensure the directories exist.
    StorageProvider.ensureDirectory(this.config.contentDirectory);
    StorageProvider.ensureDirectory(this.config.historyDirectory);

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
   * @returns {Promise<object>} All documents.
   * @example
   * storageProvider.all();
   * ➜ { first-document: { slug: 'first-document', ... }, ...}
   */
  async all() {
    debug('all');
    if (this.config.useCache && this.refresh === false) {
      return this.documents;
    }

    const documents = {};
    try {
      const fileNames = await fs.readdir(this.config.contentDirectory);
      const validFiles = fileNames.filter((name) => (name.length >= 6) && name.endsWith(this.config.extension));
      for (const name of validFiles) {
        const file = path.join(this.config.contentDirectory, `${path.parse(name).name}.${this.config.extension}`);
        debug('all: Reading', file);
        // eslint-disable-next-line no-await-in-loop
        const content = await fs.readFile(file, 'utf8');
        const data = JSON.parse(content);
        documents[data.slug] = data;
      }
      debug('all: found', Object.values(documents).length);
      if (this.config.useCache) {
        this.documents = documents;
        this.refresh = false;
      }
    } /* c8 ignore next 2 */ catch (error) {
      debug('all: Error:', error);
    }
    return documents;
  }

  /**
   * Returns all documents matching a given query.
   * @async
   * @param {string} query - The conditions on which documents should be returned.
   * @returns {Promise<UttoriDocument[]|number>} Promise object represents all matching documents.
   */
  async getQuery(query) {
    debug('getQuery:', query);
    const all = await this.all();
    return processQuery(query, Object.values(all));
  }

  /**
   * Returns a document for a given slug.
   * @async
   * @param {string} slug - The slug of the document to be returned.
   * @returns {Promise<UttoriDocument|undefined>} Promise object represents the returned UttoriDocument.
   */
  async get(slug) {
    debug('get: slug:', slug);
    if (!slug) {
      debug('get: Cannot get document without slug.');
      return undefined;
    }
    slug = sanitize(`${slug}`);

    // Check the cache, fall back to reading the file.
    if (this.config.useCache && this.documents[slug]) {
      return { ...this.documents[slug] };
    }

    // Either not in cache or not using cache, read a document from a file.
    const file = path.join(this.config.contentDirectory, `${slug}.${this.config.extension}`);
    debug('get: file', file);
    try {
      const content = await fs.readFile(file, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      debug(`get: Error reading "${file}":`, error);
      return undefined;
    }
  }

  /**
   * Saves a document to the file system.
   * @async
   * @param {UttoriDocument} document - The document to be added to the collection.
   */
  async add(document) {
    if (!document || !document.slug) {
      debug('add: Cannot add, missing slug.');
      return;
    }

    const file = path.join(this.config.contentDirectory, `${document.slug}.${this.config.extension}`);
    try {
      await fs.access(file, fs.constants.R_OK | fs.constants.W_OK);
      // The check succeeded
      debug('add: Cannot add, existing document!');
    } catch (_error) {
      // The check failed
      debug('add: new document', document);
      document.createDate = Date.now();
      document.updateDate = document.createDate;
      if (this.config.useHistory) {
        await this.updateHistory(document.slug, JSON.stringify(document, undefined, this.config.spacesHistory));
      }
      if (this.config.useCache) {
        this.documents[document.slug] = document;
      }
      try {
        debug('add: Creating content file:', file);
        await fs.writeFile(file, JSON.stringify(document, undefined, this.config.spacesDocument), 'utf8');
      } /* c8 ignore next 2 */ catch (error) {
        debug('add: Error creating content file:', error);
      }
    }
  }

  /**
   * Updates a document and saves to the file system.
   * @async
   * @private
   * @param {UttoriDocument} document - The document to be updated in the collection.
   * @param {string} originalSlug - The original slug identifying the document, or the slug if it has not changed.
   */
  async updateValid(document, originalSlug) {
    debug('updateValid');
    if (this.config.updateTimestamps) {
      document.updateDate = Date.now();
    }
    if (this.config.useHistory) {
      await this.updateHistory(document.slug, JSON.stringify(document, undefined, this.config.spacesHistory), originalSlug);
    }
    if (this.config.useCache) {
      this.documents[document.slug] = document;
    }

    try {
      const file = path.join(this.config.contentDirectory, `${document.slug}.${this.config.extension}`);
      debug('updateValid: Updating content file:', file);
      await fs.writeFile(file, JSON.stringify(document, undefined, this.config.spacesDocument), 'utf8');
    } /* c8 ignore next 2 */ catch (error) {
      debug('updateValid: Error updating content file:', error);
    }
  }

  /**
   * Updates a document and figures out how to save to the file system.
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
      if (this.config.useCache) {
        delete this.documents[originalSlug];
      }

      try {
        const file = path.join(this.config.contentDirectory, `${originalSlug}.${this.config.extension}`);
        debug('update: Deleting old file:', file);
        await fs.unlink(file);
      } /* c8 ignore next 2 */ catch (error) {
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
   * @async
   * @param {string} slug - The slug identifying the document.
   */
  async delete(slug) {
    debug('delete:', slug);
    const existing = await this.get(slug);
    if (existing) {
      debug('Document found, deleting document:', slug);
      if (this.config.useHistory) {
        await this.updateHistory(slug, JSON.stringify(existing, undefined, this.config.spacesHistory));
      }
      if (this.config.useCache) {
        delete this.documents[slug];
      }

      try {
        const file = path.join(this.config.contentDirectory, `${slug}.${this.config.extension}`);
        debug('delete: Deleting content file:', file);
        await fs.unlink(file);
      } /* c8 ignore next 2 */ catch (error) {
        debug('delete: Error deleteing content file:', error);
      }
    } else {
      debug('Document not found:', slug);
    }
  }

  /**
   * Returns the history of edits for a given slug.
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
    const directory = path.join(this.config.historyDirectory, sanitize(`${slug}`));
    debug('getHistory: directory', directory);
    try {
      await fs.access(directory, fs.constants.R_OK | fs.constants.W_OK);
      // The check succeeded
      history = await fs.readdir(directory);
      // Return the filename without extension, just the timestamp.
      history = history.map((file) => path.basename(file, `.${this.config.extension}`));
    } catch (error) {
      debug(`getHistory: cannot ready "${directory}" directory`);
    }
    debug('getHistory: history', history);
    return history;
  }

  /**
   * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
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
      const file = path.join(this.config.historyDirectory, sanitize(`${slug}`), sanitize(`${revision}.${this.config.extension}`));
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
   * @async
   * @param {string} slug - The slug of the document to update history for.
   * @param {string} content - The revision of the document to be saved.
   * @param {string} [originalSlug] - The original slug identifying the document, or the slug if it has not changed.
   */
  async updateHistory(slug, content, originalSlug) {
    debug('updateHistory:', slug, content, originalSlug);
    const original_directory = path.join(this.config.historyDirectory, sanitize(`${originalSlug}`));
    const new_directory = path.join(this.config.historyDirectory, sanitize(`${slug}`));

    // Rename old history directory if one existed
    if (slug && originalSlug && originalSlug !== slug) {
      debug(`updateHistory: Updating history directory from "${originalSlug}" to "${slug}"`);
      try {
        await fs.access(original_directory, fs.constants.R_OK | fs.constants.W_OK);
        // The check succeeded
        debug(`updateHistory: Renaming history directory from "${original_directory}" to "${new_directory}"`);
        try {
          await fs.rename(original_directory, new_directory);
        } /* c8 ignore next 2 */ catch (error) {
          debug(`updateHistory: Error renaming history directory from "${original_directory}" to "${new_directory}"`, error);
        }
      } /* c8 ignore next 3 */ catch (error) {
        // The check failed
        debug(`updateHistory: Old directory "${original_directory}" does not exist, nothing to move to "${new_directory}"`, error);
      }
    }

    try {
      await fs.access(new_directory, fs.constants.R_OK | fs.constants.W_OK);
      // The check succeeded
      debug(`updateHistory: New history directory "${new_directory}" exists`);
    } catch (_error) {
      // The check failed
      try {
        await fs.mkdir(new_directory, { recursive: true });
      } /* c8 ignore next 2 */ catch (error) {
        debug('updateHistory: Error creating document history directory:', new_directory, error);
      }
    }

    /* c8 ignore next */
    try {
      let file = path.join(new_directory, `${Date.now()}.${this.config.extension}`);

      // We need to handle the edge case where the file already exists.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await fs.access(file);
          // File exists, update timestamp and path.
          file = path.join(new_directory, `${Date.now()}.${this.config.extension}`);
        } catch {
          // File does not exist, write and break.
          debug('updateHistory: Creating history file:', file);
          // eslint-disable-next-line no-await-in-loop
          await fs.writeFile(file, content, 'utf8');
          break;
        }
      }
    } /* c8 ignore next 2 */ catch (error) {
      debug('updateHistory: Error creating history file:', error);
    }
  }

  /**
   * Ensure a directory exists, and if not create it.
   * @param {string} directory The directory to ensure exists.
   */
  static async ensureDirectory(directory) {
    try {
      await fs.access(directory, fs.constants.R_OK | fs.constants.W_OK);
      // The check succeeded
    } catch (_error) {
      try {
        await fs.mkdir(directory, { recursive: true });
      } /* c8 ignore next 2 */ catch (error) {
        debug(`StorageProvider.ensureDirectory: Error creating directory "${directory}":`, error);
      }
    }
  }
}

export default StorageProvider;
