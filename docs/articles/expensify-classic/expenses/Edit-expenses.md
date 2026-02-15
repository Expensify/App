---
title: Edit Expenses
description: Learn how to edit, split, merge, or delete expenses in Expensify, including permissions, limitations, and helpful tips for SmartScan or company cards.
keywords: edit expenses, split expenses, merge expenses, delete expenses, Expensify Classic, expense permissions, company card, SmartScan, Workspace Admin
---


You can edit expenses in Expensify to update details like category, description, or attendees. You can also split or merge expenses to break up a larger expense or resolve duplicates. However, some fields have restrictions based on the expense type and report status.

---

# Expense Editing Rules

Editing restrictions apply based on expense type and report status.

## General Editing Rules
- **Category, description, attendees, and report assignment** can be edited by the expense owner, approvers, and Workspace Admins.
- **Amount** can be edited for most manually entered expenses, except for company card transactions.
- **Tag and billable status** can be updated as long as the report is editable.

## Company Card Expenses
- **Amount cannot be edited** for expenses imported from a company card.
- **Category, tag, and billable status** can be edited if the report is in a Draft or Outstanding state.
- **Receipt images** can be added or replaced at any time.

## Submitted and Approved Expenses
- **Submitted expenses** can only be edited by an approver or Workspace Admin.
- **Approved expenses** cannot be edited unless reopened (also called unapproved).
- **Expenses in a Closed report** cannot be edited.

## Description and Workspace Violations
- If an expense has a violation but includes a **description or comment**, it will still be submitted via Scheduled Submit.
- The **description acts as the user’s explanation** for why the violation wasn’t resolved.
- This allows the report to move forward while providing visibility for approvers or Workspace Admins.

**Note:** The violation will still appear but will not block submission if a comment or explanation is provided.

## Expense Icons
**Each expense has an icon showing how it was created:**
- 🏦 **Cash Icon**: Manually added or SmartScanned
- 💳 **Credit Card Icon**: Imported from a personal card
- 📄 **Spreadsheet Icon**: Imported via CSV
- 🔒 **Locked Credit Card Icon**: Imported from a company card feed or company CSV

![Image of different expenses]({{site.url}}/assets/images/Expenses.png){:width="100%"}

---

# Edit an Expense

**On Desktop:**
1. Click the **Expenses** tab.
2. Select the expense you want to edit.
3. Click the field you want to change (e.g., category, description, attendees).
4. Make your changes and click **Save**.

**On Mobile:**
1. Tap the **Expenses** tab.
2. Select the expense you want to edit.
3. Tap **More Options**.
4. Update the relevant fields and tap **Save**.

---

# Split an Expense

Each split becomes its own expense, and the image of the same receipt is attached. You can assign different categories, tags, or details to each one.

💡 **Things to know before splitting expenses:** 💡
- Splitting an expense cannot be undone.
- Each split must be greater than $0.00.  
- All splits must add up precisely to the original expense total.

## Splitting Expenses on Desktop:
1. Go to the **Expenses** tab.
2. Click the expense you want to split.
3. Scroll to the bottom and click **Split Expense**.
4. Choose how to split the expense:
   - **Add Split** – Add another line to enter a custom amount manually.
   - **Split by Days** – Great for hotel receipts or multi-day expenses.
   - **Split Even** – Divide the total evenly between the selected number of splits.

## Splitting Expenses on Mobile:
1. Tap the **Expenses** tab.
2. Select the expense you want to split.
3. Scroll to the bottom and tap **More Options**.
4. Tap **Split**.
5. Tap each split expense to enter the amount, category, and other details, then tap **Save**.
   - To split additional expenses, tap **Add Split**.
6. Once complete, tap **Save** again.

---

# Merge Expenses

You can merge two duplicate expenses into one consolidated entry. This is useful when the same purchase appears twice—once as a SmartScanned receipt and once as an imported credit card transaction.

💡 **Things to know before merging expenses:** 💡
- Merging expenses cannot be undone.
- You cannot merge two credit card expenses.
- Ideally, credit card expenses also include a SmartScanned receipt. If your admin has enabled eReceipts (U.S. only), low-value expenses may show a QR code as the receipt image.

## Merging Expenses on Desktop

**From the Expenses tab:**
1. Go to the **Expenses** tab.
2. Check the box next to the two expenses you want to merge.
3. Click **Merge**.
4. Choose which details to keep (e.g., receipt image, merchant, category, etc.).

**From the Reports tab:**
1. Go to the **Reports** tab.
2. Open the report that includes both expenses.
3. Click the **Details** tab, then select the Edit icon.
4. Select the two expenses you want to merge.
5. Choose which details to retain for the new merged expense.

## Merging Expenses on Mobile

If Expensify detects potential duplicates, you'll see a **Resolve Now** button.

1. Tap **Resolve Now**.
2. Tap **Merge Expense** to combine them into one.

**Note:** If the two expenses are on different reports, you'll be asked to choose which report the new expense should be added.

---

# Delete an Expense

The submitter can only delete expenses, and the report must be in a Draft state.

1. Navigate to the **Expenses** tab.
2. Select the expense you want to delete.
3. Click **Delete** and confirm.

**Note:** If the report has been submitted, you will need to retract it before deleting an expense.

---

# Preventing and Resolving Duplicate Expenses

If you see two versions of the same expense—one SmartScanned and one from your card feed—it’s likely due to a failed merge. Normally, Expensify merges these automatically to prevent duplicates, but if the merge fails, both versions will appear separately.

## Why duplicates happen

SmartScanned receipts are designed to merge with matching card feed transactions. A failed merge creates two expenses for one purchase:
- A SmartScan-only expense (marked as "SmartScanned")
- A card feed-only expense (marked as "Imported")

This can result in duplicate reporting and reimbursement issues if not resolved.

## Auto-merge rules

Expenses will only merge automatically if all of the following are true:
- The card feed posts within 7 days of the SmartScan.
- The amounts match exactly.
- The SmartScanned receipt is not yet submitted.
- Only one matching pair exists.

If these conditions aren’t met, the merge won’t happen automatically.

## How to fix unmerged duplicates

1. Wait a few days if your card expense hasn’t posted yet. The merge may still happen automatically.
2. Manually merge the SmartScan and card feed expense:
   - Go to your **Expenses** tab.
   - Select both expenses.
   - Click **Merge**.
3. Delete one of the duplicates if a merge isn’t possible. We recommend keeping the imported expense for accounting accuracy.

## Why this matters

Unmerged duplicates can cause:
- Inaccurate totals in reports
- Over-reimbursement
- Duplicate entries in accounting exports

Resolving duplicates helps keep your reports clean and accurate.

---

# FAQ

## Can I add multiple attachments to a single expense?
No, it's only possible to add one attachment per expense. 

## Who can edit an expense?
- **Expense owner**: Can edit expenses if the report is a Draft.
- **Approvers and Workspace Admins**: Can edit submitted expenses before final approval.
- **Finance teams** might have additional permissions based on workspace settings.

## Why can't I edit my expense amount?
Company card expenses have a fixed amount based on imported transaction data and cannot be changed.

## Can I edit an expense after it has been approved?
No, approved expenses cannot be edited unless the report is reopened (unapproved).

If you need to edit an expense on a submitted report, you can contact an approver or Workspace Admin to reopen (un-approve) the report.

## Can I undo a split expense?
No, it can't be undone once an expense is split and saved. If you want to start over, delete the split expenses and re-upload the receipt.

## Will each split have the same receipt image?
Yes. The same image will appear on all the split expenses for easy reference and audit compliance.

## Can I apply different categories or tags to each split?
Absolutely! That's one of the main benefits of splitting an expense — you can customize each part individually.

## Can Expensify automatically merge cash and card expenses?

Yes. Expensify auto-merges SmartScanned receipts with matching card transactions by date and amount.

- If the receipt comes first, the card transaction merges into the receipt.
- If the card comes first, the receipt merges into the card.
- Merchant names from SmartScan will override merchant names from the card.
- Merging can occur even after reports are submitted (outstanding), approved, or paid.

**Merging won't happen automatically:**
- SmartScan is skipped.
- Expenses were created via the [Expense Importer API](https://integrations.expensify.com/Integration-Server/doc/#expense-creator).
- Currencies differ and the report is submitted.

## Should I wait for merging before submitting reports?
No need to wait. Matching expenses can still merge post-submission.

- **Personal cards**: Will merge if reimbursable status matches, or only when the report is a Draft.
- **Company cards**: Merge regardless of status, unless it changes the reimbursable total of a submitted report. To prevent issues, default cash expenses to non-reimbursable.

## Why didn’t my expenses merge automatically?

**Here are some common reasons:**
- Receipt wasn’t SmartScanned.
- Transaction dates don’t closely match.
- Amounts differ (for expenses in the same currency).
- Foreign exchange difference exceeds 5% (for expenses in different currencies)
- The transaction is older than 90 days.
- One of the expenses was already merged with another expense. 
- Receipt is reimbursable and report is submitted.
- Expenses are in different Expensify accounts.

You can still merge expenses manually if both are **Unreported** or **Draft** and exist in the same account.

