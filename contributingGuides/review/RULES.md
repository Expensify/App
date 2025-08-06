# ✅ AI Code Review Rules

These rules are used to conduct structured code reviews on pull request diffs.

Each rule includes:
- A unique **Rule ID**
- **Pass/Fail condition**
- **Reasoning**: Technical explanation of why the rule is important
- Examples of good and bad usage

Very important:
- Make sure you include a separate comment for every rule violation
- Every comment has to reference a **Rule ID** it violates

---

## Performance Rules

### [PERF-1] No spread in list item's renderItem
- **Condition**: When passing data to components in renderItem functions, avoid using spread operators to extend objects. Instead, pass the base object and additional properties as separate props to prevent unnecessary object creation on each render.
- **Reasoning**: `renderItem` functions execute for every visible list item on each render. Creating new objects with spread operators forces React to treat each item as changed, preventing reconciliation optimizations and causing unnecessary re-renders of child components.

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

### [PERF-2] Use early returns in array iteration methods
- **Condition**: When using `.every()`, `.some()`, or similar methods, perform simple checks first with early returns before expensive operations.
- **Reasoning**: Expensive operations can be any long-running synchronous tasks (like complex calculations) and should be avoided when simple property checks can eliminate items early. This reduces unnecessary computation and improves iteration performance, especially on large datasets.

Good:
```tsx
const areAllTransactionsValid = transactions.every((transaction) => {
    if (!transaction.rawData || transaction.amount <= 0) return false;
    const validation = validateTransaction(transaction);
    return validation.isValid;
});
```

Bad:
```tsx
const areAllTransactionsValid = transactions.every((transaction) => {
    const validation = validateTransaction(transaction);
    return validation.isValid;
});
```

---

### [PERF-3] Use OnyxListItemProvider hooks instead of useOnyx in renderItem
- **Condition**: Components rendered inside `renderItem` functions should use dedicated hooks from `OnyxListItemProvider` instead of individual `useOnyx` calls.
- **Reasoning**: Individual `useOnyx` calls in renderItem create separate subscriptions for each list item, causing memory overhead and update cascades. `OnyxListItemProvider` hooks provide optimized data access patterns specifically designed for list rendering performance.

Good:
```tsx
const personalDetails = usePersonalDetails();
```

Bad:
```tsx
const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
```

---

### [PERF-4] Memoize objects and functions passed as props
- **Condition**: Objects and functions passed as props should be properly memoized or simplified to primitive values to prevent unnecessary re-renders.
- **Reasoning**: React uses referential equality to determine if props changed. New object/function instances on every render trigger unnecessary re-renders of child components, even when the actual data hasn't changed. Memoization preserves referential stability.

Good:
```tsx
const reportData = useMemo(() => ({
    reportID: report.reportID,
    type: report.type,
    isPinned: report.isPinned,
}), [report.reportID, report.type, report.isPinned]);

return <ReportActionItem report={reportData} />
```

Bad:
```tsx
const [report] = useOnyx(`ONYXKEYS.COLLECTION.REPORT${iouReport.id}`);

return <ReportActionItem report={report} />
```

---

### [PERF-5] Use shallow comparisons instead of deep comparisons
- **Condition**: In `React.memo` and similar optimization functions, compare only specific relevant properties instead of using deep equality checks.
- **Reasoning**: Deep equality checks recursively compare all nested properties, creating performance overhead that often exceeds the re-render cost they aim to prevent. Shallow comparisons of specific relevant properties provide the same optimization benefits with minimal computational cost.

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

### [PERF-6] Use specific properties as hook dependencies
- **Condition**: In `useEffect`, `useMemo`, and `useCallback`, specify individual object properties as dependencies instead of passing entire objects.
- **Reasoning**: Passing entire objects as dependencies causes hooks to re-execute whenever any property changes, even unrelated ones. Specifying individual properties creates more granular dependency tracking, reducing unnecessary hook executions and improving performance predictability.

Good:
```tsx
const {amountColumnSize, dateColumnSize, taxAmountColumnSize} = useMemo(() => {
    return {
        amountColumnSize: transactionItem.isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        taxAmountColumnSize: transactionItem.isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        dateColumnSize: transactionItem.shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    };
}, [transactionItem.isAmountColumnWide, transactionItem.isTaxAmountColumnWide, transactionItem.shouldShowYear]);
```

Bad:
```tsx
const {amountColumnSize, dateColumnSize, taxAmountColumnSize} = useMemo(() => {
    return {
        amountColumnSize: transactionItem.isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        taxAmountColumnSize: transactionItem.isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        dateColumnSize: transactionItem.shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    };
}, [transactionItem]);
```

---
