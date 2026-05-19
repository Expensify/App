---
name: ""
overview: ""
todos: []
isProject: false
---

# Sticky Group Table Header via `stickyHeaderIndices`

## Goal

When a transaction group is expanded in the Search Spend table, the child column header row (Receipt, Type, Date, Status, Merchant, Description, To, Category, Tag, Total) should **stick to the top** of the viewport as you scroll through a long list of child transactions.

---

## Why this change is needed

In the Spend grouped search view, each group (e.g. grouped by "From") can contain dozens or hundreds of child transactions. When you expand a group and scroll down, the column headers disappear off-screen and you lose context about what each column represents. Sticky headers solve this by keeping the column header row pinned at the top.

---

## The constraint: No `position: sticky` (CSS)

The user explicitly rejected a CSS `position: sticky` approach because:

1. It's a **web-only** solution — React Native on iOS/Android doesn't support CSS `position: sticky`.
2. The app uses `FlashList` (Shopify) which has a built-in `stickyHeaderIndices` prop specifically designed for this.
3. The emoji picker already uses `stickyHeaderIndices` successfully in this codebase, so it's a proven pattern.

---

## The core problem: `stickyHeaderIndices` only works on top-level FlashList items

`stickyHeaderIndices` takes an array of indices into the FlashList's `data` array. Only **top-level items** can be made sticky. Before our change, the data structure looked like:

```
FlashList data = [
  GroupItem_A,    // index 0 — renders header + AnimatedCollapsible(table header + transactions + footer)
  GroupItem_B,    // index 1
  GroupItem_C,    // index 2
  ...
]
```

The table header was **deeply nested** inside `GroupItem_A`'s render tree:

```
GroupItem_A renders:
  └── PressableWithFeedback
       └── AnimatedCollapsible
            ├── SearchTableHeader   <-- THIS is what we want sticky
            ├── Transaction 1
            ├── Transaction 2
            └── Show More button
```

There's no way to tell FlashList "make the `SearchTableHeader` inside index 0 sticky" — it can only sticky the **entire item at index 0**.

---

## The solution: Data flattening

We restructure the FlashList data so that when a group is expanded, the table header becomes its own top-level item:

```
Before (collapsed):
  [GroupItem_A, GroupItem_B, GroupItem_C]

After (GroupItem_A expanded):
  [
    GroupItem_A,              // index 0 — just the summary row (header only)
    TableHeaderItem_A,        // index 1 — ← stickyHeaderIndices=[1]
    ExpandedContentItem_A,    // index 2 — transactions + footer (no table header)
    GroupItem_B,              // index 3
    GroupItem_C,              // index 4
  ]
```

Now `stickyHeaderIndices=[1]` makes the column header stick to the top when scrolling.

---

## What changed in each file

### 1. `ListItem/types.ts` — New item types

**What**: Added three new types and a new union type.

**Why**: FlashList's `data` array now contains different kinds of items. We need TypeScript types to distinguish them.

- `**ExpandedGroupTableHeaderItem`** — represents the sticky column header row. Contains: `itemType: 'expandedGroupTableHeader'`, the `columns` array, `groupBy`, `canSelectMultiple`, `isExpenseReportType`, and `transactionsQueryHash` (used to fetch snapshot data from Onyx for computing the correct child-level columns).
- `**ExpandedGroupContentItem**` — represents the expanded transactions + footer block (everything below the table header). Contains: `itemType: 'expandedGroupContent'` and a reference to the original `groupItem` so the renderer has full access to transaction data and query info.
- `**SearchFlashListItem**` — a union of `SearchListItem | ExpandedGroupTableHeaderItem | ExpandedGroupContentItem`. This is the generic type for FlashList's `data` prop, replacing the old `SearchListItem` everywhere FlashList touches.
- **Added to `TransactionGroupListItemProps`**: `isExpanded?: boolean` and `onToggleExpansion?: () => void` — to lift expansion state up to `SearchList`.
- **Added to `TransactionGroupListExpandedProps`**: `shouldHideTableHeader?: boolean` — so the expanded content can skip rendering its own table header when it's rendered as a separate sticky item.

### 2. `SearchList/index.tsx` — The main orchestrator

**What**: This is where most of the logic lives. Key additions:

#### a) Expansion state lifted up

```ts
const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(new Set());
const toggleGroupExpansion = useCallback(...)
```

**Why**: Previously, `TransactionGroupListItem` managed its own `isExpanded` state internally. But now `SearchList` needs to know which groups are expanded to flatten the data. So expansion state is lifted to the parent.

#### b) Data flattening (`expandedData` memo)

```ts
const { expandedData, stickyHeaderIndices } = useMemo(() => {
  // For each expanded group, insert TableHeaderItem + ContentItem after the group
  // Track header indices for stickyHeaderIndices
}, [data, expandedGroupKeys, type, columns, groupBy, canSelectMultiple]);
```

**Why**: This is the core transformation. It iterates through the original `data`, and for each expanded group, inserts an `ExpandedGroupTableHeaderItem` and an `ExpandedGroupContentItem` right after the group item. It also records the index of each table header for `stickyHeaderIndices`.

#### c) `ExpandedGroupTableHeader` component

```ts
function ExpandedGroupTableHeader({ item }) {
  // Fetches its own Onyx snapshot to compute correct child columns
  // Renders SearchTableHeaderComponent with resolved columns
}
```

**Why**: The table header needs the correct child-level columns (Receipt, Type, Date, etc.), NOT the parent group columns (From, Expenses, Total). For non-expense-report group types, these columns are computed from the Onyx snapshot via `getColumnsToShow()`. Since this component is rendered standalone (not inside `TransactionGroupListItem`), it fetches the snapshot itself.

#### d) `getItemType` callback

```ts
const getItemType = useCallback((item) => {
  if (isExpandedGroupItem(item)) return item.itemType;
  if ('transactions' in item) return 'transactionGroup';
  if ('transactionID' in item) return 'transaction';
  return 'other';
}, []);
```

**Why**: FlashList uses `getItemType` for efficient cell recycling. Different item types have completely different layouts, so FlashList needs to know not to recycle a transaction row as a table header.

#### e) Updated `renderItem`

**Why**: Now handles three cases:

1. `expandedGroupTableHeader` → renders `<ExpandedGroupTableHeader />`
2. `expandedGroupContent` → renders `<TransactionGroupListExpanded shouldHideTableHeader />`
3. Regular items → renders `<ListItem />` as before, but now passes `isExpanded` and `onToggleExpansion`

#### f) Passed to `BaseSearchList`

```tsx
<BaseSearchList
  data={expandedData}             // was: data
  stickyHeaderIndices={computedStickyHeaderIndices}  // NEW
  getItemType={getItemType}       // NEW
/>
```

### 3. `TransactionGroupListItem.tsx` — Controlled expansion mode

**What**: Added "controlled expansion" mode where the parent (`SearchList`) controls the `isExpanded` state.

**Why**: When the expansion is controlled by `SearchList` (i.e., `onToggleExpansion` is provided):

- The group item renders **only the summary header row** (`getHeader(hovered)`)
- It does NOT render the `AnimatedCollapsible` with the expanded content
- The expanded content is instead rendered as separate FlashList items (`ExpandedGroupContentItem`)

When `onToggleExpansion` is NOT provided (backward compatibility):

- The group item works exactly as before — internal state, `AnimatedCollapsible`, etc.

Key code:

```tsx
const isControlledExpansion = !!onToggleExpansion;

{isControlledExpansion ? (
    getHeader(hovered)   // Just the summary row
) : (
    <AnimatedCollapsible>  // Full expand/collapse as before
        <TransactionGroupListExpandedItem ... />
    </AnimatedCollapsible>
)}
```

### 4. `TransactionGroupListExpanded.tsx` — Self-sufficient rendering

**What**: Made the component capable of running standalone (outside `TransactionGroupListItem`).

**Why**: When rendered as an `ExpandedGroupContentItem` by `SearchList`, this component no longer receives `transactionsSnapshot` from its parent `TransactionGroupListItem`. It needs to:

1. **Fetch its own snapshot**: Uses `useOnyx` to fetch the snapshot by query hash when `transactionsSnapshot` is not provided.
2. **Compute its own transactions**: For non-expense-report types, calls `getSections()` to transform snapshot data into `TransactionListItemType[]` — the same computation that `TransactionGroupListItem` does.
3. **Handle its own pagination**: `resolvedSearchTransactions` calls `search()` directly when self-fetching, or delegates to the `searchTransactions` prop when not.
4. **Hide its table header**: When `shouldHideTableHeader` is true, skips rendering the `SearchTableHeader` (because it's already rendered as a separate sticky FlashList item).

All references to `transactionsSnapshot` and `transactions` were replaced with `resolvedSnapshot` and `resolvedTransactions` respectively, which fall back to self-fetched data when needed.

### 5. `BaseSearchList/types.ts` — Type updates

**What**: Changed all FlashList-facing types from `SearchListItem` to `SearchFlashListItem`.

**Why**: The FlashList now contains mixed item types. The `data` prop, `renderItem` callback, `onSelectRow` callback, and `ref` all need the wider union type. Also added `stickyHeaderIndices` and `getItemType` to the pick list from `FlashListProps`.

### 6. `BaseSearchList/index.tsx` and `index.native.tsx` — Plumbing

**What**: Updated `FlashList` generic type, passed through `stickyHeaderIndices` and `getItemType` props, and added a guard in `selectFocusedOption` to skip expanded group items during keyboard navigation.

---

## Alternatives considered

### Alternative 1: CSS `position: sticky` (REJECTED by user)

**How it would work**: Add `position: sticky; top: 0; z-index: 1` to the table header element inside the `AnimatedCollapsible`.

**Pros**:

- Minimal code change (a few lines of CSS)
- No data restructuring needed
- No new types needed

**Cons**:

- Web-only — doesn't work on React Native iOS/Android
- Fighting against FlashList's virtualization (sticky elements inside virtualized cells can behave unpredictably)
- Not the established pattern in this codebase

**Why rejected**: The user explicitly rejected this multiple times and requested the `stickyHeaderIndices` approach.

### Alternative 2: Fully flatten each transaction into its own FlashList item (ATTEMPTED, then abandoned)

**How it would work**: Instead of an `ExpandedGroupContentItem` wrapping all transactions, each transaction would be a separate `ExpandedGroupTransactionItem` in the FlashList data array:

```
[GroupHeader, StickyTableHeader, Transaction1, Transaction2, ..., FooterItem]
```

**Pros**:

- Each transaction is individually virtualized by FlashList (better memory for huge groups)
- More granular control over each row

**Cons**:

- The child transaction columns are computed differently for non-expense-report group types — they come from `getColumnsToShow()` using Onyx snapshot data, not the parent `columns` prop. This means each `TransactionItemRow` would receive the wrong columns (group-level: From/Expenses/Total instead of child-level: Receipt/Type/Date/Merchant/etc.)
- `TransactionGroupListExpanded` does a LOT of data preparation: fetches snapshot, runs `getSections()`, computes violations, handles pagination, etc. Replicating all this in `SearchList`'s `renderItem` would be massive duplication
- The "Show More" button and loading indicator logic is tightly coupled to the snapshot metadata

**Why abandoned**: The first attempt rendered transactions with empty/wrong columns. The root cause was that `SearchList` only has group-level columns, not the child expense columns that require Onyx snapshot data.

### Alternative 3: The chosen approach — 3 FlashList items per expanded group

**How it works**: Each expanded group becomes 3 items:

1. `GroupItem` (summary row only)
2. `ExpandedGroupTableHeaderItem` (sticky column headers — self-fetches correct columns)
3. `ExpandedGroupContentItem` (wraps `TransactionGroupListExpanded` with `shouldHideTableHeader`)

**Pros**:

- Reuses the existing `TransactionGroupListExpanded` component which already handles all the complex data preparation, column computation, pagination, and rendering
- Minimal duplication — only the table header rendering is "duplicated" (and even that delegates to the same `SearchTableHeaderComponent`)
- `TransactionGroupListExpanded` was made self-sufficient by adding snapshot self-fetching, so it works both standalone and inside `TransactionGroupListItem`
- Backward compatible — when `onToggleExpansion` is not provided, `TransactionGroupListItem` works exactly as before

**Cons**:

- The expanded content (all transactions) is a single FlashList item, so it's not individually virtualized. For groups with hundreds of transactions, this could be a concern. However, `TransactionGroupListExpanded` already handles pagination with "Show More", so only a page of transactions is rendered at a time.
- Added complexity in `TransactionGroupListExpanded` with the self-fetching logic

---

## Data flow diagram

```
SearchList
  │
  ├── expandedGroupKeys (Set<string>) — which groups are expanded
  │
  ├── expandedData (useMemo) — flattened array:
  │     [GroupA, TableHeader_A, Content_A, GroupB, GroupC, ...]
  │
  ├── stickyHeaderIndices — [1] (index of TableHeader_A)
  │
  ├── renderItem dispatches by itemType:
  │     ├── 'expandedGroupTableHeader' → <ExpandedGroupTableHeader />
  │     │     └── fetches Onyx snapshot → computes child columns → renders SearchTableHeaderComponent
  │     │
  │     ├── 'expandedGroupContent' → <TransactionGroupListExpanded shouldHideTableHeader />
  │     │     └── fetches own snapshot (if not provided) → computes transactions → renders rows
  │     │
  │     └── regular items → <ListItem /> (TransactionGroupListItem with isExpanded + onToggleExpansion)
  │           └── renders only summary header (skips AnimatedCollapsible when controlled)
  │
  └── BaseSearchList
        └── FlashList<SearchFlashListItem>
              ├── data={expandedData}
              ├── stickyHeaderIndices={[1]}
              └── getItemType={...}
```

---

## Files modified (commit `730978ae5db`)


| File                               | Lines changed | Purpose                                                                                                                       |
| ---------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `ListItem/types.ts`                | +29           | New types: `ExpandedGroupTableHeaderItem`, `ExpandedGroupContentItem`, `SearchFlashListItem`; new props on existing types     |
| `SearchList/index.tsx`             | +212/-17      | Expansion state, data flattening, `ExpandedGroupTableHeader` component, updated `renderItem`, passed sticky props             |
| `TransactionGroupListItem.tsx`     | +103/-87      | Controlled expansion mode, conditional `AnimatedCollapsible` vs header-only rendering                                         |
| `TransactionGroupListExpanded.tsx` | +88/-20       | Self-sufficient rendering: snapshot self-fetch, `resolvedTransactions`, `resolvedSearchTransactions`, `shouldHideTableHeader` |
| `BaseSearchList/types.ts`          | +14/-8        | `SearchListItem` → `SearchFlashListItem` in all FlashList-facing types                                                        |
| `BaseSearchList/index.tsx`         | +12/-6        | Type updates, sticky props passthrough, keyboard nav guard                                                                    |
| `BaseSearchList/index.native.tsx`  | +10/-4        | Type updates, sticky props passthrough                                                                                        |


