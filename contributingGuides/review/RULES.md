# ✅ AI Code Review Rules

These rules are used to conduct structured code reviews on pull request diffs. Each rule includes:

- A unique **Rule ID**
- **Severity level**:
  - MUST: Mandatory to update this as it causes issues.
  - SHOULD: Strong recommendation to consider changing this and think about future implications.
- **Pass/Fail condition**
- Examples of good and bad usage

---

## Performance Rules

### [PERF-1] No spread in list item's renderItem
- **Severity**: MUST
- **Condition**: When passing data to components in renderItem functions, avoid using spread operators to extend objects. Instead, pass the base object and additional properties as separate props to prevent unnecessary object creation on each render.

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

### [PERF-2] Use Set for O(1) lookups instead of array methods
- **Severity**: SHOULD
- **Condition**: When performing repeated lookups or checking existence in collections, convert arrays to Sets for O(1) performance instead of using O(n) methods like `.includes()`.

Good:
```tsx
const reportIdFromRoute = report.reportId;
const reportUserIdSet = new Set(Object.values(reports));
const reportExists = reportUserIdSet.has(reportIdFromRoute);
```

Bad:
```tsx
const reportIdFromRoute = report.reportId;
const reportExists = Object.values(reports).includes(reportIdFromRoute);
```

---

### [PERF-3] Use early returns in array iteration methods
- **Severity**: SHOULD
- **Condition**: When using `.every()`, `.some()`, or similar methods, perform simple checks first with early returns before expensive operations.

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

### [PERF-4] Use OnyxListItemProvider hooks instead of useOnyx in renderItem
- **Severity**: MUST
- **Condition**: Components rendered inside `renderItem` functions should use dedicated hooks from `OnyxListItemProvider` instead of individual `useOnyx` calls.

Good:
```tsx
// ReportActionItem.tsx
const personalDetails = usePersonalDetails();
```

Bad:
```tsx
// ReportActionItem.tsx
const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
```

---

### [PERF-5] Memoize objects and functions passed as props
- **Severity**: MUST
- **Condition**: Objects and functions passed as props should be properly memoized or simplified to primitive values to prevent unnecessary re-renders.

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

### [PERF-6] Avoid inline object/array/function creation in JSX
- **Severity**: SHOULD
- **Condition**: Objects, arrays, and functions should not be created inline in JSX. Use `useMemo` or `useCallback` to memoize them when there's actual performance benefit.

Good:
```tsx
const reportActionItemStyle = useMemo(() => [styles.container, styles.flex], []);
const handleSelect = useCallback(() => {
    onSelectRow(item);
}, [onSelectRow, item]);

<ReportActionItem
    style={reportActionItemStyle}
    onSelect={handleSelect}
    reportID={report.reportID}
/>
```

Bad:
```tsx
<ReportActionItem
    style={[styles.container, styles.flex]}
    onSelect={() => onSelectRow(item)}
    reportID={report.reportID}
/>
```

---

### [PERF-7] Use shallow comparisons instead of deep comparisons
- **Severity**: SHOULD
- **Condition**: In `React.memo` and similar optimization functions, compare only specific relevant properties instead of using deep equality checks.

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

### [PERF-8] Use specific properties as hook dependencies
- **Severity**: SHOULD
- **Condition**: In `useEffect`, `useMemo`, and `useCallback`, specify individual object properties as dependencies instead of passing entire objects.

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
