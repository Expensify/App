# Consistency Patterns

Patterns for maintainable, consistent code in the Expensify App.

## CONSISTENCY-1: Avoid platform-specific checks within components

**Rationale**: Mixing platform-specific logic within components increases maintenance overhead, complexity, and bug risk. Separating concerns through platform-specific file extensions (e.g., `index.web.tsx`, `index.native.tsx`) improves maintainability and testability.

**Exceptions**: Logic already handled through platform-specific file extensions.

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

## CONSISTENCY-2: Avoid magic numbers and strings

**Rationale**: Magic numbers and strings reduce code readability and maintainability. Replacing them with named constants or documented values improves clarity and makes future changes easier.

**Exceptions**: Self-explanatory values (`0`, `1`, `true`, `false`, `Math.PI`); values in configuration or environment variables; values documented with clear comments; values defined as named constants in the same file or imported module.

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

## CONSISTENCY-3: Eliminate code duplication

**Rationale**: Code duplication increases maintenance overhead, raises bug risk, and complicates the codebase. Consolidating similar logic into reusable functions or components adheres to the DRY principle, making code easier to maintain and understand.

**Exceptions**: Duplicated code serves distinct purposes or has different requirements; intentional duplication for performance or external constraints; duplication in test or mock code; temporary duplication with a plan for refactoring.

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

## CONSISTENCY-4: Eliminate unused and redundant props

**Rationale**: Unused props increase component complexity and maintenance overhead. Simplifying component interfaces improves code clarity and makes the component API easier to understand.

**Exceptions**: Props conditionally used or part of a larger interface; props prepared for future use or part of an ongoing refactor; prop necessary for functionality or future extensibility; prop redundant but serves a distinct purpose (e.g., backward compatibility).

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

## CONSISTENCY-5: Justify ESLint rule disables

**Rationale**: ESLint rule disables without justification can mask underlying issues and reduce code quality. Clear documentation ensures team members understand exceptions, promoting better maintainability.

**Exceptions**: Disablement is justified with a clear comment explaining why the rule is disabled.

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

## CONSISTENCY-6: Ensure proper error handling

**Rationale**: Proper error handling prevents silent failures, enhances debuggability, and improves user experience. Failing to handle errors can lead to crashes, data loss, and confusion for both developers and users.

**Exceptions**: Errors logged and handled properly with user feedback; errors intentionally suppressed with clear justification; error handling managed by a higher-level function or middleware; operation is non-critical and errors are acceptable to ignore.

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
