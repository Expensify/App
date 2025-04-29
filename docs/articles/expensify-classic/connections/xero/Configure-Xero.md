---
title: Configure Xero
description: Learn how to configure Xero in Expensify, including best practices, export settings, coding configurations, and advanced options.
keywords: [Expensify Classic, Xero]
---

<div id="expensify-classic" markdown="1">

A connection to Xero lets you combine Expensify's expense management features with Xero's accounting capabilities. 

# Best Practices Using Xero

Follow these best practices to ensure your finances are correctly categorized and accounted for:

- Configure your setup immediately after connecting and review each settings tab thoroughly.
- Keep **Auto Sync** enabled to:
  - Update Expensify daily with changes to your chart of accounts, customers/projects, or bank accounts in Xero.
  - Automatically export finalized reports to Xero, saving your admin team time.
- Set the **Preferred Exporter** to a user who is both a Workspace and Domain Admin.
- Configure **coding settings** and enforce them by requiring categories and tags on expenses.

---

# Accessing the Xero Configuration Settings

Xero is connected at the workspace level, and each workspace has a unique configuration. To access the settings:

1. Click **Settings** near the bottom of the left-hand menu.
2. Navigate to **Workspaces > Groups > [Workspace Name] > Accounting**.
3. Scroll to the Xero connection and click **Configure**.

---

# Step 1: Configure Export Settings

Define how data will be exported from Expensify to Xero:

1. Click **Configure** under the Xero connection.
2. Under the **Export** tab, review and set up:
   - **Preferred Exporter**: Assign a Workspace Admin.
     - Concierge exports reports automatically for the preferred exporter.
     - Other Workspace Admins can export manually.
     - If you set different export bank accounts for company cards, the Preferred Exporter must also be a Domain Admin.
   - **Export reimbursable expenses and bills as**: Always exported as a **Purchase Bill**.
   - **Purchase Bill Date**: Choose **last expense date, export date, or submitted date**.
   - **Export invoices as**: Always exported as **Sales Invoices**.
   - **Export non-reimbursable expenses as**: Posted as **bank transactions** to a Xero bank account.
   - **Xero Bank Account**: Select the bank account for posting non-reimbursable expenses.

## Step 1B: Configure Company Card Exports (If Applicable)

1. Click **Settings**.
2. Navigate to **Domains > [Domain Name] > Company Cards**.
3. If multiple company card connections exist, select the relevant one.
4. Locate the cardholder and click **Edit Exports**.
5. Assign the correct Xero account for the card expenses.

---

# Step 2: Configure Coding Settings

Define how data is imported from Xero to Expensify:

1. Click **Configure** under the Xero connection.
2. Under the **Coding** tab, configure:
   - **Chart of Accounts**: Imported as **expense categories** (enabled by default).
   - **Tax Rates**: Enabled to import Xero tax rates, visible under [Tax Settings](https://expensify.com/policy?param=%7B%22policyID%22:%22B936DE4542E9E78B%22%7D#tax).
   - **Tracking Categories**: Choose import method:
     - **Xero contact default** (applies during export)
     - **Tag** (line-item level)
     - **Report Field** (header level)
   - **Billable Expenses**: Enables importing Xero customer contacts as tags. All billable expenses require a customer tag for export.

---

# Step 3: Configure Advanced Settings

1. Click **Configure** under the Xero connection.
2. Under the **Advanced** tab, configure:
   - **Auto Sync**: Ensures daily synchronization.
     - Reimbursable expenses are exported after reimbursement.
     - Non-reimbursable expenses are exported after final approval.
   - **Newly Imported Categories Should Be**: Controls default visibility of new Xero accounts in Expensify.
   - **Set Purchase Bill Status** (optional):
     - **Awaiting Payment** (default)
     - **Draft**
     - **Awaiting Approval**
   - **Sync Reimbursed Reports**: Ensures paid reports and invoices sync across Expensify and Xero.
   - **Xero Bill Payment Account**: Specifies where reimbursements appear in Xero.
   - **Xero Invoice Collections Account**: Defines the invoice collection account for exported invoices.

---

# FAQ

## Can I connect multiple Xero organizations to Expensify?

Yes, but each workspace can connect to only one Xero organization at a time. If you add a new organization in Xero, you'll need to disconnect and reconnect the integration. Take screenshots of your settings beforehand to reconfigure quickly.

## How can I view purchase bills exported to Xero?

1. Log into Xero.
2. Navigate to **Business > Purchase Overview > Awaiting Payments**.
   - Bills are payable to the user who created and submitted the report in Expensify.

## How can I view bank transactions in Xero?

1. Log into Xero.
2. Open your **Dashboard**.
3. Select your **Company Card**.
4. Locate the relevant expense.

</div>
