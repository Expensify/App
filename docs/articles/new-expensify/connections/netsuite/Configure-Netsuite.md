---
title: Configure NetSuite
description: Configure the Import, Export, and Advanced settings for Expensify's integration with NetSuite
order: 2
---

# Best Practices Using NetSuite

Using Expensify with NetSuite brings a seamless, efficient approach to managing expenses. With automatic syncing, expense reports flow directly into NetSuite, reducing manual entry and errors while giving real-time visibility into spending. This integration speeds up approvals, simplifies reimbursements, and provides clear insights for smarter budgeting and compliance. Together, Expensify and NetSuite make expense management faster, more accurate, and stress-free.

# Accessing the NetSuite Configuration Settings

NetSuite is connected at the workspace level, and each workspace can have a unique configuration that dictates how the connection functions. To access the connection settings:

1. Click your profile image or icon in the bottom left menu.
2. Scroll down and click **Workspaces** in the left menu.
3. Select the workspace you want to access settings for.
4. Click **Accounting** in the left menu.

# Step 1: Configure Import Settings

The following steps help you determine how data will be imported from NetSuite to Expensify.

1. From the Accounting tab of your workspace settings, click on **Import**.
2. In the right-hand menu, review each of the following import settings:
    - _Categories_: Your NetSuite Expense Categories are automatically imported into Expensify as categories. This is enabled by default and cannot be disabled.
    -_Department, Classes, and Locations_: The NetSuite connection allows you to import each independently and utilize tags, report fields, or employee defaults as the coding method.
        - Tags are applied at the expense level and apply to single expense.
        - Report Fields are applied at the report header level and apply to all expenses on the report.
        - The employee default is applied when the expense is exported to NetSuite and comes from the default on the submitter’s employee record in NetSuite.
    - _Customers and Projects_: The NetSuite connections allows you to import customers and projects into Expensify as Tags or Report Fields.
        -_Cross-subsidiary customers/projects_: Enable to import Customers and Projects across all NetSuite subsidiaries to a single Expensify workspace. This setting requires you to enable “Intercompany Time and Expense” in NetSuite. To enable that feature in NetSuite, go to **Setup > Company > Setup Tasks: Enable Features > Advanced Features**.
    -_Tax_: Enable to import NetSuite Tax Groups and configure further on the Taxes tab of your workspace settings menu.
    -_Custom Segments and Records_: Enable to import segments and records are tags or report fields.
        - If configuring Custom Records as Report Fields, use the Field ID on the Transactions tab (under **Custom Segments > Transactions**).
        - If configuring Custom Records as Tags, use the Field ID on the Transaction Columns tab (under **Custom Segments > Transaction Columns**).
        - Don’t use the “Filtered by” feature available for Custom Segments. Expensify can’t make these dependent on other fields. If you do have a filter selected, we suggest switching that filter in NetSuite to “Subsidiary” and enabling all subsidiaries to ensure you don’t receive any errors upon exporting reports.
    -_Custom Lists_: Enable to import lists as tags or reports fields.
3. Sync the connection by closing the right-hand menu and clicking the three-dot icon > Sync Now option. Once the sync completes, you should see the values for any enabled tags or report fields in the corresponding Tag or Report Field tabs in the workspace settings menu.

{% include info.html %}
When you’re done configuring the settings, or anytime you make changes in the future, sync the NetSuite connection. This will ensure changes are saved and updated across both systems.
{% include end-info.html %}

# Step 2: Configure Export Settings

The following steps help you determine how data will be exported from Expensify to NetSuite.

1. From the Accounting tab of your workspace settings, click on **Export**.
2. In the right-hand menu, review each of the following export settings:
    -_Preferred exporter_: Any workspace admin can export reports to NetSuite. For automatic export, Concierge will export on behalf of the preferred exporter. The preferred exporter will also be notified of any expense reports that fail to export to NetSuite due to an error.
    -_Export date_: You can choose which date to use for the records created in NetSuite. There are three date options:
        -_Date of last expense_: This will use the date of the most recent expense on the report.
        -_Submitted date_: The date the employee submitted the report.
        -_Exported date_: The date you export the report to NetSuite.
    -_Export out-of-pocket expenses as_:
        -_Expense Reports_: Out-of-pocket expenses will be exported as expense reports, which will be posted to the payables account designated in NetSuite.
        -_Vendor Bills_: Out-of-pocket expenses will be exported to NetSuite as vendor bills. Each report will be posted as payable to the vendor associated with the employee who submitted the report. You can also set an approval level in NetSuite for vendor bills.
        -_Journal Entries_: Out-of-pocket expenses will be exported to NetSuite as journal entries. All the transactions will be posted to the payable account specified in the workspace. You can also set an approval level in NetSuite for the journal entries.
            - By default, journal entry forms do not contain a customer column, so it is not possible to export customers or projects with this export option. Also, The credit line and header level classifications are pulled from the employee record.
    -_Export company card expenses as_:
        - _Expense Reports_:To export company card expenses as expense reports, you will need to configure your default corporate cards in NetSuite. 
        - _Vendor Bills_: Company card expenses will be posted as a vendor bill payable to the default vendor specified in your workspace Accounting settings. You can also set an approval level in NetSuite for the bills.
        - _Journal Entries_: Company Card expenses will be posted to the Journal Entries posting account selected in your workspace Accounting settings.
        - Important Notes:
            - Expensify Card expenses will always export as Journal Entries, even if you have Expense Reports or Vendor Bills configured for non-reimbursable expenses on the Export tab
            - Journal entry forms do not contain a customer column, so it is not possible to export customers or projects with this export option
            - The credit line and header level classifications are pulled from the employee record
    -_Export invoices to_: Select the Accounts Receivable account where you want your Invoice reports to export. In NetSuite, the invoices are linked to the customer, corresponding to the email address where the invoice was sent.
    -_Invoice item_: Choose whether Expensify creates an "Expensify invoice line item" for you upon export (if one doesn’t exist already) or select an existing invoice item. 
    -_Export foreign currency amount_: Enabling this feature allows you to send the original amount of the expense rather than the converted total when exporting to NetSuite. This option is only available when exporting out-of-pocket expenses as Expense Reports.
    -_Export to next open period_: When this feature is enabled and you try exporting an expense report to a closed NetSuite period, we will automatically export to the next open period instead of returning an error.
3. Sync the connection by closing the right-hand menu and clicking the three-dot icon > Sync Now option.

# Step 3: Configure Advanced Settings

The following steps help you determine the advanced settings for your NetSuite connection.

1. From the Accounting tab of your workspace settings, click on **Advanced**.
2. In the right-hand menu, review each of the following advanced settings:
    -_Auto-sync_: When enabled, the connection will sync daily to ensure that the data shared between the two systems is up-to-date. We strongly recommend keeping auto-sync enabled. The following will occur when auto-sync is enabled:
        - When an expense report reaches its final state in Expensify, it will be automatically exported to NetSuite. The final state will either be reimbursement (if you reimburse members through Expensify) or final approval (if you reimburse members outside of Expensify).
        - If Sync Reimbursed Reports is enabled, then we will sync the reimbursement status of reports between Expensify and NetSuite.
    -_Sync reimbursed reports_: Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the NetSuite.
        -_Reimbursments account_: Select the account that matches the default account for Bill Payments in your NetSuite account.
        -_Collections account_:  When exporting invoices, once marked as Paid, the payment is marked against the account selected.
    -_Invite employees and set approvals_: Enabling this feature will invite all employees from the connected NetSuite subsidiary to your Expensify workspace. Once imported, Expensify will send them an email letting them know they’ve been added to a workspace.
        - In addition to inviting employees, this feature enables a custom set of approval workflow options, which you can manage in Expensify Classic. (Click Switch to Expensify Classic from the Settings menu.)
    -_Auto create employees/vendors_: With this feature enabled, Expensify will automatically create a new employee or vendor in NetSuite (if one doesn’t already exist) using the name and email of the report submitter.
    -_Enable newly imported categories_: Toggle to enable this feature and anytime a new Expense Category is created in NetSuite, it will be imported into Expensify as an enabled category. Otherwise, it will import disabled and employees will be unable to see it as an option to code to an expense.
    -_Setting approval levels_: You can set the NetSuite approval level for each different export type; Expense report, Vendor bill, and Journal entry.
        - Note: If you have Approval Routing selected in your accounting preference, this will override the selections in Expensify. If you do not wish to use Approval Routing in NetSuite, go to **Setup > Accounting > Accounting Preferences > Approval Routing** and ensure Vendor Bills and Journal Entries are not selected.
    -_Custom form ID_: By default, Expensify creates entries using the preferred transaction form set in NetSuite. Enabling this setting allows you to designate a specific transaction form.
        -_Out-of-pocket expense_: 
        -_Company card expense_:
3. Sync the connection by closing the right-hand menu and clicking the three-dot icon > Sync Now option.

{% include faq-begin.md %}

## I added tags in NetSuite (departments, classes, or locations) how do I get them into my workspace?

New departments, classes, and locations must be added in NetSuite first before they can be added as options to code to expenses in Expensify. After adding them in NetSuite, sync your connection to import the new options.

Once imported, you can turn specific tags on or off under **Settings > Workspaces > [Workspace Name] > Tags**. You can turn specific report fields on or off under **Settings > Workspaces > [Workspace Name] > Report Fields**.

## Is it possible to automate inviting my employees and their approver from NetSuite into Expensify?

Yes, you can automatically import your employees and set their approval workflow with your connection between NetSuite and Expensify.

Enabling this feature will invite all employees from the connected NetSuite subsidiary to your Expensify workspace. Once imported, Expensify will send them an email letting them know they’ve been added to a workspace.

In addition to inviting employees, this feature enables a custom set of approval workflow options, which you can manage in Expensify Classic. (Click Switch to Expensify Classic from the Settings menu.) Your options for approval include:

- **Basic Approval:** A single level of approval, where all users submit directly to a Final Approver. The Final Approver defaults to the workspace owner but can be edited on the people page.
- **Manager Approval (default):** Two levels of approval route reports first to an employee’s NetSuite expense approver or supervisor, and second to a workspace-wide Final Approver. By NetSuite convention, Expensify will map to the supervisor if no expense approver exists. The Final Approver defaults to the workspace owner but can be edited on the people page.
- **Configure Manually:** Employees will be imported, but all levels of approval must be manually configured on the workspace’s People settings page. If you enable this setting, it’s recommended you review the newly imported employees and managers on the **Settings > Workspaces > Group > [Workspace Name] > People** page.


## I notice that company card expenses export to NetSuite right away when I approve a report, but reimbursable expenses don’t, why is that?

When Auto Sync is enabled and you reimburse employees through Expensify, we help to automatically send finalized expenses to NetSuite. The timing of the export depends on the type of expense it is. 
        - **If you reimburse members through Expensify:** Reimbursing an expense report will trigger auto-export to NetSuite. When the expense report is exported to NetSuite, a corresponding bill payment will also be created in NetSuite.
        - **If you reimburse members outside of Expensify:** Expense reports will be exported to NetSuite at the time of final approval. After you mark the report as paid in NetSuite, the reimbursed status will be synced back to Expensify the next time the integration syncs.

## How do I configure my default corporate cards in NetSuite?

To export company card expenses as expense reports, you must configure your default corporate cards in NetSuite. 

To do this, you must select the correct card on the NetSuite employee records (for individual accounts) or the subsidiary record (If you use a non-One World account, the default is found in your accounting preferences).

To update your expense report transaction form in NetSuite:

1. Go to **Customization > Forms > Transaction Forms.**
2. Click **Edit** next to the preferred expense report form.
3. Go to the **Screen Fields > Main** tab.
4. Check “Show” for "Account for Corporate Card Expenses."
5. Go to the **Screen Fields > Expenses** tab.
6. Check “Show” for "Corporate Card."

You can also select the default account on your employee record to use individual corporate cards for each employee. Make sure you add this field to your employee entity form in NetSuite. If you have multiple cards assigned to a single employee, you cannot export to each account. You can only have a single default per employee record.

## My custom segments created before 2019.1 weren’t created with a unified ID, what change can I make to import them into Expensify?”

 Note that as of 2019.1, any new custom segments that you create automatically use the unified ID, and the "Use as Field ID" box is not visible. If you are editing a custom segment definition that was created before 2019.1, the "Use as Field ID" box is available. To use a unified ID for the entire custom segment definition, check the "Use as Field ID" box. When the box is checked, no field ID fields or columns are shown on the Application & Sourcing subtabs because one ID is used for all fields.

## How does Auto-sync work with reimbursed reports?

If a report is reimbursed via ACH or marked as reimbursed in Expensify and then exported to NetSuite, the report is automatically marked as paid in NetSuite.

If a report is exported to NetSuite, and then marked as paid in NetSuite, the report will automatically be marked as reimbursed in Expensify during the next sync.

## Will enabling auto-sync affect existing approved and reimbursed reports?

Auto-sync will only export newly approved reports to NetSuite. Reports that were approved or reimbursed before enabling auto-sync will need to be manually exported to sync them to NetSuite.

## When using multi-currency features in NetSuite, can expenses be exported with any currency?

When using multi-currency features with NetSuite, remember these points:

**Employee/Vendor currency:** The currency set for a NetSuite vendor or employee record must match the subsidiary currency for whichever subsidiary you export that user's reports to. A currency mismatch will cause export errors.
**Bank Account Currency:** When synchronizing bill payments, your bank account’s currency must match the subsidiary’s currency. Failure to do so will result in an “Invalid Account” error.
{% include faq-end.md %}
