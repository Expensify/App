---
title: BC72 Sync Error in Dynamics 365 Business Central
description: Learn what the BC72 sync error means when Dynamics 365 Business Central has conflicting reimbursement lines for a report, and how to review them.
keywords: [BC72, BC72 sync error, Business Central already has conflicting reimbursement lines, duplicate reimbursement journal lines, EXPR document number, Sync reimbursed reports, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with Sync reimbursed reports enabled. Covers resolving the BC72 sync error when the general journal batch has reimbursement lines for a report that aren't posted yet and don't match the payment Expensify would record. Does not cover missing reimbursement lines (BC71).
contentType: task
order: 72
---

# BC72 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("Report [report ID]: BC72 Sync Error: Business Central already has conflicting reimbursement lines for this report. Review them before syncing again.")

Expensify gives each reimbursement line a document number that starts with **EXPR-**. The general journal batch already has lines with this report's document number that aren't posted yet, but they don't match the payment Expensify would record. To avoid recording the payment twice, Expensify doesn't create another line. Other reports still sync.

The number after **Report** is the report ID. To open the report on web, press **⌘+Shift+G** (Mac) or **Ctrl+Shift+G** (Windows/Linux), then enter the report ID.

## Why the BC72 sync error happens

The BC72 error happens when the general journal batch that Expensify uses has, for this report:

- More than one reimbursement line that isn't posted yet.
- One reimbursement line that isn't posted yet, with a different amount, currency, posting date, bank account, or employee or vendor than the payment Expensify would record. For example, someone edited the line in Business Central.

## How to fix the BC72 sync error in Business Central

1. In Business Central, open the general journal batch chosen in Expensify Assisted Setup.
2. Find the lines that aren't posted yet and whose document number starts with **EXPR-** for this report.
3. If someone added or changed one of these lines in Business Central, undo that change.
4. In Expensify, select **Workspaces > [workspace name] > Accounting**.
5. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.

## When to contact Concierge

Contact Concierge with the report ID if no one changed these lines, if you aren't sure which line Expensify created, or if the error still appears after you sync.
