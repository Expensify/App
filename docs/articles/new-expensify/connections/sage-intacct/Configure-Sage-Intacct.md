---
title: Configure Sage Intacct
description: Configure import, export, and advanced sync settings for Expensify's Sage Intacct integration.
keywords: [New Expensify, Sage Intacct settings, import configuration, export preferences, auto-sync, custom dimensions]
order: 3
---


Set up and fine-tune how data flows between Expensify and Sage Intacct using import, export, and advanced configuration settings.

---

# Step 1: Select Entity (for multi-entity Sage Intacct setups)

If your Sage Intacct account supports multiple entities, you can connect each Workspace in Expensify to a specific entity or to the Top Level.

To change the entity connection:

1. From the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting**
2. Under the Sage Intacct connection, select **Entity**

---

# Step 2: Configure Import Settings

To configure how data is imported from Sage Intacct:

1. From the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting**
2. Click **Import** under the Sage Intacct section

## Expense Types vs. Chart of Accounts

- **Exporting as Expense Reports**: Categories in Expensify come from **Expense Types** in Sage Intacct
- **Exporting as Vendor Bills**: Categories are imported from your **Chart of Accounts (GL Codes)**

To export successfully, disable any unnecessary categories by going to **Workspaces > [Workspace Name] > Categories**. Every expense must have a category.

## Billable Expenses

To enable billable expenses:

- Ensure read-only permissions are enabled for relevant Sage Intacct modules (e.g., Projects, Purchasing, Inventory Control)
- Once enabled, map categories to specific Sage Intacct Items
- When marking an expense as billable, users must choose the correct Category to avoid export errors

## Standard Dimensions (Departments, Classes, Locations)

You can import these into Expensify as:

- **Tags** – Selectable per expense
- **Report Fields** – Selectable per report
- **Sage Intacct employee default** – Automatically applied (only with Expense Reports)

Manage these settings under:

- **Tags**: **Workspaces > [Workspace Name] > Tags**
- **Report Fields**: **Workspaces > [Workspace Name] > Reports**

> Note: Tag names may appear as "Tag" in reports even if they map to Departments.

## Customers and Projects

Import customers and projects into Expensify as:

- **Tags** – Select per expense
- **Report Fields** – Select per report

Manage these settings the same way as standard dimensions.

## Tax

To import native VAT or GST tax rates:

1. Go to **Workspaces > [Workspace Name] > Accounting**
2. Click **Import** under Sage Intacct
3. Toggle on **Tax**

Set default rates per category under **Categories**. If you don’t see the Tax option, click the three-dot menu next to Sage Intacct and **resync the connection**.

## User-defined dimensions (UDDs)

To import UDDs:

1. In Sage Intacct:  
   - Go to **Platform Services > Objects > List**
   - Filter by application: "user-defined dimensions"
2. In Expensify:  
   - Go to **Workspaces > [Workspace Name] > Accounting**
   - Click **Import** > Enable **User-defined dimensions**
   - Enter the Integration Name and choose whether to import as **Tags** or **Report Fields**
   - Click **Save**

---

# Step 3: Configure Export Settings

To access export settings:

1. Go to **Workspaces > [Workspace Name] > Accounting**
2. Click **Export** under Sage Intacct

## Preferred Exporter

- Any Workspace Admin can export reports
- Concierge auto-exports on behalf of the **Preferred Exporter**
- The Preferred Exporter is notified of any export errors

## Export Date

Choose which date Expensify should use when creating records in Sage Intacct:

1. **Date of last expense**
2. **Export date**
3. **Submitted date**

## Export out-of-pocket expenses as

- Export as **Expense Reports** or **Vendor Bills**
- If using Expense Reports, you can set a **default vendor** for unmatched expenses

## Export company card expenses as

Choose one of the following:

- **Credit Card Charges**:
  - Requires selecting a credit card account
  - Optional: Set a default vendor for unmatched charges
  - Not supported at top-level if multi-currency is enabled
- **Vendor Bills**:
  - Optional: Set a default vendor for unmatched charges

If you manage company cards in Expensify, you can map each card to a specific account for export.

---

# Step 4: Configure Advanced Settings

To access advanced settings:

1. Go to **Workspaces > [Workspace Name] > Accounting**
2. Click **Advanced** under Sage Intacct

## Auto-sync

We recommend enabling **Auto-sync** to keep data up to date:

- Daily imports from Sage Intacct (e.g., dimensions, employees)
- Automatic report export after final approval or reimbursement
- Reimbursement status is synced between platforms

## Invite Employees

Enable this to:
- Automatically invite all employees from the Sage Intacct entity
- Apply a custom approval workflow in Expensify:

  - **Basic Approval**: All reports go to a single Final Approver
  - **Manager Approval**: Reports route to the user's Sage Intacct manager
  - **Configure Manually**: Set your own approval chain in **Workspaces > [Workspace Name] > Workflows**

## Sync Reimbursed Reports

Choose how to sync reimbursement status:

- **If reimbursing through Expensify**:
  - Exported reports create a corresponding bill payment in Sage Intacct
  - Bill payments post to the selected **Cash and Cash Equivalents** account

- **If reimbursing outside Expensify**:
  - Reports exported after final approval
  - When marked Paid in Sage Intacct, the status syncs back to Expensify

**Note**: Make sure the selected account matches your Bill Payments default in Sage Intacct.

---

# FAQ

## Will enabling auto-sync affect previously approved reports?

No. Auto-sync only affects newly approved reports. Older approved or reimbursed reports must be exported manually if they weren’t synced before enabling auto-sync.

