## Classes

<dl>
<dt><a href="#StorageProvider">StorageProvider</a></dt>
<dd><p>Storage for Uttori documents using JSON files stored on the local file system.</p></dd>
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
<p>Storage for Uttori documents using JSON files stored on the local file system.</p>

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | [<code>StorageProviderConfig</code>](#StorageProviderConfig) | <p>The configuration object.</p> |
| documents | <code>Record.&lt;string, UttoriDocument&gt;</code> | <p>The collection of documents where the slug is the key and the value is the document.</p> |


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
<p>Creates an instance of StorageProvider.</p>


| Param | Type | Description |
| --- | --- | --- |
| config | [<code>StorageProviderConfig</code>](#StorageProviderConfig) | <p>A configuration object.</p> |

**Example** *(Init StorageProvider)*  
```js
const storageProvider = new StorageProvider({ contentDirectory: 'content', historyDirectory: 'history', spacesDocument: 2 });
```
<a name="StorageProvider+documents"></a>

### storageProvider.documents : <code>Record.&lt;string, UttoriDocument&gt;</code>
<p>The collection of documents where the slug is the key and the value is the document.</p>

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
<a name="StorageProvider+all"></a>

### storageProvider.all ⇒ <code>Promise.&lt;Record.&lt;string, UttoriDocument&gt;&gt;</code>
<p>Returns all documents.</p>

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;Record.&lt;string, UttoriDocument&gt;&gt;</code> - <p>All documents.</p>  
**Example**  
```js
storageProvider.all();
➜ { first-document: { slug: 'first-document', ... }, ...}
```
<a name="StorageProvider+getQuery"></a>

### storageProvider.getQuery ⇒ <code>Promise.&lt;(Array.&lt;UttoriDocument&gt;\|number)&gt;</code>
<p>Returns all documents matching a given query.</p>

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(Array.&lt;UttoriDocument&gt;\|number)&gt;</code> - <p>Promise object represents all matching documents.</p>  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | <p>The conditions on which documents should be returned.</p> |

<a name="StorageProvider+get"></a>

### storageProvider.get ⇒ <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code>
<p>Returns a document for a given slug.</p>

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code> - <p>Promise object represents the returned UttoriDocument.</p>  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | <p>The slug of the document to be returned.</p> |

<a name="StorageProvider+add"></a>

### storageProvider.add
<p>Saves a document to the file system.</p>

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>UttoriDocument</code>](#UttoriDocument) | <p>The document to be added to the collection.</p> |

<a name="StorageProvider+updateValid"></a>

### storageProvider.updateValid ℗
<p>Updates a document and saves to the file system.</p>

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>UttoriDocument</code>](#UttoriDocument) | <p>The document to be updated in the collection.</p> |
| originalSlug | <code>string</code> | <p>The original slug identifying the document, or the slug if it has not changed.</p> |

<a name="StorageProvider+update"></a>

### storageProvider.update
<p>Updates a document and figures out how to save to the file system.</p>

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | <p>The params object.</p> |
| params.document | [<code>UttoriDocument</code>](#UttoriDocument) | <p>The document to be updated in the collection.</p> |
| params.originalSlug | <code>string</code> | <p>The original slug identifying the document, or the slug if it has not changed.</p> |

<a name="StorageProvider+delete"></a>

### storageProvider.delete
<p>Removes a document from the file system.</p>

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | <p>The slug identifying the document.</p> |

<a name="StorageProvider+getHistory"></a>

### storageProvider.getHistory ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
<p>Returns the history of edits for a given slug.</p>

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - <p>Promise object represents the returned history.</p>  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | <p>The slug of the document to get history for.</p> |

<a name="StorageProvider+getRevision"></a>

### storageProvider.getRevision ⇒ <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code>
<p>Returns a specifc revision from the history of edits for a given slug and revision timestamp.</p>

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  
**Returns**: <code>Promise.&lt;(UttoriDocument\|undefined)&gt;</code> - <p>Promise object represents the returned revision of the document.</p>  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | <p>The params object.</p> |
| params.slug | <code>string</code> | <p>The slug of the document to be returned.</p> |
| params.revision | <code>string</code> \| <code>number</code> | <p>The unix timestamp of the history to be returned.</p> |

<a name="StorageProvider+updateHistory"></a>

### storageProvider.updateHistory
<p>Updates History for a given slug, renaming the store file and history directory as needed.</p>

**Kind**: instance property of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | <p>The slug of the document to update history for.</p> |
| content | <code>string</code> | <p>The revision of the document to be saved.</p> |
| [originalSlug] | <code>string</code> | <p>The original slug identifying the document, or the slug if it has not changed.</p> |

<a name="StorageProvider.ensureDirectory"></a>

### StorageProvider.ensureDirectory(directory)
<p>Ensure a directory exists, and if not create it.</p>

**Kind**: static method of [<code>StorageProvider</code>](#StorageProvider)  

| Param | Type | Description |
| --- | --- | --- |
| directory | <code>string</code> | <p>The directory to ensure exists.</p> |

<a name="UttoriDocument"></a>

## UttoriDocument
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | <p>The unique identifier for the document.</p> |
| [createDate] | <code>number</code> \| <code>Date</code> | <p>The creation date of the document.</p> |
| [updateDate] | <code>number</code> \| <code>Date</code> | <p>The last date the document was updated.</p> |

<a name="StorageProviderConfig"></a>

## StorageProviderConfig
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| contentDirectory | <code>string</code> | <p>The directory to store documents.</p> |
| historyDirectory | <code>string</code> | <p>The directory to store document histories.</p> |
| [extension] | <code>string</code> | <p>The file extension to use for file.</p> |
| [updateTimestamps] | <code>boolean</code> | <p>Should update times be marked at the time of edit.</p> |
| [useHistory] | <code>boolean</code> | <p>Should history entries be created.</p> |
| [useCache] | <code>boolean</code> | <p>Should we cache files in memory?</p> |
| [spacesDocument] | <code>number</code> | <p>The spaces parameter for JSON stringifying documents.</p> |
| [spacesHistory] | <code>number</code> | <p>The spaces parameter for JSON stringifying history.</p> |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | <p>The events to listen for.</p> |

