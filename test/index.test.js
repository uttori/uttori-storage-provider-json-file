const fs = require('fs');
const test = require('ava');
const sinon = require('sinon');
const Document = require('uttori-document');
const StorageProvider = require('../index');

const example = {
  title: 'Example Title',
  slug: 'example-title',
  content: '## Example Title',
  html: '',
  updateDate: 1459310452001,
  createDate: 1459310452001,
  tags: ['Example Tag'],
};

test('Storage Provider: constructor(config): does not error', (t) => {
  t.notThrows(() => new StorageProvider());
});

test('Storage Provider: readFile(filePath): returns null when unable to read file', (t) => {
  // const stub = sinon.stub(fs, 'readFileSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider();
  const result = s.readFile('missing.json');
  t.is(result, null);
});

test('Storage Provider: readDocument(slug): returns a document found by slug', (t) => {
  // const stub = sinon.stub(fs, 'readFileSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider({ content_dir: 'test' });
  const stub = sinon.stub(s, 'readFile');
  stub.returns(JSON.stringify(example));

  const result = s.readDocument('test');
  t.true(stub.calledOnce);
  t.is(JSON.stringify(result), JSON.stringify(example));
  s.readFile.restore();
});

test('Storage Provider: readDocument(slug): returns undefined when no slug is provided', (t) => {
  const s = new StorageProvider({ content_dir: 'test' });
  const result = s.readDocument();
  t.is(result, undefined);
});

test('Storage Provider: readDocument(slug): returns undefined when unable to read file', (t) => {
  // const stub = sinon.stub(fs, 'readFileSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider({ content_dir: 'test' });
  const stub = sinon.stub(s, 'readFile').returns(undefined);

  const result = s.readDocument('test-test-test');

  t.true(stub.calledOnce);
  t.is(result, undefined);
  s.readFile.restore();
});

test('Storage Provider: readDocument(slug): returns undefined when unable to parse to a document', (t) => {
  // const stub = sinon.stub(fs, 'readFileSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider({ content_dir: 'test' });
  sinon.stub(s, 'readFile').returns('content');

  const result = s.readDocument('test-test-test');

  t.is(result, undefined);
  s.readFile.restore();
});

test('Storage Provider: storeDocument(document): writes the file to disk', (t) => {
  const spy = sinon.spy(fs, 'writeFileSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider({ content_dir: 'test' });

  const document = new Document();
  document.title = 'Example Title';
  document.tags = ['Example Tag'];
  document.createDate = 1459310452001;
  document.updateDate = 1459310452001;
  document.content = '## Example Title';
  document.slug = 'example-title';
  s.storeDocument(document);

  t.true(spy.calledTwice);
  t.is(spy.args[0][0], 'test/example-title.json');
  t.is(spy.args[0][1], JSON.stringify(example));
  t.is(spy.args[0][2], 'utf8');

  fs.writeFileSync.restore();
});

test('Storage Provider: deleteDocument(document): removes the file from disk', (t) => {
  const spy = sinon.spy(fs, 'unlinkSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider({ content_dir: 'test' });

  const document = new Document();
  document.title = 'Example Title';
  document.tags = ['Example Tag'];
  document.createDate = 1459310452001;
  document.updateDate = 1459310452001;
  document.content = '## Example Title';
  document.slug = 'example-title';
  s.deleteDocument(document);

  t.true(spy.calledOnce);
  t.is(spy.args[0][0], 'test/example-title.json');

  fs.unlinkSync.restore();
});

test('Storage Provider: all(): returns all the documents', (t) => {
  const stub = sinon.stub(fs, 'readdirSync'); // BUG: https://github.com/avajs/ava/issues/1359
  stub.returns([
    '.DS_Store',
    'example-title.md',
  ]);
  const s = new StorageProvider({ content_dir: 'test' });
  const document = new Document();
  document.title = 'Example Title';
  document.tags = ['Example Tag'];
  document.createDate = 1459310452001;
  document.updateDate = 1459310452001;
  document.content = '## Example Title';
  document.slug = 'example-title';
  document.html = '';
  s.documents = [document];

  const results = s.all();

  t.true(stub.calledOnce);
  t.true(stub.calledWith('test'));
  t.deepEqual(results[0], document);

  fs.readdirSync.restore();
});

test('Storage Provider: storeObject(fileName, object): writes the file to disk', (t) => {
  const spy = sinon.spy(fs, 'writeFile'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider({ data_dir: 'test' });
  s.storeObject('test', { test: true });

  t.true(spy.calledOnce);
  t.is(spy.args[0][0], 'test/test.json');
  t.is(spy.args[0][1], '{"test":true}');
  t.is(spy.args[0][2], 'utf8');

  fs.writeFile.restore();
});

test('Storage Provider: readObject(fileName): returns an object found by file name', (t) => {
  // const stub = sinon.stub(fs, 'readFileSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider({ data_dir: 'test' });
  const stub = sinon.stub(s, 'readFile');
  stub.returns('{"test":true}');

  const result = s.readObject('test');

  t.true(stub.calledOnce);
  t.deepEqual(result, { test: true });
  s.readFile.restore();
});

test('Storage Provider: readObject(fileName): returns null when no content is returned', (t) => {
  // const stub = sinon.stub(fs, 'readFileSync'); // BUG: https://github.com/avajs/ava/issues/1359
  const s = new StorageProvider({ data_dir: 'test' });
  const stub = sinon.stub(s, 'readFile');
  stub.returns(undefined);

  const result = s.readObject('test');

  t.true(stub.calledOnce);
  t.is(result, null);
  s.readFile.restore();
});
