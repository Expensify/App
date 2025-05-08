---
title: Workspace Rules
description: Configure and manage rules for your workspace
---

Rules help you control and manage expenses, ensuring compliance with your company’s policies. Whether you want to set limits on spending, require receipts, or prevent self-approvals, rules give you the flexibility to tailor expense management to your needs.

{% include info.html %}
Rules are available for Control workspaces only. You must be a Workspace Admin to complete this process.
{% include end-info.html %}

# Enable rules

1. Click your profile image or icon in the bottom menu.
2. Scroll down and click **Workspaces** in the left menu.
3. Select the workspace you want to enable rules for.
4. Click **More features** in the left menu.
5. Under the Manage section, enable the **Rules** toggle.

# Configure workspace expense rules

Once Rules are enabled, you can customize individual expense settings:

1. Click **Rules** in the left menu.
2. Under **Expenses**, configure the following:

- **Receipt required amount**: Specify when receipts are required. Accepts decimal values.
- **Max expense amount**: Set a spending limit per expense. Accepts decimal values.
- **Max expense age (days)**: Define how old an expense can be. Accepts whole numbers only.
- **Billable default**: Set expenses as billable or non-billable by default.
- **eReceipts**: Enable eReceipts for most USD credit transactions. This is available when the Default currency set in the Overview is set to USD.

# Configure Prohibited Expense Rule

To flag restricted expense types for manual review:

1. Go to **Settings** > **Workspaces** > click **Workspace Name** > **Rules** > **Expenses**.
2. Scroll to the **Prohibited expenses** section.
3. Toggle on the feature, then select the types of restricted items to flag:
   - Alcohol  
   - Gambling  
   - Tobacco  
   - Hotel incidentals  
   - Adult entertainment  
4. If an uploaded receipt contains any of the flagged items, the expense will be marked for manual review.

**Note:** Prohibited expense violations appear in both New Expensify and Expensify Classic. However, a Workspace Admin must enable the rules in **New Expensify** for them to take effect.

# Configure expense report rules

1. Click **Rules** in the left menu.
2. Under **Expense Reports**, configure the following:

- **Custom report names**: Create default titles for reports.
- **Prevent self-approvals**: Stop users from approving their own reports.
- **Auto-approve compliant reports**: Automatically approve reports below a set amount and set a random report audit percentage.
- **Auto-pay approved reports**: Automatically pay reports below a specific threshold when approved.

# Configure category rules

1. Go to **Categories** in the left menu within workspace settings
2. Select a category to open its details.
3. Under **Category Rules**, configure the following:

- **Enable category**: Make the category visible to workspace members when creating or submitting expenses
- **Require description**: Make descriptions mandatory for certain categories.
- **Approver**: Assign a specific approver per category.
- **Default tax rate**: Set a default tax rate for each category.
- **Max amount**: Define spending limits by category.
- **Require receipts over**: Specify when receipts are required for category expenses.

# Configure tag rules

1. Go to **Tags** in the left menu within workspace settings.
2. Select a tag to open its details.
3. Under **Tag Rules**, configure the following:

- **Tag approver**: Assign approvers for specific tags.

# Manage default categories and billable expenses

- **Default Categories**: Auto-categorize expenses based on the Merchant Category Code (MCC). Set in **Categories** under the **Settings** option on the top right of the page for credit card transactions and receipts.
- **Billable Expenses**: Set in **Tags** under the **Settings** option on the top right of the page to require tagging always or just when an expense is flagged as billable.

{% include faq-begin.md %}

**Who can manage rules?**

Only Workspace Admins can configure and manage rules.

**What happens if I disable rules?**

Disabling rules will remove any violations or warnings from draft or outstanding expenses that relied on those rules.

{% include faq-end.md %}

