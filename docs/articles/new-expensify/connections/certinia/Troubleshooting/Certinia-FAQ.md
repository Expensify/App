---
title: Certinia Integration FAQ and Troubleshooting
description: Troubleshoot the Certinia (FinancialForce) integration in New Expensify — export failures, manual export rules, company card mapping, project limitations, and disconnecting.
keywords: [New Expensify, Certinia, FinancialForce, export not working, manual export, company card export, project status, disconnect Certinia, FFA, PSA, SRP]
internalScope: Audience is Workspace Admins and Domain Admins. Covers common Certinia export and troubleshooting questions, does not cover connecting or configuring Certinia or CER### error codes.
order: 3
---


This article covers common issues with the Certinia (formerly FinancialForce) integration in New Expensify. It's intended for Workspace Admins and Domain Admins using FFA or PSA/SRP.

For specific Certinia error codes (the `CER###` errors that appear in a report's comments), see the [Certinia error code articles](/expensify-classic/hubs/connections/certinia/Troubleshooting).

---

# FAQ

## Why is my report not automatically exporting to Certinia?

An error is preventing the report from exporting automatically. You can find the error in several ways:

- The **Preferred Exporter** (set in your Export settings) receives an email with the error details.
- The error appears in the report's comments.
- Automatic exports keep failing until the error is resolved.

**How to resolve:**

1. Open the affected report.
2. Review the error message in the comments.
3. Make the required corrections.
4. Have a Workspace Admin manually export the report.

---

## Why am I unable to manually export a report to Certinia?

Only reports in **Approved**, **Done**, or **Paid** status can be exported. If the report is in **Draft** status, selecting export may show an empty screen.

**How to resolve:**

1. Submit the report if it's in Draft status.
2. Have an approver approve the report if it's Outstanding.
3. Once the report is Approved, Done, or Paid, a Workspace Admin can manually export it.

---

## Why are company card expenses exporting to the wrong account?

Company card expenses may export to the wrong account if the card export mapping is incorrect or the exporter doesn't have the right permissions.

**Verify the company card export mapping:**

1. Confirm the correct export account is mapped for the affected card under your company card settings.
2. Confirm the expenses display the **Card + Lock icon**, which means they're mapped correctly.
3. Confirm the **Preferred Exporter** is a **Domain Admin**.

If the Preferred Exporter is not a Domain Admin, exports default to the fallback company card account set in the Workspace configuration.

---

## Are there export limitations based on projects in Certinia? (PSA/SRP)

Yes. Project settings in Certinia can prevent expenses from exporting.

**Expenses can be exported when:**

- **Project Status** = Active or In Progress
- **Assignment Status** = Closed, Active, or Completed
- **Closed for Expense Entry** = Unchecked

**Expenses cannot be exported when:**

- **Project Status** = Closed
- **Closed for Expense Entry** = Checked

**How to resolve:**

1. Check the Project Status in Salesforce. If it's Closed, expenses can't be entered or exported. If Active or In Progress, continue.
2. Verify the **Closed for Expense Entry** setting. If checked, uncheck it to allow expense exports.
3. Manually test expense entry in Salesforce. If manual entry works, the Expensify–Certinia export should also work.

---

## Does assignment status affect expense exports?

No. Assignment Status in Certinia (Closed, Active, or Completed) does not affect expense entry or export. Only **Project Status** and the **Closed for Expense Entry** setting affect export eligibility.

---

## How do I disconnect the Certinia connection?

1. From the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting**.
2. Select the three dots **(⋮)** next to the Certinia connection.
3. Click **Disconnect** and confirm.

Disconnecting removes the active integration and clears all imported options from Expensify.
