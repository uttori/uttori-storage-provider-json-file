[![view on npm](http://img.shields.io/npm/v/uttori-storage-provider-json-file.svg)](https://www.npmjs.org/package/uttori-storage-provider-json-file)
[![npm module downloads](http://img.shields.io/npm/dt/uttori-storage-provider-json-file.svg)](https://www.npmjs.org/package/uttori-storage-provider-json-file)
[![Build Status](https://travis-ci.org/uttori/uttori-storage-provider-json-file.svg?branch=master)](https://travis-ci.org/uttori/uttori-storage-provider-json-file)
[![Dependency Status](https://david-dm.org/uttori/uttori-storage-provider-json-file.svg)](https://david-dm.org/uttori/uttori-storage-provider-json-file)
[![Coverage Status](https://coveralls.io/repos/uttori/uttori-storage-provider-json-file/badge.svg?branch=master)](https://coveralls.io/r/uttori/uttori-storage-provider-json-file?branch=master)

# Uttori Storage Provider - JSON File

Uttori storage provider using JSON files on disk.

## Install

```
$ npm install --save uttori-storage-provider-json-file
```

# Config

```js
{
  content_dir: '',
  history_dir: '',
  data_dir: '',
  extension: 'json',
  spaces_document: null,
  spaces_data: null,
  spaces_history: null,
}
```

* * *

# API Reference

<a name="StorageProvider"></a>

## StorageProvider
**Kind**: global class  

* [StorageProvider](#StorageProvider)
    * [new StorageProvider(config)](#new_StorageProvider_new)
    * [.all()](#StorageProvider+all) ⇒ <code>Promise</code>
    * [.tags()](#StorageProvider+tags) ⇒ <code>Promise</code>
    * [.getTaggedDocuments(tag, [limit], fields)](#StorageProvider+getTaggedDocuments) ⇒ <code>Promise</code>
    * [.getRelatedDocuments(document, limit, fields)](#StorageProvider+getRelatedDocuments) ⇒ <code>Promise</code>
    * [.getRecentDocuments(limit, fields)](#StorageProvider+getRecentDocuments) ⇒ <code>Promise</code>
    * [.getPopularDocuments(limit, fields)](#StorageProvider+getPopularDocuments) ⇒ <code>Promise</code>
    * [.getRandomDocuments(limit, fields)](#StorageProvider+getRandomDocuments) ⇒ <code>Promise</code>
    * [.augmentDocuments(documents, _fields)](#StorageProvider+augmentDocuments) ⇒ <code>Promise</code>
    * [.get(slug)](#StorageProvider+get) ⇒ <code>Promise</code>
    * [.getHistory(slug)](#StorageProvider+getHistory) ⇒ <code>Promise</code>
    * [.getRevision(slug, revision)](#StorageProvider+getRevision) ⇒ <code>Promise</code>
    * [.add(document)](#StorageProvider+add)
    * [.updateValid(document, originalSlug)](#StorageProvider+updateValid) ℗
    * [.update(document, originalSlug)](#StorageProvider+update)
    * [.delete(slug)](#StorageProvider+delete)
    * [.storeObject(name, data)](#StorageProvider+storeObject)
    * [.updateObject(name, key, value)](#StorageProvider+updateObject)
    * [.incrementObject(name, key, [amount])](#StorageProvider+incrementObject)
    * [.decrementObject(name, key, [amount])](#StorageProvider+decrementObject)
    * [.readObject(name, fallback)](#StorageProvider+readObject) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.readObjectValue(name, key, fallback)](#StorageProvider+readObjectValue) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.refresh()](#StorageProvider+refresh)
    * [.deleteFile(folder, name)](#StorageProvider+deleteFile)
    * [.readFile(folder, name)](#StorageProvider+readFile) ⇒ <code>Object</code>
    * [.readFolder(folder)](#StorageProvider+readFolder) ⇒ <code>Array.&lt;string&gt;</code>
    * [.updateHistory(slug, content, originalSlug)](#StorageProvider+updateHistory)

<a name="new_StorageProvider_new"></a>

### new StorageProvider(config)
Storage for Uttori documents using JSON files stored on the local file system.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>Object</code> |  | A configuration object. |
| [config.extension] | <code>string</code> | <code>&quot;JSON&quot;</code> | The file extension to use for file, name of the employee. |
| [config.analytics_file] | <code>string</code> | <code>&quot;visits&quot;</code> | The name of the file to store page views. |
| [config.spaces_document] | <code>number</code> | <code></code> | The spaces parameter for JSON stringifying documents. |
| [config.spaces_data] | <code>number</code> | <code></code> | The spaces parameter for JSON stringifying data. |
| [config.spaces_history] | <code>number</code> | <code></code> | The spaces parameter for JSON stringifying history. |

<a name="StorageProvider+all"></a>

### storageProvider.all() ⇒ <code>Promise</code>
Returns all documents.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents all documents.  
<a name="StorageProvider+tags"></a>

### storageProvider.tags() ⇒ <code>Promise</code>
Returns all unique tags.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents all documents.  
<a name="StorageProvider+getTaggedDocuments"></a>

### storageProvider.getTaggedDocuments(tag, [limit], fields) ⇒ <code>Promise</code>
Returns all documents matching a given tag.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents all matching documents.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tag | <code>string</code> |  | The tag to compare against other documents. |
| [limit] | <code>number</code> | <code>1000</code> | The maximum number of documents to return. |
| fields | <code>Array.&lt;string&gt;</code> |  | Unused: the fields to return on the documents. |

<a name="StorageProvider+getRelatedDocuments"></a>

### storageProvider.getRelatedDocuments(document, limit, fields) ⇒ <code>Promise</code>
Returns a given number of documents related to a given document by comparing tags.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents all matching documents.  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>UttoriDocument</code> | The document to compare against other documents. |
| limit | <code>number</code> | The maximum number of documents to return. |
| fields | <code>Array.&lt;string&gt;</code> | Unused: the fields to return on the documents. |

<a name="StorageProvider+getRecentDocuments"></a>

### storageProvider.getRecentDocuments(limit, fields) ⇒ <code>Promise</code>
Returns a given number of documents sorted by most recently updated.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents all matching documents.  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> | The maximum number of documents to return. |
| fields | <code>Array.&lt;string&gt;</code> | Unused: the fields to return on the documents. |

<a name="StorageProvider+getPopularDocuments"></a>

### storageProvider.getPopularDocuments(limit, fields) ⇒ <code>Promise</code>
Returns a given number of documents sorted by most visited.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents all matching documents.  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> | The maximum number of documents to return. |
| fields | <code>Array.&lt;string&gt;</code> | Unused: the fields to return on the documents. |

<a name="StorageProvider+getRandomDocuments"></a>

### storageProvider.getRandomDocuments(limit, fields) ⇒ <code>Promise</code>
Returns a given number of randomly selected documents.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents all matching documents.  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> | The maximum number of documents to return. |
| fields | <code>Array.&lt;string&gt;</code> | Unused: the fields to return on the documents. |

<a name="StorageProvider+augmentDocuments"></a>

### storageProvider.augmentDocuments(documents, _fields) ⇒ <code>Promise</code>
Ensures a given set of fields are presenton on a given set of documents.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise</code> - Promise object represents all augmented documents.  

| Param | Type | Description |
| --- | --- | --- |
| documents | <code>Array.&lt;UttoriDocument&gt;</code> | The documents to ensure fields are set on. |
| _fields | <code>Array.&lt;string&gt;</code> | Unused: the fields to return on the documents. |

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

<a name="StorageProvider+storeObject"></a>

### storageProvider.storeObject(name, data)
Saves a JSON object to the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the file to be saved. |
| data | <code>string</code> \| <code>Object</code> | The JSON data for the file to be saved. |

<a name="StorageProvider+updateObject"></a>

### storageProvider.updateObject(name, key, value)
Updates a value in a JSON object on the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the file to be updated. |
| key | <code>string</code> | The key of the value to be updated. |
| value | <code>Array</code> \| <code>number</code> \| <code>string</code> \| <code>Object</code> | The JSON data for the file to be saved. |

<a name="StorageProvider+incrementObject"></a>

### storageProvider.incrementObject(name, key, [amount])
Increment a value by a given amount in a JSON object on the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | The name of the file to be updated. |
| key | <code>string</code> |  | The key of the value to be updated. |
| [amount] | <code>number</code> | <code>1</code> | The value to be added. |

<a name="StorageProvider+decrementObject"></a>

### storageProvider.decrementObject(name, key, [amount])
Decrement a value by a given amount in a JSON object on the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | The name of the file to be updated. |
| key | <code>string</code> |  | The key of the value to be updated. |
| [amount] | <code>number</code> | <code>1</code> | The value to be subtracted. |

<a name="StorageProvider+readObject"></a>

### storageProvider.readObject(name, fallback) ⇒ <code>Promise.&lt;Object&gt;</code>
Reads a JSON object on the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise object represents the returned object.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the file to be read. |
| fallback | <code>Object</code> | The backup value to use if no value is found. |

<a name="StorageProvider+readObjectValue"></a>

### storageProvider.readObjectValue(name, key, fallback) ⇒ <code>Promise.&lt;Object&gt;</code>
Reads a specific value from a JSON object on the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise object represents the returned object.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the file to get the value from. |
| key | <code>string</code> | The key of the value to be returned. |
| fallback | <code>Object</code> | The backup value to use if no value is found. |

<a name="StorageProvider+refresh"></a>

### storageProvider.refresh()
Reloads all documents from the file system into the cache.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
<a name="StorageProvider+deleteFile"></a>

### storageProvider.deleteFile(folder, name)
Deletes a file from the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| folder | <code>string</code> | The folder of the file to be deleted. |
| name | <code>string</code> | The name of the file to be deleted. |

<a name="StorageProvider+readFile"></a>

### storageProvider.readFile(folder, name) ⇒ <code>Object</code>
Reads a file from the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Object</code> - - The parsed JSON file contents.  

| Param | Type | Description |
| --- | --- | --- |
| folder | <code>string</code> | The folder of the file to be read. |
| name | <code>string</code> | The name of the file to be read. |

<a name="StorageProvider+readFolder"></a>

### storageProvider.readFolder(folder) ⇒ <code>Array.&lt;string&gt;</code>
Reads a folder from the file system.

**Kind**: instance method of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Array.&lt;string&gt;</code> - - The file paths found in the folder.  

| Param | Type | Description |
| --- | --- | --- |
| folder | <code>string</code> | The folder to be read. |

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
$ npm install
$ npm test
$ DEBUG=Uttori* npm test
```

## Contributors

 - [Matthew Callis](https://github.com/MatthewCallis)

## License
  [MIT](LICENSE)
