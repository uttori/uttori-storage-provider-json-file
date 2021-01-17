// @ts-nocheck
const fs = require('fs-extra');
const test = require('ava');
const R = require('ramda');
const { StorageProvider } = require('../src');

const tagExample = 'Example Tag';
const tagFake = 'Fake';
const exampleSlug = 'example-title';
const secondFile = 'second-file';
const secondFileNewDirectory = 'second-file-new-directory';
const secondFileV1 = 'second file';
const secondFileV2 = 'second file-v2';
const secondFileV3 = 'second file-v3';
const secondFileV4 = 'second file-v4';

const config = {
  content_directory: 'test/site/content',
  history_directory: 'test/site/content/history',
  extension: 'json',
  spaces_document: undefined,
  spaces_history: undefined,
  update_timestamps: true,
  use_history: true,
};

const example = {
  title: 'Example Title',
  slug: exampleSlug,
  content: '## Example Title',
  html: '',
  updateDate: 1459310452001,
  createDate: 1459310452001,
  tags: [tagExample],
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
  tags: [tagFake],
  customData: {},
};

const fake = {
  title: tagFake,
  slug: 'fake',
  content: '# Fake',
  html: '',
  updateDate: 1459310452002,
  createDate: 1459310452002,
  tags: [tagExample, tagFake],
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
  t.throws(() => new StorageProvider({ history_directory: '_' }));
});

test('constructor(config): throws an error when missing config history directory', (t) => {
  t.throws(() => new StorageProvider({ content_directory: '_' }));
});

test('all(): returns all the documents', async (t) => {
  const s = new StorageProvider(config);
  const results = await s.all();
  t.deepEqual(results, [example]);
});

test('getQuery(query): returns all unique tags from all the documents', async (t) => {
  const s = new StorageProvider(config);
  await s.add(example);
  await s.add(fake);
  await s.add(empty);
  const results = await s.getQuery('SELECT tags FROM documents WHERE slug IS_NOT_NULL ORDER BY slug ASC LIMIT 3');
  t.deepEqual(results, [
    {
      tags: [
        tagFake,
      ],
    },
    {
      tags: [
        tagExample,
      ],
    },
    {
      tags: [
        tagExample,
        tagFake,
      ],
    },
  ]);

  const tags = R.pipe(
    R.pluck('tags'),
    R.flatten,
    R.uniq,
    R.filter(Boolean),
    R.sort((a, b) => a.localeCompare(b)),
  )(results);
  t.deepEqual(tags, [tagExample, tagFake]);
});

test('getQuery(query): returns all unique tags and slug from all the documents', async (t) => {
  const s = new StorageProvider(config);
  await s.add(example);
  await s.add(fake);
  await s.add(empty);
  const results = await s.getQuery('SELECT slug, tags FROM documents WHERE slug IS_NOT_NULL ORDER BY slug ASC LIMIT 3');
  t.deepEqual(results, [
    {
      slug: 'empty',
      tags: [
        tagFake,
      ],
    },
    {
      slug: exampleSlug,
      tags: [
        tagExample,
      ],
    },
    {
      slug: 'fake',
      tags: [
        tagExample,
        tagFake,
      ],
    },
  ]);

  const tags = R.pipe(
    R.pluck('tags'),
    R.flatten,
    R.uniq,
    R.filter(Boolean),
    R.sort((a, b) => a.localeCompare(b)),
  )(results);
  t.deepEqual(tags, [tagExample, tagFake]);
});

test('getQuery(query): returns documents with the given tag', async (t) => {
  const s = new StorageProvider(config);
  await s.add(fake);
  await s.add(empty);

  let tag = tagExample;
  let query = `SELECT * FROM documents WHERE 'tags' INCLUDES ('${tag}') ORDER BY title ASC LIMIT 100`;
  let output = await s.getQuery(query);
  t.deepEqual(output, [example, fake]);

  tag = tagFake;
  query = `SELECT * FROM documents WHERE 'tags' INCLUDES ('${tag}') ORDER BY title ASC LIMIT 100`;
  output = await s.getQuery(query);
  t.deepEqual(output, [fake, empty]);

  tag = 'No Tag';
  query = `SELECT * FROM documents WHERE 'tags' INCLUDES ('${tag}') ORDER BY title ASC LIMIT 100`;
  output = await s.getQuery(query);
  t.deepEqual(output, []);
});

test('getQuery(query): returns the requested number of the most recently updated documents', async (t) => {
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

test('getQuery(query): returns the requested number of the related documents', async (t) => {
  const s = new StorageProvider(config);
  await s.add(fake);
  const tagged = { ...empty, tags: [tagExample] };
  await s.add(tagged);

  const query = `SELECT * FROM documents WHERE 'tags' INCLUDES ('${example.tags.join(',')}') AND slug != ${example.slug} ORDER BY title DESC LIMIT 2`;
  const output = await s.getQuery(query);
  t.deepEqual(output, [tagged, fake]);
});

test('getQuery(query): returns the requested number of random documents', async (t) => {
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
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, secondFileV1);
  history = await s.getHistory(document.slug);
  t.is(history.length, 1);

  document.title = secondFileV2;
  document.content = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, secondFileV2);
  await s.refresh();
  history = await s.getHistory(document.slug);
  // TODO Sometimes returns 1, not 2.
  t.is(history.length, 2);

  document.title = secondFileV3;
  document.content = secondFileV3;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, secondFileV3);
  await s.refresh();
  history = await s.getHistory(document.slug);
  // TODO Sometimes returns 2, not 3.
  t.is(history.length, 3);

  document.slug = secondFileNewDirectory;
  document.title = secondFileV4;
  document.content = secondFileV4;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, secondFileV4);
  history = await s.getHistory(document.slug);
  t.is(history.length, 4);
});

test('getRevision({ slug, revision }): returns undefined when missing a slug', async (t) => {
  const s = new StorageProvider(config);
  const revision = await s.getRevision({ slug: '' });
  t.is(revision, undefined);
});

test('getRevision({ slug, revision }): returns undefined when missing a revision', async (t) => {
  const s = new StorageProvider(config);
  const revision = await s.getRevision({ slug: 'slug', revision: '' });
  t.is(revision, undefined);
});

test('getRevision({ slug, revision }): returns undefined when no revision is found', async (t) => {
  const s = new StorageProvider(config);
  const revision = await s.getRevision({ slug: 'slug', revision: -1 });
  t.is(revision, undefined);
});

test('getRevision({ slug, revision }): returns a specific revision of an article', async (t) => {
  let all;
  let history;
  await fs.remove('test/site');

  const s = new StorageProvider(config);
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, secondFileV1);
  history = await s.getHistory(document.slug);
  t.is(history.length, 1);

  document.title = secondFileV2;
  document.content = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, secondFileV2);
  await s.refresh();
  history = await s.getHistory(document.slug);
  // TODO: Occasionally this returns 1, not 2.
  t.is(history.length, 2);

  document.title = secondFileV3;
  document.content = secondFileV3;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, secondFileV3);
  await s.refresh();
  history = await s.getHistory(document.slug);
  // TODO: Occasionlly returns 2, not 3.
  t.is(history.length, 3);

  document.slug = secondFileNewDirectory;
  document.title = secondFileV4;
  document.content = secondFileV4;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, secondFileV4);
  history = await s.getHistory(document.slug);
  t.is(history.length, 4);

  history = await s.getHistory(document.slug);
  t.is(history.length, 4);

  let revision;
  revision = await s.getRevision({ slug: document.slug, revision: history[0] });
  t.is(revision.title, secondFileV1);
  revision = await s.getRevision({ slug: document.slug, revision: history[1] });
  t.is(revision.title, secondFileV2);
  revision = await s.getRevision({ slug: document.slug, revision: history[2] });
  t.is(revision.title, secondFileV3);
  revision = await s.getRevision({ slug: document.slug, revision: history[3] });
  t.is(revision.title, secondFileV4);
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
  const document = {
    content: '',
    createDate: undefined,
    customData: {},
    html: '',
    slug: secondFile,
    tags: [],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  const all = await s.all();
  t.deepEqual(all[0], example);
  t.is(all[1].slug, document.slug);
});

test('add(document): creates a new document without saving a history', async (t) => {
  const s = new StorageProvider({ ...config, use_history: false });
  const document = {
    content: '',
    createDate: undefined,
    customData: {},
    html: '',
    slug: secondFile,
    tags: [],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  const all = await s.all();
  t.deepEqual(all[0], example);
  t.is(all[1].slug, document.slug);
});

test('add(document): creates a new document with missing fields', async (t) => {
  const s = new StorageProvider(config);
  const document = {
    content: '',
    createDate: undefined,
    html: '',
    slug: secondFile,
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  const all = await s.all();
  t.deepEqual(all[0], example);
  t.is(all[1].slug, document.slug);
});

test('add(document): does not create a document with the same slug', async (t) => {
  let all;
  const s = new StorageProvider(config);
  const document = {
    content: '',
    createDate: undefined,
    customData: {},
    html: '',
    slug: secondFile,
    tags: [],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  all = await s.all();
  t.deepEqual(all[0], example);
  t.is(all[1].slug, document.slug);
  t.is(all.length, 2);
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
});

test('update({ document, originalSlug }): does not update without a document or slug', async (t) => {
  let all;
  const s = new StorageProvider(config);
  await s.update({ document: undefined, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, example.title);

  await s.update({ document: { title: 'New' }, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 1);
  t.is(all[0].title, example.title);
});

test('update({ document, originalSlug }): updates the file on disk', async (t) => {
  let all;
  const s = new StorageProvider(config);
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  document.title = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 2);
  const output = await s.get(secondFile);
  t.is(output.title, document.title);
});

test('update({ document, originalSlug }): updates the file on disk without an originalSlug', async (t) => {
  let all;
  const s = new StorageProvider({ ...config, use_history: false });
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  document.title = secondFileV2;
  await s.update({ document, originalSlug: undefined });
  all = await s.all();
  t.is(all.length, 2);
  const output = await s.get(secondFile);
  t.is(output.title, document.title);
});

test('update({ document, originalSlug }): renames the history directory if it exists', async (t) => {
  let all;
  let history;
  const s = new StorageProvider(config);
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  history = await s.getHistory(document.slug);
  t.is(history.length, 1);

  document.title = secondFileV2;
  document.content = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 2);
  t.is(all[1].title, document.title);

  await s.refresh();
  // TODO Sometimes returns 1, not 2.
  history = await s.getHistory(document.slug);
  t.is(history.length, 2);

  document.title = secondFileV3;
  document.content = secondFileV3;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 2);
  t.is(all[1].title, document.title);
  await s.refresh();
  history = await s.getHistory(document.slug);
  t.is(history.length, 3);

  document.slug = secondFileNewDirectory;
  document.title = secondFileV4;
  document.content = secondFileV4;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 2);
  t.is(all[1].title, document.title);
  await s.refresh();
  history = await s.getHistory(document.slug);
  t.is(history.length, 4);

  t.is(fs.existsSync(`${config.history_directory}/second-file-new-directory`), true);
  t.is(fs.existsSync(`${config.history_directory}/second-file`), false);
});

test('update({ document, originalSlug }): updates the file on disk with missing fields', async (t) => {
  let all;
  const s = new StorageProvider(config);
  const document = {
    content: '',
    createDate: undefined,
    html: '',
    slug: secondFile,
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  document.title = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 2);
  t.is(all[1].title, document.title);
});

test('update({ document, originalSlug }): does not update when file exists', async (t) => {
  let all;
  const s = new StorageProvider(config);
  const document = {
    content: '',
    createDate: undefined,
    html: '',
    slug: secondFile,
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  document.title = secondFileV2;
  await s.update({ document, originalSlug: exampleSlug });
  all = await s.all();
  t.is(all.length, 2);
  t.is(all[1].title, secondFileV1);
});

test('update({ document, originalSlug }): adds a document if the one to update is no found', async (t) => {
  const s = new StorageProvider(config);
  const document = {
    content: '',
    createDate: 1,
    customData: {},
    html: '',
    slug: 'third-file',
    tags: [],
    title: 'third file',
    updateDate: 1,
  };
  await s.update({ document, originalSlug: '' });
  const all = await s.all();
  t.is(all.length, 2);
});

test('update({ document, originalSlug }): updates the file on disk without updating timestamps', async (t) => {
  let all;
  const s = new StorageProvider({ ...config, update_timestamps: false });
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  document.title = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 2);
  t.deepEqual(all[1], document);
});

test('update({ document, originalSlug }): updates the file on disk without updating history', async (t) => {
  let all;
  const s = new StorageProvider({ ...config, update_timestamps: false, use_history: false });
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  document.title = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  all = await s.all();
  t.is(all.length, 2);
  t.deepEqual(all[1], document);
});

test('delete(document): removes the file from disk', async (t) => {
  let all;
  const s = new StorageProvider(config);
  const document = {
    content: '',
    createDate: 1,
    customData: {},
    html: '',
    slug: secondFile,
    tags: [],
    title: secondFileV1,
    updateDate: 1,
  };
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  await s.delete(document.slug);
  all = await s.all();
  t.is(all.length, 1);
});

test('delete(document): removes the file from disk without history', async (t) => {
  let all;
  const s = new StorageProvider({ ...config, use_history: false });
  const document = {
    content: '',
    createDate: 1,
    customData: {},
    html: '',
    slug: secondFile,
    tags: [],
    title: secondFileV1,
    updateDate: 1,
  };
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
  const document = {
    content: '',
    createDate: undefined,
    customData: {},
    html: '',
    slug: secondFile,
    tags: [],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  all = await s.all();
  t.is(all.length, 2);
  await s.delete('slug');
  all = await s.all();
  t.is(all.length, 2);
});

test('getQuery(query): returns all matching documents with an array of slugs', async (t) => {
  const s = new StorageProvider(config);
  await s.add(fake);
  await s.add(empty);

  const search_results = [{ slug: exampleSlug }, { slug: 'fake' }];
  const includes = search_results.map((result) => `'${result.slug}'`).join(',');
  const query = `SELECT * FROM documents WHERE slug INCLUDES (${includes}) ORDER BY title ASC LIMIT 100`;
  const output = await s.getQuery(query);
  t.deepEqual(output, [example, fake]);
});
