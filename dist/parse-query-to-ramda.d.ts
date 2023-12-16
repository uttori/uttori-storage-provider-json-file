export default parseQueryToRamda;
/**
 * Using default SQL tree output, iterate over that to convert to items to be checked group by group (AND, OR), prop by prop to filter functions.
 * Both `+` and `-` should be done in a pre-parser step or before the query is constructed, or after results are returned.
 * @param {object} ast The parsed output of SqlWhereParser to be filtered.
 * @returns {Array} The collected set of Ramda filter functions.
 * @example <caption>parseQueryToRamda(ast)</caption>
 * const filters = parseQueryToRamda(ast);
 * return R.filter(filters)(docs);
 * ➜ [{ ... }, { ... }, ...]
 */
declare function parseQueryToRamda(ast: object): any[];
//# sourceMappingURL=parse-query-to-ramda.d.ts.map