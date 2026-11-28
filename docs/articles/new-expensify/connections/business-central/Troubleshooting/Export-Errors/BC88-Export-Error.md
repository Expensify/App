---
title: Resolve the BC88 Export Error in Dynamics 365 Business Central
description: Learn what to do when the BC88 export error reports an unreadable starting or ending date on a Business Central accounting period.
keywords: [BC88, BC88 export error, Business Central unreadable accounting period date, starting date, ending date, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving BC88 when a returned accounting period date can't be read. Does not cover uncovered export dates (BC85) or closed accounting periods (BC86).
contentType: task
platform: [web, mobile]
order: 88
---

# Resolve the BC88 Export Error in Dynamics 365 Business Central

## What the BC88 export error means

If a report shows one of these errors:

> BC88 Export Error: Business Central accounting period [period] has an unreadable starting date. Check the accounting periods and try exporting again.

> BC88 Export Error: Business Central accounting period [period] has an unreadable ending date. Check the accounting periods and try exporting again.

Expensify can't read an accounting period date returned by Business Central, so it can't validate the report's export date.

## Why the BC88 export error happens

A starting or ending date returned by the Business Central extension isn't in the expected date format. A period date may look correct in Business Central but still be returned incorrectly to Expensify.

## How to resolve the BC88 export error for Business Central

1. Ask your Business Central admin to open **Accounting Periods** in the connected company.
2. Check the period named in the error for an incorrect starting or ending date.
3. If your accounting team corrects a period date, export the report again.
4. If the dates already look correct, contact Concierge with the report link and full error.

Don't change your device's date format or the report's currency. Those settings don't fix an unreadable date returned by Business Central.

## When to contact Concierge

Contact Concierge if the period dates look correct or BC88 still appears after an approved correction. Include whether the error names the starting or ending date.
