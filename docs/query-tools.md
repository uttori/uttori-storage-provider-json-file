## Functions

<dl>
<dt><a href="#debug">debug()</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#processQuery">processQuery(query, objects)</a> ⇒ <code>Array.&lt;object&gt;</code> | <code>number</code></dt>
<dd><p>Processes a query string.</p>
</dd>
</dl>

<a name="debug"></a>

## debug() : <code>function</code>
**Kind**: global function  
<a name="processQuery"></a>

## processQuery(query, objects) ⇒ <code>Array.&lt;object&gt;</code> \| <code>number</code>
Processes a query string.

**Kind**: global function  
**Returns**: <code>Array.&lt;object&gt;</code> \| <code>number</code> - Returns an array of all matched documents, or a count.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The SQL-like query to parse. |
| objects | <code>Array.&lt;object&gt;</code> | An array of object to search within. |

**Example**  
```js
processQuery('SELECT name FROM table WHERE age > 1 ORDER BY RANDOM LIMIT 3', [{ ... }, ...]);
➜ [{ ... }, ...]
```
