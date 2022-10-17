<!---These docs were automatically generated. Do not edit them directly run `npm run build-docs` script-->

# API Reference

## Functions

<dl>
<dt><a href="#connect">connect(mapping)</a> ⇒ <code>Number</code></dt>
<dd><p>Subscribes a react component&#39;s state directly to a store key</p>
</dd>
<dt><a href="#disconnect">disconnect(connectionID, [keyToRemoveFromEvictionBlocklist])</a></dt>
<dd><p>Remove the listener for a react component</p>
</dd>
<dt><a href="#notifySubscribersOnNextTick">notifySubscribersOnNextTick(key, value)</a></dt>
<dd><p>This method mostly exists for historical reasons as this library was initially designed without a memory cache and one was added later.
For this reason, Onyx works more similar to what you might expect from a native AsyncStorage with reads, writes, etc all becoming
available async. Since we have code in our main applications that might expect things to work this way it&#39;s not safe to change this
behavior just yet.</p>
</dd>
<dt><a href="#set">set(key, value)</a> ⇒ <code>Promise</code></dt>
<dd><p>Write a value to our store with the given key</p>
</dd>
<dt><a href="#multiSet">multiSet(data)</a> ⇒ <code>Promise</code></dt>
<dd><p>Sets multiple keys and values</p>
</dd>
<dt><a href="#merge">merge(key, value)</a> ⇒ <code>Promise</code></dt>
<dd><p>Merge a new value into an existing value at a key.</p>
<p>The types of values that can be merged are <code>Object</code> and <code>Array</code>. To set another type of value use <code>Onyx.set()</code>. Merge
behavior uses lodash/merge under the hood for <code>Object</code> and simple concatenation for <code>Array</code>. However, it&#39;s important
to note that if you have an array value property on an <code>Object</code> that the default behavior of lodash/merge is not to
concatenate. See here: <a href="https://github.com/lodash/lodash/issues/2872">https://github.com/lodash/lodash/issues/2872</a></p>
<p>Calls to <code>Onyx.merge()</code> are batched so that any calls performed in a single tick will stack in a queue and get
applied in the order they were called. Note: <code>Onyx.set()</code> calls do not work this way so use caution when mixing
<code>Onyx.merge()</code> and <code>Onyx.set()</code>.</p>
</dd>
<dt><a href="#clear">clear()</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Clear out all the data in the store</p>
<p>Note that calling Onyx.clear() and then Onyx.set() on a key with a default
key state may store an unexpected value in Storage.</p>
<p>E.g.
Onyx.clear();
Onyx.set(ONYXKEYS.DEFAULT_KEY, &#39;default&#39;);
Storage.getItem(ONYXKEYS.DEFAULT_KEY)
    .then((storedValue) =&gt; console.log(storedValue));
null is logged instead of the expected &#39;default&#39;</p>
<p>Onyx.set() might call Storage.setItem() before Onyx.clear() calls
Storage.setItem(). Use Onyx.merge() instead if possible. Onyx.merge() calls
Onyx.get(key) before calling Storage.setItem() via Onyx.set().
Storage.setItem() from Onyx.clear() will have already finished and the merged
value will be saved to storage after the default value.</p>
</dd>
<dt><a href="#mergeCollection">mergeCollection(collectionKey, collection)</a> ⇒ <code>Promise</code></dt>
<dd><p>Merges a collection based on their keys</p>
</dd>
<dt><a href="#update">update(data)</a></dt>
<dd><p>Insert API responses and lifecycle data into Onyx</p>
</dd>
<dt><a href="#init">init([options])</a></dt>
<dd><p>Initialize the store with actions and listening for storage events</p>
</dd>
</dl>

<a name="connect"></a>

## connect(mapping) ⇒ <code>Number</code>
Subscribes a react component's state directly to a store key

**Kind**: global function
**Returns**: <code>Number</code> - an ID to use when calling disconnect

| Param | Type | Description |
| --- | --- | --- |
| mapping | <code>Object</code> | the mapping information to connect Onyx to the components state |
| mapping.key | <code>String</code> | ONYXKEY to subscribe to |
| [mapping.statePropertyName] | <code>String</code> | the name of the property in the state to connect the data to |
| [mapping.withOnyxInstance] | <code>Object</code> | whose setState() method will be called with any changed data      This is used by React components to connect to Onyx |
| [mapping.callback] | <code>function</code> | a method that will be called with changed data      This is used by any non-React code to connect to Onyx |
| [mapping.initWithStoredValues] | <code>Boolean</code> | If set to false, then no data will be prefilled into the  component |
| [mapping.waitForCollectionCallback] | <code>Boolean</code> | If set to true, it will return the entire collection to the callback as a single object |

**Example**
```js
const connectionID = Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: onSessionChange,
});
```
<a name="disconnect"></a>

## disconnect(connectionID, [keyToRemoveFromEvictionBlocklist])
Remove the listener for a react component

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| connectionID | <code>Number</code> | unique id returned by call to Onyx.connect() |
| [keyToRemoveFromEvictionBlocklist] | <code>String</code> |  |

**Example**
```js
Onyx.disconnect(connectionID);
```
<a name="notifySubscribersOnNextTick"></a>

## notifySubscribersOnNextTick(key, value)
This method mostly exists for historical reasons as this library was initially designed without a memory cache and one was added later.
For this reason, Onyx works more similar to what you might expect from a native AsyncStorage with reads, writes, etc all becoming
available async. Since we have code in our main applications that might expect things to work this way it's not safe to change this
behavior just yet.

**Kind**: global function

| Param | Type |
| --- | --- |
| key | <code>String</code> |
| value | <code>\*</code> |

<a name="set"></a>

## set(key, value) ⇒ <code>Promise</code>
Write a value to our store with the given key

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | ONYXKEY to set |
| value | <code>\*</code> | value to store |

<a name="multiSet"></a>

## multiSet(data) ⇒ <code>Promise</code>
Sets multiple keys and values

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | object keyed by ONYXKEYS and the values to set |

**Example**
```js
Onyx.multiSet({'key1': 'a', 'key2': 'b'});
```
<a name="merge"></a>

## merge(key, value) ⇒ <code>Promise</code>
Merge a new value into an existing value at a key.

The types of values that can be merged are `Object` and `Array`. To set another type of value use `Onyx.set()`. Merge
behavior uses lodash/merge under the hood for `Object` and simple concatenation for `Array`. However, it's important
to note that if you have an array value property on an `Object` that the default behavior of lodash/merge is not to
concatenate. See here: https://github.com/lodash/lodash/issues/2872

Calls to `Onyx.merge()` are batched so that any calls performed in a single tick will stack in a queue and get
applied in the order they were called. Note: `Onyx.set()` calls do not work this way so use caution when mixing
`Onyx.merge()` and `Onyx.set()`.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | ONYXKEYS key |
| value | <code>Object</code> \| <code>Array</code> | Object or Array value to merge |

**Example**
```js
Onyx.merge(ONYXKEYS.EMPLOYEE_LIST, ['Joe']); // -> ['Joe']
Onyx.merge(ONYXKEYS.EMPLOYEE_LIST, ['Jack']); // -> ['Joe', 'Jack']
Onyx.merge(ONYXKEYS.POLICY, {id: 1}); // -> {id: 1}
Onyx.merge(ONYXKEYS.POLICY, {name: 'My Workspace'}); // -> {id: 1, name: 'My Workspace'}
```
<a name="clear"></a>

## clear() ⇒ <code>Promise.&lt;void&gt;</code>
Clear out all the data in the store

Note that calling Onyx.clear() and then Onyx.set() on a key with a default
key state may store an unexpected value in Storage.

E.g.
Onyx.clear();
Onyx.set(ONYXKEYS.DEFAULT_KEY, 'default');
Storage.getItem(ONYXKEYS.DEFAULT_KEY)
    .then((storedValue) => console.log(storedValue));
null is logged instead of the expected 'default'

Onyx.set() might call Storage.setItem() before Onyx.clear() calls
Storage.setItem(). Use Onyx.merge() instead if possible. Onyx.merge() calls
Onyx.get(key) before calling Storage.setItem() via Onyx.set().
Storage.setItem() from Onyx.clear() will have already finished and the merged
value will be saved to storage after the default value.

**Kind**: global function
<a name="mergeCollection"></a>

## mergeCollection(collectionKey, collection) ⇒ <code>Promise</code>
Merges a collection based on their keys

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| collectionKey | <code>String</code> | e.g. `ONYXKEYS.COLLECTION.REPORT` |
| collection | <code>Object</code> | Object collection keyed by individual collection member keys and values |

**Example**
```js
Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
    [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
    [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
});
```
<a name="update"></a>

## update(data)
Insert API responses and lifecycle data into Onyx

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Array</code> | An array of objects with shape {onyxMethod: oneOf('set', 'merge', 'mergeCollection'), key: string, value: *} |

<a name="init"></a>

## init([options])
Initialize the store with actions and listening for storage events

**Kind**: global function

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | config object |
| [options.keys] | <code>Object</code> | <code>{}</code> | `ONYXKEYS` constants object |
| [options.initialKeyStates] | <code>Object</code> | <code>{}</code> | initial data to set when `init()` and `clear()` is called |
| [options.safeEvictionKeys] | <code>Array.&lt;String&gt;</code> | <code>[]</code> | This is an array of keys (individual or collection patterns) that when provided to Onyx are flagged as "safe" for removal. Any components subscribing to these keys must also implement a canEvict option. See the README for more info. |
| [options.maxCachedKeysCount] | <code>Number</code> | <code>55</code> | Sets how many recent keys should we try to keep in cache Setting this to 0 would practically mean no cache We try to free cache when we connect to a safe eviction key |
| [options.captureMetrics] | <code>Boolean</code> |  | Enables Onyx benchmarking and exposes the get/print/reset functions |
| [options.shouldSyncMultipleInstances] | <code>Boolean</code> |  | Auto synchronize storage events between multiple instances of Onyx running in different tabs/windows. Defaults to true for platforms that support local storage (web/desktop) |
| [option.keysToDisableSyncEvents] | <code>Array.&lt;String&gt;</code> | <code>[]</code> | Contains keys for which we want to disable sync event across tabs. |

**Example**
```js
Onyx.init({
    keys: ONYXKEYS,
    initialKeyStates: {
        [ONYXKEYS.SESSION]: {loading: false},
    },
});
```
