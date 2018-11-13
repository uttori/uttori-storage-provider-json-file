const fs = require('fs');
const test = require('ava');
const Document = require('uttori-document');
const StorageProvider = require('../index');

const config = {
  content_dir: 'test/site/content',
  history_dir: 'test/site/content/history',
  data_dir: 'test/site/data',
};

const example = {
  title: 'Example Title',
  slug: 'example-title',
  content: '## Example Title',
  html: '',
  updateDate: 1459310452001,
  createDate: 1459310452001,
  tags: ['Example Tag'],
  customData: {
    keyA: 'value-a',
    keyB: 'value-b',
    keyC: 'value-c',
  },
};

test.beforeEach(() => {
  fs.writeFileSync('test/site/content/example-title.json', JSON.stringify(example));
  fs.writeFileSync('test/site/data/visits.json', '{"example-title":2,"demo-title":0,"fake-title":1}');
});

test.afterEach(() => {
  if (fs.existsSync(config.content_dir)) {
    fs.readdirSync(config.content_dir).forEach((file) => {
      try { fs.unlinkSync(`${config.content_dir}/${file}`); } catch (e) {}
    });
  }
  if (fs.existsSync(config.history_dir)) {
    fs.readdirSync(config.history_dir).forEach((file) => {
      try { fs.unlinkSync(`${config.history_dir}/${file}`); } catch (e) {}
    });
  }
  if (fs.existsSync(config.data_dir)) {
    fs.readdirSync(config.data_dir).forEach((file) => {
      try { fs.unlinkSync(`${config.data_dir}/${file}`); } catch (e) {}
    });
  }
});

test('Storage Provider: constructor(config): does not error', (t) => {
  t.notThrows(() => new StorageProvider(config));
});

test('Storage Provider: constructor(config): throws an error when missing config', (t) => {
  t.throws(() => new StorageProvider());
});

test('Storage Provider: constructor(config): throws an error when missing config content directory', (t) => {
  t.throws(() => new StorageProvider({ history_dir: '_', data_dir: '_' }));
});

test('Storage Provider: constructor(config): throws an error when missing config history directory', (t) => {
  t.throws(() => new StorageProvider({ content_dir: '_', data_dir: '_' }));
});

test('Storage Provider: constructor(config): throws an error when missing config data directory', (t) => {
  t.throws(() => new StorageProvider({ content_dir: '_', history_dir: '_' }));
});

test('Storage Provider: all(): returns all the documents', (t) => {
  const s = new StorageProvider(config);
  const results = s.all();
  t.deepEqual(results, [example]);
});

test('Storage Provider: get(slug): returns the matching document', (t) => {
  const s = new StorageProvider(config);
  const results = s.get(example.slug);
  t.deepEqual(results, example);
});

test('Storage Provider: get(slug): returns null when there is no slug', (t) => {
  const s = new StorageProvider(config);
  const results = s.get();
  t.is(results, null);
});

test('Storage Provider: get(slug): returns a new document when no document is found', (t) => {
  const s = new StorageProvider(config);
  const results = s.get('missing-file');
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.customData = {};
  document.html = '';
  document.slug = 'missing-file';
  document.tags = [];
  document.title = 'missing-file';
  document.updateDate = null;
  t.deepEqual(results, document);
});

test('Storage Provider: add(slug): creates a new document', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.customData = {};
  document.html = '';
  document.slug = 'second-file';
  document.tags = [];
  document.title = 'second file';
  document.updateDate = null;
  s.add(document);
  const results = s.all();
  t.deepEqual(results[0], example);
  t.is(results[1].slug, document.slug);
});

test('Storage Provider: add(slug): creates a new document with missing fields', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.html = '';
  document.slug = 'second-file';
  document.title = 'second file';
  document.updateDate = null;
  s.add(document);
  const results = s.all();
  t.deepEqual(results[0], example);
  t.is(results[1].slug, document.slug);
});


test('Storage Provider: add(slug): does not create a document with the same slug', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.customData = {};
  document.html = '';
  document.slug = 'second-file';
  document.tags = [];
  document.title = 'second file';
  document.updateDate = null;
  s.add(document);
  const results = s.all();
  t.deepEqual(results[0], example);
  t.is(results[1].slug, document.slug);
  t.is(results.length, 2);
  s.add(document);
  t.is(results.length, 2);
});

test('Storage Provider: update(document): updates the file on disk', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.customData = { test: true };
  document.html = '';
  document.slug = 'second-file';
  document.tags = ['test'];
  document.title = 'second file';
  document.updateDate = null;
  s.add(document);
  t.is(s.all().length, 2);
  document.title = 'second file-v2';
  s.update(document);
  t.is(s.all().length, 2);
  t.is(s.all()[1].title, document.title);
});

test('Storage Provider: update(document): updates the file on disk with missing fields', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.html = '';
  document.slug = 'second-file';
  document.title = 'second file';
  document.updateDate = null;
  s.add(document);
  t.is(s.all().length, 2);
  document.title = 'second file-v2';
  s.update(document);
  t.is(s.all().length, 2);
  t.is(s.all()[1].title, document.title);
});

test('Storage Provider: update(document): adds a document if the one to update is no found', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.customData = {};
  document.html = '';
  document.slug = 'third-file';
  document.tags = [];
  document.title = 'third file';
  document.updateDate = null;
  s.update(document);
  t.is(s.all().length, 2);
});

test('Storage Provider: delete(document): removes the file from disk', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.customData = {};
  document.html = '';
  document.slug = 'second-file';
  document.tags = [];
  document.title = 'second file';
  document.updateDate = null;
  s.add(document);
  t.is(s.all().length, 2);
  s.delete(document.slug);
  t.is(s.all().length, 1);
});

test('Storage Provider: delete(document): does nothing when no file is found', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.customData = {};
  document.html = '';
  document.slug = 'second-file';
  document.tags = [];
  document.title = 'second file';
  document.updateDate = null;
  s.add(document);
  t.is(s.all().length, 2);
  s.delete('slug');
  t.is(s.all().length, 2);
});

test('Storage Provider: storeObject(fileName, object): writes the file to disk', (t) => {
  const s = new StorageProvider(config);
  const data = { test: true };
  s.storeObject('test', data);
  t.deepEqual(s.readObject('test'), data);
});

test('Storage Provider: readObject(fileName): returns an object found by file name', (t) => {
  const s = new StorageProvider(config);
  const data = { test: true };
  s.storeObject('test', data);
  t.deepEqual(s.readObject('test'), data);
});

test('Storage Provider: readObject(fileName): returns null when no content is returned', (t) => {
  const s = new StorageProvider(config);
  t.is(s.readObject('missing'), null);
});

test('Storage Provider: readDocument(slug): returns a document found by slug', (t) => {
  const s = new StorageProvider(config);
  const result = s.readDocument(`${example.slug}.json`);
  t.is(JSON.stringify(result), JSON.stringify(example));
});

test('Storage Provider: readDocument(slug): returns undefined when no slug is provided', (t) => {
  const s = new StorageProvider(config);
  const result = s.readDocument();
  t.is(result, undefined);
});

test('Storage Provider: storeDocument(document): writes the file to disk', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.title = 'Third Title';
  document.tags = ['Third Tag'];
  document.createDate = 1459310452001;
  document.updateDate = 1459310452001;
  document.content = '## Third Title';
  document.slug = 'Third-title';
  document.customData = {
    keyA: 'value-a',
    keyB: 'value-b',
    keyC: 'value-c',
  };
  s.storeDocument(document);
  const result = s.readDocument(`${document.slug}.json`);
  t.is(JSON.stringify(result), JSON.stringify(document));
});

test('Storage Provider: deleteDocument(document): removes the file from disk', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.title = 'Third Title';
  document.tags = ['Third Tag'];
  document.createDate = 1459310452001;
  document.updateDate = 1459310452001;
  document.content = '## Third Title';
  document.slug = 'Third-title';
  document.customData = {
    keyA: 'value-a',
    keyB: 'value-b',
    keyC: 'value-c',
  };
  s.storeDocument(document);
  let result = s.readDocument(`${document.slug}.json`);
  t.is(JSON.stringify(result), JSON.stringify(document));
  s.deleteDocument(document);
  result = s.readDocument(`${document.slug}.json`);
  t.is(result, undefined);
});

// refresh

test('Storage Provider: readFile(filePath): returns null when unable to read file', (t) => {
  // const stub = sinon.stub(fs, 'readFileSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider(config);
  const result = s.readFile('missing.json');
  t.is(result, null);
});
