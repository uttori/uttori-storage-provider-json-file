<a name="processQuery"></a>

## processQuery(query, objects) ⇒ <code>Array.&lt;object&gt;</code>
Processes a query string.

**Kind**: global function  
**Returns**: <code>Array.&lt;object&gt;</code> - Returns an array of all matched documents.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The SQL-like query to parse. |
| objects | <code>Array.&lt;object&gt;</code> | An array of object to search within. |

**Example**  
```js
processQuery('SELECT name FROM table WHERE age > 1 ORDER BY RANDOM LIMIT 3', [{ ... }, ...]);
➜ [{ ... }, ...]
```
