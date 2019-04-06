export default {
  files: [
    'test/**/*.test.js',
  ],
  sources: [
    'index.js',
  ],
  concurrency: 5,
  failFast: false,
  tap: false,
  babel: false,
  compileEnhancements: false,
  verbose: true,
};
