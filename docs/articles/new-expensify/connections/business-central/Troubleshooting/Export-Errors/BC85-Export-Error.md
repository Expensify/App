---
title: Resolve the BC85 Export Error in Dynamics 365 Business Central
description: Learn how to resolve the BC85 export error when no Dynamics 365 Business Central accounting period covers a report's export date.
keywords: [BC85, BC85 export error, Business Central accounting period missing, export date not covered, Transaction date, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving BC85 when the configured export date falls outside the returned accounting periods. Does not cover closed periods (BC86), missing future open periods (BC87), or unreadable dates (BC88).
contentType: task
platform: [web, mobile]
order: 85
---

# Resolve the BC85 Export Error in Dynamics 365 Business Central

## What the BC85 export error means

If a report shows this error:

> BC85 Export Error: No Business Central accounting period covers export date [date]. Check the accounting periods and try exporting again.

The export date isn't covered by the accounting periods returned by the connected Business Central company.

## Why the BC85 export error happens

The date may be before the first accounting period, after a period's stated ending date, or the company may have no accounting periods.

The date comes from **Transaction date** in Expensify's export settings: **Date of last expense**, **Export date**, or **Submitted date**.

## How to fix the BC85 export error in Business Central

1. In Business Central, search for **Accounting Periods** in the connected company.
2. Ask your accounting team to confirm the periods cover the date named in the error and create any missing periods.
3. If the export date setting is incorrect, select **Workspaces > [workspace name] > Accounting** in Expensify's navigation tabs (on the left on web, on the bottom on mobile).
4. Under **Dynamics 365 Business Central**, select **Export > Transaction date** and choose the date basis your accounting team requires.
5. Open the report and export it again.

**Export to next open period** doesn't fix a date with no accounting period. It only applies when the date belongs to a closed period.

## When to contact Concierge

Contact Concierge if an accounting period covers the date but BC85 still appears.
