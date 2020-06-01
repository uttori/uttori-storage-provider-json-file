<a name="process"></a>

## process(query, objects) ⇒ <code>Array.&lt;Object&gt;</code>
Processes a query string.

**Kind**: global function  
**Returns**: <code>Array.&lt;Object&gt;</code> - Returns an array of all matched documents.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>String</code> | The SQL-like query to parse. |
| objects | <code>Array.&lt;Object&gt;</code> | An array of object to search within. |

**Example**  
```js
process('SELECT name FROM table WHERE age > 1 ORDER BY RANDOM LIMIT 3', [{ ... }, ...]);
➜ [{ ... }, ...]
```
