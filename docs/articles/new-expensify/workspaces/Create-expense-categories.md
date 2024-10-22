---
title: Create expense categories
description: Add categories to use for coding expenses
---
<div id="new-expensify" markdown="1">

In Expensify, categories refer to the **chart of accounts, GL accounts, expense accounts**, and other line-item details that help code expenses for accounting and financial reporting.

An admin can manually create categories for a workspace, or they will be automatically imported if your workspace is connected to another platform such as QuickBooks Online, QuickBooks Desktop, Intacct, Xero, or NetSuite. These imported categories can be enabled or disabled to use as categories for expenses added to Expensify. Additionally, Expensify will learn how you apply categories to specific merchants over time and apply them automatically.

![The Categories tab]({{site.url}}/assets/images/ExpensifyHelp_R3_Categories_1.png){:width="100%"}

# Manually add or delete categories

To manually add a category,

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Click your profile image or icon in the bottom left menu.
2. Scroll down and click **Workspaces** in the left menu. 
3. Select the workspace you want to add categories to. 
4. Click **Categories** in the left menu.
5. Click **Add Category** in the top right. 
6. Enter a name for the category and click **Save**.
{% include end-option.html %}

{% include option.html value="mobile" %}
1. Tap your profile image or icon in the bottom menu.
2. Tap **Workspaces**. 
3. Select the workspace you want to add categories to.
4. Tap **Categories**.
5. Tap **Add Category**. 
6. Enter a name for the category and tap **Save**. 
{% include end-option.html %}

{% include end-selector.html %}

To delete a category, 

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Click the category on the Categories page. 
2. Click the 3-dot menu in the top right. 
3. Click **Delete category** to permanently delete the category.
{% include end-option.html %}

{% include option.html value="mobile" %}
1. Tap the category on the Categories page. 
2. Tap the 3-dot menu in the top right. 
3. Tap **Delete category** to permanently delete the category.
{% include end-option.html %}

{% include end-selector.html %}

# Enable or disable categories

Once you have manually added your categories or automatically imported them from a connected accounting system, you can enable or disable the categories to determine whether they can be added to expenses. 

{% include info.html %}
Importing GL & payroll codes from your accounting system is only available on the Control plan. After connecting an accounting system, Expensify automatically imports charts of accounts, GL accounts, expense accounts, and additional details into your workspace as **disabled** categories. Workspace admins can enable these categories to make them available for workspace members to add to their expenses.
{% include end-info.html %}

To enable or disable a category, 

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Click your profile image or icon in the bottom left menu.
2. Scroll down and click **Workspaces** in the left menu. 
3. Select a workspace. 
4. Click **Categories** in the left menu.
5. Click a category and use the toggle to enable or disable it.

{% include info.html %}
You can enable, disable, or delete categories in bulk by selecting the checkbox to the left of the categories. Then click the “selected” dropdown menu at the top right of the page and select the desired option. 
{% include end-info.html %}

{% include end-option.html %}

{% include option.html value="mobile" %}
1. Tap your profile image or icon in the bottom menu.
2. Tap **Workspaces**. 
3. Select a workspace. 
4. Tap **Categories**.
5. Tap a category and use the toggle to enable or disable it. 

{% include info.html %}
You can enable, disable, or delete categories in bulk by selecting the checkbox to the left of the categories. Then tap the “selected” dropdown menu at the top of the page and select the desired option.
{% include end-info.html %}

{% include end-option.html %}

{% include end-selector.html %} 

# Add or edit a GL code or payroll code

If your workspace is on the Control plan, you can optionally add a GL code and payroll code to each category. Collect plan users will need to upgrade to Control for access to GL codes and payroll codes.

GL codes and payroll codes can be exported to a CSV export. They are not displayed to users.

**To edit GL codes or payroll codes for a category:**

1. Click your profile image or icon in the bottom left menu
2. Click **Workspaces** in the left menu
3. Select a workspace
4. Click **Categories**
5. Click a category to open the category-settings
6. To add or edit a GL code, click the GL code field, make the desired change, then click **Save**
7. To add or edit a payroll code, click the payroll code field, make the desired change, then click **Save**


# Apply categories to expenses automatically

Over time, Expensify learns how you categorize specific merchants and automatically applies that category to the merchant in the future. 
- If you change a category, Expensify learns that correction over time as well. However, changing a category on one expense does not change it for other expenses that have already been assigned the category.
- Any expense rules for your workspace take priority over Expensify’s automatic categories. 
- Expensify won’t automatically add a category to an expense if it is already manually assigned a category. 

{% include faq-begin.md %}
**Can I edit my categories on a submitted expense report?**

Yes, you can edit categories on an expense you have submitted until the expense is approved or reimbursed. 

Approvers can also edit categories on the submitter’s behalf, even after approval. If you are an approver reviewing a report that wasn’t submitted to you, you’ll see the option to take control of the report and then you can change the category. 

**Can I see an audit trail of category changes on an expense?** 

Yes. When a category is manually edited, Expensify will log the change in the related workspace chat. 

**If I change categories in my accounting system, what happens to categories in the workspace?**

If a category is disabled in the accounting system, it will be removed from the workspace’s categories list in the workspace. However, the disabled category will remain on approved and drafted expense reports that it has been previously added to. An admin can change the category on an approved or reimbursed expense, and anyone can change the category on an unapproved expense.

**How can my employees see the GL codes on categories?**

GL codes added in the GL section of individual category settings are not visible to employees. If your employees need to see the GL code associated with a category, the category name would need to be edited to include it.

{% include faq-end.md %}

</div>
