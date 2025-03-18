---
title: Enable and set up expense violations
description: Set up rules for expenses and enable violations
---
<div id="expensify-classic" markdown="1">

Expensify automatically detects expense errors or discrepancies as violations that must be corrected. You can also set rules for a workspace that will trigger a violation if the rule is not met. These rules can be set for categories, tags, and even for specific domain groups.

When reviewing submitted expense reports, approvers will see violations highlighted with an exclamation mark. There are two types of violations:
- **Yellow**: Automated highlights that require attention but may not require corrective action. For example, if a receipt was SmartScanned and then the amount was modified, a yellow violation will be added to call out the change for review.
- **Red**: Violations directly tied to your workspace settings. These violations must be addressed before the report can be submitted and reimbursed.

You can hover over the icon to see a brief description, and you can find more detailed information below the list of expenses. 

{% include info.html %}
If your workspace has automations set to automatically submit reports for approval, the report that contains violations will not be submitted automatically until the violations are corrected. (However, if a comment is added to an expense, it will override the violation as the member is providing a reason for submission *unless* domain workspace rules are set to be strictly enforced, as detailed near the bottom of this article.) 
{% include end-info.html %}

# Enable or disable expense violations

1. Hover over Settings, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name. 
4. Click the **Expenses** tab on the left. 
5. Click the “Enable violations” toggle. 
6. If desired, enter the expense rules that will be used to create violations:
   - **Max expense age (days)**: How old an expense can be
   - **Max expense amount**: How much a single expense can cost
   - **Receipt required amount**: How much a single expense can cost before a receipt is required

{% include info.html %}
Expensify includes certain system mandatory violations that can't be disabled, even if your workspace has violations turned off.
{% include end-info.html %}

# Set category rules

Admins on a Control workspace can enable specific rules for each category, including setting expense caps for specific categories, requiring receipts, and more. These rules can allow you to have a default expense limit of $2,500 but to only allow a daily entertainment limit of $150 per person. You can also choose to not require receipts for mileage or per diem expenses.

To set up category rules, 
1. Hover over Settings, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name.
4. Click the **Categories** tab on the left.
5. Click **Edit** to the right of the category.
6. Enter your category rules, as desired:
   - **GL Code and Payroll Code**: You can add general ledger (GL) or payroll codes to the category for accounting. GL codes populate automatically if you have an accounting integration connected with Expensify.
   - **Max Amount**: You can set specific expense caps for the expense category. Use the Limit Type dropdown to determine if the amount is set per individual expense or per day, then enter the maximum amount into this field.
   - **Receipts**: You can determine whether receipts are required for the category. For example, many companies disable receipt requirements for toll expenses.
   - **Description**: You can determine whether a description is required for expenses under this category.
   - **Description Hint**: You can add a hint in the description field to prompt the expense creator on what they should enter into the description field for expenses under this category.
   - **Approver**: You can set a specific approver for expenses labeled with this category. 

If users are in violation of these rules, the violations will be shown in red on the report. 

{% include info.html %}
If Scheduled Submit is enabled on a workspace, expenses with category violations will not be auto-submitted unless the expense has a comment added.
{% include end-info.html %}

# Make categories required

This means all expenses must be coded with a Category. 

1. Hover over Settings, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name.
4. Click the **Categories** tab on the left.
5. Enable the “People must categorize expenses” toggle. 

Each Workspace Member will now be required to select a category for their expense. If they do not select a category, the report will receive a violation, which can prevent submission if Scheduled Submit is enabled.

# Make tags required

1. Hover over Settings, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name.
4. Click the **Tags** tab on the left. 
5. Enable the “People must tag expenses” toggle.

Each Workspace Member will now be required to select a tag for their expense before they’re able to submit it. 

# Require strict compliance by domain group

You can require strict compliance to require members of a specific domain group to submit reports that meet **all** workspace rules before they can submit their expense report—even if they add a note. Every rule and regulation on the workspace must be met before a report can be submitted. 

{% include info.html %}
This will prevent members from submitting any reports where a manager has granted them a manual exception for any of the workspace rules.
{% include end-info.html %}

To enable strict domain group compliance for reports,

1. Hover over Settings, then click **Domains**. 
2. Click the **Groups** tab on the left. 
3. Click **Edit** to the right of the desired workspace name. 
4. Enable the “Strictly enforce expense workspace rules” toggle. 

# FAQs

**Why can’t my employees see the categories on their expenses?**

The employee may have their default workspace set as their personal workspace. Look under the details section on top right of the report to ensure it is being reported under the correct workspace. 

**Will the account numbers from our accounting system (QuickBooks Online, Sage Intacct, etc.) show in the category list for employees?**

The general ledger (GL) account numbers are visible only for Workspace Admins in the workspace settings when they are part of a control workspace. This information is not visible to other members of the workspace. However, if you wish to have this information available to your employees when they are categorizing their expenses, you can edit the account name in your accounting software to include the GL number (for example, Accounts Payable - 12345).

**What causes a category violation?** 

- An expense is categorized with a category that is not included in the workspace's categories. This may happen if the employee creates an expense under the wrong workspace, which will cause a "category out of workspace" violation.
- If the workspace categories are being imported from an accounting integration and they’ve been updated in the accounting system but not in Expensify, this can cause an old category to still be in use on an open report which would throw a violation on submission. Simply reselect a proper category to clear violation. 

</div>
