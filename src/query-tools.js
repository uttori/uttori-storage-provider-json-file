/* eslint-disable unicorn/no-fn-reference-in-iterator */
const debug = require('debug')('Uttori.StorageProvider.JSON.QueryTools');
const R = require('ramda');
const { parseQueryToRamda, validateQuery, fyShuffle } = require('uttori-utilities');

/**
 * Processes a query string.
 *
 * @param {string} query - The SQL-like query to parse.
 * @param {object[]} objects - An array of object to search within.
 * @returns {object[]} Returns an array of all matched documents.
 * @example
 * processQuery('SELECT name FROM table WHERE age > 1 ORDER BY RANDOM LIMIT 3', [{ ... }, ...]);
 * ➜ [{ ... }, ...]
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

  // const sorter = R.cond([
  //   [
  //     R.pathEq(['sort'], 'ASC'),
  //     value =>
  //       R.ascend(
  //         R.prop(R.path(['prop'], value))
  //       )
  //   ],
  //   [
  //     R.pathEq(['sort'], 'DESC'),
  //     value =>
  //       R.descend(
  //         R.prop(R.path(['prop'], value))
  //       )
  //   ],
  //   [
  //     R.pathEq(['sort'], 'RANDOM'),
  //     value => R.comparator(() => Math.random() - Math.random())
  //   ],
  // ])({ prop: 'age', sort: 'RANDOM' });
  // R.sortWith([sorter])(docs);

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

module.exports = {
  processQuery,
};
