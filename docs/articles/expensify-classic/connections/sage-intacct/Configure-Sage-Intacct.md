---
title: Configure Sage Intacct
description: Configure Sage Intacct's export, coding, and advanced settings.
---

By configuring your Sage Intacct settings in Expensify correctly, you can leverage the connection's settings to automate most tasks, making your workflow more efficient.

# How to Configure Export Settings

There are several options for exporting Expensify reports to Sage Intacct. Let's explore how to configure these settings to align with your business needs.

To access these settings, go to **Settings > Workspace > Group > Connections** and select the **Configure** button.

![Highlighting the Configure button for the Sage Intacct Integration]({{site.url}}/assets/images/SageConfigureIntegrationConfigureButton.png){:width="100%"}

## Export Options

### Preferred Exporter

Any workspace admin can export to Sage Intacct, but only the preferred exporter will receive notifications in Expensify regarding the status of exports.

### Date

The three options for the date your report will export with are:
- **Date of last expense:** Uses the date on the most recent expense added to the report.
- **Exported date:** Is the date you export the report to Sage Intacct.
- **Submitted date:** Is the date the report creator originally submitted the report.

Note: All export options except credit cards use the date in the drop-down. Credit card transactions use the transaction date.

### Reimbursable Expenses

Depending on your initial setup, your **reimbursable expenses** will be exported as either **Expense Reports** or **Vendor Bills** to Sage Intacct.

### Non-Reimbursable Expenses

**1a. Non-reimbursable expenses** will export separately from reimbursable expenses either as **Vendor Bills** or as **credit card charges** to the account you select. It is not an option to export non-reimbursable expenses as **Journal** entries. 

If you are centrally managing your company cards through your Domain Settings, you can export expenses from each individual card to a specific account in Intacct. See section 1b below on how to configure those export settings.

Please note that credit Card Transactions cannot be exported to Sage Intacct at the top level if you have **Multi-Currency** enabled. Therefore, you will need to select an entity in the configuration of your Expensify Workspace by going to **Settings > Workspaces > Groups > [Workspace Name]  > Connections > Configure**.

**1b. Optional configuration when company cards are connected**
1. Click **Settings** near the bottom of the left-hand menu.
2. Navigate to Domains > [_domain name_] > Company Cards.
3. If you have more than one company card connection, select the connection first. 
4. Locate the cardholder you want to configure in the list,
5. Click the **Edit Exports** button and assign the account the card expenses should export to in Sage Intacct.

### Exporting Negative Expenses

You can export negative expenses successfully to Intacct regardless of which Export Option you choose. The one thing to keep in mind is that if you have Expense Reports selected as your export option, the **total** of the report can not be negative.

## How to Configure Coding Settings

The appearance of your expense data in Sage Intacct depends on how you've configured it in Expensify. It's important to understand each available option to achieve the desired results.

The appearance of your expense data in Sage Intacct depends on how you've configured it in Expensify. It's important to understand each available option to achieve the desired results.

### Expense Types

Categories are always enabled and are the primary means of matching expenses to the correct accounts in Sage Intact. The Categories in Expensify depend on your **Reimbursable** export options:
- If your Reimbursable export option is set to **Expense Reports** (the default), your Categories will be your **Expense Types**.
- If your Reimbursable export option is set to **Vendor Bills**, your Categories will be your **Chart of Accounts** (also known as GL Codes or Account Codes).

You can disable unnecessary categories from your **Settings > Workspaces > Group > [Workspace Name] > Categories** page if your list is too extensive. Note that every expense must be coded with a Category, or it will not export. Also, when you first set up the integration, your existing categories will be overwritten.

### Billable Expenses

Enabling Billable expenses allows you to map your expense types or accounts to items in Sage Intacct. To do this, you'll need to enable the correct permissions on your Sage Intacct user or role. This may vary based on the modules you use in Sage Intacct, so you should enable read-only permissions for relevant modules such as Projects, Purchasing, Inventory Control, and Order Entry.

Once permissions are set, you can map your categories (expense types or accounts, depending on your export settings) to specific items, which will then export to Sage Intacct. When an expense is marked as Billable in Expensify, users must select the correct billable Category (Item), or there will be an error during export.

### Dimensions - Departments, Classes, and Locations

If you enable these dimensions, you can choose from three data options:
- Not pulled into Expensify: Employee default (available when the reimbursable export option is set to Expense Reports)
- Pulled into Expensify and selectable on reports/expenses: Tags (useful for cross-charging between Departments or Locations)
- Report Fields (applies at the header level, useful when an employee's Location varies from one report to another)

Please note that the term "tag" may appear instead of "Department" on your reports, so ensure that "Projects" is not disabled in your Tags configuration within your workspace settings. Make sure it's enabled within your coding settings of the Intacct configuration settings. When multiple options are available, the term will default to Tags.

### Customers and Projects

These settings are particularly relevant to billable expenses and can be configured as Tags or Report Fields.

### Tax

As of September 2023, our Sage Intacct integration supports native VAT and GST tax. To enable this feature, open the Sage Intacct configuration settings in your workspace, go to the Coding tab, and enable Tax. For existing Sage Intacct connections, simply resync your workspace and the tax toggle will appear. For new Sage Intacct connections, the tax toggle will be available when you complete the integration steps. 
Enabling this option will import your native tax rates from Sage Intacct into Expensify. From there, you can select default rates for each category.

### User-Defined Dimensions

You can add User-Defined Dimensions (UDD) to your workspace by locating the "Integration Name" in Sage Intacct. Please note that you must be logged in as an administrator in Sage Intacct to find the required fields.

To find the Integration Name in Sage Intacct:
1. Go to **Platform Services > Objects > List**
2. Set "filter by application" to "user-defined dimensions."

![Image of Sage Intacct Objects filtered by User Defined Dimension]({{site.url}}/assets/images/SageConfigureUserDefinedDimensionsFilter.png){:width="100%"}

Now, in Expensify, navigate to **Settings > Workspaces > Group > [Workspace Name] > Connections**, and click **Configure** under Sage Intacct. On the Coding tab, enable the toggle next to User Defined Dimensions. Enter the "Integration name" and choose whether to import it into Expensify as an expense-level Tag or as a Report Field, then click **Save**.

You'll now see the values for your custom segment available under Tags settings or Report Fields settings in Expensify.


## How to Configure Advanced Settings

In multi-entity environments, you'll find a dropdown at the top of the sync options menu, where you can choose to sync with the top-level or a specific entity in your Sage Intacct instance. If you sync at the top level, we pull in employees and dimensions shared at the top level and export transactions to the top level. Otherwise, we sync information with the selected entity.

### Auto Sync

When a non-reimbursable report is finally approved, it will be automatically exported to Sage Intacct. Typically, non-reimbursable expenses will sync to the next open period in Sage Intacct by default. If your company uses Expensify's ACH reimbursement, reimbursable expenses will be held back and exported to Sage when the report is reimbursed.

### Inviting Employees

Enabling **Invite Employees** allows the integration to automatically add your employees to your workspace and create an Expensify account for them if they don't have one. 
If you have your domain verified on your account, ensure that the Expensify account connected to Sage Intacct is an admin on your domain.
When you toggle on "Invite Employees" on the Advanced tab, all employees in Sage Intacct who haven't been invited to the Expensify group workspace you're connecting will receive an email invitation to join the group workspace. Approval workflow will default to Manager Approval and can be further configured on the People settings page.

### Import Sage Intacct Approvals

When the "Import Sage Intacct Approvals" setting is enabled, Expensify will automatically set each user's manager listed in Sage Intacct as their first approver in Expensify. If no manager exists in Sage Intacct, the approver can be set in the Expensify People table. You can also add a second level of approval to your Sage Intacct integration by setting a final approver in Expensify.
Please note that if you need to add or edit an optional final approver, you will need to select the **Manager Approval** option in the workflow. Here is how each option works:
- **Basic Approval:** All users submit to one user.
- **Manager Approval:** Each user submits to the manager (imported from Sage Intacct). Each manager forwards to one final approver (optional).
- **Configure Manually:** Import employees only, configure workflow in Expensify.

### Sync Reimbursed Reports
When using Expensify ACH, reimbursable reports exported to Intacct are exported:
- As Vendor Bills to the default Accounts Payable account set in your Intacct Accounts Payable module configuration, OR
- As Expense Reports to the Employee Liabilities account in your Time & Expenses module configuration.
When ACH reimbursement is enabled, the "Sync Reimbursed Reports" feature will additionally export a Bill Payment to the selected Cash and Cash Equivalents account listed. If **Auto Sync** is enabled, the payment will be created when the report is reimbursed; otherwise, it will be created the next time you manually sync the workspace.
Intacct requires that the target account for the Bill Payment be a Cash and Cash Equivalents account type. If you aren't seeing the account you want in that list, please first confirm that the category on the account is Cash and Cash Equivalents.

{% include faq-begin.md %}
## What if my report isn't automatically exported to Sage Intacct?

There are a number of factors that can cause automatic export to fail. If this happens, the preferred exporter will receive an email and an Inbox task outlining the issue and any associated error messages.
The same information will be populated in the comments section of the report.
The fastest way to find a resolution for a specific error is to search the Community, and if you get stuck, give us a shout!
Once you've resolved any errors, you can manually export the report to Sage Intacct.

## How can I make sure that I final approve reports before they're exported to Sage Intacct?

Make sure your approval workflow is configured correctly so that all reports are reviewed by the appropriate people within Expensify before exporting to Sage Intacct.
Also, if you have verified your domain, consider strictly enforcing expense workspace workflows. You can set this up via Settings > Domains > [Domain Name] > Groups.


## If I enable Auto Sync, what happens to existing approved and reimbursed reports?

If your workspace has been connected to Intacct with Auto Sync disabled, you can safely turn on Auto Sync without affecting existing reports which have not been exported.
If a report has been exported to Intacct and reimbursed via ACH in Expensify, we'll automatically mark it as paid in Intacct during the next sync.
If a report has been exported to Intacct and marked as paid in Intacct, we'll automatically mark it as reimbursed in Expensify during the next sync.
If a report has not been exported to Intacct, it will not be exported to Intacct automatically.

{% include faq-end.md %}
