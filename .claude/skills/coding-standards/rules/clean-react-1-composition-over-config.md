---
ruleId: CLEAN-REACT-PATTERNS-1
title: Favor composition over configuration
---

## [CLEAN-REACT-PATTERNS-1] Favor composition over configuration

### Reasoning

When new features are implemented by adding configuration (props, flags, conditional logic) to existing components, if requirements change, then those components must be repeatedly modified, increasing coupling, surface area, and regression risk. Composition ensures features scale horizontally, limits the scope of changes, and prevents components from becoming configuration-driven "mega components".

### Incorrect

#### Incorrect (configuration)

- Features controlled by boolean flags
- Adding a new feature requires modifying the Table component's API

```tsx
<Table
  data={items}
  columns={columns}
  shouldShowSearchBar
  shouldShowHeader
  shouldEnableSorting
  shouldShowPagination
  shouldHighlightOnHover
/>

type TableProps = {
  data: Item[];
  columns: Column[];
  shouldShowSearchBar?: boolean;    // Could be <Table.SearchBar />
  shouldShowHeader?: boolean;       // Could be <Table.Header />
  shouldEnableSorting?: boolean;    // Configuration for header behavior
  shouldShowPagination?: boolean;   // Could be <Table.Pagination />
  shouldHighlightOnHover?: boolean; // Configuration for styling behavior
};
```

```tsx
<SelectionList
  data={items}
  shouldShowTextInput
  shouldShowTooltips
  shouldScrollToFocusedIndex
  shouldDebounceScrolling
  shouldUpdateFocusedIndex
  canSelectMultiple
  disableKeyboardShortcuts
/>

type SelectionListProps = {
  shouldShowTextInput?: boolean;      // Could be <SelectionList.TextInput />
  shouldShowConfirmButton?: boolean;  // Could be <SelectionList.ConfirmButton />
  textInputOptions?: {...};           // Configuration object for the above
};
```

#### Incorrect (parent manages child state)

```tsx
// Parent fetches and manages state for its children
// Parent has to know child implementation details
function ReportScreen({ params: { reportID }}) {
  const [reportOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {allowStaleData: true, canBeMissing: true});
  const reportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);
  const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {canBeMissing: true, allowStaleData: true});
  const {reportActions: unfilteredReportActions, linkedAction, sortedAllReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
  const parentReportAction = useParentReportAction(reportOnyx);
  const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
  const isTransactionThreadView = isReportTransactionThread(report);
  // other onyx connections etc

  return (
    <>
      <ReportActionsView
        report={report}
        reportActions={reportActions}
        isLoadingInitialReportActions={reportMetadata?.isLoadingInitialReportActions}
        hasNewerActions={hasNewerActions}
        hasOlderActions={hasOlderActions}
        parentReportAction={parentReportAction}
        transactionThreadReportID={transactionThreadReportID}
        isReportTransactionThread={isTransactionThreadView}
      />
      // other features
      <Composer />
    </>
  );
}
```

### Correct

#### Correct (composition)

- Features expressed as composable children
- Parent stays stable; add features by adding children

```tsx
<Table data={items} columns={columns}>
  <Table.SearchBar />
  <Table.Header />
  <Table.Body />
</Table>
```

```tsx
<SelectionList data={items}>
  <SelectionList.TextInput />
  <SelectionList.Body />
</SelectionList>
```

#### Correct (children manage their own state)

```tsx
// Children are self-contained and manage their own state
// Parent only passes minimal data (IDs)
// Adding new features doesn't require changing the parent
function ReportScreen({ params: { reportID }}) {
  return (
    <>
      <ReportActionsView reportID={reportID} />
      // other features
      <Composer />
    </>
  );
}

// Component accesses stores and calculates its own state
// Parent doesn't know the internals
function ReportActionsView({ reportID }) {
  const [reportOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
  const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
  // ...
}
```

---

### Review Metadata

#### Condition

Flag ONLY when ALL of these are true:

- Any of these scenarios apply:
  - A **new feature** is being introduced
  - An **existing component's API** is being expanded with new props
  - A **refactoring** creates a new component that still has boolean configuration props matching the search patterns controlling branching logic — refactoring is an opportunity to eliminate configuration flags, not preserve them
- The component contains boolean props matching the search patterns that cause `if/else` or ternary branching inside the component body
- These configuration options control feature presence, layout strategy, or behavior within the component

**Features that should NOT be controlled by boolean flags:**
- Optional UI elements that could be composed in
- New behavior that could be introduced as new children
- Features that currently require parent component code changes
- Layout strategy variants

**DO NOT flag if:**
- Props are non-boolean data values needed for coordination between composed parts (e.g., `reportID`, `data`, `columns`).
- The component uses composition and child components for features
- Parent components stay stable as features are added

**Search Patterns** (hints for reviewers):
- `should\w+` (any prop starting with `should`)
- `canSelect`
- `enable`
- `disable`
