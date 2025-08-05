---
title: Managing Expenses in a Report
description: Learn how to add, remove, and move expenses in a report in New Expensify, including how comments and system messages interact with them.
keywords: [New Expensify, manage expenses, add expense, delete expense, move expense, expense table, expense comments, report audit history, report troubleshooting]
---
<div id="new-expensify" markdown="1">

Easily manage expenses inside reports in New Expensify. This guide covers how to add, delete, or move expenses, and how they interact with comments, system messages, and audit trails.

# Managing Expenses in a Report

## Add Expenses to a Report

You can add expenses to a report in two ways:

### Create a new expense
1. Open the draft report.
2. Select **Add expense** > **Create expense**.
3. Enter the expense details and click **Save**.
4. The new expense appears instantly in the report.

### Add existing unreported expenses
1. Select **Add expense** > **Add unreported expenses**.
2. Select one or more expenses.
3. Click **Add to report**.

**Tip:** To add additional expenses later, go to **More > Add expense**.

---

## Delete Expenses From a Report

You can delete one or more expenses from a report:

### Delete a single expense
1. Open the report.
2. Check the box next to the expense.
3. Select the **green** selection button > **Delete**.

### Delete multiple expenses
1. Check the boxes for all expenses you want to delete.
2. Select the **green** selection button > **Delete**.

---

## Move or Remove Expenses

### Move expenses to another report
1. Check the boxes next to the expenses.
2. Select the **green** selection button > **Move expense(s)**.
3. Choose the destination report from the panel.

### Remove expenses from a report
1. Check the boxes next to the expenses.
2. Select the **green** selection button > **Move expense(s)**.
3. Choose **Remove from report**.

---

## Edit Expenses in Approved or Paid Reports

Approved and Paid reports are locked for editing. To make changes:

1. Open the report (as an Admin).
2. Select **More > Cancel Payment** (if Paid).
3. Then select **More > Unapprove**.

After it's unapproved:
- The member can select **More > Undo Submit**.
- They can now edit or remove expenses before resubmitting.

**Important:** If the report was exported to an accounting system, delete the exported data from that system before exporting again. Unapproving a report doesn’t retract the export.

### Example

Taylor submits a report to Jordan. Jordan approves, pays, and exports it to NetSuite, then notices the report includes an unpaid invoice meant for the AP team. Jordan cancels the payment, unapproves the report, and Taylor undoes the submission to remove the invoice. Meanwhile, Jordan deletes the exported report from NetSuite, preparing it for fresh export.

---

## View the Expense Table in a Report

Every report includes an expense table. Each row shows:

- Date
- Merchant
- Category
- Amount
- Workspace violations (if applicable)

Clicking a row opens the full expense details in the side panel.

---

## Comments and Collaboration

Each report includes a comment thread to help track conversations and share documents.

### Key features:
- Add comments below the expense table or on individual expenses.
- Use **@mentions** to notify teammates.
- Upload documents to support conversations.
- Comments update live for everyone with access to the report.

---

## System Messages and Audit History

Reports include a complete audit trail of every action—submit, approve, pay, export, etc. -in the comment thread. Expenses also log a history of edits, making it easy to follow changes for compliance or troubleshooting.

---

# Troubleshooting the Reports Page

## Why can’t I find a report I just created?

**Possible causes:**
- You're filtered into a different workspace.
- Your search term doesn't match the report name.

**Solutions:**
- Clear any filters and search again.
- Use a broader or partial search term.

---

## Why is the **Create report** button missing?

You’re not a member of a workspace.

**Solutions:**
- Go to **Workspaces > New Workspace** to create one.
- Or ask your workspace admin to invite you to the company’s workspace.

---

## Why can’t I submit a report?

**Possible causes:**
- The report has no expenses.
- The report is already submitted.
- All expenses are still SmartScanning or pending Expensify Card transactions.

**Solutions:**
- Add at least one complete expense.
- Wait for SmartScan to finish or card transactions to post.

---

## Why can’t I move or delete expenses from a report?

**Possible causes:**
- You don’t have permission to edit the report.
- The report is approved or paid.

**Solutions:**
- Ask a workspace admin to unapprove the report.
- Retract the report if you submitted it.

</div>
