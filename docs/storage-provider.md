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
<dt><a href="#StorageProviderConfig">StorageProviderConfig</a></dt>
<dd></dd>
</dl>

<a name="StorageProvider"></a>

## StorageProvider
Storage for Uttori documents using JSON files stored on the local file system.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | [<code>StorageProviderConfig</code>](#StorageProviderConfig) | The configuration object. |
| documents | <code>Record.&lt;string, UttoriDocument&gt;</code> | The collection of documents where the slug is the key and the value is the document. |


* [StorageProvider](#StorageProvider)
    * [new StorageProvider(config)](#new_StorageProvider_new)
    * _instance_
        * [.documents](#StorageProvider+documents) : <code>Record.&lt;string, UttoriDocument&gt;</code>
        * [.all](#StorageProvider+all) ⇒ <code>Promise.&lt;Record.&lt;string, UttoriDocument&gt;&gt;</code>
        * [.getQuery](#StorageProvider+getQuery) ⇒ <code>Promise.&lt;(Array.&lt;UttoriDocument&gt;\|number)&gt;</code>
        * [.get](#StorageProvider+get) ⇒ <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code>
        * [.add](#StorageProvider+add)
        * [.updateValid](#StorageProvider+updateValid) ℗
        * [.update](#StorageProvider+update)
        * [.delete](#StorageProvider+delete)
        * [.getHistory](#StorageProvider+getHistory) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
        * [.getRevision](#StorageProvider+getRevision) ⇒ <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code>
        * [.updateHistory](#StorageProvider+updateHistory)
    * _static_
        * [.ensureDirectory(directory)](#StorageProvider.ensureDirectory)

<a name="new_StorageProvider_new"></a>

### new StorageProvider(config)
Creates an instance of StorageProvider.


| Param | Type | Description |
| --- | --- | --- |
| config | [<code>StorageProviderConfig</code>](#StorageProviderConfig) | A configuration object. |

**Example** *(Init StorageProvider)*  
```js
const storageProvider = new StorageProvider({ contentDirectory: 'content', historyDirectory: 'history', spacesDocument: 2 });
```
<a name="StorageProvider+documents"></a>

### storageProvider.documents : <code>Record.&lt;string, UttoriDocument&gt;</code>
The collection of documents where the slug is the key and the value is the document.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
<a name="StorageProvider+all"></a>

### storageProvider.all ⇒ <code>Promise.&lt;Record.&lt;string, UttoriDocument&gt;&gt;</code>
Returns all documents.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;Record.&lt;string, UttoriDocument&gt;&gt;</code> - All documents.  
**Example**  
```js
storageProvider.all();
➜ { first-document: { slug: 'first-document', ... }, ...}
```
<a name="StorageProvider+getQuery"></a>

### storageProvider.getQuery ⇒ <code>Promise.&lt;(Array.&lt;UttoriDocument&gt;\|number)&gt;</code>
Returns all documents matching a given query.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(Array.&lt;UttoriDocument&gt;\|number)&gt;</code> - Promise object represents all matching documents.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The conditions on which documents should be returned. |

<a name="StorageProvider+get"></a>

### storageProvider.get ⇒ <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code>
Returns a document for a given slug.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code> - Promise object represents the returned UttoriDocument.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to be returned. |

<a name="StorageProvider+add"></a>

### storageProvider.add
Saves a document to the file system.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>UttoriDocument</code>](#UttoriDocument) | The document to be added to the collection. |

<a name="StorageProvider+updateValid"></a>

### storageProvider.updateValid ℗
Updates a document and saves to the file system.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>UttoriDocument</code>](#UttoriDocument) | The document to be updated in the collection. |
| originalSlug | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider+update"></a>

### storageProvider.update
Updates a document and figures out how to save to the file system.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The params object. |
| params.document | [<code>UttoriDocument</code>](#UttoriDocument) | The document to be updated in the collection. |
| params.originalSlug | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider+delete"></a>

### storageProvider.delete
Removes a document from the file system.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug identifying the document. |

<a name="StorageProvider+getHistory"></a>

### storageProvider.getHistory ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Returns the history of edits for a given slug.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - Promise object represents the returned history.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to get history for. |

<a name="StorageProvider+getRevision"></a>

### storageProvider.getRevision ⇒ <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code>
Returns a specifc revision from the history of edits for a given slug and revision timestamp.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code> - Promise object represents the returned revision of the document.  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The params object. |
| params.slug | <code>string</code> | The slug of the document to be returned. |
| params.revision | <code>string</code> \| <code>number</code> | The unix timestamp of the history to be returned. |

<a name="StorageProvider+updateHistory"></a>

### storageProvider.updateHistory
Updates History for a given slug, renaming the store file and history directory as needed.

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document to update history for. |
| content | <code>string</code> | The revision of the document to be saved. |
| [originalSlug] | <code>string</code> | The original slug identifying the document, or the slug if it has not changed. |

<a name="StorageProvider.ensureDirectory"></a>

### StorageProvider.ensureDirectory(directory)
Ensure a directory exists, and if not create it.

**Kind**: static method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> | The directory to ensure exists. |

<a name="UttoriDocument"></a>

## UttoriDocument
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [slug] | <code>string</code> | The unique identifier for the document. |
| [createDate] | <code>number</code> \| <code>Date</code> | The creation date of the document. |
| [updateDate] | <code>number</code> \| <code>Date</code> | The last date the document was updated. |

<a name="StorageProviderConfig"></a>

## StorageProviderConfig
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| contentDirectory | <code>string</code> | The directory to store documents. |
| historyDirectory | <code>string</code> | The directory to store document histories. |
| [extension] | <code>string</code> | The file extension to use for file. |
| [updateTimestamps] | <code>boolean</code> | Should update times be marked at the time of edit. |
| [useHistory] | <code>boolean</code> | Should history entries be created. |
| [useCache] | <code>boolean</code> | Should we cache files in memory? |
| [spacesDocument] | <code>number</code> | The spaces parameter for JSON stringifying documents. |
| [spacesHistory] | <code>number</code> | The spaces parameter for JSON stringifying history. |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | The events to listen for. |

