// @ts-nocheck
const fs = require('fs-extra');
const test = require('ava');
const { EventDispatcher } = require('uttori-utilities');
const Plugin = require('../src/plugin.js');

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

test('Plugin.register(context): can register', (t) => {
  t.notThrows(() => {
    Plugin.register({ hooks: { on: () => {} }, config: { [Plugin.configKey]: { ...config, events: { callback: [] } } } });
  });
});

test('Plugin.register(context): does not error with events corresponding to missing methods', async (t) => {
  await t.notThrowsAsync(async () => {
    await Plugin.register({
      hooks: {
        on: () => {},
      },
      config: {
        [Plugin.configKey]: {
          ...config,
          events: {
            test: ['test'],
          },
        },
      },
    });
  });
});

test('Plugin.register(context): errors without event dispatcher', (t) => {
  t.throws(() => {
    Plugin.register({ hooks: {} });
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('Plugin.register(context): errors without events', (t) => {
  t.throws(() => {
    Plugin.register({ hooks: { on: () => {} }, config: { [Plugin.configKey]: { events: undefined } } });
  }, { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('Plugin.defaultConfig(): can return a default config', (t) => {
  t.notThrows(Plugin.defaultConfig);
});

test('Plugin.get(viewModel, context): can return a document', async (t) => {
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
      [Plugin.configKey]: {
        ...config,
        events: {
          add: ['storage-add'],
          get: ['storage-get'],
        },
      },
    },
  };
  Plugin.register(context);

  await context.hooks.filter('storage-add', document);
  const output = await context.hooks.filter('storage-get', document.slug);
  t.deepEqual(output, document);
});
