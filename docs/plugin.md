<a name="Plugin"></a>

## Plugin
Uttori Storage Provider - JSON File

**Kind**: global class  

* [Plugin](#Plugin)
    * [.configKey](#Plugin.configKey) ⇒ <code>String</code>
    * [.defaultConfig()](#Plugin.defaultConfig) ⇒ <code>Object</code>
    * [.register(context)](#Plugin.register)

<a name="Plugin.configKey"></a>

### Plugin.configKey ⇒ <code>String</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>Plugin</code>](#Plugin)  
**Returns**: <code>String</code> - The configuration key.  
**Example** *(Plugin.configKey)*  
```js
const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
```
<a name="Plugin.defaultConfig"></a>

### Plugin.defaultConfig() ⇒ <code>Object</code>
The default configuration.

**Kind**: static method of [<code>Plugin</code>](#Plugin)  
**Returns**: <code>Object</code> - The configuration.  
**Example** *(Plugin.defaultConfig())*  
```js
const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
```
<a name="Plugin.register"></a>

### Plugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>Plugin</code>](#Plugin)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | A Uttori-like context. |
| context.hooks | <code>Object</code> | An event system / hook system to use. |
| context.hooks.on | <code>function</code> | An event registration function. |
| context.config | <code>Object</code> | A provided configuration to use. |
| context.config.events | <code>Object</code> | An object whose keys correspong to methods, and contents are events to listen for. |

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
        query: ['storage-query'],
        update: ['storage-update'],
        validateConfig: ['validate-config'],
      },
    },
  },
};
Plugin.register(context);
```
