<a name="processQuery"></a>

## processQuery(query, objects) ⇒ <code>Array.&lt;object&gt;</code> \| <code>number</code>
<p>Processes a query string.</p>

**Kind**: global function  
**Returns**: <code>Array.&lt;object&gt;</code> \| <code>number</code> - <p>Returns an array of all matched documents, or a count.</p>  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | <p>The SQL-like query to parse.</p> |
| objects | <code>Array.&lt;object&gt;</code> | <p>An array of object to search within.</p> |

**Example**  
```js
processQuery('SELECT name FROM table WHERE age > 1 ORDER BY RANDOM LIMIT 3', [{ ... }, ...]);
➜ [{ ... }, ...]
```
<a name="processQuery..whereFunctions"></a>

### processQuery~whereFunctions : <code>Array.&lt;function()&gt;</code>
**Kind**: inner constant of [<code>processQuery</code>](#processQuery)  
