const fs = require('fs-extra');
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


test.beforeEach(async () => {
  await fs.remove('test/site');
  await fs.ensureDir('test/site/content/history', { recursive: true });
  await fs.ensureDir('test/site/data', { recursive: true });
  await fs.writeFile('test/site/content/example-title.json', JSON.stringify(example));
  await fs.writeFile('test/site/data/visits.json', '{"example-title":2,"demo-title":0,"fake-title":1}');
});

test.afterEach.always(async () => {
  await fs.remove('test/site');
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

test('get(slug): returns undefined when there is no slug', (t) => {
  const s = new StorageProvider(config);
  const results = s.get();
  t.is(results, undefined);
});

test('get(slug): returns undefined when no document is found', (t) => {
  const s = new StorageProvider(config);
  const document = s.get('missing-file');
  t.is(document, undefined);
});

test('getHistory(slug): returns undefined when missing a slug', async (t) => {
  const s = new StorageProvider(config);
  t.is(s.getHistory(''), undefined);
});

test('getHistory(slug): returns an array of the history revisions', async (t) => {
  await fs.remove('test/site');

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
  t.is(s.all().length, 1);
  t.is(s.all()[0].title, 'second file');
  t.is(s.getHistory(document.slug).length, 1);

  document.title = 'second file-v2';
  document.content = 'second file-v2';
  s.update(document, 'second-file');
  t.is(s.all().length, 1);
  t.is(s.all()[0].title, 'second file-v2');
  t.is(s.getHistory(document.slug).length, 2);

  document.title = 'second file-v3';
  document.content = 'second file-v3';
  s.update(document, 'second-file');
  t.is(s.all().length, 1);
  t.is(s.all()[0].title, 'second file-v3');
  t.is(s.getHistory(document.slug).length, 3);

  document.slug = 'second-file-new-directory';
  document.title = 'second file-v4';
  document.content = 'second file-v4';
  s.update(document, 'second-file');
  t.is(s.all().length, 1);
  t.is(s.all()[0].title, 'second file-v4');
  t.is(s.getHistory(document.slug).length, 4);
});

test('getRevision(slug, revision): returns undefined when missing a slug', async (t) => {
  const s = new StorageProvider(config);
  t.is(s.getRevision(''), undefined);
});

test('getRevision(slug, revision): returns undefined when missing a revision', async (t) => {
  const s = new StorageProvider(config);
  t.is(s.getRevision('slug', ''), undefined);
});

test('getRevision(slug, revision): returns undefined when no revision is found', async (t) => {
  const s = new StorageProvider(config);
  t.is(s.getRevision('slug', 'missing'), undefined);
});

test('getRevision(slug, revision): returns a specific revision of an article', async (t) => {
  await fs.remove('test/site');

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
  t.is(s.all().length, 1);
  t.is(s.all()[0].title, 'second file');
  t.is(s.getHistory(document.slug).length, 1);

  document.title = 'second file-v2';
  document.content = 'second file-v2';
  s.update(document, 'second-file');
  t.is(s.all().length, 1);
  t.is(s.all()[0].title, 'second file-v2');
  t.is(s.getHistory(document.slug).length, 2);

  document.title = 'second file-v3';
  document.content = 'second file-v3';
  s.update(document, 'second-file');
  t.is(s.all().length, 1);
  t.is(s.all()[0].title, 'second file-v3');
  t.is(s.getHistory(document.slug).length, 3);

  document.slug = 'second-file-new-directory';
  document.title = 'second file-v4';
  document.content = 'second file-v4';
  s.update(document, 'second-file');
  t.is(s.all().length, 1);
  t.is(s.all()[0].title, 'second file-v4');
  t.is(s.getHistory(document.slug).length, 4);

  const history = s.getHistory(document.slug);
  t.is(history.length, 4);

  t.is(s.getRevision(document.slug, history[0]).title, 'second file');
  t.is(s.getRevision(document.slug, history[1]).title, 'second file-v2');
  t.is(s.getRevision(document.slug, history[2]).title, 'second file-v3');
  t.is(s.getRevision(document.slug, history[3]).title, 'second file-v4');
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
  t.is(s.getHistory(document.slug).length, 1);

  document.title = 'second file-v2';
  document.content = 'second file-v2';
  s.update(document, 'second-file');
  t.is(s.all().length, 2);
  t.is(s.all()[1].title, document.title);
  t.is(s.getHistory(document.slug).length, 2);

  document.title = 'second file-v3';
  document.content = 'second file-v3';
  s.update(document, 'second-file');
  t.is(s.all().length, 2);
  t.is(s.all()[1].title, document.title);
  t.is(s.getHistory(document.slug).length, 3);

  document.slug = 'second-file-new-directory';
  document.title = 'second file-v4';
  document.content = 'second file-v4';
  s.update(document, 'second-file');
  t.is(s.all().length, 2);
  t.is(s.all()[1].title, document.title);

  t.is(fs.existsSync(`${config.history_dir}/second-file-new-directory`), true);
  t.is(fs.existsSync(`${config.history_dir}/second-file`), false);
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

test('update(document, originalSlug): does not update when file exists', (t) => {
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
  s.update(document, 'example-title');
  t.is(s.all().length, 2);
  t.is(s.all()[1].title, 'second file');
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

test('readFile(folder, name): returns a document found by name', (t) => {
  const s = new StorageProvider(config);
  const result = s.readFile(config.content_dir, example.slug);
  t.is(JSON.stringify(result), JSON.stringify(example));
});

test('readFile(folder, name): returns undefined when no name is provided', (t) => {
  const s = new StorageProvider(config);
  const result = s.readFile(config.content_dir, '');
  t.is(result, undefined);
});

test('readFolder(folder): returns undefined when no folder is provided', (t) => {
  const s = new StorageProvider(config);
  const result = s.readFolder('');
  t.deepEqual(result, []);
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
