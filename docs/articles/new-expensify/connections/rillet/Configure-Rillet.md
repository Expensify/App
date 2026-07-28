---
title: Configure Rillet Settings
description: Learn how to configure Rillet import, export, and advanced sync settings in Expensify.
keywords: [New Expensify, Rillet configuration, Rillet import, Rillet export, Rillet advanced sync, Rillet vendor bills]
internalScope: Audience is Workspace Admins configuring an existing Rillet connection. Covers import, export, advanced sync and settlement, and multiple card account export settings. Does not cover the initial connection or API-key setup.
---

Once your Workspace is connected to Rillet, configure how data imports from and exports to Rillet. If you haven't connected yet, learn how to [connect your Workspace to Rillet](/articles/new-expensify/connections/rillet/Connect-to-Rillet).

The Rillet integration is currently in beta and is rolled out to select customers.

## How to open your Rillet configuration settings

Each Workspace has its own Rillet configuration. To view or update it:

1. In the left-hand menu, select **Settings > Workspaces**, then choose your Workspace.
2. Select **Accounting** in the Workspace menu.
3. Under the Rillet connection, select **Import**, **Export**, or **Advanced**.

## How to set up Rillet import settings

Import settings control which Rillet data appears in Expensify. Under the Rillet connection, select **Import** and configure:

- **Chart of accounts** – Active expense, current asset, and fixed asset accounts import as Categories.
- **Enable newly imported accounts** – Choose whether newly imported accounts arrive as enabled or disabled categories. This defaults to off, so new accounts import as disabled categories.
- **Dimensions** – Each Rillet dimension appears as its own import row with a toggle that defaults to off. Enabled dimensions import as tags.
- **Tax rates** – This toggle appears only when your Rillet organization returns tax rates during sync, and it defaults to off.

## How to set up Rillet export settings

Export settings determine how Expensify sends data to Rillet. Under the Rillet connection, select **Export** and configure:

- **Preferred exporter** – Assign a Workspace Admin to automatically receive reports to export.
- **Export reimbursable expenses as** – Reimbursable expenses export as vendor bills.
- **Vendor bill date** – Choose the date used on the vendor bill. This defaults to the last expense date.
- **Default vendor** – Select the vendor used when an export can't be matched to a specific vendor.
- **Export company card expenses as** – Company card expenses export as credit card charges.
- **Company card account** – Select the Rillet chart-of-accounts credit card account used for company card expenses.

## How Rillet export works

- **Reimbursable expenses** export to Rillet as vendor bills. Each report exports to the vendor whose email matches the report submitter. If no Rillet vendor matches the submitter's email, the export fails with an error, so make sure each submitter exists as a vendor in Rillet.
- **Non-reimbursable expenses** export to Rillet as charges (credit card transactions) to the vendor set on the expense, or to the **Default vendor** when no vendor is set on the expense.

## How to configure Rillet advanced settings

Advanced settings control sync frequency, reimbursement, and settlement automation. Under the Rillet connection, select **Advanced** and configure:

- **Auto-sync** – Automatically keep Rillet and Expensify in sync, using the same accounting-method behavior as other integrations.
- **Sync reimbursed reports** – When enabled, a bill payment account is required. When a report exported as a vendor bill is reimbursed through Expensify, Expensify creates the matching bill payment in Rillet.
- **Sync Expensify Card settlements** – When enabled, a settlements account is required. Expensify Card settlement payments sync to the selected settlement bank account in Rillet.

## How to export company card expenses to multiple Rillet accounts

If you use more than one company card account, you can map each card to its own Rillet account. Under the Rillet connection, select **Export** and configure:

- **Configure exporting to multiple accounts** – Enable this toggle at the bottom of the Export settings to map company card expenses to more than one Rillet account.
- **Card program account** – Select the Rillet account used for the card program.
- **Per-card account** – Select the Rillet account used for each individual card.

When this toggle is off, company card expenses export to the single **Company card account** selected in the export settings.

# FAQ

## Which Rillet accounts import as Categories?

Only active expense, current asset, and fixed asset accounts from your Rillet chart of accounts import as Categories.

## Why did my report fail to export to Rillet?

Reimbursable expenses export as vendor bills matched to the report submitter's email. If no Rillet vendor matches that email, the export fails. Make sure each report submitter exists as a vendor in Rillet.

## Do I need a bill payment or settlements account?

A bill payment account is required only when **Sync reimbursed reports** is enabled, and a settlements account is required only when **Sync Expensify Card settlements** is enabled.
