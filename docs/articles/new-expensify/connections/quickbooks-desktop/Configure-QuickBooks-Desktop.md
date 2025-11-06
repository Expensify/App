---
title: Configure QuickBooks Desktop
description: Learn how to connect and configure your QuickBooks Desktop integration with Expensify to manage imports, exports, and advanced accounting settings.
keywords: [New Expensify, QuickBooks Desktop, Expensify integration, accounting settings, import settings, export settings, QBD, configure QuickBooks Desktop]
order: 2
---


Connecting QuickBooks Desktop to Expensify helps streamline expense reporting, reimbursements, and accounting workflows. This guide walks you through connecting and configuring your import, export, and advanced settings for QuickBooks Desktop.

---

# Step 1: Initial Connection

1. From the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace Name] > Accounting > QuickBooks Desktop**.
2. Find QuickBooks Desktop in the list of integrations and click **Set up**.
3. You'll receive a Codat link URL that must be opened on the computer where QuickBooks Desktop is installed.
4. Open the provided link on your QuickBooks Desktop computer and follow the connection flow.
5. Once connected, you'll see a syncing screen while information imports from QuickBooks Desktop to Expensify.

---

# Step 2: Configure Import Settings

These steps define how your QuickBooks Desktop data is pulled into Expensify.

1. From the navigation tabs, click **Workspaces > [Workspace Name] > Accounting > QuickBooks Desktop**.
2. Click the **Import** tab under the QuickBooks Desktop connection.
3. Choose which coding configurations to import from QuickBooks Desktop. For each configuration, you can manage its import status:

   * **Chart of accounts**: Always imported and used as categories in Expensify.
   * **Classes**: Can be imported as tags or report fields for class-level tracking.
   * **Customers/projects**: Can be imported as tags or report fields for expense-level tracking.
   * **Items**: Can be imported and used as tags for itemized coding.

**Default Settings:**

* Classes are enabled as tags by default
* Customers/projects and Items are disabled by default

4. **For Classes and Customers/Projects**: Choose whether to import them as:

   * **Tags**: Applied at the expense level
   * **Report fields**: Applied at the report level

5. **Control your imports**:

   * The interface will show the current import status for each item (e.g., "Imported as categories" or "Not imported").
   * Use the options provided to change these settings.

---

# Step 3: Configure Export Settings

These settings control how Expensify exports reports and transactions to QuickBooks Desktop.

1. From the navigation tabs, click **Workspaces > [Workspace Name] > Accounting > QuickBooks Desktop**.
2. Under the **Accounting** tab, go to the **Export** section.
3. Configure the following settings:

**Basic Export Settings:**

* **Preferred Exporter**: Choose a Workspace Admin to automate report exports (defaults to workspace owner).

  * **Note**: If exporting company card transactions, the preferred exporter must also be a Domain Admin.
* **Export Date**: Choose **date of last expense** (default), **export date**, or **submitted date**.

**Out-of-Pocket Expenses:**

* **Export out-of-pocket expenses as**: Choose from:

  * **Vendor bill** (default)
  * **Check** (includes option to mark as "print later" in QuickBooks Desktop)
  * **Journal entry** (not supported if taxes are enabled)
* Select the appropriate bank account for each export type.

**Company Card Expenses:**

* **Export company card expenses as**: Choose from:

  * **Credit card** (default)
  * **Debit card**
  * **Vendor bill**
* Configure accounts based on your selection:

  * **Credit card account**: First credit card account in the imported list (default)
  * **Debit card account**: First bank account in the imported list (default)
  * **Accounts payable account**: First Accounts Payable account (for vendor bills)
  * **Default vendor**: First vendor in the imported list (for vendor bills)

**Expensify Card Transactions:**

* **Export Expensify Card transactions as**: Typically set to **Credit card**.
* Expensify Card transactions automatically export to an "Expensify Card Liability Account" created with the integration.

---

# Step 4: Configure Advanced Settings

These options manage syncing behavior, automation preferences, and additional account settings.

1. From the navigation tabs, click **Workspaces > [Workspace Name] > Accounting > QuickBooks Desktop**.
2. Still in the **Accounting** section, select the **Advanced** tab.
3. Review and configure each setting (all default to enabled):

   * **Auto-sync**: Enable this for Expensify to automatically sync with QuickBooks Desktop every day.
   * **Invite employees**: Automatically invite employees to the workspace.
   * **Auto-create entities**: Expensify will automatically create vendors in QuickBooks Desktop if they don't exist already.
   * **Sync reimbursed reports**: Automatically sync reimbursed reports.

4. **Account Selections:**

   * **Bill payment account**: Select the account for bill payments (defaults to the first option)
   * **Invoice collections account**: Select the account for invoice collections (defaults to the first option)

---

# Step 5: Export Process

Due to QuickBooks Desktop being an offline platform, exports are asynchronous:

1. When you export a report, you'll first see an "export in progress" message.
2. Codat stores the exported information until QuickBooks Desktop is next opened.
3. Once successfully exported to QuickBooks Desktop, you'll receive a completion confirmation.
4. Unlike cloud-based integrations, you won't get direct links to expenses in QuickBooks Desktop due to its offline nature.

---

# FAQ

## Can I set up the QuickBooks Desktop integration from my mobile device?

No, the initial connection and most configuration must be done from a desktop or web browser. Since QuickBooks Desktop runs on a desktop computer, the integration setup requires access to that same computer. Mobile users will see a blocking screen directing them to complete the setup on a desktop.

## What happens if I try to export a report that's already been exported?

Expensify will display an alert to help you avoid duplicates in QuickBooks Desktop.

## Can I use Locations with QuickBooks Desktop?

No, **Locations** are a QuickBooks Online-only feature. For similar tracking in QuickBooks Desktop, use **Classes** or **Customers/Projects**.

## Why can't I export as a journal entry?

If taxes are enabled, exporting as a journal entry is not supported. You'll need to switch to exporting as a check or vendor bill.

## How do I reconnect if my QuickBooks Desktop integration stops working?

If you encounter sync errors, you'll see a **Reinstall connector** option that will take you through the Codat connection flow again. This needs to be done on the computer where QuickBooks Desktop is installed, not on mobile.

## Why don't my exports appear in QuickBooks Desktop immediately?

QuickBooks Desktop is an offline application, so exports are asynchronous. Codat stores your exported data until you next open QuickBooks Desktop and the Web Connector can complete the sync.

## Do I need to upgrade to a certain plan to use the QuickBooks Desktop integration?

Yes. The QuickBooks Desktop integration is available on the **Control** plan.

## What's the difference between tags and report fields for Classes and Customers/Projects?

* **Tags**: Applied at the individual expense level, allowing different expenses on the same report to have different values
* **Report fields**: Applied at the report level, meaning all expenses on a report share the same value


