const test = require('ava');
const { validateQuery } = require('../src/query-tools');

const query = 'SELECT field_a, field_b FROM table WHERE field_a IS "test" ORDER BY field_b DESC LIMIT 1';

// SELECT
test('validateQuery: throws an error when missing SELECT', (t) => {
  t.throws(() => {
    validateQuery('ZELECT');
  }, 'Invalid Query: Missing SELECT');
});

test('validateQuery: throws an error when SELECT is invalid', (t) => {
  t.throws(() => {
    validateQuery('SELECT FROM');
  }, 'Invalid Query: Invalid SELECT');

  t.throws(() => {
    validateQuery('SELECT  FROM');
  }, 'Invalid Query: Invalid SELECT');
});

test('validateQuery: can extract fields from a SELECT statement', (t) => {
  t.deepEqual(validateQuery(query).fields, ['field_a', 'field_b']);
});

// FROM
test('validateQuery: throws an error when missing FROM', (t) => {
  t.throws(() => {
    validateQuery('SELECT field FORM table');
  }, 'Invalid Query: Missing FROM');
});

test('validateQuery: throws an error when FROM is invalid', (t) => {
  t.throws(() => {
    validateQuery('SELECT * FROM WHERE');
  }, 'Invalid Query: Invalid FROM');

  t.throws(() => {
    validateQuery('SELECT field FROM   WHERE');
  }, 'Invalid Query: Invalid FROM');
});

test('validateQuery: can extract table from a FROM statement', (t) => {
  t.is(validateQuery(query).table, 'table');
});

// WHERE
test('validateQuery: throws an error when missing WHERE', (t) => {
  t.throws(() => {
    validateQuery('SELECT field FROM table ORDER BY field ASC');
  }, 'Invalid Query: Missing WHERE');
});

test('validateQuery: throws an error when WHERE is invalid', (t) => {
  t.throws(() => {
    validateQuery('SELECT * FROM table WHERE f af8798&(*YHOF&');
  }, 'Invalid Query: Invalid WHERE: Unmatched parenthesis.');
});

// ORDER BY
test('validateQuery: throws an error when missing ORDER BY', (t) => {
  t.throws(() => {
    validateQuery('SELECT field FROM table WHERE field IS "test"');
  }, 'Invalid Query: Missing ORDER BY');
});

test('validateQuery: throws an error when ORDER BY is invalid', (t) => {
  t.throws(() => {
    validateQuery('SELECT * FROM table WHERE field IS 7 ORDER BY');
  }, 'Invalid Query: Invalid ORDER BY');

  t.throws(() => {
    validateQuery('SELECT * FROM table WHERE field IS 7 ORDER BY field LIMIT 7');
  }, 'Invalid Query: Invalid ORDER BY');
});

test('validateQuery: can extract table from an ORDER BY statement', (t) => {
  t.deepEqual(validateQuery(query).order, [{ prop: 'field_b', sort: 'DESC' }]);

  t.deepEqual(validateQuery('SELECT a FROM b WHERE a IS 7 ORDER BY RANDOM LIMIT 1').order, [{ prop: 'RANDOM' }]);
});

// LIMIT
test('validateQuery: throws an error when missing LIMIT', (t) => {
  t.throws(() => {
    validateQuery('SELECT field FROM table WHERE field IS "test" ORDER BY field DESC');
  }, 'Invalid Query: Missing LIMIT');
});

test('validateQuery: throws an error when LIMIT is invalid', (t) => {
  t.throws(() => {
    validateQuery('SELECT * FROM table WHERE field IS 7 ORDER BY field ASC LIMIT seven');
  }, 'Invalid Query: Invalid LIMIT');
});
