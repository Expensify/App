---
ruleId: CONSISTENCY-3
title: Eliminate code duplication
---

## [CONSISTENCY-3] Eliminate code duplication

### Reasoning

Code duplication increases maintenance overhead, raises bug risk, and complicates the codebase. Consolidating similar logic into reusable functions or components adheres to the DRY principle, making code easier to maintain and understand.

### Incorrect

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

### Correct

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

---

### Review Metadata

Flag ONLY when ALL of these are true:

- Code contains duplicated logic, constants, or components in multiple locations
- The duplicated code performs similar operations or serves the same purpose
- The duplicated code is not abstracted into a reusable function or component
- There is no justification for the duplication

**DO NOT flag if:**

- The duplicated code serves distinct purposes or has different requirements
- The code is intentionally duplicated for performance reasons or due to external constraints
- The duplication is in test or mock code
- The duplication is a temporary measure with a plan for refactoring
- Hooks or decomposed components **independently subscribe to the same Onyx keys by ID** - this follows the established "hooks own their data - pass IDs not objects" pattern where each hook encapsulates its own data dependencies rather than receiving pre-fetched objects as props
- Two code paths appear similar but serve **different features, report types, or execution contexts** (e.g., different list components, different backend behaviors). Frame the observation as a question ("Are these paths intentionally different?") rather than asserting a bug.

**When suggesting extraction of a shared hook or utility, verify that:**
- Consumers do not need intermediate values that would be hidden by the abstraction
- The proposed hook would not hide expensive subscriptions (e.g., multiple `useOnyx` calls) behind a simple-looking interface
- The abstraction boundary represents a meaningful concept, not just coincidental code similarity

**Search Patterns** (hints for reviewers):
- Similar code patterns repeated across files/components
