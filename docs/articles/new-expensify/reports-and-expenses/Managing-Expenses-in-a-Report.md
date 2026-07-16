---
title: Managing Expenses in a Report
description: Learn how to add, remove, and move expenses in a report in New Expensify, including how comments and system messages interact with them.
keywords: [New Expensify, manage expenses, add expense, delete expense, move expense, expense table, edit report, report approval, expense actions, create report, admin create report, inline editing, edit expense inline]
---

Managing expenses in reports helps you keep everything organized and ready for approval, payment, or export. This guide covers adding, moving, deleting, and editing expenses, as well as understanding audit trails and collaboration.

# Managing Expenses in a Report in New Expensify

## Who can edit or modify expenses in a report
- **Edit expenses on a report**: The member who created the report, the current approver, and Workspace Admins.
- **Add expenses to a report**: Only the member who created the report.
- **Remove expenses from a report**: Only the member who created the report.
- **Move expenses to a new report**: The member who created the report, and Workspace Admins (Admins can create new reports on behalf of employees by moving expenses).
- **Delete an expense**: Only the member who created that specific expense.

To edit expenses in Approved or Paid reports, a workspace admin will need to unapprove the report first. 

---

## How to Add Expenses to a Report

You can add expenses in two ways:

**Create a new expense directly in a report**

1. Open the draft report.
2. Click **More** > **Add expense** > **Create expense**
3. Enter the details and click **Create expense**.

**Add existing unreported expenses**
1. Open the draft report.
2. Click **More** > **Add expense** > **Add existing expense**.
3. (Optional) Use the **Status** filter to show only **Unreported** or **Draft** expenses.
3. Click one or more expenses.
4. Click **Add to report**.

---

## How to Move or Remove Expenses from a Report

You can move expenses to a different report, create a new report, or remove them entirely.

**To move or remove a single expense from a report:**

1. Open the draft report. 
2. Click the checkbox next to the expense(s) you want to move. 
3. Choose the green **selected** button > **Move expense(s)**.
4. Choose a destination report, select **Create report** to create a new report, or select **Remove from report**.

**To move or remove all expenses from a report**

1. In the left side tabs, choose **Spend** > **Reports**
2. Click the report with the expense(s) you want to move. 
3. Choose the green **selected** button > **Move expense(s)**.
4. Choose a destination report, select **Create report** to create a new report, or select **Remove from report**.

**Note:** Workspace Admins can also create reports on behalf of employees by moving expenses to a new report. This is particularly useful for processing company card expenses or splitting expenses across different accounting periods. See [Create and Submit Reports](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Create-and-Submit-Reports) for more details.

---

## How to Delete Expenses from a Report

**Delete a single expense**

1. Open the draft report.
2. Check the box next to the expense.
3. Click the green **selected** button > **Delete**.

**Delete multiple expenses**

1. Check the boxes for all expenses you want to delete.
2. Click the green **selected** button > **Delete**.

---

## How to Edit Expenses in Approved or Paid Reports

Approved and Paid reports are locked for editing. To make changes:

1. (Admins only) Open the report.
2. Click **More > Cancel Payment** (if Paid).
3. Then select **More > Unapprove**.

After it’s unapproved:
  - The member can select **More** > **Undo Submit**.
  - They can now edit or remove expenses before resubmitting.

**Important**: If the report was exported to an accounting system, delete the exported data there before exporting again.

---

## How to view and use the expense table

Each report includes an expense table showing the following default columns:

  - Receipt
  - Date
  - Merchant
  - Reimbursable
  - Card
  - Description
  - Total
  - Amount
  - Category
  - Workspace violations, if applicable

Additional columns can be enabled from the **Columns** picker:

  - Attendees
  - Billable
  - Category GL code
  - Custom field 1
  - Custom field 2
  - Exchange rate
  - International reimbursement IDs
  - MCC
  - Per attendee
  - Posted
  - Purchase amount
  - Tag
  - Tag GL code
  - Tax
  - Tax code
  - Tax rate
  - Withdrawal ID

Clicking a row opens the full expense details in a side panel (web) or details screen (mobile).

## How to use comments and collaboration on a report

Every report has a comment thread where you can:
  - Add comments below the expense table or on individual expenses
  - Use @mentions to notify teammates
  - Upload documents to support conversations

Comments update live for everyone with access to the report.

## How to edit expenses inline on desktop

On desktop, you can edit certain expense fields directly in the table without opening the expense details:

1. Click a **date**, **merchant**, **description**, **category**, or **amount** cell in the expense table.
2. Edit the value using the inline editor that appears (a text input, date picker, or category picker depending on the field).
3. Click outside the cell or press Enter to save your changes.

**Note:** Inline editing is only available on desktop (wide layout). On mobile, tap the expense row to open the full details screen.

---

# FAQ

## Why can’t I find a report I just created?

You may be filtered into a different workspace or be using a mismatched search term. Clear filters or use a broader search.

## Why can’t I submit a report?

  - The report has no expenses.
  - The report is already submitted.
  - Expenses are still SmartScanning or pending Expensify Card transactions.

## Why can’t I move, edit, or delete expenses in a report?

  - You don’t have permission to edit the report.
  - The report is approved or paid.

**Solution**: Ask a Workspace Admin to unapprove the report, or retract it if you submitted it.
