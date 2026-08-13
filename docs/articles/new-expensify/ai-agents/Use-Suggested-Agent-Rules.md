---
title: Use Suggested Agent Rules
description: Learn what each suggested Agent rule does and when to use it to automate common workspace workflows.
keywords: [suggested Agent rules, Agent rules, RuleBot, AI rules, workspace automation, approval rules]
internalScope: Audience is Workspace Admins. Covers the available suggested Agent rules, what each one does, and when to use it. Does not cover creating custom Agent rules, personal Agents, or writing Agent instructions.
retrievalIntent: Which suggested Agent rule should I use?
contentType: topic
---

# Use Suggested Agent Rules

Suggested Agent rules are pre-written Agent rules for common workspace workflows. Instead of writing a rule from scratch, you can start with a suggested rule, review its instructions, and edit them before saving.

Suggested Agent rules are enforced by RuleBot like any other Agent rule.

To learn how to create Agent rules, see [Create Agent Rules](/articles/new-expensify/ai-agents/Create-Agent-Rules).

---

## How Suggested Agent rules work

Each suggested Agent rule includes a predefined set of natural-language instructions for a common expense review or approval workflow.

When you create a rule from a suggestion, you can review and edit its instructions before saving. After it's created, you can continue editing it like any other Agent rule.

For guidance on writing clear, effective instructions, see [How to Write Agent Rules](/articles/new-expensify/ai-agents/How-to-Write-Agent-Rules).

---

## What amount and spending rules are available

| Suggested Agent rule | What it does | Default instruction |
| --- | --- | --- |
| **Per-expense amount over a cap** | Rejects expenses that meet or exceed a specified amount. | Reject any single expense of $75 or more. |
| **Per-expense amount within a flagged band** | Rejects expenses whose amount falls within a specified range. | Reject expenses with an amount between $500 and $1000 inclusive. |
| **Report total over a cap** | Rejects reports whose total exceeds a specified amount. | Reject reports whose total is over $2,500. |

---

## What category rules are available

| Suggested Agent rule | What it does | Default instruction |
| --- | --- | --- |
| **Category is a specific value** | Only approves expenses assigned to one category. | Only approve expenses categorized as "Travel". Reject expenses in any other category. |
| **Category is in an allowed set** | Only approves expenses assigned to approved categories. | Approve expenses categorized as "Travel" or "Meals & Entertainment". Reject expenses in any other category. |
| **Category is empty** | Rejects expenses that don't have a category assigned. | Reject any expense that has no category assigned. Approve expenses that have a category. |

---

## What merchant rules are available

| Suggested Agent rule | What it does | Default instruction |
| --- | --- | --- |
| **Merchant is a specific vendor** | Only approves expenses from a specific merchant. | Only approve expenses from the vendor "Acme Corp". If an expense is from any other merchant, reject it with a brief one-sentence reason. |
| **Merchant name contains a banned word** | Rejects expenses whose merchant name contains a specified word. | Reject any expense whose merchant name contains the word "casino" (in any capitalization). Approve all other expenses. |
| **Merchant is on the allowed list** | Only approves expenses from approved vendors. | Approve expenses only from these approved vendors: Staples, Amazon, or Uber. Reject expenses from any merchant not on that list. |
| **Merchant is on the blocked list** | Rejects expenses from blocked vendors. | Reject expenses from these blocked vendors: SketchyVendor Inc, BadActor LLC. Approve expenses from every other merchant. |

---

## What currency and tax rules are available

| Suggested Agent rule | What it does | Default instruction |
| --- | --- | --- |
| **Currency is a specific value** | Only approves expenses submitted in one currency. | Only approve expenses submitted in US Dollars (USD). Reject expenses in any other currency. |
| **Currency is in an allowed set** | Only approves expenses submitted in approved currencies. | Approve expenses in USD or GBP only. Reject expenses in any other currency. |
| **Tax rate applied** | Rejects expenses that don't have a tax rate applied. | Reject expenses that have no tax rate applied. Approve expenses with a tax rate. |

---

## What tag and description rules are available

| Suggested Agent rule | What it does | Default instruction |
| --- | --- | --- |
| **Billable status** | Approves or rejects expenses based on whether they're billable. | Only approve non-billable expenses. Reject any expense marked as billable to a client. |
| **Description is empty** | Rejects expenses that don't include a description. | Reject expenses that have no description. Approve expenses that include a description. |
| **Tag is a specific value** | Only approves expenses tagged to a specific project. | Only approve expenses tagged to the project "Apollo". Reject expenses tagged to any other project. |
| **Tag is empty** | Rejects expenses missing a required tag. | Reject expenses that are missing a project tag. Approve expenses that have a tag. |

---

## What date and time rules are available

| Suggested Agent rule | What it does | Default instruction |
| --- | --- | --- |
| **Expense age over a threshold** | Rejects expenses older than a specified number of days. | Reject expenses whose transaction date is more than 14 days ago. Approve recent expenses. |
| **Expense within the submission deadline** | Rejects expenses submitted outside your organization's submission window. | Our policy requires expenses to be submitted within 30 days of the transaction date. Reject expenses dated more than 30 days ago; approve the rest. |
| **Weekend spending** | Rejects expenses dated on Saturday or Sunday. | Reject expenses dated on a weekend (Saturday or Sunday). Approve weekday expenses. |
| **Within an event date window** | Only approves expenses that occurred during a specified date range. | We are only reimbursing expenses dated during our company offsite, October 7 through October 11, 2025. Reject expenses dated outside that window. |

---

## What report-level rules are available

| Suggested Agent rule | What it does | Default instruction |
| --- | --- | --- |
| **Unusually large report (expense count)** | Rejects reports containing more than a specified number of expenses. | Reject reports that contain more than 5 expenses; they must be split into smaller reports. Approve reports with 5 or fewer expenses. |
| **Report mixes billable and non-billable expenses** | Rejects reports that contain both billable and non-billable expenses. | A report must be either all billable or all non-billable. Reject reports that mix billable and non-billable expenses. |
| **Report mixes expense categories** | Rejects reports containing expenses from multiple categories. | Every expense on a report must be in the same category. Reject reports whose expenses span different categories. |
| **Report mixes expenses tagged to different projects** | Rejects reports containing expenses assigned to multiple projects. | Every expense on a report must be tagged to the same project. Reject reports mixing projects. |

---

## What receipt intelligence rules are available

| Suggested Agent rule | What it does | Default instruction |
| --- | --- | --- |
| **Alcohol detected on receipt** | Rejects receipts containing alcohol purchases. | Reject any expense whose receipt shows alcohol (beer, wine, or liquor), with a one-sentence comment naming the alcohol. Approve receipts with no alcohol. |
| **Excessive tip percentage** | Rejects meal receipts whose tip exceeds a specified percentage. | Reject any meal expense whose receipt tip is more than 20% of the subtotal, noting the tip percentage. Approve tips of 20% or less. |
| **Receipt does not match transaction** | Rejects expenses whose receipt total doesn't match the expense amount. | Reject an expense when the total shown on its receipt does not match the expense amount, noting the discrepancy. Approve when the receipt total matches the expense amount. |
| **Gift card detected on receipt** | Rejects gift card purchases. | Reject expenses where the receipt is for a gift card purchase, noting that it is a gift card. Approve normal purchases. |
| **Incorrect receipt type submitted** | Rejects non-itemized receipts. | Only approve expenses backed by an itemized receipt. If the receipt is just a credit-card payment slip with no itemized purchases, reject it and ask for an itemized receipt. |
| **Receipt content does not match stated purpose** | Rejects expenses whose receipt doesn't match the stated purpose. | Reject an expense when the receipt contents clearly do not match the expense's stated purpose in its description, noting the mismatch. Approve when they are consistent. |
| **Currency mismatch on receipt** | Rejects receipts whose currency differs from the expense currency. | The expense amounts are in US dollars. Reject an expense when its receipt is denominated in a different currency, noting the currency mismatch. Approve when the receipt is in US dollars. |
| **Itemized split recommended (mixed items)** | Rejects mixed business and personal receipts. | When a single receipt mixes clearly business items with clearly personal items, reject it and ask the submitter to split out the personal items. Approve all-business receipts. |
| **Receipt language mismatch** | Rejects non-English receipts. | Reject an expense when its receipt is not written in English, asking for an English-language receipt. Approve English receipts. |
| **Receipt date vs expense date mismatch** | Rejects expenses whose receipt date differs from the expense date. | Reject an expense when the date printed on its receipt differs from the expense date, noting both dates. Approve when they match. |
| **Suspected personal expense from receipt items** | Rejects receipts that appear to contain personal purchases. | Reject an expense whose receipt is clearly a personal, non-business purchase, noting why it looks personal. Approve plausible business expenses. |
| **Receipt likely AI-generated** | Rejects receipts that appear fabricated or AI-generated. | Reject an expense whose receipt looks fake or AI-generated — garbled or nonsensical item names, a fabricated layout, or totals that do not add up — with a one-sentence comment saying why. Approve receipts that look like genuine printed receipts. |
| **Handwritten receipt detected** | Rejects handwritten receipts. | Reject an expense whose receipt is handwritten rather than a printed/computer-generated receipt, and ask the submitter for a printed itemized receipt. Approve normal printed receipts. |

---

## What happens after you create a Suggested Agent rule

After you save a Suggested Agent rule:

- RuleBot begins enforcing it immediately.
- You can edit the rule's instructions at any time.
- The rule behaves like any other Agent rule.

---

# FAQ

## Can I edit a Suggested Agent rule?

Yes. Suggested Agent rules are starting points. You can review and edit the instructions before saving the rule, and you can update the instructions at any time after it's created.

## Do Suggested Agent rules work differently from custom Agent rules?

No. After you save a Suggested Agent rule, it behaves like any other Agent rule. RuleBot enforces it using the instructions you've configured.

## Can I create multiple Suggested Agent rules?

Yes. You can create as many Agent rules as your workspace needs. Each rule evaluates the conditions described in its own instructions.

## What if none of the Suggested Agent rules matches my workflow?

Create a custom Agent rule instead. You can write your own natural-language instructions to automate workflows that aren't covered by the suggested rules.
