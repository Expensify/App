---
title: Reconcile Company Card Expenses
description: Learn how to reconcile company card expenses in Expensify, including troubleshooting discrepancies, managing approvals, and preparing accruals
keywords: [Expensify Classic, reconcile company cards]
---

This guide explains how to reconcile corporate card transactions imported into Expensify using the reconciliation dashboard feature.

---

# Steps to Reconcile Transactions

## Access the Reconciliation Dashboard
1. Hover over **Settings** and click **Domains**.
2. Select the desired domain.
3. Click the **Reconciliation** tab near the top of the page.
4. Enter the statement dates and click **Run**.

## Confirm Statement Total
To verify the total transactions imported into Expensify match your credit card statement:

1. Review the **Imported Total**, which shows the sum of all imported expenses for the selected statement period. 
   - This total should match the amount on your credit card statement.
2. If there’s a discrepancy:
   - Refresh the feed to import missing expenses:
     - Click **Update All Cards** for commercial card feeds.
     - For other feeds, click the blue cog icon next to individual cards and select **Update**.
   - After updating, click **Run** to recalculate the totals.

## Confirm Card Totals
If the totals on the credit card statement and the Reconciliation dashboard still don’t match, follow these steps:

1. Sort the cards by clicking the column heading for **Card Name/Number**, **Assignee**, or **Total**.
2. Compare each card’s total to the credit card statement to find discrepancies.
3. Click the **Total** amount for a card to view its imported expenses. Check for:
   - Missing transactions.
   - Unassigned cards (all cards must be assigned to cardholders).
4. If discrepancies persist, contact **concierge@expensify.com** with details of the missing expenses:
   - Cardholder email
   - Expense date
   - Expense amount

## Identify Outstanding, Unapproved Expenses
Use the **Unapproved Total** and **Approved Total** columns to locate expenses that haven’t been approved or exported:

1. Click the **Unapproved Total** heading to sort cards by those with outstanding expenses.
2. Click the **Unapproved** amount for a card to view expenses in the Unreported, Draft, Outstanding, or Deleted states.

**Note: You must be both a Domain Admin and Workspace Admin to access expenses.**

## Add Unreported or Deleted Expenses to a Report
1. Filter the expenses to display only Unreported or Deleted expenses.
2. Select all relevant expenses and click **Add to a Report** > **Auto Report**.
3. If a draft report exists in the cardholder’s account, the expenses will be added to it. Otherwise, a new report will be created.

---

# Process and Edit Reports

Workspace Admins can do the following via the Reconciliation Dashboard:
  - Code (categorize or tag expenses, add receipts or comments) expenses.
  - Submit Draft reports.
  - Approve Outstanding reports.
- All changes made by admins are tracked in the **Report History and Comments** section at the bottom of each report.
- You can remind members to submit or approve reports via Report History, which sends email notifications to users.

---
# Prepare Accrual

To close your books for the month with unapproved expenses:
1. Match the **Imported Total** to the statement amount.
2. Match the **Approved Total** to the Company Card Liability account in your accounting system.
3. Use the **Unapproved Total** as the accrual amount if the above totals are correct.

---

# FAQ

## Who can access the Reconciliation tab?
Only Domain Admins can access the Reconciliation tool.

## Who can view and process company card transactions?
- **Domain Admins** can view all company card transactions, including unreported ones, via the Reconciliation tool.
- **Workspace Admins** can only view reported expenses in a workspace. If they lack domain access, they cannot see transactions that haven’t been added to a report.

## What do I do if company card expenses are missing?
1. Use the Reconciliation tool to locate the missing expense:
   - Select the date range for the expense.
   - View the specific card to check the data.
2. If the expense isn’t listed, click **Update** next to the card under the Card List tab to pull in missing transactions.
3. If the expense still doesn’t appear, contact Concierge with these details:
   - Merchant name
   - Date
   - Amount
   - Last four digits of the card number

**Note: Only posted transactions will be imported.**

