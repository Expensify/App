---
title: Edit Expenses
description: Learn how to edit expenses in Expensify, including restrictions and permissions.
keywords: [Expensify Classic, edit expenses, merge expenses, split expenses, delete expenses]
---

<div id="expensify-classic" markdown="1">

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
- **Category, tag, and billable status** can be edited if the report is Open or Processing.
- **Receipt images** can be added or replaced at any time.

## Submitted and Approved Expenses
- **Submitted expenses** can only be edited by an approver or Workspace Admin.
- **Approved expenses** cannot be edited unless reopened (also called unapproved).
- **Expenses in a Closed report** cannot be edited.

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
- Merging expenses cannot be undone
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

The submitter can only delete expenses, and the report must be in the Open state.

1. Navigate to the **Expenses** tab.
2. Select the expense you want to delete.
3. Click **Delete** and confirm.

**Note:** If the report has been submitted, you will need to retract it before deleting an expense.

---

# FAQ

## Who can edit an expense?
- **Expense owner**: Can edit expenses if the report is Open.
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

## Can Expensify automatically merge a cash expense with a credit card expense?

Yes! When a SmartScanned receipt matches an imported credit card transaction by date and amount, Expensify merges them automatically.

- If the SmartScan comes first, the card import will merge.
- If the card transaction comes first, the SmartScan will merge once complete.
- Expensify uses the SmartScanned merchant name over the one from the card feed.

**Merging won't happen automatically:**
- If you manually stop SmartScan.
- If the expenses were created via the [Expense Importer API](https://integrations.expensify.com/Integration-Server/doc/#expense-creator).

## Why didn’t my expenses merge automatically?

**Here are some common reasons:**
- The cash receipt was not SmartScanned.
- The transaction dates are different.
- Amounts differ (in the same currency).
- Amounts exceed a 5% difference in foreign exchange (FX) rates.
- The transaction is over 90 days old.
- One of the duplicates already merged with a third entry.
- The cash expense was already submitted, reimbursed, or exported before the card import.
- The card and receipt are in different Expensify accounts.

You can still merge expenses manually if both are **Unreported** or **Open** and exist in the same account.

</div>
