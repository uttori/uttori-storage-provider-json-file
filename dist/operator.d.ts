export default Operator;
/**
 * A wrapper class around operators to distinguish them from regular tokens.
 * @property {*} value - The value.
 * @property {*} type - The type of operator.
 * @property {number} precedence - Priority to sort the operators with.
 * @example <caption>Init TokenizeThis</caption>
 * const op = new Operator(value, type, precedence);
 * @class
 */
declare class Operator {
    /**
     * Returns a type for a given string.
     * @param {string} type - The type to lookup.
     * @returns {*} Either number of parameters or Unary Minus Symbol.
     * @static
     */
    static type(type: string): any;
    /**
     * Creates an instance of Operator.
     * @param {*} value - The value.
     * @param {*} type - The type of operator.
     * @param {number} precedence - Priority to sort the operators with.
     * @class
     */
    constructor(value: any, type: any, precedence: number);
    value: any;
    type: any;
    precedence: number;
    /**
     * Returns the value as is for JSON.
     * @returns {*} value.
     */
    toJSON(): any;
    /**
     * Returns the value as its string format.
     * @returns {string} String representation of value.
     */
    toString(): string;
}
//# sourceMappingURL=operator.d.ts.map