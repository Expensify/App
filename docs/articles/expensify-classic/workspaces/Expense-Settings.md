---
title: Expensify Workspace Expense Settings
description: Expense Settings
---
Expensify offers multiple ways to customize how expenses are created and managed at the workspace level. Whether you’re using an individual workspace or managing expenses in a group workspace, there are various expense settings you can customize.

# Set up the expense settings on a workspace

You can manage the expense settings on a workspace under **Settings** > **Workspaces** > **Individual** or **Group** > [_Workspace Name_] > **Expenses**. From here you can customize the following expense-level settings:
- **Violations**: When enabled, employee expenses that fall outside of workspace preferences are flagged as violations.
- **Preferences**: Configure the reimbursable and billable settings for the expenses submitted to the corresponding workspace. 
- **Distance**: This is where you can set the reimbursable mileage rates for yourself or your employees.
- **Time**: Set an hourly billable rate so members of the workspace can create time expenses for reimbursement. 

## Violations
A workspace admin can customize the following parameters at the expense level:
- **Max Expense Age (Days)**
- **Max Expense Amount**
- **Receipt Required Amount**

If an expense is submitted that falls outside of those parameters, Expensify will automatically detect it as a violation and alert both the expense creator and reviewer that it needs to be corrected.

More information on violations can be found [**here**](https://help.expensify.com/articles/expensify-classic/workspaces/Enable-and-set-up-expense-violations). 

## Preferences

A cash expense is any expense created manually or by uploading a receipt for SmartScan; it does not mean the expense was paid for with cash. The other type of expense you’ll most commonly see is credit card expenses, which are expenses imported from a credit card or bank connection.

There are four options for cash expenses:

- **Reimbursable by default** - All cash expenses are reimbursable but can be marked as non-reimbursable as needed.
- **Non-reimbursable by default** - All cash expenses are non-reimbursable but can be marked as reimbursable as needed.
- **Forced always reimbursable** - All cash expenses are forced to be reimbursable; they cannot be marked as non-reimbursable.
- **Forced always non-reimbursable** - All cash expenses are forced to be non-reimbursable; they cannot be marked as reimbursable.

### Billable expenses

Billable expenses refer to expenses you or your employees incur that need to be re-billed to a specific client or vendor.

If you need to track expenses for the purpose of billing them to customers, clients, or other departments, billable expenses are supported in both Individual and Group workspaces. Either way, head to **Settings** > **Workspaces** > **Individual** or **Group** > [_Workspace Name_] > **Expenses**.

Under Expense Basics, you can choose the setting that is best for you.

- **Disabled** means expenses are not allowed to be billable at all.
- **Default to billable** means expenses will always be billable but can be marked as non-billable as needed.
- **Default to non-billable** means expenses will always be non-billable but can be marked as billable as needed.

If your Group workspace is connected to Xero, QuickBooks Online, NetSuite, or Sage Intacct, you can export billable expenses to be invoiced to customers. To set this up, go to the Coding tab in the connection configuration settings.

### eReceipts

eReceipts are full digital replacements of their paper equivalents for purchases of $75 or less. 

Click the toggle to your preferred configuration. 

- **Enabled** - All imported credit card expenses in US dollars of $75 or less will have eReceipts in the receipt image.
- **Disabled** - No expenses will generate an eReceipt.

Note: Expensify will not generate an eReceipt for lodging expenses.

### Secure receipt images

Whether you’re sharing your receipts with your accountant, having an auditor review exported expenses, or simply wanting to export to keep a hard copy for yourself, receipt visibility will be an essential consideration. 

Under _Public Receipt Visibility_, you can determine who can view receipts on your workspace.

- **Enabled** means receipts are viewable by anyone with the URL. They don't need to be an Expensify user or a workspace member to view receipts.
- **Disabled** means receipts are viewable by Expensify users, who would have access to view the receipt in the application. You must be an Expensify user with access to the report a receipt is on and logged into your account to view a receipt image via URL.

 
## Distance Expenses
How to set up distance expenses:
1. Select whether you want to capture _miles_ or _kilometers_,
2. Set the default category to be used on distance expenses, 
3. Click **Add A Mileage Rate** to add as many rates as you need, 
4. Set the reimbursable amount per mile or kilometer. 

**Note:** If a rate is toggled off it is immediately disabled. This means that users are no longer able to select it when creating a new distance expense. If only one rate is available then that rate will be toggled on by default.

### Track tax on mileage expenses
If you’re tracking tax in Expensify you can also track tax on distance expenses. The first step is to enable tax in the workspace. You can do this by going to  **Settings** > **Workspaces** > **Individual** or **Group** > [_Workspace Name_] > **Tax**.

Once tax is enabled on a workspace level you will see a toggle to _Track Tax_ in the Distance section of the workspace settings. If tax is disabled on the workspace the Track Tax toggle will not display.

When Track Tax is enabled, you will need to enter additional information about the rates you have set. This includes the _Tax Reclaimable on_ and _Tax Rate_ fields. With that information, Expensify will work out the correct tax reclaim for each expense.

If you enable tax but don’t select a tax rate or enter a tax reclaimable amount, we will not calculate any tax amount for that rate. If, at any point, you switch the tax rate or enter a different reclaimable portion for an existing distance rate, the mileage rate will need to be re-selected on expenses for the tax amount to update according to the new values.

**Note:** Expensify won’t automatically track cumulative mileage. If you need to track cumulative mileage per employee, we recommend building a mileage report using our custom export formulas.

## Time Expenses

Using Expensify you can track time-based expenses to bill your clients at an hourly rate or allow employees to claim an hourly stipend. 

Click the toggle under the _Time_ section to enable the feature and set a default hourly rate. Then, you and your users can create time-based expenses from the [**Expenses**](https://expensify.com/expenses) page of the account.

## Concierge Receipt Audit

Concierge Receipt Audit is a real-time audit and compliance of receipts submitted by employees and workspace users. Concierge checks every receipt for accuracy and compliance, flagging any expenses that seem fishy before expense reports are even submitted for approval. All risky expenses are highlighted for manual review, leaving you with more control over and visibility into expenses. When a report is submitted and there are risky expenses on it, you will be immediately prompted to review the risky expenses and determine the next steps. 

**Benefits of Concierge Receipt Audit**
- To make sure you don't miss any risky expenses that need human oversight.
- To avoid needing to manually review all your company receipts.
- It's included at no extra cost with the [Control Plan](https://www.expensify.com/pricing).
- Instead of paying someone to audit your company expenses or being concerned that your expenses might be audited by a government agency.
- It's easy -- Concierge will alert you to the risky expense and present it to you in an easy-to-follow review tutorial.
- In addition to the risky expense alerts, Expensify will include a Note with audit details on every report.  

**Note:** If a report has audit alerts on it, you'll need to Review the report and Accept the alerts before it can be approved.

{% include faq-begin.md %}

## Why do I see eReceipts for expenses greater than $75?

An eReceipt is generated for Expensify card purchases of any amount in the following categories: Airlines, Commuter expenses, Gas, Groceries, Mail, Meals, Car rental, Taxis, and Utilities.

## Why didn’t my rate get updated with the newest rate guidance by the IRS?

Expensify does not update mileage rates to match the rate provided by the IRS. An admin of the workspace will need to update the rate or create a new rate in the workspace. This is because Expensify has customers worldwide, not just in the United States, and most companies want to communicate the change with employees and control the timing.

{% include faq-end.md %}
