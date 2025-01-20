---
title: QuickBooks Online Troubleshooting
description: A list of common QuickBooks Online errors and how to resolve them
---

Occasionally, you might run into errors when exporting reports or syncing QuickBooks Online with Expensify. Below, you'll find detailed instructions to help you troubleshoot and resolve the most common connection and export issues quickly.

# Issue: Report won’t automatically export to QuickBooks Online

If an error occurs during an automatic export to QuickBooks Online:
 
- You’ll receive an email detailing the error. 
- The error will appear in the related Workspace Chat, indicated by a red dot next to the report. 
- For auto-sync errors, a message will be posted in the related #admins room. The message contains a link to the workspace’s accounting settings where an explanation for the error appears next to the connection.

An error on a report will prevent it from automatically exporting. 

## How to resolve

Open the expense and make the required changes. Then an admin must manually export the report to QuickBooks Online by clicking Details > Export.

![Click the Export button found in the Details tab](https://help.expensify.com/assets/images/QBO_help_02.png){:width="100%"}

![Select QuickBooks Online in the Export tab](https://help.expensify.com/assets/images/QBO_help_03.png){:width="100%"}

# Issue: Unable to manually export a report

To export a report, it must be in the Approved, Closed, or Reimbursed state. If it is in the Open state, clicking “Export” will lead to an empty page, as the data is not yet available for export:

![If the Report is in the Open status, the Not Ready to Export message shows](https://help.expensify.com/assets/images/QBO_help_04.png){:width="100%"}

## How to resolve

Open the report and make the required changes:

1. If the report is in the Open status, ensure that it is submitted.
2. If the Report is in the Processing status, an admin or approver will need to approve it.

Once this is done, Workspace Admins must manually export the report to QuickBooks Online.

# Error: When exporting billable expenses, please make sure the account in QuickBooks Online has been marked as billable

**Why does this happen?**

This error occurs when the account applied as a category to the expense in Expensify is not marked as a billable type account.

## How to resolve
1. Log in to QuickBooks Online.
2. Click the Gear in the upper right-hand corner. 
3. Under Company Settings, click Expenses.
4. Enable the option “Make expenses and items billable.”
5. Click on the pencil icon on the right to check if you have "In multiple accounts" selected:
6. If "In multiple accounts" is selected, go to Chart of Accounts and click Edit for the account in question.
7. Check the billable option and select an income account within your Chart of Accounts.
8. Sync your QuickBooks Online connection in **Settings > Workspaces > Workspace Name > Accounting**.
9. Open the report and click on Details, then the Export button to re-export the data to QuickBooks Online.

# Error: Feature Not Included in Subscription

**Why does this happen?**

This error occurs when your version of QuickBooks Online doesn’t support the feature you are using in Expensify.

## How to resolve

Though you will see all of these features available in Expensify, you will receive an error trying to export to QuickBooks if you have a feature enabled that isn't available with your QuickBooks Online subscription.

**Here is a list of the features supported by each version:**
![QuickBooks Online - Subscription types]({{site.url}}/assets/images/QBO1.png){:width="100%"}

_Please note: Self-employed is not supported._

# Error: Expenses are not categorized with a QuickBooks Online account

**Why does this happen?**

QuickBooks Online requires all expenses exported from Expensify to use a category matching an account in your Chart of Accounts. If a category from another source is used, QuickBooks Online will reject the expense. This error occurs when an expense on the report has a category applied that is not valid in QuickBooks Online.

## How to resolve

1. Sync your QuickBooks Online connection in Expensify from **Settings > Workspaces > Workspace Name > Accounting**, and click the **Sync Now** button.
2. Review your expenses. If any appear with a red _Category no longer valid_ violation, recategorize the expense until all expenses are violation-free.
3. Click the **Details** tab, then the **Export** button to export the data to QuickBooks Online.
    - If you receive the same error, continue to the next step.
4. Note the categories used on the expenses and check the **Settings > Workspaces > Workspace Name > Categories** page to confirm the exact categories used on the report are enabled and connected to QuickBooks Online (you'll see a green QB icon next to all connected categories). 
5. Confirm the categories used on the expenses in the report match exactly the accounts in your QuickBooks Online chart of accounts.
6. If you make any changes in QuickBooks Online or in Expensify, always sync the connection and then try to export again. 

# Error: Error Creating Vendor

**Why does this happen?**

This error occurs when you have an Employee Record set up with the employee's name. This prevents the Expensify integration from automatically creating the Vendor Record with the same name since QuickBooks Online won't allow you to have an employee and vendor with the same name. 

## How to resolve

There are two different ways you can resolve this error.

**Option 1**:
1. Log into QuickBooks Online.
2. Access the Employee Records for your submitters. 
3. Edit the name to differentiate them from the name they have on their account in Expensify.
4. Sync your QuickBooks Online connection in **Settings > Workspaces > Workspace Name > Accounting**.
5. Open the report and click on the Details tab, then the Export button to export the data to QuickBooks Online.

**Option 2**:
1. Log into QuickBooks Online.
2. Manually create all of your Vendor Records, making sure that the email matches the email address associated with the user in Expensify.

With this option, we recommend disabling _Automatically Create Entities_ under **Settings > Workspaces > Workspace Name > Accounting > Configure > Advanced**. That way, you will receive the corresponding error messages if a vendor record doesn't exist.

# Error: When You Use Accounts Payable, You Must Choose a Vendor in the Name Field

**Why does this happen?**

This error occurs when you are exporting reimbursable expenses as Journal Entries against an A/P account and also use Employee Records in QuickBooks Online.

## How to resolve

There are three different ways you can resolve this error:
- **Option 1**: Under **Settings > Workspaces > Workspace Name > Accounting > Configure > Export tab**, select a different type of export for reimbursable expenses. 
- **Option 2**: Enable _Automatically Create Entities_ under **Settings > Workspaces > Workspace Name > Accounting > Configure > Advanced** to create vendor records automatically.
- **Option 3**: Manually create vendor records in QuickBooks Online for each employee.

# Error: Items marked as billable must have sales information checked

**Why does this happen?**

This error occurs when an Item category on an expense does not have sales information in QuickBooks Online.

## How to resolve

1. Log into QuickBooks Online.
2. Navigate to your items list.
3. Click **Edit** to the right of the item used on the report with the error. Here you will see an option to check either "Sales" or "Purchasing".
4. Check the option for **Sales**.
5. Select an income account.
6. Save your changes.
7. Sync your QuickBooks Online connection in **Settings > Workspaces > Workspace Name > Accounting**.
8. Open the report, click on Details, and then click the Export button to re-export the data to QuickBooks Online.

# Error: Couldn't Connect to QuickBooks Online

**Why does this happen?**

This error occurs when the QuickBooks Online credentials used to make the connection have changed. 

_Note: This error message can also show up as, "QuickBooks Reconnect error: OAuth Token rejected.”_

## How to resolve

1. Navigate to **Settings > Workspaces > Workspace Name > Accounting**.
2. Click the **Sync Now** button.
3. In the pop-up window, click **Reconnect** and enter your current QuickBooks Online credentials.

If you are connecting with new credentials, you will need to reconfigure your settings and re-select the categories and tags you want enabled. We recommend taking a screenshot of your configuration settings beforehand so that you can reset the connection with those settings.

# Error: Duplicate Document Number, This bill number has already been used.

**Why does this happen?**

This error happens when QuickBooks Online is set to flag duplicate document numbers.

## How to resolve

1. Log into QuickBooks Online.
2. Navigate to Settings > Advanced. 
3. Under the Other Preferences section, make sure "Warn if duplicate bill number is used" is set to "Off."
4. Sync your QuickBooks Online connection in **Settings > Workspaces > Workspace Name > Accounting**.
5. Open the report and click on Details, then the Export button to re-export the data to QuickBooks Online

# Error: The transaction needs to be in the same currency as the A/R and A/P accounts

**Why does this happen?**

This error occurs because the currency on the Vendor record in QuickBooks Online doesn't match the currency on the A/P account. 

## How to resolve

1. Log into QuickBooks Online.
2. Open the vendor record.
3. Update the record to use with the correct A/P account, currency, and email matching their Expensify email. 

_Note: You can find the correct Vendor record by exporting your QuickBooks Online vendor list to a spreadsheet (click the export icon on the right-hand side of the page), and searching for the email address of the person who submitted the report._

If you have multiple vendors with different currencies with the same email, Expensify is likely trying to export to the wrong one.

**In that case, run through the following steps**:
1. Try removing the email address from the vendor in QuickBooks Online that you aren't trying to export to. 
2. Sync your QuickBooks Online connection in **Settings > Workspaces > Workspace Name > Accounting**. 
3. Open the report and click on Details, then the Export button to re-export the data to QuickBooks Online.

**If this still fails, you'll need to confirm that the A/P account selected in Expensify is set to the correct currency for the export**:
1. Navigate to **Settings > Workspaces > Workspace Name > Accounting**.
2. Under the Exports tab check that both A/P accounts are the correct currency.


{% include faq-begin.md %}

# Why are company card expenses exported to the wrong account in QuickBooks Online?

Multiple factors could be causing your company card transactions to export to the wrong place in your accounting system, but the best place to start is always the same.

1. Confirm that the company cards have been mapped to the correct accounts in Settings > Domains > Company Cards > click the **Edit Export** button for the card to view the account.
2. Make sure the expenses in question have been imported from the company card. 
   - Only expenses with the Card+Lock icon next to them will export according to the mapping settings that you configure in the domain settings.

It’s important to note that expenses imported from a card linked at the individual account level, expenses created from a SmartScanned receipt, and manually created cash expenses will export to the default bank account selected in your accounting connection's configuration settings.

**Is the report exporter a domain admin?**

The user exporting the report must be a domain admin. You can check the history and comment section at the bottom of the report to see who exported the report:
- If your reports are being exported automatically by Concierge, the user listed as the Preferred Exporter under **Settings > Workspaces > Workspace Name > Accounting > Export** must also be a domain admin. 
- If the report exporter is not a domain admin, all company card expenses will be exported to the account set in **Settings > Workspaces > Workspace Name > Accounting > Export Company Card Expenses As**.

# How do I disconnect the QuickBooks Online connection?

You can disconnect QuickBooks Online from Expensify by running through the following steps:
1. Click your profile image or icon in the bottom left menu.
2. Scroll down and click **Workspaces** in the left menu. 
3. Select the workspace you want to disconnect from QuickBooks Online.
4. Click **Accounting** in the left menu.
5. Click the three-dot menu icon to the right of QuickBooks Online and select **Disconnect**.
6. Click **Disconnect** to confirm. 

Once you disconnect from QuickBooks, that will clear all of the previously imported options from Expensify.  

# Can I export negative expenses to QuickBooks Online?

Yes, in general, you can export negative expenses successfully to QuickBooks Online regardless of which export method you choose.

{% include faq-end.md %}
