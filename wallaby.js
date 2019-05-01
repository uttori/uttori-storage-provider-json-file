module.exports = () => ({
  files: [
    'src/*.js',
  ],
  tests: [
    'test/*.test.js',
  ],
  env: {
    type: 'node',
  },
  hints: {
    ignoreCoverage: /istanbul ignore (next|line)/,
  },
  testFramework: 'ava',
  debug: true,
});
