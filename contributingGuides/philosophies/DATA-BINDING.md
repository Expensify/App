# Data Binding Philosophy
The UI binds to the data stored on the local device's database (Onyx).

#### Related Philosophies
- [Onyx Data Management Philosophy](/contributingGuides/philosophies/ONYX-DATA-MANAGEMENT.md)
- [Data Flow Philosophy](/contributingGuides/philosophies/DATA-FLOW.md)

#### Terminology
- **Onyx** - A Pub/Sub library to connect the application to the data stored on disk.

## Rules
### - The UI MUST use `useOnyx` to get data and subscribe to changes of that data in Onyx
### - The UI MUST NOT call any Onyx methods directly
### - The UI MUST trigger an action when something needs to happen
For example, a person inputs data, the UI calls an action and passes the user's input.

### - The UI SHOULD anticipate missing or incomplete data
Use fallbacks and default values to handle data that can be missing.

### - The UI MUST call all action methods in parallel and not in sequence
Do not wait for one action to finish before calling another action. If you find yourself running into this problem, you should rethink how the component is built. Ask for help in our open source room and there will be plenty of people willing to help you think through a better approach. They can be tricky sometimes!

### - Action methods SHOULD not return a promise
Returning a promise is the first sign that the rule above this is being broken. Let the UI react to changes to Onyx data that is modified in the action instead.

### - Action methods (`/src/lib/actions`) SHOULD be pure functions and not access global data
Pure functions are ones that have all necessary data passed as parameters and do not create side-effects.

```ts
// GOOD ✅ — data is passed in, nothing is read from Onyx here
function getReportName(report: Report): string {
    return report.reportName ?? '';
}

// BAD ❌ — the function reaches into Onyx itself
function getReportName(reportID: string): string {
    const report = someOnyxCache[reportID];
    return report?.reportName ?? '';
}
```

### - Library files that are not connected or associated to any UI SHOULD use `Onyx.connectWithoutView()` to subscribe to changes in Onyx data
Library files are located in `/src/lib` but excluding the actions in `/src/lib/actions` which have their own rule above.

`useOnyx()` is the standard for accessing Onyx data for React components. Non-React library files should always prefer using pure functions that receive all data as parameters. `Onyx.connectWithoutView()` should only be used when a library file is unable to get the data with `useOnyx()` (eg. non-React code, network layer, etc.). Never add a reference to `Onyx.connectWithoutView()` just because nearby code uses it. See [Reading Onyx data: `useOnyx` vs `Onyx.connectWithoutView`](/contributingGuides/philosophies/ONYX-DATA-MANAGEMENT.md#reading-onyx-data-useonyx-vs-onyxconnectwithoutview) for the full rules.

```ts
// GOOD ✅ — non-React network layer keeps the auth token in module state
let authToken: string | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        authToken = session?.authToken;
    },
});
```

Exclusions:
- If a library method is used by an action method (like a utility), then follow the rule above for action methods.
