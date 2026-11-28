---
title: Resolve the BC80 Export Error in Dynamics 365 Business Central
description: Learn what to check when the BC80 export error prevents Expensify from calculating a foreign-currency expense's Dynamics 365 Business Central currency factor.
keywords: [BC80, BC80 export error, Business Central currency factor, original or converted amount is zero, foreign currency expense, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving BC80 for foreign-currency expenses with a zero original or converted amount when the report currency is the company's local currency. Does not cover invalid factors (BC81) or missing company currency (BC78).
contentType: task
platform: [web, mobile]
order: 80
---

# Resolve the BC80 Export Error in Dynamics 365 Business Central

## What the BC80 export error means

If a report shows this error:

> BC80 Export Error: Cannot determine the currency factor for expense [merchant] because its original or converted amount is zero.

Expensify can't calculate the exchange rate needed to preserve the expense's converted amount in Business Central.

## Why the BC80 export error happens

The expense uses a foreign currency, the report uses the Business Central company's local currency, and either the original or converted amount is zero. A very small amount may round to zero after conversion.

## How to fix the BC80 export error in Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend > Reports** and open the report.
2. Open the expense named in the error.
3. Compare the original amount, currency, and converted amount with the receipt or card transaction.
4. Correct any inaccurate amount, currency, or exchange rate, then export the report again.

Don't enter a made-up amount to bypass the error. If the zero amount is correct, contact Concierge for help with the export.

## When to contact Concierge

Contact Concierge if the expense amounts are correct or you can't edit the affected expense. Include the report link and merchant name.
