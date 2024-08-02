---
title: Netsuite Troubleshooting
description: Troubleshoot common NetSuite sync and export errors. 
---

# Overview of NetSuite Troubleshooting
Synchronizing and exporting data between Expensify and NetSuite can streamline your financial processes, but occasionally, users may encounter errors that prevent a smooth integration. These errors often arise from discrepancies in settings, missing data, or configuration issues within NetSuite or Expensify. 

This troubleshooting guide aims to help you identify and resolve common sync and export errors, ensuring a seamless connection between your financial management systems. By following the step-by-step solutions provided for each specific error, you can quickly address issues and maintain accurate and efficient expense reporting and data management.

# ExpensiError NS0005: Please enter value(s) for Department, Location or Class

This error occurs when the classification (like Location) is required at the header level of your transaction form in NetSuite.

For expense reports and journal entries, NetSuite uses classifications from the employee record default. Expensify only exports this information at the line item level.

For vendor bills, these classifications can't be mandatory because we use the vendor record instead of the employee record, and vendor records don’t have default classifications.

**Vendor Bills:**
When exporting as a Vendor Bill, we pull from the vendor record, not the employee. Therefore, employee defaults don’t apply at the header ("main") level. This error appears if your NetSuite transaction form requires those fields.

## How to Fix ExpensiError NS0005
1. Go to **Customization > Forms > Transaction Forms**.
2. Click **"Edit"** on your preferred vendor bill form.
3. Go to **Screen Fields > Main**.
4. Uncheck both **"Show"** and **"Mandatory"** for the listed fields in your error message.
5. Sync the workspace connection in Expensify (**Settings > Workspaces > Workspace Name > Connections > Sync**).
6. Attempt the export again.

**Journal Entries and Expense Reports:**
If you see this error when exporting a Journal Entry or Expense Report, it might be because the report submitter doesn’t have default settings for Departments, Classes, or Locations.

**To fix this:**
1. Go to **Lists > Employees** in NetSuite.
2. Click **"Edit"** next to the employee's name who submitted the report.
3. Scroll down to the **Classification** section.
4. Select a default **Department**, **Class**, and **Location** for the employee.
5. Click **Save**.
6. Sync your NetSuite connection in Expensify.


# ExpensiError NS0012: Currency Does Not Exist In NetSuite

**Scenario One:** When dealing with foreign transactions, Expensify sends the conversion rate and currency of the original expense to NetSuite. If the currency isn't listed in your NetSuite subsidiary, you'll see an error message saying the currency does not exist in NetSuite.

**To fix this:**
1. Ensure the currency in Expensify matches what's in your NetSuite subsidiary.
2. If you see an error saying 'The currency X does not exist in NetSuite', re-sync your connection to NetSuite through the workspace admin section in Expensify.
3. Try exporting again.

**Scenario Two:** This error can happen if you’re using a non-OneWorld NetSuite instance and exporting a currency other than EUR, GBP, USD, or CAD.

**To fix this:**
1. Head to NetSuite.
2. Go to **Setup > Enable Features**.
3. Check the **Multiple Currencies** box.

Once you've done this, you can add the offending currency by searching **New Currencies** in the NetSuite global search.


# ExpensiError NS0021: Invalid tax code reference key

This error usually indicates an issue with the Tax Group settings in NetSuite, which can arise from several sources.

#### Tax Group to Tax Code Mapping
If a Tax Code on Sales Transactions is mapped to a Tax Group, an error will occur. To fix this, the Tax Code must be mapped to a Tax Code on Purchase Transactions instead.

To verify if a Tax Code is for Sales or Purchase transactions, view the relevant Tax Code(s).

**For Australian Taxes:**
Ensure your Tax Groups are mapped correctly:
- **GST 10%** to **NCT-AU** (not the Sales Transaction Tax Code TS-AU)
- **No GST 0%** to **NCF-AU** (not the Sales Transaction Tax Code TFS-AU)

#### Tax Group Type
Tax Groups can represent different types of taxes. For compatibility with Expensify, ensure the tax type is set to GST/VAT.

#### Enable Tax Groups
Some subsidiaries require you to enable Tax Groups. Go to **Set Up Taxes** for the subsidiary's country and ensure the Tax Code lists include both Tax Codes and Tax Groups.


# ExpensiError NS0023: Employee Does Not Exist in NetSuite (Invalid Employee)

This can happen if the employee’s subsidiary in NetSuite doesn’t match what’s listed in Expensify.

## How to Fix ExpensiError NS0023
1. **Check the Employee's Subsidiary**
   - Go to the employee record in NetSuite.
   - Confirm the employee's subsidiary matches what’s listed as the subsidiary at the workspace level.
   - To find this in Expensify navigate to **Settings > Workspaces > Workspace Name > Connections > Configure**.
   - If the subsidiaries don’t match, update the subsidiary in Expensify to match what’s listed in NetSuite.
   - Sync the NetSuite connection in Expensify.
2. **Verify Access Restrictions:**
   - Go to **Lists > Employees > Employees > [Select Employee] > Edit > Access**.
   - Uncheck **Restrict Access to Expensify**.
3. **Additional Checks:**
    - Ensure the email on the employee record in NetSuite matches the email address of the report submitter in Expensify.
    - In NetSuite, make sure the employee's hire date is in the past and/or the termination date is in the future.
4. **Currency Match for Journal Entries:**
    - If exporting as Journal Entries, ensure the currency for the NetSuite employee record, NetSuite subsidiary, and Expensify policy all match.
    - In NetSuite, go to the **Human Resources** tab > **Expense Report Currencies**, and add the subsidiary/policy currency if necessary.


# ExpensiError NS0024: Invalid Customer or Project Tag

Employees must be listed as a resource on the customer/project in NetSuite to be able to apply it to an expense. If that isn’t set up in NetSuite, you can run into this error.

## How to Fix ExpensiError NS0024

1. **Ensure Employee Access:**
   - In NetSuite, go to **Lists > Relationships > Customer/Projects**.
   - Click **Edit** next to the desired Customer/Project.
   - Click **Resources**, select the Employee from the drop-down menu, click **Add**, then **Save** your changes.
2. **Sync with Expensify:**
   - In Expensify, go to **Settings > Workspaces > [Workspace Name] > NetSuite > Sync Now**.
   - Attempt to export again.
3. **Remove Restriction for a Specific Customer/Project (Optional):**
   - In NetSuite, edit the customer/project.
   - Go to **Preferences**, then uncheck **Limit time and expenses to resources**.
4. **Remove Restrictions for All Projects:**
   - In NetSuite, go to **Setup > Accounting > Accounting Preferences > Time & Expenses**.
   - Uncheck **Show Projects Only For Time And Expense Entry**.
5. **Enable Cross-Subsidiary Customers/Projects in Expensify (Optional):**
   - Go to **Settings > Workspaces > Group > [Workspace Name] > Connections > NetSuite > Configure > Advanced**.
   - Enable **Cross-Subsidiary Customers/Projects** to remove the requirement for the employee's subsidiary and the customer's subsidiary to match.


# ExpensiError NS0034: This record already exists

This error occurs when the report in question was already exported to NetSuite. 

## How to fix ExpensiError NS0034
1. **Check for the existing Report in NetSuite:**
    - If the report already exists in NetSuite but has been edited in Expensify, you need to delete the report in NetSuite.
2. **Find the Report ID in Expensify:**
    - Locate the Report ID in Expensify under the Details section in the top right corner of the report.
3. **Search for the Report ID in NetSuite:**
    - Use the Global Search Box in NetSuite to find the report using the Report ID.
4. **Delete the Report in NetSuite:**
    - In NetSuite, click _**Edit > Actions > Delete**_ to remove the report.
5. **Re-export the Report from Expensify to NetSuite:**
    - After deleting the report in NetSuite, re-export it from Expensify to NetSuite.


# ExpensiError NS0046: Billable Expenses Not Coded with a NetSuite Customer or Billable Project

NetSuite requires billable expenses to be assigned to a Customer or a Project that is configured as billable to a Customer. If this is not set up correctly in NetSuite, this error can occur.

## How to Fix ExpensiError NS0046
1. **Access the Report in Expensify:**
    - Go to the Expensify website and open the report.
2. Click the **Details** icon in the upper-left corner of the report.
3. Select the following options (this allows you to easily see which expenses are flagged as billable but don't have a valid customer tagged):
    - **View:** Details
    - **Group by:** Tag
    - **Split report by:** Billable
4. **Check Billable Expenses:**
    - Click on each expense in the Billable section of the report.
    - Ensure that the Customer or Project tag field is present.
    - Verify that there are no violations and that a value has been applied to the field.
5. Make any necessary adjustments to the billable expenses and try the export again. 


# ExpensiError NS0059: A credit card account has not been selected for corporate card expenses.

**To resolve this error:**
1. Log into NetSuite as an admin.
2. Type "Page: Subsidiaries" in the global search box and select the subsidiary you will export to.
3. Under the Preferences tab of the subsidiary, locate the field: Default Account for Corporate Card Expenses.

**If you want to assign different cards to different employees:**
1. Go to each employee record in NetSuite.
2. Under the Human Resources > Expense and Purchasing section, find the field: Default Account for Corporate Card Expenses.

**For reports containing cash expenses that are not marked as Reimbursable:**
1. Have the approver reject the report.
2. Mark the expenses as Reimbursable.
3. Re-submit the report, approve it, and try to export again.

For accounts without subsidiaries (non-OneWorld accounts), the default field is in your accounting preferences.


# ExpensiError NS0085: Expense Does Not Have Appropriate Permissions for Settings an Exchange Rate in NetSuite

This error occurs when the exchange rate settings in NetSuite aren't updated correctly. 

## How to Fix ExpensiError NS0085
1. In NetSuite, go to Customization > Forms > Transaction Forms.
2. Search for the form type that the report is being exported as (Expense Report, Journal Entry, or Vendor Bill) and click Edit next to the form that has the Preferred checkbox checked.
    - **For Expense Reports:**
        - Go to Screen Fields > Expenses (the Expenses tab farthest to the right).
        - Ensure the Exchange Rate field under the Description column has the Show checkbox checked.
    - **For Vendor Bills:**
        - Go to Screen Fields > Main.
        - Ensure the Exchange Rate field under the Description column has the Show checkbox checked.
    - **For Journal Entries:**
        - Go to Screen Fields > Lines.
        - Ensure the Exchange Rate field under the Description column has the Show checkbox checked.
        - Go to Screen Fields > Main and ensure the Show checkbox is checked in the Exchange Rate field under the Description column.
3. Go to **Settings > Workspaces > Group > [Workspace Name] > Connections**.
4. Click Sync Now to sync the NetSuite connection.
5. Export the report(s) again.


# ExpensiError NS0079: The Transaction Date is Not Within the Date Range of Your Accounting Period

The transaction date you specified is not within the date range of your accounting period. When the posting period settings in NetSuite are not configured to allow a transaction date outside the posting period, you can't export a report to the next open period, which is why you’ll run into this error. 

## How to Fix ExpensiError NS0079
1. In NetSuite, navigate to Setup > Accounting > Accounting Preferences.
2. Under the General Ledger section, ensure the field Allow Transaction Date Outside of the Posting Period is set to Warn.
3. Then, choose whether to export your reports to the First Open Period or the Current Period.

Additionally, ensure the Export to Next Open Period feature is enabled within Expensify:
1. Navigate to **Settings > Workspaces > Group > [Workspace Name] > Connections > Configure**.
2. Open the **Advanced tab**.
3. Confirm that the setting for **Export to Next Open Period** is enabled.

If any configuration settings are updated on the NetSuite connection, be sure to sync the connection before trying the export again. 


# ExpensiError NS0055: The Vendor You are Trying to Export to Does Not Have Access to the Currency X

This error occurs when a vendor tied to a report in Expensify does not have access to a currency on the report in NetSuite. The vendor used in NetSuite depends on the type of expenses on the report you're exporting.
- For **reimbursable** (out-of-pocket) expenses, this is the report's submitter (the employee who submitted the report).
- For **non-reimbursable** (e.g., company card) expenses, this is the default vendor set via Settings > Workspaces > Group > [Workspace Name] > Connections > NetSuite > Configure.

## How to Fix ExpensiError NS0055
To fix this, the vendor needs to be given access to the applicable currency:
1. In NetSuite, navigate to Lists > Relationships > Vendors to access the list of Vendors.
2. Click Edit next to the Vendor tied to the report:
    - For reimbursable (out-of-pocket) expenses, this is the report's submitter.
    - For non-reimbursable (e.g., company card) expenses, this is the default vendor set via **Settings > Workspaces > Group > [Workspace Name] > Connections > NetSuite > Configure**.
3. Navigate to the Financial tab.
4. Scroll down to the Currencies section and add all the currencies that are on the report you are trying to export.
5. Click Save.


# ExpensiError NS0068: You do not have permission to set a value for element - “Created From”

**To resolve this error:**
1. In NetSuite, go to Customization > Forms > Transaction Forms.
2. Search for the form type that the report is being exported as in NetSuite (Expense Report, Journal Entry, Vendor Bill, or if the report total is negative, Vendor Credit).
3. Click Edit next to the form that has the Preferred checkbox checked.
4. Go to Screen Fields > Main and ensure the field Created From has the Show checkbox checked.
5. Sync the NetSuite connection under **Settings > Workspaces > Group > [Workspace Name] > Connections > Sync Now**.
6. Export the report(s) again.

#### For reports with Expensify Card expenses
Expensify Card expenses export as Journal Entries. If you encounter this error when exporting a report with Expensify Card non-reimbursable expenses, ensure the field Created From has the Show checkbox checked for Journal Entries in NetSuite.


# ExpensiError NS0037: You do not have permission to set a value for element - “Receipt URL”

**To resolve this error:**
1. In NetSuite, go to Customization > Forms > Transaction Forms.
2. Search for the form type that the report is being exported as in NetSuite (Expense Report, Journal Entry, or Vendor Bill).
3. Click Edit next to the form that has the Preferred checkbox checked.
    - If the report is being exported as an Expense Report:
        - Go to Screen Fields > Expenses (the Expenses tab farthest to the right).
        - Ensure the field ReceiptURL has the Show checkbox checked.
    - If the report is being exported as a Journal Entry:
        - Go to Screen Fields > Lines.
        - Ensure the field ReceiptURL has the Show checkbox checked.
    - If the report is being exported as a Vendor Bill:
        - Go to Screen Fields > Main.
        - Ensure the field ReceiptURL has the Show checkbox checked.
4. Click Sync Now to sync the NetSuite connection at **Settings > Workspaces > Group > Workspace Name > Connections**.
5. Export the report(s) again.


# ExpensiError NS0042: Error creating vendor - this entity already exists

This error occurs when a vendor record already exists in NetSuite, but Expensify is still attempting to create a new one. This typically means that Expensify cannot find the existing vendor during export.
- The vendor record already exists in NetSuite, but there may be discrepancies preventing Expensify from recognizing it.
- The email on the NetSuite vendor record does not match the email of the report submitter in Expensify.
- The vendor record might not be associated with the correct subsidiary in NetSuite.

## How to Fix ExpensiError NS0042

Follow these steps to resolve the issue:
1. **Check Email Matching:**
    - Ensure the email on the NetSuite vendor record matches the email of the report submitter in Expensify.
2. **Check Subsidiary Association:**
    - Ensure the vendor record is associated with the same subsidiary selected in the connection configurations
    - You can review this under **Settings > Workspaces > Group > Workspace Name > Connections > Configure**.
3. **Automatic Vendor Creation:**
    - If you want Expensify to automatically create vendors, ensure the "Automatically Create Vendor" option is enabled under **Settings > Workspaces > Group > Workspace Name > Connections > Advanced**.

**Options to Resolve the Error:**
- **Edit the Existing Vendor:** Update the existing vendor record in NetSuite to match the report submitter's email and name.
- **Delete the Existing Vendor:** If appropriate, delete the existing vendor record in NetSuite to allow Expensify to create a new one.
- **Add Email to Existing Vendor:** Add the email address of the report’s submitter to the existing vendor record in NetSuite.

**Final Steps:**
1. After making the necessary changes, head to **Settings > Workspaces > Group > Workspace Name > Connections** in Expensify.
2. Sync the NetSuite workspace connection.
3. Retry exporting the report.


# ExpensiError NS0109: Failed to login to NetSuite, please verify your credentials

This error indicates a problem with the tokens created for the connection between Expensify and NetSuite. The error message will say, "Login Error. Please check your credentials."

## How to Fix ExpensiError NS0109
1. Review the [Connect to NetSuite](https://help.expensify.com/articles/expensify-classic/integrations/accounting-integrations/NetSuite) guide and follow steps 1 and 2 exactly as outlined.
2. If you're using an existing token and encounter a problem, you may need to create a new token.


# ExpensiError NS0123 Login Error: Please make sure that the Expensify integration is enabled

This error indicates that the Expensify integration is not enabled in NetSuite.

## How to Fix ExpensiError NS0123
1. **Enable the Expensify Integration:**
   - In NetSuite, navigate to Setup > Integrations > Manage Integrations.
   - Ensure that the Expensify Integration is listed and that the State is Enabled.
2. **If you can't find the Expensify integration:**
   - Click "Show Inactives" to see if Expensify is listed as inactive.
   - If Expensify is listed, update its state to Enabled.

Once the Expensify integration is enabled, try syncing the NetSuite connection again.


# ExpensiError NS0045: Expenses Not Categorized with a NetSuite Account

**To resolve this error:**
1. Log into NetSuite
2. Do a global search for the missing record.
   - Ensure the expense category is active and correctly named.
   - Ensure the category is associated with the correct subsidiary that the Expensify workspace is linked to.
3. In Expensify, head to **Settings > Workspaces > Groups > Workspace Name > Connections** and click **Sync Now** on the NetSuite connection to resync the workspace.
4. Go back to the report, click on the offending expense(s), and re-apply the category in question.
5. Export the report again.


# ExpensiError NS0061: Please Enter Value(s) for: Tax Code

This error typically occurs when attempting to export expense reports to a Canadian subsidiary in NetSuite for the first time and/or if your subsidiary in NetSuite has Tax enabled. 

## How to Fix ExpensiError NS0061
To fix this, you need to enable Tax in the NetSuite configuration settings. 

1. Go to **Settings > Workspaces > Group > Workspace Name > Connections > NetSuite**.
   - Be sure to select posting accounts for GST/HST and PST if you plan on exporting any expenses with taxes on them to Journal Entries.
2. Click **Save**
3. Click **Sync Now** to sync the connection

**Note:** Expenses created before Tax was enabled might need to have the newly imported taxes applied to them retroactively to be exported.


# Error creating employee: Your current role does not have permission to access this record.

This error indicates that the credentials or role used to connect NetSuite to Expensify do not have the necessary permissions within NetSuite. You can find setup instructions for configuring permissions in NetSuite [here](https://help.expensify.com/articles/expensify-classic/connections/netsuite/Connect-To-NetSuite#step-3-add-expensify-integration-role-to-a-user).

**To resolve this error:**
1. If permissions are configured correctly, confirm the report submitter exists in the subsidiary set on the workspace and that their Expensify email address matches the email on the NetSuite Employee Record.
2. If the above is true, try toggling off "Automatically create vendors/employees" under the Advanced tab of the NetSuite configuration window.
   - Head to **Settings > Workspaces > Group > Workspace Name > Connections > NetSuite > Configure**
   - Click on the **Advanced** tab
   - Disable **Automatically create vendors/employees**
3. Sync the NetSuite connection in Expensify
4. Export the report again.

# Elimination Settings for X Do Not Match

This error occurs when an Intercompany Payable account is set as the default in the Default Payable Account field in the NetSuite subsidiary preferences, and the Accounting Approval option is enabled for Expense Reports.

**To resolve this error:**
Set the Default Payable Account for Expense Reports on each subsidiary in NetSuite to ensure the correct payable account is active.
1. Navigate to Subsidiaries:
   - Go to Setup > Company > Subsidiaries.
2. Edit Subsidiary Preferences:
    - Click Edit for the desired subsidiary.
    - Go to the Preferences tab.
3. Set Default Payable Account:
    - Choose the preferred account for Default Payable Account for Expense Reports.

Repeat these steps for each subsidiary to ensure the settings are correct, and then sync Expensify to NetSuite to update the connection.

# Why are reports exporting as `Accounting Approved` instead of `Paid in Full`?

**This can occur for two reasons:**
- Missing Locations, Classes, or Departments in the Bill Payment Form
- Incorrect Settings in Expensify Workspace Configuration

## Missing Locations, Classes, or Departments in Bill Payment Form

If locations, classes, or departments are required in your accounting classifications but are not marked as 'Show' on the preferred bill payment form, this error can occur, and you will need to update the bill payment form in NetSuite:
1. Go to Customization > Forms > Transaction Forms.
2. Find your preferred (checkmarked) Bill Payment form.
3. Click Edit or Customize.
4. Under the Screen Fields > Main tab, check 'Show' near the department, class, and location options.

## Incorrect Settings in Expensify Workspace Configuration

To fix this, you'll want to confirm the NetSuite connection settings are set up correctly in Expensify:
1. Head to **Settings > Workspaces > Group > Workspace Name > Connections > NetSuite > Configure > Advanced**
2. **Ensure the following settings are correct:**
   - Sync Reimbursed Reports: Enabled and payment account chosen.
   - Journal Entry Approval Level: Approved for Posting.
   - A/P Approval Account: This must match the current account being used for bill payment.
3. **Verify A/P Approval Account:**
   - To ensure the A/P Approval Account matches the account in NetSuite:
        - Go to your bill/expense report causing the error.
        - Click Make Payment.
        - This account needs to match the account selected in your Expensify configuration.
4. **Check Expense Report List:**
   - Make sure this is also the account selected on the expense report by looking at the expense report list.

Following these steps will help ensure that reports are exported as "Paid in Full" instead of "Accounting Approved."


# Why are reports exporting as `Pending Approval`?

If reports are exporting as "Pending Approval" instead of "Approved," you'll need to adjust the approval preferences in NetSuite.

**Exporting as Journal Entries/Vendor Bills:**
1. In NetSuite, go to Setup > Accounting > Accounting Preferences.
2. On the **General** tab, uncheck **Require Approvals on Journal Entries**.
3. On the **Approval Routing** tab, uncheck Journal Entries/Vendor Bills to remove the approval requirement for Journal Entries created in NetSuite.

**Note:** This change affects all Journal Entries, not just those created by Expensify.

**Exporting as Expense Reports:**
1. In NetSuite, navigate to Setup > Company > Enable Features.
2. On the "Employee" tab, uncheck "Approval Routing" to remove the approval requirement for Expense Reports created in NetSuite. Please note that this setting also applies to purchase orders.


# How do I Change the Default Payable Account for Reimbursable Expenses in NetSuite?

NetSuite is set up with a default payable account that is credited each time reimbursable expenses are exported as Expense Reports to NetSuite (once approved by the supervisor and accounting). If you need to change this to credit a different account, follow the below steps:

**For OneWorld Accounts:**
1. Navigate to Setup > Company > Subsidiaries in NetSuite.
2. Next to the subsidiary you want to update, click Edit.
3. Click the Preferences tab.
4. In the Default Payable Account for Expense Reports field, select the desired payable account.
5. Click Save.

**For Non-OneWorld Accounts:**
1. Navigate to Setup > Accounting > Accounting Preferences in NetSuite.
2. Click the Time & Expenses tab.
3. Under the Expenses section, locate the Default Payable Account for Expense Reports field and choose the preferred account.
4. Click Save.


# Why are my Company Card Expenses Exporting to the Wrong Account in NetSuite?

If your company card transactions are exporting to the wrong account in your accounting system, there are a couple of factors to check:
1. **Verify Card Mapping:**
   - Ensure that the cards are mapped to the correct accounts at the domain level
   - This can be viewed under **Settings > Domains > Domain Name > Company Cards**.
2. **Check Default Account Settings:**
   - Review the account where the expenses were exported
   - It should be the default account under **Settings > Workspaces > Group > Workspace Name > Connections**.
   - Click **Configure** to check the default export settings for your non-reimbursable expenses.
  
The most common reason expenses export to the default account is that they are not actually imported from the mapped company card. Only company card expenses (notated with the “Card+Lock” icon) can use the export mapping settings configured at the domain level. 

Even if an expense was paid with the company card, it is considered a 'cash' expense unless it merges with a card expense marked with the Card+Lock icon. 

Less commonly, the issue may occur if the company card has been added to the user's personal settings. Expenses imported from a card linked at the individual account level will have a plain card icon.

