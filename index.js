const debug = require('debug')('Uttori.StorageProvider.JSON');
const fs = require('fs');
const R = require('ramda');
const path = require('path');
const Document = require('uttori-document');

class StorageProvider {
  constructor(config = {}) {
    this.config = {
      content_dir: '',
      history_dir: '',
      data_dir: '',
      ...config,
    };
    this.documents = [];

    try {
      fs.mkdirSync(this.config.content_dir);
      fs.mkdirSync(this.config.history_dir);
      fs.mkdirSync(this.config.data_dir);
    } catch (e) {}

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
      document = new Document();
      document.slug = slug;
      document.title = slug.replace(/-/g, ' ');
    }
    return document;
  }

  add(document) {
    const existing = this.get(document.slug);
    if (!existing) {
      document.createDate = Date.now();
      document.updateDate = document.createDate;
      document.tags = document.tags || [];
      this.storeDocument(document);
      this.refresh();
    }
  }

  update(document) {
    const existing = this.get(document.slug);
    if (existing) {
      document.updateDate = Date.now();
      document.tags = document.tags || [];
      this.storeDocument(document);
      this.refresh();
    } else {
      this.add(document);
    }
  }

  delete(slug) {
    const existing = this.get(slug);
    if (existing) {
      this.deleteDocument(existing);
      this.refresh();
    }
  }

  storeObject(fileName, object) {
    const filePath = path.join(this.config.data_dir, fileName);
    try {
      fs.writeFile(`${filePath}.json`, JSON.stringify(object), 'utf8', (e) => { if (e) throw e; });
    } catch (e) {
      debug('Unable to store object:', fileName, object, e);
    }
  }

  readObject(fileName) {
    const filePath = path.join(this.config.data_dir, `${fileName}.json`);
    const fileContent = this.readFile(filePath);
    if (!fileContent) {
      return null;
    }
    return JSON.parse(fileContent);
  }

  // Format Specific
  readDocument(fileName) {
    if (!fileName) {
      return undefined;
    }

    const filePath = path.join(this.config.content_dir, fileName);

    // try to read the file on disk
    const fileContent = this.readFile(filePath);
    if (!fileContent) {
      return undefined;
    }

    let document;
    try {
      document = JSON.parse(fileContent);
    } catch (e) {
      debug('Error parsing JSON:', fileContent, e);
    }
    if (!document) {
      return undefined;
    }

    return document;
  }

  storeDocument(document) {
    const fileContent = JSON.stringify(document);
    try {
      const filePath = path.join(this.config.content_dir, `${document.slug}.json`);
      const historyPath = path.join(this.config.history_dir, `${document.slug}.${Date.now()}.json`);
      fs.writeFileSync(filePath, fileContent, 'utf8');
      fs.writeFileSync(historyPath, fileContent, 'utf8');
    } catch (e) {
      debug('Error storing document:', document, e);
    }
  }

  deleteDocument(document) {
    const filePath = path.join(this.config.content_dir, `${document.slug}.json`);
    try {
      const historyPath = path.join(this.config.history_dir, `${document.slug}.${Date.now()}.json`);
      fs.writeFileSync(historyPath, JSON.stringify(document), 'utf8');
      fs.unlinkSync(filePath);
    } catch (e) {
      debug('Error deleting document:', document, e);
    }
  }

  refresh() {
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
      debug('Error refreshing documents:', e);
    }

    this.documents = R.reject(R.isNil, documents);
  }

  readFile(filePath) {
    let fileContent = null;
    try {
      fileContent = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      debug('Error reading file:', filePath, e);
    }

    return fileContent;
  }
}

module.exports = StorageProvider;
