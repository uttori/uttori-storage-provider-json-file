export default parseQueryToFilterFunctions;
/**
 * Using default SQL tree output, iterate over that to convert to items to be checked group by group (AND, OR), prop by prop to filter functions.
 * Both `+` and `-` should be done in a pre-parser step or before the query is constructed, or after results are returned.
 * @param {import('../dist/custom').SqlWhereParserAst} ast The parsed output of SqlWhereParser to be filtered.
 * @returns {(item: any) => boolean} The top level filter function.
 * @example <caption>parseQueryToFilterFunctions(ast)</caption>
 * const whereFunctions = parseQueryToFilterFunctions(ast);
 * return objects.filter(whereFunctions);
 * ➜ [{ ... }, { ... }, ...]
 */
declare function parseQueryToFilterFunctions(ast: any): (item: any) => boolean;
//# sourceMappingURL=parse-query-filter-functions.d.ts.map