declare module '@uttori/storage-provider-json-file';

declare module 'fisher-yates-shuffle' {
    export default fyShuffle;
    function fyShuffle(array: any[]): any[];
}
declare module 'parse-query-to-ramda' {
    export default parseQueryToRamda;
    function parseQueryToRamda(ast: object): any[];
}
declare module 'operator' {
    export default Operator;
    class Operator {
      static type(type: string): any;

      constructor(value: any, type: any, precedence: number);

      value: any;

      type: any;

      precedence: number;

      toJSON(): any;

      toString(): string;
    }
}
declare module 'tokenizer' {
    export default TokenizeThis;
    class TokenizeThis {
      constructor(config?: {});

      convertLiterals: any;

      escapeCharacter: any;

      tokenizeList: any[];

      tokenizeMap: {};

      matchList: any[];

      matchMap: {};

      delimiterList: any[];

      delimiterMap: {};

      config: {};

      tokenize(input: string, forEachToken: Function): any;
    }
}
declare module 'where-parser' {
    export default SqlWhereParser;
    class SqlWhereParser {
      static defaultEvaluator(operatorValue: string | symbol, operands: any[]): any[] | object;

      constructor(config?: {
            operators?: object[];
            tokenizer?: {
                shouldTokenize?: string[];
                shouldMatch?: string[];
                shouldDelimitBy?: string[];
            };
            wrapQuery?: boolean;
        });

      tokenizer: TokenizeThis;

      operators: {};

      config: {
            operators?: object[];
            tokenizer?: {
                shouldTokenize?: string[];
                shouldMatch?: string[];
                shouldDelimitBy?: string[];
            };
            wrapQuery?: boolean;
        };

      parse(sql: string, evaluator?: Function): object;

      operatorPrecedenceFromValues(operatorValue1: string | symbol, operatorValue2: string | symbol): boolean;

      getOperator(operatorValue: string | symbol): any;
    }
    import TokenizeThis from 'tokenizer';
}
declare module 'validate-query' {
    export default validateQuery;
    function validateQuery(query: string): object;
}
declare module 'query-tools' {
    export default processQuery;
    function processQuery(query: string, objects: object[]): object[] | number;
}
declare module 'storage-provider' {
    export default StorageProvider;
    export type UttoriDocument = {
        slug: string;
        createDate?: number | Date;
        updateDate?: number | Date;
    };
    class StorageProvider {
      static ensureDirectory(directory: string): Promise<void>;

      constructor(config: {
            contentDirectory: string;
            historyDirectory: string;
            extension?: string;
            updateTimestamps?: boolean;
            useHistory?: boolean;
            useCache?: boolean;
            spacesDocument?: number;
            spacesHistory?: number;
        });

      config: {
            contentDirectory: string;
            historyDirectory: string;
            extension: string;
            updateTimestamps: boolean;
            useHistory: boolean;
            useCache: boolean;
            spacesDocument: number;
            spacesHistory: number;
        };

      refresh: boolean;

      documents: {};

      all(): Promise<object>;

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
}
declare module 'plugin' {
    export default Plugin;
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
declare module 'index' {
    export default StorageProvider;
    export { default as StorageProvider } from './storage-provider.js';
    export { default as Plugin } from './plugin.js';
    import StorageProvider from 'storage-provider';
}
