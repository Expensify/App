---
title: Prohibited Expenses Rule
description: Learn how to enable and use the Prohibited expenses rule to automatically flag receipts with restricted items such as alcohol, gambling, or tobacco.
keywords: [prohibited expenses, receipt violation, SmartScan, alcohol, gambling, expense rules, workspace settings, line item compliance]
---
<div id="new-expensify" markdown="1">

Enable the **Prohibited expenses** rule to automatically flag receipts containing restricted purchases like alcohol, gambling, or tobacco. This rule uses Expensify’s AI-powered SmartScan to detect violations at the line-item level and notify admins for review.

# Prohibited Expense Rule

The Prohibited expenses rule allows Workspace Admins to enforce compliance by flagging receipts that contain restricted items. SmartScan analyzes individual line items and applies violations when prohibited categories are detected.

## How it works

Once enabled, this rule uses AI to review receipt line items during SmartScan. If a prohibited item is found, the expense is flagged for review.

- Available in both Expensify Classic and New Expensify.
- Configuration is only available in New Expensify.
- Automatically flags receipts for manual review by a Workspace Admin or approver.

## How to enable the rule

To turn on the Prohibited expenses rule:

1. Go to **Settings** > **Workspaces** > click _Workspace Name_ > **Rules** > **Expenses**.
2. Scroll to the section titled **Prohibited expenses**.
3. Toggle on the rule.
4. Select the prohibited categories you want to monitor:
   - Adult entertainment
   - Alcohol
   - Gambling
   - Hotel incidentals
   - Tobacco

**Note:** This rule is disabled by default. Admins must enable it and choose which categories to apply.

## What happens when a prohibited item is detected?

If a SmartScan detects a prohibited item:

- A violation is added to the expense.
- The expense displays the messages:
  - `"Receipt Issue Found"`
  - `"Prohibited expense: Alcohol"` (or the relevant flagged category).
- The expense requires manual review by the approver.

---

# FAQ

## Who can enable the Prohibited Expenses Rule?

Only Workspace Admins can enable or adjust this rule in New Expensify.

## Will violations appear in Expensify Classic?

Yes. Even though configuration is handled in New Expensify, violations appear in both **Expensify Classic** and **New Expensify** when viewing expenses.

If the Domain Group setting, **Strictly enforce expense workspace rules** is enabled, it will block the submission of the expense with the prohibited item violation. 

## Will SmartScan still work if the rule is off?

Yes. SmartScan will still extract the merchant, date, and amount. However, it will not flag line items for violations unless the rule is enabled.

## Is this rule part of SmartScan?

Yes. Once enabled, the rule works seamlessly with SmartScan to detect prohibited line items in all scanned receipts.

</div>
