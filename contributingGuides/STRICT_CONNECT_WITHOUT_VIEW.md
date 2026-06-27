# Strict Requirements for `Onyx.connectWithoutView()`

## What is `connectWithoutView`

`Onyx.connectWithoutView()` is a low-level Onyx API that subscribes to Onyx data changes **without** triggering React re-renders. It is the escape hatch from `useOnyx` for code that needs reactive Onyx data but is **not** a React component.

> ⚠️ This is an intentionally narrow API. Most code should use `useOnyx`. If your code runs inside a React component, or is called from one, you should **NOT** use `connectWithoutView`.

## The Golden Rules

### ✅ DO use `connectWithoutView` ONLY when ALL of the following are true:

1. **The logic lives in a library file** (`src/libs/` or `src/libs/actions/`, but NOT `src/components/` or `src/pages/`)
2. **No React component consumes the data directly** — the data is used for business logic, not for rendering
3. **The data cannot be reasonably passed as a parameter** from a calling view (e.g., the function is called from deep in the call stack, or the module needs to maintain its own state reactively)
4. **Every new usage has a detailed explanatory comment** justifying why `connectWithoutView` is necessary and why `useOnyx` is impossible

### ❌ NEVER use `connectWithoutView` when any of the following are true:

- **The code is a React component or hook** → Use `useOnyx` instead
- **The function is called from a React component** → Pass the data via props/parameters instead
- **You moved a `useOnyx` out of a component and put it into a library function** → This is almost always wrong. The component lost reactivity and won't update when the data changes
- **The data is read once and doesn't need to stay synced** → Consider using `Onyx.get()` or passing the value as a parameter

## Why This Matters

### The React Contract

`useOnyx` is a React hook. It subscribes to **Onyx** data and tells **React** to re-render when that data changes. This is how **React** components stay in sync with the database.

`connectWithoutView` is a module-scoped imperative subscription. It updates a module-level variable. **React** has **no knowledge** of this change and will **not** re-render.

If you use `connectWithoutView` inside a function that is called from a view, the view will render stale data. When the **Onyx** data changes, the module-level variable updates, but the view won't know to re-render.

### The Subtle Trap

This anti-pattern is easy to miss during code review because the code might "work" in the first render. The problem only manifests when the **Onyx** data changes after the component has already mounted.

```tsx
// ❌ WRONG: calculateSomething is called from a View, but it reads stale data
// because connectWithoutView doesn't trigger re-renders.
import {calculateSomething} from '@/libs/calculateSomething';

function MyComponent() {
    const result = calculateSomething(); // May return stale data!
    return <Text>{result}</Text>;
}
```

```ts
// ❌ WRONG: src/libs/calculateSomething.ts
// This is tied to the UI but uses connectWithoutView — the View won't update!
let allPolicies: OnyxEntry<Policies>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (value) => {
        allPolicies = value;
    },
});

export function calculateSomething() {
    // This reads the module variable, but React won't re-render when it changes
    return Object.values(allPolicies ?? {}).length;
}
```

## Decision Checklist

Before adding `Onyx.connectWithoutView()`, verify:

- [ ] Is this code in `src/components/`, `src/pages/`, or a hook? → **STOP. Use `useOnyx`.**
- [ ] Is this code in `src/libs/` or `src/libs/actions/`? → Continue to next check
- [ ] Is the data consumed by a React component? → **STOP. Pass it as a parameter or use `useOnyx` in the component.**
- [ ] Could the caller (component or action) pass this data as a parameter? → **STOP. Refactor to pass the data.**
- [ ] Does this module truly need its own reactive, always-up-to-date copy of the data, independent of any view lifecycle? → **This is the only valid use. Proceed and write the comment.**

## Required Comment Format

Every new `connectWithoutView` call **MUST** have a JSDoc or inline comment directly above it that answers:

1. **Why `connectWithoutView` is necessary** (e.g., "No UI component subscribes to this data")
2. **Why `useOnyx` is impossible** (e.g., "This is a library function called from a non-React context")
3. **What reactive behavior this enables** (e.g., "Keeps `isNetworkOffline` in sync so network requests know when to queue")

### ✅ Good examples

**Example 1: Pure library with no view involvement**

```ts
// src/libs/CurrentUserStore.ts
// This module is not connected to the UI. It provides a synchronous getter for the current
// user's email that other library code can call. Since no React component renders this data
// directly, and we need it reactively updated (e.g., on sign-in / sign-out), connectWithoutView
// is appropriate here.
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = val?.email ?? null;
    },
});
```

**Example 2: Non-UI action layer**

```ts
// src/libs/actions/App.ts
// This is used for building reconnectApp's data. It is only accessed from action methods,
// never in a component, so connectWithoutView is correct here. Do not use useOnyx.
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_HAS_SEEN_GUIDED_SETUP,
    callback: (value) => {
        hasSeenGuidedSetup = value;
    },
});
```

**Example 3: Data caching for non-reactive logic**

```ts
// src/libs/actions/replaceOptimisticReportWithActualReport.ts
// Report actions are cached only to resolve parent actions for IOU cleanup; no UI
// subscribes to this data, so connectWithoutView() is used.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReportActions = value;
    },
});
```

**Example 4: Telemetry/debug utilities**

```ts
// src/setup/addUtilsToWindow.ts
// We have opted for connectWithoutView here as this is a debugging utility and does not
// relate to any view.
const connection = Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        // ...debug logic
    },
});
```

### ❌ Bad examples

**Example 1: Data moved from a component into a library function**

```ts
// ❌ src/libs/MyUtils.ts — WRONG: this was moved from a component that used useOnyx
let myData: OnyxEntry<MyType>;
Onyx.connectWithoutView({
    key: ONYXKEYS.MY_KEY,
    callback: (value) => {
        myData = value;
    },
});

export function getMyData(): OnyxEntry<MyType> {
    return myData; // Called from a component — the component will NOT re-render!
}
```

**Fix:** The component should use `useOnyx(ONYXKEYS.MY_KEY)` and pass the value down as a prop.

**Example 2: Library function used by a view, where data could be passed as a parameter**

```ts
// ❌ WRONG: getRate could receive `policy` as a parameter from the component
function getRate(policyID: string) {
    // allPolicies is module-level, updated via connectWithoutView
    const policy = allPolicies[policyID];
    return policy?.rate;
}
```

**Fix:** Pass the policy data from the calling component, which should use `useOnyx`.

## Summary

| Criteria | `useOnyx` | `Onyx.connectWithoutView` |
|----------|-----------|---------------------------|
| **Location** | Inside React components and hooks | Inside library files (`src/libs/`, `src/libs/actions/`) |
| **Trigger** | Triggers React re-render on data change | Updates a module variable silently |
| **Use when** | Data is rendered or consumed by the UI | Data is used for business logic, not display |
| **Called from** | React components, hooks | Non-React library code, actions |
| **Comment required** | No | **Yes — mandatory** |

## Related

- [Data Binding Philosophy](/contributingGuides/philosophies/DATA-BINDING.md)
- [Onyx Data Management Philosophy](/contributingGuides/philosophies/ONYX-DATA-MANAGEMENT.md)
- Onyx `useOnyx` documentation: https://github.com/Expensify/react-native-onyx#useonyx
