---
title: BC75 Sync Error in Dynamics 365 Business Central
description: Learn what the BC75 sync error means when Dynamics 365 Business Central returns an Expensify Card settlement line without an ID, and when to contact Concierge.
keywords: [BC75, BC75 sync error, Business Central returned a settlement line without an ID, Sync Expensify Card settlements, Dynamics 365 Business Central sync error, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with the Expensify Card. Covers what to do about the BC75 sync error when Business Central returns a settlement line without an ID. Does not cover settlement account errors (BC89, BC90, BC91, BC92).
contentType: task
order: 75
---

# BC75 Sync Error in Dynamics 365 Business Central

If the **Accounting** page shows this error:

> Can't connect to Dynamics 365 Business Central ("BC75 Sync Error: Business Central returned a settlement line without an ID.")

Expensify asked Business Central to record an Expensify Card settlement, but Business Central's answer didn't include the ID of the line. Expensify stops recording settlements at this one. The rest of the sync still runs.

## Why the BC75 sync error happens

The BC75 error happens when Business Central sends an unexpected response. It isn't caused by your settings.

## How to resolve the BC75 sync error

Contact Concierge. Don't create the settlement line yourself, because Business Central might already have it.

## When to contact Concierge

Contact Concierge as soon as you see the BC75 error.
