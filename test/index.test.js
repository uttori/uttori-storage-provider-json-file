const fs = require('fs-extra');
const test = require('ava');
const Document = require('uttori-document');
const StorageProvider = require('..');

const config = {
  content_dir: 'test/site/content',
  history_dir: 'test/site/content/history',
  data_dir: 'test/site/data',
  extension: 'json',
  spaces_article: null,
  spaces_data: null,
  spaces_history: null,
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

const empty = {
  title: 'empty',
  slug: 'empty',
  content: 'empty',
  html: '',
  updateDate: 1459310452002,
  createDate: 1459310452002,
  tags: ['Fake'],
  customData: {},
};

const fake = {
  title: 'Fake',
  slug: 'fake',
  content: '# Fake',
  html: '',
  updateDate: 1459310452002,
  createDate: 1459310452002,
  tags: ['Fake'],
  customData: {},
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

test('all(): returns all the documents', async (t) => {
  const s = new StorageProvider(config);
  const results = await s.all();
  t.deepEqual(results, [example]);
});

test('tags(): returns all unique tags from all the documents', async (t) => {
  const s = new StorageProvider(config);
  await s.add(fake);
  await s.add(empty);
  const results = await s.tags();
  t.deepEqual(results, [example.tags[0], fake.tags[0]]);
});

test('getTaggedDocuments(tag, fields): returns documents with the given tag', async (t) => {
  const s = new StorageProvider(config);
  await s.add(fake);
  await s.add(empty);
  t.deepEqual(await s.getTaggedDocuments('Example Tag'), [example]);
  t.deepEqual(await s.getTaggedDocuments('Fake'), [empty, fake]);
  t.deepEqual(await s.getTaggedDocuments('No Tag'), []);
});

test('getRecentDocuments(limit, fields): returns the requested number of the most recently updated documents', async (t) => {
  const s = new StorageProvider(config);
  await s.add(fake);
  await s.add(empty);

  t.deepEqual(await s.getRecentDocuments(1), [empty]);
  t.deepEqual(await s.getRecentDocuments(2), [empty, fake]);
  t.deepEqual(await s.getRecentDocuments(3), [empty, fake, example]);
});

test('getPopularDocuments(limit, fields): returns the requested number of popular documents', async (t) => {
  let output;
  const s = new StorageProvider(config);
  await s.add(fake);
  await s.add(empty);

  await s.storeObject('visits', { 'example-title': 0 });
  output = await s.getPopularDocuments(3);
  t.deepEqual(output, []);

  await s.incrementObject('visits', 'example-title');
  output = await s.getPopularDocuments(3);
  t.deepEqual(output, [example]);

  await s.incrementObject('visits', 'example-title');
  await s.incrementObject('visits', 'fake');
  output = await s.getPopularDocuments(3);
  t.deepEqual(output, [example, fake]);
});

// TODO: More documents
test('getRandomDocuments(limit, fields): returns the requested number of random documents', async (t) => {
  let output;
  const s = new StorageProvider(config);
  await s.add(fake);
  await s.add(empty);

  output = await s.getRandomDocuments(1);
  t.is(output.length, 1);
  output = await s.getRandomDocuments(2);
  t.is(output.length, 2);
  output = await s.getRandomDocuments(3);
  t.is(output.length, 3);
});

test('get(slug): returns the matching document', async (t) => {
  const s = new StorageProvider(config);
  const results = await s.get(example.slug);
  t.deepEqual(results, example);
});

test('get(slug): returns undefined when there is no slug', async (t) => {
  const s = new StorageProvider(config);
  const results = await s.get();
  t.is(results, undefined);
});

test('get(slug): returns undefined when no document is found', async (t) => {
  const s = new StorageProvider(config);
  const document = await s.get('missing-file');
  t.is(document, undefined);
});

test('getHistory(slug): returns undefined when missing a slug', async (t) => {
  const s = new StorageProvider(config);
  const history = await s.getHistory('');
  t.is(history, undefined);
});

test('getHistory(slug): returns an array of the history revisions', async (t) => {
  let all;
  let history;
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
  await s.add(document);
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, 'second file');
  history = await s.getHistory(document.slug);
  t.is(history.length, 1);

  document.title = 'second file-v2';
  document.content = 'second file-v2';
  await s.update(document, 'second-file');
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, 'second file-v2');
  history = await s.getHistory(document.slug);
  t.is(history.length, 2);

  document.title = 'second file-v3';
  document.content = 'second file-v3';
  await s.update(document, 'second-file');
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, 'second file-v3');
  history = await s.getHistory(document.slug);
  t.is(history.length, 3);

  document.slug = 'second-file-new-directory';
  document.title = 'second file-v4';
  document.content = 'second file-v4';
  await s.update(document, 'second-file');
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, 'second file-v4');
  history = await s.getHistory(document.slug);
  t.is(history.length, 4);
});

test('getRevision(slug, revision): returns undefined when missing a slug', async (t) => {
  const s = new StorageProvider(config);
  const revision = await s.getRevision('');
  t.is(revision, undefined);
});

test('getRevision(slug, revision): returns undefined when missing a revision', async (t) => {
  const s = new StorageProvider(config);
  const revision = await s.getRevision('slug', '');
  t.is(revision, undefined);
});

test('getRevision(slug, revision): returns undefined when no revision is found', async (t) => {
  const s = new StorageProvider(config);
  const revision = await s.getRevision('slug', 'missing');
  t.is(revision, undefined);
});

test('getRevision(slug, revision): returns a specific revision of an article', async (t) => {
  let all;
  let history;
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
  await s.add(document);
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, 'second file');
  history = await s.getHistory(document.slug);
  t.is(history.length, 1);

  document.title = 'second file-v2';
  document.content = 'second file-v2';
  await s.update(document, 'second-file');
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, 'second file-v2');
  history = await s.getHistory(document.slug);
  t.is(history.length, 2);

  document.title = 'second file-v3';
  document.content = 'second file-v3';
  await s.update(document, 'second-file');
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, 'second file-v3');
  history = await s.getHistory(document.slug);
  t.is(history.length, 3);

  document.slug = 'second-file-new-directory';
  document.title = 'second file-v4';
  document.content = 'second file-v4';
  await s.update(document, 'second-file');
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, 'second file-v4');
  history = await s.getHistory(document.slug);
  t.is(history.length, 4);

  history = await s.getHistory(document.slug);
  t.is(history.length, 4);

  let revision;
  revision = await s.getRevision(document.slug, history[0]);
  t.is(revision.title, 'second file');
  revision = await s.getRevision(document.slug, history[1]);
  t.is(revision.title, 'second file-v2');
  revision = await s.getRevision(document.slug, history[2]);
  t.is(revision.title, 'second file-v3');
  revision = await s.getRevision(document.slug, history[3]);
  t.is(revision.title, 'second file-v4');
});

test('add(document): creates a new document', async (t) => {
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
  await s.add(document);
  const all = await s.all();
  t.deepEqual(all[0], example);
  t.is(all[1].slug, document.slug);
});

test('add(document): creates a new document with missing fields', async (t) => {
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.html = '';
  document.slug = 'second-file';
  document.title = 'second file';
  document.updateDate = null;
  await s.add(document);
  const all = await s.all();
  t.deepEqual(all[0], example);
  t.is(all[1].slug, document.slug);
});

test('add(document): does not create a document with the same slug', async (t) => {
  let all;
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
  await s.add(document);
  all = await s.all();
  t.deepEqual(all[0], example);
  t.is(all[1].slug, document.slug);
  t.is(all.length, 2);
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
});

test('update(document, originalSlug): updates the file on disk', async (t) => {
  let all;
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
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  document.title = 'second file-v2';
  await s.update(document, 'second-file');
  all = await s.all();
  t.is(all.length, 2);
  t.is(all[1].title, document.title);
});

test('update(document, originalSlug): renames the history directory if it exists', async (t) => {
  let all;
  let history;
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
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  history = await s.getHistory(document.slug);
  t.is(history.length, 1);

  document.title = 'second file-v2';
  document.content = 'second file-v2';
  await s.update(document, 'second-file');
  all = await s.all();
  t.is(all.length, 2);
  t.is(all[1].title, document.title);
  history = await s.getHistory(document.slug);
  t.is(history.length, 2);

  document.title = 'second file-v3';
  document.content = 'second file-v3';
  await s.update(document, 'second-file');
  all = await s.all();
  t.is(all.length, 2);
  t.is(all[1].title, document.title);
  history = await s.getHistory(document.slug);
  t.is(history.length, 3);

  document.slug = 'second-file-new-directory';
  document.title = 'second file-v4';
  document.content = 'second file-v4';
  await s.update(document, 'second-file');
  all = await s.all();
  t.is(all.length, 2);
  t.is(all[1].title, document.title);
  history = await s.getHistory(document.slug);
  t.is(history.length, 4);

  t.is(fs.existsSync(`${config.history_dir}/second-file-new-directory`), true);
  t.is(fs.existsSync(`${config.history_dir}/second-file`), false);
});

test('update(document, originalSlug): updates the file on disk with missing fields', async (t) => {
  let all;
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.html = '';
  document.slug = 'second-file';
  document.title = 'second file';
  document.updateDate = null;
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  document.title = 'second file-v2';
  await s.update(document, 'second-file');
  all = await s.all();
  t.is(all.length, 2);
  t.is(all[1].title, document.title);
});

test('update(document, originalSlug): does not update when file exists', async (t) => {
  let all;
  const s = new StorageProvider(config);
  const document = new Document();
  document.content = '';
  document.createDate = null;
  document.html = '';
  document.slug = 'second-file';
  document.title = 'second file';
  document.updateDate = null;
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  document.title = 'second file-v2';
  await s.update(document, 'example-title');
  all = await s.all();
  t.is(all.length, 2);
  t.is(all[1].title, 'second file');
});

test('update(document, originalSlug): adds a document if the one to update is no found', async (t) => {
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
  await s.update(document, '');
  const all = await s.all();
  t.is(all.length, 2);
});

test('delete(document): removes the file from disk', async (t) => {
  let all;
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
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  await s.delete(document.slug);
  all = await s.all();
  t.is(all.length, 1);
});

test('delete(document): does nothing when no file is found', async (t) => {
  let all;
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
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  await s.delete('slug');
  all = await s.all();
  t.is(all.length, 2);
});

test('storeObject(fileName, object): writes the file to disk as object', async (t) => {
  const s = new StorageProvider(config);
  const data = { test: true };
  await s.storeObject('test', data);
  const output = await s.readObject('test');
  t.deepEqual(output, data);
});

test('storeObject(fileName, object): writes the file to disk as string', async (t) => {
  const s = new StorageProvider(config);
  const data = '{ test: true }';
  await s.storeObject('test', data);
  const output = await s.readObject('test');
  t.deepEqual(output, data);
});

test('updateObject(name, key, value): update an object key with a given value', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.updateObject('test', 'amount', 10);
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 10);
});

test('updateObject(name, key, value): does nothing when no name is provided', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.updateObject('', 'amount', 10);
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 2);
});

test('updateObject(name, key, value): does nothing when no key is provided', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.updateObject('test', '', 10);
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 2);
});

test('updateObject(name, key, value): creates content when missing', async (t) => {
  const s = new StorageProvider(config);
  t.deepEqual(await s.readObjectValue('missing', 'amount', 'X'), 'X');
  await s.updateObject('test', 'amount', 2);
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 2);
});

test('decrementObject(name, key, amount = 1): decrements an object key value by a given amount', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.decrementObject('test', 'amount');
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 1);
});

test('decrementObject(name, key, amount = 1): decrements an object key value by a given amount from 0 if the value is not already set', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.decrementObject('test', 'missing');
  const output = await s.readObjectValue('test', 'missing', 'X');
  t.deepEqual(output, -1);
});

test('decrementObject(name, key, amount = 1): does nothing when no name is provided', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.decrementObject('', 'amount');
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 2);
});

test('decrementObject(name, key, amount = 1): does nothing when no key is provided', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.decrementObject('test', '');
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 2);
});

test('decrementObject(name, key, amount = 1): does nothing when no content is found with a missing key', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.decrementObject('test', '');
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 2);
});

test('decrementObject(name, key, amount = 1): does nothing when no content is found with a missing name', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.decrementObject('missing', 'amount');
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 2);
});

test('incrementObject(name, key, amount = 1): increments an object key value by a given amount', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.incrementObject('test', 'amount');
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 3);
});

test('incrementObject(name, key, amount = 1): increments an object key value by a given amount from 0 if the value is not already set', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.incrementObject('test', 'amount');
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 3);
});

test('incrementObject(name, key, amount = 1): does nothing when no name is provided', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.incrementObject('', 'amount');
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 2);
});

test('incrementObject(name, key, amount = 1): does nothing when no key is provided', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.incrementObject('test', '');
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 2);
});

test('incrementObject(name, key, amount = 1): does nothing when no content is found with a missing key', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.incrementObject('test', '');
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 2);
});

test('incrementObject(name, key, amount = 1): does nothing when no content is found with a missing name', async (t) => {
  const s = new StorageProvider(config);
  const data = { amount: 2 };
  await s.storeObject('test', data);
  await s.incrementObject('missing', 'amount');
  const output = await s.readObjectValue('test', 'amount', 'X');
  t.deepEqual(output, 2);
});

test('readObject(name, fallback): returns an object found by name', async (t) => {
  const s = new StorageProvider(config);
  const data = { test: true };
  await s.storeObject('test', data);
  const output = await s.readObject('test');
  t.deepEqual(output, data);
});

test('readObject(name, fallback): returns fallback when no name is provided', async (t) => {
  const s = new StorageProvider(config);
  const output = await s.readObject('', '🍁');
  t.is(output, '🍁');
});

test('readObject(name, fallback): returns fallback when no content is returned', async (t) => {
  const s = new StorageProvider(config);
  const output = await s.readObject('missing', '🍁');
  t.is(output, '🍁');
});

test('readObjectValue(name, key, fallback): returns a value from an object', async (t) => {
  const s = new StorageProvider(config);
  const pi = 3.1415;
  const data = { test: true, pi };
  await s.storeObject('test', data);
  const value = await s.readObjectValue('test', 'pi', 4);
  t.deepEqual(value, pi);
});

test('readObjectValue(name, key, fallback): returns a fallback value from an object when no name is provided', async (t) => {
  const s = new StorageProvider(config);
  const data = { test: true };
  await s.storeObject('test', data);
  const output = await s.readObjectValue('', 'pi', 4);
  t.deepEqual(output, 4);
});

test('readObjectValue(name, key, fallback): returns a fallback value from an object when no key is provided', async (t) => {
  const s = new StorageProvider(config);
  const data = { test: true };
  await s.storeObject('test', data);
  const output = await s.readObjectValue('test', '', 4);
  t.deepEqual(output, 4);
});

test('readObjectValue(name, key, fallback): returns a fallback value from an object when no key matches', async (t) => {
  const s = new StorageProvider(config);
  const data = { test: true };
  await s.storeObject('test', data);
  const output = await s.readObjectValue('test', 'pi', 4);
  t.deepEqual(output, 4);
});

test('augmentDocuments(documents, _fields): returns all matching documents', async (t) => {
  const s = new StorageProvider(config);
  const results = await s.augmentDocuments([{ slug: 'example-title' }]);
  t.deepEqual(results, [example]);
});

test('readFile(folder, name): returns a document found by name', async (t) => {
  const s = new StorageProvider(config);
  const result = await s.readFile(config.content_dir, example.slug);
  t.is(JSON.stringify(result), JSON.stringify(example));
});

test('readFile(folder, name): returns undefined when no name is provided', async (t) => {
  const s = new StorageProvider(config);
  const result = await s.readFile(config.content_dir, '');
  t.is(result, undefined);
});

test('readFolder(folder): returns undefined when no folder is provided', async (t) => {
  const s = new StorageProvider(config);
  const result = await s.readFolder('');
  t.deepEqual(result, []);
});

test('writeFile(folder, name, content): writes the file to disk', async (t) => {
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
  await s.writeFile(config.content_dir, document.slug, JSON.stringify(document));
  const result = await s.readFile(config.content_dir, document.slug);
  t.is(JSON.stringify(result), JSON.stringify(document));
});

test('deleteFile(folder, name): removes the file from disk', async (t) => {
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
  await s.writeFile(config.content_dir, document.slug, JSON.stringify(document));
  let result = await s.readFile(config.content_dir, document.slug);
  t.is(JSON.stringify(result), JSON.stringify(document));
  await s.deleteFile(config.content_dir, document.slug);
  result = await s.readFile(config.content_dir, document.slug);
  t.is(result, undefined);
});

// TODO: Add refresh test; tested elsewhere.

test('readFile(filePath): returns undefined when unable to read file', async (t) => {
  // const stub = sinon.stub(fs, 'readFileSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider(config);
  const result = await s.readFile(config.content_dir, 'missing');
  t.is(result, undefined);
});
