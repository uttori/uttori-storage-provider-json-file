declare module "query-tools" {
    export function processQuery(query: string, objects: object[]): object[];
}
declare module "storage-provider" {
    export = StorageProvider;
    class StorageProvider {
        constructor(config: {
            content_directory: string;
            history_directory: string;
            extension: string;
            update_timestamps: boolean;
            use_history: boolean;
            spaces_document: number;
            spaces_history: number;
        });
        config: {
            content_directory: string;
            history_directory: string;
            extension: string;
            update_timestamps: boolean;
            use_history: boolean;
            spaces_document: number;
            spaces_history: number;
        };
        documents: any[];
        all(): Promise<any>;
        getQuery(query: string): Promise<any>;
        get(slug: string): Promise<any>;
        getHistory(slug: string): Promise<any>;
        getRevision({ slug, revision }: {
            slug: string;
            revision: number;
        }): Promise<any>;
        add(document: UttoriDocument): Promise<void>;
        private updateValid;
        update({ document, originalSlug }: {
            document: UttoriDocument;
            originalSlug: string;
        }): Promise<void>;
        delete(slug: string): Promise<void>;
        updateHistory(slug: string, content: string, originalSlug?: string): Promise<void>;
        refresh(): Promise<void>;
    }
    namespace StorageProvider {
        export { UttoriDocument };
    }
    type UttoriDocument = {
        slug: string;
        title?: string;
        createDate?: number | Date;
        updateDate?: number | Date;
        tags?: string[];
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
