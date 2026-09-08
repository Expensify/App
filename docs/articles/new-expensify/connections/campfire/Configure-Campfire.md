---
title: Configure Campfire
description: Learn how to configure Campfire import, export, and advanced sync settings in Expensify.
keywords: [New Expensify, Campfire configuration, Campfire import, Campfire export, Campfire advanced sync, Campfire vendor bills, Campfire journal entries]
internalScope: Audience is Workspace Admins configuring an existing Campfire connection. Covers import, export, advanced sync and settlement, and multiple card account export settings. Does not cover the initial connection or API-key setup, or exporting individual reports.
order: 2
---

# Configure Campfire

Configure how Expensify imports accounting data from Campfire and exports expenses back to your accounting system.

If you haven't connected Campfire yet, learn how to [connect to Campfire](/articles/new-expensify/connections/campfire/Connect-to-Campfire).

Once configured, you can:

- Import categories, tags, and tax rates from Campfire.
- Export out-of-pocket and card expenses.
- Automatically sync reports, reimbursements, and settlements.

---

## Where to find Campfire configuration settings

Each workspace has its own Campfire integration. To view or update the configuration settings:

1. In the navigation tabs (on the left on web, on the bottom on mobile) go to **Workspaces > [workspace name]**.
2. Select **Accounting**.
3. On the Campfire connection, select **Import**, **Export**, or **Advanced**.

<!-- SCREENSHOT:
Suggestion: The Accounting page showing the connected Campfire integration with the Import, Export, and Advanced settings visible.
Location: Immediately after the steps above.
Purpose: Admins frequently miss that Import, Export, and Advanced are separate pages on the connection row rather than a single settings screen.
-->

---

## How to configure Campfire import settings

Import settings control which accounting data is imported from Campfire into Expensify.

On the Campfire integration, choose **Import** to configure:

- **Chart of accounts** – Imports active Campfire accounts with the expense, cost of goods sold, other expense, other current asset, deferred expense, prepaid, fixed asset, and long-term liability subtypes as categories. This setting is always enabled.
- **Departments** – Import Campfire departments as tags. This is off by default.
- **Custom dimensions** – Import each Campfire custom dimension group as tags. Each group can be enabled independently, and all are off by default.
- **Tax rates** – Import payable-type Campfire tax rates as taxes. This option only appears when your Campfire organization has tax rates configured, and it's off by default.

Campfire shares one chart of accounts across all of its entities, so your imported categories are the same no matter which subsidiary you select.

---

## How to configure Campfire export settings

Export settings determine how Expensify sends data to Campfire.

On the Campfire integration, choose **Export** and configure:

- **Preferred exporter** – Assign the Workspace Admin to automatically receive reports to export.
- **Export date** – Choose whether exports use the date of the last expense, the export date, or the submitted date.
- **Export out-of-pocket expenses as** – Out-of-pocket expenses export as vendor bills using Campfire's reimbursement bill type.
- **Default vendor** – Select the vendor used when an export can't be matched to a vendor automatically.
- **Export company card expenses as** – Company card and Expensify Card expenses export as journal entries.
- **Company card account** – Select the Campfire account that card journal entries post to.
- **Configure exporting to multiple accounts** – Configure different Campfire accounts for individual card programs or cards. This setting is off by default.

---

## How out-of-pocket and card expenses export to Campfire

Out-of-pocket and card expenses use two different Campfire records:

- **Out-of-pocket expenses** export as vendor bills tagged with Campfire's reimbursement bill type. Expensify matches the bill to the eligible Campfire vendor whose email matches the report submitter. If no matching vendor exists, the export fails.
- **Card expenses** export as journal entries that debit the accounts mapped to each expense's category and credit the account you selected for card export.

When tax rate import is enabled, each vendor bill line carries the Campfire tax rate mapped to that expense.

Card refunds post as reversal journal entries, so a report containing refunds — or containing only refunds — exports the same way as any other card report.

---

## How to export company card expenses to multiple Campfire accounts

If your organization posts card spend to more than one Campfire account, you can export different card programs or individual cards to different accounts.

On the Campfire integration, choose **Export** and enable **Configure exporting to multiple accounts**. Then configure:

- **Card program account** – Assign a Campfire account for each company card feed. The Expensify Card feed appears here as its own card program.
- **Per-card account** – Override the card program account for an individual card.

An individual card uses its per-card account when one is configured. Otherwise, it uses its card program account. If the card program doesn't have an account, it uses the workspace **Company card account**.

You can also set an individual card's Campfire export account from **Workspaces > [workspace name] > Company cards**, then selecting the card to open its details.

---

## How to configure Campfire advanced settings

Advanced settings control sync frequency, reimbursement, and settlement automation.

On the Campfire integration, choose **Advanced** to configure:

- **Auto-sync** – Automatically sync Expensify and Campfire every day and export eligible reports automatically. This is enabled by default.
- **Export method** – Choose when reports are exported automatically. This option is only available when auto-sync is enabled.
  - **Accrual** exports out-of-pocket expenses after final approval.
  - **Cash** exports out-of-pocket expenses after they are paid.
- **Sync reimbursed reports** – Record the corresponding bill payment in Campfire when an exported out-of-pocket report is reimbursed in Expensify. This is enabled by default.
- **Campfire bill payment account** – Select the Campfire account used for those bill payments. This is required when **Sync reimbursed reports** is enabled.
- **Sync Expensify Card settlements** – Book a settlement journal entry in Campfire for Expensify Card settlement payments. This is enabled by default and appears only when Expensify Card is enabled on the workspace.
- **Sync Travel Invoicing settlements** – Book a settlement journal entry in Campfire for Travel Invoicing settlement payments. This is enabled by default and appears only when Travel Invoicing is enabled on the workspace, and it has its own settlement account and payable account.

---

## How Expensify Card settlements post to Campfire

A settlement journal entry debits the credit card account selected for the Expensify Card feed and credits the bank account that settlements are paid from. Both accounts are required for settlements to sync.

The workspace **Company card account** and any individual card accounts are used for expense exports only. They are never used for settlements.

---

# FAQ

## Which Campfire accounts import as categories?

Active Campfire accounts with the expense, cost of goods sold, other expense, other current asset, deferred expense, prepaid, fixed asset, and long-term liability subtypes import as categories.

## Why did my report fail to export to Campfire?

Out-of-pocket expenses export as vendor bills matched to the report submitter's email. If no eligible Campfire vendor matches that email, the export fails. Make sure the report submitter exists as a vendor in Campfire with a matching email address.

## How do card refunds export to Campfire?

Refunds post as reversal journal entries. Reports that mix charges and refunds, and reports that contain only refunds, export the same way as any other card report.

## Which Campfire account does a company card use?

By default, card expenses post to the workspace **Company card account**.

If **Configure exporting to multiple accounts** is enabled, a card can instead use a card program account or a per-card account. Per-card settings take precedence over the card program account, and the card program account takes precedence over the workspace **Company card account**.

## Do I need a bill payment or settlement account?

Yes, when the matching sync setting is on. A Campfire bill payment account is required when **Sync reimbursed reports** is enabled. A Campfire bank account and the Expensify Card feed's credit card account are both required when **Sync Expensify Card settlements** is enabled. **Sync Travel Invoicing settlements** requires its own settlement account and payable account.

## Why don't I see the Expensify Card or Travel Invoicing settlement settings?

**Sync Expensify Card settlements** appears only when Expensify Card is enabled on the workspace, and **Sync Travel Invoicing settlements** appears only when Travel Invoicing is enabled.

## Why don't I see tax rates in my import settings?

Tax rate import only appears when your Campfire organization has payable-type tax rates configured.
