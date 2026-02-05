# Onyx Patterns

Patterns for efficient data access using React Native Onyx in the Expensify App.

## Overview

Onyx is Expensify's custom data persistence layer for offline-first functionality. Key concepts:

- **Keys**: Defined in `ONYXKEYS.ts` - centralized key definitions
- **Collections**: Prefixed keys for related data (e.g., `report_123`, `policy_456`)
- **Subscriptions**: Components subscribe to keys and re-render when data changes
- **Selectors**: Transform data before it reaches the component, controlling re-render scope

## Use Selectors for Specific Fields

**Do**: Select only the fields your component needs
**Avoid**: Subscribing to entire objects when using only some fields

```tsx
// Do: Select specific fields
const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`, {
  selector: (user) => ({
    name: user?.name,
    avatar: user?.avatar,
  }),
});
// Re-renders only when name or avatar changes

// Avoid: Subscribe to entire object
const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`);
// Re-renders when ANY user field changes (email, settings, etc.)
return <Text>{user?.name}</Text>;  // Only uses name!
```

**Why**: Without selectors, every field change triggers re-render, even if the component doesn't use that field.

**When selectors aren't needed**:
- Component genuinely uses most/all fields
- Data structure is small and stable
- Performance isn't a concern for this component

---

## OnyxListItemProvider for List Rendering

**Do**: Use hooks from `OnyxListItemProvider` for data in list items
**Avoid**: Individual `useOnyx` calls in components rendered by `renderItem`

```tsx
// Do: Use provider hooks
function ReportListItem({ reportID }) {
  const personalDetails = usePersonalDetails();  // From provider
  const report = useReport(reportID);            // From provider
  // Single shared subscription, optimized for lists
}

// Avoid: Individual subscriptions per item
function ReportListItem({ reportID }) {
  const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
  const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
  // Creates new subscriptions for EVERY list item!
}
```

**Why**: In a list with 100 items, individual `useOnyx` creates 100 separate subscriptions. `OnyxListItemProvider` shares one subscription across all items.

**Available provider hooks**:
- `usePersonalDetails()` - Personal details for all users
- `useReport(reportID)` - Specific report data
- Check `OnyxListItemProvider` for full list

---

## Collection Keys

**Do**: Use proper collection key format with ID suffix
**Avoid**: Hardcoding full keys or wrong formats

```tsx
// Do: Collection key pattern
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

// Common collections:
// ONYXKEYS.COLLECTION.REPORT       - report_{reportID}
// ONYXKEYS.COLLECTION.POLICY       - policy_{policyID}
// ONYXKEYS.COLLECTION.TRANSACTION  - transaction_{transactionID}
// ONYXKEYS.COLLECTION.REPORT_ACTIONS - reportActions_{reportID}

// Avoid
const [report] = useOnyx('report_123');  // Hardcoded
const [report] = useOnyx(ONYXKEYS.REPORT);  // Wrong - not a collection
```

---

## Selector Memoization

**Do**: Define selectors outside component or memoize them
**Avoid**: Creating new selector functions on every render

```tsx
// Do: Selector outside component
const userSelector = (user) => ({ name: user?.name, avatar: user?.avatar });

function UserProfile({ userId }) {
  const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`, {
    selector: userSelector,
  });
}

// Or: Memoized selector
function UserProfile({ userId }) {
  const selector = useCallback(
    (user) => ({ name: user?.name, avatar: user?.avatar }),
    []
  );
  const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`, { selector });
}

// Avoid: Inline selector (creates new function every render)
function UserProfile({ userId }) {
  const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`, {
    selector: (user) => ({ name: user?.name }),  // New function each render!
  });
}
```

**Why**: New selector reference on each render can cause unnecessary subscription updates.

---

## canBeMissing and allowStaleData

**Do**: Use appropriate flags for your use case

```tsx
// Data that might not exist yet (e.g., during loading)
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
  canBeMissing: true,  // Don't error if key doesn't exist
});

// Data where stale is OK (e.g., cached values during transition)
const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
  allowStaleData: true,  // Use cached value while loading fresh
  canBeMissing: true,
});
```

**canBeMissing**: Use when key might not exist in Onyx (e.g., new report being created).

**allowStaleData**: Use when showing stale data during loading is acceptable.

---

## Avoid Redundant Subscriptions

**Do**: Subscribe once at appropriate level, pass data down
**Avoid**: Multiple components subscribing to same data independently

```tsx
// Do: Parent subscribes, passes to children
function ReportScreen({ reportID }) {
  const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

  return (
    <>
      <ReportHeader reportName={report?.reportName} />
      <ReportBody messages={report?.messages} />
    </>
  );
}

// Avoid: Each child subscribes independently
function ReportHeader({ reportID }) {
  const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
  return <Text>{report?.reportName}</Text>;
}

function ReportBody({ reportID }) {
  const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
  return <Messages messages={report?.messages} />;
}
```

**Exception**: When children are rendered conditionally or in lists, let them own their subscriptions to avoid wasted renders in parent.

---

## Writing to Onyx

**Do**: Use Onyx.merge for partial updates, Onyx.set for full replacement
**Avoid**: Merging when you should set, or vice versa

```tsx
// Partial update - merge
Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
  lastReadTime: Date.now(),
});

// Full replacement - set
Onyx.set(ONYXKEYS.SESSION, newSession);

// Clear data
Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null);
```

**Optimistic updates**: Onyx supports optimistic updates that show immediately and roll back on API failure. See `libs/actions/` for patterns.
