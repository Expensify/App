---
title: Configure NetSuite
description: Learn how to configure the import, export, and advanced settings for Expensify's integration with NetSuite.
keywords: [New Expensify, NetSuite configuration, import settings, export settings, advanced sync, tags, corporate card export]
order: 2
---


Expensify’s integration with NetSuite streamlines expense management by automatically syncing reports. This reduces manual work, improves visibility, and supports accurate compliance and budgeting.

With this integration, you can:

- Speed up approvals and reimbursements
- Gain real-time visibility into spend
- Sync directly between Expensify and NetSuite

---

# Access NetSuite Configuration Settings

Each Expensify Workspace has its own configuration with NetSuite.

To access:

1. From the navigation tabs, go to **Workspaces > [Workspace Name] > Accounting**
2. Click **NetSuite > Configure**

---

# Step 1: Configure Import Settings

To control what data is imported from NetSuite:

1. Go to **Workspaces > [Workspace Name] > Accounting > NetSuite > Import**
2. Review and customize these options:

- **Categories** – NetSuite Expense Categories are imported automatically
- **Departments, Classes, and Locations** – Import as:
  - Tags (per expense)
  - Report Fields (per report)
  - Employee Defaults
- **Customers and Projects** – Import as Tags or Report Fields
  - To support **cross-subsidiary data**, enable **Intercompany Time and Expense** under **Setup > Company > Enable Features > Advanced Features**
- **Tax** – Imports NetSuite Tax Groups into the **Taxes** tab
- **Custom Segments and Records** – Import as Tags or Report Fields
  - Use Field IDs from NetSuite’s **Transactions** tab
  - Do not use the “Filtered by” feature in NetSuite Custom Segments
- **Custom Lists** – Import as Tags or Report Fields

3. Click the **three-dot icon** and choose **Sync Now** to apply changes

---

# Step 2: Configure Export Settings

To manage how reports are exported from Expensify to NetSuite:

1. Go to **Workspaces > [Workspace Name] > Accounting > NetSuite > Export**
2. Configure the following:

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

3. Click the **three-dot icon** > **Sync Now** to apply changes

---

# Step 3: Configure Advanced Settings

For additional control:

1. Go to **Workspaces > [Workspace Name] > Accounting > NetSuite > Advanced**
2. Configure the following options:

- **Auto-Sync** – Enable for daily syncing of NetSuite data
- **Sync Reimbursed Reports** – Automatically updates status between systems
- **Invite Employees & Set Approvals** – Imports employees and sets workflow
- **Auto Create Employees/Vendors** – Automatically creates a NetSuite record if one doesn’t exist
- **Enable Newly Imported Categories** – Activates newly synced Expense Categories
- **Approval Levels** – Set approval levels for:
  - Expense Reports
  - Vendor Bills
  - Journal Entries
- **Custom Form ID** – Use a specific NetSuite form instead of the default

3. Click the **three-dot icon** > **Sync Now** to apply changes

---

# FAQ

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

- **Reimbursable expenses** export after reimbursement
- **Company card expenses** export after approval
- **Auto-Sync** ensures reimbursement status updates automatically


## How do I configure corporate card exports in NetSuite?

1. Go to **Customization > Forms > Transaction Forms**
2. Open the correct form
3. Enable the following fields:
   - **Account for Corporate Card Expenses**
   - **Corporate Card**
4. Set the default card account on employee records


## Why can’t I import custom segments created before 2019.1?

Check the **Use as Field ID** box in NetSuite. This assigns a usable ID to older segments for import into Expensify.


## How does Auto-Sync work with reimbursed reports?

- When a report is reimbursed in Expensify, NetSuite marks it as paid
- If paid in NetSuite, Expensify reflects that during the next sync


## Will enabling Auto-Sync affect existing reports?

No. Auto-Sync only applies to newly approved reports. Export older reports manually if needed.


## How does multi-currency exporting work in NetSuite?

- The employee/vendor currency must match the subsidiary
- The bank account currency must match the subsidiary for bill payments

