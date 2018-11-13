const debug = require('debug')('Uttori.StorageProvider.JSON');
const fs = require('fs');
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

    this.config = { ...config };

    this.documents = [];

    /* istanbul ignore next */
    try {
      fs.mkdirSync(this.config.content_dir);
      fs.mkdirSync(this.config.history_dir);
      fs.mkdirSync(this.config.data_dir);
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
      debug(`Document not found ${slug}, creating.`);
      document = new Document();
      document.slug = slug;
      document.title = slug;
    }
    return document;
  }

  add(document) {
    debug('Add document:', document);
    const existing = this.get(document.slug);
    if (!existing.createDate) {
      debug('Adding document.', document);
      document.createDate = Date.now();
      document.updateDate = document.createDate;
      document.tags = R.isEmpty(document.tags) ? [] : document.tags;
      document.customData = R.isEmpty(document.customData) ? {} : document.customData;
      this.storeDocument(document);
      this.refresh();
    } else {
      debug('Cannot add, existing document.');
    }
  }

  update(document) {
    debug('Update document:', document.slug);
    const existing = this.get(document.slug);
    if (existing.createDate) {
      debug('Updating document.', document);
      document.updateDate = Date.now();
      document.tags = R.isEmpty(document.tags) ? [] : document.tags;
      document.customData = R.isEmpty(document.customData) ? {} : document.customData;
      this.storeDocument(document);
      this.refresh();
    } else {
      debug('No document found to update, adding document.', document);
      this.add(document);
    }
  }

  delete(slug) {
    debug('Delete document:', slug);
    const existing = this.get(slug);
    if (existing.createDate) {
      debug('Document found, deleting document:', slug);
      this.deleteDocument(existing);
      this.refresh();
    }
  }

  storeObject(fileName, object) {
    debug('Storing Object:', fileName);
    const filePath = path.join(this.config.data_dir, fileName);
    try {
      fs.writeFileSync(`${filePath}.json`, JSON.stringify(object), 'utf8');
    } catch (e) {
      /* istanbul ignore next */
      debug('Unable to store object:', fileName, object, e);
    }
  }

  readObject(fileName) {
    debug('Reading Object:', fileName);
    const filePath = path.join(this.config.data_dir, `${fileName}.json`);
    const fileContent = this.readFile(filePath);
    if (!fileContent) {
      debug('Object has no content.');
      return null;
    }
    return JSON.parse(fileContent);
  }

  // Format Specific
  readDocument(fileName) {
    debug('Reading document.');
    if (!fileName) {
      debug('Missing required fileName.');
      return undefined;
    }

    const filePath = path.join(this.config.content_dir, fileName);

    // try to read the file on disk
    const fileContent = this.readFile(filePath);
    if (!fileContent) {
      debug('Document has no content.');
      return undefined;
    }

    let document;
    try {
      document = JSON.parse(fileContent);
    } catch (e) {
      /* istanbul ignore next */
      debug('Error parsing JSON:', fileContent, e);
    }

    return document;
  }

  storeDocument(document) {
    debug('Storing document:', document);
    const fileContent = JSON.stringify(document);
    try {
      const filePath = path.join(this.config.content_dir, `${document.slug}.json`);
      const historyPath = path.join(this.config.history_dir, `${document.slug}.${Date.now()}.json`);
      fs.writeFileSync(filePath, fileContent, 'utf8');
      fs.writeFileSync(historyPath, fileContent, 'utf8');
    } catch (e) {
      /* istanbul ignore next */
      debug('Error storing document:', document, e);
    }
  }

  deleteDocument(document) {
    debug('Deleting document:', document);
    const filePath = path.join(this.config.content_dir, `${document.slug}.json`);
    try {
      const historyPath = path.join(this.config.history_dir, `${document.slug}.${Date.now()}.json`);
      fs.writeFileSync(historyPath, JSON.stringify(document), 'utf8');
      fs.unlinkSync(filePath);
    } catch (e) {
      /* istanbul ignore next */
      debug('Error deleting document:', document, e);
    }
  }

  refresh() {
    debug('Refreshing documents.');
    let documents = [];
    try {
      const fileNames = fs.readdirSync(this.config.content_dir);
      const validFiles = R.filter(
        fileName => (fileName.length >= 6) && fileName.endsWith('.json'),
        fileNames,
      );
      documents = R.map(
        fileName => this.readDocument(fileName),
        validFiles,
      );
    } catch (e) {
      /* istanbul ignore next */
      debug('Error refreshing documents:', e);
    }

    this.documents = R.reject(R.isNil, documents);
  }

  readFile(filePath) {
    debug('Reading file:', filePath);
    let fileContent = null;
    try {
      fileContent = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      /* istanbul ignore next */
      debug('Error reading file:', filePath, e);
    }
    return fileContent;
  }
}

module.exports = StorageProvider;
