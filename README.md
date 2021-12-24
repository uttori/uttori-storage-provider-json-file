[![view on npm](https://img.shields.io/npm/v/@uttori/storage-provider-json-file.svg)](https://www.npmjs.org/package/@uttori/storage-provider-json-file)
[![npm module downloads](https://img.shields.io/npm/dt/@uttori/storage-provider-json-file.svg)](https://www.npmjs.org/package/@uttori/storage-provider-json-file)
[![Build Status](https://travis-ci.com/uttori/uttori-storage-provider-json-file.svg?branch=master)](https://travis-ci.com/uttori/uttori-storage-provider-json-file)
[![Dependency Status](https://david-dm.org/uttori/uttori-storage-provider-json-file.svg)](https://david-dm.org/uttori/uttori-storage-provider-json-file)
[![Coverage Status](https://coveralls.io/repos/uttori/uttori-storage-provider-json-file/badge.svg?branch=master)](https://coveralls.io/r/uttori/uttori-storage-provider-json-file?branch=master)
[![Tree-Shaking Support](https://badgen.net/bundlephobia/tree-shaking/@uttori/storage-provider-json-file)](https://bundlephobia.com/result?p=@uttori/storage-provider-json-file)
[![Dependency Count](https://badgen.net/bundlephobia/dependency-count/@uttori/storage-provider-json-file)](https://bundlephobia.com/result?p=@uttori/storage-provider-json-file)
[![Minified + GZip](https://badgen.net/bundlephobia/minzip/@uttori/storage-provider-json-file)](https://bundlephobia.com/result?p=@uttori/storage-provider-json-file)
[![Minified](https://badgen.net/bundlephobia/min/@uttori/storage-provider-json-file)](https://bundlephobia.com/result?p=@uttori/storage-provider-json-file)

# Uttori Storage Provider - JSON File

Uttori Storage Provider using JSON files on disk.

This repo exports both a Uttori Plugin compliant `Plugin` class as well as the underlying `StorageProvider` class.

## Install

```bash
npm install --save @uttori/storage-provider-json-file
```

# Config

```js
{
  content_directory: '',
  history_directory: '',
  extension: 'json',
  spaces_document: null,
  spaces_history: null,
  update_timestamps: true,
  use_history: true,
  // Registration Events
  events: {
    add: ['storage-add'],
    delete: ['storage-delete'],
    get: ['storage-get'],
    getHistory: ['storage-get-history'],
    getRevision: ['storage-get-revision'],
    getQuery: ['storage-query'],
    update: ['storage-update'],
    validateConfig: ['validate-config'],
  },
}
```

* * *

# Example

```js
// When part of UttoriWiki:
import { Plugin as StorageProviderJSON } from '@uttori/storage-provider-json-file';
// or
const { Plugin: StorageProviderJSON } = require('@uttori/storage-provider-json-file');

// When stand alone:
import StorageProvider from '@uttori/storage-provider-json-file';
// or
const { StorageProvider } = require('@uttori/storage-provider-json-file');
const s = new StorageProvider({
  content_directory: 'example/content',
  history_directory: 'example/history',
  extension: 'json',
  spaces_document: null,
  spaces_history: null,
});
await s.add({
  title: 'Example Title',
  slug: 'example-title',
  content: '## Example Title',
  html: '',
  updateDate: 1459310452001,
  createDate: 1459310452001,
  tags: ['Example Tag'],
  customData: {
    keyA: 'value-a',
    keyB: 'value-b',
    keyC: 'value-c',
  },
});
const results = await s.getQuery('SELECT tags FROM documents WHERE slug IS_NOT_NULL ORDER BY slug ASC LIMIT 1');
➜  results === [
      { tags: ['Example Tag'] },
    ]
const results = s.getQuery('SELECT COUNT(*) FROM documents WHERE slug IS_NOT_NULL ORDER BY RANDOM ASC LIMIT -1');
➜  results === 1
```

# API Reference

## Classes

<dl>
<dt><a href="#StorageProvider">StorageProvider</a></dt>
<dd><p>Storage for Uttori documents using JSON files stored on the local file system.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#debug">debug()</a> : <code>function</code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#UttoriDocument">UttoriDocument</a></dt>
<dd></dd>
</dl>

<a name="StorageProvider"></a>

## StorageProvider
Storage for Uttori documents using JSON files stored on the local file system.

**Kind**: global class  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>object</code> |  | The configuration object. |
| config.content_directory | <code>string</code> |  | The directory to store documents. |
| config.history_directory | <code>string</code> |  | The directory to store document histories. |
| [config.extension] | <code>string</code> | <code>&quot;&#x27;json&#x27;&quot;</code> | The file extension to use for file, name of the employee. |
| [config.spaces_document] | <code>number</code> |  | The spaces parameter for JSON stringifying documents. |
| [config.spaces_history] | <code>number</code> |  | The spaces parameter for JSON stringifying history. |
| documents | <code>object</code> |  | The collection of documents where the slug is the key and the value is the document. |


* [StorageProvider](#StorageProvider)
    * [new StorageProvider(config)](#new_StorageProvider_new)
    * [.all()](#StorageProvider+all) ⇒ <code>object</code>
    * [.getQuery(query)](#StorageProvider+getQuery) ⇒ <code>Promise.&lt;(Array.&lt;UttoriDocument&gt;\|number)&gt;</code>
    * [.get(slug)](#StorageProvider+get) ⇒ <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code>
    * [.add(document)](#StorageProvider+add)
    * [.updateValid(document, originalSlug)](#StorageProvider+updateValid) ℗
    * [.update(params)](#StorageProvider+update)
    * [.delete(slug)](#StorageProvider+delete)
    * [.getHistory(slug)](#StorageProvider+getHistory) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.getRevision(params)](#StorageProvider+getRevision) ⇒ <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code>
    * [.updateHistory(slug, content, [originalSlug])](#StorageProvider+updateHistory)

<a name="new_StorageProvider_new"></a>

### new StorageProvider(config)
Creates an instance of StorageProvider.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>object</code> |  | A configuration object. |
| config.content_directory | <code>string</code> |  | The directory to store documents. |
| config.history_directory | <code>string</code> |  | The directory to store document histories. |
| [config.extension] | <code>string</code> | <code>&quot;json&quot;</code> | The file extension to use for file, name of the employee. |
| [config.update_timestamps] | <code>boolean</code> | <code>true</code> | Should update times be marked at the time of edit. |
| [config.use_history] | <code>boolean</code> | <code>true</code> | Should history entries be created. |
| [config.use_cache] | <code>boolean</code> | <code>true</code> | Should we cache files in memory? |
| [config.spaces_document] | <code>number</code> |  | The spaces parameter for JSON stringifying documents. |
| [config.spaces_history] | <code>number</code> |  | The spaces parameter for JSON stringifying history. |

**Example** *(Init StorageProvider)*  
```js
const storageProvider = new StorageProvider({ content_directory: 'content', history_directory: 'history', spaces_document: 2 });
```
<a name="StorageProvider+all"></a>

### storageProvider.all() ⇒ <code>object</code>
Returns all documents.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>object</code> - All documents.  
**Example**  
```js
storageProvider.all();
➜ { first-document: { slug: 'first-document', ... }, ...}
```
<a name="StorageProvider+getQuery"></a>

### storageProvider.getQuery(query) ⇒ <code>Promise.&lt;(Array.&lt;UttoriDocument&gt;\|number)&gt;</code>
Returns all documents matching a given query.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(Array.&lt;UttoriDocument&gt;\|number)&gt;</code> - Promise object represents all matching documents.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The conditions on which documents should be returned. |

<a name="StorageProvider+get"></a>

### storageProvider.get(slug) ⇒ <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code>
Returns a document for a given slug.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code> - Promise object represents the returned UttoriDocument.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to be returned. |

<a name="StorageProvider+add"></a>

### storageProvider.add(document)
Saves a document to the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>UttoriDocument</code>](#UttoriDocument) | The document to be added to the collection. |

<a name="StorageProvider+updateValid"></a>

### storageProvider.updateValid(document, originalSlug) ℗
Updates a document and saves to the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>UttoriDocument</code>](#UttoriDocument) | The document to be updated in the collection. |
| originalSlug | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider+update"></a>

### storageProvider.update(params)
Updates a document and figures out how to save to the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The params object. |
| params.document | [<code>UttoriDocument</code>](#UttoriDocument) | The document to be updated in the collection. |
| params.originalSlug | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider+delete"></a>

### storageProvider.delete(slug)
Removes a document from the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug identifying the document. |

<a name="StorageProvider+getHistory"></a>

### storageProvider.getHistory(slug) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Returns the history of edits for a given slug.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - Promise object represents the returned history.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to get history for. |

<a name="StorageProvider+getRevision"></a>

### storageProvider.getRevision(params) ⇒ <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code>
Returns a specifc revision from the history of edits for a given slug and revision timestamp.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code> - Promise object represents the returned revision of the document.  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The params object. |
| params.slug | <code>string</code> | The slug of the document to be returned. |
| params.revision | <code>string</code> \| <code>number</code> | The unix timestamp of the history to be returned. |

<a name="StorageProvider+updateHistory"></a>

### storageProvider.updateHistory(slug, content, [originalSlug])
Updates History for a given slug, renaming the store file and history folder as needed.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to update history for. |
| content | <code>string</code> | The revision of the document to be saved. |
| [originalSlug] | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="debug"></a>

## debug() : <code>function</code>
**Kind**: global function  
<a name="UttoriDocument"></a>

## UttoriDocument
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The unique identifier for the document. |
| [createDate] | <code>number</code> \| <code>Date</code> | The creation date of the document. |
| [updateDate] | <code>number</code> \| <code>Date</code> | The last date the document was updated. |


* * *

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
npm install
npm test
DEBUG=Uttori* npm test
```

## Contributors

* [Matthew Callis](https://github.com/MatthewCallis)

## License

* [MIT](LICENSE)
