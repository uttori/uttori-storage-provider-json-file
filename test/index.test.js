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

const deleteFolderRecursive = (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

test.beforeEach(() => {
  try { fs.mkdirSync('test/site/content/history', { recursive: true }); } catch (e) {}
  try { fs.mkdirSync('test/site/data', { recursive: true }); } catch (e) {}
  try { fs.writeFileSync('test/site/content/example-title.json', JSON.stringify(example)); } catch (e) {}
  try { fs.writeFileSync('test/site/data/visits.json', '{"example-title":2,"demo-title":0,"fake-title":1}'); } catch (e) {}
});

test.afterEach(() => {
  deleteFolderRecursive('test/site');
});

test('constructor(config): does not error', (t) => {
  t.notThrows(() => new StorageProvider(config));
});

test('constructor(config): throws an error when missing config', (t) => {
  t.throws(() => new StorageProvider());
});

test('constructor(config): throws an error when missing config content directory', (t) => {
  t.throws(() => new StorageProvider({ history_dir: '_', data_dir: '_' }));
});

test('constructor(config): throws an error when missing config history directory', (t) => {
  t.throws(() => new StorageProvider({ content_dir: '_', data_dir: '_' }));
});

test('constructor(config): throws an error when missing config data directory', (t) => {
  t.throws(() => new StorageProvider({ content_dir: '_', history_dir: '_' }));
});

test('all(): returns all the documents', (t) => {
  const s = new StorageProvider(config);
  const results = s.all();
  t.deepEqual(results, [example]);
});

test('get(slug): returns the matching document', (t) => {
  const s = new StorageProvider(config);
  const results = s.get(example.slug);
  t.deepEqual(results, example);
});

test('get(slug): returns null when there is no slug', (t) => {
  const s = new StorageProvider(config);
  const results = s.get();
  t.is(results, null);
});

test('get(slug): returns a new document when no document is found', (t) => {
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

test('add(slug): creates a new document', (t) => {
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

test('add(slug): creates a new document with missing fields', (t) => {
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

test('add(slug): does not create a document with the same slug', (t) => {
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

test('update(document, originalSlug): updates the file on disk', (t) => {
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
  s.update(document, 'second-file');
  t.is(s.all().length, 2);
  t.is(s.all()[1].title, document.title);
});

test('update(document, originalSlug): renames the history directory if it exists', (t) => {
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
  document.content = 'second file-v2';
  s.update(document, 'second-file');
  t.is(s.all().length, 2);
  t.is(s.all()[1].title, document.title);

  document.title = 'second file-v3';
  document.content = 'second file-v3';
  s.update(document, 'second-file');
  t.is(s.all().length, 2);
  t.is(s.all()[1].title, document.title);

  document.slug = 'second-file-new-directory';
  s.update(document, 'second-file');
  t.is(s.all().length, 2);
  t.is(s.all()[1].title, document.title);
});

test('update(document, originalSlug): updates the file on disk with missing fields', (t) => {
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
  s.update(document, 'second-file');
  t.is(s.all().length, 2);
  t.is(s.all()[1].title, document.title);
});

test('update(document, originalSlug): adds a document if the one to update is no found', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = 1;
  document.customData = {};
  document.html = '';
  document.slug = 'third-file';
  document.tags = [];
  document.title = 'third file';
  document.updateDate = 1;
  s.update(document, '');
  t.is(s.all().length, 2);
});

test('delete(document): removes the file from disk', (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = 1;
  document.customData = {};
  document.html = '';
  document.slug = 'second-file';
  document.tags = [];
  document.title = 'second file';
  document.updateDate = 1;
  s.add(document);
  t.is(s.all().length, 2);
  s.delete(document.slug);
  t.is(s.all().length, 1);
});

test('delete(document): does nothing when no file is found', (t) => {
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

test('storeObject(fileName, object): writes the file to disk as object', (t) => {
  const s = new StorageProvider(config);
  const data = { test: true };
  s.storeObject('test', data);
  t.deepEqual(s.readObject('test'), data);
});

test('storeObject(fileName, object): writes the file to disk as string', (t) => {
  const s = new StorageProvider(config);
  const data = '{ test: true }';
  s.storeObject('test', data);
  t.deepEqual(s.readObject('test'), data);
});

test('readObject(fileName): returns an object found by file name', (t) => {
  const s = new StorageProvider(config);
  const data = { test: true };
  s.storeObject('test', data);
  t.deepEqual(s.readObject('test'), data);
});

test('readObject(fileName): returns undefined when no content is returned', (t) => {
  const s = new StorageProvider(config);
  t.is(s.readObject('missing'), undefined);
});

test('readFile(folder, name): returns a document found by slug', (t) => {
  const s = new StorageProvider(config);
  const result = s.readFile(config.content_dir, example.slug);
  t.is(JSON.stringify(result), JSON.stringify(example));
});

test('readFile(folder, name): returns undefined when no slug is provided', (t) => {
  const s = new StorageProvider(config);
  const result = s.readFile(config.content_dir, '');
  t.is(result, undefined);
});

test('writeFile(folder, name, content): writes the file to disk', (t) => {
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
  s.writeFile(config.content_dir, document.slug, JSON.stringify(document));
  const result = s.readFile(config.content_dir, document.slug);
  t.is(JSON.stringify(result), JSON.stringify(document));
});

test('deleteFile(folder, name): removes the file from disk', (t) => {
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
  s.writeFile(config.content_dir, document.slug, JSON.stringify(document));
  let result = s.readFile(config.content_dir, document.slug);
  t.is(JSON.stringify(result), JSON.stringify(document));
  s.deleteFile(config.content_dir, document.slug);
  result = s.readFile(config.content_dir, document.slug);
  t.is(result, undefined);
});

// refresh

test('readFile(filePath): returns undefined when unable to read file', (t) => {
  // const stub = sinon.stub(fs, 'readFileSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider(config);
  const result = s.readFile(config.content_dir, 'missing');
  t.is(result, undefined);
});
