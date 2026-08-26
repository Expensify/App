---
title: Configure Rillet
description: Learn how to configure Rillet import, export, and advanced sync settings in Expensify.
keywords: [New Expensify, Rillet configuration, Rillet import, Rillet export, Rillet advanced sync, Rillet vendor bills]
internalScope: Audience is Workspace Admins configuring an existing Rillet connection. Covers import, export, advanced sync and settlement, and multiple card account export settings. Does not cover the initial connection or API-key setup.
---

# Configure Rillet

Configure how Expensify imports accounting data from Rillet and exports expenses back to your accounting system.

If you haven't connected Rillet yet, learn how to [connect to Rillet](/articles/new-expensify/connections/rillet/Connect-to-Rillet).

Once configured, you can:

- Import categories, tags, and tax rates from Rillet.
- Export reimbursable and company card expenses.
- Automatically sync reports, reimbursements, and settlements.

---

## Where to find Rillet configuration settings

Each Workspace has its own Rillet integration. To view or update the configuration settings: 

1. In the navigation tabs (on the left on web, on the bottom on mobile) go to **Workspaces > [workspace name]**.
2. Select **Accounting**. 
3. On the Rillet connection, select **Import**, **Export**, or **Advanced**.

![Accounting page showing Rillet connection]({{site.url}}/assets/images/Accounting_Rillet_Configure.png){:width="100%"}

---

## How to configure Rillet import settings

Import settings control which accounting data is imported from Rillet into Expensify.

On the Rillet integration, choose **Import** to configure:

- **Chart of accounts** – Imports active Expense, Current Asset, and Fixed Asset accounts as Categories. This setting is always enabled.
- **Enable newly imported accounts** – Choose whether newly imported accounts arrive as enabled or disabled categories. This defaults to off, so new accounts import as disabled categories.
- **Dimensions** – Choose which Rillet dimensions to import as tags. Each available dimension (such as Departments, Projects, or Classes) can be enabled independently.
- **Tax rates** – Import tax rates from Rillet. This option only appears when tax rates are available for the selected subsidiary.

---

## How to configure Rillet export settings

Export settings determine how Expensify sends data to Rillet. 

On the Rillet integration, choose **Export** and configure:

- **Preferred exporter** – Assign the Workspace Admin to automatically receive reports to export.
- **Export reimbursable expenses as** – Reimbursable expenses export as vendor bills.
- **Vendor bill date** – Choose whether vendor bills use the date of the last expense, the export date, or the submitted date.
- **Export company card expenses as** – Company card expenses export as credit card charges.
- **Default company card vendor** – Select the vendor used when an export can't be matched to a vendor automatically.
- **Company card account** – Select the Rillet credit card account used for company card expenses.
- **Configure exporting to multiple accounts** - Export different company card programs or individual cards to different Rillet accounts.

---

## How to configure Rillet advanced settings

Advanced settings control sync frequency, reimbursement, and settlement automation. 

On the Rillet integration, choose **Advanced** to configure:

- **Auto-sync** –  Automatically sync Expensify and Rillet every day and export reports automatically using your selected export method.
- **Export method** – Choose when reports are exported automatically. This option is only available when auto-sync is enabled. 
  - **Accrual** exports reimbursable expenses after final approval.
  - **Cash** exports reimbursable expenses after they are paid.
- **Sync reimbursed reports** – Automatically create bill payments in Rillet when vendor bills are reimbursed in Expensify.
- **Sync Expensify Card settlements** – Automatically create settlement payments in Rillet for Expensify Card transactions.
- **Sync Consolidated Travel Billing settlements** – Automatically create settlement payments in Rillet for Consolidated Travel Billing transactions.

---

## How to export company card expenses to multiple Rillet accounts

If your organization uses multiple company card liability accounts, you can export different card programs or individual cards to different Rillet accounts.

On the Rillet integration, choose **Export** and enable **Configure exporting to multiple accounts**. Then configure:

- **Card program account** – Assign a default Rillet account for each company card program.
- **Per-card account** – Override the program account for individual cards when needed.

When this toggle is off, company card expenses export to the single **Company card account** selected in the export settings.

---

# FAQ

## Which Rillet accounts import as Categories?

Only active expense, current asset, and fixed asset accounts from your Rillet chart of accounts import as Categories.

## Why did my report fail to export to Rillet?

Reimbursable expenses export as vendor bills matched to the report submitter's email. If no Rillet vendor matches that email, the export fails. Make sure each report submitter exists as a vendor in Rillet.

## Do I need a bill payment or settlements account?

A bill payment account is required only when **Sync reimbursed reports** is enabled, and a settlements account is required only when **Sync Expensify Card settlements** or **Sync Consolidated Travel Billing settlements** is enabled.
