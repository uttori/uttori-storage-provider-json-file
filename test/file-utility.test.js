const fs = require('fs-extra');
const test = require('ava');
const Document = require('uttori-document');
const FileUtility = require('./../src/file-utility');

const config = {
  content_dir: 'test/site/content',
  history_dir: 'test/site/content/history',
  data_dir: 'test/site/data',
  extension: 'json',
  spaces_document: null,
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

test('readFile(folder, name): returns a document found by name', async (t) => {
  const result = await FileUtility.readFile(config, config.content_dir, example.slug);
  t.is(JSON.stringify(result), JSON.stringify(example));
});

test('readFile(folder, name): returns undefined when no name is provided', async (t) => {
  const result = await FileUtility.readFile(config, config.content_dir, '');
  t.is(result, undefined);
});

test('readFolder(folder): returns undefined when no folder is provided', async (t) => {
  const result = await FileUtility.readFolder('');
  t.deepEqual(result, []);
});

test('writeFile(folder, name, content): writes the file to disk', async (t) => {
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
  await FileUtility.writeFile(config, config.content_dir, document.slug, JSON.stringify(document));
  const result = await FileUtility.readFile(config, config.content_dir, document.slug);
  t.is(JSON.stringify(result), JSON.stringify(document));
});

test('deleteFile(folder, name): removes the file from disk', async (t) => {
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
  await FileUtility.writeFile(config, config.content_dir, document.slug, JSON.stringify(document));
  let result = await FileUtility.readFile(config, config.content_dir, document.slug);
  t.is(JSON.stringify(result), JSON.stringify(document));
  await FileUtility.deleteFile(config, config.content_dir, document.slug);
  result = await FileUtility.readFile(config, config.content_dir, document.slug);
  t.is(result, undefined);
});

// TODO: Add refresh test; tested elsewhere.

test('readFile(filePath): returns undefined when unable to read file', async (t) => {
  // const stub = sinon.stub(fs, 'readFileSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const result = await FileUtility.readFile(config, config.content_dir, 'missing');
  t.is(result, undefined);
});
