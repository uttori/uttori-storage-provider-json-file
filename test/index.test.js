import test from 'ava';
import { Plugin, StorageProvider } from '../src/index.js';

const config = {
  contentDirectory: 'test/site/content',
  historyDirectory: 'test/site/content/history',
  extension: 'json',
  spacesDocument: undefined,
  spacesHistory: undefined,
};

test('Plugin: is properly exported', (t) => {
  t.notThrows(() => {
    Plugin.defaultConfig();
  });
});

test('StorageProvider: is properly exported', (t) => {
  t.notThrows(() => {
    const storage = new StorageProvider(config);
    storage.all();
  });
});
