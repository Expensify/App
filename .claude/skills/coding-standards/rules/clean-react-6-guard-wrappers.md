---
ruleId: CLEAN-REACT-PATTERNS-6
title: Use guard wrappers to bypass feature subtrees
---

## [CLEAN-REACT-PATTERNS-6] Use guard wrappers to bypass feature subtrees

### Reasoning

When a feature only applies to a subset of users or scenarios, every component in the feature's subtree still mounts, subscribes, and runs effects — even when the feature is irrelevant. This wastes resources and scatters the "does this feature apply?" check across multiple components.

A guard wrapper centralizes the decision at the subtree root: one cheap check determines whether to activate the entire feature or bypass it completely. When bypassed, nothing below the guard mounts — no providers, no subscriptions, no effects, no Pusher connections. The JSX tree itself becomes the feature flag.

This pattern has two forms:

1. **Single-level guard** — a wrapper that checks a condition and either returns children unchanged or wraps them with a provider/feature component. Use when the condition check and the feature logic are both simple enough to live in one component.
2. **Two-level guard** — an outer wrapper does a cheap scalar check (e.g., one Onyx key comparison or a route param check), and an inner component owns all the heavy logic. The outer guard short-circuits before the inner component ever mounts. Use when the feature logic is heavy (multiple subscriptions, Pusher, complex state).

**Distinction from CLEAN-REACT-PATTERNS-2**: PATTERNS-2 addresses who owns data — components should fetch their own data rather than receiving it from a parent. This rule addresses whether components should mount at all — entire subtrees should be skipped when the feature they serve doesn't apply.

**Distinction from CLEAN-REACT-PATTERNS-5**: PATTERNS-5 addresses how state is structured within a provider (keep it cohesive). This rule addresses whether the provider should mount in the first place.

### Incorrect

#### Incorrect (unconditional provider — all reports pay the cost)

- Provider mounts for every report, even though only Concierge chats need AgentZero status
- Pusher subscription, Onyx subscription, and state management run unconditionally
- Consumers check `isProcessing` to decide whether to render — but the provider shouldn't have mounted at all

```tsx
function ReportScreen({reportID}: {reportID: string}) {
    return (
        <AgentZeroStatusProvider reportID={reportID}>
            <ReportActionsView reportID={reportID} />
            <ReportFooter reportID={reportID} />
        </AgentZeroStatusProvider>
    );
}

// ❌ Always subscribes to Pusher, always runs effects, even for the 99% of reports
// that aren't Concierge chats
function AgentZeroStatusProvider({reportID, children}: PropsWithChildren<{reportID: string}>) {
    const [reportNVP] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
        selector: agentZeroProcessingIndicatorSelector,
    });

    useEffect(() => {
        const channel = getReportChannelName(reportID);
        const listener = Pusher.subscribe(channel, Pusher.TYPE.CONCIERGE_REASONING, handleReasoning);
        return () => listener.unsubscribe();
    }, [reportID]);

    const [reasoningHistory, setReasoningHistory] = useState<ReasoningEntry[]>([]);
    const [displayedLabel, setDisplayedLabel] = useState('');
    // ... more state and effects ...

    return (
        <AgentZeroStatusContext.Provider value={stateValue}>
            {children}
        </AgentZeroStatusContext.Provider>
    );
}
```

#### Incorrect (scattered condition checks across the subtree)

- Multiple components independently check whether a linked action exists
- Each component subscribes and computes even when there's no linked action (the common case)

```tsx
function ReportScreen({reportID}: {reportID: string}) {
    const reportActionIDFromRoute = useRoute().params?.reportActionID;

    // ❌ All these components mount and subscribe even when there's no linked action
    return (
        <View>
            <LinkedActionBanner reportID={reportID} reportActionID={reportActionIDFromRoute} />
            <ReportActionsList reportID={reportID} reportActionID={reportActionIDFromRoute} />
            <LinkedActionNotFoundView reportID={reportID} reportActionID={reportActionIDFromRoute} />
        </View>
    );
}

// ❌ Each component independently checks the same condition
function LinkedActionBanner({reportActionID}: {reportActionID?: string}) {
    const [linkedAction] = useOnyx(/* ... */);
    if (!reportActionID) return null;  // Redundant — shouldn't have mounted
    // ...
}
```

#### Incorrect (prop drilling through uninvolved components)

- Feature state is fetched high in the tree and drilled through components that don't use it
- Intermediate components re-render when the feature state changes, even though they just pass it through

```tsx
function ReportScreen({reportID}: {reportID: string}) {
    const [conciergeStatus] = useOnyx(/* ... */);
    const [reasoningHistory, setReasoningHistory] = useState([]);

    return (
        <ReportActionsView
            reportID={reportID}
            conciergeStatus={conciergeStatus}        // ❌ pass-through
            reasoningHistory={reasoningHistory}       // ❌ pass-through
        />
    );
}

function ReportActionsView({reportID, conciergeStatus, reasoningHistory}) {
    return (
        <ReportActionsList
            reportID={reportID}
            conciergeStatus={conciergeStatus}        // ❌ pass-through
            reasoningHistory={reasoningHistory}       // ❌ pass-through
        />
    );
}

function ReportActionsList({conciergeStatus, reasoningHistory}) {
    // Finally used here, 3 levels down
    return conciergeStatus.isProcessing
        ? <ConciergeThinkingMessage history={reasoningHistory} />
        : null;
}
```

### Correct

#### Correct (two-level guard — cheap outer check, heavy inner logic)

From PR #85535 — `AgentZeroStatusProvider` guards the entire AgentZero feature:

- Outer guard does one scalar Onyx check (`CONCIERGE_REPORT_ID`)
- For non-Concierge reports (the common case), returns children with zero overhead
- Inner gate only mounts for Concierge chats, owning Pusher, state, and all heavy logic

```tsx
// Outer guard — one cheap Onyx subscription, scalar comparison
function AgentZeroStatusProvider({
    reportID,
    chatType,
    children,
}: PropsWithChildren<{reportID: string | undefined; chatType: string | undefined}>) {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeChat = reportID === conciergeReportID;
    const isAdmin = chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
    const isAgentZeroChat = isConciergeChat || isAdmin;

    if (!reportID || !isAgentZeroChat) {
        return children;  // ✅ Zero cost — no providers, no Pusher, no state
    }

    return (
        <AgentZeroStatusGate key={reportID} reportID={reportID}>
            {children}
        </AgentZeroStatusGate>
    );
}

// Inner gate — all heavy logic, only mounts for AgentZero chats
function AgentZeroStatusGate({reportID, children}: PropsWithChildren<{reportID: string}>) {
    const [serverLabel] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
        selector: agentZeroProcessingIndicatorSelector,
    });
    const [reasoningHistory, setReasoningHistory] = useState<ReasoningEntry[]>([]);

    useEffect(() => {
        const channel = getReportChannelName(reportID);
        const listener = Pusher.subscribe(channel, Pusher.TYPE.CONCIERGE_REASONING, handleReasoning);
        return () => listener.unsubscribe();
    }, [reportID]);

    // ... state management, debouncing, etc. ...

    return (
        <AgentZeroStatusContext.Provider value={stateValue}>
            {children}
        </AgentZeroStatusContext.Provider>
    );
}
```

#### Correct (two-level guard — linked action not-found)

From PR #86543 — `LinkedActionNotFoundGuard` only activates when a `reportActionID` route param exists:

- Outer guard checks one route param — no Onyx subscriptions at all
- Inner gate owns 6 Onyx subscriptions, pagination hooks, and multiple effects
- Most report views have no linked action, so the inner gate never mounts

```tsx
// Outer guard — route param check, zero subscriptions
function LinkedActionNotFoundGuard({children}: {children: ReactNode}) {
    const route = useRoute();
    const reportActionIDFromRoute = (route.params as {reportActionID?: string})?.reportActionID;

    if (!reportActionIDFromRoute) {
        return children;  // ✅ No linked action → bypass entirely
    }

    return (
        <LinkedActionNotFoundGate reportActionIDFromRoute={reportActionIDFromRoute}>
            {children}
        </LinkedActionNotFoundGate>
    );
}

// Inner gate — 6 Onyx subs, pagination hook, multiple effects
// Only mounts when navigating to a specific linked report action
function LinkedActionNotFoundGate({reportActionIDFromRoute, children}: {reportActionIDFromRoute: string; children: ReactNode}) {
    const [report] = useOnyx(/* ... */);
    const [reportMetadata] = useOnyx(/* ... */);
    const [visibleReportActionsData] = useOnyx(/* ... */);
    const {reportActions, linkedAction, sortedAllReportActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    // ... linked action status computation, effects ...

    if (shouldShowNotFoundLinkedAction) {
        return <FullPageNotFoundView />;
    }

    return children;
}
```

#### Correct (single-level guard — report not-found)

From PR #86543 — `ReportNotFoundGuard` validates report existence:

- Checks if the report exists and handles loading/error states
- If the report doesn't exist, shows a not-found view
- If it does, renders children

```tsx
function ReportNotFoundGuard({children}: {children: ReactNode}) {
    const route = useRoute();
    const reportIDFromRoute = getNonEmptyStringOnyxID((route.params as {reportID?: string})?.reportID);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    // ... existence checks ...

    if (shouldShowNotFoundPage) {
        return (
            <FullPageNotFoundView
                shouldShow
                shouldShowBackButton={shouldUseNarrowLayout}
            />
        );
    }

    return children;
}
```

#### Correct (single-level guard — onboarding feature gate)

- Onboarding tooltips only apply to users who haven't completed setup
- Guard checks one Onyx key with a selector that returns a boolean

```tsx
function OnboardingGuard({children}: PropsWithChildren) {
    const [isOnboardingCompleted] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: (onboarding) => onboarding?.hasCompletedGuidedSetupFlow ?? true,
    });

    if (isOnboardingCompleted) {
        return children;  // ✅ No tooltip logic mounts
    }

    return (
        <OnboardingTooltipProvider>
            {children}
        </OnboardingTooltipProvider>
    );
}
```

---

### Review Metadata

#### Condition

Flag when ALL of these are true:

1. A feature or behavior only applies to a subset of scenarios (specific report types, user roles, feature flags, onboarding states, presence of a route param)
2. AND the feature's logic (subscriptions, effects, providers, state) is mounted unconditionally or the condition is checked redundantly across multiple components

**Signs of violation:**
- A provider wraps children unconditionally but its consumers immediately check `if (!relevant) return null` — the provider shouldn't have mounted
- Multiple components in a subtree independently check the same condition (e.g., `isConciergeChat`, `isAdmin`, `hasFeature`) before using feature-specific data
- Pusher subscriptions, Onyx subscriptions, or effects that only matter for a specific scenario run for all scenarios
- Feature state is prop-drilled through components that don't use it, just to reach the one component that needs it — a guard wrapper + context eliminates the pass-through chain
- A route param (e.g., `reportActionID`) triggers additional logic in multiple components, each checking for its presence independently

**Signs of a good guard:**
- The guard's condition check is cheap (scalar comparison, boolean flag, single Onyx key, route param presence)
- The bypass path returns `children` unchanged — zero additional overhead
- The activation path mounts all feature-specific logic in one place (or delegates to a focused inner gate)
- Consumers below the guard don't need to re-check the condition

**Two-level guard indicators:**
- The feature logic requires multiple Onyx subscriptions, Pusher connections, or complex state management — too heavy for the outer guard
- The condition check is cheap but the feature logic is expensive — splitting them ensures the common bypass path pays only for the check

**DO NOT flag if:**
- The feature applies to all or most scenarios — a guard that almost never bypasses adds overhead for no benefit
- The condition check itself is expensive (requires multiple Onyx subscriptions, API calls, or complex computation) — this defeats the purpose of a cheap gate
- A single component with a simple early return already handles the bypass — wrapping it in a guard wrapper adds unnecessary indirection
- The feature's logic is trivial (no subscriptions, no effects, no providers) — a guard wrapper is overkill for a conditional `<Text>` element

**Search Patterns** (hints for reviewers):
- `useOnyx` inside a provider that wraps children unconditionally — check if all consumers actually need the data
- `Pusher.subscribe` in components that mount for all scenarios — check if the subscription is scenario-specific
- `if (!isX) return null` appearing in multiple sibling or child components checking the same condition
- Props drilled through 2+ levels where intermediate components don't use them
- `reportActionID` or other route params checked independently in multiple components
