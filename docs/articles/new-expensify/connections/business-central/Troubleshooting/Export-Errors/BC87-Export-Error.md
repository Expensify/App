---
title: Resolve the BC87 Export Error in Dynamics 365 Business Central
description: Learn how to resolve the BC87 export error when Business Central has no later open accounting period for a closed-period export.
keywords: [BC87, BC87 export error, no open Business Central accounting period, Export to next open period, fiscal year, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection with Export to next open period enabled. Covers resolving BC87 when no open period starts after the configured export date. Does not cover missing date coverage (BC85) or disabled next-period export (BC86).
contentType: task
platform: [web, mobile]
order: 87
---

# Resolve the BC87 Export Error in Dynamics 365 Business Central

## What the BC87 export error means

If a report shows this error:

> BC87 Export Error: No open Business Central accounting period was found. Check the accounting periods and try exporting again.

The report's export date falls in a closed period. **Export to next open period** is enabled, but Expensify can't find a later open period.

## Why the BC87 export error happens

Every period starting after the export date is closed, or the later periods haven't been created. An open period before the export date doesn't qualify.

## How to fix the BC87 export error in Business Central

1. In the connected Business Central company, search for **Accounting Periods**.
2. Ask your accounting team to confirm that an appropriate open period starts after the report's configured export date.
3. Have your Business Central admin create missing periods according to your accounting team's requirements.
4. Open the report in Expensify and export it again.

Don't reopen a closed fiscal year just to bypass this error. Your accounting team should decide the correct posting period.

## When to contact Concierge

Contact Concierge if a later open period exists but BC87 still appears. Include the report link and the relevant period dates.
