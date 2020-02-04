const fs = require('fs-extra');
const test = require('ava');
const Document = require('uttori-document');
const StorageProvider = require('./../src');

const config = {
  content_dir: 'test/site/content',
  history_dir: 'test/site/content/history',
  extension: 'json',
  spaces_document: null,
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
  tags: ['Example Tag', 'Fake'],
  customData: {},
};

test.beforeEach(async () => {
  await fs.remove('test/site');
  await fs.ensureDir('test/site/content/history', { recursive: true });
  await fs.writeFile('test/site/content/example-title.json', JSON.stringify(example));
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
  t.throws(() => new StorageProvider({ history_dir: '_' }));
});

test('constructor(config): throws an error when missing config history directory', (t) => {
  t.throws(() => new StorageProvider({ content_dir: '_' }));
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
  t.deepEqual(results, ['Example Tag', 'Fake']);
});

test('getTaggedDocuments(tag, limit, fields): returns documents with the given tag', async (t) => {
  const s = new StorageProvider(config);
  await s.add(fake);
  await s.add(empty);

  let tag = 'Example Tag';
  let query = `SELECT 'slug', 'title', 'tags', 'updateDate' FROM documents WHERE 'tags' INCLUDES ('${tag}') ORDER BY title ASC LIMIT 100`;
  let output = await s.getQuery(query);
  t.deepEqual(output, [example, fake]);

  tag = 'Fake';
  query = `SELECT 'slug', 'title', 'tags', 'updateDate' FROM documents WHERE 'tags' INCLUDES ('${tag}') ORDER BY title ASC LIMIT 100`;
  output = await s.getQuery(query);
  t.deepEqual(output, [fake, empty]);

  tag = 'No Tag';
  query = `SELECT 'slug', 'title', 'tags', 'updateDate' FROM documents WHERE 'tags' INCLUDES ('${tag}') ORDER BY title ASC LIMIT 100`;
  output = await s.getQuery(query);
  t.deepEqual(output, []);
});

test('getRecentDocuments(limit, fields): returns the requested number of the most recently updated documents', async (t) => {
  const s = new StorageProvider(config);
  await s.add(fake);
  await s.add(empty);

  let limit = 1;
  let query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY updateDate DESC LIMIT ${limit}`;
  let output = await s.getQuery(query);
  t.deepEqual(output, [empty]);

  limit = 2;
  query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY updateDate DESC LIMIT ${limit}`;
  output = await s.getQuery(query);
  t.deepEqual(output, [empty, fake]);

  limit = 3;
  query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY updateDate DESC LIMIT ${limit}`;
  output = await s.getQuery(query);
  t.deepEqual(output, [empty, fake, example]);
});

test('getRelatedDocuments(document, limit, fields): returns the requested number of the related documents', async (t) => {
  const s = new StorageProvider(config);
  await s.add(fake);
  const tagged = { ...empty, tags: ['Example Tag'] };
  await s.add(tagged);

  const query = `SELECT * FROM documents WHERE 'tags' INCLUDES ('${example.tags.join(',')}') AND slug != ${example.slug} ORDER BY title DESC LIMIT 2`;
  const output = await s.getQuery(query);
  t.deepEqual(output, [tagged, fake]);
});

test('getRandomDocuments(limit, fields): returns the requested number of random documents', async (t) => {
  const s = new StorageProvider(config);
  await s.add(fake);
  await s.add(empty);

  let limit = 1;
  let query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY RANDOM LIMIT ${limit}`;
  let output = await s.getQuery(query);
  t.is(output.length, 1);

  limit = 2;
  query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY RANDOM LIMIT ${limit}`;
  output = await s.getQuery(query);
  t.is(output.length, 2);

  limit = 3;
  query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY RANDOM LIMIT ${limit}`;
  output = await s.getQuery(query);
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

test('getHistory(slug): returns an empty array when a slug is not found', async (t) => {
  const s = new StorageProvider(config);
  t.is(await s.getHistory(''), undefined);
  t.deepEqual(await s.getHistory('missing'), []);
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

test('add(document): cannot add without a document or a slug', async (t) => {
  let all;
  const s = new StorageProvider(config);
  await s.add();
  all = await s.all();
  t.is(all.length, 1);
  s.add({});
  all = await s.all();
  t.is(all.length, 1);
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

test('update(document, originalSlug): does not update without a document or slug', async (t) => {
  let all;
  const s = new StorageProvider(config);
  await s.update(undefined, 'second-file');
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, example.title);

  await s.update({ title: 'New' }, 'second-file');
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, example.title);
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

test('augmentDocuments(documents, _fields): returns all matching documents', async (t) => {
  const s = new StorageProvider(config);
  await s.add(fake);
  await s.add(empty);

  const search_results = [{ slug: 'example-title' }, { slug: 'fake' }];
  const includes = search_results.map((result) => `'${result.slug}'`).join(',');
  const query = `SELECT * FROM documents WHERE slug INCLUDES (${includes}) ORDER BY title ASC LIMIT 100`;
  const output = await s.getQuery(query);
  t.deepEqual(output, [example, fake]);
});
