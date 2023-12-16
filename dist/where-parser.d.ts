export default SqlWhereParser;
/**
 * Parses the WHERE portion of an SQL-like string into an abstract syntax tree.
 * The tree is object-based, where each key is the operator, and its value is an array of the operands.
 * The number of operands depends on if the operation is defined as unary, binary, or ternary in the config.
 * @property {object} config - The configuration object.
 * @property {TokenizeThis} tokenizer - The tokenizer instance.
 * @property {object} operators - The operators from config converted to Operator objects.
 * @example <caption>Init SqlWhereParser</caption>
 * const parser = new SqlWhereParser();
 * const parsed = parser.parse(sql);
 * @class
 */
declare class SqlWhereParser {
    /**
     * A default fallback evaluator for the parse function.
     * @param {string|symbol} operatorValue - The operator to evaluate.
     * @param {Array} operands - The list of operands.
     * @returns {Array|object} Either comma seperated values concated, or an object with the key of the operator and operands as the value.
     */
    static defaultEvaluator(operatorValue: string | symbol, operands: any[]): any[] | object;
    /**
     * Creates an instance of SqlWhereParser.
     * @param {object} [config] - A configuration object.
     * @param {object[]} [config.operators] - A collection of operators in precedence order.
     * @param {object} [config.tokenizer] - A Tokenizer config.
     * @param {string[]} [config.tokenizer.shouldTokenize] - A collection of items to tokenize.
     * @param {string[]} [config.tokenizer.shouldMatch] - A collection of items to consider as wrapping tokens.
     * @param {string[]} [config.tokenizer.shouldDelimitBy] - A collection of items to consider as whitespace to delimit by.
     * @param {boolean} [config.wrapQuery] - Wraps queries in surround parentheses when true.
     * @class
     */
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
    /**
     * Parse a SQL statement with an evaluator function. Uses an implementation of the Shunting-Yard Algorithm.
     * @param {string} sql - Query string to process.
     * @param {Function} [evaluator] - Function to evaluate operators.
     * @returns {object} - The parsed query tree.
     * @see {@link https://wcipeg.com/wiki/Shunting_yard_algorithm|Shunting-Yard_Algorithm (P3G)}
     * @see {@link https://en.wikipedia.org/wiki/Shunting-yard_algorithm|Shunting-Yard_Algorithm (Wikipedia)}
     */
    parse(sql: string, evaluator?: Function): object;
    /**
     * Returns the precedence order from two values.
     * @param {string|symbol} operatorValue1 - First operator.
     * @param {string|symbol} operatorValue2 - Second operator.
     * @returns {boolean} That operatorValue2 precedence is less than or equal to the precedence of operatorValue1.
     */
    operatorPrecedenceFromValues(operatorValue1: string | symbol, operatorValue2: string | symbol): boolean;
    /**
     * Returns the operator from the string or Symbol provided.
     * @param {string|symbol} operatorValue - The operator.
     * @returns {*} The operator from the list of operators.
     */
    getOperator(operatorValue: string | symbol): any;
}
import TokenizeThis from './tokenizer.js';
//# sourceMappingURL=where-parser.d.ts.map