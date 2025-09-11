---
title: Prohibited Expenses Rule
description: Learn how to enable and use the Prohibited expenses rule to automatically flag receipts with restricted items such as alcohol, gambling, or tobacco.
keywords: [New Expensify, prohibited expenses, receipt violation, SmartScan, alcohol, gambling, expense rules, workspace settings, line item compliance]
---

Enable the Prohibited Expenses rule to help Workspace Admins enforce compliance by automatically flagging receipts that contain restricted purchases like alcohol, gambling, or tobacco. This rule uses Expensify’s AI-powered SmartScan to review individual line items and alert admins when prohibited categories are detected.

Once set up, SmartScan reviews scanned receipts at the line-item level:

- Works in both **New Expensify** and **Expensify Classic**
- Can only be configured in **New Expensify**
- Automatically adds a violation to a prohibited expense type

---

# Set Up Prohibited Expenses Rules

To turn on the Prohibited Expenses rule:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Rules**, then **Expenses**.
4. Scroll to the **Prohibited Expenses** section.
5. Toggle on the rule.
6. Select the prohibited categories you want to monitor:
   - Adult entertainment
   - Alcohol
   - Gambling
   - Hotel incidentals
   - Tobacco

**Note:** This rule is **off by default**. Workspace Admins must enable it and choose the categories to monitor.

---

# When a Prohibited Item Is Detected

If SmartScan finds a prohibited item in a receipt:

- The expense is flagged with a violation.
- The following messages will appear:
  - `"Receipt Issue Found"`
  - `"Prohibited expense: Alcohol"` (or another selected category)
- The expense will require manual review by an approver.

---

# FAQ

## Who Can Enable the Prohibited Expenses Rule?

Only **Workspace Admins** can enable or adjust this rule.

## Will SmartScan Still Work if the Rule Is Off?

Yes. SmartScan will still extract the merchant, date, and amount. However, it won’t scan for prohibited items unless the rule is enabled.

