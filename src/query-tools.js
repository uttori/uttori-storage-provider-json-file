import * as R from 'ramda';
import parseQueryToRamda from './parse-query-to-ramda.js';
import validateQuery from './validate-query.js';
import fyShuffle from './fisher-yates-shuffle.js';

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.StorageProvider.JSON.QueryTools'); } catch {}

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
const processQuery = (query, objects) => {
  debug('Processing Query:', query);
  // Filter
  const { fields, where, order, limit } = validateQuery(query);
  debug('Found fields:', fields);
  debug('Found where:', where);
  debug('Found order:', order);
  debug('Found limit:', limit);
  const whereFunctions = parseQueryToRamda(where);
  const filtered = R.filter(whereFunctions)(objects);

  // Short circuit when we only want the counts.
  if (fields.includes('COUNT(*)')) {
    return filtered.length;
  }

  // Sort / Order
  let output;
  if (order[0].prop === 'RANDOM') {
    output = fyShuffle(filtered);
  } else {
    output = R.sortWith(
      order.map((value) => {
        const sorter = value.sort === 'ASC' ? R.ascend : R.descend;
        return sorter(R.prop(value.prop));
      }),
    )(filtered);
  }

  // Limit
  if (limit > 0) {
    output = R.take(limit, output);
  }

  // Select
  if (!fields.includes('*')) {
    output = R.lift(R.pickAll(fields))(output);
  }

  return output;
};

export default processQuery;
