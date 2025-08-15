---
title: Unapproved Spend
description: See all unapproved cash and card spend in one place so you can close the books without missing anything.
keywords: [unapproved spend, unapproved cash, unapproved card, accounting, liabilities, month-end close, New Expensify, workspace admin, approvals, reimbursements, card feed]
---
<div id="new-expensify" markdown="1">

Unapproved expenses that haven’t been recorded yet can create hidden liabilities. The Unapproved Spend views bring them together in one place so you can post accruals, follow up with submitters, and keep your general ledger accurate.

# Unapproved Spend

The Unapproved Spend section includes two views: **Unapproved Cash** and **Unapproved Card**. Both show expenses that are waiting for approval and have not yet been posted to your books, so you can take action before closing the period.

---

## Who can use the Unapproved Spend view
Workspace Admins with:
- Approvals turned on
- Either reimbursements enabled or at least one card feed connected

---

## How to get there
Go to:
- **Reports > Accounting > Unapproved Cash** — reimbursable expenses paid out-of-pocket
- **Reports > Accounting > Unapproved Card** — expenses from connected card feeds

These views come with filters already applied:

**Unapproved Cash**
`type:expense group-by:from status:drafts,outstanding reimbursable:yes`

**Unapproved Card**
`type:expense group-by:from status:drafts,outstanding feed:"Your Bank"`


---

## What you’ll see
- **Grouped view:** Expenses are grouped by submitter, with a subtotal for each person.
- **Helper filters:** If you have more than one card feed, a **Feed** filter appears so you can focus on one account at a time.
- **Total footer:** The total at the bottom shows the amount to accrue, without needing to export first.
- **Pre-filtered results:** Cash shows only unapproved reimbursable expenses; Card shows only unapproved card expenses, so nothing gets overlooked.

**Note:** If your company uses cash basis accounting, you may not need to accrue these amounts.

---

## Steps to post accruals
1. Open the relevant **Unapproved** view.
2. (Optional) Adjust the **Date** or **Posted** filters to match your period cut-off.
3. Review the **Total** in the footer — this is the amount to accrue.
4. Click **More > Export** if you need a detailed CSV.
5. Message submitters directly from the list to clear items before close.

---

# FAQ

## Why track unapproved spend?
Because even if it’s not approved yet, it’s still money your business owes. Seeing it all in one place helps you stay on top of liabilities.

## Can I group unapproved expenses by submitter?
Yes. Both Unapproved Cash and Unapproved Card group expenses by submitter so you can see who has unapproved items and the per-person subtotal.

## What if I don’t see the Accounting section in the Reports page?
You’ll need to be a Workspace Admin with approvals turned on, plus either reimbursements or at least one card feed connected.

## Can I filter unapproved card expenses by feed?
Yes. If you have more than one card feed, a **Feed** filter will appear so you can review one account at a time.

</div>
