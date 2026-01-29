---
title: Statement Matching in New Expensify
description: Learn how Workspace Admins can use Statement Matching to quickly reconcile company card transactions with third-party card statements in New Expensify.
keywords: [statement matching, accounting workflows, reconcile, company cards, posted date, last statement, workspace admin, New Expensify, credit card statement]
---
<div id="new-expensify" markdown="1">

# Statement Matching in New Expensify

Statement Matching helps Workspace Admins reconcile company card transactions in New Expensify against third-party credit card statements. By grouping transactions by card and filtering for the correct statement period, you can confirm that the totals match and quickly identify any discrepancies.

---

## Who can use Statement Matching
- Workspace Admins with **Company Cards enabled** and a **workspace or domain card feed connected**.
- Applies to **third-party cards** (e.g., Bank of America) — the Expensify Card uses a different reconciliation process.

---

## Where to find Statement Matching
Breadcrumb path:  
`Reports > Accounting > Statement`

---

## How Statement Matching works

Statement Matching uses a **suggested search** in the Accounting section of the Reports page to group transactions by card and filter for the most recent statement period.

When the **Statement** view is selected:
- Transactions are grouped by **card** with cardholder and card details.
- The **Feed** helper filter appears if more than one card feed is connected.
- The **Posted** helper filter automatically applies the `last-statement` date range, based on the **Statement close date** you configure.

---

## Setting your Statement Close Date

Before you start, confirm your statement close date is correct for each card feed:

1. Go to `Settings > Workspaces > [Workspace Name] > Company Cards`.
2. Select the card feed.
3. Choose **Statement close date**:
   - **Last day of the month** (default)
   - **Last business day of the month**
   - **Custom day of the month**
4. Save your changes.

**Note:** This setting ensures the `posted:last-statement` filter matches your actual statement cycle.

---

## How to match statements in New Expensify

To reconcile your statement:

1. Go to `Reports > Accounting > Statement`.
2. If prompted, select the correct **card feed** from the **Feed** filter.
3. Confirm that **Posted** is set to **Last statement**.
4. Review the grouped totals for each card.
5. Compare the **total spend** to your credit card statement total:
   - If totals match, reconciliation is complete.
   - If totals differ, expand the relevant card group to review individual transactions.

---

## Best practices for Statement Matching
- **Configure your statement close date** as soon as a new card feed is added.
- Review transactions regularly to catch discrepancies before month-end.
- Use the **Feed** filter to narrow results if you manage multiple card feeds.
- For unresolved mismatches, confirm missing transactions are either:
  - Imported into Expensify, or
  - Reflected in your accounting system.

---

# FAQ

## Why can’t I see the Statement option in the Accounting section?
You’ll only see Statement Matching if:
- You’re a Workspace Admin, **and**
- Your workspace has at least one connected **company card feed**.

## Can I use Statement Matching for the Expensify Card?
No. The Expensify Card doesn’t use traditional statements. You can set a custom date range and generate a PDF, but Statement Matching is designed for third-party cards.

## What if my statement close date changes?
Update it anytime under `Settings > Workspaces > [Workspace Name] > Company Cards` for the relevant feed.

</div>
