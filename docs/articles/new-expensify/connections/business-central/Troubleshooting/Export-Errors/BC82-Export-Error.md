---
title: Resolve the BC82 Export Error in Dynamics 365 Business Central
description: Learn what the BC82 export error means and what to do if a Business Central purchase invoice contains expenses with incompatible currencies or exchange rates.
keywords: [BC82, BC82 export error, Business Central purchase invoice currency factor, mixed currencies, different exchange rates, workspace admin]
internalScope: Audience is workspace admins exporting purchase invoices to Dynamics 365 Business Central. Covers escalating BC82 when expenses prepared for one invoice don't share a currency and factor. Does not cover zero amounts (BC80) or invalid factors (BC81).
contentType: task
platform: [web, mobile]
order: 82
---

# Resolve the BC82 Export Error in Dynamics 365 Business Central

## What the BC82 export error means

If a report shows this error:

> BC82 Export Error: Business Central purchase invoice expenses must share the same currency and currency factor.

Expenses prepared for one purchase invoice have different currencies or currency factors. Business Central accepts only one currency and exchange rate per invoice.

## Why the BC82 export error happens

Expensify normally splits reimbursable expenses into separate purchase invoices by currency and exchange rate. Each company card expense already exports as its own invoice.

BC82 means the expenses prepared for an invoice still don't match. This isn't an expected limitation on reports containing multiple currencies.

## How to resolve the BC82 export error for Business Central

Contact Concierge with the report link and full error. Expensify needs to investigate why the expenses weren't separated correctly.

Don't change correct currencies or exchange rates, or split the report, just to bypass this error.

## When to contact Concierge

Contact Concierge whenever BC82 appears. Include the affected expenses' currencies and exchange rates if available.
