---
title: Expense and Report Actions
description: Learn how actions such as Approve, Pay, Export, and Hold behave in Expensify based on member roles and report status.
keywords: [New Expensify, report actions, approver actions, submitter actions]
---


Expense and report actions vary depending on the member role (submitter, approver, payer, admin) and the report's status (draft, outstanding, approved, done, paid). This guide outlines what to expect when reviewing, approving, paying, exporting, or managing expenses and reports based on varying workspace settings and report status.

---

# Expense and Report Actions

Report actions guide the submitter, approver, and payer regarding the report's status and what actions need to be taken next. 

## Understanding Primary vs. Secondary Actions

| **Action Type** | **What It Means** | **Examples** |
|------------------|------------------|-------------|
| **Primary actions** | Actions that require your attention and drive the report forward. These are always visible at the top of a report or in the reports list. | Submit, Approve, Pay, Export |
| **Secondary actions (More menu)** | Optional tools and adjustments that help manage or troubleshoot an expense or report. Appear in the More menu depending on the state, role, or integration settings. | Hold, Delete, Change workspace, Mark as exported |

---

## Primary Actions

| **Action** | **When It Appears** | **Who Can See It** | **What It Does** |
|------------|---------------------|---------------------|------------------|
| **Submit** | For draft/unsubmitted reports | Submitter | Sends the report into the approval workflow |
| **Approve** | When the report is submitted and pending approval | Approver | Confirms the report is accurate and ready to move to payment or to the next approver |
| **Pay** | After the report is approved | Payer | Initiates payment via Expensify or logs a manual payment |
| **Export** | When the report is approved and not yet exported | Admin, Exporter | Sends report data to an integrated accounting system |
| **Review** | When a report has violations (duplicate expenses, a missing receipt, etc.) | All roles | Prompts to resolve issues before submitting, approving, or paying |

---

## Secondary (“More” menu) Actions

| **Action** | **When It Appears** | **Who Can See It** | **What It Does** |
|------------|---------------------|---------------------|------------------|
| **Hold** | On draft, submitted, or approved reports | Submitter, Approver, Admin | Marks individual expenses that aren’t yet ready for approval or payment |
| **Change workspace** | Before report is exported | Submitter, Approver, Admin | Moves the report to a different workspace |
| **Change approver** | On submitted reports, before the report is final-approved | Admin | "Add Approver" allows an extra approver to be inserted into the approval workflow at the current point. "Bypass Approver" allows an admin to take control of the report approval and final approve |
| **Delete** | Only on draft/unsubmitted reports | Submitter | Permanently removes the report |
| **Unapprove** | After approval, before payment | Approver | Reverts the approval if the report hasn’t been re-approved or paid |
| **Mark as exported** | On approved/paid reports when integrated to an accounting system| Admin, Exporter | Marks the report as manually exported for tracking purposes |
| **Export to [accounting system]** | When an accounting system is connected | Admin, Exporter | Sends the report to an external system such as Xero or QuickBooks Online |
| **Download** | Any report state | All roles | Downloads a copy of the report as a PDF |
| **Submit** | For draft reports | Submitter, Admin (on behalf of submitter) | Kicks off report approval workflow |
| **Approve** | For outstanding reports | Admin | Skips current approver  |
| **View details** | Any report | All roles | Opens details view with options to share, pin, view members |
| **Cancel payment** | After payment is initiated, but before the payment has been processed, or always for a manual payment | Payer | Cancels pending payment |

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

## Why can’t I see “Bypass approvers”?

Only workspace admins can bypass the prescribed approval workflow. If “Prevent Self-Approval” is enabled, an admin cannot bypass approvals to approve their own report. 

