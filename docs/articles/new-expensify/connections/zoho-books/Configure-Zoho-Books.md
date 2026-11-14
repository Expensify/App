---
title: Configure Zoho Books
description: Learn how to configure Zoho Books imports, exports, reimbursements, settlements, and company card accounts in Expensify.
keywords: [New Expensify, configure Zoho Books, Zoho Books import, Zoho Books export, Zoho Books auto-sync, Zoho Books settlements, company card account]
internalScope: Audience is workspace admins configuring a connected Zoho Books organization. Covers import, export, advanced sync, reimbursement and settlement settings, and card account routing. Does not cover authorization, report-level export actions, or expense-level vendor selection.
order: 2
---

# Configure Zoho Books

Configure how Expensify imports accounting data from Zoho Books, exports expenses, and syncs payments and settlements.

If you haven't connected your organization yet, learn how to [connect to Zoho Books](/articles/new-expensify/connections/zoho-books/Connect-to-Zoho-Books).

## Where to find Zoho Books configuration settings

Only workspace admins can configure the connection.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Connections**.
2. Select **Configure** next to Zoho Books.
3. Select **Import**, **Export**, or **Advanced**.

## How to configure Zoho Books import settings

Select **Import** to configure:

- **Accounts** – Imports active expense, cost of goods sold, other expense, other current asset, and fixed asset accounts as categories. This setting is always enabled.
- **Enable newly imported accounts** – Controls whether accounts added by later syncs become enabled categories. This defaults to off. Categories from the initial import are enabled.
- Reporting tags – Enable the individual Zoho Books reporting tags you want to import as Expensify tags. These imports default to off.
- **Tax rates** – Enable this to import Zoho Books tax rates. This defaults to off.

Reporting-tag and tax settings appear when the selected organization has that data available. Manage the source accounting data in Zoho Books, then sync the connection to refresh it in Expensify.

## How to configure Zoho Books export settings

Select **Export** to configure:

- **Preferred exporter** – Select the person responsible for exporting reports.
- **Export reimbursable expenses as** – Displays **Vendor bills**. Reimbursable expenses are grouped by report using the employee's Zoho Books vendor.
- **Vendor bill date** – Choose **Date of last expense**, **Export date**, or **Submitted date**. The default is **Date of last expense**.
- **Export company card expenses as** – Displays **Expenses**. Each company card expense creates a separate expense in Zoho Books.
- **Default vendor for all company cards** – Optionally select a vendor to use when an expense has no vendor assigned.
- **Company card account** – Select an active Zoho Books bank or credit card account for company card expenses.

The export record types are fixed; they aren't choices you can change.

Each employee submitting reimbursable expenses must already exist as a vendor in Zoho Books with a matching email address. The exported bill and employee vendor must use the same currency.

Learn how to [manage Zoho Books vendor matching](/articles/new-expensify/connections/zoho-books/Manage-Vendor-Matching-for-Zoho-Books).

## How to export company card expenses to multiple Zoho Books accounts

Use different accounts for individual card programs or cards when you don't want all card expenses to use the workspace default.

1. In the Zoho Books configuration settings, select **Export**.
2. Enable **Configure exporting to multiple accounts**. This setting appears when the workspace has active company cards.
3. Select **Card program account** to choose an account for a card program or feed.
4. Select **Per-card account** to choose an account for an individual card.

For each expense, Expensify uses the individual card account first, then the card program account, then the workspace **Company card account**.

Disabling **Configure exporting to multiple accounts** hides these controls; it doesn't clear previously selected account overrides. Review the program and card selections when changing your routing.

## How to configure Zoho Books automatic exports

1. In the Zoho Books configuration settings, select **Advanced**.
2. Enable **Auto-sync**.
3. Select **Export method** and choose when reimbursable expenses should export:
   - **Accrual** – After final approval.
   - **Cash** – After payment.

Auto-sync refreshes accounting data daily and automatically exports reports. You can still export reports manually when needed.

Learn how to [export reports to Zoho Books](/articles/new-expensify/connections/zoho-books/Export-Reports-to-Zoho-Books).

## How to sync reimbursed reports with Zoho Books

1. In the Zoho Books configuration settings, select **Advanced**.
2. Enable **Sync reimbursed reports**.
3. If you reimburse through Expensify, select **Bill payment account** and choose an active Zoho Books bank or cash account.

For reports reimbursed through Expensify by ACH, Expensify records a bill payment against the exported Zoho Books bill. This records the reimbursement; it doesn't initiate another payout. A bill payment account is required to record these payments.

If ACH reimbursement is disabled for the workspace, Expensify can instead mark an approved report reimbursed after its exported bill is fully paid in Zoho Books. The bill must have no remaining balance, its total must still match the report, and completed payments must cover the full amount. Pending payments and vendor credits alone don't qualify.

## How to sync Expensify Card settlements to Zoho Books

1. In the Zoho Books configuration settings, select **Advanced**.
2. Enable **Sync Expensify Card settlements**.
3. Select **Expensify Card settlement account** and choose the active USD bank or cash account used for settlements.

This setting appears after Expensify Card is fully set up. Expensify records settlements as bank transactions in Zoho Books. The other side uses the Expensify Card program account, or the workspace **Company card account** if no program override is selected.

## How to sync Consolidated Travel Billing settlements to Zoho Books

1. In the Zoho Books configuration settings, select **Advanced**.
2. Enable **Sync Consolidated Travel Billing settlements**.
3. Select **Consolidated Travel Billing settlement account** and choose the active USD bank or cash account used for settlements.
4. Select **Consolidated Travel Billing payable account** and choose the credit card or other current liability account used for Travel amounts owed.

These settings appear when Consolidated Travel Billing is enabled. Expensify records Travel settlements as journal entries between the payable and settlement accounts. These account selections are separate from your reimbursement account.
