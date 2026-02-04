# Onyx State Management Skill

Use this skill when working with Onyx for state management, data persistence, or optimistic updates.

## When to Use This Skill

- When implementing or modifying Onyx connections (useOnyx, Onyx.connect)
- When writing action files that update Onyx state
- When debugging state management issues
- When optimizing component re-renders related to Onyx
- When working with collection keys
- When implementing or investigating optimistic updates or API calls

## Core Concepts

### What is Onyx?

Onyx is a **persistent storage solution wrapped in a Pub/Sub library** that enables reactive, offline-first data management. It provides:

- **Key-value storage** with automatic persistence (via AsyncStorage)
- **Reactive subscriptions** that automatically update React components
- **Optimistic updates** for offline-first functionality
- **Deep merging** for partial updates
- **Collection management** for efficient list/object handling

### Architecture

```
Component → useOnyx/Onyx.connect → Cache → AsyncStorage
              ↓                       ↑
         Auto Re-render          Persistence
```

## API Reference

### Reading Data

#### useOnyx Hook (Functional Components)

**Basic Usage:**
```typescript
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

function MyComponent() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    // account contains the current value from Onyx
}
```

**With Options:**
```typescript
const [account, accountResult] = useOnyx(ONYXKEYS.ACCOUNT, {
    canBeMissing: true,  // Won't log warning if data doesn't exist
});

// Check loading state
if (accountResult.status === 'loading') {
    return <Spinner />;
}
```

**With Selector (Performance Optimization):**
```typescript
const accountIDSelector = (account: Account) => account?.accountID;

const [accountID] = useOnyx(ONYXKEYS.SESSION, {
    selector: accountIDSelector,
    canBeMissing: false,
});
```

**Collection Keys:**
```typescript
// Subscribe to specific collection member
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

// Subscribe to entire collection (returns object of all members)
const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
```

**Dependent Keys (Advanced):**
```typescript
// First subscription provides data for second
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
const policyID = report?.policyID ?? '0'; // Use '0' or undefined, NOT empty string
const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
```

#### Onyx.connect (Non-React Contexts)

```typescript
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

// Manual subscription with callback
const connectionID = Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (value) => {
        // Handle value updates
    },
});

// IMPORTANT: Always disconnect to prevent memory leaks
Onyx.disconnect(connectionID);
```

**Collection Subscription:**
```typescript
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (allReports) => {
        // allReports is an object: { report_123: {...}, report_456: {...} }
    },
    waitForCollectionCallback: true, // Get all items at once
});
```

### Writing Data

#### Onyx.merge (Partial Updates)

**Use merge for:**
- Updating specific fields
- Adding to existing data
- Most update operations

```typescript
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

// Update specific fields (deep merge)
Onyx.merge(ONYXKEYS.NETWORK, {isOffline: true});

// Update nested object properties
Onyx.merge(ONYXKEYS.ACCOUNT, {
    validated: true,
    errors: null,
});
```

**IMPORTANT: Array Behavior**
- Arrays are **replaced entirely**, not merged
- Even within objects, arrays replace

```typescript
// BAD: This will replace the entire errors array
Onyx.merge(ONYXKEYS.ACCOUNT, {
    errors: [newError], // Replaces all previous errors
});

// GOOD: If you need to append to arrays, do it in your action
const currentErrors = allErrors[key] ?? [];
Onyx.merge(key, {
    errors: [...currentErrors, newError],
});
```

#### Onyx.set (Complete Replacement)

**Use set for:**
- Deleting data (set to null)
- Complete object replacement
- Clearing fields

```typescript
// Delete data
Onyx.set(ONYXKEYS.SESSION, null);

// Complete replacement
Onyx.set(ONYXKEYS.ACCOUNT, {
    // Entire new object
    accountID: 123,
    validated: false,
});
```

#### Onyx.mergeCollection (Batch Updates)

**Use for updating multiple collection members efficiently:**

```typescript
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

// Update multiple reports at once
Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
    [`${ONYXKEYS.COLLECTION.REPORT}123`]: {lastReadTime: Date.now()},
    [`${ONYXKEYS.COLLECTION.REPORT}456`]: {lastReadTime: Date.now()},
});
```

## Common Patterns

### Action File Pattern

**Standard structure for action files:**

```typescript
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {NetworkStatus} from '@libs/NetworkConnection';

/**
 * Updates network offline status
 */
function setIsOffline(isNetworkOffline: boolean, reason = '') {
    if (reason) {
        Log.info(`[Network] Client is ${isNetworkOffline ? 'offline' : 'online'} because: ${reason}`);
    }
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: isNetworkOffline});
}

/**
 * Updates network status
 */
function setNetWorkStatus(status: NetworkStatus) {
    Onyx.merge(ONYXKEYS.NETWORK, {networkStatus: status});
}

export {setIsOffline, setNetWorkStatus};
```

### Optimistic Updates Pattern

Optimistic updates allow users to see changes immediately while the API request is queued/processed. This is fundamental to Expensify's offline-first architecture.

#### Understanding the Three Data Sets

**CRITICAL:** Backend response data is automatically applied via Pusher updates or HTTPS responses. You do NOT manually set backend data in successData/failureData.

1. **optimisticData** (Applied immediately)
   - Replicates what the backend will respond with if it succeeds
   - Shows the user instant feedback
   - Often includes `pendingAction` to show the action is in progress
   - Applied before the API call is made

2. **successData** (Applied when API succeeds)
   - **NOT backend response data** - that's applied automatically
   - Used for UI state management like:
     - Setting `isLoading: false`
     - Clearing `pendingAction`
     - Removing temporary UI states
   - Only needed for actions like `update` or `delete` (not `add`)

3. **failureData** (Applied when API fails)
   - Reverts changes made by optimisticData
   - Sets UI states like `isLoading: false`
   - Adds error messages to display to the user
   - Clears `pendingAction`
   - Always include this to handle unexpected failures

#### Pattern A: Optimistic Without Feedback

Use when the user doesn't need to know when the server operation completes.

```typescript
import * as API from '@libs/API';
import ONYXKEYS from '@src/ONYXKEYS';

function pinReport(reportID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                isPinned: true,
            },
        },
    ];

    // No successData or failureData needed - we don't care about the response
    API.write('TogglePinnedChat', {reportID}, {optimisticData});
}
```

#### Pattern B: Optimistic With Feedback

Use when the user needs to know the action is pending/succeeded/failed.

```typescript
import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import ONYXKEYS from '@src/ONYXKEYS';

function deleteReport(reportID: string) {
    // 1. optimisticData - applied immediately, shows what we expect from backend
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                // pendingAction shows the action is in progress (greyed out UI)
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        },
    ];

    // 2. successData - applied when API succeeds (NOT backend data)
    // Used for UI state cleanup
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: null, // Remove the report from Onyx
        },
    ];

    // 3. failureData - applied when API fails
    // Reverts optimistic changes and shows errors
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                // Revert optimistic changes
                statusNum: null,
                pendingAction: null,
                // Add error for user to see
                errors: {[DateUtils.getMicroseconds()]: 'Failed to delete report'},
            },
        },
    ];

    // 4. Make API call with all three update sets
    API.write('DeleteReport', {reportID}, {optimisticData, successData, failureData});
}
```

#### Example with Loading State

```typescript
function sendMessage(reportID: string, text: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                // Show loading state
                isLoading: true,
                lastMessageText: text, // Optimistic message
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                // Clear loading state (backend data is applied automatically)
                isLoading: false,
                pendingAction: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                // Revert and show error
                isLoading: false,
                lastMessageText: null, // Revert optimistic message
                pendingAction: null,
                errors: {[DateUtils.getMicroseconds()]: 'Failed to send message'},
            },
        },
    ];

    API.write('AddComment', {reportID, text}, {optimisticData, successData, failureData});
}
```

#### Using finallyData

When successData and failureData are identical, use `finallyData` instead:

```typescript
const optimisticData: OnyxUpdate[] = [...];

const finallyData: OnyxUpdate[] = [
    {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.SOME_KEY,
        value: {
            isLoading: false, // Clear loading regardless of success/failure
            pendingAction: null,
        },
    },
];

API.write('SomeCommand', params, {optimisticData, finallyData});
```

### Collection Keys

**Definition in ONYXKEYS:**
```typescript
const ONYXKEYS = {
    COLLECTION: {
        REPORT: 'report_',          // Must end with underscore
        POLICY: 'policy_',
        TRANSACTION: 'transaction_',
    },
};
```

**Usage:**
```typescript
// Individual member
const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
Onyx.merge(reportKey, {lastReadTime: Date.now()});

// Subscribe to specific member
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

// Subscribe to all members
const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
// Returns: { report_123: {...}, report_456: {...} }
```

## Performance Optimization

### 1. Use Selectors to Reduce Re-renders

```typescript
// BAD: Component re-renders whenever ANY account field changes
const [account] = useOnyx(ONYXKEYS.ACCOUNT);
const accountID = account?.accountID;

// GOOD: Component only re-renders when accountID changes
const accountIDSelector = (account: Account) => account?.accountID;
const [accountID] = useOnyx(ONYXKEYS.ACCOUNT, {selector: accountIDSelector});
```

### 2. Subscribe to Specific Collection Members

```typescript
// BAD: Subscribe to all reports when you only need one
const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
const myReport = allReports[`report_${reportID}`];

// GOOD: Subscribe to specific report
const [myReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
```

### 3. Skip Cache Check for Large Objects

```typescript
// For very large objects, skip equality check
Onyx.set(ONYXKEYS.LARGE_DATA, hugeObject, {skipCacheCheck: true});
```

### 4. Batch Collection Updates

```typescript
// BAD: Multiple individual merges
reports.forEach(report => {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.id}`, report);
});

// GOOD: Single mergeCollection call
const updates = {};
reports.forEach(report => {
    updates[`${ONYXKEYS.COLLECTION.REPORT}${report.id}`] = report;
});
Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, updates);
```

## Common Pitfalls

### 1. Mixing Set and Merge Creates Race Conditions

```typescript
// BAD: Race condition between set and merge
Onyx.set(ONYXKEYS.ACCOUNT, null);
Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true}); // May not work as expected

// GOOD: Use consistent operation
Onyx.set(ONYXKEYS.ACCOUNT, {validated: true});
```

### 2. Empty String in Dependent Keys

```typescript
// BAD: Empty string subscribes to entire collection
const policyID = report?.policyID ?? '';
const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
// If policyID is '', this subscribes to 'policy_' (entire collection!)

// GOOD: Use '0' or undefined as fallback
const policyID = report?.policyID ?? '0';
const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
```

### 3. Array Merging Confusion

```typescript
// Arrays within objects are REPLACED, not merged
Onyx.merge(ONYXKEYS.REPORT_ACTIONS, {
    actions: [newAction], // This REPLACES the entire actions array
});

// If you need to append, handle it manually
const currentActions = reportActions.actions ?? [];
Onyx.merge(ONYXKEYS.REPORT_ACTIONS, {
    actions: [...currentActions, newAction],
});
```

### 4. Memory Leaks with Onyx.connect

```typescript
// BAD: Connection never cleaned up
useEffect(() => {
    Onyx.connect({
        key: ONYXKEYS.NETWORK,
        callback: handleNetworkChange,
    });
}, []); // Memory leak!

// GOOD: Disconnect in cleanup
useEffect(() => {
    const connectionID = Onyx.connect({
        key: ONYXKEYS.NETWORK,
        callback: handleNetworkChange,
    });

    return () => {
        Onyx.disconnect(connectionID);
    };
}, []);

// BETTER: Use useOnyx hook instead
const [network] = useOnyx(ONYXKEYS.NETWORK);
```

### 5. Wrong canBeMissing Setting

```typescript
// BAD: Data should exist but marked as canBeMissing
const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
// Won't warn if session is unexpectedly missing

// GOOD: Only use canBeMissing when data truly might not exist
const [optionalData] = useOnyx(ONYXKEYS.OPTIONAL_FEATURE, {canBeMissing: true});

// GOOD: For required data, omit or set to false
const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
```

## Initialization

Onyx must be initialized at app startup:

```typescript
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

// In App.tsx or similar
Onyx.init({
    keys: ONYXKEYS,
    // Optional: custom storage provider
});
```

## Debugging Tips

### 1. Check Loading State

```typescript
const [data, result] = useOnyx(ONYXKEYS.SOME_DATA);

if (result.status === 'loading') {
    console.log('Data is being fetched into cache');
}

if (result.status === 'loaded') {
    console.log('Data is ready:', data);
}
```

### 2. Log Onyx Updates

```typescript
// Add logging to see what's changing
Onyx.connect({
    key: ONYXKEYS.DEBUG_KEY,
    callback: (value) => {
        console.log('Onyx value changed:', value);
    },
});
```

### 3. Inspect Onyx Cache

You can access Onyx's internal cache for debugging:
```typescript
// In development only
import Onyx from 'react-native-onyx';

// See what's in the cache
console.log('Current cache:', Onyx.cache.getAllKeys());
```

## Design Decisions

### Collections vs Arrays

**Use collections (individual keys) when:**
- UI components bind to individual items
- You need component-level granularity
- Example: Reports, Policies, Transactions

**Use arrays within a single key when:**
- Nothing binds to individual items
- The array is always processed as a whole
- Example: Report actions within a report

```typescript
// GOOD: Reports as collection (components bind to individual reports)
ONYXKEYS.COLLECTION.REPORT = 'report_';
// Usage: report_123, report_456, etc.

// GOOD: Actions as array (nothing binds to individual actions)
ONYXKEYS.COLLECTION.REPORT_ACTIONS = 'reportActions_';
// Value: { reportActions_123: { actions: [...] } }
```

### When to Use Optimistic Updates

**Use Pattern A (Optimistic Without Feedback) when:**
- The user should get instant feedback
- The user does NOT need to know when the change is done on the server
- The request will almost certainly succeed
- Example: Pinning a chat

**Use Pattern B (Optimistic With Feedback) when:**
- The user needs feedback that data will be sent to the server later
- The action should show as pending while offline (greyed out UI)
- The user needs to know if the action succeeded or failed
- Example: Sending a chat message, creating an expense

**Use Pattern C (Blocking Form) when:**
- A form makes a WRITE request
- Server must validate parameters that can't be validated on client
- Server response will be unknown (can't be done optimistically)
- The request is moving money
- Example: Inviting workspace members

**Use Pattern D (Full Page Blocking) when:**
- Blocking READ is being performed
- User cannot see stale data (must be fresh from server)
- App is offline and data cannot be fetched
- ONLY use in extreme cases when all other options exhausted
- Example: Fetching bank accounts from Plaid

**Never use optimistic updates for:**
- Actions that move money (unless using blocking UI)
- Data that requires server validation that can't be done client-side
- When you can't anticipate the server response

## Common Tasks Quick Reference

### Update a single field
```typescript
Onyx.merge(ONYXKEYS.NETWORK, {isOffline: true});
```

### Delete data
```typescript
Onyx.set(ONYXKEYS.ACCOUNT, null);
```

### Update multiple fields
```typescript
Onyx.merge(ONYXKEYS.ACCOUNT, {
    validated: true,
    errors: null,
});
```

### Subscribe in component
```typescript
const [data] = useOnyx(ONYXKEYS.SOME_KEY);
```

### Subscribe with selector
```typescript
const selector = (data) => data?.specificField;
const [field] = useOnyx(ONYXKEYS.SOME_KEY, {selector});
```

### Update collection member
```typescript
Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {unread: false});
```

### Batch update collection
```typescript
Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, updates);
```

### API call with optimistic update
```typescript
API.write('SomeCommand', params, {optimisticData, successData, failureData});
```

## Related Files

- `/src/ONYXKEYS.ts` - All Onyx key definitions
- `/src/libs/actions/` - Action files that update Onyx
- `/src/hooks/useOnyx.ts` - useOnyx hook implementation
- `/src/types/onyx/` - TypeScript types for Onyx data
- `/contributingGuides/philosophies/OFFLINE.md` - Offline UX patterns and when to use optimistic updates

## External Resources

- [Onyx GitHub Repository](https://github.com/Expensify/react-native-onyx)
- [Onyx README](https://github.com/Expensify/react-native-onyx/blob/main/README.md)
- [Offline UX Patterns Guide](/contributingGuides/philosophies/OFFLINE.md)
