---
title: Expense Types
description: Learn how to mark expenses as reimbursable or non-reimbursable, organize reports by expense type, filter expenses, and restore deleted expenses in Expensify.
keywords: expense types, mark expense as reimbursable, mark expense as non-reimbursable, billable expense, split by reimbursable, organize report by billable, filter expenses, find deleted expenses, restore deleted expense, soft delete
internalScope: Audience is all Expensify members. Covers marking expenses as reimbursable or non-reimbursable, organizing reports by expense type, filtering expenses, and restoring deleted expenses. Does not cover accounting exports or advanced integrations.
---

# Expense Types

Expense types in Expensify determine:

- Whether a member is reimbursed  
- Whether an expense can be billed to a client  
- How totals appear in a report  

This article explains how to understand expense types, mark expenses correctly, organize reports by expense type, filter expenses, and restore deleted expenses.

---

## How to tell the difference between expense types

Every expense in Expensify can be:

- reimbursable or non-reimbursable 
- billable or non-billable

These settings affect reimbursement totals and invoicing. The right side of every report displays total expenses, broken down by **reimbursable**, **billable**, and **non-reimbursable** amounts.

## What it means to mark an expense as reimbursable

Reimbursable expenses are paid personally by a member and must be repaid by the business.

Common examples include:

- **Cash & Personal Card:** Out-of-pocket business expenses.
- **Per Diem:** Daily expense allowances configured in your [Workspace settings](https://help.expensify.com/articles/expensify-classic/workspaces/Enable-per-diem-expenses).
- **Time:** Hourly wages for jobs, typically used for contractor invoicing. Configure rates [here](https://help.expensify.com/articles/expensify-classic/workspaces/Set-time-and-distance-rates).
- **Distance:** Mileage-related expenses.

Reimbursable expenses increase the amount owed to the member.

## What it means to mark an expense as non-reimbursable

Non-reimbursable expenses are paid directly by the business, typically using a company card.

They appear in reports but do not increase the reimbursement amount.

## What it means to mark an expense as billable

Billable expenses can be charged to a client.

An expense can be:

- Reimbursable and billable  
- Non-reimbursable and billable  

On the right side of every report (web) and in the report summary section (mobile), totals are broken down by reimbursable, non-reimbursable, and billable amounts.

![Image of a report showing multiple expense totals]({{site.url}}/assets/images/amounts.png){:width="100%"}

## How to mark an expense as reimbursable or non-reimbursable

If an expense is marked incorrectly, you can update it.

**On Web**

1. Click the **Expenses** tab.
2. Click the expense you want to edit. 
3. Select or de-select **Reimbursable**.
4. Click **Save**.

**On Mobile**

1. Tap the **Expenses** tab.
2. Tap the expense you want to edit. 
3. Tap the **More options**. 
4. Toggle **Reimbursable**.
5. Tap **Save**.

**Note:** If you do not see the reimbursable option, it may be disabled for your Workspace or for that specific expense type.

## How to mark an expense as billable or non-billable

If an expense needs to be billed to a client, you can update the billable setting.

**On Web**

1. Click the **Expenses** tab.
2. Click the expense you want to edit. 
3. Select or de-select **Billable**.
4. Click **Save**.

**On Mobile**

1. Tap the **Expenses** tab.
2. Tap the expense you want to edit. 
2. Tap the **More options**. 
4. Toggle **Billable**.
5. Tap **Save**.


**Note:** If you don't see the billable option, it may be disabled for your Workspace or for that specific expense type.

## How to organize a report by reimbursable or billable expenses

Organizing a report by expense type helps streamline review and approvals.

1. Click the **Expenses** tab in your Expensify account on the web. 
2. Click **Details** in the upper right.
3. Under **View**, select **Detailed**.
4. Use the **Split by** dropdown and select:
   - Reimbursable, or  
   - Billable
5. (Optional) Use **Group by** to organize by Category or Tags.

---

## How to filter expenses

Use filters to narrow down the data:
1. Click the **Expenses** tab in your Expensify account on the web. 
2. Click **Show filters**.
2. Adjust the filters at the top of the page:
   - **From** and **To** – Select a specific date range. 
   - **Merchant** – Find expenses from a particular vendor or merchant (partial searches work).
   - **Workspace** – View expenses for a specific Workspace.
   - **Categories** – Filter by category to refine your search.
   - **Tags** – Locate expenses based on assigned tags.
   - **Submitters** – Find expenses by employee or vendor.
   - **Unreported, Draft, Outstanding, Approved, Paid, Done** – View expenses at different reporting stages.

**Note:** Some filters adjust dynamically based on your current selections. If results aren’t as expected, click **Reset** to clear all filters.

## How to find deleted expenses 

On Web: 

1. Click the **Expenses** tab. 
2. Click **Show filters** to expand the filters. 
3. Select **Deleted**.

## How to recover deleted expenses  

Expensify uses a soft delete system. When you delete an expense, it moves to a **Deleted** view instead of being permanently removed. This prevents accidental data loss and protects reconciliation accuracy.

If you need to restore a deleted expense:  

1. Click the **Expenses** tab in your Expensify account on the web. 
2. Click **Show filters** to expand the filters. 
3. Select **Deleted** to reveal deleted expenses. 
4. Select the expenses you want to recover.  
4. Click **Undelete** to move the expense back to its original state.  

- **Deleted expenses remain in the system** for reference, ensuring no financial data is lost.  
- **Expenses can be restored at any time** unless permanently removed by an Domain Admin.  
- If an expense is deleted in error, you can restore it using the steps above.

---

# FAQ

## What’s the difference between an expense, a receipt, and a report attachment?
- **Expense:** Created when you SmartScan or manually upload a receipt.
- **Receipt:** Image file automatically attached to an expense via SmartScan.
- **Report Attachment:** Additional documents (e.g., supporting documents) added via the paperclip icon in report comments.

## How are credits or refunds displayed in Expensify?
Credits appear as **negative expenses** (e.g., -$1.00). They offset the total report amount.

For example:
- A report with **$400** and **$500** reimbursable expenses shows a total of **$900**.
- A report with **-$400** and **$500** expenses results in a **$100** total.

## Can I permanently delete a cash expense?
Permanently deleting cash expenses is restricted to ensure accurate financial records. It is possible to delete company card expenses, as long as the expenses have not been submitted, by unassigning the employee's card at the domain level. 

## How do I find my deleted expenses?  
Use the **Filters** option in the **Expenses** tab and select **Deleted** to view all soft-deleted expenses.  
