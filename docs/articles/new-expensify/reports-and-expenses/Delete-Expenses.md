---
title: Delete Expenses
description: Learn how to delete personal or company card expenses in New Expensify, including rules for submitted reports, admin-only cases, and account-level deletion limits.
keywords: [New Expensify, delete expenses, remove expense, company card, retract, draft expense, report expense, expense deletion]
---

<div id="new-expensify" markdown="1">

Need to delete an expense in New Expensify? Whether it’s a personal expense, a company card transaction, or one on a submitted report, this guide walks through your options.

# Delete an individual expense

1. In the left-hand menu, select **Reports > Expenses**.
2. Check the box next to the expense(s).
3. Click the green **Selected** button and choose **Delete**.

# Delete an expense on an open expense report

You can delete any personal (out-of-pocket) expense that hasn’t been submitted yet:

1. In the left-hand menu, select **Reports > Expense Reports**.
2. Open the report containing the expense.
3. Check the box next to the expense you want to remove.
4. Click the green **Selected** button and choose **Delete**.

# The report is submitted or marked as "Done"

To delete an expense on a submitted report, you'll need to retract it first:

1. Click **Retract**.
2. Then follow the deletion steps above.

**Note:** You can only retract reports that are **Done** or **Outstanding**. Reports that are **Approved** or **Paid** cannot be retracted.

# Deleting company card expenses

Some company card expenses can’t be deleted if the card settings don’t allow it. This typically happens if the card was imported without the **Allow deleting transactions** setting enabled.

To delete future expenses:
- Ask your Domain Admin to enable **Allow deleting transactions** in the company card settings.

To delete **existing draft** company card expenses:

1. From the left-hand menu, select **Workspaces > [Workspace Name] > Company cards**.
2. Unassign the card connected to the expenses you want to delete.
3. All **draft expenses** from that card will be removed automatically.

**Note:** Expenses that are already submitted will stay attached to reports and cannot be deleted through unassignment.

⚠️ **Warning:** Unassigning a company card will permanently delete **all draft expenses** from that card. Submitted expenses are not affected.

# FAQ

## Why can't I delete certain expenses?

Company card expenses can’t be deleted if **Allow deleting transactions** is turned off for that card. In that case, only a Domain Admin can enable this setting—or unassign the card to remove draft expenses.

Expense actions like deleting, editing, or retracting can only be done in your own account. Even Workspace Admins can’t delete another member’s expenses. If you need to help a teammate, ask them to add you as a [Copilot](https://help.expensify.com/articles/new-expensify/settings/Copilot-Access) so you can assist from their account.

## Can I retract a report after it’s been approved or paid?

No, reports in **Approved** or **Paid** status can’t be retracted. Only reports that are **Done** or **Outstanding** can be retracted to allow expense deletion.

## Can Expensify permanently delete expenses for me?

In rare cases where you can't delete expenses yourself—like locked company card transactions on restricted domains—or if there are too many to remove individually, Expensify can help. Here's how it works:

- Only **Workspace Admins** or **Domain Admins** can request manual deletion.
- Expenses must be **unreported** or on a **draft report**.
- The request must include the **report IDs**.
- If possible, add all expenses you want deleted to a single report, or mark them clearly in the **expense description** (e.g. “Delete this expense”).
- If eligible, Expensify Support will use a secure internal tool to delete them.

If you're an Admin and need help deleting unwanted expenses, reach out to Concierge with the relevant expense and report details. Once deleted, expenses can't be recovered.


</div>
