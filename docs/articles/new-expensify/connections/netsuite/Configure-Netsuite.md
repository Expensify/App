---
title: Configure NetSuite
description: Learn how to configure the import, export, and advanced settings for Expensify's integration with NetSuite.
keywords: [New Expensify, NetSuite configuration, import settings, export settings, advanced sync, tags, corporate card export, Split exports by posting period, Export to next open period, When to Export, Accrual, Cash, export after approval without payment]
internalScope: Audience is workspace admins. Covers configuring an existing NetSuite connection, including automatic export timing. Does not cover connecting NetSuite or troubleshooting export errors.
order: 2
---

# Configure NetSuite

Expensify’s integration with NetSuite streamlines expense management by automatically syncing reports. This reduces manual work, improves visibility, and supports accurate compliance and budgeting.

With this integration, you can:

- Speed up approvals and reimbursements
- Gain real-time visibility into spend
- Sync directly between Expensify and NetSuite

---

## How to access NetSuite configuration settings

Each Expensify Workspace has its own configuration with NetSuite.

To access:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Connections**.
2. Select **Configure** next to NetSuite.

---

## How to configure NetSuite import settings

To control what data is imported from NetSuite:

1. Select **Workspaces > [workspace name] > Connections**.
2. Select **Configure** next to NetSuite.
3. Select **Import**.
4. Review and customize these options:

- **Categories** – NetSuite Expense Categories are imported automatically
- **Departments, Classes, and Locations** – Import as:
  - Tags (per expense)
  - Report Fields (per report)
  - Employee Defaults
- **Customers and Projects** – Import as Tags or Report Fields
  - To support **cross-subsidiary data**, enable **Intercompany Time and Expense** under **Setup > Company > Enable Features > Advanced Features**
- **Tax** – Imports Tax Groups from legacy tax accounts or individual Tax Codes from SuiteTax accounts
- **Custom Segments and Records** – Import as Tags or Report Fields
  - Use Field IDs from NetSuite’s **Transactions** tab
  - Do not use the “Filtered by” feature in NetSuite Custom Segments
- **Custom Lists** – Import as Tags or Report Fields

5. Select **More (⋮)**, then select **Sync now** to apply changes.

---

## How to configure NetSuite export settings

To manage how reports are exported from Expensify to NetSuite:

1. Select **Workspaces > [workspace name] > Connections**.
2. Select **Configure** next to NetSuite.
3. Select **Export**.
4. Configure the following:

- **Preferred Exporter** – Select the Workspace Admin who will handle exports
- **Export Date Options** – Choose from:
  - Date of Last Expense
  - Submitted Date
  - Exported Date
- **Export Out-of-Pocket Expenses As**:
  - Expense Reports
  - Vendor Bills
  - Journal Entries *(Note: Journal Entries do not support Customers or Projects)*
- **Export Company Card Expenses As**:
  - Expense Reports
  - Vendor Bills
  - Journal Entries
  - *Expensify Card expenses always export as Journal Entries*
- **Export Invoices To** – Choose the Accounts Receivable account
- **Invoice Item** – Select or create the item line for invoices
- **Export Foreign Currency Amount** – Enable to export original currency values
- **Export to Next Open Period** – Enable to skip closed periods and use the next available NetSuite period
- **Split exports by posting period** – Enable to export non-reimbursable expenses as one NetSuite transaction per calendar month, each dated in its own month. **Export to next open period** must be on first. While this toggle is on, **Export to next open period** stays locked on.
- **Export Expensify Travel Payable To** – If Expensify Travel's Consolidated Travel Billing feature is enabled, configure where travel card expenses are exported:
- **Consolidated Travel Billing** – If Expensify Travel's Consolidated Travel Billing feature is enabled, click this row to open the **Consolidated Travel Billing** page and configure where travel card expenses are exported:
  - **Non-reimbursable journal posting account** – Select the payable account for Expensify Travel expenses
  - **Journal posting preference** – Choose how journal entries post
  - **Sync Consolidated Travel Billing settlements** – Turn on this toggle to continuously reconcile settlements through NetSuite. Turning it on opens a picker where you choose the **Reconciliation account** that matches your settlement account, and that account then appears in a **Reconciliation account** row below the toggle. The toggle stays locked until you select a **Non-reimbursable journal posting account** and enable **Auto-sync** on the **Advanced** page.

5. Select **More (⋮)**, then select **Sync now** to apply changes.

---

<a id="step-3-configure-advanced-settings"></a>

## How to configure NetSuite advanced settings

For additional control:

1. Select **Workspaces > [workspace name] > Connections**.
2. Select **Configure** next to NetSuite.
3. Select **Advanced**.
4. Configure the following options:

- **Auto-sync** – Enable to sync NetSuite data daily and export reports automatically. For reimbursable expenses, **Accrual** exports after final approval; **Cash** waits until the report is paid or marked as paid. Learn [how to choose when reimbursable expenses export to NetSuite](#how-to-choose-when-reimbursable-expenses-export-to-netsuite).
- **Sync Reimbursed Reports** – Automatically updates status between systems
- **Invite Employees & Set Approvals** – Imports employees and sets workflow
- **Auto Create Employees/Vendors** – Automatically creates a NetSuite record if one doesn’t exist
- **Enable Newly Imported Categories** – Activates newly synced Expense Categories
- **Approval Levels** – Set approval levels for:
  - Expense Reports
  - Vendor Bills
  - Journal Entries
- **Custom Form ID** – Use a specific NetSuite form instead of the default
- **Currency conversion fee account** – Select the account for currency conversion (FX) fees. This setting appears under **Sync reimbursed reports** only when it is enabled, you reimburse through Expensify, and a business bank account is connected. If **Workspaces > [workspace name] > Workflows > Payments > Currency conversion fees** is set to **Company pays**, each cross-border reimbursement exports a separate journal entry for the fee alongside the bill payment. This journal entry:
  - Debits the selected currency conversion fee account and credits cash
  - Uses the memo “Foreign Exchange Fees for Expensify report [reportID]”
  - Only exports if this account is mapped

**Sync Consolidated Travel Billing settlements** is not on this page. It is on the **Consolidated Travel Billing** page under **Export**. Learn more about [Consolidated Travel Billing](/travel/hubs/consolidated-travel-billing/).

5. Select **More (⋮)**, then select **Sync now** to apply changes.

---

## How to choose when reimbursable expenses export to NetSuite

The accounting method controls when reimbursable (out-of-pocket) expenses export automatically to NetSuite. In New Expensify, this setting is labeled **When to Export**:

- **Accrual** – Expenses export after the report receives final approval. You don't need to pay the report in Expensify or mark it as paid before export.
- **Cash** – Expenses export after the report is paid in Expensify or marked as paid.

To configure automatic exports:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Connections**.
2. Select **Configure** next to **NetSuite**.
3. Select **Advanced > Auto-sync**.
4. Enable **Auto-sync**.
5. Select **When to Export** and choose **Accrual** or **Cash**.

---

# FAQ

## Can I export reports automatically after approval without paying them in Expensify?

Yes. Enable **Auto-sync** and set **When to Export** to **Accrual**. Reimbursable expenses export after final approval, so you can process payment outside Expensify afterward without first paying the report in Expensify or marking it as paid.

Follow the steps to [choose when reimbursable expenses export to NetSuite](#how-to-choose-when-reimbursable-expenses-export-to-netsuite).

## How do I import new tags (departments, classes, locations) from NetSuite?

1. Add new tags in NetSuite
2. Sync the NetSuite connection in Expensify
3. Enable or disable tags in **Workspaces > [Workspace Name] > Tags**


## Can I automate employee invitations and approval workflows from NetSuite?

Yes. When enabled:

- Employees are imported from the connected NetSuite subsidiary
- Invitations are emailed
- Approval workflows can be customized in **Workspaces > [Workspace Name] > Workflows**


## Why do company card expenses export immediately, but reimbursable expenses don’t?

With **Auto-sync** enabled, company card expenses export after approval. Reimbursable expenses follow **When to Export**: **Cash** waits until the report is paid or marked as paid, while **Accrual** exports after final approval without requiring payment first.


## How do I configure corporate card exports in NetSuite?

1. Go to **Customization > Forms > Transaction Forms**
2. Open the correct form
3. Enable the following fields:
   - **Account for Corporate Card Expenses**
   - **Corporate Card**
4. Set the default card account on employee records


## Why can’t I import custom segments created before 2019.1?

Check the **Use as Field ID** box in NetSuite. This assigns a usable ID to older segments for import into Expensify.


## How does Auto-sync work with reimbursed reports?

- When a report is reimbursed in Expensify, NetSuite marks it as paid
- If paid in NetSuite, Expensify reflects that during the next sync


## Will enabling Auto-sync affect existing reports?

No. Auto-sync only applies to newly approved reports. Export older reports manually if needed.


## How does Split exports by posting period work in NetSuite?

When **Split exports by posting period** is on, a report with non-reimbursable expenses from different months exports as a separate NetSuite transaction for each month. Each transaction is dated in its own month. If a month falls in a closed NetSuite period, **Export to next open period** moves that transaction to the next open period.


## Why can’t I turn off Export to next open period?

**Export to next open period** is locked on while **Split exports by posting period** is on. To turn off **Export to next open period**, first turn off **Split exports by posting period**.


## Why can’t I turn on Split exports by posting period?

**Split exports by posting period** is locked until **Export to next open period** is on. Turn on **Export to next open period** first, then turn on **Split exports by posting period**.


## How does multi-currency exporting work in NetSuite?

- The employee/vendor currency must match the subsidiary
- The bank account currency must match the subsidiary for bill payments
