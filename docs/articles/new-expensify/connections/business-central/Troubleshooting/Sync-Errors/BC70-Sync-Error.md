---
title: BC70 Sync Error in Dynamics 365 Business Central
description: Learn what the BC70 sync error means when a report's reimbursement was recorded in another Dynamics 365 Business Central company, and when to contact Concierge.
keywords: [BC70, BC70 sync error, reimbursement belongs to a different Business Central company, Business Central subsidiary, Sync reimbursed reports, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with Sync reimbursed reports enabled. Covers what to do about the BC70 sync error when a report's reimbursement was recorded in a different company than the one the report exported to. Does not cover changing the subsidiary.
contentType: task
order: 70
---

# BC70 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("Report [report ID]: BC70 Sync Error: The report's reimbursement belongs to a different Business Central company. Review it before syncing again.")

Expensify already recorded this report's reimbursement, but in a different Business Central company than the one the report is exported to. To avoid recording the payment twice, Expensify doesn't record it again. Other reports still sync.

The number after **Report** is the report ID. To open the report on web, press **⌘+Shift+G** (Mac) or **Ctrl+Shift+G** (Windows/Linux), then enter the report ID.

## Why the BC70 sync error happens

The BC70 error is rare. It can happen when the company selected as the **Subsidiary** changes while a report's reimbursement is waiting to be posted in Business Central.

## How to fix the BC70 sync error in Business Central

Contact Concierge with the report ID. Concierge can check which company has the reimbursement and where it belongs.

## When to contact Concierge

Contact Concierge as soon as you see the BC70 error.
