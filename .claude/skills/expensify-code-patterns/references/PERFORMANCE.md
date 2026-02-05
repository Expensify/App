# Performance Patterns

Patterns to optimize React Native rendering performance in the Expensify App.

## PERF-1: No Spread in renderItem

**Do**: Pass props explicitly to components in `renderItem`
**Avoid**: Creating new objects with spread operators in `renderItem`

```tsx
// Do
<Component item={item} isSelected={isSelected} shouldAnimate={isHighlighted} />

// Avoid
<Component item={{...item, isSelected, shouldAnimate: isHighlighted}} />
```

**Why**: `renderItem` executes for every visible list item on each render. Spread creates new objects, breaking React reconciliation.

**Review**: Flag spread operators inside renderItem that create inline object literals passed as props.

---

## PERF-2: Return Early Before Expensive Work

**Do**: Validate inputs before expensive operations
**Avoid**: Computing results before checking if they're needed

```tsx
// Do
function clearErrors(reportID, action) {
  if (!action?.reportActionID) return;
  const originalID = getOriginalReportID(reportID, action);  // After check
}

// Avoid
function clearErrors(reportID, action) {
  const originalID = getOriginalReportID(reportID, action);  // Before check
  if (!action?.reportActionID) return;
}
```

**Why**: Prevents wasted computation when inputs are invalid.

**Review**: Flag when simple checks (null, undefined, empty) appear after function calls that use those values.

---

## PERF-3: Use OnyxListItemProvider in renderItem

**Do**: Use hooks from `OnyxListItemProvider` for data in list items
**Avoid**: Individual `useOnyx` calls in components rendered by `renderItem`

```tsx
// Do
const personalDetails = usePersonalDetails();

// Avoid
const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
```

**Why**: Individual `useOnyx` in renderItem creates separate subscriptions per item, causing memory overhead and update cascades.

**Review**: Flag `useOnyx` calls in components that are rendered inside FlatList/SectionList renderItem.

---

## PERF-5: Shallow Comparisons in React.memo

**Do**: Compare specific relevant properties
**Avoid**: Deep equality checks on entire objects

```tsx
// Do
memo(ReportActionItem, (prev, next) =>
  prev.report.reportID === next.report.reportID &&
  prev.isSelected === next.isSelected
)

// Avoid
memo(ReportActionItem, (prev, next) =>
  deepEqual(prev.report, next.report)
)
```

**Why**: Deep equality recursively checks all properties, often exceeding the cost of re-rendering.

**Review**: Flag `deepEqual` or similar deep comparison utilities in memo comparators.

---

## PERF-6: Derive State from Props

**Do**: Compute values directly during render
**Avoid**: Syncing derived values with useEffect + setState

```tsx
// Do
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const fullName = firstName + ' ' + lastName;  // Computed
}

// Avoid
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
}
```

**Why**: Direct computation ensures values are always synchronized and avoids extra render cycles.

**Review**: Flag useEffect that updates state based on props/state when the value could be computed directly.

---

## PERF-7: Reset Components via key Prop

**Do**: Use `key` prop to reset component state when identity changes
**Avoid**: Using useEffect to reset multiple state values

```tsx
// Do
function ProfilePage({ userId }) {
  return <ProfileView key={userId} userId={userId} />;
}

// Avoid
function ProfileView({ userId }) {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  useEffect(() => {
    setComment('');
    setRating(0);
  }, [userId]);
}
```

**Why**: `key` causes React to unmount/remount, naturally resetting all state. More idiomatic and reliable.

**Review**: Flag useEffect that resets all/most component state when a prop changes.

---

## PERF-8: Handle Events in Event Handlers

**Do**: Respond to user actions directly in event handlers
**Avoid**: Using state + useEffect to respond to events

```tsx
// Do
function BuyButton({ onBuy }) {
  function handleClick() {
    onBuy();
    showNotification('Purchased!');
  }
  return <Button onPress={handleClick}>Buy</Button>;
}

// Avoid
function BuyButton({ onBuy }) {
  const [isBuying, setIsBuying] = useState(false);
  useEffect(() => {
    if (isBuying) {
      onBuy();
      showNotification('Purchased!');
    }
  }, [isBuying, onBuy]);
  return <Button onPress={() => setIsBuying(true)}>Buy</Button>;
}
```

**Why**: Event handlers provide immediate response. useEffect adds render cycles and obscures causality.

**Review**: Flag useEffect that responds to state changes triggered by user events.

---

## PERF-9: Avoid useEffect Chains

**Do**: Compute derived values directly or restructure logic
**Avoid**: Multiple useEffects where one's state update triggers another

```tsx
// Do
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const fullName = firstName + ' ' + lastName;
  const isValid = firstName.length > 0 && lastName.length > 0;
}

// Avoid
function Form() {
  const [firstName, setFirstName] = useState('');
  const [fullName, setFullName] = useState('');
  const [isValid, setIsValid] = useState(false);
  useEffect(() => setFullName(firstName + ' ' + lastName), [firstName, lastName]);
  useEffect(() => setIsValid(fullName.length > 0), [fullName]);  // Chain!
}
```

**Why**: Chains create complex dependencies, timing issues, and unnecessary renders.

**Review**: Flag multiple useEffects where one effect's setState triggers another effect.

---

## PERF-10: No useEffect for Parent Communication

**Do**: Lift state up to parent, pass down as props
**Avoid**: Using useEffect to call parent callbacks with state changes

```tsx
// Do
function Parent() {
  const [value, setValue] = useState('');
  return <Child value={value} onChange={setValue} />;
}
function Child({ value, onChange }) {
  return <TextInput value={value} onChangeText={onChange} />;
}

// Avoid
function Child({ onValueChange }) {
  const [value, setValue] = useState('');
  useEffect(() => {
    onValueChange(value);
  }, [value, onValueChange]);
  return <TextInput value={value} onChangeText={setValue} />;
}
```

**Why**: useEffect for parent communication breaks unidirectional data flow, causes sync issues, extra renders.

**Review**: Flag useEffect that calls parent callbacks to communicate state changes.

---

## PERF-11: Optimize Data Selection

**Do**: Use selectors to subscribe to specific fields
**Avoid**: Subscribing to entire objects when only using some fields

```tsx
// Do
const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`, {
  selector: (user) => ({ name: user?.name, avatar: user?.avatar })
});

// Avoid
const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`);
// Re-renders when ANY user field changes
```

**Why**: Without selectors, components re-render when unused fields change.

**Review**: Flag useOnyx without selector when component only uses subset of returned data.

---

## PERF-12: Prevent Memory Leaks

**Do**: Clean up subscriptions, timers, listeners in useEffect return
**Avoid**: Creating resources without cleanup

```tsx
// Do
useEffect(() => {
  const intervalId = setInterval(updateTimer, 1000);
  return () => clearInterval(intervalId);
}, []);

// Avoid
useEffect(() => {
  const intervalId = setInterval(updateTimer, 1000);
  // Missing cleanup!
}, []);
```

**Why**: Uncleaned resources persist after unmount, causing leaks and crashes.

**Review**: Flag setInterval, setTimeout, addEventListener, subscribe without corresponding cleanup.

---

## PERF-13: Hoist Iterator-Independent Calls

**Do**: Move function calls outside loops when they don't use iterator
**Avoid**: Calling functions inside .map/.filter that return same result every iteration

```tsx
// Do
const config = getConfig();
const results = items.map((item) => item.value * config.multiplier);

// Avoid
const results = items.map((item) => {
  const config = getConfig();  // Called N times, returns same result
  return item.value * config.multiplier;
});
```

**Why**: Iterator-independent calls create O(n) overhead that scales with data size.

**Review**: Flag function calls inside array callbacks that don't use the iterator variable or its derived values.
