---
title: INT083 Export Error: Expense Item Isn’t Mapped to a Valid Billable Expense Type
description: Learn why the INT083 export error occurs and how to select or map categories that support billable expenses in Sage Intacct.
keywords: INT083, billable expense type error, Sage Intacct billable category mapping, expense type not billable, vendor bill billable mapping, sync billable categories
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT083 export error related to billable expense type mapping. Does not cover general category or tax configuration errors.
---

# INT083 Export Error: Expense Item Isn’t Mapped to a Valid Billable Expense Type

If you see the error message:

**“INT083 Export Error: Expense item [X] isn’t mapped to a valid billable expense type in Sage Intacct. Please select a category that supports billable expenses.”**

It means the selected category does not allow billable expenses in Sage Intacct.

Sage Intacct requires the selected category (or expense type) to support billable transactions if the expense is marked as billable.

---

## Why the INT083 Export Error Happens

The INT083 export error occurs when:

- An expense is marked as **billable**, and  
- The selected category does not support billable expenses in Sage Intacct  

Category behavior depends on the export type:

- **Expense reports** — Categories are based on **Expense Types**  
- **Vendor bills** — Categories are based on the **Chart of Accounts (GL codes)**  

If the selected category does not allow billable expenses, the export fails.

---

# How to Fix the INT083 Export Error

Follow the steps below to update the category configuration.

---

## Step 1: Review Categories on the Report

1. Open the report that failed to export.  
2. Review the categories selected on the billable expenses.  
3. Identify the category referenced in the error message.  

---

## Step 2: Confirm the Category Supports Billable Expenses in Sage Intacct

Log in to Sage Intacct and review the category configuration based on your export type:

- For **expense reports**, review the corresponding **Expense Type**.  
- For **vendor bills**, review the related **GL account** in the Chart of Accounts.  

Confirm the category is configured to allow billable expenses.

If it does not allow billable expenses:

- Update the category settings to support billable transactions, or  
- Select a different category that supports billable expenses  

Save your changes.

---

## Step 3: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 4: Retry the Export

Return to the report and retry the export.

If the selected category supports billable expenses, the export should complete successfully.

---

# FAQ

## Can I fix this by removing the billable designation?

Yes. If the expense should not be billable, removing the billable flag will resolve the error.

## Do I need to change the export type?

Not typically. The issue is usually related to how the selected category is configured.

## Do I need to run Sync after updating Sage Intacct?

Yes. Running **Sync Now** ensures updated category settings are reflected before retrying the export.
