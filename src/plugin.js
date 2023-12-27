import StorageProvider from './storage-provider.js';

let debug = (..._) => {};
/* c8 ignore next 2 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.StorageProvider.JSON'); } catch {}

/**
 * Uttori Storage Provider - JSON File
 * @example <caption>Plugin</caption>
 * const storage = Plugin.callback(viewModel, context);
 * @class
 */
class Plugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * In this case the key is `uttori-plugin-storage-provider-json-file`.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>Plugin.configKey</caption>
   * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-storage-provider-json-file';
  }

  /**
   * The default configuration.
   * @returns {import('./storage-provider.js').StorageProviderConfig} The configuration.
   * @example <caption>Plugin.defaultConfig()</caption>
   * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      contentDirectory: '',
      historyDirectory: '',
      extension: 'json',
      updateTimestamps: true,
      useHistory: true,
      useCache: true,
      spacesDocument: undefined,
      spacesHistory: undefined,
      events: {
        add: ['storage-add'],
        delete: ['storage-delete'],
        get: ['storage-get'],
        getHistory: ['storage-get-history'],
        getRevision: ['storage-get-revision'],
        getQuery: ['storage-query'],
        update: ['storage-update'],
        validateConfig: ['validate-config'],
      },
    };
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {object} context - A Uttori-like context.
   * @param {object} context.hooks - An event system / hook system to use.
   * @param {Function} context.hooks.on - An event registration function.
   * @param {Record<string, import('./storage-provider.js').StorageProviderConfig>} context.config - A provided configuration to use.
   * @example <caption>Plugin.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [Plugin.configKey]: {
   *       ...,
   *       events: {
   *         add: ['storage-add'],
   *         delete: ['storage-delete'],
   *         get: ['storage-get'],
   *         getHistory: ['storage-get-history'],
   *         getRevision: ['storage-get-revision'],
   *         getQuery: ['storage-query'],
   *         update: ['storage-update'],
   *         validateConfig: ['validate-config'],
   *       },
   *     },
   *   },
   * };
   * Plugin.register(context);
   * @static
   */
  static register(context) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error("Missing event dispatcher in 'context.hooks.on(event, callback)' format.");
    }
    /** @type {import('./storage-provider.js').StorageProviderConfig} */
    const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
    if (!config.events) {
      throw new Error("Missing events to listen to for in 'config.events'.");
    }

    const storage = new StorageProvider(config);
    for (const [method, eventNames] of Object.entries(config.events)) {
      if (typeof storage[method] === 'function') {
        for (const event of eventNames) {
          context.hooks.on(event, storage[method]);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }
}

export default Plugin;
