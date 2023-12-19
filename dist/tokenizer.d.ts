/**
 * @typedef {object} TokenizeThisConfig
 * @property {string[]} [shouldTokenize] The list of tokenizable substrings.
 * @property {string[]} [shouldMatch] The list of quotes to match explicit strings with.
 * @property {string[]} [shouldDelimitBy] The list of delimiters.
 * @property {boolean} convertLiterals If literals should be converted or not, ie 'true' -> true.
 * @property {string} escapeCharacter Character to use as an escape in strings.
 */
/**
 * Takes in the config, processes it, and creates tokenizer instances based on that config.
 * @property {TokenizeThisConfig} config The configuration object.
 * @property {boolean} convertLiterals If literals should be converted or not, ie 'true' -> true.
 * @property {string} escapeCharacter Character to use as an escape in strings.
 * @property {string[]} tokenizeList Holds the list of tokenizable substrings.
 * @property {object} tokenizeMap Holds an easy lookup map of tokenizable substrings.
 * @property {object} matchList Holds the list of quotes to match explicit strings with.
 * @property {object} matchMap Holds an easy lookup map of quotes to match explicit strings with.
 * @property {object} delimiterList Holds the list of delimiters.
 * @property {object} delimiterMap Holds an easy lookup map of delimiters.
 * @example <caption>Init TokenizeThis</caption>
 * const tokenizer = new TokenizeThis(config.tokenizer);
 * this.tokenizer.tokenize('(sql)', (token, surroundedBy) => { ... });
 * @class
 */
export class TokenizeThis {
    /**
     * @param {TokenizeThisConfig} config The configuration object.
     */
    constructor(config: TokenizeThisConfig);
    /** @type {boolean} If literals should be converted or not, ie 'true' -> true. */
    convertLiterals: boolean;
    /** @type {string} Character to use as an escape in strings. */
    escapeCharacter: string;
    /** @type {string[]} Holds the list of tokenizable substrings. */
    tokenizeList: string[];
    /** @type {Map} Holds an easy lookup map of tokenizable substrings. */
    tokenizeMap: Map<any, any>;
    /** @type {Array} Holds the list of quotes to match explicit strings with. */
    matchList: any[];
    /** @type {Map} Holds an easy lookup map of quotes to match explicit strings with. */
    matchMap: Map<any, any>;
    /** @type {Array} Holds the list of delimiters. */
    delimiterList: any[];
    /** @type {Map} Holds an easy lookup map of delimiters. */
    delimiterMap: Map<any, any>;
    /** @type {TokenizeThisConfig} The current configuration. */
    config: TokenizeThisConfig;
    /**
     * Creates a Tokenizer, then immediately calls "tokenize".
     * @param {string} input - The string to scan for tokens.
     * @param {(token: (null | true | false | number | string), surroundedBy: string) => void} forEachToken - Function to run over each token.
     * @returns {*} The new Tokenizer instance after being tokenized.
     */
    tokenize(input: string, forEachToken: (token: (null | true | false | number | string), surroundedBy: string) => void): any;
}
export default TokenizeThis;
export type TokenizeThisConfig = {
    /**
     * The list of tokenizable substrings.
     */
    shouldTokenize?: string[];
    /**
     * The list of quotes to match explicit strings with.
     */
    shouldMatch?: string[];
    /**
     * The list of delimiters.
     */
    shouldDelimitBy?: string[];
    /**
     * If literals should be converted or not, ie 'true' -> true.
     */
    convertLiterals: boolean;
    /**
     * Character to use as an escape in strings.
     */
    escapeCharacter: string;
};
//# sourceMappingURL=tokenizer.d.ts.map