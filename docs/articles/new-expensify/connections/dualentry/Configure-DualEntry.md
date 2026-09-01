---
title: Configure DualEntry
description: Learn how to configure DualEntry import, export, and advanced sync settings in Expensify.
keywords: [New Expensify, DualEntry configuration, DualEntry import, DualEntry export, DualEntry advanced sync, DualEntry vendor bills]
internalScope: Audience is Workspace Admins configuring an existing DualEntry connection. Covers import, export, advanced settings and auto-sync. Does not cover the initial connection or API-key setup.
order: 2
---

# Configure DualEntry

Configure how Expensify imports accounting data from DualEntry and exports expenses back to your accounting system.

If you haven't connected DualEntry yet, learn how to [connect to DualEntry](/articles/new-expensify/connections/dualentry/Connect-to-DualEntry).

Once configured, you can:

- Import categories, tags, and tax rates from DualEntry.
- Export out-of-pocket and card expenses.
- Automatically sync reports, reimbursements, and settlements.

---

## Where to find DualEntry configuration settings

Each Workspace has its own DualEntry integration. To view or update the configuration settings:

1. In the navigation tabs (on the left on web, on the bottom on mobile) go to **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. On the DualEntry connection, select **Import**, **Export**, or **Advanced**.

![The Accounting page showing the connected DualEntry integration with the Import, Export, and Advanced settings visible.]({{site.url}}/assets/images/DualEntry_configure.png){:width="100%"}

---

## How to configure DualEntry import settings

Import settings control which accounting data is imported from DualEntry into Expensify.

On the DualEntry integration, choose **Import** to configure:

- **Chart of accounts** – Imports active expense (including cost of goods sold), current asset, and fixed asset accounts as categories. This setting is always enabled.
- **Enable newly imported accounts** – Choose whether newly imported accounts arrive as enabled or disabled categories. This defaults to off, so new accounts import as disabled categories.
- **Classifications** – Choose which DualEntry classifications to import as tags. Each available classification can be enabled independently, and all classifications are off by default.
- **Tax rates** – Import tax rates from DualEntry. This option only appears when tax rates are available for the selected subsidiary, and it is off by default.

---

## How to configure DualEntry export settings

Export settings determine how Expensify sends data to DualEntry.

On the DualEntry integration, choose **Export** and configure:

- **Preferred exporter** – Assign the Workspace Admin to automatically receive reports to export.
- **Export reimbursable expenses as** – Reimbursable expenses export as vendor bills.
- **Vendor bill date** – Choose whether exports use the date of the last expense, the export date, or the submitted date.
- **Export out-of-pocket expenses as** – Out-of-pocket expenses export as vendor bills.
- **Export company card expenses as** – Company card and Expensify Card expenses export as direct expenses.
- **Default vendor for all company cards** – Select the vendor used when an export can't be matched to a vendor automatically.
- **Company card account** – Select the DualEntry account used for company card expenses.

---

## How to configure DualEntry advanced settings

Advanced settings control sync frequency, reimbursement, and settlement automation.

On the DualEntry integration, choose **Advanced** to configure:

- **Auto-sync** – Automatically sync Expensify and DualEntry every day and export reports automatically using your selected export method.
- **Export method** – Choose when reports are exported automatically. This option is only available when auto-sync is enabled.
  - **Accrual** exports out-of-pocket expenses after final approval.
  - **Cash** exports out-of-pocket expenses after they are paid.
- **Sync reimbursed reports** – Automatically create bill payments in DualEntry when out-of-pocket reports are reimbursed in Expensify. This requires a DualEntry bill payment account.

---

# FAQ

## Which DualEntry accounts import as categories?

Only active expense (including cost of goods sold), current asset, and fixed asset accounts from your DualEntry chart of accounts import as categories.

## Why did my report fail to export to DualEntry?

Out-of-pocket expenses export as vendor bills matched to the report submitter's email. If no DualEntry vendor matches that email, the export fails. Make sure each report submitter exists as a vendor in DualEntry, or set a **Default vendor** in the export settings.

## Do I need a bill payment or settlement account?

A bill payment account is required only when **Sync reimbursed reports** is enabled. A settlement account is required only when **Sync Expensify Card settlements** or **Sync Travel Invoicing settlements** is enabled.
