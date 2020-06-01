/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require('fs-extra');
const test = require('ava');
const { EventDispatcher } = require('uttori-utilities');
const StorageProviderJSONFile = require('../src/plugin.js');

const config = {
  content_directory: 'test/site/content',
  history_directory: 'test/site/content/history',
  extension: 'json',
  spaces_document: undefined,
  spaces_history: undefined,
};

test.beforeEach(async () => {
  await fs.remove('test/site');
  await fs.ensureDir('test/site/content/history', { recursive: true });
});

test.afterEach.always(async () => {
  await fs.remove('test/site');
});

test('StorageProviderJSONFile.register(context): can register', (t) => {
  t.notThrows(() => {
    StorageProviderJSONFile.register({ hooks: { on: () => {} }, config: { [StorageProviderJSONFile.configKey]: { ...config, events: { callback: [] } } } });
  });
});

test('StorageProviderJSONFile.register(context): errors without event dispatcher', (t) => {
  t.throws(() => {
    StorageProviderJSONFile.register({ hooks: {} });
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('StorageProviderJSONFile.register(context): errors without events', (t) => {
  t.throws(() => {
    StorageProviderJSONFile.register({ hooks: { on: () => {} }, config: { [StorageProviderJSONFile.configKey]: { events: undefined } } });
  }, { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('StorageProviderJSONFile.defaultConfig(): can return a default config', (t) => {
  t.notThrows(StorageProviderJSONFile.defaultConfig);
});

test('StorageProviderJSONFile.get(viewModel, context): can return a document', async (t) => {
  t.plan(1);
  const document = {
    updateDate: new Date('2020-04-20').toISOString(),
    createDate: new Date('2020-04-20').toISOString(),
    customData: {},
    slug: 'test',
    tags: ['cool', 'blue'],
  };

  const hooks = new EventDispatcher();
  const context = {
    hooks,
    config: {
      [StorageProviderJSONFile.configKey]: {
        ...config,
        events: {
          add: ['storage-add'],
          get: ['storage-get'],
        },
      },
    },
  };
  StorageProviderJSONFile.register(context);

  await context.hooks.filter('storage-add', document);
  const output = await context.hooks.filter('storage-get', document.slug);
  t.deepEqual(output, document);
});
