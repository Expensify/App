---
title: Configure Certinia
description: Configure import, export, and advanced sync settings for Expensify's Certinia (FinancialForce) integration in New Expensify.
keywords: [New Expensify, Certinia settings, FinancialForce, import configuration, export preferences, auto-sync, dimensions, FFA, PSA, SRP]
order: 2
---


After connecting Certinia, set up how data flows between Expensify and Certinia using the **Import**, **Export**, and **Advanced** settings. Some options differ depending on whether you use the **FFA** or **PSA/SRP** module — those differences are noted below.

To open these settings, go to **Workspaces > [Workspace Name] > Accounting** from the navigation tabs (on the left on web, and at the bottom on mobile), then select **Import**, **Export**, or **Advanced** under the Certinia connection.

---

# Step 1: Configure Import Settings

From **Workspaces > [Workspace Name] > Accounting**, click **Import** under the Certinia connection.

## Categories

How categories are imported depends on your module:

- **FFA – Chart of Accounts:** Your **Prepaid Expense Type** and **Profit & Loss** accounts are imported and used as expense categories.
- **SRP – Expense Type GLA Mappings:** Expense Type GLA Mappings are imported as expense categories.
- **PSA:** PSA does not import or export categories.

Disable any unnecessary categories under **Workspaces > [Workspace Name] > Categories**. Every expense must have a category to export successfully.

## Dimensions (FFA)

Expensify imports up to four dimension levels. For each dimension, choose how it's imported:

- **Do not map:** Certinia defaults apply and no data is imported.
- **Tags:** Employees select the dimension from the **Tags** section per expense.
- **Report Fields:** Employees apply the dimension at the report level.

Manage these under **Workspaces > [Workspace Name] > Tags** and **Workspaces > [Workspace Name] > Reports**.

## Projects and Assignments (PSA/SRP)

Import **Projects**, **Assignments**, or **Projects & Assignments** as tags:

- **Milestones** are optional.
- If only projects are imported, the account is derived from the project.
- If assignments are imported, both the account and project are derived from the assignment.

> **Note:** To use a project without an assignment, enable **Allow Expenses Without Assignment** in Certinia.

## Tax

Toggle on **Tax** to import tax rates from Certinia and apply them to expenses. Set default rates per category under **Workspaces > [Workspace Name] > Categories**.

---

# Step 2: Configure Export Settings

From **Workspaces > [Workspace Name] > Accounting**, click **Export** under the Certinia connection.

## Preferred Exporter

Assign a **Preferred Exporter**. This member is responsible for exporting reports and receives any export error notifications. Any Workspace Admin can export reports, but Concierge auto-exports on behalf of the Preferred Exporter.

## Export Status

Choose whether reports export as **Complete** or **In Progress**.

## Export Date

Choose which date Expensify uses when creating records in Certinia:

- **Date of last expense**
- **Submitted date**
- **Exported date**

## Reimbursable and non-reimbursable exports

Both reimbursable and non-reimbursable reports export as:

- **Payable Invoices** (FFA), or
- **Expense Reports** (PSA/SRP)

If a report contains both reimbursable and non-reimbursable expenses, Expensify creates separate payable invoices or expense reports for each type.

## Default Vendor (FFA)

Select a vendor from your Certinia FFA account. This vendor is assigned to non-reimbursable payable invoices.

---

# Step 3: Configure Advanced Settings

From **Workspaces > [Workspace Name] > Accounting**, click **Advanced** under the Certinia connection.

## Auto-sync

We recommend enabling **Auto-sync** to keep your data up to date. Auto-sync performs daily updates to your coding and automatically exports reports upon final approval:

- **Non-reimbursable expenses:** Export immediately after final approval.
- **Reimbursable expenses:** Export when the report is reimbursed or marked as reimbursed.

## Sync reimbursed reports

Keep reimbursement status in sync between Expensify and Certinia for reports that have been paid.

## Export tax as non-billable

Decide whether tax amounts are billed to clients when exporting billable expenses.

## Foreign currency (multi-currency) export — PSA/SRP

When employees submit expenses in multiple currencies, Certinia may display up to three currencies per report:

- **Summary Total Reimbursement Amount:** Uses the project currency.
- **Amount field on the expense line:** Uses the Expensify Workspace default report currency.
- **Reimbursable Amount on the expense line:** Uses the submitter's resource currency.

---

# FAQ

## What happens if a report fails to export to Certinia?

If a report isn't exported:

- The **Preferred Exporter** receives an email with error details.
- The error is recorded in the **report's comments**.
- The report appears in the exporter's Expensify inbox as **Awaiting Export**.

Fix the error, then have a Workspace Admin manually export the report.

## Will enabling Auto-sync affect previously approved reports?

No. Enabling Auto-sync does not affect previously approved or reimbursed reports. If approved reports haven't been exported, export them manually or mark them as manually entered.

## How do reports map to records in Certinia?

- **FFA (Payable Invoices):** Account Name = the account linked to the submitter's email, Reference 1 = the report URL, Invoice Description = the report title.
- **PSA/SRP (Expense Reports):** Expense Report Name = the report title, Resource = the submitter's email, Description = the report URL, Approver = the Expensify report approver.

## How do I export tax?

Manage Expensify tax rates under **Workspaces > [Workspace Name] > Tax**. The tax amount calculated on each expense is exported to Certinia.
