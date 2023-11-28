---
title: QuickBooks Desktop
description: How to connect Expensify to QuickBooks Desktop and troubleshoot issues.
---
# Overview
QuickBooks Desktop is an accounting package developed by Intuit. It is designed for small and medium-sized businesses to help them manage their financial and accounting tasks. You can connect Expensify to QuickBooks Desktop to make expense management seamless.
To connect Expensify with QuickBooks Desktop, using Right Networks as your hosting platform is best. Right Networks is a cloud-based service we recommend for this integration. If you need a Right Networks account, complete [this form](https://info.rightnetworks.com/partner-expensify) and contact a Sales Consultant to start the process.

# How to connect to QuickBooks Desktop
Before you link your Expensify policy with QuickBooks Desktop, ensure you log in as an Admin in QuickBooks. Also, check that the company file you want to connect to is the only one open.

## Set up submitters in QuickBooks Desktop
For a seamless integration, here are the steps to follow:
* Make sure all report submitters are set up as Vendors in QuickBooks Desktop and their Expensify email is in the "Main Email" field of their Vendor record. You can do this in the vendor section of QuickBooks.
* If you want to export reports to your users' employee records instead of vendor records, select Check or Journal Entry as your reimbursable export option.
* To set up Expensify users as employees, activate QuickBooks Desktop Payroll. This module is necessary to access the Employee Profile tab, where you can enter the submitter's email addresses.
  
## Enable/install the Expensify Sync Manager
Navigate to **Settings** > **Policies** > **Group** > _[Policy Name]_ > **Connections**, select the Connect to QuickBooks Desktop radio button and click Connect to QuickBooks.

**Enable the Expensify Sync Manager in Right Networks (recommended)**
*Please note: Single-user mode in QuickBooks Desktop is required.* 
If you don't yet have an account with Right Networks, you must first contact Right Networks [here](https://info.rightnetworks.com/partner-expensify). You can enable the Expensify Sync Manager yourself from your Right Networks portal's **My Account** section or contact Right Networks for assistance. 

**OR, install the Expensify Sync Manager on Your Third-Party Remote Desktop.**
To download the Sync Manager to your desktop, you must contact your third-party remote desktop provider and request permission. They might have security restrictions, so it's best to communicate with them directly to avoid potential problems with the Sync Manager. Remember that the Sync Manager program file should be stored in the same location (i.e., the same drive) as your QuickBooks Desktop program.

## Complete the connection
1. Open QuickBooks and access your desired Company File using the QuickBooks Admin credentials. Admin credentials are necessary for creating the connection due to permission requirements, but you won't need to stay logged in as an admin for syncing or exporting.
2. Navigate to your Expensify policy settings by going to **Settings** > **Policies** > **Group** > _[Policy Name]_ > **Connections**. Copy the Token by selecting the copy icon.
3. While QuickBooks is still running, launch the Expensify Sync Manager. Paste your Token into the Sync Manager and click **Save**.
4. Once the Sync Manager status displays **Connected**, return to Expensify and click the *Continue* button.

## Allow access
1. Return to QuickBooks, and you'll encounter an **Application Certificate** screen. On the first page of the Certificate screen, click **Yes, always; allow access even if QuickBooks is not running** and then click **Continue**.
2. On the second page of the Certificate screen, choose the Admin user from the dropdown menu, and then click *Done* to complete this step. Note that selecting Admin here does not require you to be logged in as an admin to use this connection; it's simply selecting the appropriate permissions.
3. Head back to Expensify and patiently wait for the sync process to finish, then move on to the configuration.

# How to configure export settings for QuickBooks Desktop
To Configure Settings, go to **Settings** > **Policies** > **Group** > _[Policy Name]_ > **Connections** and click **Configure**.

## Preferred Exporter
This person is used in QuickBooks Desktop as the export user. They will also receive notifications for errors.

## Date
Choose either the report's submitted date, the report's exported date, or the date of the last expense on the report when exporting reports to QuickBooks Desktop.

## Use unique reference numbers
Enable this to allow use of a unique reference number for each transaction. Disable this to use the same Report ID for all expenses from a certain report.

## Reimbursable expenses
* **Vendor Bill (recommended):** A single itemized vendor bill for each Expensify report. An A/P account is required to export to a vendor bill.  
* **Check:** A single itemized check for each Expensify report.
* **Journal Entry:** A single itemized journal entry for each Expensify report.

## Non-reimbursable expenses
**Credit Card Expenses:**
* Each expense will appear as a separate credit card transaction.
* The posting date will match your credit card statement.
* To display the merchant name in the payee field in QuickBooks Desktop, ensure that a matching Vendor exists in QuickBooks. Expensify searches for an exact match during export. If no match is found, the payee is mapped to a **Credit Card Misc.** Vendor created by Expensify.
* If you're centrally managing company cards through Domain Control, you can export expenses from each card to a specific QuickBooks account (detailed instructions available).
  
**Debit Card Expenses:**
* Expenses export as individual itemized checks for each Expensify report.
* The check is written to the "vendor," which is the person who created or submitted the report in Expensify.

**Vendor Bill:**
* Each Expensify report results in a single itemized vendor bill.
* The bill is associated with the "vendor," which is the individual responsible for creating or submitting the report in Expensify.

# How to configure coding for QuickBooks Desktop
## Categories
Expensify's integration with QuickBooks brings in your Chart of Accounts as Categories in Expensify automatically. Here's how to manage them:
1. After connecting, go to **Settings** > **Policies** > **Group** > _[Policy Name]_ > **Categories** to view the accounts imported from QuickBooks Desktop.
2. You can use the enable/disable button to choose which Categories your employees can access. Additionally, you can set specific rules for each Category via the blue settings cog.
3. Expensify offers Auto-Categorization to automatically assign expenses to the appropriate expense categories.
4. If needed, you can edit the names of the imported Categories to simplify expense coding for your employees. Keep in mind that if you make changes to these accounts in QuickBooks Desktop, the category names in Expensify will update to match them during the next sync.
5. _**Important:**_ Each expense must have a category selected to export to QuickBooks Desktop. The selected category must be one imported from QuickBooks Desktop; you cannot manually create categories within Expensify policy settings.
## Classes
Classes can be imported from QuickBooks as either tags (line-item level) or report fields (header level).

## Customers/Projects
You can bring in Customers/Projects from QuickBooks into Expensify in two ways: as tags (at the line-item level) or as report fields (at the header level). If you're utilizing Billable Expenses in Expensify, here's what you need to know:
* Customers/Projects must be enabled if you're using Billable Expenses.
* Expenses marked as "Billable" need to be tagged with a Customer/Project to successfully export them to QuickBooks.

## Items 
Items can be imported from QuickBooks as categories alongside your expense accounts.

# FAQ
## How do I sync my connection?
1: Ensure that both the Expensify Sync Manager and QuickBooks Desktop are running.
2: On the Expensify website, navigate to **Settings** > **Policies** > **Group** > _[Policy Name]_ > **Connections** > **QuickBooks Desktop**, and click **Sync now**.
3: Wait for the syncing process to finish. Typically, this takes about 2-5 minutes, but it might take longer, depending on when you last synced and the size of your QuickBooks company file. The page will refresh automatically once syncing is complete.

We recommend syncing at least once a week or whenever you make changes in QuickBooks Desktop that could impact how your reports export from Expensify. Changes could include adjustments to your Chart of Accounts, Vendors, Employees, Customers/Jobs, or Items. Remember, both the Sync Manager and QuickBooks Desktop need to be running for syncing or exporting to work.

## Can I export negative expenses?
Generally, you can export negative expenses to QuickBooks Desktop successfully, regardless of your option. However, please keep in mind that if you have *Check* selected as your export option, the report's total cannot be negative.

## How does multi-currency work with QuickBooks Desktop?
When using QuickBooks Desktop Multi-Currency, there are some limitations to consider based on your export options:
1. **Vendor Bills and Checks:** The currency of the vendor and the currency of the account must match, but they do not have to be in the home currency.
2. **Credit Card:** If an expense doesn't match an existing vendor in QuickBooks, it exports to the **Credit Card Misc.** vendor created by Expensify. When exporting a report in a currency other than your home currency, the transaction will be created under the vendor's currency with a 1:1 conversion. For example, a transaction in Expensify for $50 CAD will appear in QuickBooks as $50 USD.
3. **Journal Entries:** Multi-currency exports will fail because the account currency must match both the vendor currency and the home currency.

# Sync and export errors
## Error: No Vendor Found For Email in QuickBooks
To address this issue, ensure that each submitter's email is saved as the **Main Email** in their Vendor record within QuickBooks Desktop. Here's how to resolve it:
1. Go to your Vendor section in QuickBooks.
2. Verify that the email mentioned in the error matches the **Main Email** field in the respective vendor's record. It's important to note that this comparison is case-sensitive, so ensure that capitalization matches as well.
3. If you prefer to export reports to your users' employee records instead of their vendor records, select either **Check** or **Journal Entry** as your reimbursable export option. If you are setting up Expensify users as employees, activate QuickBooks Desktop Payroll to access the Employee Profile tab where submitter email addresses need to be entered.
4. Once you've added the correct email to the vendor record, save this change, and then sync your policy before attempting to export the report again.

## Error: Do Not Have Permission to Access Company Data File
To resolve this error, follow these steps:
1. Log into QuickBooks Desktop as an Admin in single-user mode.
2. Go to **Edit** > **Preferences** > **Integrated Applications** > **Company Preferences**.
3. Select the Expensify Sync Manager and click on **Properties**.
4. Ensure that **Allow this application to login automatically** is checked, and then click **OK**. Close all windows within QuickBooks.
5. If you still encounter the error after following the above steps, go to **Edit** > **Preferences** > **Integrated Applications** > **Company Preferences**, and remove the Expensify Sync Manager from the list.
6. Next, attempt to sync your policy again in Expensify. You'll be prompted to re-authorize the connection in QuickBooks.
7. Click **Yes, always; allow access even if QuickBooks is not running.**
8. From the dropdown, select the Admin user, and then click **Continue**. Note that selecting **Admin** here doesn't mean you always have to be logged in as an admin to use the connection; it's just required for setting up the connection.
9. Click **Done** on the pop-up window and return to Expensify, where your policy should complete the syncing process.

## Error: The Wrong QuickBooks Company is Open.
This error suggests that the wrong company file is open in QuickBooks Desktop. To resolve this issue, follow these steps:
1. First, go through the general troubleshooting steps as outlined.
2. If you can confirm that the incorrect company file is open in QuickBooks, go to QuickBooks and select **File** > **Open or Restore Company** > _[Company Name]_ to open the correct company file. After doing this, try syncing your policy again.
3. If the correct company file is open, but you're still encountering the error, completely close QuickBooks Desktop, reopen the desired company file and then attempt to sync again.
4. If the error persists, log into QuickBooks as an admin in single-user mode. Then, go to **Edit** > **Preferences** > **Integrated Applications** > **Company Preferences** and remove the Expensify Sync Manager from the list.
5. Next, try syncing your policy again in Expensify. You'll be prompted to re-authorize the connection in QuickBooks, allowing you to sync successfully.
6. If the error continues even after trying the steps above, double-check that the token you see in the Sync Manager matches the token in your connection settings.

## Error: The Expensify Sync Manager Could Not Be Reached.
To resolve this error, follow these steps:
*Note: You must be in single-user mode to sync.*

1. Ensure that both the Sync Manager and QuickBooks Desktop are running.
2. Confirm that the Sync Manager is installed in the correct location. It should be in the same location as your QuickBooks application. If QuickBooks is on your local desktop, the Sync Manager should be there, too. If QuickBooks is on a remote server, install the Sync Manager there.
Verify that the Sync Manager's status is **Connected**.
3. If the Sync Manager status is already **Connected**, click **Edit** and then *Save* to refresh the connection. Afterwards, try syncing your policy again.
4. If the error persists, double-check that the token you see in the Sync Manager matches the token in your connection settings.
