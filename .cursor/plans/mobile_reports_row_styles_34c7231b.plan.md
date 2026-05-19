---
name: Mobile Reports Row Styles
overview: "Update the narrow-layout (mobile) row styles for the Reports page to match the new Figma designs: add status badges to Expenses, bump supporting text from 11px to 13px, remove action buttons and tag/category chips from rows, and create a consistent row template across Expenses, Reports, and group views."
todos:
  - id: expense-header
    content: Replace ActionCell with StatusCell in expense row header strip (UserInfoAndActionButtonRow)
    status: completed
  - id: expense-content
    content: "Restructure TransactionItemRow narrow branch: receipt+merchant+total on row 1, date+category+type on row 2, remove tag chips"
    status: completed
  - id: report-row
    content: "Rewrite ExpenseReportListItemRow narrow branch: avatar+name+status header, report name+total, date+expense count metadata"
    status: completed
  - id: report-detail
    content: Update report detail view expenses (inside a report) to use new 2-line row without header strip
    status: pending
  - id: group-headers
    content: Update group-by headers (Category, Card, From, Withdrawal ID) to match mock styles
    status: pending
  - id: font-bump
    content: Bump supporting/metadata text from 11px to 13px scoped to mobile report rows
    status: completed
  - id: merge-expenses
    content: Update merge expenses picker to match new row template (no header strip)
    status: pending
isProject: false
---

# Mobile Reports Row Styles Update

## Design Analysis (from Figma Mocks)

### A. Expenses List (Reports > Expenses)

Each expense is rendered as a **card** with rounded corners and subtle border:

```
[SmallAvatar] Name                    [StatusBadge]
[ReceiptThumb] Merchant/Description      $Amount
               Date • Category              Type
```

- **Header strip**: Tiny avatar (~16px) + display name (supporting color, ~13px) + `StatusBadge` pinned right (Draft/Outstanding/Approved/Paid/Done)
- **Content row**: Receipt thumbnail (square, ~40px) + merchant name (normal text) + amount right-aligned (normal weight)
- **Metadata row**: `Date • Category` left (supporting color, ~13px) + `Type` right (Cash/Card, supporting color)
- **Removed**: Action button, tag chips, separate category/tag row
- Each row is an individual card with `mb2` spacing

### B. Reports List (Reports > Reports)

Rows are separated by **border lines** (not individual cards):

```
[SmallAvatar] Name                    [StatusBadge]
Report Name                              $Amount
Date                                  N expenses
```

- **Header strip**: Same as expenses — tiny avatar + name + status badge
- **Content row**: Report name (normal text, wraps if long) + total right-aligned
- **Metadata row**: Date left (supporting, ~13px) + expense count right ("5 expenses", supporting)
- **Removed**: ActionCell overlay, marginRight reservation, ReportSearchHeader (replaced with simpler layout)

### C. Group by Category

Minimal single-line rows with border separators:

```
CategoryName                    $Total  v
```

- Just category name + total + chevron down arrow
- No avatar, no receipt, no metadata

### D. Group by Card

Two-line rows with avatar:

```
[CardAvatar] Name              $Total  v
             CardNumber • CardName
```

- Card/bank logo avatar (~40px) + person name + total + chevron
- Second line: last 4 digits + bullet + card nickname (supporting text)

### E. Group by From

Two-line rows with avatar:

```
[PersonAvatar] Name            $Total  v
               email@domain.com
```

- Person avatar (~40px) + name + total + chevron
- Second line: email address (supporting text)

### F. Group by Withdrawal ID

Two-line rows with bank icon:

```
[BankIcon] BankName xx1234     $Total  v
           Date • ID: number
```

- Bank icon + bank name with last 4 + total + chevron
- Second line: date + bullet + ID number (supporting text)

### G. Report Detail (Inside a Report, Grouped Expenses)

Expense rows WITHOUT header strip (group header provides context):

```
[ReceiptThumb] Merchant/Description      $Amount
               Date • Category              Type
```

- Same 2-line content+metadata as Expenses list but no avatar/name/status header
- Group section headers: "Category • $GroupTotal"
- Total row at bottom

### H. Merge Expenses Picker

Same as report detail expense rows + radio button:

```
[ReceiptThumb] Merchant/Description  $Amount  (o)
               Date • Category          Type
```

### I. Expenses Room (Chat Preview)

Shows report summary card inside chat — likely out of scope for this PR.

---

## Implementation Plan

### Step 1: Create a scoped 13px supporting text style

**File**: `[src/styles/index.ts](src/styles/index.ts)`

Add a new style for mobile report row metadata text. Do NOT modify global `textMicroSupporting` (11px).

```typescript
mobileReportRowText: {
    color: theme.textSupporting,
    ...FontUtils.fontFamily.platform.EXP_NEUE,
    fontSize: variables.fontSizeLabel,  // 13px (already exists in variables)
    lineHeight: variables.lineHeightLarge, // 18px
},
```

Use this for all supporting text in the new row layouts (date, category, type, expense count, email, card number).

### Step 2: Update Expense Row Header — Replace ActionCell with StatusCell

**File**: `[src/components/Search/SearchList/ListItem/UserInfoAndActionButtonRow.tsx](src/components/Search/SearchList/ListItem/UserInfoAndActionButtonRow.tsx)`

Current: Avatar + Name (left) | ActionCell in fixed w72 container (right)

Target: Avatar + Name (left) | StatusCell badge (right)

Changes:

- Remove the `ActionCell` import and the fixed-width `View` container wrapping it
- Add `StatusCell` to the right side instead
- Pass `stateNum` and `statusNum` from the item's report: `item.report?.stateNum`, `item.report?.statusNum`
- Remove the `isActionLoading` / `useOnyx` report metadata subscription (no longer needed)
- Remove `handleActionButtonPress` prop (no action button to handle)
- Keep `UserInfoCellsWithArrow` rendering unchanged

### Step 3: Restructure `TransactionItemRow` Narrow Branch

**File**: `[src/components/TransactionItemRow/index.tsx](src/components/TransactionItemRow/index.tsx)` — lines ~690-824

Current layout:

```
Row 1: [Checkbox] [Receipt] [Date • Type] [Total if no merchant]
                            [Merchant     Total]
Row 2: [CategoryChip] [TagChip]    [ChatBubble]
```

Target layout:

```
Row 1: [Checkbox] [Receipt] [Merchant/Description    Total]
Row 2:                      [Date • Category          Type]
```

Changes:

- **Row 1**: Remove `DateCell` and `TypeCell` from the top line. Keep `ReceiptCell`, move `MerchantOrDescriptionCell` + `TotalCell` as the primary content pair. If no merchant, show `TotalCell` alone.
- **Row 2**: New metadata line with:
  - Left: `DateCell` + `•` bullet + category text (plain text, NOT `CategoryCell` chip with icon)
  - Right: `TypeCell` text (Cash/Card)
- **Remove**: The entire `CategoryCell + TagCell` chips row (lines ~780-794)
- **Remove**: `TagCell` entirely from narrow layout
- **Keep**: `TransactionItemRowRBR` for violations, `ChatBubbleCell` if comments column is present
- **Font**: Use new `mobileReportRowText` style (13px) for the metadata line

### Step 4: Rewrite `ExpenseReportListItemRow` Narrow Branch

**File**: `[src/components/Search/SearchList/ListItem/ExpenseReportListItemRow.tsx](src/components/Search/SearchList/ListItem/ExpenseReportListItemRow.tsx)` — lines ~248-336

Current layout:

```
[UserInfoCellsWithArrow]              (marginRight: w72 reservation)
[Checkbox] [ReportSearchHeader  Total]
                                       [ActionCell absolute pos]
```

Target layout:

```
[SmallAvatar] Name              [StatusBadge]
ReportName                          $Total
Date                            N expenses
```

Changes:

- **Remove**: Absolutely-positioned `ActionCell` overlay (lines ~321-334)
- **Remove**: `marginRight: variables.w72` on the parent View (line ~269)
- **Replace** `UserInfoCellsWithArrow` with a simpler header strip: small avatar + name (left) + `StatusCell` with `stateNum`/`statusNum` (right)
- **Replace** `ReportSearchHeader` with plain text report name (the current `ReportSearchHeader` → `AvatarWithDisplayName` chain is too complex for this layout)
- **Add** metadata row: date left + "N expenses" count right (using `mobileReportRowText` 13px style)
- **Keep** checkbox for multi-select mode

### Step 5: Update Group-By Headers

The group-by views use different header components depending on `groupBy` type. Each needs to match its mock:

**Category** — `[MemberListItemHeader.tsx](src/components/Search/SearchList/ListItem/MemberListItemHeader.tsx)` or equivalent:

- Simple: Category name (left) + total (right) + chevron
- No avatar, single line

**Card** — `[CardListItemHeader.tsx](src/components/Search/SearchList/ListItem/CardListItemHeader.tsx)`:

- Card avatar + Name + Total + chevron
- Second line: card number + bullet + card nickname

**From** — `[MemberListItemHeader.tsx](src/components/Search/SearchList/ListItem/MemberListItemHeader.tsx)`:

- Person avatar + Name + Total + chevron
- Second line: email address

**Withdrawal ID** — `[WithdrawalIDListItemHeader.tsx](src/components/Search/SearchList/ListItem/WithdrawalIDListItemHeader.tsx)`:

- Bank icon + Bank name xx1234 + Total + chevron
- Second line: Date + bullet + ID number

All supporting text in these headers should use the new 13px `mobileReportRowText` style.

### Step 6: Update Report Detail View (Expenses Inside a Report)

The expenses shown inside a report detail (when grouped by category, etc.) should use the 2-line format WITHOUT the header strip:

```
[ReceiptThumb] Merchant/Description    $Amount
               Date • Category            Type
```

This is the same as the expense row content (Step 3) but without `UserInfoAndActionButtonRow` above it. This likely happens naturally if the header strip is conditionally rendered based on whether we're in the search list vs inside a report detail.

### Step 7: Update Merge Expenses Picker

The merge expenses view uses the same 2-line expense layout (receipt + merchant + total, date + category + type) with a radio button instead of checkbox. Needs the same restructuring as Step 3, applied to whatever component renders the merge picker rows.

---

## Files Summary

| File                             | Change                                              |
| -------------------------------- | --------------------------------------------------- |
| `src/styles/index.ts`            | Add `mobileReportRowText` style (13px)              |
| `UserInfoAndActionButtonRow.tsx` | Replace ActionCell with StatusCell                  |
| `TransactionItemRow/index.tsx`   | Restructure narrow branch layout                    |
| `ExpenseReportListItemRow.tsx`   | Rewrite narrow branch                               |
| `TransactionListItem.tsx`        | Adjust narrow rendering if needed                   |
| `ExpenseReportListItem.tsx`      | Adjust props/rendering if needed                    |
| `MemberListItemHeader.tsx`       | Update group-by-from narrow layout                  |
| `CardListItemHeader.tsx`         | Update group-by-card narrow layout                  |
| `WithdrawalIDListItemHeader.tsx` | Update group-by-withdrawal narrow layout            |
| `CategoryCell.tsx`               | May simplify for metadata line (plain text vs chip) |
| `DateCell.tsx`                   | Update font size for narrow                         |
| `TypeCell.tsx`                   | Update font size for narrow                         |

---

## Scope Boundaries

- **In scope**: Expenses list, Reports list, group-by views, report detail expenses, merge picker, font bump
- **Out of scope**: Tasks row (no mock provided — follow up with Shawn), Expenses Room chat preview, wide/desktop layout (already handled in separate web PR)
- **No global changes**: `textMicroSupporting` and `fontSizeSmall` remain untouched
