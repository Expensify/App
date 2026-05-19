---
name: ""
overview: ""
todos: []
isProject: false
---

# Compact Table Styles — Full Context

## Parent Issue — #86102

**[[CFI] Update table styles on NewDot web to use a more compact, information-dense layout](https://github.com/Expensify/App/issues/86102)**

Customer and internal feedback: tables on NewDot web are "too airy", lack information density, and cause excessive vertical scrolling. The goal is to update all table styles across the app to a more compact design.

- **Owner**: @Krishna2323
- **Assignees**: @shawnborton, @luacmartins, @JS00001, @Krishna2323, @situchan
- **POC**: [https://84676.pr-testing.expensify.com/](https://84676.pr-testing.expensify.com/)
- **Figma**: [https://www.figma.com/design/DMwzhMmaL09kc8PayTEPun/NewDot-Compact-Styles?node-id=769-306165](https://www.figma.com/design/DMwzhMmaL09kc8PayTEPun/NewDot-Compact-Styles?node-id=769-306165)

### Sub-Issues (16 total — 1 closed, 15 open)


| #      | Issue                                                          | Status | Assignees                         |
| ------ | -------------------------------------------------------------- | ------ | --------------------------------- |
| #86202 | **Update the reports table (all views)**                       | CLOSED | shawnborton, luacmartins, JS00001 |
| #87460 | **[$250] Update table and row styles for Mobile Reports page** | OPEN   | shawnborton, luacmartins, JS00001 |
| #86203 | **Update the report details view**                             | OPEN   | shawnborton, luacmartins, JS00001 |
| #86204 | Update the policy company cards table                          | OPEN   | shawnborton, luacmartins, JS00001 |
| #86205 | Update the policy members table                                | OPEN   | shawnborton, luacmartins, JS00001 |
| #86206 | Update the policy categories table                             | OPEN   | shawnborton, luacmartins, JS00001 |
| #86207 | Update the policy tags table                                   | OPEN   | shawnborton, luacmartins, JS00001 |
| #86208 | Update the policy taxes table                                  | OPEN   | shawnborton, luacmartins, JS00001 |
| #86209 | Update the policy per-diem table                               | OPEN   | shawnborton, luacmartins, JS00001 |
| #86210 | Update the policy distance rates table                         | OPEN   | shawnborton, luacmartins, JS00001 |
| #86211 | Update the policy report fields page                           | OPEN   | shawnborton, luacmartins, JS00001 |
| #86212 | Update the policy expensify card table                         | OPEN   | shawnborton, luacmartins, JS00001 |
| #86213 | Update the personal expense rules table                        | OPEN   | shawnborton, luacmartins, JS00001 |
| #86215 | Update the domain groups table                                 | OPEN   | shawnborton, luacmartins, JS00001 |
| #86216 | Update the domain members table                                | OPEN   | shawnborton, luacmartins, JS00001 |
| #86217 | Update the domain admins table                                 | OPEN   | shawnborton, luacmartins, JS00001 |


---

## PR #86283 — Desktop Search Tables (Wide Layout) — MERGED

- **URL**: [https://github.com/Expensify/App/pull/86283](https://github.com/Expensify/App/pull/86283)
- **Title**: Add compact UI styles for search reports and expenses tables
- **Issue**: [https://github.com/Expensify/App/issues/86202](https://github.com/Expensify/App/issues/86202) (CLOSED)
- **Branch**: `krishna/86202-compact-table-styles`
- **State**: MERGED into `main` on Apr 9, 2026
- **Merged by**: luacmartins
- **Merge commit**: `7289583e598`
- **Commits**: 60

### What This PR Did

Updated the desktop/wide-screen layout of the Search page tables (Expenses, Reports, Tasks, Cards, Grouped views) to use compact styles with higher information density. This was the foundation PR that all subsequent compact-style work builds on.

### Key Changes

- **Row height**: Changed from variable to min-height **56px** across all table types
- **Borders**: Replaced card-style gaps (`mb2`) with **1px bottom borders** (`theme.border` color), creating a continuous list appearance
- **Border radius**: Only the **last row** gets bottom border radius (8px); all others have 0px radius
- **Padding**: Reduced vertical padding (e.g., 6px → 4px for group headers)
- **Avatar sizing**: Reduced to **SMALL (28px)** from DEFAULT (40px) in member/group headers
- **Column widths**: Adjusted date, amount, avatar columns for tighter fit
- **Skeleton loader**: Updated to match compact row layout with proper separators
- **Scrollbar alignment**: Fixed
- **Spinner**: Centered vertically (improved UX)
- **Table header**: Reduced min-height to 36px, removed 2px checkbox margin

### Files Changed (44 files)


| File                                                                         | Summary                                                                          |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `src/components/Icon/BankIcons/index.native.ts`                              | Bank icon size adjustments                                                       |
| `src/components/Icon/BankIcons/index.ts`                                     | Bank icon size adjustments                                                       |
| `src/components/Icon/BankIconsUtils.ts`                                      | Icon scaling logic for `maxIconSize`                                             |
| `src/components/ReportActionAvatars/SearchReportAvatar.tsx`                  | Accept `isLargeScreenWidth` to avoid per-row hook                                |
| `src/components/ReportSearchHeader/index.tsx`                                | Header styling                                                                   |
| `src/components/Search/SearchList/BaseSearchList/index.tsx`                  | List container styling                                                           |
| `src/components/Search/SearchList/ListItem/AvatarWithTextCell.tsx`           | Avatar size changes                                                              |
| `src/components/Search/SearchList/ListItem/BaseListItemHeader.tsx`           | Header min-height reduced to 36px                                                |
| `src/components/Search/SearchList/ListItem/CardListItem.tsx`                 | Compact row styles                                                               |
| `src/components/Search/SearchList/ListItem/CardListItemHeader.tsx`           | Header styling                                                                   |
| `src/components/Search/SearchList/ListItem/ExpenseReportListItem.tsx`        | Compact row/border styles                                                        |
| `src/components/Search/SearchList/ListItem/ExpenseReportListItemRow.tsx`     | Compact report row layout                                                        |
| `src/components/Search/SearchList/ListItem/MemberListItemHeader.tsx`         | SMALL avatar (28px)                                                              |
| `src/components/Search/SearchList/ListItem/ReportListItemHeader.tsx`         | Header styling                                                                   |
| `src/components/Search/SearchList/ListItem/TaskListItem.tsx`                 | Compact row styles                                                               |
| `src/components/Search/SearchList/ListItem/TaskListItemRow.tsx`              | Compact task row layout                                                          |
| `src/components/Search/SearchList/ListItem/TextCell.tsx`                     | Text cell styling                                                                |
| `src/components/Search/SearchList/ListItem/TransactionGroupListExpanded.tsx` | Expanded group border/padding                                                    |
| `src/components/Search/SearchList/ListItem/TransactionGroupListItem.tsx`     | Group item border style                                                          |
| `src/components/Search/SearchList/ListItem/TransactionListItem.tsx`          | Compact row styles, border radius logic                                          |
| `src/components/Search/SearchList/ListItem/UserInfoAndActionButtonRow.tsx`   | Row styling                                                                      |
| `src/components/Search/SearchList/ListItem/UserInfoCell.tsx`                 | User info cell styling                                                           |
| `src/components/Search/SearchList/ListItem/UserInfoCellsWithArrow.tsx`       | Arrow/user info styling                                                          |
| `src/components/Search/SearchList/ListItem/WithdrawalIDListItemHeader.tsx`   | Header styling                                                                   |
| `src/components/Search/SearchList/ListItem/types.ts`                         | Type updates (isLargeScreenWidth prop)                                           |
| `src/components/Search/SearchList/index.tsx`                                 | Search list container styling                                                    |
| `src/components/Search/SearchPageHeader/SearchFiltersBarWide.tsx`            | Filter bar styling                                                               |
| `src/components/Search/SearchTableHeader.tsx`                                | Table header layout                                                              |
| `src/components/Search/SortableTableHeader.tsx`                              | Sortable header styling                                                          |
| `src/components/Search/index.tsx`                                            | Search component hooks/layout                                                    |
| `src/components/SelectionList/BaseSelectionList.tsx`                         | Selection list styling                                                           |
| `src/components/SelectionList/ListItem/ListItemRenderer.tsx`                 | Item renderer updates                                                            |
| `src/components/SelectionList/ListItem/types.ts`                             | Type updates                                                                     |
| `src/components/Skeletons/ItemListSkeletonView.tsx`                          | Skeleton sizing                                                                  |
| `src/components/Skeletons/SearchRowSkeleton.tsx`                             | Compact skeleton with borders                                                    |
| `src/components/TransactionItemRow/DataCells/CategoryCell.tsx`               | Category cell styling                                                            |
| `src/components/TransactionItemRow/DataCells/MerchantCell.tsx`               | Merchant cell styling                                                            |
| `src/components/TransactionItemRow/DataCells/ReceiptCell.tsx`                | Receipt cell accept layout prop                                                  |
| `src/components/TransactionItemRow/DataCells/TagCell.tsx`                    | Tag cell styling                                                                 |
| `src/components/TransactionItemRow/DataCells/TypeCell.tsx`                   | Type cell styling                                                                |
| `src/components/TransactionItemRow/index.tsx`                                | Transaction row compact styles                                                   |
| `src/libs/SearchUIUtils.ts`                                                  | Search UI utilities                                                              |
| `src/styles/index.ts`                                                        | New compact style definitions                                                    |
| `src/styles/utils/index.ts`                                                  | `getSearchTableRowPressableStyle`, `getSearchTableGroupRowBorderStyle` utilities |
| `src/styles/variables.ts`                                                    | `tableRowPaddingVertical`, `searchTableRowHeight` variables                      |
| `tests/unit/Search/SearchUIUtilsTest.ts`                                     | Test updates                                                                     |


### Key Design Review Feedback (shawnborton)

1. **Skeleton**: Remove rounded top edges, add top border, match button widths with arrow spacing
2. **Column widths**: Fix amount column width on Reports > Reports; fix date column width on Reports > Expenses
3. **Group rows**: Reduce vertical padding from 6px to 4px for 56px total height
4. **Expensify Card view**: Use 28x28 avatar, fix date column width
5. **Nested rows**: Remove border radius on selected state
6. **Spinner**: Center vertically
7. **Min height**: 56px on all rows (not 52px)

### Performance Optimizations (in this PR)

- Removed per-row `useResponsiveLayout` calls; pass `isLargeScreenWidth` as prop from parent
- Consolidated hooks and memoized render-path computations in Search component
- Passed layout props to `ReceiptCell` and `SearchReportAvatar` to avoid per-row context subscriptions

### Mobile Regression Guard

- All compact styles were scoped to wide screens (`isLargeScreenWidth`) to prevent mobile regressions
- Narrow layout maintained card-style with `mb2` gaps, 8px rounded corners, DEFAULT (40px) avatars

---

## PR #87742 — Mobile Search Pages (Narrow Layout)

- **URL**: [https://github.com/Expensify/App/pull/87742](https://github.com/Expensify/App/pull/87742)
- **Title**: Update table and row styles for mobile search pages
- **Issue**: [https://github.com/Expensify/App/issues/87460](https://github.com/Expensify/App/issues/87460)
- **Branch**: `krishna2323/issue/87460`
- **State**: Open — JS00001 requested changes, situchan reviewed (commented), awaiting trjExpensify
- **Head commit**: `357bdaf9e7e`

### What This PR Does

Redesigns the narrow/mobile layout of the Search page (Spend tab) to match the Figma compact styles:

- Replaces individual card-style rows with a **continuous bordered list** (first/last items get rounded corners)
- Restructures the 2-line expense row content:
  - **Line 1**: Merchant/Description (left) + ChatBubble + Amount (right)
  - **Line 2**: Date • Category (left) + Type icon (right)
- Removes category/tag rows and action buttons from narrow layout
- Replaces `ActionCell` with passive `StatusBadge` on the user info strip
- Adds status badges to expense list headers
- Updates report rows (All Reports tab) to show: User info + StatusBadge / Report name + Amount / Date + Expense count
- Updates search skeleton to match new layout
- Syncs `SearchStaticList` with the new UI

### Files Changed (30 files)


| File                                                                          | Summary                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/CONST/index.ts`                                                          | Add `SENTRY_LABEL` for expense report checkbox                                                                                                                                                                       |
| `src/components/AnimatedCollapsible/index.tsx`                                | Add horizontal padding to border separator on narrow layout                                                                                                                                                          |
| `src/components/MoneyRequestReportView/MoneyRequestReportGroupHeader.tsx`     | Accept `shouldUseNarrowLayout` prop override                                                                                                                                                                         |
| `src/components/MoneyRequestReportView/MoneyRequestReportTransactionItem.tsx` | Pass narrow layout prop, adjust styling                                                                                                                                                                              |
| `src/components/MoneyRequestReportView/MoneyRequestReportTransactionList.tsx` | Adjust list spacing/borders for narrow layout                                                                                                                                                                        |
| `src/components/Search/SearchList/ListItem/BaseListItemHeader.tsx`            | Style adjustments for narrow list headers                                                                                                                                                                            |
| `src/components/Search/SearchList/ListItem/CardListItemHeader.tsx`            | Style adjustments                                                                                                                                                                                                    |
| `src/components/Search/SearchList/ListItem/DateCell.tsx`                      | Accept `suffixText` prop for inline category display, use literal `•`                                                                                                                                                |
| `src/components/Search/SearchList/ListItem/ExpandCollapseArrowButton.tsx`     | Use `small` prop based on layout                                                                                                                                                                                     |
| `src/components/Search/SearchList/ListItem/ExpenseReportListItem.tsx`         | Add `overflowHidden` on first item for hover clip                                                                                                                                                                    |
| `src/components/Search/SearchList/ListItem/ExpenseReportListItemRow.tsx`      | Complete redesign of narrow layout: 2-line report card, checkbox in selection mode, use `transactionCount` for accuracy                                                                                              |
| `src/components/Search/SearchList/ListItem/MemberListItemHeader.tsx`          | Style adjustments                                                                                                                                                                                                    |
| `src/components/Search/SearchList/ListItem/ReportListItemHeader.tsx`          | Style adjustments                                                                                                                                                                                                    |
| `src/components/Search/SearchList/ListItem/TransactionGroupListExpanded.tsx`  | Continuous list style for expanded group children                                                                                                                                                                    |
| `src/components/Search/SearchList/ListItem/TransactionGroupListItem.tsx`      | Set `shouldApplyOtherStyles=false` for continuous list                                                                                                                                                               |
| `src/components/Search/SearchList/ListItem/TransactionListItem.tsx`           | Add `overflowHidden` on first item, pass new props                                                                                                                                                                   |
| `src/components/Search/SearchList/ListItem/UserInfoAndActionButtonRow.tsx`    | Replace `ActionCell` with `StatusBadge`, accept `stateNum`/`statusNum` as explicit props                                                                                                                             |
| `src/components/Search/SearchList/ListItem/UserInfoCellsWithArrow.tsx`        | Style tweaks for narrow layout                                                                                                                                                                                       |
| `src/components/Search/SearchList/ListItem/WithdrawalIDListItemHeader.tsx`    | Style adjustments                                                                                                                                                                                                    |
| `src/components/Search/SearchStaticList.tsx`                                  | Sync static list with new narrow layout UI                                                                                                                                                                           |
| `src/components/Skeletons/SearchRowSkeleton.tsx`                              | Update skeleton to match new 2-line layout                                                                                                                                                                           |
| `src/components/TransactionItemRow/DataCells/TypeCell.tsx`                    | Minor style tweak                                                                                                                                                                                                    |
| `src/components/TransactionItemRow/TransactionItemRowRBR.tsx`                 | Accept `shouldUseNarrowLayout`, adjust text size                                                                                                                                                                     |
| `src/components/TransactionItemRow/index.tsx`                                 | **Major**: Redesign narrow layout — remove `expenseWidgetRadius`/`overflowHidden`, restructure to Merchant+Amount / Date•Category+Type, remove category/tag rows, move ChatBubble inline, use `ml3` for arrow margin |
| `src/pages/TransactionMerge/MergeTransactionItem.tsx`                         | **REVERTED to main** — merge page not changed by this PR                                                                                                                                                             |
| `src/pages/TransactionMerge/MergeTransactionsListContent.tsx`                 | **REVERTED to main** — merge page not changed by this PR                                                                                                                                                             |
| `src/styles/index.ts`                                                         | Update `listTableHeader.paddingHorizontal` from 32 to 36                                                                                                                                                             |
| `src/styles/utils/spacing.ts`                                                 | Add `pr1half` style (6px)                                                                                                                                                                                            |
| `tests/ui/ReportListItemHeaderTest.tsx`                                       | Update tests for removed 'to' recipient                                                                                                                                                                              |
| `tests/unit/TransactionGroupListItemTest.tsx`                                 | Fix test for wide layout mock                                                                                                                                                                                        |


### Our Commits (chronological, oldest first)

1. `1501efa` — Replace ActionCell with StatusBadge, restructure 2-line content, remove card spacing
2. `81c992b` — Fix header avatar size to match Figma
3. `e3157c8` — Update mobile report row layout and sync SearchStaticList
4. `2f9a06d` — Bump violation text to 13px on narrow layouts
5. `6425f29` — Fix 4px gap between text rows beside receipt
6. `7863f03` — Adjust narrow expense row spacing
7. `a237a3f` — Remove 'to' recipient from narrow layout header strip
8. `04289e7` — Add `pr1half` style and 6px avatar gap
9. `7d89df0` — Fix date+category truncation as single string
10. `c8519e3` — Update ReportListItemHeader tests
11. `4704108` — Update narrow search skeleton
12. `f55e095` — Fix ESLint
13. `aeda7ca` — Fix merge conflict in ReportListItemHeader
14. `fe0ef95` — Update narrow group header rows (continuous bordered list)
15. `820926f` — Fix group child row borders and arrow alignment
16. Various group/border fixes (`421cbf9`, `083343b`, `935ed1`, `dd48569`, `6300da2`, `149c2ee`)
17. `6c42f72` — Update merge expenses picker and report detail spacing (later REVERTED)
18. `76f3de1` — Pass stateNum/statusNum as explicit props
19. `1cc82ec` — Use literal `•` instead of unicode escape
20. `563e708` — Remove manual useMemo in UserInfoAndActionButtonRow
21. `2c79cf5` — Restore effectivePolicyID comment lost during merge
22. `f8e8c89` — Add horizontal padding to collapsible border separator
23. `1848587` — Move ChatBubbleCell inline with merchant row
24. `73d0a1a` — Increase Select all header padding (32→36)
25. `c1c1aa1` — Clip hover overflow on first item's top border radius
26. `9f6f573` — Restore checkbox on report items + clip hover overflow
27. `498953` — Increase arrow left margin to 12px on group child items
28. `357bdaf` — Use transactionCount for accurate expense count

### Known Issues / Pending Review Items

1. **P1 Bot Comment (UserInfoAndActionButtonRow)**: Replacing `ActionCell` with `StatusBadge` removes the UNDELETE action for deleted transactions in narrow layout. The `ActionCell` on main specifically shows an Undelete button that works even when `handleOnPress` returns early for deleted transactions. This is a real concern — need to decide if we restore ActionCell for UNDELETE or find an alternative undelete flow.
2. **JS00001 Review (Changes Requested)**: Addressed most comments:
  - `shouldApplyOtherStyles` set to `false` — intentional for continuous list style
  - `stateNum`/`statusNum` type casting cleaned up with explicit props
  - `SearchStaticList` doesn't need stateNum/statusNum fallback (only renders `TransactionListItemType`)
  - `DateCell` uses literal `•` instead of `\u2022`
3. **situchan Review**: Approved overall, found merge page regression (tracked in deploy blocker #88654, caused by PR #83127 inline editing, NOT our PR). Asked if we can fix merge page — we reverted our merge page changes to match main.
4. **Merge Page Regression**: The merge page is broken on staging by PR #83127 (`TotalCell` `flexShrink0→flexShrink1`). Our PR originally updated the merge page to use the new continuous list style but we **reverted** those changes so our PR doesn't affect the merge page at all.

### Staging Changes Currently Pending Commit

- `MergeTransactionItem.tsx` and `MergeTransactionsListContent.tsx` reverted to main (staged)
- `ExpenseReportListItemRow.tsx` P2 fix (`transactionCount`) already committed as `357bdaf`

---

## PR #88296 — Desktop Report Details View

- **URL**: [https://github.com/Expensify/App/pull/88296](https://github.com/Expensify/App/pull/88296)
- **Title**: Update report details view to use compact desktop table styles
- **Issue**: [https://github.com/Expensify/App/issues/86203](https://github.com/Expensify/App/issues/86203)
- **Branch**: `krishna2323/issue/86203`
- **State**: Open (Draft) — awaiting review from luacmartins
- **Head commit**: `f33c8bbad20`
- **Depends on**: PR #87742 (mobile PR) should merge first since both modify shared components

### What This PR Does

Updates the report details view (the page you see when you open an individual expense report with multiple expenses) to use the new compact desktop table styles. This applies the same search page table styling to the report detail transaction list on wide/desktop screens.

### Files Changed (3 files)


| File                                                                          | Summary                                                                                    |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/components/MoneyRequestReportView/MoneyRequestReportGroupHeader.tsx`     | Accept `shouldUseNarrowLayout` prop override for layout control in report detail context   |
| `src/components/MoneyRequestReportView/MoneyRequestReportTransactionItem.tsx` | Apply compact table styles to transaction items in the report detail view                  |
| `src/components/MoneyRequestReportView/MoneyRequestReportTransactionList.tsx` | Update transaction list container styling for compact desktop layout, handle group headers |


### Our Commits

1. `f33c8bbad20` — Update report details view to use compact desktop table styles

### Review Status

- Requested from: `luacmartins`
- No human reviews yet, only codex bot comment

---

## Shared Components Between Both PRs

Both PRs modify these files (mobile PR first, desktop PR builds on top):

- `MoneyRequestReportGroupHeader.tsx`
- `MoneyRequestReportTransactionItem.tsx`
- `MoneyRequestReportTransactionList.tsx`

The desktop PR (`krishna2323/issue/86203`) was branched from an earlier state. It will need to be rebased/updated after the mobile PR merges.

---

## Key Design Decisions

### Narrow Layout (Mobile PR)

- **Continuous list** instead of individual cards — items separated by `borderBottom`, first/last items get rounded corners
- **2-line row template**: Merchant+Amount on top, Date•Category+Type on bottom
- **StatusBadge** replaces ActionCell on the user info strip (removes action buttons from narrow layout)
- **Category** moved inline into `DateCell` as suffix text (e.g., "Apr 3 • Advertising")
- **Tags** removed from narrow layout entirely
- **ChatBubble** moved inline next to amount
- **Select all** checkbox offset maintained at 20px (header 36px - items 16px)
- **Hover clipping** on first item via `overflowHidden`

### Desktop Layout (Desktop PR)

- Applies existing compact table column layout to report detail view
- Group headers styled with background color and visually attached to table
- Horizontal margins and border radius applied to table container

---

## Figma References

- **Main Figma**: [https://www.figma.com/design/DMwzhMmaL09kc8PayTEPun/NewDot-Compact-Styles?node-id=769-306165](https://www.figma.com/design/DMwzhMmaL09kc8PayTEPun/NewDot-Compact-Styles?node-id=769-306165)
- **Group layout**: [https://www.figma.com/design/DMwzhMmaL09kc8PayTEPun/NewDot-Compact-Styles?node-id=769-307377](https://www.figma.com/design/DMwzhMmaL09kc8PayTEPun/NewDot-Compact-Styles?node-id=769-307377)
- **Skeleton**: [https://www.figma.com/design/DMwzhMmaL09kc8PayTEPun/NewDot-Compact-Styles?node-id=810-360849](https://www.figma.com/design/DMwzhMmaL09kc8PayTEPun/NewDot-Compact-Styles?node-id=810-360849)

---

## External Blockers / Related Issues

### Deploy Blocker #88654

- **Title**: "Unreported expense row is broken, amount missing"
- **Caused by**: PR #83127 (inline editing for tables) — NOT our PRs
- **Root cause**: `TotalCell` style changed from `flexShrink0` to `flexShrink1`, amount collapses to zero in narrow layout
- **Status**: Assigned to @puneetlath and @mohammadjafarinejad, fix proposed by @ahmedGaber93
- **Impact on us**: Merge page on staging is broken. We reverted our merge page changes so our PR doesn't make it worse.

### P1 Bot Comment — UNDELETE Action

- On production, `ActionCell` in `UserInfoAndActionButtonRow` shows an UNDELETE button for deleted transactions in narrow layout
- `TransactionListItem` returns early from `handleOnPress` for deleted transactions, making the ActionCell the only recovery mechanism
- Our PR replaced ActionCell with passive StatusBadge, removing this affordance
- **Decision needed**: Restore ActionCell for UNDELETE action, or clarify with design if another undelete flow exists

---

## What's Next

### For Mobile PR (#87742)

1. Address/respond to P1 bot comment about UNDELETE action
2. Commit the merge page revert (staged, not yet committed)
3. Address any remaining reviewer feedback from JS00001/situchan/trjExpensify
4. Get final approval and merge

### For Desktop PR (#88296)

1. Waits for mobile PR to merge first (shared file dependencies)
2. Rebase onto main after mobile PR merges
3. Get review from luacmartins
4. Fill in test steps and screenshots

### Remaining Sub-Issues (13 open under #86102)

After the search tables (#86202 CLOSED) and report details (#86203, #87460) are merged, the remaining 13 sub-issues apply the same compact table pattern to other pages:

- **#86204** — Policy company cards table
- **#86205** — Policy members table
- **#86206** — Policy categories table
- **#86207** — Policy tags table
- **#86208** — Policy taxes table
- **#86209** — Policy per-diem table
- **#86210** — Policy distance rates table
- **#86211** — Policy report fields page
- **#86212** — Policy expensify card table
- **#86213** — Personal expense rules table
- **#86215** — Domain groups table
- **#86216** — Domain members table
- **#86217** — Domain admins table

These all follow the same compact pattern established by PR #86283: 56px min-height rows, 1px bottom borders, 0px border radius (8px on last row only), 28px avatars, reduced padding.

