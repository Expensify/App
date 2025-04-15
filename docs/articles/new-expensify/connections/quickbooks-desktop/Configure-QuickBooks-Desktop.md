---
title: Configure-QuickBooks-Desktop.md
description: Learn how to connect and configure your QuickBooks Desktop integration with Expensify to manage imports, exports, and advanced accounting settings.
keywords: [QuickBooks Desktop, Expensify integration, accounting settings, import settings, export settings, QBD, configure QuickBooks Desktop]
---

Connecting QuickBooks Desktop to Expensify helps streamline expense reporting, reimbursements, and accounting workflows. This guide walks you through configuring your import, export, and advanced settings for QuickBooks Desktop.

---

# Step 1: Configure Import Settings

These steps define how your QuickBooks Desktop data is pulled into Expensify.

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click the **Import** tab under the QuickBooks Desktop connection.
3. Configure the following options:
   - **Chart of Accounts**: Automatically imported and used as categories.
   - **Customers/Projects**: Imported as tags for expense-level tracking.
   - **Classes**: Imported as tags for class-level tracking.
   - **Items**: Imported for itemized coding.
   - **Vendors**: Imported and used when exporting as vendor bills or checks.
4. **Disable any items you don’t want to use**:
   - Use the toggle on the right of each row to disable individual items.
   - Or use the checkboxes to select multiple items and click **Disable** at the top.

---

# Step 2: Configure Export Settings

These settings control how Expensify exports reports and transactions to QuickBooks Desktop.

1. Under the **Accounting** tab, go to the **Export** section.
2. Set the following preferences:
   - **Preferred Exporter**: Choose a Workspace Admin to automate report exports.
     - **Note**: If exporting company card transactions, the preferred exporter must also be a Domain Admin.
   - **Date**: Choose whether to use the **export date**, **submitted date**, or **date of last expense** on the report.
   - **Export reimbursable expenses as**:
     - Choose **check**, **vendor bill**, or **journal entry**.
     - If taxes are enabled, journal entries are **not supported**.
   - **Export company card expenses as**:
     - Choose **credit card** (default), **debit card**, or **vendor bill**.
     - If you select vendor bill, also specify:
       - The **accounts payable account**.
       - A **default vendor** (optional).

---

# Step 3: Configure Advanced Settings

These options manage syncing behavior and automation preferences.

1. Still in the **Accounting** section, select the **Advanced** tab.
2. Review and configure each setting:
   - **Auto-Sync**: Enable automatic syncing between QuickBooks Desktop and Expensify.
   - **Invite Employees**: Allow Expensify to import and invite employees from QuickBooks Desktop.
   - **Automatically Create Entities**: Expensify will create vendors/customers in QBD if no match is found.
   - **Sync Reimbursed Reports**: Reports marked as **Paid** in QBD will also be marked as **Paid** in Expensify.

---

# FAQ

## What happens if I try to export a report that’s already been exported?

Expensify will display an alert to help you avoid duplicates in QuickBooks Desktop.

## Can I use Locations with QuickBooks Desktop?

No, **Locations** are a QuickBooks Online-only feature. For similar tracking in QBD, use **Classes** or **Customers/Projects**.

## Why can’t I export as a journal entry?

If **taxes** are enabled, exporting as a journal entry is not supported. You’ll need to switch to exporting as a **check** or **vendor bill**.

## Do I need to upgrade to a certain plan to use the QuickBooks Desktop integration?

Yes. The QuickBooks Desktop integration is available on the **Control** plan.

</div>
