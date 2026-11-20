---
title: BC73 Sync Error in Dynamics 365 Business Central
description: Learn what the BC73 sync error means when Dynamics 365 Business Central returns a reimbursement line without an ID, and when to contact Concierge.
keywords: [BC73, BC73 sync error, Business Central returned a reimbursement line without an ID, Sync reimbursed reports, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with Sync reimbursed reports enabled. Covers what to do about the BC73 sync error when Business Central returns a reimbursement line without an ID. Does not cover other reimbursement sync errors.
contentType: task
order: 73
---

# BC73 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("Report [report ID]: BC73 Sync Error: Business Central returned a reimbursement line without an ID.")

Expensify asked Business Central to record this report's reimbursement, but Business Central's answer didn't include the ID of the line. Expensify can't track a line without its ID, so it didn't record the reimbursement. Other reports still sync.

The number after **Report** is the report ID. To open the report on web, press **⌘+Shift+G** (Mac) or **Ctrl+Shift+G** (Windows/Linux), then enter the report ID.

## Why the BC73 sync error happens

The BC73 error happens when Business Central sends an unexpected response. It isn't caused by your settings.

## How to fix the BC73 sync error in Business Central

Contact Concierge with the report ID. Don't create the reimbursement line yourself, because Business Central might already have it.

## When to contact Concierge

Contact Concierge as soon as you see the BC73 error.
