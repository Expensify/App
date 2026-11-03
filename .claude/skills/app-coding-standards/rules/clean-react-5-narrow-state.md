---
ruleId: CLEAN-REACT-PATTERNS-5
title: Keep state and subscriptions narrow
---

## [CLEAN-REACT-PATTERNS-5] Keep state and subscriptions narrow

### Reasoning

When unrelated pieces of data are grouped into a single state structure, if an unused part changes, then all consumers re-render unnecessarily. This silently expands render scope, increases coupling, and makes performance regressions hard to detect. Structuring state around cohesive concerns ensures render scope stays predictable and changes remain local.

**Distinction from PERF-11**: PERF-11 addresses individual `useOnyx` selector usage. This rule addresses state structure — how multiple values are grouped and exposed to consumers via contexts, hooks, or stores.

**Distinction from CLEAN-REACT-PATTERNS-2**: PATTERNS-2 addresses data flow direction — parent shouldn't fetch data just to pass to children. This rule addresses how state is structured and grouped within any state provider.

### Incorrect

#### Incorrect (grab-bag state — bundles unrelated concerns)

- State provider subscribes to many unrelated Onyx collections
- Exposed value mixes navigation state, list data, membership data, and cache utilities
- Any consumer re-renders when ANY subscribed value changes

```tsx
function SidebarOrderedReportsContextProvider({children}) {
    // Many unrelated Onyx subscriptions bundled together
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);
    const [chatReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [reportsDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

    // Context value mixes unrelated concerns
    const contextValue = {
        orderedReports,         // List data
        orderedReportIDs,       // List data
        currentReportID,        // Navigation state
        policyMemberAccountIDs, // Policy membership
        clearLHNCache,          // Cache management utility
    };

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

// A component needing only currentReportID re-renders when orderedReports changes
// A component needing only policyMemberAccountIDs re-renders when navigation changes
```

### Correct

#### Correct (cohesive state — all values serve one purpose)

- All state relates to one concern (keyboard)
- Values change together — no wasted re-renders
- Derived state computed inline, not stored separately

```tsx
type KeyboardStateContextValue = {
    isKeyboardShown: boolean;
    isKeyboardActive: boolean;
    keyboardHeight: number;
};

function KeyboardStateProvider({children}: ChildrenProps) {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardActive, setIsKeyboardActive] = useState(false);

    useEffect(() => {
        const showListener = KeyboardEvents.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.height);
            setIsKeyboardActive(true);
        });
        const hideListener = KeyboardEvents.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
            setIsKeyboardActive(false);
        });
        return () => {
            showListener.remove();
            hideListener.remove();
        };
    }, []);

    const contextValue = useMemo(() => ({
        keyboardHeight,
        isKeyboardShown: keyboardHeight !== 0,  // Derived, not separate state
        isKeyboardActive,
    }), [keyboardHeight, isKeyboardActive]);

    return <KeyboardStateContext.Provider value={contextValue}>{children}</KeyboardStateContext.Provider>;
}
```

---

### Review Metadata

#### Condition

Flag when a state structure (context, hook, store, or subscription) bundles unrelated concerns together, causing consumers to re-render when data they don't use changes.

**Signs of violation:**
- State provider (context, hook, or store) that bundles unrelated data (e.g., navigation state + list data + cache utilities in one structure)
- State object where properties serve different purposes and change independently
- Multiple unrelated subscriptions (`useOnyx`, `useContext`, store selectors) aggregated into a single exposed value
- Consumers of a state source that only use a subset of the provided values

**DO NOT flag if:**
- State values are cohesive — they change together and serve the same purpose (e.g., `keyboardHeight` + `isKeyboardShown` both relate to keyboard state)
- The state structure is intentionally designed as an aggregation point and consumers use most/all values
- Individual `useOnyx` calls without selectors — this is covered by [PERF-11]

**Search Patterns** (hints for reviewers):
- `Context`
- `Provider`
- `useOnyx`
