---
title: Resolve the BC81 Export Error in Dynamics 365 Business Central
description: Learn how to resolve the BC81 export error when an expense's original and converted amounts don't produce a positive Business Central currency factor.
keywords: [BC81, BC81 export error, Business Central positive currency factor, negative exchange rate, foreign currency refund, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers resolving BC81 for an invalid currency factor calculated from an expense's original and converted amounts. Does not cover zero amounts (BC80) or missing company currency (BC78).
contentType: task
platform: [web, mobile]
order: 81
---

# Resolve the BC81 Export Error in Dynamics 365 Business Central

## What the BC81 export error means

If a report shows this error:

> BC81 Export Error: The original and converted amounts for expense [merchant] do not give a positive currency factor.

Expensify can't calculate a positive exchange rate from the expense's stored original and converted amounts.

## Why the BC81 export error happens

For a foreign-currency expense on a report in the Business Central company's local currency, Expensify divides the original amount by the converted amount. The result must be positive. Opposite signs on the two amounts produce a negative factor.

A refund isn't itself a problem: two negative amounts still produce a positive factor.

## How to fix the BC81 export error in Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend > Reports** and open the report.
2. Open the expense named in the error.
3. Check the original amount, converted amount, currency, and exchange rate against the receipt or card transaction.
4. Correct inaccurate values. For a refund, keep both amounts consistent with the refund rather than changing them to a purchase.
5. Export the report again.

## When to contact Concierge

Contact Concierge if the values are correct, you can't edit them, or BC81 still appears after correction. Include the report link.
