---
title: Expense and Report Actions
description: Learn what actions (Submit, Approve, Pay, Export, Hold) are available on reports based on role and report status.
keywords: [New Expensify, report actions Expensify, who can approve report, when can I pay report, report status actions, approver permissions]
internalScope: Audience is all members. High level overview of what report actions are available based on role and report status. Does not cover step-by-step instructions for performing each action.
---

# Expense and Report Actions

Expense and report actions vary depending on the member role and the expense or report's status. 

Use this guide to understand:
- What each action does
- When actions appear
- Who can perform them

---

## What actions can I take on a report?

- You can **submit** a report when it is in **Draft** status and you are the **submitter**
- You can **approve** a report when it is in **Outstanding** (submitted) status and you are the **assigned approver**
- You can **pay** a report after it is **Approved** status and you are a **payer**
- You can **export** a report when it is **Approved or Paid** status and you are an **admin or exporter**
- You can **Hold** expenses when they should not move forward yet

[Learn more about report statuses](articles/new-expensify/reports-and-expenses/Understanding-Report-Statuses-and-Actions#report-statuses).

---

## What each report action means

- **Submit**: Available when a report is in Draft. Sends the report into the approval workflow.
- **Approve**: Available when a report is Outstanding and awaiting approval. Confirms the report is ready to move forward.
- **Pay**: Available after approval. Initiates payment or records a manual payment.
- **Export**: Available when a report is Approved or Paid. 
- **Review**: Appears when there are issues (such as missing receipts or duplicates). Prompts fixes before continuing.
- **Hold**: Prevents specific expenses from moving forward in approval or payment.

---

## What actions are available for each report status

**Draft reports**
- Submit
- Delete
- Hold
- Duplicate expense
- Duplicate report

**Outstanding (submitted) reports**
- Approve
- Reject
- Hold
- Change approver

**Approved reports**
- Pay
- Export
- Unapprove
- Mark as exported

**Paid or Done reports**
- Download
- Print
- Mark as exported

---

## What actions each role can take

**Submitter**
- Submit reports
- Delete Draft reports
- Duplicate expenses and reports
- Hold expenses
- Invite members to their report

**Approver**
- Approve reports
- Reject reports
- Hold expenses
- Unapprove reports (before payment)

**Payer**
- Pay reports
- Cancel payment (before processing)

**Workspace Admin**
- Export reports
- Mark reports as exported
- Change approver
- Bypass approvers
- Change workspace (before export)

---

## How to understand report actions using the full action table

**Primary report actions**

| **Action** | **When It Appears** | **Who Can See It** | **What It Does** |
|------------|---------------------|---------------------|------------------|
| **Submit** | Draft reports | Submitter | Sends the report into the approval workflow |
| **Approve** | Outstanding awaiting approval | Approver | Confirms the report is accurate and moves it forward |
| **Pay** | Approved reports with reimbursable expenses | Payer | Initiates or records payment |
| **Export** | Approved or Paid reports not yet exported | Workspace Admin | Sends report data to an accounting system |
| **Review** | When issues are detected | All roles | Prompts required fixes before continuing |

**Note:** If your workspace does not use approvals, **Submit** and **Approve** may appear as **Mark as done**.

---

**Additional report actions available from the More menu**

| **Action** | **When It Appears** | **Who Can Use It** | **What It Does** |
|------------|---------------------|---------------------|------------------|
| **Hold** | Draft, Outstanding, or Approved reports | Submitter, approver, Workspace Admin | Prevents expenses from moving forward |
| **Change workspace** | Before export | Submitter, approver, Workspace Admin | Moves the report to another workspace |
| **Change approver** | Submitted reports | Workspace Admin | Adds or bypasses approvers |
| **Delete** | Draft reports only | Submitter | Permanently removes the report |
| **Undelete** | Deleted expenses | Submitter | Restores a deleted expense |
| **Unapprove** | After approval, before payment | Approver | Reverts approval |
| **Mark as exported** | Approved or Paid reports | Workspace Admin | Marks report as exported manually |
| **Export to accounting system** | When accounting integration is enabled | Workspace Admin | Sends data externally |
| **Duplicate expense** | Non-card expenses | Submitter | Creates a copy of an expense |
| **Duplicate report** | Any report owned by submitter | Submitter | Creates a copy of the report |
| **Download** | Any report | All roles | Downloads a PDF copy |
| **Print** | Any report | All roles | Opens print view |
| **Reject** | Submitted reports | Approver | Sends report back for changes |
| **Invite member** | Draft and Outstanding reports | All roles | Adds a member to the report |
| **View details** | Any report | All roles | Opens report details |
| **Cancel payment** | Before payment processing | Payer | Cancels a pending payment |
| **Hold** | On draft or submitted reports | Submitter, Approver, Admin | Marks individual expenses that aren’t yet ready for approval or payment |
| **Change workspace** | Before report is exported | Submitter, Approver, Admin | Moves the report to a different workspace |
| **Change approver** | On submitted reports, before the report is final-approved | Admin | "Add Approver" allows an extra approver to be inserted into the approval workflow at the current point. "Bypass Approver" allows an admin to take control of the report approval and final approve |
| **Delete** | Only on draft/unsubmitted reports | Submitter | Permanently removes the report |
| **Unapprove** | After approval, before payment | Approver | Reverts the approval if the report hasn’t been re-approved or paid |
| **Mark as exported** | On approved/paid reports when integrated to an accounting system| Admin, Exporter | Marks the report as manually exported for tracking purposes |
| **Export to [accounting system]** | When an accounting system is connected | Admin, Exporter | Sends the report to an external system such as Xero or QuickBooks Online |
| **Duplicate expense** | On non-card expenses in any state | Submitter | Creates a copy of the expense on your primary workspace with the same details. Date is set to today and receipts are not copied |
| **Duplicate report** | On reports the submitter owns, in any state | Submitter | Creates a copy of the report and its non-card expenses. Date is set to today and receipts are not copied |
| **Download** | Any report state | All roles | Downloads a copy of the report as a PDF |
| **Print** | Any report state | All roles | Opens the report in a printable format and triggers the browser's print dialog |
| **Submit** | For draft reports | Submitter, Admin (on behalf of submitter) | Kicks off report approval workflow |
| **Reject** | On Outstanding reports | Assigned approver | Returns the entire report to the submitter or a previous approver with a required reason. The report moves to Draft (if rejected to submitter) or stays Outstanding (if rejected to a previous approver) |
| **Approve** | For outstanding reports | Admin | Skips current approver  |
| **View details** | Any report | All roles | Opens details view with options to share, pin, view members |
| **Received payment** | On approved, closed, or reimbursed expense reports where no bank payment has been initiated | Submitter | Confirms that payment was received outside of Expensify and marks the report as paid |
| **Cancel payment** | After payment is initiated, but before the payment has been processed, or always for a manual payment | Payer | Cancels pending payment |

---

## How to find available actions on a report

Open a report to see available actions.

- Primary actions (like **Submit**, **Approve**, or **Pay**) appear at the top of the report
- Additional actions are available when you open the report and choose **More**
- Available actions change based on:
  - Your role
  - Report status
  - Workspace settings
  - Integrations

---

## What happens after you take a report action

- **Submit** → moves report to approval
- **Approve** → moves report to next approver or payment
- **Pay** → marks report as Paid or starts processing payment 
- **Export** → sends report data externally
- **Reject** → sends report back for updates
- **Unapprove** → reopens the report before payment

---

# FAQ

## What happens if an export fails?

An error message appears with next steps. You can fix the issue and retry the export.

## Why can’t I cancel a payment?

Payments can only be canceled before processing begins. Manual payments cannot be canceled.

## Why can’t I see “Bypass approvers”?

Only workspace admins can bypass approvers. Some settings may prevent self-approval.

## How do I invite a member to an expense report?

Open the report, select the header, then select **Members** and choose **Invite**.
