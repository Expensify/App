---
title: Configure Xero Settings
description: Learn how to configure Xero import, export, and advanced sync settings in Expensify.
keywords: [New Expensify, Xero configuration, set up Xero integration, import export Xero, Xero auto-sync]
---


Learn how to configure the settings for your Xero integration, including import preferences, export setup, and advanced sync features. These steps ensure your expense data flows smoothly and accurately between Expensify and Xero.

**The Xero integration simplifies expense management by:**

- Automatically syncing expense reports into Xero
- Reducing manual entry and human error
- Providing real-time visibility for smarter budgeting
- Speeding up approvals and reimbursements

---

# How to Access Xero's Configuration Settings

Each Workspace has a unique Xero configuration. To view or update it:

1. In the left-hand menu, select **Settings > Workspaces**, then choose your Workspace.
2. From the Workspace menu, click **Accounting**.

---

# Step 1: Set Up Import Settings

Import settings control which Xero data appears in Expensify.

1. Under the Xero connection, click **Import**.
2. Choose your preferences:

- **Xero organization** – Select the organization to connect. Each organization can only link to one Workspace at a time.
- **Chart of accounts** – Accounts marked “Show in Expense Claims” are imported into Expensify as Categories (not editable).
- **Tracking categories** – Import Xero tracking categories (e.g., cost centers, regions) as tags.
- **Re-bill customers** – Enable the import of Xero customer contacts as tags for billable expenses.
- **Taxes** – Import tax rates and defaults from Xero.

---

# Step 2: Set Up Export Settings

Export settings determine how Expensify sends data to Xero.

1. Under the Xero connection, click **Export**.
2. Configure the following:

- **Preferred exporter** – Assign a Workspace Admin to automatically receive reports to export.
  - Other Workspace Admins can still export to Xero.
  - If card-specific export settings are configured under your domain, the Preferred Exporter must be a Domain Admin.

- **Export out-of-pocket expenses as** – All out-of-pocket expenses are exported as purchase bills (not editable).
- **Purchase bill date** – Choose to use the date of the last expense, submitted date, or export date.
- **Export invoices as** – All invoices export as sales invoices (not editable).
- **Export company card expenses as** – All company card expenses are exported as bank transactions (not editable).
- **Xero bank account** – Select the account to post non-reimbursable expenses.

---

# Step 3: Configure Advanced Settings

Advanced settings control sync frequency and automation.

1. Under the Xero connection, click **Advanced**.
2. Choose your options:

- **Auto-sync** – Automatically keep Xero and Expensify in sync. Reports are exported after approval, and reimbursable reports post to Xero once reimbursed.
- **Set purchase bill status** – Choose between:
  - Draft
  - Awaiting Approval
  - Awaiting Payment
- **Sync reimbursed reports**—Mark reimbursed reports in Expensify as Paid in Xero. This requires selecting a Xero reimbursement account.
- **Xero bill payment account** – Required if **Sync reimbursed reports** is enabled.
- **Xero invoice collections account** – Select the account where paid invoices appear.

---

# FAQ

## How do I know if a report was exported successfully to Xero?

When a report exports successfully, Concierge posts a confirmation message in the related Expensify Chat room.

## What happens if I export a report that was already exported?

Expensify warns you if the report has already been exported. If you proceed, it creates a duplicate in Xero, which you'll need to delete manually.

## Will existing reports be affected when I enable auto-sync?

- Reports already exported won’t be re-exported.
- Reimbursed reports marked as Paid in Xero will also show as Paid in Expensify after sync.
- If a report was reimbursed via ACH, the Paid status syncs to Xero.
- Reports not yet exported won’t be affected unless exported manually.

