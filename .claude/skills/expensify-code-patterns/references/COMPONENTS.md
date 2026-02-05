# Component Architecture Patterns

Patterns for clean, maintainable React component architecture in the Expensify App.

## PATTERNS-1: Favor composition over configuration

**Rationale**: When new features are implemented by adding configuration (props, flags, conditional logic) to existing components, those components must be repeatedly modified as requirements change, increasing coupling, surface area, and regression risk. Composition ensures features scale horizontally, limits the scope of changes, and prevents components from becoming configuration-driven "mega components".

**Signs**:
- New feature adds boolean/configuration props to control feature presence
- Adding a new feature requires modifying the component's API
- Props named `shouldShow*`, `shouldEnable*`, `can*`, `disable*` control feature visibility

**Exceptions**: Props are narrow, stable values needed for coordination between composed parts (e.g., `reportID`, `data`, `columns`); the component already uses composition and child components for features; parent components stay stable as features are added.

Good:

```tsx
<Table data={items} columns={columns}>
  <Table.SearchBar />
  <Table.Header />
  <Table.Body />
</Table>
```

```tsx
<SelectionList data={items}>
  <SelectionList.TextInput />
  <SelectionList.Body />
</SelectionList>
```

```tsx
// Children manage their own state
// Parent only passes minimal data (IDs)
// Adding new features doesn't require changing the parent
function ReportScreen({ params: { reportID }}) {
  return (
    <>
      <ReportActionsView reportID={reportID} />
      <Composer />
    </>
  );
}

// Component accesses stores and calculates its own state
function ReportActionsView({ reportID }) {
  const [reportOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
  const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
  // ...
}
```

Bad:

```tsx
<Table
  data={items}
  columns={columns}
  shouldShowSearchBar
  shouldShowHeader
  shouldEnableSorting
  shouldShowPagination
  shouldHighlightOnHover
/>

type TableProps = {
  data: Item[];
  columns: Column[];
  shouldShowSearchBar?: boolean;    // Could be <Table.SearchBar />
  shouldShowHeader?: boolean;       // Could be <Table.Header />
  shouldEnableSorting?: boolean;    // Configuration for header behavior
  shouldShowPagination?: boolean;   // Could be <Table.Pagination />
  shouldHighlightOnHover?: boolean; // Configuration for styling behavior
};
```

```tsx
<SelectionList
  data={items}
  shouldShowTextInput
  shouldShowTooltips
  shouldScrollToFocusedIndex
  shouldDebounceScrolling
  shouldUpdateFocusedIndex
  canSelectMultiple
  disableKeyboardShortcuts
/>

type SelectionListProps = {
  shouldShowTextInput?: boolean;      // Could be <SelectionList.TextInput />
  shouldShowConfirmButton?: boolean;  // Could be <SelectionList.ConfirmButton />
  textInputOptions?: {...};           // Configuration object for the above
};
```

```tsx
// Parent fetches and manages state for its children
function ReportScreen({ params: { reportID }}) {
  const [reportOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {allowStaleData: true, canBeMissing: true});
  const reportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);
  const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
  // ... many more lines of state the parent doesn't use

  return (
    <>
      <ReportActionsView
        report={report}
        reportActions={reportActions}
        isLoadingInitialReportActions={reportMetadata?.isLoadingInitialReportActions}
        hasNewerActions={hasNewerActions}
        hasOlderActions={hasOlderActions}
        parentReportAction={parentReportAction}
        transactionThreadReportID={transactionThreadReportID}
        isReportTransactionThread={isTransactionThreadView}
      />
      <Composer />
    </>
  );
}
```

---

## PATTERNS-2: Let components own their behavior and effects

**Rationale**: When parent components compute and pass behavioral state to children, if a child's requirements change, then parent components must change as well, increasing coupling and causing behavior to leak across concerns. Letting components own their behavior keeps logic local and allows independent evolution. Principle: "If removing a child breaks parent behavior, coupling exists."

**Note**: Distinct from PATTERNS-3 — this rule is about data flow DOWN (parent -> child): "Don't pass data the child can get itself."

**Signs**:
- Parent imports hooks/contexts only to satisfy child's data needs
- Props that are direct pass-throughs of hook results (e.g., `report={reportOnyx}`)
- Component receives props that are just passed through to children or that it could fetch itself
- Removing or commenting out the child would leave unused variables in the parent

**Exceptions**: Props are minimal domain-relevant identifiers (e.g., `reportID`, `transactionID`, `policyID`); props are callback/event handlers for coordination (e.g., `onSelectRow`, `onLayout`); props are structural/presentational that can't be derived internally (e.g., `style`, `testID`); parent genuinely uses the data for its own rendering or logic; data is shared coordination state that parent legitimately owns.

Good:

```tsx
<OptionRowLHNData
    reportID={reportID}
    onSelectRow={onSelectRow}
/>
```

```tsx
function OptionRowLHNData({reportID, onSelectRow}) {
   // Component fetches its own data
   const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
   const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
   const [viewMode] = useOnyx(ONYXKEYS.NVP_VIEW_MODE);
   // ... other data this component needs

   return (
        <View>
            {/* Children own their state too */}
            <Avatars reportID={reportID} />
            <DisplayNames reportID={reportID} />
            <Status reportID={reportID} />
        </View>
   );
}
```

Bad:

```tsx
<OptionRowLHNData
    reportID={reportID}
    fullReport={item}
    reportAttributes={itemReportAttributes}
    oneTransactionThreadReport={itemOneTransactionThreadReport}
    reportNameValuePairs={itemReportNameValuePairs}
    reportActions={itemReportActions}
    parentReportAction={itemParentReportAction}
    iouReportReportActions={itemIouReportReportActions}
    policy={itemPolicy}
    invoiceReceiverPolicy={itemInvoiceReceiverPolicy}
    personalDetails={personalDetails ?? {}}
    transaction={itemTransaction}
    lastReportActionTransaction={lastReportActionTransaction}
    receiptTransactions={transactions}
    viewMode={optionMode}
    isOptionFocused={!shouldDisableFocusOptions}
    lastMessageTextFromReport={lastMessageTextFromReport}
    onSelectRow={onSelectRow}
    preferredLocale={preferredLocale}
    hasDraftComment={hasDraftComment}
    transactionViolations={transactionViolations}
    onLayout={onLayoutItem}
    shouldShowRBRorGBRTooltip={shouldShowRBRorGBRTooltip}
    activePolicyID={activePolicyID}
    onboardingPurpose={introSelected?.choice}
    isFullscreenVisible={isFullscreenVisible}
    isReportsSplitNavigatorLast={isReportsSplitNavigatorLast}
    isScreenFocused={isScreenFocused}
    localeCompare={localeCompare}
    testID={index}
    isReportArchived={isReportArchived}
    lastAction={lastAction}
    lastActionReport={lastActionReport}
/>
```

In this example the parent fetches `fullReport`, `policy`, `transaction`, `reportActions`, `personalDetails`, `transactionViolations`, and routing/layout state — dependencies that exist only because the child needs them.

---

## PATTERNS-3: Design context-free component contracts

**Rationale**: A component's contract should expose its capabilities abstractly, not encode assumptions about how it will be used. When interfaces leak consumer-specific details, the component becomes coupled to that context and requires modification for reuse. Good contracts signal *what the component can do*, not *what the consumer needs*.

**Note**: Distinct from PATTERNS-2 — PATTERNS-2 ensures components fetch their own data. This rule ensures components expose abstract capabilities, not consumer-specific interfaces.

**Signs**:
- Callback signatures encode consumer assumptions: `navigateToWaypoint(index: number)` instead of `onAddWaypoint()`
- Props passed only to extract values for callbacks, not for rendering (e.g., `transaction` passed just to compute `waypoints.length`)
- Imperative access to external state via refs or `useImperativeHandle`
- Component requires modification to work in a different context

**Exceptions**: Component signals events with data it naturally owns (e.g., `onChange(value)` for an input, `onSelectItem(item)` for a list); callbacks are abstract actions the component can trigger (e.g., `onAddStop()`, `onSubmit()`); state coordination happens at a higher level with clear data flow.

Good:

```tsx
<DistanceRequestFooter
    onAddStop={() => {
        const nextIndex = Object.keys(transaction?.comment?.waypoints ?? {}).length;
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_WAYPOINT.getRoute(..., nextIndex.toString(), ...));
    }}
/>

// in DistanceRequestFooter
<Button onPress={onAddStop}>{translate('distance.addStop')}</Button>
```

```tsx
// Independent contracts — state coordination at composition level
function EditProfile() {
    const [formData, setFormData] = useState<FormData>();
    return (
        <>
            <Form onChangeFormData={setFormData} />
            <SaveButton onSave={() => API.save(formData)} />
        </>
    );
}
```

Bad:

```tsx
type DistanceRequestFooterProps = {
    waypoints?: WaypointCollection;
    navigateToWaypointEditPage: (index: number) => void;  // Encodes routing assumption
    transaction: OnyxEntry<Transaction>;
    policy: OnyxEntry<Policy>;
};

// in IOURequestStepDistance
<DistanceRequestFooter
    waypoints={waypoints}
    navigateToWaypointEditPage={navigateToWaypointEditPage}
    transaction={transaction}
    policy={policy}
/>

// in DistanceRequestFooter - computes value for consumer's callback
<Button
    onPress={() => navigateToWaypointEditPage(Object.keys(transaction?.comment?.waypoints ?? {}).length)}
    text={translate('distance.addStop')}
/>
```

```tsx
// Coupled contracts — SaveButton reaches into Form's internals
function SaveButton({ getSiblingFormData }: { getSiblingFormData: () => FormData }) {
    const handleSave = () => {
        const formData = getSiblingFormData(); // Reaches into sibling
        API.save(formData);
    };
    return <Button onPress={handleSave}>Save</Button>;
}

// Parent wires siblings together
<Form ref={formRef} />
<SaveButton getSiblingFormData={() => formRef.current?.getData()} />
```

---

## PATTERNS-4: Avoid side-effect spaghetti

**Rationale**: When multiple unrelated responsibilities are grouped into a single component, hook, or utility, if any one concern changes then unrelated logic must be touched as well, increasing coupling, regression risk, and cognitive load. This is the single responsibility principle for React: extract small units that do very little, very well. A component with several unrelated effects is a code smell — even a single effect can benefit from extraction to a named hook with a proper description and isolated tests.

**Signs**:
- Component has several `useEffect` hooks handling unrelated concerns (e.g., telemetry, deep linking, audio, session management all in one component)
- A single `useEffect` or hook handles multiple distinct responsibilities
- Unrelated state variables are interdependent or updated together
- Logic mixes data fetching, navigation, UI state, and lifecycle behavior in one place
- Removing one piece of functionality requires careful untangling from others

**Note**: Group by responsibility (what the code does), NOT by timing (when it runs). Data fetching and analytics are NOT related — they serve different purposes even if both run on mount.

**Exceptions**: Component is a thin orchestration layer that ONLY composes child components (no business logic, no effects beyond rendering); effects are extracted into focused custom hooks with single responsibilities (e.g., `useDebugShortcut`, `usePriorityMode`).

Good:

```tsx
function DebugMenu() {
    useDebugShortcut();

    return (
        // Debug menu UI
    );
}

function ParentComponent({ reportID }: { reportID: string }) {
    return (
        <View>
            {/* Each child owns its own concerns */}
            <ReportView reportID={reportID} />
            <DebugMenu />
        </View>
    );
}
```

```tsx
// Focused hook that does one thing well
function useDebugShortcut() {
    useEffect(() => {
        const debugShortcutConfig = CONST.KEYBOARD_SHORTCUTS.DEBUG;
        const unsubscribeDebugShortcut = KeyboardShortcut.subscribe(
            debugShortcutConfig.shortcutKey,
            () => toggleTestToolsModal(),
            debugShortcutConfig.descriptionKey,
            debugShortcutConfig.modifiers,
            true,
        );

        return () => {
            unsubscribeDebugShortcut();
        };
    }, []);
}
```

Bad:

```tsx
function Expensify() {
    // Session & auth
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    // Navigation & routing
    const [lastRoute] = useOnyx(ONYXKEYS.LAST_ROUTE);
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH);
    const [isNavigationReady, setIsNavigationReady] = useState(false);

    // App state
    const [updateAvailable] = useOnyx(ONYXKEYS.UPDATE_AVAILABLE);
    const [updateRequired] = useOnyx(ONYXKEYS.UPDATE_REQUIRED);
    const [isSidebarLoaded] = useOnyx(ONYXKEYS.IS_SIDEBAR_LOADED);

    // Splash screen
    const {splashScreenState, setSplashScreenState} = useContext(SplashScreenStateContext);

    // ... 10+ more useOnyx calls for unrelated concerns ...

    // Telemetry effect
    useEffect(() => {
        bootsplashSpan.current = startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT, {...});
        // ...
    }, []);

    // Public room checking effect
    useEffect(() => {
        if (isCheckingPublicRoom) return;
        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX);
        // ...
    }, [isCheckingPublicRoom]);

    // Splash screen effect
    useEffect(() => {
        if (!shouldHideSplash) return;
        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.SPLASH_HIDER, {...});
    }, [shouldHideSplash]);

    // Deep linking effect
    useEffect(() => {
        Linking.getInitialURL().then((url) => {
            if (url) {
                openReportFromDeepLink(url, ...);
            }
        });
        // ...
    }, []);

    // Audio mode effect
    useEffect(() => {
        Audio.setAudioModeAsync({playsInSilentModeIOS: true});
    }, []);

    // ... 10+ more useEffects mixing concerns ...
}
```

In this example the component handles telemetry, deep linking, audio, session, navigation, splash screen, and more. Each concern is interleaved with others, making it hard to modify one without risking regression in another.

---

## PATTERNS-5: Keep state and subscriptions narrow

**Rationale**: When unrelated pieces of data are grouped into a single state structure, if an unused part changes then all consumers re-render unnecessarily. This silently expands render scope, increases coupling, and makes performance regressions hard to detect. Structuring state around cohesive concerns ensures render scope stays predictable and changes remain local.

**Note**: Distinct from PERF-11 (individual `useOnyx` selector usage) and PATTERNS-2 (data flow direction). This rule addresses how multiple values are grouped and exposed to consumers via contexts, hooks, or stores.

**Signs**:
- State provider (context, hook, or store) bundles unrelated data (e.g., navigation state + list data + cache utilities in one structure)
- State object where properties serve different purposes and change independently
- Multiple unrelated subscriptions (`useOnyx`, `useContext`, store selectors) aggregated into a single exposed value
- Consumers of a state source that only use a subset of the provided values

**Exceptions**: State values are cohesive — they change together and serve the same purpose (e.g., `keyboardHeight` + `isKeyboardShown`); state structure is intentionally designed as an aggregation point and consumers use most/all values; individual `useOnyx` calls without selectors (covered by PERF-11).

Good:

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

Bad:

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
