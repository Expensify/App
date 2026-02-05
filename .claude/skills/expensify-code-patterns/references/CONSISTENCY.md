# Consistency Patterns

Patterns for maintainable, consistent code in the Expensify App.

## CONSISTENCY-1: Platform-Specific File Extensions

**Do**: Use platform-specific file extensions for platform differences
**Avoid**: `Platform.OS` checks and conditionals within components

```tsx
// Do: Create platform-specific files
// Button.desktop.tsx
function Button() {
  return <button style={desktopStyles} />;
}

// Button.native.tsx
function Button() {
  return <TouchableOpacity style={mobileStyles} />;
}

// Avoid
function Button() {
  const isAndroid = Platform.OS === 'android';
  return isAndroid ? (
    <TouchableOpacity style={androidStyles} />
  ) : (
    <button style={iosStyles} />
  );
}
```

**Why**: Platform-specific files are easier to maintain, test, and understand. Inline conditionals increase complexity and bug risk.

**Review**: Flag `Platform.OS`, `isAndroid`, `isIOS`, `Platform.select` checks that lead to hardcoded platform values within a single component file.

---

## CONSISTENCY-2: Named Constants Over Magic Values

**Do**: Define named constants for non-obvious values
**Avoid**: Hardcoded numbers and strings without explanation

```tsx
// Do
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT_MS = 5000;

function fetchData() {
  if (attempts < MAX_RETRY_ATTEMPTS) {
    return apiCall({ timeout: API_TIMEOUT_MS });
  }
}

// Avoid
function fetchData() {
  if (attempts < 3) {
    return apiCall({ timeout: 5000 });
  }
}
```

**What's OK**: Self-explanatory values (`0`, `1`, `true`, `false`, `Math.PI`), values with inline comments, values in configuration files.

**Why**: Named constants improve readability and make changes easier.

**Review**: Flag non-obvious numeric literals (>1) and string literals without constants or comments.

---

## CONSISTENCY-3: DRY - Extract Duplicate Logic

**Do**: Create reusable functions/components for repeated patterns
**Avoid**: Copy-pasting similar logic across files

```tsx
// Do
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

// Avoid: Same formatting logic duplicated in multiple components
```

**Exceptions**: Test/mock code, intentional duplication for performance, temporary duplication with refactor plan.

**Why**: Duplication increases maintenance burden and bug risk.

**Review**: Flag repeated logic patterns that could be extracted to a shared utility or component.

---

## CONSISTENCY-4: Remove Unused Props

**Do**: Only define props that are used in the component
**Avoid**: Keeping unused prop definitions in types/destructuring

```tsx
// Do
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

// Avoid
type ButtonProps = {
  title: string;
  onPress: () => void;
  unusedProp: string;      // Never used
  anotherUnused: number;   // Never used
};

function Button({ title, onPress }: ButtonProps) { /* ... */ }
```

**Why**: Unused props bloat interfaces and confuse developers about what's actually needed.

**Review**: Flag prop type definitions where props aren't used in the component implementation.

---

## CONSISTENCY-5a: Justify ESLint Disables

**Do**: Add comment explaining why ESLint rule is disabled
**Avoid**: Disabling rules without justification

```tsx
// Do
// eslint-disable-next-line react-hooks/exhaustive-deps
// Dependencies intentionally omitted - effect should only run on mount
useEffect(() => {
  initializeComponent();
}, []);

// Avoid
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  initializeComponent();
}, []);
```

**Why**: Unjustified disables can mask real issues and make code review harder.

**Review**: Flag `eslint-disable*` comments without an accompanying explanation.

---

## CONSISTENCY-5b: Proper Error Handling

**Do**: Log errors and provide user feedback for critical operations
**Avoid**: Silent failures or missing error handling

```tsx
// Do
async function submitForm(data: FormData) {
  try {
    await API.submit(data);
    showSuccessMessage('Form submitted successfully');
  } catch (error) {
    Log.error('Form submission failed', error);
    showErrorMessage('Failed to submit form. Please try again.');
  }
}

// Avoid
async function submitForm(data: FormData) {
  await API.submit(data);
  // No error handling - failures are silent
  showSuccessMessage('Form submitted successfully');
}
```

**Exceptions**: Non-critical operations, errors handled by higher-level middleware, intentionally suppressed with clear justification.

**Why**: Silent failures make debugging difficult and leave users confused.

**Review**: Flag API calls, auth operations, and data mutations without try/catch or .catch() handling.
