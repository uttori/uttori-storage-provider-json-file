# Change Log

All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).

## [5.0.0](https://github.com/uttori/uttori-storage-provider-json-file/compare/v4.2.1...v5.0.0) - 2023-12-16

- 💥 BREAKING CHANGES!
- 💥 Rename config key: `content_directory` to `contentDirectory`
- 💥 Rename config key: `historyDirectory` to `historyDirectory`
- 💥 Rename config key: `updateTimestamps` to `updateTimestamps`
- 💥 Rename config key: `useHistory` to `useHistory`
- 💥 Rename config key: `use_cache` to `useCache`
- 💥 Rename config key: `spaces_document` to `spacesDocument`
- 💥 Rename config key: `spaces_history` to `spacesHistory`
- 🎁 Convert to be a module, and require Node v20
- 🎁 Remove dependency on `uttori-utilities`
- 🎁 Remove dependency on `fs-extra`
- 🎁 Update dependencies
- 🎁 Update dev dependencies
- 🛠 Update ESLint configuration
- 🛠 Update NVM to v20.10.0
- 🛠 Update old tooling confugration files
- 🛠 Remove CJS support, restucture to export ESM only
- 🛠 Make `.all()` an `async` function
- 🛠 Refactor `fs` method use to be `async`` and more efficient
- 🧰 Add `StorageProvider.ensureDirectory` static method to ensure directories are created before writing files
- 🧰 Add support for `EXCLUDES` as the opposite of `INCLUDES` for `SELECT` queries

## [4.2.1](https://github.com/uttori/uttori-storage-provider-json-file/compare/v4.2.0...v4.2.1) - 2022-12-22

- 🎁 Update dependencies
- 🎁 Update dev dependencies

## [4.2.0](https://github.com/uttori/uttori-storage-provider-json-file/compare/v4.1.1...v4.2.0) - 2022-05-30

- 🛠 Fix how `getHistory` & `getRevision` handle the configured file extension. `getHistory` now returns only the revisions without the file extensions suitible for use in URLs or other similar usecases. `getRevision` now knows to append the file exntension.
- 🛠 Renamed `folder` to `directory` in debug logs.
- 🎁 Update dev dependencies

## [4.1.1](https://github.com/uttori/uttori-storage-provider-json-file/compare/v4.1.0...v4.1.1) - 2021-12-22

- 🎁 Update dev dependencies

## [4.1.0](https://github.com/uttori/uttori-storage-provider-json-file/compare/v4.0.0...v4.1.0) - 2021-02-28

- 🛠 Switch memory cache data type (Array ➜ Object)
- 🛠 Fix return types
- 🛠 Remove auto adding `tags`, `customData` fields
- 🛠 Fix history race condition where writes with identical timestamps would lead to out of order history
- 🧰 Add option to disable in memory cache and always read from file
- 🎁 Update dev dependencies

## [4.0.0](https://github.com/uttori/uttori-storage-provider-json-file/compare/v3.4.3...v4.0.0) - 2021-01-16

- 🧰 Add ESM Support
- 🧰 Add explicit exports
- 🧰 Add support for `COUNT(*)` as  stand alone `SELECT` field for returning counts
- 🎁 Update dev dependencies

## [3.4.3](https://github.com/uttori/uttori-storage-provider-json-file/compare/v3.4.2...v3.4.3) - 2020-11-15

- 🧰 Make `debug` an optional dependency

## [3.4.2](https://github.com/uttori/uttori-storage-provider-json-file/compare/v3.4.1...v3.4.2) - 2020-11-15

- 🎁 Update dev dependencies
- 🎁 Update README badge URLs
- 🧰 Change how types are made and rebuild types
- 🧰 Created this file
