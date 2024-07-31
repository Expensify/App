---
title: Xero Troubleshooting
description: Xero Troubleshooting
---

# Overview of Xero Troubleshooting

Synchronizing and exporting data between Expensify and Xero can streamline your financial processes, but occasionally, users may encounter errors that prevent a smooth integration. These errors often arise from discrepancies in settings, missing data, or configuration issues within Xero or Expensify.

This troubleshooting guide aims to help you identify and resolve common sync and export errors, ensuring a seamless connection between your financial management systems. By following the step-by-step solutions provided for each specific error, you can quickly address issues and maintain accurate and efficient expense reporting and data management.

# ExpensiError XRO014 Billable Expenses Require A Customer

**Why does this happen?**

This happens because Xero requires all billable expenses exported from Expensify to have a customer associated with it. This error occurs when one or more expenses on a report have been marked "billable," and do not have a customer associated with them.

## How to fix it

1. Navigate to your Settings > Workspaces > [click workspace] > Connections > Configure button > Coding tab.
2. Click the **toggle** to enable Billable Expenses.
3. Click the **Save** button to save the change and sync the connection.
4. Open the report in question and apply a _Customer_ tag to each billable expense.
     - _Note: A Contact in Xero is not imported as a Customer until they have had some kind of bill raised against them. If you can't see your Customer imported as a tag, you may need to raise a dummy invoice at the Xero end and then delete/void it. Don’t forget to sync the connection again after taking this step._
5. Try to export the report again by clicking the **Export to** button and select the **Xero** option.

# ExpensiError XRO027: Expense on this report is categorized with a category no longer in Xero

**Why does this happen?**

When exporting expense data, Xero will not accept a category on an expense that no longer exists in the chart of accounts. This error occurs when one or more expenses on the report are categorized with a category that no longer exists in Xero.

## How to fix it

1. Log into Xero.
2. Navigate to Settings > Chart of Accounts.
3. Confirm that each category used on an expense in the report in Expensify is still an active account in Xero.
4. If the account doesn’t exist, add it again and sync the connection in Expensify.
5. If the account still exists, open the details, check “Show in Expense Claims,” and then sync the connection in Expensify.
6. After syncing, open the report and re-categorize any expenses showing a red workspace violation for out-of-workspace categories. 
7. After recategorizing, click the **Export to** button and select the **Xero** option.

# ExpensiError XRO031: Payment has already been allocated to reimbursable expenses

**Why does this happen?**

Xero does not allow for paid expenses to be modified. When you attempt to export the reimbursable expenses again, Xero considers that a modification and rejects the export. This error occurs when the report contains reimbursable expenses that have already been exported to Xero where a payment was issued on the purchase bill.

## How to fix it

1. Log into Xero.
2. Click on Business > Bills to Pay > and then the Paid tab.
3. Locate the report from the error and click on it to open it.
4. Click on the blue text that says Payment.
5. Click the Options dropdown and then Remove and Redo to delete the payment.
    - _Note: Do not void the bill in Xero._
6. Head back to Expensify and open the report again.
7. Click the **Export to** button and select the **Xero** option.

The new export will override the current report in Xero and retain the same report ID.

# ExpensiError XRO087 No Bank Account or Incorrect Bank Account

**Why does this happen?**

Xero requires all bank transactions created from non-reimbursable expenses in Expensify to be posted to an active bank account. This error occurs when the destination account in Xero doesn’t exist, isn’t set, or is not the right type.

## How to fix it

1. Navigate to Settings > Workspaces > [workspace name] > Connections > click the **Configure** button.
2. Select a Xero Bank Account from the dropdown that will apply to all non-reimbursable expenses exported to Xero.
3. Click the **Save** button to sync the connection. 
4. Open the report again and click the **Export to** button and then the **Xero** option.

# ExpensiError XRO052: Expenses Are Not Categorized With A Xero Account

**Why does this happen?**

Xero requires all expenses exported from Expensify to use a category matching an account in your chart of accounts. If a category from another source is used, Xero will reject the expense. This error occurs when an expense on the report has a category applied that is not valid.

## How to fix it

1. Sync your Xero connection in Expensify from Settings > Workspaces > [click workspace] > Connections, and click the **Sync Now** button.
2. Review the expenses on the report. If any appear with a red _Category no longer valid_ violation, recategorize the expense until all expenses are violation-free.
3. Click the **Export to** button and then the **Xero** option.
4. If you receive the same error, continue.
    - _Note the categories used on the expenses and check the Settings > Workspaces > [click workspace] > Categories page to confirm the exact categories used on the report are enabled and connected to Xero (you'll see a blue icon next to all connected categories)._
5. Confirm that the categories used for expenses in the report match exactly the accounts in your Xero chart of accounts.
6. If you make any changes in Xero or in Expensify, always sync the connection and then try to export again. 

# ExpensiError XRO068: Organization is not subscribed to currency x

**Why does this happen?**

Xero requires the currencies you’re using in Expensify to be added to your account before you can export expenses in that currency. For example, if your workspace is set to Canadian currency, all expenses submitted on that workspace will be converted to CAD. You must also have the Canadian currency added to your Xero account to export successfully. This error occurs when your Xero account does not have the currency mentioned in the error added.

## How to fix it
_Note: Not all versions of Xero allow adding currencies. To add currencies, please upgrade your Xero account to the Established [plan](https://www.xero.com/us/pricing-plans/)._

1. Log into Xero.
2. Navigate to Settings > General Settings. 
3. Under the heading Features, select Currencies.
4. Click **Add Currency** to add the currency listed in the error message.
5. Sync your Xero connection in Settings > Workspaces > [click workspace] > Connections.
6. Open the report and click the **Export to** button and then the **Xero** option.

# ExpensiError XRO076: This report has already been exported once to Xero, but has been voided

**Why does this happen?**

Xero does not allow Expensify to modify a purchase bill created from a previous export if the bill has been voided. This error occurs when the report has already been exported to Xero, and the purchase bill has been voided.

## How to fix it
_Note: Xero does not support “unvoiding” a bill, it is an irreversible action._

1. From the Reports page in Expensify, locate the report associated with the voided bill.
2. Check the box to the left of the report and click **Copy**.
3. Open the new report and submit it through the approval workflow, then confirm it exports to Xero successfully.

# ExpensiError XRO099: You have reached the limit of invoices you can approve with your Xero account.

**Why does this happen?**

The Early plan only allows you to enter 5 bills per month. This error occurs when you are on a trial account of Xero and have run out of your allowable exports.

## How to fix it
Please upgrade your Xero account to a Growing or Established [plan](https://www.xero.com/us/pricing-plans/) so you can continue to use the integration and export reports without error. 

# Why are company card expenses exported to the wrong account?

Multiple factors could be causing your company card transactions to export to the wrong place in your accounting system, but the best place to start is always the same.

- First, confirm that the company cards have been mapped to the correct accounts in Settings > Domains > Company Cards > click the **Edit Export** button for the card to view the account.
- Next, confirm the expenses in question have been imported from the company card? 
    - Only expenses that have the Card+Lock icon next to them will export according to the mapping settings that you configure in the domain settings.

It’s important to note that expenses imported from a card linked at the individual account level, expenses created from a SmartScanned receipt, and manually created cash expenses will export to the default bank account selected in your connection's configuration settings.

**Is the report exporter a domain admin?**

The user exporting the report must be a domain admin. You can check the history and comment section at the bottom of the report to see who exported the report.

If your reports are being exported automatically by Concierge, the user listed as the Preferred Exporter under Settings > Workspaces > [workspaces name] > Connections > click **Configure** must be a domain admin as well. 

If the report exporter is not a domain admin, all company card expenses will export to the bank account set in Settings > Workspaces > [workspace name] > Connections > click **Configure** for non-reimbursable expenses. 

**Has the company card been mapped under the correct workspace?**

If you have multiple workspaces connected to Xero, each connected workspace will have a separate list of accounts to assign the card to. Unless you choose an account listed under the same workspace as the report you are exporting, expenses will export to the default bank account.

# Why do non-reimbursable expenses say 'Credit Card Misc,' instead of the merchant?

Where the merchant in Expensify is an exact match to a contact you have set up in Xero then exported credit card expenses will show the vendor name.  If not we use the the default name Expensify Credit Card Misc. This is done to prevent multiple variations of the same contact (e.g. Starbucks and Starbucks #1234 as is often seen in credit card statements) being created in Xero.

To change merchant names to match your vendor list in Xero, we recommend using our Expense Rules feature. More information on this can be found [here](https://community.expensify.com/discussion/5654/deep-dive-using-expense-rules-to-vendor-match-when-exporting-to-an-accounting-package/p1?new=1).
