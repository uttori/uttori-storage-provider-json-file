export default TokenizeThis;
/**
 * Takes in the config, processes it, and creates tokenizer instances based on that config.
 * @property {object} config - The configuration object.
 * @property {boolean} convertLiterals - If literals should be converted or not, ie 'true' -> true.
 * @property {string} escapeCharacter - Character to use as an escape in strings.
 * @property {object} tokenizeList - Holds the list of tokenizable substrings.
 * @property {object} tokenizeMap - Holds an easy lookup map of tokenizable substrings.
 * @property {object} matchList - Holds the list of quotes to match explicit strings with.
 * @property {object} matchMap - Holds an easy lookup map of quotes to match explicit strings with.
 * @property {object} delimiterList - Holds the list of delimiters.
 * @property {object} delimiterMap - Holds an easy lookup map of delimiters.
 * @example <caption>Init TokenizeThis</caption>
 * const tokenizer = new TokenizeThis(config.tokenizer);
 * this.tokenizer.tokenize('(sql)', (token, surroundedBy) => { ... });
 * @class
 */
declare class TokenizeThis {
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
    /**
     * Creates a Tokenizer, then immediately calls "tokenize".
     * @param {string} input - The string to scan for tokens.
     * @param {Function} forEachToken - Function to run over each token.
     * @returns {*} The new Tokenizer instance after being tokenized.
     */
    tokenize(input: string, forEachToken: Function): any;
}
//# sourceMappingURL=tokenizer.d.ts.map