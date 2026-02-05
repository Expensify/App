# Performance Patterns

Patterns to optimize React Native rendering performance in the Expensify App.

## PERF-1: No spread in renderItem

**Rationale**: `renderItem` executes for every visible list item on each render. Creating new objects with spread operators forces React to treat each item as changed, preventing reconciliation optimizations and causing unnecessary re-renders of child components.

**Exceptions**: Spread outside renderItem; spread on arrays; object created once outside renderItem and reused; spread for local cloning not passed as prop.

Good:

```tsx
<Component
  item={item}
  isSelected={isSelected}
  shouldAnimateInHighlight={isItemHighlighted}
/>
```

Bad:

```tsx
<Component
  item={{
      shouldAnimateInHighlight: isItemHighlighted,
      isSelected: selected,
      ...item,
  }}
/>
```

---

## PERF-2: Return early before expensive work

**Rationale**: Early returns prevent wasted computation. When a function performs expensive work (function calls, iterations, API/Onyx reads) before a simple check that could short-circuit, the computation is wasted when the check fails.

**Exceptions**: Simple checks already come first; validation requires the computed result; expensive work must run for side effects.

Good:

```ts
function clearReportActionErrors(reportID: string, reportAction: ReportAction) {
    if (!reportAction?.reportActionID) {
        return;
    }

    const originalReportID = getOriginalReportID(reportID, reportAction);
    // ...
}
```

Bad:

```ts
function clearReportActionErrors(reportID: string, reportAction: ReportAction) {
    const originalReportID = getOriginalReportID(reportID, reportAction);

    if (!reportAction?.reportActionID) {
        return;
    }
    // ...
}
```

---

## PERF-3: Use OnyxListItemProvider hooks in renderItem

**Rationale**: Individual `useOnyx` calls in renderItem create separate subscriptions for each list item, causing memory overhead and update cascades. `OnyxListItemProvider` hooks provide optimized data access patterns specifically designed for list rendering performance.

Good:

```tsx
const personalDetails = usePersonalDetails();
```

Bad:

```tsx
const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
```

---

## PERF-5: Use shallow comparisons in React.memo

**Rationale**: Deep equality checks recursively compare all nested properties, creating performance overhead that often exceeds the re-render cost they aim to prevent. Shallow comparisons of specific relevant properties provide the same optimization benefits with minimal computational cost.

Good:

```tsx
memo(ReportActionItem, (prevProps, nextProps) =>
    prevProps.report.type === nextProps.report.type &&
    prevProps.report.reportID === nextProps.report.reportID &&
    prevProps.isSelected === nextProps.isSelected
)
```

Bad:

```tsx
memo(ReportActionItem, (prevProps, nextProps) =>
    deepEqual(prevProps.report, nextProps.report) &&
    prevProps.isSelected === nextProps.isSelected
)
```

---

## PERF-6: Derive state from props

**Rationale**: Computing derived values directly in the component body ensures they're always synchronized with props/state and avoids unnecessary re-renders from the extra state + useEffect cycle.

Good:

```tsx
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');

  // Calculated during rendering
  const fullName = firstName + ' ' + lastName;
}
```

Bad:

```tsx
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');

  // Redundant state and unnecessary Effect
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
}
```

---

## PERF-7: Control component resets via key prop

**Rationale**: When a prop changes and you need to reset all component state, the `key` prop causes React to unmount and remount the component, automatically resetting all state without needing useEffect. More idiomatic and reliable.

Good:

```tsx
function ProfilePage({ userId }) {
  return <ProfileView key={userId} userId={userId} />;
}

function ProfileView({ userId }) {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  // Component resets when userId changes due to key prop
}
```

Bad:

```tsx
function ProfilePage({ userId }) {
  return <ProfileView userId={userId} />;
}

function ProfileView({ userId }) {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    setComment(''); // Reset when userId changes
    setRating(0);
  }, [userId]);
}
```

---

## PERF-8: Handle events in event handlers

**Rationale**: Event handlers provide immediate response and clearer code flow. useEffect adds unnecessary render cycles and makes the relationship between user action and response less clear.

Good:

```tsx
function BuyButton({ productId, onBuy }) {
  function handleClick() {
    onBuy();
    showNotification('Item purchased!');
  }

  return <button onClick={handleClick}>Buy</button>;
}
```

Bad:

```tsx
function BuyButton({ productId, onBuy }) {
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    if (isBuying) {
      onBuy();
      showNotification('Item purchased!');
    }
  }, [isBuying, onBuy]);

  return <button onClick={() => setIsBuying(true)}>Buy</button>;
}
```

---

## PERF-9: Avoid useEffect chains

**Rationale**: Chains of effects where one effect's state update triggers another effect create complex dependencies, timing issues, and unnecessary renders. Restructure to compute derived values directly.

Good:

```tsx
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Compute derived values directly
  const fullName = firstName + ' ' + lastName;
  const isValid = firstName.length > 0 && lastName.length > 0;

  return (
    <form>
      <input value={firstName} onChange={e => setFirstName(e.target.value)} />
      <input value={lastName} onChange={e => setLastName(e.target.value)} />
      {isValid && <button>Submit</button>}
    </form>
  );
}
```

Bad:

```tsx
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Chain of effects
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);

  useEffect(() => {
    setIsValid(fullName.length > 0);
  }, [fullName]);
}
```

---

## PERF-10: Communicate with parent components without useEffect

**Rationale**: Parent-child communication should not use useEffect. Lift the state up to the parent component and pass it down as props. This follows React's unidirectional data flow pattern, eliminates synchronization issues, reduces unnecessary renders, and makes the data flow clearer.

**Exceptions**: Synchronizing with external systems (not parent-child communication).

Good:

```tsx
// Lifting state up
function Parent() {
  const [value, setValue] = useState('');
  return <Child value={value} onChange={setValue} />;
}

function Child({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}
```

Bad:

```tsx
// Passing data via useEffect
function Child({ onValueChange }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    onValueChange(value);
  }, [value, onValueChange]);

  return <input value={value} onChange={e => setValue(e.target.value)} />;
}
```

---

## PERF-11: Optimize data selection and handling

**Rationale**: Using broad data structures or performing unnecessary data operations causes excessive re-renders and degrades performance. Selecting specific fields and avoiding redundant operations reduces render cycles and improves efficiency.

**Exceptions**: Specific fields already selected or data structure is static; filtering is necessary for correct functionality; function requires the entire object for valid operations.

Good:

```tsx
function UserProfile({ userId }) {
  const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`, {
    selector: (user) => ({
      name: user?.name,
      avatar: user?.avatar,
    }),
  });
  return <Text>{user?.name}</Text>;
}
```

Bad:

```tsx
function UserProfile({ userId }) {
  const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`);
  // Component re-renders when any user field changes, even unused ones
  return <Text>{user?.name}</Text>;
}
```

---

## PERF-12: Prevent memory leaks in components

**Rationale**: Failing to clear resources (timeouts, intervals, event listeners, subscriptions) causes memory leaks, leading to increased memory consumption and potential crashes, especially in long-lived or frequently mounted/unmounted components.

**Exceptions**: Resource cleared in cleanup function; resource managed by a library with automatic cleanup; operation guaranteed to complete before unmount.

Good:

```tsx
function TimerComponent() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return <Text>Timer</Text>;
}
```

Bad:

```tsx
function TimerComponent() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateTimer();
    }, 1000);
    // Missing cleanup - interval will continue after unmount
  }, []);

  return <Text>Timer</Text>;
}
```

---

## PERF-13: Avoid iterator-independent function calls in array methods

**Rationale**: Function calls inside iteration callbacks that don't use the iterator variable execute redundantly — producing the same result on every iteration. This creates O(n) overhead that scales with data size. Hoisting these calls outside the loop eliminates redundant computation.

**Exceptions**: Function uses iterator or its derived value (e.g. `func(item.process())`); function depends on iterator context (e.g. `item.value ?? getDefault()`); function creates new entities (e.g. `{ id: createID() }`); same applies when using index instead of iterator.

Good:

```ts
// Hoist iterator-independent calls outside the loop
const config = getConfig();

const results = items.map((item) => item.value * config.multiplier);
```

```ts
// Function receives iterator or iterator-derived value
const formatted = items.map((item) => formatCurrency(item.amount));
```

```ts
// Index used meaningfully
const indexed = items.map((item, index) => ({ ...item, id: generateId(index) }));
```

Bad:

```ts
// getConfig() called on every iteration but doesn't use item
const results = items.map((item) => {
  const config = getConfig();
  return item.value * config.multiplier;
});
```
