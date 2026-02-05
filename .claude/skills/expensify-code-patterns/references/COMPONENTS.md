# Component Architecture Patterns

Patterns for clean, maintainable React component architecture in the Expensify App.

## PATTERNS-1: Composition Over Configuration

**Do**: Express features as composable child components
**Avoid**: Boolean props that control feature visibility/behavior

```tsx
// Do: Composition - features are children
<Table data={items} columns={columns}>
  <Table.SearchBar />
  <Table.Header />
  <Table.Body />
</Table>

<SelectionList data={items}>
  <SelectionList.TextInput />
  <SelectionList.Body />
</SelectionList>

// Avoid: Configuration - features are flags
<Table
  data={items}
  shouldShowSearchBar      // Could be <Table.SearchBar />
  shouldShowHeader         // Could be <Table.Header />
  shouldEnableSorting
  shouldShowPagination
/>

<SelectionList
  data={items}
  shouldShowTextInput      // Could be <SelectionList.TextInput />
  shouldShowTooltips
  canSelectMultiple
/>
```

**Props that are OK**: Data props (`reportID`, `data`, `columns`), event handlers (`onPress`, `onSelect`), styling (`style`, `testID`).

**Why**: Configuration props couple parent to implementation details. Adding features requires modifying the component's API. Composition keeps components stable while features scale horizontally.

**Review**: Flag new props named `shouldShow*`, `shouldEnable*`, `can*`, `disable*` when they could be expressed as child components.

---

## PATTERNS-2: Components Own Their Data

**Do**: Components fetch their own data using IDs passed as props
**Avoid**: Parents fetching data just to pass it to children

```tsx
// Do: Component owns its data
<OptionRowLHNData reportID={reportID} onSelectRow={onSelectRow} />

function OptionRowLHNData({ reportID, onSelectRow }) {
  const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
  const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
  // Component fetches what it needs
}

// Avoid: Parent micromanages child's data
<OptionRowLHNData
  reportID={reportID}
  fullReport={item}
  reportActions={itemReportActions}
  policy={itemPolicy}
  personalDetails={personalDetails}
  transaction={itemTransaction}
  // ... 20+ more props
/>
```

**Test**: "If I remove this child, would unused variables remain in the parent?" If yes, parent is acting as data intermediary.

**Props that are OK**: IDs (`reportID`, `policyID`), callbacks (`onSelectRow`, `onLayout`), structural (`style`, `testID`).

**Why**: When parents fetch data for children, changing child requirements forces parent changes. Components that own their data can evolve independently.

**Review**: Flag components receiving data props that they could fetch themselves using an ID.

---

## PATTERNS-3: Abstract Component Contracts

**Do**: Expose abstract capabilities ("user can add a stop")
**Avoid**: Contracts that encode consumer assumptions ("navigate to waypoint at index")

```tsx
// Do: Abstract contract - component signals what happened
<DistanceRequestFooter
  onAddStop={() => {
    const nextIndex = Object.keys(waypoints).length;
    Navigation.navigate(ROUTES.WAYPOINT.getRoute(nextIndex));
  }}
/>

// In DistanceRequestFooter:
<Button onPress={onAddStop}>{translate('distance.addStop')}</Button>

// Avoid: Consumer-specific contract
<DistanceRequestFooter
  navigateToWaypointEditPage={(index: number) => { /* ... */ }}
  transaction={transaction}  // Only used to compute index for callback
/>

// In DistanceRequestFooter - computes value for consumer's callback:
<Button onPress={() => navigateToWaypointEditPage(
  Object.keys(transaction?.comment?.waypoints ?? {}).length
)} />
```

**Signs of violation**:
- Callback signatures encode routing: `navigateToWaypoint(index)` vs `onAddStop()`
- Props passed only to extract values for callbacks, not for rendering
- Component requires modification to work in different context

**Why**: Consumer-specific contracts couple components to their usage context, preventing reuse.

**Review**: Flag callback props with consumer-specific signatures like `(index: number) => void` where the component computes the index.

---

## PATTERNS-4: Focused Effects and Hooks

**Do**: Extract unrelated concerns into focused custom hooks
**Avoid**: Components with many useEffects handling different responsibilities

```tsx
// Do: Separated concerns
function DebugMenu() {
  useDebugShortcut();  // Focused hook
  return /* UI */;
}

function useDebugShortcut() {
  useEffect(() => {
    const unsubscribe = KeyboardShortcut.subscribe(
      CONST.KEYBOARD_SHORTCUTS.DEBUG.shortcutKey,
      () => toggleTestToolsModal()
    );
    return () => unsubscribe();
  }, []);
}

// Avoid: Side-effect spaghetti
function Expensify() {
  const [account] = useOnyx(ONYXKEYS.ACCOUNT);
  const [session] = useOnyx(ONYXKEYS.SESSION);
  const [lastRoute] = useOnyx(ONYXKEYS.LAST_ROUTE);
  // ... 10+ more unrelated useOnyx calls

  useEffect(() => { /* telemetry */ }, []);
  useEffect(() => { /* deep linking */ }, []);
  useEffect(() => { /* audio mode */ }, []);
  useEffect(() => { /* splash screen */ }, []);
  // ... 10+ more unrelated effects
}
```

**Bucketing questions**:
1. Does this logic need the React render loop? YES → Extract to focused hook. NO → Move out of React.
2. Does this logic need to be in this component? YES → Use focused hook. NO → Extract to separate component.

**Why**: Mixed concerns increase coupling and regression risk. Changing one feature risks breaking unrelated ones.

**Review**: Flag components with 3+ useEffects handling unrelated concerns (telemetry, navigation, audio, etc).

---

## PATTERNS-5: Cohesive State Structures

**Do**: Group state that changes together and serves one purpose
**Avoid**: State providers that bundle unrelated data

```tsx
// Do: Cohesive state - all relates to keyboard
type KeyboardStateValue = {
  isKeyboardShown: boolean;
  isKeyboardActive: boolean;
  keyboardHeight: number;
};

function KeyboardStateProvider({ children }) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);

  const contextValue = useMemo(() => ({
    keyboardHeight,
    isKeyboardShown: keyboardHeight !== 0,  // Derived
    isKeyboardActive,
  }), [keyboardHeight, isKeyboardActive]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

// Avoid: Grab-bag state - bundles unrelated concerns
function SidebarContextProvider({ children }) {
  const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);
  const [chatReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
  const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
  const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
  // ... many more unrelated subscriptions

  // Exposes unrelated data together
  const contextValue = {
    orderedReports,         // List data
    currentReportID,        // Navigation state
    policyMemberAccountIDs, // Policy membership
    clearLHNCache,          // Cache utility
  };
}
```

**Why**: Bundled unrelated state causes consumers to re-render when data they don't use changes.

**Review**: Flag contexts/hooks that aggregate multiple unrelated useOnyx calls or expose grab-bag value objects mixing different domains.
