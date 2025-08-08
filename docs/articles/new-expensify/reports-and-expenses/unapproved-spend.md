---
title: accounting-search-workflows.md
description: Learn how Workspace Admins can use the Accounting section in Search to manage cash and card accrual workflows with suggested searches and total summaries.
keywords: [accounting, workspace admin, search, suggested search, cash accrual, card accrual, total summary, feed filter, unapproved expenses]
---
<div id="new-expensify" markdown="1">

The **Accounting section** in the Search page helps Workspace Admins streamline cash and card accrual workflows. With suggested searches, filters, and total summaries, it's easier than ever to identify and act on unapproved expenses.

# Accounting in Search

## What is the Accounting section?

The **Reports > Accounting** section in Search is available to all Workspace Admins. It provides quick access to common accounting workflows through pre-built suggested searches and data summaries.

This section supports both **cash** and **card** accrual workflows.

---

## Cash accrual workflows

Workspace Admins can use the **Unapproved cash** suggested search to view all reimbursable expenses that are in a draft or outstanding state.

### Suggested search

type:expense status:drafts,outstanding reimbursable:yes


This helps you:
- Track expenses that haven't yet been approved or reimbursed.
- Understand outstanding liability for cash reimbursement.
- Take action directly from the results page.

### Total summary footer

All Accounting suggested searches include a summary footer:

Total: $XXXX.XX

This total reflects the sum of relevant expenses in your **default workspace currency**.

---

## Card accrual workflows

For card-related accounting, the **Unapproved card** suggested search helps identify transactions that haven't yet been approved.

### Suggested search

type:expense status:drafts,outstanding feed:"Bank of America"


You can also filter by card feed using the feed: filter. For example: `feed:"Chase"`


This lets you:
- Review expenses by specific card feeds.
- Prepare for accrual-based reporting.
- Take action on outstanding card transactions quickly.

---

## Search API enhancements

When using the Search API, you can optionally return:
- count: Number of results
- total: Sum of expenses
- currency: Based on the caller’s default workspace

This enables automated workflows to analyze accounting data programmatically.

---

# FAQ

## Who can access the Accounting section?

Only **Workspace Admins** can see the **Reports > Accounting** section in Search.

## What does the total summary show?

It displays the total amount of expenses in the selected results, using your **workspace's default currency**.

## Can I use the feed: filter with any card?

Yes. The feed filter supports any connected card feed. 


</div>
