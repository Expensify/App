---
title: How to Delete Expenses
description: Learn how to delete expenses in New Expensify, including how to remove expenses from reports, when you need to retract a report, and why some expenses can’t be deleted.
keywords: [New Expensify, delete expenses, remove expense, delete expense report, company card expense delete, retract report delete expense, cannot delete expense Expensify]
internalScope: Audience includes all members. Covers deleting individual expenses, deleting expenses from reports, retracting reports to enable deletion, company card deletion rules. Does not cover editing expenses, reimbursement workflows, expense approvals beyond deletion requirements.
---

# How to delete expenses 

Deleting an expense depends on the expense type and the report status.

Most expenses can be deleted directly. If an expense is on a submitted report or comes from a company card, you may need to take additional steps first.

---

## How to delete a single expense 

1. Open the expense you want to delete. 
2. From the expense, choose **More**.
3. Choose **Delete**.

---

## How to delete multiple expenses

1. In the navigation tabs (on the left on web, on the bottom on mobile) select **Spend** > **Expenses**.
2. Select the expenses you want to delete.
3. Choose **Selected**, then **Delete**.

**Note:** You can only delete your own Unreported, Draft, and Outstanding expenses. You can’t delete expenses created by other members.

---

## How to delete an expense from a report 

1. In the navigation tabs (on the left on web, on the bottom on mobile) select **Spend** > **Expenses**.
2. Open the report that contains the expense.
3. Select the expense you want to delete.
4. Choose **Selected**, then **Delete**.

**Note:** You can only delete expenses from your own Unreported, Draft, and Outstanding reports. If the report is Approved, Done or Paid, it will need to be retracted first before deleting the expense. [Learn how to retract a report](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Edit-Expense-Reports). 

---

## Why you can’t delete an expense

Expenses can only be deleted when certain conditions are met.

<!-- ADD LINK:
link helpdot page explaining expense icons and what they mean
https://github.com/Expensify/Expensify/issues/614406
-->

**Cash expenses can be deleted when:** 

 - The expense was created by you.
 - The expense is a manual cash expense, distance expense, or SmartScanned receipt. 
 - The expense is Unreported or on a Draft or Outstanding report.

**Imported company card expenses can be deleted when:**

 - The workspace setting **Allow deleting transactions** was enabled at the time the expense was imported
 - The expense is Unreported or on a Draft or Outstanding report

If an expense can't be deleted, you can [remove the expense from the report](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Managing-Expenses-in-a-Report#how-to-move-or-remove-expenses-from-a-report) and move it to your personal space instead. 

---
 
# FAQ

## How can I delete another member's expenses? 

You can only delete expenses in your own account.

If you need access to another member’s expenses, ask them to [add you as a Copilot](https://help.expensify.com/articles/new-expensify/settings/Copilot-Access). This allows you to manage expenses on their behalf.

## How can a Workspace Admin allow members to delete company card expenses?

Workspace Admins can allow deletion of future imported company card expenses by enabling **Allow deleting transactions**. 

To enable this setting on a Workspace feed: 

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Workspace Name] > Company cards**.
2. Click **Settings**.
3. Enable **Allow deleting transactions**.

**Note:** This setting only applies to expenses imported after it’s enabled.

## How can a Workspace Admin delete company card expenses imported after a certain date? 

Workspace Admins can remove certain imported expenses by unassigning a card.

To unassign a company card on a workspace feed: 

1. In the navigation tabs (on the left on web, on the bottom on mobile) select **Workspaces > [Workspace Name] > Company cards**.
2. Select the card. 
3. Click **Unassign Card**. 

**Note:** This permanently deletes all Unreported and Draft expenses on that card. Expenses on Outstanding, Approved, Done, or Paid reports aren’t deleted.
