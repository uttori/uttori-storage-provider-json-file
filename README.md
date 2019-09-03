[![view on npm](http://img.shields.io/npm/v/uttori-storage-provider-json-file.svg)](https://www.npmjs.org/package/uttori-storage-provider-json-file)
[![npm module downloads](http://img.shields.io/npm/dt/uttori-storage-provider-json-file.svg)](https://www.npmjs.org/package/uttori-storage-provider-json-file)
[![Build Status](https://travis-ci.org/uttori/uttori-storage-provider-json-file.svg?branch=master)](https://travis-ci.org/uttori/uttori-storage-provider-json-file)
[![Dependency Status](https://david-dm.org/uttori/uttori-storage-provider-json-file.svg)](https://david-dm.org/uttori/uttori-storage-provider-json-file)
[![Coverage Status](https://coveralls.io/repos/uttori/uttori-storage-provider-json-file/badge.svg?branch=master)](https://coveralls.io/r/uttori/uttori-storage-provider-json-file?branch=master)

# Uttori Storage Provider - JSON File

Uttori storage provider using JSON files on disk.

## Install

```bash
npm install --save uttori-storage-provider-json-file
```

# Config

```js
{
  content_dir: '',
  history_dir: '',
  extension: 'json',
  spaces_document: null,
  spaces_history: null,
}
```

* * *

# API Reference

<a name="StorageProvider"></a>

## StorageProvider
Storage for Uttori documents using JSON files stored on the local file system.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The configuration object. |
| documents | <code>Array.&lt;UttoriDocument&gt;</code> | The collection of documents. |


* [StorageProvider](#StorageProvider)
    * [new StorageProvider(config)](#new_StorageProvider_new)
    * [.all()](#StorageProvider+all) ⇒ <code>Promise</code>
    * [.tags()](#StorageProvider+tags) ⇒ <code>Promise</code>
    * [.getQuery(query)](#StorageProvider+getQuery) ⇒ <code>Promise</code>
    * [.get(slug)](#StorageProvider+get) ⇒ <code>Promise</code>
    * [.getHistory(slug)](#StorageProvider+getHistory) ⇒ <code>Promise</code>
    * [.getRevision(slug, revision)](#StorageProvider+getRevision) ⇒ <code>Promise</code>
    * [.add(document)](#StorageProvider+add)
    * [.updateValid(document, originalSlug)](#StorageProvider+updateValid) ℗
    * [.update(document, originalSlug)](#StorageProvider+update)
    * [.delete(slug)](#StorageProvider+delete)
    * [.refresh()](#StorageProvider+refresh)
    * [.updateHistory(slug, content, originalSlug)](#StorageProvider+updateHistory)

<a name="new_StorageProvider_new"></a>

### new StorageProvider(config)
Creates an instance of StorageProvider.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>Object</code> |  | A configuration object. |
| config.content_dir | <code>string</code> |  | The directory to store documents. |
| config.history_dir | <code>string</code> |  | The directory to store document histories. |
| [config.extension] | <code>string</code> | <code>&quot;json&quot;</code> | The file extension to use for file, name of the employee. |
| [config.spaces_document] | <code>number</code> | <code></code> | The spaces parameter for JSON stringifying documents. |
| [config.spaces_history] | <code>number</code> | <code></code> | The spaces parameter for JSON stringifying history. |

**Example** *(Init StorageProvider)*  
```js
const storageProvider = new StorageProvider({ content_dir: 'content', history_dir: 'history', spaces_document: 2 });
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
<a name="StorageProvider+tags"></a>

### storageProvider.tags() ⇒ <code>Promise</code>
Returns all unique tags.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents all documents.  
**Example**  
```js
storageProvider.tags();
➜ ['first-tag', ...]
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

### storageProvider.getRevision(slug, revision) ⇒ <code>Promise</code>
Returns a specifc revision from the history of edits for a given slug and revision timestamp.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents the returned revision of the document.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to be returned. |
| revision | <code>number</code> | The unix timestamp of the history to be returned. |

<a name="StorageProvider+add"></a>

### storageProvider.add(document)
Saves a document to the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>UttoriDocument</code> | The document to be added to the collection. |

<a name="StorageProvider+updateValid"></a>

### storageProvider.updateValid(document, originalSlug) ℗
Updates a document and saves to the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>UttoriDocument</code> | The document to be updated in the collection. |
| originalSlug | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider+update"></a>

### storageProvider.update(document, originalSlug)
Updates a document and figures out how to save to the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>UttoriDocument</code> | The document to be updated in the collection. |
| originalSlug | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

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

### storageProvider.updateHistory(slug, content, originalSlug)
Updates History for a given slug, renaming the store file and history folder as needed.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to update history for. |
| content | <code>string</code> | The revision of the document to be saved. |
| originalSlug | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |


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
