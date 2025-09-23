# App Structure and Conventions

This is how the application architecture is structured and the conventions that MUST be followed.

#### Related Philosophies
- [Data Flow Philosophy](/contributingGuides/philosophies/DATA-FLOW.md)
- [Data Binding Philosophy](/contributingGuides/philosophies/DATA-BINDING.md)
- [Onyx Data Management Philosophy](/contributingGuides/philosophies/ONYX-DATA-MANAGEMENT.md)

#### Terminology
- **Onyx** - A persistent storage solution wrapped in a Pub/Sub library
- **Actions** - The files stored in `/src/libs/actions`
- **UI Components** - React components that comprise the user interface

## Rules

### - Onyx MUST be used for persistent data storage and state management

Onyx stores and retrieves data from persistent storage. Data is stored as key/value pairs, where the value can be anything from a single piece of data to a complex object.

Collections of data are usually NOT stored as a single key (eg. an array with multiple objects), but as individual keys+ID (eg. `report_1234`, `report_4567`, etc.). Store collections as individual keys when a component will bind directly to one of those keys. For example: reports are stored as individual keys because `OptionRow.js` binds to the individual report keys for each link. However, report actions are stored as an array of objects because nothing binds directly to a single report action.

Onyx allows other code to subscribe to changes in data, and then publishes change events whenever data is changed.

### - Components MUST subscribe to Onyx data using the proper connection methods

Anything needing to read Onyx data MUST:
1. Know what key the data is stored in (for web, you can find this by looking in the JS console > Application > IndexedDB > OnyxDB > keyvaluepairs)
2. Subscribe to changes of the data for a particular key or set of keys. React components MUST use `useOnyx()` and non-React libs MUST use `Onyx.connect()`
3. Get initialized with the current value of that key from persistent storage (Onyx does this by calling `setState()` or triggering the `callback` with the values currently on disk as part of the connection process)

Subscribing to Onyx keys MUST be done using a constant defined in `ONYXKEYS`. Each Onyx key represents either a collection of items or a specific entry in storage. For example, since all reports are stored as individual keys like `report_1234`, if code needs to know about all the reports (eg. display a list of them in the nav menu), then it MUST subscribe to the key `ONYXKEYS.COLLECTION.REPORT`.

### - Actions MUST be the sole interface for data operations

Actions are responsible for managing what is on disk. This SHOULD include:

- Subscribing to Pusher events to receive data from the server that will get put immediately into Onyx
- Making XHRs to request necessary data from the server and then immediately putting that data into Onyx
- Handling any business logic with input coming from the UI layer

### - UI Components MUST NOT directly interact with device storage

The UI layer MUST only be responsible for:

- Reflecting exactly the data that is in persistent storage by using `useOnyx()` to bind to Onyx data
- Taking user input and passing it to an action

As a convention, the UI layer MUST NOT interact with device storage directly or call `Onyx.set()` or `Onyx.merge()`. Use an action! For example, check out this action that is signing in the user:

```js
validateAndSubmitForm() {
    // validate...
    signIn(this.state.password, this.state.twoFactorAuthCode);
}
```

That action will then call `Onyx.merge()` to set default data and a loading state, then make an API request, and set the response with another `Onyx.merge()`:

```js
function signIn(password, twoFactorAuthCode) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
    Authentication.Authenticate({
        ...defaultParams,
        password,
        twoFactorAuthCode,
    })
        .then((response) => {
            Onyx.merge(ONYXKEYS.SESSION, {authToken: response.authToken});
        })
        .catch((error) => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {error: error.message});
        })
        .finally(() => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false});
        });
}
```

Keeping our `Onyx.merge()` out of the view layer and in actions helps organize things as all interactions with device storage and API handling happen in the same place. In addition, actions that are called from inside views MUST NOT ever use the `.then()` method to set loading/error states, navigate or do any additional data processing. All of this stuff SHOULD ideally go into `Onyx` and be fed back to the component via `useOnyx()`. Design your actions so they clearly describe what they will do and encapsulate all their logic in that action.

```javascript
// Bad
validateAndSubmitForm() {
    // validate...
    this.setState({isLoading: true});
    signIn()
        .then((response) => {
            if (result.jsonCode === 200) {
                return;
            }

            this.setState({error: response.message});
        })
        .finally(() => {
            this.setState({isLoading: false});
        });
}

// Good
validateAndSubmitForm() {
    // validate...
    signIn();
}
```

### - API commands SHOULD return created/updated data directly

When adding new API commands (and preferably when starting using a new one that was not yet used in this codebase) always prefer to return the created/updated data in the command itself, instead of saving and reloading. ie: if we call `CreateTransaction`, we SHOULD prefer making `CreateTransaction` return the data it just created instead of calling `CreateTransaction` then `Get` rvl=transactionList

### - Storage eviction MUST be configured for non-critical data

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
export default withOnyx({
    reportActions: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        canEvict: props => !props.isActiveReport,
    },
})(ReportActionsView);
```

## Prerequisites

Before jumping into the code, you SHOULD know or brush up on:

1. The major difference between React Native and React are the [components](https://reactnative.dev/docs/components-and-apis) that are used in the `render()` method. Everything else is exactly the same. Any React skills you have can be applied to React Native.
2. The application uses [`react-navigation`](https://reactnavigation.org/) for navigating between parts of the app.
3. [Higher Order Components](https://reactjs.org/docs/higher-order-components.html) are used to connect React components to persistent storage via [`react-native-onyx`](https://github.com/Expensify/react-native-onyx).
