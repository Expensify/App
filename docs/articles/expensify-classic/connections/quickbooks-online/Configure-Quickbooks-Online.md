---
title: Configure QuickBooks Online
description: Learn how to configure and optimize your QuickBooks Online connection in Expensify Classic for seamless expense exports and reporting.
keywords: [Expensify Classic, QuickBooks Online, configure QuickBooks, QBO integration]
---

<div id="expensify-classic" markdown="1">

A QuickBooks Online connection lets you sync Expensify expenses with your accounting system. Follow these steps to configure your connection for smooth exports and accurate financial reporting.

# Best Practices for QuickBooks Online Setup

- Configure your settings immediately after connecting.
- Keep **Auto Sync** enabled.
  - Daily sync updates your chart of accounts, customers/projects, and bank accounts.
  - Finalized reports are exported automatically to QuickBooks Online.
- Set your **Preferred Exporter** as a user who is both a Workspace Admin and a Domain Admin.
- Enforce expense coding by requiring categories and tags.

---

# Access QuickBooks Online Configuration Settings

QuickBooks Online connects at the Workspace level. Each Workspace can have a unique setup.

1. Click **Settings** at the bottom of the left-hand menu.
2. Go to **Workspaces > Groups > [Workspace Name] > Accounting**.
3. Scroll to the QuickBooks Online connection and click **Configure**.

---

# Step 1: Configure Export Settings

Set how expenses are exported from Expensify to QuickBooks Online.

1. Click **Configure** under QuickBooks Online.
2. Under the **Export** tab, review and adjust the following settings:

   - **Preferred Exporter**:
     - Choose a Workspace Admin to set as the Preferred Exporter.
     - Concierge exports reports automatically on behalf of the Preferred Exporter.
     - Other Workspace Admins can still export manually.
     - If you set different export bank accounts for individual company cards under **Settings > Domain > Company Cards**, your Preferred Exporter must also be a Domain Admin.

   - **Date**:
     - Choose how to date your exported reports: submitted date, exported date, or last expense date.
     - If you export non-reimbursable expenses as Credit Card or Debit Card transactions, Expensify uses each expense's transaction date.

   - **Reimbursable Expenses**:
     - Export to QuickBooks Online as:
       - **Vendor Bills (recommended)**: A single itemized vendor bill per Expensify report.
       - **Checks**: A single itemized check per Expensify report (can be marked to print later).
       - **Journal Entries**: A single itemized journal entry per Expensify report.

   - **Non-Reimbursable Expenses**:
     - Export to QuickBooks Online as:
       - **Credit Card Expenses**: Exported individually as bank transactions with transaction dates.
       - **Debit Card Expenses**: Exported individually as bank transactions with transaction dates.
       - **Vendor Bills**: A single vendor bill per Expensify report.
         - If the accounting period is closed, the bill will post on the first day of the next open period.
         - If you enable **Default Vendor**, the export uses the default vendor. If disabled, the report submitter will be the Vendor in QuickBooks.

   - **Billable Expenses**:
     - Expenses flagged as billable in Expensify will export with the billable flag.
     - Applies only to expenses exported as Vendor Bills or Checks.
     - Ensure each billable expense is associated with a Customer/Job.

   - **Export Invoices**:
     - Invoices created in Expensify will export and appear against the specified account in QuickBooks Online.

## Step 1B: Configure Company Card Export Settings (Optional)

1. Click **Settings**.
2. Go to **Domains > [Domain Name] > Company Cards**.
3. Select the correct card connection.
4. Find the cardholder and click **Edit Exports**.
5. Assign the QuickBooks account for card expense exports.

---

# Step 2: Configure Coding Settings

Decide what information to import from QuickBooks Online.

1. Click **Configure** under QuickBooks Online.
2. Under the **Coding** tab, review and adjust the following settings:

   - **Categories**:
     - QuickBooks Online Chart of Accounts is imported into Expensify as Categories.
     - This import is enabled by default and cannot be disabled.
     - Equity-type accounts are also imported.
     - **Note:** Other Current Liabilities can only be exported as Journal Entries if the submitter is set up as an Employee in QuickBooks.

   - **Classes and Customers/Projects**:
     - If you use Classes or Customers/Projects in QuickBooks Online, import them into Expensify as:
       - **Tags**: Apply Class and/or Customer/Project to each expense.
       - **Report Fields**: Apply Class and/or Customer/Project to an entire report.
     - **Note:** Due to QuickBooks API limitations, expenses cannot be created within the Projects module in QuickBooks.

   - **Locations**:
     - When enabled, Locations import into Expensify.
     - Depending on export type, Locations appear as Tags or Report Fields.

   - **Items**:
     - Import Items defined with Purchasing Information (with or without Sales Information) into Expensify as Categories.

   - **Tax**:
     - Import QuickBooks Online tax rates and configure them under **Settings > Workspaces > Groups > [Workspace Name] > Taxes**.
     - **Note:** Tax cannot be exported when using Journal Entries.

---

# Step 3: Configure Advanced Settings

Control syncing and auto-creation settings for better automation and reconciliation.

1. Click **Configure** under QuickBooks Online.
2. Under the **Advanced** tab, review and configure:

   - **Auto Sync**:
     - When enabled, the connection syncs daily to keep Chart of Accounts, Customers/Projects, and Vendors up-to-date.
     - New report approvals and reimbursements sync during the next auto-sync.
     - Reimbursable expenses are exported after reimbursement occurs or when marked as reimbursed outside Expensify.
     - Non-reimbursable expenses are exported automatically once reports are finally approved.

   - **Newly Imported Categories Should Be**:
     - Choose whether newly created accounts in QuickBooks Online appear enabled or disabled in Expensify.
     - Disabled categories will not be visible to employees when coding expenses.

   - **Invite Employees**:
     - When enabled, Auto Sync imports employee records from QuickBooks Online and invites them to the Workspace.

   - **Automatically Create Entities**:
     - If a vendor or customer does not exist in QuickBooks Online during export, Expensify automatically creates one.
     - Applies to exporting reimbursable expenses as Vendor Bills, Journal Entries, and invoices.

   - **Sync Reimbursed Reports**:
     - When enabled:
       - Vendor Bills paid via Expensify ACH reimbursements are marked as paid in QuickBooks Online.
       - Vendor Bills manually marked as paid in QuickBooks will also mark reports as reimbursed in Expensify.

     - **QuickBooks Account**:
       - Select the bank account from which reimbursements are issued. Payments will be created in QuickBooks.

     - **Collection Account**:
       - Invoices exported from Expensify will post against this account once marked Paid.

---

# FAQ

## Why am I seeing duplicate credit card expenses in QuickBooks Online?

When importing directly from a bank feed and Expensify, you may see duplicates. To prevent this:

- **Step 1**: Final approve reports in Expensify before export.
- **Step 2**: Export expenses as non-reimbursable Credit Card expenses.
- **Step 3**: Import your credit card feed into QuickBooks Online and match imported expenses.

## What happens if a report can't be exported automatically?

You'll receive an email detailing the issue, and the error will be logged in the report's history. Fix the issue and either export manually or follow guidance from the QuickBooks Online Export Errors page.

## What happens to existing approved and reimbursed reports if I enable Auto Sync?

- Existing reports that haven't been exported won't export automatically.
- Exported and reimbursed reports will sync payment status between Expensify and QuickBooks Online during the next auto-sync.

## Does splitting a non-reimbursable expense affect export?

Split expenses will consolidate into one transaction with multiple line items in QuickBooks.

**Pro Tip:** Ensure vendor names match in QuickBooks Online for accurate payee mapping.

## How does multi-currency impact exports to QuickBooks Online?

QuickBooks Online does not automatically apply conversion rates during export.

- Vendor Bills will export in the vendor's currency.
- Manual adjustment of exchange rates post-export is necessary.

## How do Expensify Card transactions export to QuickBooks Online?

Expensify Card expenses always export as Credit Card charges, even if configured otherwise for non-reimbursable expenses.

</div>
