---
title: Configure Sage Intacct
description: Configure the Import, Export, and Advanced settings for Expensify's Sage Intacct integration
order: 3
---

# Configure Sage Intacct integration

## Step 1: Select entity (multi-entity setups only)
If you have a multi-entity setup in Sage Intacct, you will be able to select in Expensify which Sage Intacct entity to connect each workspace to. Each Expensify workspace can either be connected to a single entity or connected at the Top Level.

To select or change the Sage Intacct entity that your Expensify workspace is connected to, navigate to the Accounting settings for your workspace and click **Entity** under the Sage Intacct connection.

## Step 2: Configure import settings
The following section will help you determine how data will be imported from Sage Intacct into Expensify. To change your import settings, navigate to the Accounting settings for your workspace, then click **Import** under the Sage Intacct connection.

### Expense Types / Chart of Accounts
The categories in Expensify depend on how you choose to export out-of-pocket expenses:

- If you choose to export out-of-pocket expenses as Expense Reports, your categories in Expensify will be imported from your Sage Intacct Expense Types
- If you choose to export out-of-pocket expenses as Vendor Bills, your categories will be imported directly from your Chart of Accounts (also known as GL Codes or Account Codes).

You can disable unnecessary categories in Expensify by going to **Settings > Workspaces > [Workspace Name] > Categories**. Note that every expense must be coded with a Category, or it will fail to export.

### Billable Expenses
Enabling billable expenses allows you to map your expense types or accounts to items in Sage Intacct. To do this, you’ll need to enable the correct permissions on your Sage Intacct user or role. This may vary based on the modules you use in Sage Intacct, so you should enable read-only permissions for relevant modules such as Projects, Purchasing, Inventory Control, and Order Entry.

Once permissions are set, you can map categories to specific items, which will then export to Sage Intacct. When an expense is marked as Billable in Expensify, users must select the correct billable Category (Item), or there will be an error during export.


### Standard dimensions: Departments, Classes, and Locations
The Sage Intacct integration allows you to import standard dimensions into Expensify as tags, report fields, or using the Sage Intacct employee default.

- **Sage Intacct Employee default:** This option is only available when exporting as expense reports. When this option is selected, nothing will be imported into Expensify - instead, the employee default will be applied to each expense upon export.
- **Tags:** Employees can select the department, class, or location on each individual expense. If the employee's Sage Intacct employee record has a default value, then each expense will default to that tag, with the option for the employee to select a different value on each expense.
- **Report Fields:** Employees can select one department/class/location for each expense report.

New departments, classes, and locations must be added in Sage Intacct. Once imported, you can turn specific tags on or off under **Settings > Workspaces > [Workspace Name] > Tags**. You can turn specific report fields on or off under **Settings > Workspaces > [Workspace Name] > Report Fields**.

Please note that when importing departments as tags, expense reports may show the tag name as "Tag" instead of "Department."

### Customers and Projects
The Sage Intacct integration allows you to import customers and projects into Expensify as Tags or Report Fields.

- **Tags:** Employees can select the customer or project on each individual expense.
- **Report Fields:** Employees can select one department/class/location for each expense report.

New customers and projects must be added in Sage Intacct. Once imported, you can turn specific tags on or off under **Settings > Workspaces > [Workspace Name] > Tags**. You can turn specific report fields on or off under **Settings > Workspaces > [Workspace Name] > Report Fields**.


### Tax
The Sage Intacct integration supports native VAT and GST tax. To enable this feature, go to **Settings > Workspaces > [Workspace Name] > Accounting**, click **Import** under Sage Intacct, and enable Tax. Enabling this option will import your native tax rates from Sage Intacct into Expensify. From there, you can select default rates for each category under **Settings > Workspaces > [Workspace Name] > Categories**.

For older Sage Intacct connections that don't show the Tax option, simply resync the connection by going to **Settings > Workspaces > [Workspace Name] > Accounting** and clicking the three dots next to Sage Intacct, and the tax toggle will appear.

### User-Defined Dimensions
You can add User-Defined Dimensions (UDDs) to your workspace by locating the “Integration Name” in Sage Intacct. Please note that you must be logged in as an administrator in Sage Intacct to find the required fields.

To find the Integration Name in Sage Intacct:

1. Go to **Platform Services > Objects > List**
1. Set “filter by application” to “user-defined dimensions”
1. In Expensify, go to **Settings > Workspaces > [Workspace Name] > Accounting** and click **Import** under Sage Intacct
1. Enable User Defined Dimensions
1. Enter the “Integration name” and choose whether to import it into Expensify as expense-level tags or as report fields
1. Click **Save**

Once imported, you can turn specific tags on or off under **Settings > Workspaces > [Workspace Name] > Tags**. You can turn specific report fields on or off under **Settings > Workspaces > [Workspace Name] > Report Fields**.


## Step 5: Configure export settings
To access export settings, head to **Settings > Workspaces > [Workspace name] > Accounting** and click **Export** under Sage Intacct.

### Preferred exporter
Any workspace admin can export reports to Sage Intacct. For auto-export, Concierge will export on behalf of the preferred exporter. The preferred exporter will also be notified of any expense reports that fail to export to Sage Intacct due to an error.

### Export date
You can choose which date to use for the records created in Sage Intacct. There are three date options:

1. **Date of last expense:** This will use the date of the previous expense on the report
1. **Export date:** The date you export the report to Sage Intacct
1. **Submitted date:** The date the employee submitted the report

### Export out-of-pocket expenses as
Out-of-pocket expenses can be exported to Sage Intacct as **expense reports** or as **vendor bills**. If you choose to export as expense reports, you can optionally select a **default vendor**, which will apply to reimbursable expenses that don't have a matching vendor in Sage Intacct.

### Export company card expenses as
Company Card expenses are exported separately from out-of-pocket expenses, and can be exported to Sage Intacct as credit card charges** or as **vendor bills**.

- **Credit card charges:** When exporting as credit card charges, you must select a credit card account. You can optionally select a default vendor, which will apply to company card expenses that don't have a matching vendor in Sage Intacct.
    - Credit card charges cannot be exported to Sage Intacct at the top-level if you have multi-currency enabled, so you will need to select an individual entity if you have this setup.
- **Vendor bills:** When exporting as vendor bills, you can select a default vendor, which will apply to company card expenses that don't have a matching vendor in Sage Intacct.

If you centrally manage your company cards through Domains in Expensify Classic, you can export expenses from each individual card to a specific account in Sage Intacct in the Expensify Company Card settings.

### 6. Configure advanced settings
To access the advanced settings of the Sage Intacct integration, head to **Settings > Workspaces > [Workspace name] > Accounting** and click **Advanced** under Sage Intacct.


Let’s review the different advanced settings and how they interact with the integration.

### Auto-sync
We strongly recommend enabling auto-sync to ensure that the information in Sage Intacct and Expensify is always in sync. The following will occur when auto-sync is enabled:

**Daily sync from Sage Intacct to Expensify:** Once a day, Expensify will sync any changes from Sage Intacct into Expensify. This includes any changes or additions to your Sage Intacct dimensions.

**Auto-export:** When an expense report reaches its final state in Expensify, it will be automatically exported to Sage Intacct. The final state will either be reimbursement (if you reimburse members through Expensify) or final approval (if you reimburse members outside of Expensify).

**Reimbursement-sync:** If Sync Reimbursed Reports (more details below) is enabled, then we will sync the reimbursement status of reports between Expensify and Sage Intacct.

### Invite employees
Enabling this feature will invite all employees from the connected Sage Intacct entity to your Expensify workspace. Once imported, each employee who has not already been invited to that Expensify workspace will receive an email letting them know they’ve been added to the workspace.

In addition to inviting employees, this feature enables a custom set of approval workflow options, which you can manage in Expensify Classic:

- **Basic Approval:** A single level of approval, where all users submit directly to a Final Approver. The Final Approver defaults to the workspace owner but can be edited on the people page.
- **Manager Approval (default):** Each user submits to their manager, who is imported from Sage Intacct. You can optionally select a final approver who each manager forwards to for second-level approval.
- **Configure Manually:** Employees will be imported, but all levels of approval must be manually configured in Expensify. If you enable this setting, you can configure approvals by going to **Settings > Workspaces > [Workspace Name] > People**.


### Sync reimbursed reports
When Sync reimbursed reports is enabled, the reimbursement status will be synced between Expensify and Sage Intacct.

**If you reimburse employees through Expensify:** Reimbursing an expense report will trigger auto-export to Sage Intacct. When the expense report is exported to Sage Intacct, a corresponding bill payment will also be created in Sage Intacct in the selected Cash and Cash Equivalents account.  If you don't see the account you'd like to select in the dropdown list, please confirm that the account type is Cash and Cash Equivalents.

**If you reimburse employees outside of Expensify:** Expense reports will be exported to Sage Intacct at time of final approval. After you mark the report as paid in Sage Intacct, the reimbursed status will be synced back to Expensify the next time the integration syncs.

To ensure this feature works properly for expense reports, make sure that the account you choose within the settings matches the default account for Bill Payments in NetSuite. When exporting invoices, once marked as Paid, the payment is marked against the account selected after enabling the Collection Account setting.

## FAQ

### Will enabling auto-sync affect existing approved and reimbursed reports?
Auto-sync will only export newly approved reports to Sage Intacct. Any reports that were approved or reimbursed before enabling auto-sync will need to be manually exported in order to sync them to Sage Intacct.
