/* eslint-disable unicorn/no-fn-reference-in-iterator */
const debug = require('debug')('Uttori.Plugin.StorageProvider.JSON');
const StorageProvider = require('./storage-provider');

/**
 * Uttori Storage Provider - JSON File
 * @example <caption>Plugin</caption>
 * const storage = Plugin.callback(viewModel, context);
 * @class
 */
class Plugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @return {String} The configuration key.
   * @example <caption>Plugin.configKey</caption>
   * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-storage-provider-json-file';
  }

  /**
   * The default configuration.
   * @return {Object} The configuration.
   * @example <caption>Plugin.defaultConfig()</caption>
   * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      content_directory: '',
      history_directory: '',
      extension: 'json',
      spaces_document: undefined,
      spaces_history: undefined,
      events: {
        add: ['storage-add'],
        delete: ['storage-delete'],
        get: ['storage-get'],
        getHistory: ['storage-get-history'],
        getRevision: ['storage-get-revision'],
        query: ['storage-query'],
        update: ['storage-update'],
        validateConfig: ['validate-config'],
      },
    };
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {Object} context - A Uttori-like context.
   * @param {Object} context.hooks - An event system / hook system to use.
   * @param {Function} context.hooks.on - An event registration function.
   * @param {Object} context.config - A provided configuration to use.
   * @param {Object} context.config.events - An object whose keys correspong to methods, and contents are events to listen for.
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
   *         query: ['storage-query'],
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
    const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
    if (!config.events) {
      throw new Error("Missing events to listen to for in 'config.events'.");
    }

    const storage = new StorageProvider(config);
    Object.keys(config.events).forEach((method) => {
      config.events[method].forEach((event) => context.hooks.on(event, storage[method]));
    });
  }
}

module.exports = Plugin;
