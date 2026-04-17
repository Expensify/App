---
title: Approve Expenses
description: Approve, hold, reject, and unapprove submitted expenses
keywords: [New Expensify, approve expenses, hold expenses, unapprove report, reject report, reject expense, workspace approval workflow, expense approval, reimburse expenses, pending expense, Expensify Card, expense status, expense settings]
internalScope: Audience is Workspace approvers and admins. Covers approving and managing submitted expenses and reports. Does not cover creating or submitting expenses.
---

# Approve Expenses

When an expense report is submitted on a Workspace with an approval workflow configured, it must be approved before it can be paid. To set an approval workflow on your Workspace, [learn how to add approvals](/articles/new-expensify/workspaces/Add-Approvals). 

When an expense report is submitted to an individual (rather than on a workspace), it won't go through an approval process. It only needs to be paid. [Learn how to pay an expense](/articles/new-expensify/expenses-and-payments/Pay-an-expense).

---

## What actions can be taken on expenses and reports submitted on a Workspace

On a submitted report, the approver can: 

- **Approve**: Confirm the report is valid and ready to pay.
- **Unapprove**: Return the report to its previous state for additional edits.
- **Reject**: Return the report to the submitter or a previous approver. 

On any expense submitted on a report, the approver can: 

- **Hold**: Temporarily delay approval of the individual expense if more information is needed.
- **Reject**: Remove the expense from the report and send it back to the submitter with a reason. The rejected expense can be marked as resolved and resubmitted.

**Note:** On reports with only one expense, you cannot reject a single expense. Instead, the entire report must be rejected.

---

## How to review and approve a report

When a report is submitted to you for approval it will appear in the **For you** section on **Home**, and on **Reports** in the **Approve** section. 

To review and approve a report submitted to you for approval: 

1. Click the report to open it.
2. Review details like the receipt, amount, and description.
3. Click **Approve** at the top of the report. 

---

## How to add an approver to a report

1. From the Report, choose **More**. 
2. Select **Change approver**.
3. Select **Add approver**.
4. Choose an additional approver to add to the report.
5. Click **Save**.

The approver you added is now the current approver, and the original workflow will continue after their approval. 

---

## How to bypass an approver on a report

Workspace admins can bypass the approval workflow on a report to final approve it themselves.

1. From the Report, choose **More**. 
2. Select **Change approver**.
3. Select **Bypass approvers**.
4. You are now the final approver, and the prescribed workflow has been bypassed.

**Note:** Only Workspace admins can bypass the prescribed approval workflow.

---

## How to hold an expense

1. In the navigation tabs (on the left on web, and at the bottom on mobile), go to **Reports > Expenses**.
2. Locate the expense you want to hold. 
3. Click the expense to open it. 
4. Click **More** at the top of the expense.
5. Select **Hold** and enter a reason. 

To take an expense off hold, follow the same steps but select **Unhold**. 

---

## How to unapprove a report

1. In the navigation tabs (on the left on web, and at the bottom on mobile), go to **Reports > Reports**.
2. Locate the Approved report you want to unapprove. 
3. Click the report to open it. 
4. Click **More** at the top of the report. 
5. Select **Unapprove**.

Unapproving a report returns it to the Outstanding state. The last approver will be notified and can then revise or reject expenses on the report.

**Note:** Only Approved reports can be unapproved. Paid and Done reports cannot be unapproved.

---

## How to reject a report 

As the assigned approver, you can reject an entire expense report to return it to the submitter or a previous approver while keeping the report's expense grouping intact.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), go to **Reports > Approve**.
2. Locate the Outstanding report you want to reject.
3. Click the report to open it. 
4. Click **More** at the top of the report. 
5. Select **Reject**.
6. Enter a comment to explain why you will not approve the report. 
7. If the report passed through previous approvers, choose who the report should be rejected back to for review.
8. Click **Reject report** to confirm.

---

## What happens after a report is rejected

- **Rejected to the submitter**: The report moves back to Draft. The submitter must fix any issues and manually resubmit — rejected reports are skipped during scheduled submit.
- **Rejected to a previous approver**: The report stays Outstanding and prior approvals are preserved, so it won't restart the entire approval workflow.

---

## How to reject an expense 

1. In the navigation tabs (on the left on web, and at the bottom on mobile), go to **Reports > Expenses**.
2. Locate the Outstanding expense you want to reject.
3. Click the expense to open it. 
4. Click **More** at the top of the expense. 
5. Select **Reject** and enter a reason.

The rejected expense will be removed from the report, and the submitter will be notified. The rejection reason will be added to the expense, and it can later be marked as resolved and resubmitted for approval.

---

# FAQ

## Why can't I action a pending expense? 
Expensify Card expenses show as pending until the merchant posts them. This can take 1–3 business days. Hotel or rental car holds may take longer (up to 31 days for hotels). Only posted expenses can be approved. 

## Why can’t I see Bypass approvers?
Only Workspace admins can bypass the prescribed approval workflow. If **Prevent Self-Approval** is enabled, an admin cannot bypass approvals to approve their own report. 

## What’s the difference between rejecting a report and rejecting an expense?

Rejecting a report sends the entire report back while keeping all expenses grouped together. Rejecting an expense removes only that expense from the report and sends it back to the submitter.

## Why can’t I unapprove a report?

Reports that are already paid cannot be unapproved. You also need to be an approver on the report to unapprove it.

## What happens after I approve a report?

The report moves to the next approver in the workflow. If you are the final approver, the report becomes **Approved** and is ready for payment.
