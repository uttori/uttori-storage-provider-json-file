declare module "@uttori/storage-provider-json-file";

declare module "query-tools" {
    export function processQuery(query: string, objects: object[]): object[] | number;
}
declare module "storage-provider" {
    export = StorageProvider;
    class StorageProvider {
        constructor(config: {
            content_directory: string;
            history_directory: string;
            extension?: string;
            update_timestamps?: boolean;
            use_history?: boolean;
            use_cache?: boolean;
            spaces_document?: number;
            spaces_history?: number;
        });
        config: {
            content_directory: string;
            history_directory: string;
            extension: string;
            update_timestamps: boolean;
            use_history: boolean;
            use_cache: boolean;
            spaces_document: number;
            spaces_history: number;
        };
        refresh: boolean;
        documents: {};
        all(): object;
        getQuery(query: string): Promise<UttoriDocument[] | number>;
        get(slug: string): Promise<UttoriDocument | undefined>;
        getHistory(slug: string): Promise<string[]>;
        getRevision({ slug, revision }: {
            slug: string;
            revision: string | number;
        }): Promise<UttoriDocument | undefined>;
        add(document: UttoriDocument): Promise<void>;
        private updateValid;
        update({ document, originalSlug }: {
            document: UttoriDocument;
            originalSlug: string;
        }): Promise<void>;
        delete(slug: string): Promise<void>;
        updateHistory(slug: string, content: string, originalSlug?: string): Promise<void>;
    }
    namespace StorageProvider {
        export { UttoriDocument };
    }
    type UttoriDocument = {
        slug: string;
        createDate?: number | Date;
        updateDate?: number | Date;
    };
}
declare module "plugin" {
    export = Plugin;
    class Plugin {
        static get configKey(): string;
        static defaultConfig(): object;
        static register(context: {
            hooks: {
                on: Function;
            };
            config: {
                events: object;
            };
        }): void;
    }
}
declare module "index" {
    export const Plugin: typeof import("plugin");
    export const StorageProvider: typeof import("storage-provider");
}
