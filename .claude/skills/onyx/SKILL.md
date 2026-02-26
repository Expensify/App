---
name: onyx
description: Onyx state management patterns — useOnyx hook, action files, optimistic updates, collections, and offline-first architecture. Use when working with Onyx connections, writing action files, debugging state, or implementing API calls with optimistic data.
---

## Core Concepts

Onyx is a **persistent storage solution wrapped in a Pub/Sub library** that enables reactive, offline-first data management — key-value storage with automatic AsyncStorage persistence, reactive subscriptions, and collection management.

For the full API reference (initialization, storage providers, cache eviction, benchmarks, Redux DevTools), see https://github.com/Expensify/react-native-onyx/blob/main/README.md.

## Common Patterns

### Action File Pattern

**IMPORTANT:** Onyx state must only be modified from action files (`src/libs/actions/`). Never call `Onyx.merge`, `Onyx.set`, `Onyx.clear`, or `API.write` directly from a component.

```typescript
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setIsOffline(isNetworkOffline: boolean, reason = '') {
    if (reason) {
        Log.info(`[Network] Client is ${isNetworkOffline ? 'offline' : 'online'} because: ${reason}`);
    }
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: isNetworkOffline});
}

export {setIsOffline};
```

### Optimistic Updates Pattern

Optimistic updates allow users to see changes immediately while the API request is queued. This is fundamental to Expensify's offline-first architecture.

For **which pattern to use** (A / B / C / D) and UX behavior for each, see https://github.com/Expensify/App/blob/main/contributingGuides/philosophies/OFFLINE.md.

#### Understanding the Three Data Sets

**CRITICAL:** Backend response data is automatically applied via Pusher updates or HTTPS responses. You do NOT manually set backend data in `successData`/`failureData` — only UI state cleanup goes there.

1. **optimisticData** (Applied immediately, before the API call)
   - Mirrors what the backend would return on success
   - Gives the user instant feedback without waiting for the server
   - Often includes `pendingAction` to flag the change as in-flight (e.g. greying out a comment while offline)
   - `pendingAction` is cleared once `successData` or `failureData` is applied

2. **successData** (Applied when API succeeds)
   - Used for UI state cleanup: clearing `pendingAction`, setting `isLoading: false`
   - For `add` actions: often not needed (optimisticData already set the right state)
   - For `update`/`delete` actions: include to clear pending state

3. **failureData** (Applied when API fails)
   - Reverts optimisticData changes
   - Clears `pendingAction`.
   - Adds `errors` field for the user to see
   - Always include this to handle unexpected failures

For code examples of each pattern (A/B, loading state, `finallyData`), see [offline-patterns.md](offline-patterns.md).

## Performance Optimization

### 1. Subscribe to Specific Collection Members

```typescript
// BAD: re-renders on any report change
const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
const myReport = allReports[`report_${reportID}`];

// GOOD: re-renders only when this report changes
const [myReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
```

### 2. Use Selectors to Narrow Re-renders

```typescript
const accountIDSelector = (account: Account) => account?.accountID;
const [accountID] = useOnyx(ONYXKEYS.ACCOUNT, {selector: accountIDSelector});
```

`useOnyx` caches by selector reference — a new function reference on every render bypasses the cache and causes unnecessary re-renders. Prefer pure selectors defined in `src/selectors/` over inline functions. If a selector must be defined inside a component, ensure referential stability: React Compiler handles this automatically, but in components that are not compiled, wrap the selector in `useMemo`.

```typescript
// BAD: new function reference on every render defeats caching
const [accountID] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.accountID});

// GOOD: stable reference defined outside the component
// src/selectors/accountSelectors.ts
const selectAccountID = (account: Account) => account?.accountID;

// GOOD: stable reference via useMemo (for non-React-Compiler components)
const selector = useMemo(() => (account: Account) => account?.accountID, []);
const [accountID] = useOnyx(ONYXKEYS.ACCOUNT, {selector});
```

For `skipCacheCheck` (large objects) and batch collection update patterns, see https://github.com/Expensify/react-native-onyx/blob/main/README.md.

## Common Pitfalls

### Mixing set and merge on the Same Key

`Onyx.set()` calls are not batched with `Onyx.merge()` calls, which can produce race conditions:

```typescript
// BAD: merge may execute before set resolves
Onyx.set(ONYXKEYS.ACCOUNT, null);
Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true});

// GOOD: use one operation
Onyx.set(ONYXKEYS.ACCOUNT, {validated: true});
```

## Common Tasks Quick Reference

```typescript
// Update a single field
Onyx.merge(ONYXKEYS.NETWORK, {isOffline: true});

// Delete data
Onyx.set(ONYXKEYS.ACCOUNT, null);

// Subscribe in component
const [data] = useOnyx(ONYXKEYS.SOME_KEY);

// Subscribe with selector
const [field] = useOnyx(ONYXKEYS.SOME_KEY, {selector: (data) => data?.specificField});

// Update collection member
Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {unread: false});

// Batch update collection
Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, updates);

// API call with optimistic update
API.write('SomeCommand', params, {optimisticData, successData, failureData});
```

## Related Files

- https://github.com/Expensify/react-native-onyx/blob/main/README.md - Full Onyx API reference (initialization, merge/set/connect, collections, loading state, cache eviction, Redux DevTools, benchmarks)
- https://github.com/Expensify/App/blob/main/contributingGuides/philosophies/OFFLINE.md - Full offline UX patterns, decision flowchart, and when to use each pattern (A/B/C/D)
- [offline-patterns.md](offline-patterns.md) - Code examples for each optimistic update pattern
- https://github.com/Expensify/App/blob/main/src/ONYXKEYS.ts - All Onyx key definitions
- https://github.com/Expensify/App/tree/main/src/libs/actions - Action files that update Onyx
- https://github.com/Expensify/App/blob/main/src/hooks/useOnyx.ts - useOnyx hook implementation
- https://github.com/Expensify/App/tree/main/src/types/onyx - TypeScript types for Onyx data
