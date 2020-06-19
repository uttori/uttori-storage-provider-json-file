/**
 * Uttori Storage Provider - JSON File
 * @example
 * <caption>Plugin</caption>
 * const storage = Plugin.callback(viewModel, context);
 */
declare class Plugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @example
     * <caption>Plugin.configKey</caption>
     * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
     */
    static configKey: string;
    /**
     * The default configuration.
     * @example
     * <caption>Plugin.defaultConfig()</caption>
     * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
     * @returns The configuration.
     */
    static defaultConfig(): any;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @example
     * <caption>Plugin.register(context)</caption>
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
     * @param context - A Uttori-like context.
     * @param context.hooks - An event system / hook system to use.
     * @param context.hooks.on - An event registration function.
     * @param context.config - A provided configuration to use.
     * @param context.config.events - An object whose keys correspong to methods, and contents are events to listen for.
     */
    static register(context: {
        hooks: {
            on: (...params: any[]) => any;
        };
        config: {
            events: any;
        };
    }): void;
}

/**
 * Processes a query string.
 * @example
 * process('SELECT name FROM table WHERE age > 1 ORDER BY RANDOM LIMIT 3', [{ ... }, ...]);
 * ➜ [{ ... }, ...]
 * @param query - The SQL-like query to parse.
 * @param objects - An array of object to search within.
 * @returns Returns an array of all matched documents.
 */
declare function process(query: string, objects: object[]): object[];

/**
 * @property slug - The unique identifier for the document.
 * @property [title = ''] - The unique identifier for the document.
 * @property [createDate] - The creation date of the document.
 * @property [updateDate] - The last date the document was updated.
 * @property [tags = []] - The unique identifier for the document.
 * @property [customData = {}] - Any extra meta data for the document.
 */
declare type UttoriDocument = {
    slug: string;
    title?: string;
    createDate?: number | Date;
    updateDate?: number | Date;
    tags?: string[];
    customData?: any;
};

/**
 * Creates an instance of StorageProvider.
 * @example
 * <caption>Init StorageProvider</caption>
 * const storageProvider = new StorageProvider({ content_directory: 'content', history_directory: 'history', spaces_document: 2 });
 * @property config - The configuration object.
 * @property config.content_directory - The directory to store documents.
 * @property config.history_directory - The directory to store document histories.
 * @property config.extension - The file extension to use for file, name of the employee.
 * @property config.spaces_document - The spaces parameter for JSON stringifying documents.
 * @property config.spaces_history - The spaces parameter for JSON stringifying history.
 * @property documents - The collection of documents.
 * @param config - A configuration object.
 * @param config.content_directory - The directory to store documents.
 * @param config.history_directory - The directory to store document histories.
 * @param [config.extension = json] - The file extension to use for file, name of the employee.
 * @param [config.spaces_document] - The spaces parameter for JSON stringifying documents.
 * @param [config.spaces_history] - The spaces parameter for JSON stringifying history.
 */
declare class StorageProvider {
    constructor(config: {
        content_directory: string;
        history_directory: string;
        extension?: string;
        spaces_document?: number;
        spaces_history?: number;
    });
    /**
     * Returns all documents.
     * @example
     * storageProvider.all();
     * ➜ [{ slug: 'first-document', ... }, ...]
     * @returns Promise object represents all documents.
     */
    all(): Promise;
    /**
     * Returns all documents matching a given query.
     * @param query - The conditions on which documents should be returned.
     * @returns Promise object represents all matching documents.
     */
    getQuery(query: string): Promise;
    /**
     * Returns a document for a given slug.
     * @param slug - The slug of the document to be returned.
     * @returns Promise object represents the returned UttoriDocument.
     */
    get(slug: string): Promise;
    /**
     * Returns the history of edits for a given slug.
     * @param slug - The slug of the document to get history for.
     * @returns Promise object represents the returned history.
     */
    getHistory(slug: string): Promise;
    /**
     * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
     * @param params - The params object.
     * @param params.slug - The slug of the document to be returned.
     * @param params.revision - The unix timestamp of the history to be returned.
     * @returns Promise object represents the returned revision of the document.
     */
    getRevision(params: {
        slug: string;
        revision: number;
    }): Promise;
    /**
     * Saves a document to the file system.
     * @param document - The document to be added to the collection.
     */
    add(document: UttoriDocument): void;
    /**
     * Updates a document and figures out how to save to the file system.
     * @param params - The params object.
     * @param params.document - The document to be updated in the collection.
     * @param params.originalSlug - The original slug identifying the document, or the slug if it has not changed.
     */
    update(params: {
        document: UttoriDocument;
        originalSlug: string;
    }): void;
    /**
     * Removes a document from the file system.
     * @param slug - The slug identifying the document.
     */
    delete(slug: string): void;
    /**
     * Reloads all documents from the file system into the cache.
     */
    refresh(): void;
    /**
     * Updates History for a given slug, renaming the store file and history folder as needed.
     * @param slug - The slug of the document to update history for.
     * @param content - The revision of the document to be saved.
     * @param [originalSlug] - The original slug identifying the document, or the slug if it has not changed.
     */
    updateHistory(slug: string, content: string, originalSlug?: string): void;
    /**
     * The configuration object.
    */
    config: {
        content_directory: string;
        history_directory: string;
        extension: string;
        spaces_document: number;
        spaces_history: number;
    };
    /**
     * The collection of documents.
    */
    documents: UttoriDocument[];
}

