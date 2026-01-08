---
title: Personal Rules – Train Concierge to Handle Your Expenses
description: Learn how Personal Rules train Concierge to categorize, clean up, and report your expenses automatically. Automate repetitive tasks and improve accounting accuracy.
keywords: personal rules, expense rules, concierge AI, automate expenses, standardize merchants, categorize expenses, Expensify rules, train concierge, account settings
---

<div id="new-expensify" markdown="1">

# Personal Rules

## What Personal Rules do

Personal Rules tell Concierge how you want your expenses to be handled. Some are learned automatically based on your past actions, while others are rules you define directly to instruct Concierge how to treat specific expenses — from categorization to reporting.

These rules are more than just automation — they’re training signals that help Concierge become smarter and more accurate over time.

---

## Why you’d use Personal Rules

Personal Rules help you:
- Reduce repetitive manual edits
- Clean up messy merchant names
- Auto-categorize recurring purchases
- Automatically add expenses to the correct report
- Set reimbursable or billable status consistently
- Improve vendor matching in accounting exports

They also serve as direct training for Concierge — the more consistently you use them, the better Concierge gets at predicting and applying the right actions on your behalf.

---

## Who can set up Personal Rules

Any member can set up and manage their own Personal Rules. These rules only apply to expenses **you** create, import, or edit — they don’t affect other members.

---

## How Personal Rules work

There are two types of Personal Rules: implicit and manual.

### Implicit Personal Rules (learned automatically)

Concierge watches how you edit your expenses and adapts accordingly. When you consistently apply the same changes to similar expenses, those edits become training data for Concierge.

**Examples:**
- Categorizing “Lyft” as “Transportation” every time? Concierge will learn to do it for you.
- Always editing “Starbucks #1234” to just “Starbucks”? Concierge will start standardizing it.

When highly confident, Concierge may apply these changes automatically — but you can always undo or adjust them.

---

### Manual Personal Rules (coming soon!)

Manual Personal Rules are ones you explicitly create to instruct Concierge exactly how to handle expenses that match specific criteria (like a merchant name). These rules always take priority over implicit learning.

With Manual Rules, you’ll be able to:
- Standardize merchant names (e.g., remove store numbers)
- Auto-categorize specific purchases
- Set custom descriptions
- Mark expenses as billable or reimbursable
- Add expenses to a specific report
- Auto-create a report if needed
- Apply rules globally using a single period (`.`) as the merchant (matches everything)

---

## How to create, edit, or delete Personal Rules

### Create a Personal Rule
1. Go to **Account > Expense Rules**
2. Press **New Rule**
3. Enter the merchant name this rule should match
   - Use a single period `.` to match all merchants
4. Choose the actions you want Concierge to take
   - Rename merchant, set category, change description, etc.
5. Press **Save**

### Edit a Personal Rule
1. Go to **Account > Expense Rules**
2. Select the rule you want to edit
3. Update the fields as needed
4. Press **Save**

### Delete a Personal Rule
1. Go to **Account > Expense Rules**
2. Select the rule you want to delete
3. Press **Delete Rule** (or the equivalent option once UI is final)

**Note:** The interface may change slightly when Manual Personal Rules are released.

---

# FAQ and rule interactions

## How do Personal Rules interact with workspace rules?

Manual Personal Rules override implicit learning. Workspace-level rules (like Category Rules or Report Rules) may still apply **after** Personal Rules, unless explicitly blocked by a workspace setting

## Do Personal Rules affect accounting exports?

Yes — especially for merchant name standardization. Inconsistent names (e.g., “Starbucks #1234” vs. “Starbucks”) can create duplicate vendors in your accounting system. Personal Rules help prevent that. Vendor matching is supported for QuickBooks Online, QuickBooks Desktop and Xero. 

## What’s the difference between implicit and manual Personal Rules?

Implicit rules are automatically learned by Concierge based on your behavior. Manual rules are ones you set up yourself.

## Can I use Personal Rules on someone else’s expenses?

No. Personal Rules only apply to expenses that **you** create.

</div>
