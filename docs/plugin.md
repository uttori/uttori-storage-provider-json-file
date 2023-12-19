<a name="Plugin"></a>

## Plugin
<p>Uttori Storage Provider - JSON File</p>

**Kind**: global class  

* [Plugin](#Plugin)
    * [.configKey](#Plugin.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#Plugin.defaultConfig) ⇒ <code>StorageProviderConfig</code>
    * [.register(context)](#Plugin.register)

<a name="Plugin.configKey"></a>

### Plugin.configKey ⇒ <code>string</code>
<p>The configuration key for plugin to look for in the provided configuration.
In this case the key is <code>uttori-plugin-storage-provider-json-file</code>.</p>

**Kind**: static property of [<code>Plugin</code>](#Plugin)  
**Returns**: <code>string</code> - <p>The configuration key.</p>  
**Example** *(Plugin.configKey)*  
```js
const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
```
<a name="Plugin.defaultConfig"></a>

### Plugin.defaultConfig() ⇒ <code>StorageProviderConfig</code>
<p>The default configuration.</p>

**Kind**: static method of [<code>Plugin</code>](#Plugin)  
**Returns**: <code>StorageProviderConfig</code> - <p>The configuration.</p>  
**Example** *(Plugin.defaultConfig())*  
```js
const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
```
<a name="Plugin.register"></a>

### Plugin.register(context)
<p>Register the plugin with a provided set of events on a provided Hook system.</p>

**Kind**: static method of [<code>Plugin</code>](#Plugin)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | <p>A Uttori-like context.</p> |
| context.hooks | <code>object</code> | <p>An event system / hook system to use.</p> |
| context.hooks.on | <code>function</code> | <p>An event registration function.</p> |
| context.config | <code>Record.&lt;string, StorageProviderConfig&gt;</code> | <p>A provided configuration to use.</p> |

**Example** *(Plugin.register(context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [Plugin.configKey]: {
      ...,
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
    },
  },
};
Plugin.register(context);
```
