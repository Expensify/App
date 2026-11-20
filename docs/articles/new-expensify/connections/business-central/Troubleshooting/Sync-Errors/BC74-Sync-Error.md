---
title: BC74 Sync Error in Dynamics 365 Business Central
description: Learn what the BC74 sync error means when an Expensify Card settlement has no readable posted date, and when to contact Concierge.
keywords: [BC74, BC74 sync error, Expensify Card settlement has no readable posted date, Sync Expensify Card settlements, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with the Expensify Card. Covers what to do about the BC74 sync error when an Expensify Card settlement has no readable posted date. Does not cover settlement account errors (BC89, BC90, BC91, BC92).
contentType: task
order: 74
---

# BC74 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("BC74 Sync Error: Expensify Card settlement [settlement ID] has no readable posted date.")

Expensify couldn't read the date of an Expensify Card settlement, so it can't record the settlement in Business Central. Expensify stops recording settlements at this one and tries again on the next sync. The rest of the sync still runs.

## Why the BC74 sync error happens

The BC74 error is a problem with the settlement's data in Expensify. It isn't caused by your settings or by Business Central.

## How to fix the BC74 sync error in Business Central

Contact Concierge with the settlement ID from the error.

## When to contact Concierge

Contact Concierge as soon as you see the BC74 error.
