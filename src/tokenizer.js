const MODE_NONE = 'modeNone';
const MODE_DEFAULT = 'modeDefault';
const MODE_MATCH = 'modeMatch';

/**
 * Parse a string into a token structure.
 * Create an instance of this class for each new string you wish to parse.
 * @property {TokenizeThis} factory - Holds the processed configuration.
 * @property {string} str - The string to tokenize.
 * @property {Function} forEachToken - The function to call for teach token.
 * @property {string} previousCharacter - The previous character consumed.
 * @property {string} toMatch - The current quote to match.
 * @property {string} currentToken - The current token being created.
 * @property {Array} modeStack - Keeps track of the current "mode" of tokenization. The tokenization rules are different depending if you are tokenizing an explicit string (surrounded by quotes), versus a non-explicit string (not surrounded by quotes).
 * @example <caption>Init Tokenizer</caption>
 * const tokenizerInstance = new Tokenizer(this, str, forEachToken);
 * return tokenizerInstance.tokenize();
 * @class
 */
class Tokenizer {
  /**
   * @param {TokenizeThis} factory - Holds the processed configuration.
   * @param {string} str - The string to tokenize.
   * @param {Function} forEachToken - The function to call for teach token.
   */
  constructor(factory, str, forEachToken) {
    this.factory = factory;
    this.str = str;
    this.forEachToken = forEachToken;
    this.previousCharacter = '';
    this.toMatch = '';
    this.currentToken = '';
    this.modeStack = [MODE_NONE];
  }

  /**
   * Get the current mode from the stack.
   * @returns {string} The current mode from the stack.
   */
  getCurrentMode() {
    return this.modeStack[this.modeStack.length - 1];
  }

  /**
   * Set the current mode on the stack.
   * @param {string} mode - The mode to set on the stack.
   * @returns {number} The size of the mode stack.
   */
  setCurrentMode(mode) {
    return this.modeStack.push(mode);
  }

  /**
   * Ends the current mode and removes it from the stack.
   * @returns {string} The last mode of the stack.
   */
  completeCurrentMode() {
    const currentMode = this.getCurrentMode();

    if (currentMode === MODE_DEFAULT) {
      this.pushDefaultModeTokenizables();
    }

    // Don't push out empty tokens, unless they were an explicit string, e.g. ""
    if ((currentMode === MODE_MATCH && this.currentToken === '') || this.currentToken !== '') {
      this.push(this.currentToken);
    }
    this.currentToken = '';

    return this.modeStack.pop();
  }

  /**
   * Parse the provided token.
   * @param {*} token The token to parse.
   */
  push(token) {
    let surroundedBy = '';

    if (this.factory.convertLiterals && this.getCurrentMode() !== MODE_MATCH) {
      // Convert the string version of literals into their literal types.
      switch (token.toLowerCase()) {
        case 'null':
          token = null;
          break;
        case 'true':
          token = true;
          break;
        case 'false':
          token = false;
          break;
        default:
          if (Number.isFinite(Number(token))) {
            token = Number(token);
          }
          break;
      }
    } else {
      // The purpose of also transmitting the surroundedBy quote is to inform whether or not
      // the token was an explicit string, versus a non-explicit string, e.g. "=" vs. =
      surroundedBy = this.toMatch;
    }

    /* c8 ignore next */
    if (this.forEachToken) {
      this.forEachToken(token, surroundedBy);
    }
  }

  /**
   * Process the string.
   */
  tokenize() {
    let index = 0;

    while (index < this.str.length) {
      this.consume(this.str.charAt(index++));
    }

    while (this.getCurrentMode() !== MODE_NONE) {
      this.completeCurrentMode();
    }
  }

  /**
   * Adds a character with the current mode.
   * @param {string} character - The character to process.
   */
  consume(character) {
    this[this.getCurrentMode()](character);
    this.previousCharacter = character;
  }

  /**
   * Changs the current mode depending on the character.
   * @param {string} character - The character to consider.
   */
  [MODE_NONE](character) {
    if (!this.factory.matchMap[character]) {
      this.setCurrentMode(MODE_DEFAULT);
      this.consume(character);
      return;
    }

    this.setCurrentMode(MODE_MATCH);
    this.toMatch = character;
  }

  /**
   * Checks the token for delimiter or quotes, else continue building token.
   * @param {string} character - The character to consider.
   * @returns {string} The current token.
   */
  [MODE_DEFAULT](character) {
    // If we encounter a delimiter, its time to push out the current token.
    if (this.factory.delimiterMap[character]) {
      return this.completeCurrentMode();
    }

    // If we encounter a quote, only push out the current token if there's a sub-token directly before it.
    if (this.factory.matchMap[character]) {
      let tokenizeIndex = 0;

      while (tokenizeIndex < this.factory.tokenizeList.length) {
        if (this.currentToken.endsWith(this.factory.tokenizeList[tokenizeIndex++])) {
          this.completeCurrentMode();
          this.consume(character);
          // eslint-disable-next-line consistent-return
          return;
        }
      }
    }

    this.currentToken += character;

    return this.currentToken;
  }

  /**
   * Parse out potential tokenizable substrings out of the current token.
   */
  pushDefaultModeTokenizables() {
    let tokenizeIndex = 0;
    let lowestIndexOfTokenize = Infinity;
    let toTokenize = null;

    // Iterate through the list of tokenizable substrings.
    while (this.currentToken && tokenizeIndex < this.factory.tokenizeList.length) {
      const tokenize = this.factory.tokenizeList[tokenizeIndex++];
      const indexOfTokenize = this.currentToken.indexOf(tokenize);

      // Find the substring closest to the beginning of the current token.
      if (indexOfTokenize !== -1 && indexOfTokenize < lowestIndexOfTokenize) {
        lowestIndexOfTokenize = indexOfTokenize;
        toTokenize = tokenize;
      }
    }

    // No substrings to tokenize. You're done.
    if (!toTokenize) {
      return;
    }

    // A substring was found, but not at the very beginning of the string, e.g. A=B, where "=" is the substring.
    // This will push out "A" first.
    if (lowestIndexOfTokenize > 0) {
      this.push(this.currentToken.slice(0, lowestIndexOfTokenize));
    }

    // Push out the substring, then modify the current token to be everything past that substring.
    // Recursively call this function again until there are no more substrings to tokenize.
    /* c8 ignore else */
    if (lowestIndexOfTokenize !== -1) {
      this.push(toTokenize);
      this.currentToken = this.currentToken.slice(lowestIndexOfTokenize + toTokenize.length);
      this.pushDefaultModeTokenizables();
    }
  }

  /**
   * Checks for a completed match between characters.
   * @param {string} character - The character to match.
   * @returns {string} - The current token.
   */
  [MODE_MATCH](character) {
    if (character === this.toMatch) {
      if (this.previousCharacter !== this.factory.escapeCharacter) {
        return this.completeCurrentMode();
      }
      this.currentToken = this.currentToken.slice(0, this.currentToken.length - 1);
    }

    this.currentToken += character;

    return this.currentToken;
  }
}

/**
 * Sorts the tokenizable substrings by their length DESC.
 * @param {string} a - Substring A
 * @param {string} b - Substring B
 * @returns {number} -1 if A is longer than B, 1 if B is longer than A, else 0.
 */
const sortTokenizableSubstrings = (a, b) => {
  if (a.length > b.length) {
    return -1;
  }
  if (a.length < b.length) {
    return 1;
  }
  return 0;
};

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
class TokenizeThis {
  constructor(config = {}) {
    config = {
      shouldTokenize: ['(', ')', ',', '*', '/', '%', '+', '-', '=', '!=', '!', '<', '>', '<=', '>=', '^'],
      shouldMatch: ['"', "'", '`'],
      shouldDelimitBy: [' ', '\n', '\r', '\t'],
      convertLiterals: true,
      escapeCharacter: '\\',
      ...config,
    };

    this.convertLiterals = config.convertLiterals;
    this.escapeCharacter = config.escapeCharacter;

    this.tokenizeList = [];
    this.tokenizeMap = {};
    this.matchList = [];
    this.matchMap = {};
    this.delimiterList = [];
    this.delimiterMap = {};

    // Sorts the tokenizable substrings based on their length, such that "<=" will get matched before "<" does.
    config.shouldTokenize.sort(sortTokenizableSubstrings).forEach((token) => {
      /* c8 ignore else */
      if (!this.tokenizeMap[token]) {
        this.tokenizeList.push(token);
        this.tokenizeMap[token] = token;
      }
    });

    config.shouldMatch.forEach((match) => {
      /* c8 ignore else */
      if (!this.matchMap[match]) {
        this.matchList.push(match);
        this.matchMap[match] = match;
      }
    });

    config.shouldDelimitBy.forEach((delimiter) => {
      /* c8 ignore else */
      if (!this.delimiterMap[delimiter]) {
        this.delimiterList.push(delimiter);
        this.delimiterMap[delimiter] = delimiter;
      }
    });

    this.config = config;
  }

  /**
   * Creates a Tokenizer, then immediately calls "tokenize".
   * @param {string} input - The string to scan for tokens.
   * @param {Function} forEachToken - Function to run over each token.
   * @returns {*} The new Tokenizer instance after being tokenized.
   */
  tokenize(input, forEachToken) {
    const tokenizerInstance = new Tokenizer(this, input, forEachToken);
    return tokenizerInstance.tokenize();
  }
}

export default TokenizeThis;
