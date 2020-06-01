const test = require('ava');
const { process } = require('../src/query-tools');

const docs = [
  {
    name: 'First Last',
    age: 27,
    iq: 91,
    size: 8,
    weight: 10,
    location: 'WA',
    favorite: null,
    tags: ['new', 'cool'],
  },
  {
    name: '1st 2nd',
    age: 50,
    iq: 80,
    size: 12,
    weight: 20,
    location: 'NY',
    favorite: 'Chcolate',
    tags: ['old', 'cool'],
  },
  {
    name: 'No Name',
    age: 10,
    iq: 40,
    size: 14,
    weight: 120,
    location: 'SF',
    favorite: '',
    tags: ['new', 'lame'],
  },
];

test('process: returns the documents according to the query', (t) => {
  let query = 'SELECT name FROM table WHERE name IS "No Name" ORDER BY name DESC LIMIT 1';
  t.deepEqual(process(query, docs), [docs[2]]);

  query = 'SELECT name FROM table WHERE name IS "No Name" ORDER BY name ASC LIMIT 1';
  t.deepEqual(process(query, docs), [docs[2]]);

  query = 'SELECT name FROM table WHERE age > 1 ORDER BY RANDOM LIMIT 3';
  t.is(process(query, docs).length, 3);
});
