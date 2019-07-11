const debug = require('debug')('Uttori.StorageProvider.JSON.QueryTools');
const R = require('ramda');
const SqlWhereParser = require('../../uttori-utilities/src/where-parser');
const parseQueryToRamda = require('./parse-query-to-ramda');

/**
 * Validates and parses the SQL-like query structure.
 * @async
 * @param {string} query - The conditions on which a document should be returned.
 * @returns {object} The extrated and validated fields, table, where, order and limit properties.
 */
const validateQuery = (query) => {
  debug('validateQuery:', query);
  let error;
  const pieces = query.split(/(SELECT|FROM|WHERE|ORDER BY|LIMIT)/).map(piece => piece.trim());
  pieces.shift(); // Empty item is always first.

  // Pass in: fields, table, conditions, order, limit as a query string:
  // `SELECT {fields} FROM {table} WHERE {conditions} ORDER BY {order} LIMIT {limit}`
  // Split into parts:
  // - fields parser (N/A): 'SELECT'
  // - table parser (N/A): 'FROM'
  // - where parser (SqlWhereParser): 'WHERE'
  // - order parser (TBD): 'ORDER BY', 'ASC', 'DESC', 'RANDOM':
  // - limit parser (N/A): 'LIMIT'

  // Fields
  if (pieces[0] !== 'SELECT') {
    error = 'Invalid Query: Missing SELECT';
    debug(error, pieces[0]);
    throw new Error(error);
  }
  const fields = pieces[1].split(',').map(field => field.trim().replace(/["']/g, ''));
  if (fields.length === 0 || fields[0] === '') {
    error = 'Invalid Query: Invalid SELECT';
    debug(error, fields);
    throw new Error(error);
  }

  // Table
  if (pieces[2] !== 'FROM') {
    error = 'Invalid Query: Missing FROM';
    debug(error, pieces[2]);
    throw new Error(error);
  }
  const table = pieces[3].trim().replace(/["']/g, '');
  if (table === '') {
    error = 'Invalid Query: Invalid FROM';
    debug(error, table);
    throw new Error(error);
  }

  // Where
  if (pieces[4] !== 'WHERE') {
    error = 'Invalid Query: Missing WHERE';
    debug(error, pieces[4]);
    throw new Error(error);
  }
  const where_string = pieces[5].trim();
  let where;
  try {
    const parser = new SqlWhereParser();
    const ast = parser.parse(where_string);
    where = parseQueryToRamda(ast);
  } catch (e) {
    error = `Invalid Query: Invalid WHERE: ${e.message}`;
    debug(error, where_string);
    throw new Error(error);
  }

  // Order By / Sort
  if (pieces[6] !== 'ORDER BY') {
    error = 'Invalid Query: Missing ORDER BY';
    debug(error, pieces[6]);
    throw new Error(error);
  }
  const order = R.compose(
    R.map(R.fromPairs),
    R.map(R.zip(['prop', 'sort'])),
    R.map(R.split(' ')),
    R.map(R.trim),
    R.split(','),
    R.trim,
  )(pieces[7]);
  // TODO: Validate every sort piece is either ASC or DESC.
  if (pieces[7] === '' || (order.length === 1 && !order[0].sort && order[0].prop !== 'RANDOM')) {
    error = 'Invalid Query: Invalid ORDER BY';
    debug(error, pieces[7]);
    throw new Error(error);
  }

  // Limit
  if (pieces[8] !== 'LIMIT') {
    error = 'Invalid Query: Missing LIMIT';
    debug(error, pieces[8]);
    throw new Error(error);
  }
  const limit = parseInt(pieces[9].trim(), 10);
  if (Number.isNaN(limit)) {
    error = 'Invalid Query: Invalid LIMIT';
    debug(error, pieces[9]);
    throw new Error(error);
  }

  const output = {
    fields, table, where, order, limit,
  };
  debug('validateQuery:', output);
  return output;
};

const process = (query, objects) => {
  // Filter
  const { where, order, limit } = validateQuery(query);
  const filtered = R.filter(where)(objects);

  // Sort / Order
  let sorted;
  if (order[0].prop === 'RANDOM') {
    sorted = R.sort(() => Math.random() - Math.random(), filtered);
  } else {
    order.map((value) => {
      const sorter = value.sort === 'ASC' ? R.ascend : R.descend;
      return sorter(R.prop(value.prop));
    });
    sorted = R.sortWith(order)(filtered);
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
  return R.take(limit, sorted);
};

module.exports = {
  process,
  validateQuery,
};
