### [CONSISTENCY-1] Avoid platform-specific checks within components

- **Condition**: Flag ONLY when ALL of these are true:

  - Platform detection checks (e.g., `Platform.OS`, `isAndroid`, `isIOS`) are present within a component
  - The checks lead to hardcoded values or styles specific to a platform
  - The component is not structured to handle platform-specific logic through file extensions or separate components

  **DO NOT flag if:**

  - The logic is handled through platform-specific file extensions (e.g., `index.desktop.tsx`, `index.mobile.tsx`)

- **Reasoning**: Mixing platform-specific logic within components increases maintenance overhead, complexity, and bug risk. Separating concerns through dedicated files or components improves maintainability and reduces platform-specific bugs.

Good:

```tsx
// Platform-specific file: Button.desktop.tsx
function Button() {
  return <button style={desktopStyles} />;
}

// Platform-specific file: Button.mobile.tsx
function Button() {
  return <TouchableOpacity style={mobileStyles} />;
}
```

Bad:

```tsx
function Button() {
  const isAndroid = Platform.OS === 'android';
  return isAndroid ? (
    <TouchableOpacity style={androidStyles} />
  ) : (
    <button style={iosStyles} />
  );
}
```

---

### [CONSISTENCY-2] Avoid magic numbers and strings

- **Condition**: Flag ONLY when ALL of these are true:

  - Hardcoded strings or numbers are used without documentation or comments
  - The value is not defined as a constant elsewhere in the codebase
  - The value is not self-explanatory (e.g., `0`, `1`, `Math.PI`)

  **DO NOT flag if:**

  - The value is self-explanatory (e.g., `Math.PI`, `0`, `1`, `true`, `false`)
  - The value is part of configuration or environment variables
  - The value is documented with clear comments explaining its purpose
  - The value is defined as a named constant in the same file or imported module

- **Reasoning**: Magic numbers and strings reduce code readability and maintainability. Replacing them with named constants or documented values improves clarity and makes future changes easier.

Good:

```tsx
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT_MS = 5000;

function fetchData() {
  if (attempts < MAX_RETRY_ATTEMPTS) {
    return apiCall({ timeout: API_TIMEOUT_MS });
  }
}
```

Bad:

```tsx
function fetchData() {
  if (attempts < 3) {
    return apiCall({ timeout: 5000 });
  }
}
```

---

### [CONSISTENCY-3] Eliminate code duplication

- **Condition**: Flag ONLY when ALL of these are true:

  - Code contains duplicated logic, constants, or components in multiple locations
  - The duplicated code performs similar operations or serves the same purpose
  - The duplicated code is not abstracted into a reusable function or component
  - There is no justification for the duplication

  **DO NOT flag if:**

  - The duplicated code serves distinct purposes or has different requirements
  - The code is intentionally duplicated for performance reasons or due to external constraints
  - The duplication is in test or mock code
  - The duplication is a temporary measure with a plan for refactoring

- **Reasoning**: Code duplication increases maintenance overhead, raises bug risk, and complicates the codebase. Consolidating similar logic into reusable functions or components adheres to the DRY principle, making code easier to maintain and understand.

Good:

```tsx
function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function TransactionList({ transactions }) {
  return transactions.map(t => formatCurrency(t.amount, t.currency));
}

function SummaryCard({ total }) {
  return <Text>{formatCurrency(total, 'USD')}</Text>;
}
```

Bad:

```tsx
function TransactionList({ transactions }) {
  return transactions.map(t => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: t.currency,
    }).format(t.amount)
  );
}

function SummaryCard({ total }) {
  return (
    <Text>
      {new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(total)}
    </Text>
  );
}
```

---

### [CONSISTENCY-4] Eliminate unused and redundant props

- **Condition**: Flag ONLY when ALL of these are true:

  - A component defines props that are not referenced in its implementation
  - The prop is not conditionally used or part of a larger interface
  - The prop is not prepared for future use or part of an ongoing refactor

  **DO NOT flag if:**

  - Props are conditionally used or part of a larger interface
  - Props are prepared for future use or part of an ongoing refactor
  - The prop is necessary for functionality or future extensibility
  - The prop is redundant but serves a distinct purpose (e.g., backward compatibility)

- **Reasoning**: Unused props increase component complexity and maintenance overhead. Simplifying component interfaces improves code clarity and makes the component API easier to understand.

Good:

```tsx
type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

function Button({ title, onPress, disabled = false }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
```

Bad:

```tsx
type ButtonProps = {
  title: string;
  onPress: () => void;
  unusedProp: string; // Never used in component
  anotherUnused: number; // Never used in component
};

function Button({ title, onPress }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
```

---

### [CONSISTENCY-5] Justify ESLint rule disables

- **Condition**: Flag ONLY when ALL of these are true:

  - An ESLint rule is disabled (via `eslint-disable`, `eslint-disable-next-line`, etc.)
  - The disable statement lacks an accompanying comment explaining the reason

  **DO NOT flag if:**

  - The disablement is justified with a clear comment explaining why the rule is disabled

- **Reasoning**: ESLint rule disables without justification can mask underlying issues and reduce code quality. Clear documentation ensures team members understand exceptions, promoting better maintainability.

Good:

```tsx
// eslint-disable-next-line react-hooks/exhaustive-deps
// Dependencies are intentionally omitted - this effect should only run on mount
useEffect(() => {
  initializeComponent();
}, []);
```

Bad:

```tsx
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  initializeComponent();
}, []);
```

---

### [MEMORY-1] Prevent memory leaks in components and plugins

- **Condition**: Flag ONLY when ALL of these are true:

  - A resource (timeout, interval, event listener, subscription, etc.) is created in a component
  - The resource is not cleared upon component unmount
  - Asynchronous operations are initiated without a corresponding cleanup mechanism

  **DO NOT flag if:**

  - The resource is cleared properly in a cleanup function (e.g., inside `useEffect` return)
  - The resource is not expected to persist beyond the component's lifecycle
  - The resource is managed by a library that handles cleanup automatically
  - The operation is guaranteed to complete before the component unmounts

- **Reasoning**: Failing to clear resources causes memory leaks, leading to increased memory consumption and potential crashes, especially in long-lived components or components that mount/unmount frequently.

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

### [PERF-11] Optimize data selection and handling

- **Condition**: Flag ONLY when ALL of these are true:

  - A component uses a broad data structure (e.g., entire object) without selecting specific fields
  - This causes unnecessary re-renders when unrelated fields change
  - OR unnecessary data filtering/fetching is performed (excluding necessary data, fetching already available data)

  **DO NOT flag if:**

  - Specific fields are already being selected or the data structure is static
  - The filtering is necessary for correct functionality
  - The fetched data is required and cannot be derived from existing data
  - The function requires the entire object for valid operations

- **Reasoning**: Using broad data structures or performing unnecessary data operations causes excessive re-renders and degrades performance. Selecting specific fields and avoiding redundant operations reduces render cycles and improves efficiency.

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

### [SAFETY-1] Ensure proper error handling

- **Condition**: Flag ONLY when ALL of these are true:

  - Error handling logic exists but errors are not logged or handled appropriately
  - OR error states are not communicated to the user or developer clearly
  - OR a critical function (e.g., API call, authentication, data mutation) lacks error handling

  **DO NOT flag if:**

  - Errors are logged and handled properly with user feedback
  - Errors are intentionally suppressed with clear justification
  - Error handling is managed by a higher-level function or middleware
  - The operation is non-critical and errors are acceptable to ignore

- **Reasoning**: Proper error handling prevents silent failures, enhances debuggability, and improves user experience. Failing to handle errors can lead to crashes, data loss, and confusion for both developers and users.

Good:

```tsx
async function submitForm(data: FormData) {
  try {
    await API.submit(data);
    showSuccessMessage('Form submitted successfully');
  } catch (error) {
    Log.error('Form submission failed', error);
    showErrorMessage('Failed to submit form. Please try again.');
  }
}
```

Bad:

```tsx
async function submitForm(data: FormData) {
  await API.submit(data);
  // No error handling - failures are silent
  showSuccessMessage('Form submitted successfully');
}
```
