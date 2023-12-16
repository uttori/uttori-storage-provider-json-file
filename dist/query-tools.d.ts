export default processQuery;
/**
 * Processes a query string.
 * @param {string} query - The SQL-like query to parse.
 * @param {object[]} objects - An array of object to search within.
 * @returns {object[]|number} Returns an array of all matched documents, or a count.
 * @example
 * ```js
 * processQuery('SELECT name FROM table WHERE age > 1 ORDER BY RANDOM LIMIT 3', [{ ... }, ...]);
 * ➜ [{ ... }, ...]
 * ```
 */
declare function processQuery(query: string, objects: object[]): object[] | number;
//# sourceMappingURL=query-tools.d.ts.map