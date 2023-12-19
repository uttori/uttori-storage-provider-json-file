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
    convertLiterals?: boolean;
    /**
     * Character to use as an escape in strings.
     */
    escapeCharacter?: string;
};
/**
 * @typedef {object} TokenizeThisConfig
 * @property {string[]} [shouldTokenize] The list of tokenizable substrings.
 * @property {string[]} [shouldMatch] The list of quotes to match explicit strings with.
 * @property {string[]} [shouldDelimitBy] The list of delimiters.
 * @property {boolean} [convertLiterals] If literals should be converted or not, ie 'true' -> true.
 * @property {string} [escapeCharacter] Character to use as an escape in strings.
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
declare class TokenizeThis {
    /**
     * @param {TokenizeThisConfig} config The configuration object.
     */
    constructor(config: TokenizeThisConfig);
    convertLiterals: boolean;
    escapeCharacter: string;
    /** @type {string[]} Holds the list of tokenizable substrings. */
    tokenizeList: string[];
    tokenizeMap: {};
    matchList: any[];
    matchMap: {};
    delimiterList: any[];
    delimiterMap: {};
    config: TokenizeThisConfig;
    /**
     * Creates a Tokenizer, then immediately calls "tokenize".
     * @param {string} input - The string to scan for tokens.
     * @param {(token:string, surroundedBy:boolean) => void} forEachToken - Function to run over each token.
     * @returns {*} The new Tokenizer instance after being tokenized.
     */
    tokenize(input: string, forEachToken: (token: string, surroundedBy: boolean) => void): any;
}
//# sourceMappingURL=tokenizer.d.ts.map