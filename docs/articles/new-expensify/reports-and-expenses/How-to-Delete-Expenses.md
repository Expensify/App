---
title: How to Delete Expenses
description: Learn how to delete expenses in New Expensify, including how to remove expenses from reports, when you need to retract a report, and why some expenses can’t be deleted.
keywords: [New Expensify, delete expenses, remove expense, delete expense report, company card expense delete, retract report delete expense, cannot delete expense Expensify, undelete expense, restore deleted expense, find deleted expenses, delete a group of expenses, delete grouped expenses, group disappears after delete, delete every expense in a group]
internalScope: Audience includes all members. Covers deleting individual expenses, deleting expenses from reports, deleting every expense in a group on the Spend page, retracting reports to enable deletion, company card deletion rules, finding and un-deleting deleted expenses. Does not cover editing expenses, reimbursement workflows, expense approvals beyond deletion requirements.
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
3. Choose **X selected**, then **Delete**.
4. Choose **Delete** again to confirm.

**Note:** The bulk action button shows how many expenses you selected, for example **3 selected**. You can only delete your own Unreported, Draft, and Outstanding expenses. You can’t delete expenses created by other members.

---

## How to delete every expense in a group on the Spend page

When your results are grouped, each group row has its own checkbox that selects every expense the group is currently showing. Learn how to [group results by dimension](/articles/new-expensify/reports-and-expenses/Use-Search-Operators-to-Filter-and-Analyze).

1. In the navigation tabs (on the left on web, on the bottom on mobile) select **Spend** > **Expenses**.
2. Group your results, for example by **Category** or by **Merchant**.
3. Select the group’s checkbox to select every expense in that group. You can also expand the group and select each expense individually.
4. Choose **X selected**, then **Delete**.
5. Choose **Delete** again to confirm.

---

## What happens after you delete every expense in a group

- When you delete every expense a group contains, the whole group row is removed from your results.
- When your results show fewer expenses than the group contains, only the expenses you selected are deleted. The group stays in your results and collapses, and the expenses that weren’t shown are untouched. Expand the group again to load them.
- While you’re offline, the group row stays in your results and is shown as pending until you reconnect and the deletion reaches Expensify.
- If the deletion fails, the group row returns to your results.

---

## How to delete an expense from a report 

1. In the navigation tabs (on the left on web, on the bottom on mobile) select **Spend** > **Expenses**.
2. Open the report that contains the expense.
3. Select the expense you want to delete.
4. Choose **X selected**, then **Delete**.

**Note:** You can only delete expenses from your own Unreported, Draft, and Outstanding reports. If the report is Approved, Done or Paid, it will need to be retracted first before deleting the expense. [Learn how to retract a report](/articles/new-expensify/reports-and-expenses/Edit-Expense-Reports). 

---

## What happens after you delete an expense 

- If the expense was the only one on a report, the report is also deleted.
- If the report contained multiple expenses, the remaining expenses stay on the report.
- If you need to recover the deleted expense, it can be undeleted.
  
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

If an expense can't be deleted, you can [remove the expense from the report](/articles/new-expensify/reports-and-expenses/Managing-Expenses-in-a-Report#how-to-move-or-remove-expenses-from-a-report) and move it to your personal space instead. 

---

## How to find and undelete deleted expenses

Deleted expenses are not permanently removed. You can find and restore them from the **Spend** page.

1. In the navigation tabs (on the left on web, on the bottom on mobile) select **Spend** > **Expenses**.
2. Filter by **Status** = **Deleted** and click **Apply**.
3. Select the expenses you want to restore using the checkboxes.
4. Choose **X selected**, then **Undelete**.

The restored expenses return to your account. 

---
 
# FAQ

## How can I delete another member's expenses? 

You can only delete expenses in your own account.

If you need access to another member’s expenses, ask them to [add you as a Copilot](/articles/new-expensify/settings/Copilot-Access). This allows you to manage expenses on their behalf.

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
