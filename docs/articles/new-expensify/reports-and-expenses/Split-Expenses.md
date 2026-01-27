---
title: Split Expenses 
description: Expensify makes it easy to split expenses by dividing a single transaction across multiple expense details like categories, tags, and dates. You can split evenly, by percentage, or by day, helping you stay accurate and compliant with workspace rules.
keywords: split expenses, split by percentage, split by day, split evenly, edit split, revert split, expense allocation, New Expensify
internalScope: Audience is submitters, approvers and admins. Covers how to split, edit, and revert expenses in New Expensify using the Split feature. Does not cover Classic behavior.
---

## Who can split expenses in New Expensify

- Submitters can split any posted, editable expense they've created
- Approvers can split expenses assigned to them for approval
- Admins can split any expense that hasn't been fully approved

---

## Split an expense

### Option 1: Split by amount (default)

1. Open an expense and tap **More > Split**.
2. The split table appears with two equal rows.
3. Tap **Add split** to insert more rows.
4. Tap a row to update category, tag, date, or description, or remove the split.
5. Tap **More > Split evenly** to recalculate all editable rows equally. (If some splits are already submitted or approved, only editable rows are updated.
)
6. Tap **Save**.

---

### Option 2: Split an expense by percentage

1. Open the expense and tap **More > Split**.
2. The split table appears with two equal rows.
3. Tap **% Percentage** at the top of the split table.
4. Each row now shows a percentage field.
5. Enter a percentage for each row.
6. Tap **Save**.

---

### Option 3: Split an expense by day

1. Open the expense and tap **More > Split**.
2. Tap **More > Split by days**.
3. Select a **Start date** and **End date**.
4. Tap **Continue**.
5. The table fills with a row per day, split evenly.
6. Tap **Save**.

**Note:** You can't manually add or edit rows in this mode.

**ADD A SCREENSHOT HERE.** Suggestion: Date picker UI and resulting daily split table.

---

## Validation rules

Validation rules ensure your splits match the original expense amount based on the expense type. These rules apply whether you're splitting by amount, percentage or date.

### Company card and per diem expenses

- Total of all splits **must match the original expense exactly**.
- You **cannot save** if the splits sum to less or more than the original.
- Validation is strict to ensure full traceability for company-paid and company-defined amounts.

### Cash and distance expenses

- Total of all splits **can be less than or equal to** the original expense.
- You **can save** if the splits sum to less than the original amount.
- You **cannot save** if the splits total more than the original.
- This validation allows flexibility for submitters to exclude part of the expense.

## Modify or remove splits

### Edit a split allocation

1. Open a split expense.
2. Tap ** More > Edit splits**.
3. Change the amount directly in the table
4. Tap a row to update category, tag, date, or description or remove the split.
5. Tap **Save**.

**Note:** Splits that are on approved or paid reports cannot be edited.

---

### Remove a split row

1. Tap a split row to open its edit screen.
2. Tap **Remove split**.
3. Tap **Save**.

**Note:** You can’t remove the last remaining split row.

---

### Revert split to a single expense

1. Remove all but one split row.
2. Tap **Save**.

The expense will return to the regular editing view with the last remaining values.

---

# FAQ

## Why can’t I edit a split?

Splits are locked if they're on a report that’s approved, reimbursed, or closed.

## Will workspace rules apply to split expenses?

Yes. Each split is treated as a regular expense and follows all workspace requirements.
