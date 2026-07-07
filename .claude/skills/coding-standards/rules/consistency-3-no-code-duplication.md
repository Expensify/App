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

**Search Patterns** (hints for reviewers):
- Similar code patterns repeated across files/components
