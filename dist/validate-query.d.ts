export default validateQuery;
/**
 * Validates and parses a SQL-like query structure.
 * Pass in: fields, table, conditions, order, limit as a query string:
 * `SELECT {fields} FROM {table} WHERE {conditions} ORDER BY {order} LIMIT {limit}`
 * @param {string} query - The conditions on which a document should be returned.
 * @returns {object} The extrated and validated fields, table, where, order and limit properties.
 */
declare function validateQuery(query: string): object;
//# sourceMappingURL=validate-query.d.ts.map