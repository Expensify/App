---
title: Report Actions
description: Learn how report actions like Approve, Pay, Export, and Hold behave in New Expensify, based on user roles and report states.
keywords: [New Expensify, report actions, approver actions, submitter actions]
---

<div id="new-expensify" markdown="1">

Report actions vary depending on your role (submitter, approver, payer, admin) and the report's status (draft, outstanding, approved, done, paid). This guide outlines what to expect when reviewing, approving, paying, exporting, or managing reports with different settings and violations.

---

# Report Actions

Report actions guide the submitter, approver, and payer regarding the report's status and what actions need to be taken next. 

## Understanding Primary vs. Secondary Actions

| **Action Type** | **What It Means** | **Examples** |
|------------------|------------------|-------------|
| **Primary actions** | Actions that require your attention and drive the report forward. These are always visible at the top of a report or in the reports list. | Submit, Approve, Pay, Export |
| **Secondary actions (More menu)** | Optional tools and adjustments that help manage or troubleshoot a report. Appear in the More menu depending on report state, role, or integration settings. | Hold, Delete, Change workspace, Mark as exported |

---

## Primary Actions

| **Action** | **When It Appears** | **Who Can See It** | **What It Does** |
|------------|---------------------|---------------------|------------------|
| **Submit** | For open/unsubmitted reports | Submitter | Sends the report into the approval workflow |
| **Approve** | When the report is submitted and pending approval | Approver | Confirms the report is accurate and ready to move to payment |
| **Pay** | After report is approved | Payer | Initiates payment via Expensify or logs a manual payment |
| **Export** | When report is approved and not yet exported | Admin, Exporter | Sends report data to an integrated accounting system |
| **Review** | When a report has violations (duplicate expenses, a missing receipt, etc.) | All roles | Prompts the user to resolve issues before submitting, approving, or paying |

---

## Secondary (More Menu) Actions

| **Action** | **When It Appears** | **Who Can See It** | **What It Does** |
|------------|---------------------|---------------------|------------------|
| **Hold** | On submitted reports | Approver | Pauses the approval process temporarily |
| **Change workspace** | Before report is paid or exported | Submitter, Approver, Admin | Moves the report to a different workspace |
| **Delete** | Only on open/unsubmitted reports | Submitter | Permanently removes the report |
| **Unapprove** | After approval, before payment | Approver | Reverts the approval if the report hasn’t been re-approved or paid |
| **Mark as exported** | After exporting manually | Admin, Exporter | Tags the report as exported for tracking purposes |
| **Export to [accounting system]** | When an accounting system is connected | Admin, Exporter | Sends the report to an external system such as Xero or QuickBooks Online |
| **Download** | Any report state | All roles | Downloads a copy of the report as a PDF |
| **Submit** | For open reports | Admin (on behalf of submitter) | Sends report for approval |
| **Approve** | For processing reports | Admin | Skips review step, moves forward to payment |
| **View details** | Any report | All roles | Opens detailed view of report history, expenses, and comments |
| **Cancel payment** | After payment is initiated, but before the payment has been processed, or for a manual payment | Payer | Cancels pending payment |

---

# FAQ

## Who can change a report's workspace?

- **Submitters**: Until the report is approved  
- **Approvers**: Until they approve the report  
- **Admins**: Until the report is exported

## What happens if an export fails?

If a report doesn’t export automatically or manually, you’ll see an error message with instructions on what to do next. You can try exporting it again using the same button.

The process works just like manual exports for automatic export issues, so you can fix the problem and retry the export on your own.

## Why can’t I cancel a payment?

The **Cancel payment** option is only available for in-app payments and only before Expensify starts processing the withdrawal. This is usually between 12 PM and 3 PM Pacific Time each day.

This option won't be available if the payment was made manually outside of Expensify. In that case, use **Unapprove** instead.

</div>
