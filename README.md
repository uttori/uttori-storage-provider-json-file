[![view on npm](http://img.shields.io/npm/v/@uttori/storage-provider-json-file.svg)](https://www.npmjs.org/package/@uttori/storage-provider-json-file)
[![npm module downloads](http://img.shields.io/npm/dt/@uttori/storage-provider-json-file.svg)](https://www.npmjs.org/package/@uttori/storage-provider-json-file)
[![Build Status](https://travis-ci.org/uttori/uttori-storage-provider-json-file.svg?branch=master)](https://travis-ci.org/uttori/uttori-storage-provider-json-file)
[![Dependency Status](https://david-dm.org/uttori/uttori-storage-provider-json-file.svg)](https://david-dm.org/uttori/uttori-storage-provider-json-file)
[![Coverage Status](https://coveralls.io/repos/uttori/uttori-storage-provider-json-file/badge.svg?branch=master)](https://coveralls.io/r/uttori/uttori-storage-provider-json-file?branch=master)

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
```

# API Reference

## Classes

<dl>
<dt><a href="#StorageProvider">StorageProvider</a></dt>
<dd><p>Storage for Uttori documents using JSON files stored on the local file system.</p>
</dd>
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
| config.extension | <code>string</code> | <code>&quot;&#x27;json&#x27;&quot;</code> | The file extension to use for file, name of the employee. |
| config.spaces_document | <code>number</code> |  | The spaces parameter for JSON stringifying documents. |
| config.spaces_history | <code>number</code> |  | The spaces parameter for JSON stringifying history. |
| documents | [<code>Array.&lt;UttoriDocument&gt;</code>](#UttoriDocument) |  | The collection of documents. |


* [StorageProvider](#StorageProvider)
    * [new StorageProvider(config)](#new_StorageProvider_new)
    * [.all()](#StorageProvider+all) ⇒ <code>Promise</code>
    * [.getQuery(query)](#StorageProvider+getQuery) ⇒ <code>Promise</code>
    * [.get(slug)](#StorageProvider+get) ⇒ <code>Promise</code>
    * [.getHistory(slug)](#StorageProvider+getHistory) ⇒ <code>Promise</code>
    * [.getRevision(params)](#StorageProvider+getRevision) ⇒ <code>Promise</code>
    * [.add(document)](#StorageProvider+add)
    * [.updateValid(document, originalSlug)](#StorageProvider+updateValid) ℗
    * [.update(params)](#StorageProvider+update)
    * [.delete(slug)](#StorageProvider+delete)
    * [.refresh()](#StorageProvider+refresh)
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
| [config.spaces_document] | <code>number</code> |  | The spaces parameter for JSON stringifying documents. |
| [config.spaces_history] | <code>number</code> |  | The spaces parameter for JSON stringifying history. |

**Example** *(Init StorageProvider)*  
```js
const storageProvider = new StorageProvider({ content_directory: 'content', history_directory: 'history', spaces_document: 2 });
```
<a name="StorageProvider+all"></a>

### storageProvider.all() ⇒ <code>Promise</code>
Returns all documents.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents all documents.  
**Example**  
```js
storageProvider.all();
➜ [{ slug: 'first-document', ... }, ...]
```
<a name="StorageProvider+getQuery"></a>

### storageProvider.getQuery(query) ⇒ <code>Promise</code>
Returns all documents matching a given query.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents all matching documents.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The conditions on which documents should be returned. |

<a name="StorageProvider+get"></a>

### storageProvider.get(slug) ⇒ <code>Promise</code>
Returns a document for a given slug.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents the returned UttoriDocument.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to be returned. |

<a name="StorageProvider+getHistory"></a>

### storageProvider.getHistory(slug) ⇒ <code>Promise</code>
Returns the history of edits for a given slug.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents the returned history.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to get history for. |

<a name="StorageProvider+getRevision"></a>

### storageProvider.getRevision(params) ⇒ <code>Promise</code>
Returns a specifc revision from the history of edits for a given slug and revision timestamp.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents the returned revision of the document.  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The params object. |
| params.slug | <code>string</code> | The slug of the document to be returned. |
| params.revision | <code>number</code> | The unix timestamp of the history to be returned. |

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

<a name="StorageProvider+refresh"></a>

### storageProvider.refresh()
Reloads all documents from the file system into the cache.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
<a name="StorageProvider+updateHistory"></a>

### storageProvider.updateHistory(slug, content, [originalSlug])
Updates History for a given slug, renaming the store file and history folder as needed.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to update history for. |
| content | <code>string</code> | The revision of the document to be saved. |
| [originalSlug] | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="UttoriDocument"></a>

## UttoriDocument
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| slug | <code>string</code> |  | The unique identifier for the document. |
| [title] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | The unique identifier for the document. |
| [createDate] | <code>number</code> \| <code>Date</code> |  | The creation date of the document. |
| [updateDate] | <code>number</code> \| <code>Date</code> |  | The last date the document was updated. |
| [tags] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | The unique identifier for the document. |
| [customData] | <code>object</code> | <code>{}</code> | Any extra meta data for the document. |


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
