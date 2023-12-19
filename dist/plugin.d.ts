export default Plugin;
/**
 * Uttori Storage Provider - JSON File
 * @example <caption>Plugin</caption>
 * const storage = Plugin.callback(viewModel, context);
 * @class
 */
declare class Plugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * In this case the key is `uttori-plugin-storage-provider-json-file`.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>Plugin.configKey</caption>
     * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {import('./storage-provider.js').StorageProviderConfig} The configuration.
     * @example <caption>Plugin.defaultConfig()</caption>
     * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
     * @static
     */
    static defaultConfig(): import('./storage-provider.js').StorageProviderConfig;
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
    static register(context: {
        hooks: {
            on: Function;
        };
        config: Record<string, import('./storage-provider.js').StorageProviderConfig>;
    }): void;
}
//# sourceMappingURL=plugin.d.ts.map