import * as R from 'ramda';

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.parseQueryToRamda'); } catch {}

/**
 * Pretty format a value as JSON or a joined array.
 * @param {*} value The value to be converted to a nice string.
 * @returns {string} The value in a cleaner string format.
 * @example <caption>parseQueryToRamda(ast)</caption>
 * debugHelper(['one','two']);
 * ➜ '["one", "two"]'
 */
const debugHelper = (value) => {
  if (Array.isArray(value)) {
    return `["${value.join('","')}"]`;
  }
  return JSON.stringify(value);
};

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
const parseQueryToRamda = (ast) => {
  debug('AST:', JSON.stringify(ast, null, 2));
  const operation = [];
  Object.keys(ast).forEach((key) => {
    // Construct filters for each item or group of items.
    if (key === 'AND' || key === 'OR') {
      const sub_operation = [];
      // Loop over sub rules and parse them.
      ast[key].forEach((sub_query) => {
        sub_operation.push(parseQueryToRamda(sub_query));
      });
      const pass = key === 'AND' ? R.allPass : R.anyPass;
      operation.push(pass(sub_operation));
    } else {
      const operands = ast[key];
      switch (key) {
        case 'BETWEEN': {
          debug(`R.compose(R.allPass([R.gte(R.__, ${operands[1]}), R.lte(R.__, ${operands[2]})]), R.prop('${operands[0]}'))`);
          operation.push(R.compose(R.allPass([R.gte(R.__, operands[1]), R.lte(R.__, operands[2])]), R.prop(operands[0])));
          break;
        }
        case 'IN': {
          // NOTE: Always wrap the input value in an array if not already an array so we can support single items & arrays.
          let value = operands[1];
          if (!Array.isArray(value)) {
            value = [value];
          }
          debug(`R.compose(\n  R.complement(R.isEmpty),\n  R.intersection(${debugHelper(value)}),\n  R.insert(0, R.__, []),\n  R.prop(${debugHelper(operands[0])})\n)`);
          operation.push(R.compose(R.complement(R.isEmpty), R.intersection(value), R.insert(0, R.__, []), R.prop(operands[0])));
          break;
        }
        case 'NOT_IN': {
          // NOTE: Always wrap the input value in an array if not already an array so we can support single items & arrays.
          let value = operands[1];
          if (!Array.isArray(value)) {
            value = [value];
          }
          debug(`R.complement(R.compose(R.anyPass([R.isEmpty, R.isNil]), R.prop(${debugHelper(operands[0])})))`);
          debug(`R.compose(\n  R.isEmpty,\n  R.intersection(${debugHelper(value)}),\n  R.insert(0, R.__, []),\n  R.prop(${debugHelper(operands[0])})\n)`);
          operation.push(R.compose(R.complement(R.anyPass([R.isEmpty, R.isNil])), R.prop(operands[0])));
          operation.push(R.compose(R.isEmpty, R.intersection(value), R.insert(0, R.__, []), R.prop(operands[0])));
          break;
        }
        case 'EXCLUDES': {
          // NOTE: Always wrap the input value in an array if not already an array so we can support single items & arrays.
          let value = operands[1];
          if (!Array.isArray(value)) {
            value = [value];
          }
          debug(`R.compose(\n  R.isEmpty,\n  R.intersection(${debugHelper(value)}),\n  R.unless(R.is(Array), R.of(Array)),\n  R.propOr("", ${debugHelper(operands[0])})\n)`);
          operation.push(R.compose(R.isEmpty, R.intersection(value), R.unless(R.is(Array), R.of(Array)), R.propOr('', operands[0])));
          break;
        }
        case 'INCLUDES': {
          // NOTE: Always wrap the input value in an array if not already an array so we can support single items & arrays.
          let value = operands[1];
          if (!Array.isArray(value)) {
            value = [value];
          }
          debug(`R.compose(\n  R.complement(R.isEmpty),\n  R.intersection(${debugHelper(value)}),\n  R.unless(R.is(Array), R.of(Array)),\n  R.propOr("", ${debugHelper(operands[0])})\n)`);
          operation.push(R.compose(R.complement(R.isEmpty), R.intersection(value), R.unless(R.is(Array), R.of(Array)), R.propOr('', operands[0])));
          break;
        }
        case 'IS_NULL': {
          debug(`R.compose(R.anyPass([R.isEmpty, R.isNil]), R.prop(${debugHelper(operands[0])}))`);
          operation.push(R.compose(R.anyPass([R.isEmpty, R.isNil]), R.prop(operands[0])));
          break;
        }
        case 'IS_NOT_NULL': {
          debug(`R.complement(R.compose(R.anyPass([R.isEmpty, R.isNil]), R.prop(${debugHelper(operands[0])})))`);
          operation.push(R.compose(R.complement(R.anyPass([R.isEmpty, R.isNil])), R.prop(operands[0])));
          break;
        }
        case 'LIKE': {
          debug(`R.complement(R.compose(R.anyPass([R.isEmpty, R.isNil]), R.prop(${debugHelper(operands[0])})))`);
          debug(`R.compose(R.includes('${operands[1]}'), R.propOr('', ${debugHelper(operands[0])}))`);
          operation.push(R.compose(R.complement(R.anyPass([R.isEmpty, R.isNil])), R.prop(operands[0])));
          operation.push(R.compose(R.includes(operands[1]), R.propOr('', operands[0])));
          break;
        }

        case 'IS':
        case '=': {
          debug(`R.propEq('${operands[1]}', ${operands[0]})`);
          operation.push(R.propEq(operands[1], operands[0]));
          break;
        }
        case '<': {
          debug(`R.lt(R.__, R.prop('${operands[0]}'), ${operands[1]})`);
          operation.push(R.compose(R.lt(R.__, operands[1]), R.prop(operands[0])));
          break;
        }
        case '>': {
          debug(`R.gt(R.__, R.prop('${operands[0]}'), ${operands[1]})`);
          operation.push(R.compose(R.gt(R.__, operands[1]), R.prop(operands[0])));
          break;
        }
        case '>=': {
          debug(`R.gte(R.__, R.prop('${operands[0]}'), ${operands[1]})`);
          operation.push(R.compose(R.gte(R.__, operands[1]), R.prop(operands[0])));
          break;
        }
        case '<=': {
          debug(`R.lte(R.__, R.prop('${operands[0]}'), ${operands[1]})`);
          operation.push(R.compose(R.lte(R.__, operands[1]), R.prop(operands[0])));
          break;
        }
        case '!=': {
          debug(`R.complement(R.compose(R.anyPass([R.isEmpty, R.isNil]), R.prop(${debugHelper(operands[0])})))`);
          debug(`R.complement(R.propEq('${operands[1]}', ${operands[0]}))`);
          operation.push(R.compose(R.complement(R.anyPass([R.isEmpty, R.isNil])), R.prop(operands[0])));
          operation.push(R.complement(R.propEq(operands[1], operands[0])));
          break;
        }

        /* c8 ignore next 4 */
        default: {
          debug('Uncaught key:', key);
          break;
        }
      }
    }
  });

  return R.allPass(operation);
};

export default parseQueryToRamda;
