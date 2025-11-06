<!---These docs were automatically generated. Do not edit them directly run `npm run build:docs` script-->

# API Reference

## Functions

<dl>
<dt><a href="#init">init()</a></dt>
<dd><p>Initialize the store with actions and listening for storage events</p>
</dd>
<dt><a href="#connect">connect(connectOptions)</a> ⇒</dt>
<dd><p>Connects to an Onyx key given the options passed and listens to its changes.
This method will be deprecated soon. Please use <code>Onyx.connectWithoutView()</code> instead.</p>
</dd>
<dt><a href="#connectWithoutView">connectWithoutView(connectOptions)</a> ⇒</dt>
<dd><p>Connects to an Onyx key given the options passed and listens to its changes.</p>
</dd>
<dt><a href="#disconnect">disconnect(connection)</a></dt>
<dd><p>Disconnects and removes the listener from the Onyx key.</p>
</dd>
<dt><a href="#set">set(key, value, options)</a></dt>
<dd><p>Write a value to our store with the given key</p>
</dd>
<dt><a href="#multiSet">multiSet(data)</a></dt>
<dd><p>Sets multiple keys and values</p>
</dd>
<dt><a href="#merge">merge()</a></dt>
<dd><p>Merge a new value into an existing value at a key.</p>
<p>The types of values that can be merged are <code>Object</code> and <code>Array</code>. To set another type of value use <code>Onyx.set()</code>.
Values of type <code>Object</code> get merged with the old value, whilst for <code>Array</code>&#39;s we simply replace the current value with the new one.</p>
<p>Calls to <code>Onyx.merge()</code> are batched so that any calls performed in a single tick will stack in a queue and get
applied in the order they were called. Note: <code>Onyx.set()</code> calls do not work this way so use caution when mixing
<code>Onyx.merge()</code> and <code>Onyx.set()</code>.</p>
</dd>
<dt><a href="#mergeCollection">mergeCollection(collectionKey, collection)</a></dt>
<dd><p>Merges a collection based on their keys.</p>
</dd>
<dt><a href="#clear">clear(keysToPreserve)</a></dt>
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
<dt><a href="#update">update(data)</a> ⇒</dt>
<dd><p>Insert API responses and lifecycle data into Onyx</p>
</dd>
<dt><a href="#setCollection">setCollection(collectionKey, collection)</a></dt>
<dd><p>Sets a collection by replacing all existing collection members with new values.
Any existing collection members not included in the new data will be removed.</p>
</dd>
</dl>

<a name="init"></a>

## init()
Initialize the store with actions and listening for storage events

**Kind**: global function  
<a name="connect"></a>

## connect(connectOptions) ⇒
Connects to an Onyx key given the options passed and listens to its changes.
This method will be deprecated soon. Please use `Onyx.connectWithoutView()` instead.

**Kind**: global function  
**Returns**: The connection object to use when calling `Onyx.disconnect()`.  

| Param | Description |
| --- | --- |
| connectOptions | The options object that will define the behavior of the connection. |
| connectOptions.key | The Onyx key to subscribe to. |
| connectOptions.callback | A function that will be called when the Onyx data we are subscribed changes. |
| connectOptions.waitForCollectionCallback | If set to `true`, it will return the entire collection to the callback as a single object. |
| connectOptions.selector | This will be used to subscribe to a subset of an Onyx key's data. **Only used inside `useOnyx()` hook.**        Using this setting on `useOnyx()` can have very positive performance benefits because the component will only re-render        when the subset of data changes. Otherwise, any change of data on any property would normally        cause the component to re-render (and that can be expensive from a performance standpoint). |

**Example**  
```ts
const connection = Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: onSessionChange,
});
```
<a name="connectWithoutView"></a>

## connectWithoutView(connectOptions) ⇒
Connects to an Onyx key given the options passed and listens to its changes.

**Kind**: global function  
**Returns**: The connection object to use when calling `Onyx.disconnect()`.  

| Param | Description |
| --- | --- |
| connectOptions | The options object that will define the behavior of the connection. |
| connectOptions.key | The Onyx key to subscribe to. |
| connectOptions.callback | A function that will be called when the Onyx data we are subscribed changes. |
| connectOptions.waitForCollectionCallback | If set to `true`, it will return the entire collection to the callback as a single object. |
| connectOptions.selector | This will be used to subscribe to a subset of an Onyx key's data. **Only used inside `useOnyx()` hook.**        Using this setting on `useOnyx()` can have very positive performance benefits because the component will only re-render        when the subset of data changes. Otherwise, any change of data on any property would normally        cause the component to re-render (and that can be expensive from a performance standpoint). |

**Example**  
```ts
const connection = Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: onSessionChange,
});
```
<a name="disconnect"></a>

## disconnect(connection)
Disconnects and removes the listener from the Onyx key.

**Kind**: global function  

| Param | Description |
| --- | --- |
| connection | Connection object returned by calling `Onyx.connect()` or `Onyx.connectWithoutView()`. |

**Example**  
```ts
const connection = Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: onSessionChange,
});

Onyx.disconnect(connection);
```
<a name="set"></a>

## set(key, value, options)
Write a value to our store with the given key

**Kind**: global function  

| Param | Description |
| --- | --- |
| key | ONYXKEY to set |
| value | value to store |
| options | optional configuration object |

<a name="multiSet"></a>

## multiSet(data)
Sets multiple keys and values

**Kind**: global function  

| Param | Description |
| --- | --- |
| data | object keyed by ONYXKEYS and the values to set |

**Example**  
```js
Onyx.multiSet({'key1': 'a', 'key2': 'b'});
```
<a name="merge"></a>

## merge()
Merge a new value into an existing value at a key.

The types of values that can be merged are `Object` and `Array`. To set another type of value use `Onyx.set()`.
Values of type `Object` get merged with the old value, whilst for `Array`'s we simply replace the current value with the new one.

Calls to `Onyx.merge()` are batched so that any calls performed in a single tick will stack in a queue and get
applied in the order they were called. Note: `Onyx.set()` calls do not work this way so use caution when mixing
`Onyx.merge()` and `Onyx.set()`.

**Kind**: global function  
**Example**  
```js
Onyx.merge(ONYXKEYS.EMPLOYEE_LIST, ['Joe']); // -> ['Joe']
Onyx.merge(ONYXKEYS.EMPLOYEE_LIST, ['Jack']); // -> ['Joe', 'Jack']
Onyx.merge(ONYXKEYS.POLICY, {id: 1}); // -> {id: 1}
Onyx.merge(ONYXKEYS.POLICY, {name: 'My Workspace'}); // -> {id: 1, name: 'My Workspace'}
```
<a name="mergeCollection"></a>

## mergeCollection(collectionKey, collection)
Merges a collection based on their keys.

**Kind**: global function  

| Param | Description |
| --- | --- |
| collectionKey | e.g. `ONYXKEYS.COLLECTION.REPORT` |
| collection | Object collection keyed by individual collection member keys and values |

**Example**  
```js
Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
    [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
    [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
});
```
<a name="clear"></a>

## clear(keysToPreserve)
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

| Param | Description |
| --- | --- |
| keysToPreserve | is a list of ONYXKEYS that should not be cleared with the rest of the data |

<a name="update"></a>

## update(data) ⇒
Insert API responses and lifecycle data into Onyx

**Kind**: global function  
**Returns**: resolves when all operations are complete  

| Param | Description |
| --- | --- |
| data | An array of objects with update expressions |

<a name="setCollection"></a>

## setCollection(collectionKey, collection)
Sets a collection by replacing all existing collection members with new values.
Any existing collection members not included in the new data will be removed.

**Kind**: global function  

| Param | Description |
| --- | --- |
| collectionKey | e.g. `ONYXKEYS.COLLECTION.REPORT` |
| collection | Object collection keyed by individual collection member keys and values |

**Example**  
```js
Onyx.setCollection(ONYXKEYS.COLLECTION.REPORT, {
    [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
    [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
});
```
