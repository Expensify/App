---
title: Configure Campfire
description: Learn how to configure Campfire import, export, and advanced sync settings in Expensify, including exporting company cards to multiple Campfire accounts.
keywords: [New Expensify, Campfire configuration, Campfire import, Campfire export, Campfire advanced settings, Campfire vendor bills, Campfire journal entries, Campfire auto-sync, Campfire settlements, Campfire card program account, Workspace Admin]
internalScope: Audience is Workspace Admins configuring an existing Campfire connection. Covers import, export, advanced sync and settlement, and multiple card account export settings. Does not cover the initial connection, API key setup, or exporting individual reports.
order: 2
---

# Configure Campfire

Configure how Expensify imports accounting data from Campfire and exports expenses back to Campfire.

If you haven't connected Campfire yet, learn how to [connect to Campfire](/articles/new-expensify/connections/campfire/Connect-to-Campfire).

Once configured, you can:

- Import categories, tags, and tax rates from Campfire.
- Export reimbursable expenses as vendor bills and company card expenses as journal entries.
- Sync reports, reimbursements, and settlements automatically.

---

## Where to find Campfire configuration settings

Each workspace has its own Campfire connection. To view or update its settings:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. On the Campfire connection, select **Import**, **Export**, or **Advanced**.

---

## How to configure Campfire import settings

Import settings control which coding data Expensify imports from Campfire.

On the Campfire connection, select **Import** to configure:

- **Chart of accounts** – Imports your Campfire accounts as categories. This setting is always on.
- **Enable newly imported accounts** – Choose whether new Campfire accounts arrive as enabled categories. This setting is off by default.
- **Department** and Campfire dimensions – Under **All Campfire dimensions import as tags**, turn on each dimension you want to import. Each one you turn on becomes its own tag list. All dimensions are off by default.
- **Tax rates** – Import Campfire tax rates as workspace taxes. This option only appears when your Campfire subsidiary has tax rates.

---

## How to configure Campfire export settings

Export settings control how Expensify sends reports to Campfire.

On the Campfire connection, select **Export** to configure:

- **Preferred exporter** – Choose the workspace admin who receives reports to export.
- **Export reimbursable expenses as** – Reimbursable expenses export as **Vendor bills**.
- **Vendor bill date** – Choose **Date of last expense**, **Export date**, or **Submitted date**.
- **Export company card expenses as** – Company card expenses export as **Journal entries**.
- **Default vendor for all company cards** – Choose the Campfire vendor used for company card expenses that don't match a vendor automatically.
- **Company card account** – Choose the Campfire credit card or bank account that company card expenses post to.
- **Configure exporting to multiple accounts** – Send different card programs or individual cards to different Campfire accounts.

Vendor bills are matched to the Campfire vendor whose email matches the report submitter's email.

---

## How to configure Campfire advanced settings

Advanced settings control automatic syncing, reimbursements, and settlements.

On the Campfire connection, select **Advanced** to configure:

- **Auto-sync** – Sync Campfire and Expensify every day, and export reports automatically.
- **Export method** – Choose when reports export automatically. This option only appears when **Auto-sync** is on.
  - **Accrual** exports out-of-pocket expenses when they are final approved.
  - **Cash** exports out-of-pocket expenses when they are paid.
- **Sync reimbursed reports** – When a report is paid via ACH, Expensify creates a bill payment in Campfire. Choose the **Bill payment account** that Campfire credits.
- **Sync Expensify Card settlements** – Create the Expensify Card settlement payment in Campfire. Choose the **Expensify Card settlement account** the settlement is paid from. This option only appears when the Expensify Card is set up on the workspace.
- **Sync Travel Invoicing settlements** – Create Travel Invoicing settlement payments in Campfire. Choose a **Travel Invoicing settlement account** and a **Travel Invoicing payable account**. This option only appears when Travel Invoicing is turned on.

---

## How to export company card expenses to multiple Campfire accounts

If you track card spend in more than one Campfire account, you can send each card program or individual card to its own account.

1. On the Campfire connection, select **Export**.
2. Turn on **Configure exporting to multiple accounts**.
3. Select **Card program account**, choose a card program, and then choose its Campfire account.
4. Select **Per-card account**, choose a card program and a card, and then choose the card's Campfire account.

When Expensify exports a company card expense, it uses the card's account first. If the card has no account set, Expensify uses its card program's account. If neither is set, Expensify uses the **Company card account**.

You can also see a card's export account on its card details page under **Accounting**.

**Note:** **Configure exporting to multiple accounts** only appears when the workspace has at least one assigned company card.

---

# FAQ

## Which Campfire accounts import as categories?

Active Campfire accounts with these subtypes import as categories: expense, cost of goods sold, other expense, other current asset, deferred expense, prepaid, fixed asset, and long-term liability.

## Why don't I see Campfire dimensions on the Import page?

**All Campfire dimensions import as tags** only appears when Expensify finds dimensions in your Campfire organization. Add dimensions in Campfire, then sync the connection again.

## Do I need a bill payment or settlement account?

You need a **Bill payment account** only when **Sync reimbursed reports** is on. You need a settlement account only when **Sync Expensify Card settlements** or **Sync Travel Invoicing settlements** is on.

## Why don't I see Sync Expensify Card settlements?

**Sync Expensify Card settlements** only appears when the Expensify Card is set up on the workspace.
