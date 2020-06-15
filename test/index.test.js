const test = require('ava');
const { Plugin, StorageProvider } = require('../src');

const config = {
  content_directory: 'test/site/content',
  history_directory: 'test/site/content/history',
  extension: 'json',
  spaces_document: undefined,
  spaces_history: undefined,
};

test('Plugin: is properly exported', (t) => {
  t.notThrows(() => {
    Plugin.defaultConfig();
  });
});

test('StorageProvider: is properly exported', (t) => {
  t.notThrows(() => {
    const storage = new StorageProvider(config);
    storage.refresh();
  });
});
