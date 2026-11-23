---
title: BC71 Sync Error in Dynamics 365 Business Central
description: Learn what the BC71 sync error means when a reimbursement line recorded in Dynamics 365 Business Central is missing, and when to contact Concierge.
keywords: [BC71, BC71 sync error, recorded Business Central reimbursement line is missing, reimbursement journal line deleted, Sync reimbursed reports, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with Sync reimbursed reports enabled. Covers what to do about the BC71 sync error when the journal line Expensify recorded for a reimbursement is no longer in Business Central. Does not cover conflicting reimbursement lines (BC72).
contentType: task
order: 71
---

# BC71 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("Report [report ID]: BC71 Sync Error: The recorded Business Central reimbursement line is missing. Review it before syncing again.")

Expensify recorded this report's reimbursement as a general journal line in Business Central, but the line isn't in the journal batch anymore, and it wasn't posted. To avoid recording the payment twice, Expensify doesn't create the line again. Other reports still sync.

The number after **Report** is the report ID. To open the report on web, press **⌘+Shift+G** (Mac) or **Ctrl+Shift+G** (Windows/Linux), then enter the report ID.

## Why the BC71 sync error happens

The BC71 error usually happens when someone deleted the reimbursement line from the general journal batch before posting it. Expensify's reimbursement lines have a document number that starts with **EXPR-**.

## How to resolve the BC71 sync error

Contact Concierge with the report ID. Tell Concierge whether the line was deleted on purpose, for example because the reimbursement was recorded another way.

## When to contact Concierge

Contact Concierge as soon as you see the BC71 error. Don't create the reimbursement line again yourself, so the reimbursement isn't recorded twice.
