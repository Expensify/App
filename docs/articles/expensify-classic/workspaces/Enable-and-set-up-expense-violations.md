---
title: Enable and set up Expense Violations
description: Set up rules for expenses and enable violations
keywords: [Expensify Classic, violations, expense violations]
---
<div id="expensify-classic" markdown="1">

   Expensify automatically detects expense errors or discrepancies as violations that must be corrected. You can also set rules for a workspace that will trigger a violation if the rule is not met. These rules can be set for categories, tags, and even for specific domain groups.

When reviewing submitted expense reports, approvers will see violations highlighted with an exclamation mark. There are two types of violations:
- **Yellow**: Automated highlights that require attention but may not require corrective action. For example, if a receipt was SmartScanned and then the amount was modified, a yellow violation will be added to call out the change for review.
- **Red**: Violations directly tied to your workspace settings. These violations must be addressed before the report can be submitted and reimbursed.

You can hover over the icon to see a brief description, and you can find more detailed information below the list of expenses. 

⚠️ **Important:** If your workspace is set to automatically submit reports for approval, the report containing violations will not be submitted automatically until the violations are corrected. However, if a comment is added to an expense, it will override the violation as the member is providing a reason for submission **unless domain workspace rules are set to be strictly enforced**, as detailed near the bottom of this article.

---

# Enable Expense Violations

1. Hover over **Settings**, then click **Workspaces**.
2. Click the **Group** tab on the left.
3. Click the desired workspace name.
4. Click the **Expenses** tab on the left.
5. Click the **Enable violations** toggle to turn it on or off.
   - If disabled, expense violations will no longer appear, and workspace rules will not enforce restrictions.
6. If enabled, enter the expense rules that will be used to create violations:
   - **Max expense age (days)**: How old an expense can be
   - **Max expense amount**: How much a single expense can cost
   - **Receipt required amount**: How much a single expense can cost before a receipt is required

**Note:** Expensify includes certain system-mandatory violations that can't be turned off, even if you do not have violations enabled on your workspace.

---

# Set Category Rules

Admins on a Control workspace can enable specific rules for each category, including setting expense caps for specific categories, requiring receipts, and more. These rules allow you to set different limits per category. For example, you can set a general expense limit of $2,500 but limit daily entertainment expenses to $150 per person. You can also choose to exempt certain expense types, such as mileage or per diem, from receipt requirements.

To set up category rules:
1. Hover over **Settings**, then click **Workspaces**.
2. Click the **Group** tab on the left.
3. Click the desired workspace name.
4. Click the **Categories** tab on the left.
5. Click **Edit** next to the category.
6. Enter your category rules as needed:
   - **GL Code and Payroll Code**: Add general ledger (GL) or payroll codes to the category for accounting.
   - **Max Amount**: Set specific expense caps per expense or per day.
   - **Receipts**: Define whether receipts are required for the category.
   - **Description**: Require a description for the category.
   - **Description Hint**: Provide a prompt to guide users on entering a description.
   - **Approver**: Assign a specific approver for expenses in this category.

If users violate these rules, the violations will be displayed in red on the report.

**Note:** If Scheduled Submit is enabled on a workspace, expenses with category violations will not be auto-submitted unless a comment is added to the expense.

---

# Make Categories Required

This setting ensures all expenses must be coded with a category.

1. Hover over **Settings**, then click **Workspaces**.
2. Click the **Group** tab on the left.
3. Click the desired workspace name.
4. Click the **Categories** tab on the left.
5. Click the **People must categorize expenses** toggle.

If a category is not selected, the report will receive a violation, which may prevent submission if **Scheduled Submit** is enabled.

---

# Make Tags Required

1. Hover over **Settings**, then click **Workspaces**.
2. Click the **Group** tab on the left.
3. Click the desired workspace name.
4. Click the **Tags** tab on the left.
5. Click the **People must tag expenses** toggle.

Each workspace member must now select a tag before submitting an expense.

---

# Require Strict Compliance by Domain Group

You can enforce strict compliance to ensure that all workspace rules are met before members of a specific domain group can submit an expense report—even if they add a note. Every rule must be followed without exception.

**Note:** This setting prevents members from submitting reports where a manager has granted them a manual exception for workspace rules.

To enable strict compliance:
1. Hover over **Settings**, then click **Domains**.
2. Click the **Groups** tab on the left.
3. Click **Edit** next to the domain group name.
4. Click the **Strictly enforce expense workspace rules** toggle.

---

# FAQ

## Why can’t my employees see the categories on their expenses?

Employees may have their default workspace set to their personal workspace. Check the **Details** section at the top right of the report to ensure it is being reported under the correct workspace.

## Will the account numbers from our accounting system (QuickBooks Online, Sage Intacct, etc.) show in the category list for employees?

GL account numbers are only visible to **Workspace Admins** when part of a Control workspace. They are not visible to other members. If you want employees to see this information, modify the account name in your accounting system to include the GL number (e.g., Accounts Payable - 12345).

## What causes a category violation?

- An expense is categorized under a category that is not included in the workspace settings.
- If workspace categories are imported from an accounting system and updated there but not in Expensify, old categories may still be assigned, leading to violations. Re-select a correct category to resolve the issue.

</div>
