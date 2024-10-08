---
title: Create expense tags
description: Add tags to use for coding expenses
---
<div id="new-expensify" markdown="1">

In Expensify, tags refer to **classes, projects, cost centers, locations, customers, jobs**, and other line-item details that help code expenses for accounting and financial reporting.

An admin can manually create tags for a workspace, or they will be automatically imported if your workspace is connected to an accounting system, like QuickBooks Online, Intacct, Xero, or NetSuite. These imported tags can be enabled or disabled to use as tags for expenses added to Expensify. Additionally, Expensify will learn how you apply tags to specific merchants over time and apply them automatically.

![The Tags tab]({{site.url}}/assets/images/ExpensifyHelp_R4_Tags_2.png){:width="100%"}

# Manually add or delete tags

To manually add a tag,

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Click your profile image or icon in the bottom left menu.
2. Scroll down and click **Workspaces** in the left menu. 
3. Select the workspace you want to add tags to. 
4. Click **More features** in the left menu.
5. Scroll down to the Organize section and enable the Tags toggle.
6. Click **Tags** in the left menu.
7. Click **Add Tag** in the top right. 
8. Enter a name for the tag and click **Save**.

{% include option.html value="mobile" %}
1. Tap your profile image or icon in the bottom menu.
2. Tap **Workspaces**. 
3. Select the workspace you want to add tags to.
4. Tap **More features**.
5. In the Organize section, enable the Tags toggle. 
6. Tap **Tags**.
7. Tap **Add Tag**. 
8. Enter a name for the tag and tap **Save**. 
{% include end-option.html %}

{% include end-selector.html %}

![The toggle to enable Tags]({{site.url}}/assets/images/ExpensifyHelp_R4_Tags_1.png){:width="100%"}

To delete a tag, 

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Click the tag on the Tags page. 
2. Click the 3-dot menu in the top right. 
3. Click **Delete tag** to permanently delete the tag. 
{% include end-option.html %}

{% include option.html value="mobile" %}
To delete a tag, 
1. Tap the tag on the Tags page. 
2. Tap the three-dot menu in the top right. 
3. Tap **Delete tag** to permanently delete the tag.
{% include end-option.html %}

{% include end-selector.html %}
 
# Enable or disable tags

Once you have manually added your tags or automatically imported them from a connected accounting system, you can enable or disable the tags to determine whether they can be added to expenses. 

{% include info.html %}
After connecting an accounting system, Expensify automatically imports classes, projects, customers, and additional details into your workspace as disabled tags. Workspace admins can enable these tags to make them available for workspace members to add to their expenses.
{% include end-info.html %}

To enable or disable a tag, 

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Click your profile image or icon in the bottom left menu.
2. Scroll down and click **Workspaces** in the left menu. 
3. Select a workspace. 
4. Click **Tags** in the left menu.
5. Click a tag and use the toggle to enable or disable it.

{% include info.html %}
You can enable, disable, or delete tags in bulk by selecting the checkbox to the left of the tags. Then click the “selected” dropdown menu at the top right of the page and select the desired option.
{% include end-info.html %}

{% include end-option.html %}

{% include option.html value="mobile" %}
1. Tap your profile image or icon in the bottom menu.
2. Tap **Workspaces**. 
3. Select a workspace. 
4. Tap **Tags**.
5. Tap a tag and use the toggle to enable or disable it. 

{% include info.html %}
You can enable, disable, or delete tags in bulk by selecting the checkbox to the left of the tag. Then tap the “selected” dropdown menu at the top of the page and select the desired option.
{% include end-info.html %}

{% include end-option.html %}

{% include end-selector.html %} 

# Add or edit a GL code

If your workspace is on the Control plan, you can optionally add a GL code to each tag. Collect plan users will need to upgrade to Control for access to GL codes.

GL codes can be exported to a CSV export. They are not displayed to users.

**To edit GL codes for a tag:**

1. Click your profile image or icon in the bottom left menu
2. Click **Workspaces** in the left menu
3. Select a workspace
4. Click **Tags**
5. Click a tag to open the tag-settings
6. To add or edit a GL code, click the GL code field, make the desired change, then click **Save**

# Apply tags to expenses automatically

Over time, Expensify learns how you tag specific merchants and automatically applies that tag to the merchant in the future. 
- If you change a tag, Expensify learns that correction over time as well. However, changing a tag on one expense does not change it for other expenses that have already been assigned the tag.
- Any expense rules for your workspace take priority over Expensify’s automatic tags. 
- Expensify won’t automatically tag an expense if it is already manually assigned a tag. 

{% include faq-begin.md %}
**Can I edit my tags on a submitted expense report?**

Yes, you can edit tags on an expense you have submitted until the expense is approved or reimbursed. 

Approvers can also edit tags on the submitter’s behalf, even after approval. If you are an approver reviewing a report that wasn’t submitted to you, you’ll see the option to take control of the report and then you can change the tag. 

**Can I see an audit trail of tag changes on an expense?** 

Yes. When a tag is manually edited, Expensify will log the change in the related workspace chat. 

**If I change tags in my accounting system, what happens to tags in the workspace?**

If a tag is disabled in the accounting system, it will be removed from the workspace’s tags list in the workspace. However, the disabled tag will remain on approved and drafted expense reports that it has been previously added to. An admin can change the tag on an approved or reimbursed expense, and anyone can change the tag on an unapproved expense.

**Can I set up multi-level tags in New Expensify?**

At this time, only single-level tags are available in New Expensify. If you’ve used multi-level tags in Expensify Classic, you will see the first-level tag in New Expensify. Multi-level tags are under development.
{% include faq-end.md %}

</div>
