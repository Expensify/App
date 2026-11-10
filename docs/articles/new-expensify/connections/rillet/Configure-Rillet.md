---
title: Configure Rillet
description: Learn how to configure Rillet import, export, and advanced sync settings in Expensify.
keywords: [New Expensify, Rillet configuration, Rillet import, Rillet export, Rillet advanced sync, Rillet vendor bills, Rillet reimbursements, Rillet reimbursement account]
internalScope: Audience is workspace admins configuring an existing Rillet connection. Covers import, export, exporting reimbursable expenses as reimbursements, advanced sync and settlement, and multiple card account export settings. Does not cover the initial connection or API-key setup.
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
2. Select **Connections**, then select **Configure** next to Rillet.
3. Select **Import**, **Export**, or **Advanced**.

---

## How to configure Rillet import settings

Import settings control which accounting data is imported from Rillet into Expensify.

On the Rillet integration, choose **Import** to configure:

- **Chart of accounts** – Imports active Expense, Current Asset, and Fixed Asset accounts as Categories. This setting is always enabled.
- **Enable newly imported accounts** – Choose whether newly imported accounts arrive as enabled or disabled categories. This defaults to off, so new accounts import as disabled categories.
- **Dimensions** – Choose which Rillet dimensions to import as tags. Each available dimension (such as Departments, Projects, or Classes) can be enabled independently.
- **Tax rates** – Import tax rates from Rillet. This option only appears when tax rates are available for the selected entity.

---

## How to configure Rillet export settings

Export settings determine how Expensify sends data to Rillet. 

On the Rillet integration, choose **Export** and configure:

- **Preferred exporter** – Assign the Workspace Admin to automatically receive reports to export.
- **Export reimbursable expenses as** – Choose **Itemized vendor bills** or **Itemized reimbursements**. Expensify creates one vendor bill or reimbursement for each report. If the period is closed in Rillet, the export posts to the next open period.
- **Reimbursement account** – Select the Rillet account that reimbursements post to. This option only appears when **Itemized reimbursements** is selected.
- **GL impact date** – Choose whether vendor bills and reimbursements use the date of the last expense, the export date, or the submitted date.
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
- **Sync reimbursed reports** – Automatically create a payment in Rillet when a report is reimbursed in Expensify. The payment is recorded on the report's vendor bill or reimbursement.
  - **ACH payment account** – Select the Rillet account the payment is made from. Only active asset accounts appear.
- **Sync Expensify Card settlements** – Automatically create settlement payments in Rillet for Expensify Card transactions.
- **Sync Consolidated Travel Billing settlements** – Automatically create settlement payments in Rillet for Consolidated Travel Billing transactions.

---

## How to export reimbursable expenses to Rillet as reimbursements

By default, reimbursable expenses export to Rillet as vendor bills. To keep employee expenses separate from vendor spend, export them as reimbursements to an account you choose.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. On the Rillet connection, select **Export**.
3. Select **Export reimbursable expenses as**, then choose **Itemized reimbursements**.
4. Select **Reimbursement account**, then choose the account reimbursements should post to.

The **Reimbursement account** list shows active liability accounts from Rillet. It doesn't include credit card, accounts payable, or other long-term liability accounts.

Until you select a reimbursement account, the **Reimbursement account** row shows an error.

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

Vendor bills and reimbursements both use the Rillet vendor that matches the report submitter's email. If no Rillet vendor matches that email, the export fails. Make sure each report submitter exists as a vendor in Rillet.

If reimbursable expenses export as **Itemized reimbursements**, the export also fails when no **Reimbursement account** is selected.

## Do I need an ACH payment account or settlement account?

An **ACH payment account** is required only when **Sync reimbursed reports** is enabled. A settlement account is required only when **Sync Expensify Card settlements** or **Sync Consolidated Travel Billing settlements** is enabled.
