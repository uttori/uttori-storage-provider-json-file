const debug = require('debug')('Uttori.StorageProvider.JSON.QueryTools');
const R = require('ramda');
const { parseQueryToRamda, validateQuery } = require('uttori-utilities');

const process = (query, objects) => {
  debug('Processing Query:', query);
  // Filter
  const { where, order, limit } = validateQuery(query);
  debug('Found where, order, limit:', where, order, limit);
  const whereFunctions = parseQueryToRamda(where);
  const filtered = R.filter(whereFunctions)(objects);
  // Sort / Order
  let sorted;
  if (order[0].prop === 'RANDOM') {
    sorted = R.sort(() => Math.random() - Math.random(), filtered);
  } else {
    sorted = R.sortWith(
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
  return R.take(limit, sorted);
};

module.exports = {
  process,
};
