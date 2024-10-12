---
title: Quickbooks Online Troubleshooting
description: Quickbooks Online Troubleshooting
---

# ExpensiError QBO022: When exporting billable expenses, please make sure the account in QuickBooks Online has been marked as billable.

**Why does this happen?**

This error occurs when the account applied as a category to the expense in Expensify is not marked as as a billable type account.

## How to fix it

1. Log in to QuickBooks Online.
2. Click the Gear in the upper right-hand corner. 
3. Under Company Settings click Expenses.
4. Enable the option “Make expenses and items billable”
5. Click on the pencil icon on the right to check if you have "In multiple accounts" selected:
6. If "In multiple accounts" is selected, go to Chart of Accounts and click Edit for the account in question.
7. Check the billable option and select an income account within your chart of accounts
8. Sync your QuickBooks Online connection in Settings > Workspaces > [workspace name] > Connections.
9. Open the report and click the Export to button and then the QuickBooks Online option.

# ExpensiError QBO046: Feature Not Included in Subscription

**Why does this happen?**

This error occurs when your version of QuickBooks Online doesn’t support the feature you are using in Expensify.

## How to fix it

Though you will see all of these features available in Expensify, you will receive an error trying to export to QuickBooks if you have a feature enabled that isn't available with your QuickBooks Online subscription.

**Here is a list of the features supported by each version:**
_Please note: Self Employed is not supported:_

![QuickBooks Online - Subscription types]({{site.url}}/assets/images/QBO1.png){:width="100%"}

# ExpensiError QBO056: Expenses are not categorized with a QuickBooks Online account

**Why does this happen?**

QuickBooks Online requires all expenses exported from Expensify to use a category matching an account in your chart of accounts. If a category from another source is used, QuickBooks Online will reject the expense. This error occurs when an expense on the report has a category applied that is not valid in QuickBooks Online.

## How to fix it

1. Sync your QuickBooks Online connection in Expensify from Settings > Workspaces > [workspace name] > Connections, and click the **Sync Now** button.
2. Review the expenses on the report. If any appear with a red _Category no longer valid_ violation, recategorize the expense until all expenses are violation-free.
3. Click the **Export t**o button and then the **QuickBooks Online** option.
    - If you receive the same error, continue.
4. Note the categories used on the expenses and check the Settings > Workspaces > [workspace name] > Categories page to confirm the exact categories used on the report are enabled and connected to QuickBooks Online (you'll see a green QB icon next to all connected categories). 
5. Confirm the categories used on the expenses in the report match exactly the accounts in your QuickBooks Online chart of accounts.
6. If you make any changes in QuickBooks Online or in Expensify, always sync the connection and then try to export again. 

# ExpensiError QBO088: Error Creating Vendor

**Why does this happen?**

This error occurs when you have an Employee Record set up with the employee's name. This prevents the Expensify integration from automatically creating the Vendor Record with the same name since QuickBooks Online won't allow you to have an employee and vendor with the same name. 

## How to fix it

There are two different ways you can resolve this error.

**Option 1**:

1. Log into QuickBooks Online.
2. Access the Employee Records for your submitters. 
3. Edit the name to differentiate them from the name they have on their account in Expensify.
4. Sync your QuickBooks Online connection in Settings > Workspaces > [workspace name] > Connections.
5. Open the report and click the Export to button and then the QuickBooks Online option.

**Option 2**:
1. Log into QuickBooks Online.
2. Manually create all of your Vendor Records, making sure that the email matches the email address associated with the user in Expensify.
    - In this case, we recommend disabling _Automatically Create Entities_ under Settings > Workspaces > [workspace name] > Connections > Configure > Advanced, so that you will receive the correct error messages when a vendor record doesn't exist.

# ExpensiError QBO097: When You Use Accounts Payable, You Must Choose a Vendor in the Name Field

**Why does this happen?**

This error occurs when you are exporting reimbursable expenses as Journal Entries against an A/P account and also use Employee Records in QuickBooks Online.

## How to fix it

There are three different ways you can resolve this error.
- Select a different type of export for reimbursable expenses under Settings > Workspaces > [worksapce name] > Connections > Configure > Export tab. 
- Enable _Automatically Create Entities_ under Settings > Workspaces > [workspace name] > Connections > Configure > Advanced to create vendor records automatically.
- Manually create vendor records in QuickBooks Online for each employee.

# ExpensiError QBO099: Items marked as billable must have sales information checked

**Why does this happen?**

This error occurs when an Item category on an expense does not have sales information in QuickBooks Online.

## How to fix it

1. Log into QuickBooks Online.
2. Navigate to your items list.
3. Click **Edit** to the right of the item used on the report with the error. Here you will see an option to check either "Sales" or "Purchasing".
4. Check the option for **Sales**.
5. Select an income account.
6. Save your changes.
7. Sync your QuickBooks Online connection in Settings > Workspaces > [workspace name] > Connections.
8. Open the report and click the **Export to** button and then the **QuickBooks Online** option.


# ExpensiError QBO193: Couldn't Connect to QuickBooks Online

**Why does this happen?**

This error occurs when the QuickBooks Online credentials used to make the connection have changed. 

_Note: This error message can also show up as, "QuickBooks Reconnect error: OAuth Token rejected.”_

## How to fix it

1. Navigate to Settings > Workspaces > Groups > [workspace name] > Connections.
2. Click the **Sync Now** button.
3. In the pop-up window, click **Reconnect** and enter your current QuickBooks Online credentials.

Note: If you are connecting with new credentials, you will need to reconfigure your settings and re-select the categories and tags you want enabled. We recommend taking a screenshot of your configuration settings beforehand so that you can reset the connection with those settings.

# ExpensiError QBO077: Duplicate Document Number, This bill number has already been used.

**Why does this happen?**

This error occurs when settings in QuickBooks Online are enabled to warn of duplicate document numbers.

## How to fix it

1. Log into QuickBooks Online.
2. Navigate to Settings > Advanced. 
3. Under the Other Preferences section, make sure "Warn if duplicate bill number is used" is set to "Off"
4. Sync your QuickBooks Online connection in Settings > Workspaces > [workspace name] > Connections.
5. Open the report and click the **Export to** button and then the **QuickBooks Online** option.

# Export error: QuickBooks Online: The transaction needs to be in the same currency as the A/R and A/P accounts

**Why does this happen?**

This error occurs because the currency on the Vendor record in QuickBooks Online doesn't match the currency on the A/P account. 

## How to fix it

1. Log into QuickBooks Online.
2. Open the vendor record.
3. Update the record to use with the correct A/P account, currency, and email matching their Expensify email. 
You can find the correct Vendor record by exporting your QuickBooks Online vendor list to a spreadsheet (click the export icon on the right-hand side of the page), and search for the email address of the person who submitted the report.

If you have multiple Vendors with different currencies with the same email, Expensify is likely trying to export to the wrong one.

1. Try removing the email address from the vendor in QuickBooks Online that you aren't trying to export to. 
2. Sync your QuickBooks Online connection in Settings > Workspaces > [workspace name] > Connections. 
3. Open the report and click the **Export to** button and then the **QuickBooks Online** option.

If this still fails, you'll need to confirm that the A/P account selected in Expensify is set to the correct currency for the export. 

1. Navigate to Settings > Workspaces > [workspace name] > Connections.
2. Under the Exports tab check that both A/P accounts are the correct currency.

# Why are company card expenses exported to the wrong account in QuickBooks Online?

Multiple factors could be causing your company card transactions to export to the wrong place in your accounting system, but the best place to start is always the same.

1. First, confirm that the company cards have been mapped to the correct accounts in Settings > Domains > Company Cards > click the **Edit Export button** for the card to view the account.
2. Next, confirm the expenses in question have been imported from the company card. 
   - Only expenses with the Card+Lock icon next to them will export according to the mapping settings that you configure in the domain settings.

It’s important to note that expenses imported from a card linked at the individual account level, expenses created from a SmartScanned receipt, and manually created cash expenses will export to the default bank account selected in your connection's configuration settings.

**Is the report exporter a domain admin?**

The user exporting the report must be a domain admin. You can check the history and comment section at the bottom of the report to see who exported the report.

If your reports are being exported automatically by Concierge, the user listed as the Preferred Exporter under Settings > Workspaces > [workspace name] > Connections > click **Configure** must also be a domain admin. 

If the report exporter is not a domain admin, all company card expenses will export to the bank account set in Settings > Workspaces > [workspace name] > Connections > click **Configure** for non-reimbursable expenses. 

**Has the company card been mapped under the correct workspace?**

If you have multiple workspaces connected to QuickBooks Online, each connected workspace will have a separate list of accounts to assign the card to. Unless you choose an account listed under the same workspace as the report you are exporting, expenses will export to the default bank account.

# Can I export negative expenses to QuickBooks Online?

In general, you can export negative expenses successfully to QBO regardless of which export method you choose.

The one thing to keep in mind is that if you have Check selected as your export option, the total of the report can not be negative.
