# `react-native-onyx`
Awesome persistent storage solution wrapped in a Pub/Sub library.

# Features

- Onyx stores and retrieves data from persistent storage
- Data is stored as key/value pairs, where the value can be anything from a single piece of data to a complex object
- Collections of data are usually not stored as a single key (e.g. an array with multiple objects), but as individual keys+ID (e.g. `report_1234`, `report_4567`, etc.). Store collections as individual keys when a component will bind directly to one of those keys. For example: reports are stored as individual keys because `SidebarLink.js` binds to the individual report keys for each link. However, report actions are stored as an array of objects because nothing binds directly to a single report action.
- Onyx allows other code to subscribe to changes in data, and then publishes change events whenever data is changed
- Anything needing to read Onyx data needs to:
    1. Know what key the data is stored in (for web, you can find this by looking in the JS console > Application > local storage)
    2. Subscribe to changes of the data for a particular key or set of keys. React function components use the `useOnyx()` hook and non-React libs use `Onyx.connect()`.
    3. Get initialized with the current value of that key from persistent storage (Onyx does this by calling `setState()` or triggering the `callback` with the values currently on disk as part of the connection process)
- Subscribing to Onyx keys is done using a constant defined in `ONYXKEYS`. Each Onyx key represents either a collection of items or a specific entry in storage. For example, since all reports are stored as individual keys like `report_1234`, if code needs to know about all the reports (e.g. display a list of them in the nav menu), then it would subscribe to the key `ONYXKEYS.COLLECTION.REPORT`.

# Getting Started

## Installation

Onyx is published to [`npm`](https://www.npmjs.com/package/react-native-onyx)

```shell
npm install react-native-onyx --save
```

## Initialization

To initialize Onyx we call `Onyx.init()` with a configuration object.

```javascript
import Onyx from 'react-native-onyx';

const ONYXKEYS = {
    SESSION: 'session',
};

const config = {
    keys: ONYXKEYS,
};

Onyx.init(config);
```

### Usage in non react-native projects
Onyx can be used in non react-native projects, by leveraging the `browser` field in `package.json`
Bundlers like Webpack respect that field and import code from the specified path
We import Onyx the same way shown above - `import Onyx from 'react-native-onyx'`

## Setting data

To store some data we can use the `Onyx.set()` method.

```javascript
API.Authenticate(params)
    .then((response) => {
        Onyx.set(ONYXKEYS.SESSION, {token: response.token});
    });
```

The data will then be cached and stored via [`AsyncStorage`](https://github.com/react-native-async-storage/async-storage).

### Performance Options for Large Objects

For performance-critical scenarios with large objects, `Onyx.set()` accepts optional flag to skip expensive operations:

```javascript
Onyx.set(ONYXKEYS.LARGE_DATA, computedValue, {
    skipCacheCheck: true,     // Skip deep equality check
});
```

**Options:**
- `skipCacheCheck`: Skips the deep equality comparison with the cached value. By default, Onyx compares new values against cached ones to avoid unnecessary updates. For large objects, this comparison can be expensive.

#### When to Use SetOptions
- **Use `skipCacheCheck: true`** for:
  - Large objects where deep equality checking is expensive
  - Values that you know have changed

**Note**: These option is recommended only for large objects where performance is critical. Most use cases should use the standard `Onyx.set(key, value)` syntax.

## Merging data

We can also use `Onyx.merge()` to merge new `Object` or `Array` data in with existing data.

For `Array` the default behavior is to replace it fully, effectively making it equivalent to set:

```javascript
Onyx.merge(ONYXKEYS.EMPLOYEE_LIST, ['Joe']); // -> ['Joe']
Onyx.merge(ONYXKEYS.EMPLOYEE_LIST, ['Jack']); // -> ['Jack']
```

For `Object` values the default behavior uses `lodash/merge` under the hood to do a deep extend of the object.

```javascript
Onyx.merge(ONYXKEYS.POLICY, {id: 1}); // -> {id: 1}
Onyx.merge(ONYXKEYS.POLICY, {name: 'My Workspace'}); // -> {id: 1, name: 'My Workspace'}
```

Arrays inside objects will be replaced fully, same as arrays not inside objects:

```javascript
Onyx.merge(ONYXKEYS.POLICY, {employeeList: ['Joe', 'Jack']}); // -> {employeeList: ['Joe', 'Jack']}
Onyx.merge(ONYXKEYS.POLICY, {employeeList: ['Jack']}); // -> {employeeList: ['Jack']}
```

### Should I use `merge()` or `set()` or both?

- Use `merge()` when creating a new object
- Use `merge()` to merge partial data into an existing object
- Use `merge()` when storing simple values (`String`, `Boolean`, `Number`)
- Use `set()` when you need to delete an Onyx key completely from storage
- Use `set()` when you need to completely reset an object or array of data

Consecutive calls to `Onyx.merge()` with the same key are batched in a stack and processed in the order that they were called. This helps avoid race conditions where one merge possibly finishes before another. However, it's important to note that calls to `Onyx.set()` are not batched together with calls to `Onyx.merge()`. For this reason, it is usually preferable to use one or the other, but not both. Onyx is a work-in-progress so always test code to make sure assumptions are correct!

### Should I store things as an array or an object?

You should avoid arrays as much as possible. They do not work well with `merge()` because it can't update a single element in an array, it must always set the entire array each time. This forces you to use `set()` a lot, and as seen above, `merge()` is more performant and better to use in almost any situation. If you are working with an array of objects, then you should be using an Onyx collection because it's optimized for working with arrays of objects.

## Subscribing to data changes

To set up a basic subscription for a given key use the `Onyx.connect()` method.

```javascript
let session;
const connectionID = Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => session = val || {},
});
```

To teardown the subscription call `Onyx.disconnect()` with the `connectionID` returned from `Onyx.connect()`. It's recommended to clean up subscriptions anytime you are connecting from within a function to prevent memory leaks.

```javascript
Onyx.disconnect(connectionID);
```

We can also access values inside React function components via the `useOnyx()` [hook](https://react.dev/reference/react/hooks). When the data changes the component will re-render.

```javascript
import React from 'react';
import {useOnyx} from 'react-native-onyx';

const App = () => {
    const [session] = useOnyx('session');
    
    return (
        <View>
            {session.token ? <Text>Logged in</Text> : <Text>Logged out</Text>}
        </View>
    );
};

export default App;
```

The `useOnyx()` hook won't delay the rendering of the component using it while the key/entity is being fetched and passed to the component. However, you can simulate this behavior by checking if the `status` of the hook's result metadata is `loading`. When `status` is `loading` it means that the Onyx data is being loaded into cache and thus is not immediately available, while `loaded` means that the data is already loaded and available to be consumed.

```javascript
const [reports, reportsResult] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
const [session, sessionResult] = useOnyx(ONYXKEYS.SESSION);

if (reportsResult.status === 'loading' || sessionResult.status === 'loading') {
    return <Placeholder />; // or `null` if you don't want to render anything.
}

// rest of the component's code.
```

### Dependent Onyx Keys and useOnyx()
Some components need to subscribe to multiple Onyx keys at once and sometimes, one key might rely on the data from another key. This is similar to a JOIN in SQL.

Example: To get the policy of a report, the `policy` key depends on the `report` key.

```javascript
const App = ({reportID}) => {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`);

    return (
        <View>
            {/* Render with policy data */}
        </View>
    );
};

export default App;
```

**Detailed explanation of how this is handled and rendered with `useOnyx()`:**

1. The component mounts with a `reportID={1234}` prop.
2. The `useOnyx` hook evaluates the mapping and subscribes to the key `reports_1234` using the `reportID` prop.
3. The `useOnyx` hook fetches the data for the key `reports_1234` from Onyx and sets the state with the initial value (if provided).
4. Since `report` is not defined yet, `report?.policyID` defaults to `undefined`. The `useOnyx` hook subscribes to the key `policies_undefined`.
5. The `useOnyx` hook reads the data and updates the state of the component:
   - `report={{reportID: 1234, policyID: 1, ...rest of the object...}}`
   - `policy={undefined}` (since there is no policy with ID `undefined`)
6. The `useOnyx` hook again evaluates the key `policies_1` after fetching the updated `report` object which has `policyID: 1`.
7. The `useOnyx` hook reads the data and updates the state with:
   - `policy={{policyID: 1, ...rest of the object...}}`
8. Now, all mappings have values that are defined (not undefined), and the component is rendered with all necessary data.
  
* It is VERY important to NOT use empty string default values like `report.policyID || ''`. This results in the key returned to `useOnyx` as `policies_`, which subscribes to the ENTIRE POLICY COLLECTION and is most assuredly not what you were intending. You can use a default of `0` (as long as you are reasonably sure that there is never a policyID=0). This allows Onyx to return `undefined` as the value of the policy key, which is handled by `useOnyx` appropriately.

It's also beneficial to use a [selector](https://github.com/Expensify/react-native-onyx/blob/main/API.md#connectmapping--number) with the mapping in case you need to grab a single item in a collection (like a single report action).

### useOnyx()'s `canBeMissing` option

You must pass the `canBeMissing` configuration flag to `useOnyx` if you want the hook to log an alert when data is missing from Onyx store. Regarding usage in `Expensify/App` repo, if the component calling this is the one loading the data by calling an action, then you should set this to `true`. If the component calling this does not load the data then you should set it to `false`, which means that if the data is not there, it will log an alert, as it means we are using data that no one loaded and that's most probably a bug.

```javascript
const Component = ({reportID}) => {
    // This hook will log an alert (via `Logger.logAlert()`) if `report` is `undefined`.
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    
    // rest of the component's code.
};

export default Component;
```

## Collections

Collections allow keys with similar value types to be subscribed together by subscribing to the collection key. To define one, it must be included in the `ONYXKEYS.COLLECTION` object and it must be suffixed with an underscore. Member keys should use a unique identifier or index after the collection key prefix (e.g. `report_42`).

```javascript
const ONYXKEYS = {
    COLLECTION: {
        REPORT: 'report_',
    },
};
```

### Setting Collection Values

To save a new collection key we can either do:

```js
Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`, report1);
```

or we can set many at once with `mergeCollection()` (see below for guidance on best practices):

```js
Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
});
```

### Subscribing to Collections

There are several ways to subscribe to these keys:

```javascript
const MyComponent = () => {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    return (
        <View>
            {/* Render with allReports data */}
        </View>
    );
};

export default MyComponent;
```

This will add a prop to the component called `allReports` which is an object of collection member key/values. Changes to the individual member keys will modify the entire object and new props will be passed with each individual key update. The prop doesn't update on the initial rendering of the component until the entire collection has been read out of Onyx.

```js
Onyx.connect({key: ONYXKEYS.COLLECTION.REPORT}, callback: (memberValue, memberKey) => {...});
```

This will fire the callback once per member key depending on how many collection member keys are currently stored. Changes to those keys after the initial callbacks fire will occur when each individual key is updated.

```js
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (allReports, collectionKey, sourceValue) => {...},
});
```

This final option forces `Onyx.connect()` to behave more like `useOnyx()` and only update the callback once with the entire collection initially and later with an updated version of the collection when individual keys update. The `sourceValue` parameter contains only the specific keys and values that triggered the current update, which can be useful for optimizing your code to only process what changed. This parameter is not available when `waitForCollectionCallback` is false or the key is not a collection key.

### Performance Considerations When Using Collections

Be cautious when using collections as things can get out of hand if you have a subscriber hooked up to a collection key that has large numbers of individual keys. If this is the case, it is critical to use `mergeCollection()` over `merge()`.

Remember, `mergeCollection()` will notify a subscriber only *once* with the total collected values whereas each call to `merge()` would re-render a connected component *each time it is called*. Consider this example where `reports` is an array of reports that we want to index and save.

```js
// Bad
_.each(reports, report => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report)); // -> A component using useOnyx() will have it's state updated with each iteration

// Good
const values = {};
_.each(reports, report => values[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report);
Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, values); // -> A component using useOnyx() will only have its state updated once
```

## Clean up

To clear all data from `Onyx` we can use `Onyx.clear()`.

```javascript
function signOut() {
    Onyx.clear();
}
```

## Storage Providers
`Onyx.get`, `Onyx.set`, and the rest of the API accesses the underlying storage
differently depending on the platform

Under the hood storage access calls are delegated to a [`StorageProvider`](lib/storage/index.js)
Some platforms (like web and desktop) might use the same storage provider

If a platform needs to use a separate library (like using MMVK for react-native) it should be added in the following way:
1. Create a `StorageProvider.js` at [lib/storage/providers](lib/storage/providers)
   Reference an existing [StorageProvider](lib/storage/providers/AsyncStorage.js) for the interface that has to be implemented
2. Update the factory at [lib/storage/index.js](lib/storage/index.js) and [lib/storage/index.native.js](lib/storage/index.native.js) to return the newly created Provider for the desired Platform(s)

# API Reference

[Docs](./API.md)

# Cache Eviction

Different platforms come with varying storage capacities and Onyx has a way to gracefully fail when those storage limits are encountered. When Onyx fails to set or modify a key the following steps are taken:
1. Onyx looks at a list of recently accessed keys (access is defined as subscribed to or modified) and locates the key that was least recently accessed
2. It then deletes this key and retries the original operation

By default, Onyx will not evict anything from storage and will presume all keys are "unsafe" to remove unless explicitly told otherwise.

**To flag a key as safe for removal:**
- Add the key to the `evictableKeys` option in `Onyx.init(options)`
- Implement `canEvict` in the Onyx config for each component subscribing to a key
- The key will only be deleted when all subscribers return `true` for `canEvict`

e.g.
```js
Onyx.init({
    evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
});
```

```js
const ReportActionsView = ({reportID, isActiveReport}) => {
    const [reportActions] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}_`,
        {canEvict: () => !isActiveReport}
    );

    return (
        <View>
            {/* Render with reportActions data */}
        </View>
    );
};

export default ReportActionsView;
```

# Benchmarks

Provide the `captureMetrics` boolean flag to `Onyx.init` to capture call statistics

```js
Onyx.init({
    keys: ONYXKEYS,
    evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    captureMetrics: Config.BENCHMARK_ONYX,
});
```

At any point you can get the collected statistics using `Onyx.getMetrics()`.
This will return an object containing `totalTime`, `averageTime` and `summaries`.
`summaries` is a collection of statistics for each method it contains data about:
  - method name
  - total, max, min, average times for this method calls
  - calls - a list of individual calls with each having: start time; end time; call duration; call arguments
    - start/end times are relative to application launch time - 0.00 being exactly at launch

If you wish to reset the metrics and start over use `Onyx.resetMetrics()`

Finally, there's a `Onyx.printMetrics()` method which prints human statistics information on the dev console. You can use this method during debugging. For example add an `Onyx.printMetrics()` line somewhere in code or call it through the dev console. It supports 3 popular formats *MD* - human friendly markdown, *CSV* and *JSON*. The default is MD if you want to print another format call `Onyx.printMetrics({ format: 'csv' })` or
`Onyx.printMetrics({ format: 'json' })`.

Sample output of `Onyx.printMetrics()`

```
### Onyx Benchmark
  - Total: 1.5min
  - Last call finished at: 12.55sec

|     method      | total time spent |    max    |   min    |    avg    | time last call completed | calls made |
|-----------------|-----------------:|----------:|---------:|----------:|-------------------------:|-----------:|
| Onyx:getAllKeys |           1.2min |   2.16sec |  0.159ms | 782.230ms |                 12.55sec |         90 |
| Onyx:merge      |          4.73sec |   2.00sec | 74.412ms | 591.642ms |                 10.24sec |          8 |
| Onyx:set        |          3.90sec | 846.760ms | 43.663ms | 433.056ms |                  7.47sec |          9 |
| Onyx:get        |          8.87sec |   2.00sec |  0.063ms |  61.998ms |                 10.24sec |        143 |


|                           Onyx:set                            |
|---------------------------------------------------------------|
| start time | end time  | duration  |           args           |
|-----------:|----------:|----------:|--------------------------|
|  291.042ms | 553.079ms | 262.037ms | session, [object Object] |
|  293.719ms | 553.316ms | 259.597ms | account, [object Object] |
|  294.541ms | 553.651ms | 259.109ms | network, [object Object] |
|  365.378ms | 554.246ms | 188.867ms | iou, [object Object]     |
|    1.08sec |   2.20sec |   1.12sec | network, [object Object] |
|    1.08sec |   2.20sec |   1.12sec | iou, [object Object]     |
|    1.17sec |   2.20sec |   1.03sec | currentURL, /            |
```

# Debug mode

It can be useful to log why Onyx is calling `setState()` on a particular React component so that we can understand which key changed, what changed about the value, and the connected component that ultimately rendered as a result. When used correctly this can help isolate problem areas and unnecessary renders in the code. To enable this feature, pass `debugSetState: true` to the config and grep JS console logs for `[Onyx-Debug]`.

# Redux DevTools Extension

If you want to debug updates made to the local storage on the web app, you can use Redux DevTools Extension, which provides an easy to use GUI.
This extension provides the following features:

- Each update (merge/set/clear/etc) made to the local storage is logged with the data that was written or erased.
- Check the state of the local storage at a certain point in time and compare it with it's  previous state.

Currently this tool is only available on Web.

### Installing the extension

To use the extension, simply install it from your favorite web browser store:

- [Google Chrome](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?pli=1)
- [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei)
- [Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

### Enabling or Disabling Redux DevTools

You can control whether the Redux DevTools integration is enabled by setting the `enableDevTools` option in the `Onyx.init()` configuration.

- To **enable** Redux DevTools and start logging updates to local storage, set `enableDevTools: true`.
- To **disable** Redux DevTools and prevent any logging to the extension, set `enableDevTools: false`.

This option defaults to `true` (enabled) on Web, so you only need to set it to `false` if you want to disable the integration.

```javascript
import Onyx from 'react-native-onyx';
import Config from './config';

Onyx.init({
    keys: ONYXKEYS,
    enableDevTools: Config.ENABLE_ONYX_DEVTOOLS,
});
```

### Usage

The extension interface is pretty simple, on the left sidebar you can see all the updates made to the local storage, in ascending order, and on the right pane you can see the whole the current state, payload of an action and the diff between the previous state and the current state after the action was triggered.

The action logs use this naming convention:

`@@INIT` - Initial action which is triggered when Onyx connects to the extension. It's payload consists of the initial state.

`merge/<KEY>` - Merge action which is triggered when `Onyx.merge()` is called.

`mergecollection/<KEY>` - Merge action which is triggered when `Onyx.mergeCollection()` is called.

`set/<KEY>` - Set action which is triggered when `Onyx.set()` is called.

`multiset/<KEY>` - Set action which is triggered when `Onyx.multiSet()` is called.

`CLEAR` - Clear action which is triggered when `Onyx.clear()` is called.

# Development

React Native bundles source code using the `metro` bundler. Until React Native 0.73, `metro` does not follow symlinks, so we can't use `npm link` to
link a local version of Onyx during development. Fortunately, we have set up a workflow that's easy to follow and enables
you to edit the Onyx source directly in the Onyx repo, and have those changes hot-reload in a React Native project in realtime.

1. In one terminal tab, open the `react-native-onyx` directory and run `npm run build:watch`
2. In another terminal tab, open your React Native project and run `npx link publish <path_to_onyx_directory_on_your_machine>`
3. Then run your React Native project as normal!

Now you can make changes directly to the `react-native-onyx` source code and your React Native project should-hot reload with those changes in realtime.

_Note:_ If you want to unlink `react-native-onyx`, simply run `npm install` from your React Native project directory again. That will reinstall `react-native-onyx` from npm.
