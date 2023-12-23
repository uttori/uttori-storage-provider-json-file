export default StorageProvider;
/**
 * The document object we store, with only the minimum methods we access listed.
 */
export type UttoriDocument = {
    /**
     * The unique identifier for the document.
     */
    slug?: string;
    /**
     * The creation date of the document.
     */
    createDate?: number | Date;
    /**
     * The last date the document was updated.
     */
    updateDate?: number | Date;
};
/**
 * The configuration object for the StorageProvider.
 */
export type StorageProviderConfig = {
    /**
     * The directory to store documents.
     */
    contentDirectory: string;
    /**
     * The directory to store document histories.
     */
    historyDirectory: string;
    /**
     * The file extension to use for file.
     */
    extension?: string;
    /**
     * Should update times be marked at the time of edit.
     */
    updateTimestamps?: boolean;
    /**
     * Should history entries be created.
     */
    useHistory?: boolean;
    /**
     * Should we cache files in memory?
     */
    useCache?: boolean;
    /**
     * The spaces parameter for JSON stringifying documents.
     */
    spacesDocument?: number;
    /**
     * The spaces parameter for JSON stringifying history.
     */
    spacesHistory?: number;
    /**
     * The events to listen for.
     */
    events?: Record<string, string[]>;
};
/**
 * @typedef UttoriDocument The document object we store, with only the minimum methods we access listed.
 * @property {string} [slug] The unique identifier for the document.
 * @property {number|Date} [createDate] The creation date of the document.
 * @property {number|Date} [updateDate] The last date the document was updated.
 */
/**
 * @typedef StorageProviderConfig The configuration object for the StorageProvider.
 * @property {string} contentDirectory The directory to store documents.
 * @property {string} historyDirectory The directory to store document histories.
 * @property {string} [extension] The file extension to use for file.
 * @property {boolean} [updateTimestamps] Should update times be marked at the time of edit.
 * @property {boolean} [useHistory] Should history entries be created.
 * @property {boolean} [useCache] Should we cache files in memory?
 * @property {number} [spacesDocument] The spaces parameter for JSON stringifying documents.
 * @property {number} [spacesHistory] The spaces parameter for JSON stringifying history.
 * @property {Record<string, string[]>} [events] The events to listen for.
 */
/**
 * Storage for Uttori documents using JSON files stored on the local file system.
 * @property {StorageProviderConfig} config The configuration object.
 * @property {Record<string, UttoriDocument>} documents The collection of documents where the slug is the key and the value is the document.
 * @example <caption>Init StorageProvider</caption>
 * const storageProvider = new StorageProvider({ contentDirectory: 'content', historyDirectory: 'history', spacesDocument: 2 });
 * @class
 */
declare class StorageProvider {
    /**
     * Ensure a directory exists, and if not create it.
     * @param {string} directory The directory to ensure exists.
     */
    static ensureDirectory(directory: string): Promise<void>;
    /**
     * Creates an instance of StorageProvider.
     * @param {StorageProviderConfig} config - A configuration object.
     * @class
     */
    constructor(config: StorageProviderConfig);
    config: {
        /**
         * The directory to store documents.
         */
        contentDirectory: string;
        /**
         * The directory to store document histories.
         */
        historyDirectory: string;
        /**
         * The file extension to use for file.
         */
        extension: string;
        /**
         * Should update times be marked at the time of edit.
         */
        updateTimestamps: boolean;
        /**
         * Should history entries be created.
         */
        useHistory: boolean;
        /**
         * Should we cache files in memory?
         */
        useCache: boolean;
        /**
         * The spaces parameter for JSON stringifying documents.
         */
        spacesDocument: number;
        /**
         * The spaces parameter for JSON stringifying history.
         */
        spacesHistory: number;
        /**
         * The events to listen for.
         */
        events?: Record<string, string[]>;
    };
    refresh: boolean;
    /** @type {Record<string, UttoriDocument>} The collection of documents where the slug is the key and the value is the document. */
    documents: Record<string, UttoriDocument>;
    /**
     * Returns all documents.
     * @returns {Promise<Record<string, UttoriDocument>>} All documents.
     * @example
     * storageProvider.all();
     * ➜ { first-document: { slug: 'first-document', ... }, ...}
     */
    all: () => Promise<Record<string, UttoriDocument>>;
    /**
     * Returns all documents matching a given query.
     * @async
     * @param {string} query - The conditions on which documents should be returned.
     * @returns {Promise<UttoriDocument[]|number>} Promise object represents all matching documents.
     */
    getQuery: (query: string) => Promise<UttoriDocument[] | number>;
    /**
     * Returns a document for a given slug.
     * @async
     * @param {string} slug - The slug of the document to be returned.
     * @returns {Promise<UttoriDocument|undefined>} Promise object represents the returned UttoriDocument.
     */
    get: (slug: string) => Promise<UttoriDocument | undefined>;
    /**
     * Saves a document to the file system.
     * @async
     * @param {UttoriDocument} document - The document to be added to the collection.
     */
    add: (document: UttoriDocument) => Promise<void>;
    /**
     * Updates a document and saves to the file system.
     * @async
     * @private
     * @param {UttoriDocument} document - The document to be updated in the collection.
     * @param {string} originalSlug - The original slug identifying the document, or the slug if it has not changed.
     */
    private updateValid;
    /**
     * Updates a document and figures out how to save to the file system.
     * @async
     * @param {object} params - The params object.
     * @param {UttoriDocument} params.document - The document to be updated in the collection.
     * @param {string} params.originalSlug - The original slug identifying the document, or the slug if it has not changed.
     */
    update: ({ document, originalSlug }: {
        document: UttoriDocument;
        originalSlug: string;
    }) => Promise<void>;
    /**
     * Removes a document from the file system.
     * @async
     * @param {string} slug - The slug identifying the document.
     */
    delete: (slug: string) => Promise<void>;
    /**
     * Returns the history of edits for a given slug.
     * @async
     * @param {string} slug - The slug of the document to get history for.
     * @returns {Promise<string[]>} Promise object represents the returned history.
     */
    getHistory: (slug: string) => Promise<string[]>;
    /**
     * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
     * @async
     * @param {object} params - The params object.
     * @param {string} params.slug - The slug of the document to be returned.
     * @param {string|number} params.revision - The unix timestamp of the history to be returned.
     * @returns {Promise<UttoriDocument|undefined>} Promise object represents the returned revision of the document.
     */
    getRevision: ({ slug, revision }: {
        slug: string;
        revision: string | number;
    }) => Promise<UttoriDocument | undefined>;
    /**
     * Updates History for a given slug, renaming the store file and history directory as needed.
     * @async
     * @param {string} slug - The slug of the document to update history for.
     * @param {string} content - The revision of the document to be saved.
     * @param {string} [originalSlug] - The original slug identifying the document, or the slug if it has not changed.
     */
    updateHistory: (slug: string, content: string, originalSlug?: string) => Promise<void>;
}
//# sourceMappingURL=storage-provider.d.ts.map