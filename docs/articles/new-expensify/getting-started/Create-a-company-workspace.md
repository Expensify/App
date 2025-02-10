---
title: Configure your Expensify workspace
description: Get started with Expensify by creating a workspace for your company 
---
<div id="new-expensify" markdown="1">

To create and configure an Expensify workspace, follow the steps below and enjoy a free 30-day trial. Creating your first workspace assigns you to your dedicated Setup Specialist, so be sure to schedule a call with them or chat with Concierge for any help you need. Message your Setup Speciliast in your #admins chat room or Concierge via your Inbox or Search.

# 1. Create a workspace 

Workspaces are used to manage company expenses. Each workspace has its own set of rules, settings, company card feeds, and integrations. Once invited to a workspace, members can submit their expense through the expense management process your workspace enforces. 

<ol type="a">
   <li>Click your profile photo or icon in the bottom left menu.</li>
   <li>Scroll down and click <b>Workspaces</b> in the left menu.</li>
   <li>Click <b>New workspace</b>.</li>
   <li>Click the Edit pencil icon next to your workspace image or icon and select <b>Upload Image</b> to choose an image from your saved files.</li>
   <li>Click <b>Name</b> to enter a new name for the workspace.</li>
   <li>Click <b>Default Currency</b> to set the currency for all expenses submitted under the workspace. Expensify automatically converts all other currencies to your default currency.</li>
</ol>

![Click your profile photo or icon]({{site.url}}/assets/images/ExpensifyHelp_CreateWorkspace_1.png){:width="100%"}

![Click Workspaces in the left menu and New Worksapce]({{site.url}}/assets/images/ExpensifyHelp_CreateWorkspace_2.png){:width="100%"}

![Options to make changes like a custom workspace name]({{site.url}}/assets/images/ExpensifyHelp_CreateWorkspace_3.png){:width="100%"}

# 2. Connect to your accounting software

Skip this step if you do not use QBO, Xero, NetSuite, or Sage Intacct - Expensify supports all accounting software exports and imports, you'll just have to configure your coding and exports using guidance in step #3.

Connecting your workspace to your company's accounting software serves two key functions in Expensify: 

<b>Import</b>: Once connected, Expensify imports your coding, e.g. your chart of accounts, from QBO so employees can select it on their expenses.
<b>Export</b>: Once an expense report final approved, Expensify exports your expense data directly to QBO

Follow the steps to connect and configure your accounting software and return to step #3 when you are done;

<ol type="a">
   <li>[Connect to QuickBooks Online](https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Connect-to-QuickBooks-Online)</li>
   <li>[Connect to Xero](https://help.expensify.com/articles/new-expensify/connections/xero/Connect-to-Xero)</li>
   <li>[Connect to NetSuite](https://help.expensify.com/articles/new-expensify/connections/netsuite/Connect-To-NetSuite)</li> 
   <li>[Connect to Sage Intacct](https://help.expensify.com/articles/new-expensify/connections/sage-intacct/Connect-to-Sage-Intacct)</li> 
</ol>

# 3. Add categories

Categories help you code your expenses. If you connected to your accounting software at step #2, your chart of accounts will have imported and be visible in the Categories tab of your workspace. All you have to do next is disable the categories you don't need to present to workspace members on their expenses for coding. 

<ol type="a">
   <li>Click <b>Categories</b> in the left menu.</li>
   <li>Disable or add categories.</li> 
      <ul>
         <li><b>To disable a category</b>: Click the category, then click the green toggle to disable it.</li>
         <li><b>To add a new category</b>: Click <b>Add category</b> in the top right. Then enter a name for the category and click <b>Save</b>.</li>
      </ul>
</ol>

If you did not connect to your accounting software, you can easily add your categories [by following these steps](https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-categories).

{% include info.html %}
Categories are enabled by default. However, if you want to completely disable all categories, you can do so by clicking **More Features** in the left menu and clicking the Categories toggle to disable it.
{% include end-info.html %}

# 4. Invite members

<ol type="a">
   <li>From the workspace view, click <b>Members</b> on the left.</li>
   <li>Click <b>Invite member</b>.</li>
   <li>Use the search field to find the individual by name, email, or phone number. <i>Note: You can select multiple people</i>.</li> 
   <li>Click <b>Next</b>.</li> 
   <li>(Optional) Enter a custom message into the Message field.</li> 
   <li>Click <b>Invite</b>.</li>
</ol>
Once the invite is accepted, the new members will appear in your members list. 

{% include info.html %}
You can also invite members on the workspace’s Profile page by clicking **Share** to share the workspace’s URL or QR code.
{% include end-info.html %}

![Click Members on the left and click Invite member]({{site.url}}/assets/images/ExpensifyHelp_InviteMembers_1.png){:width="100%"}

![Use the search field to find the individual by name, email, or phone number]({{site.url}}/assets/images/ExpensifyHelp_InviteMembers_2.png){:width="100%"}

![Enter a custom message into the Message field]({{site.url}}/assets/images/ExpensifyHelp_InviteMembers_3.png){:width="100%"}

# 5. Set admins

Admins are members of your workspace who have permission to manage the workspace. The table below shows the difference between member and admin permissions:

| Employee                                  | Workspace Admin                            |
| ----------------------------------------- | ------------------------------------------ |
| &#10004; Submit their own reports         | &#10004; Submit their own reports          |
| &#10004; Approve reports submitted to them| &#10004; Approve reports submitted to them |
|                                           | &#10004; View all workspace reports        |
|                                           | &#10004; Approve all workspace reports     |
|                                           | &#10004; Edit workspace settings           |

To assign a member as an admin, 

<ol type="a">
   <li>From the Members page of your workspace, click any member’s name.</li>
   <li>Click <b>Role</b> to change their role to Admin.</li>
</ol>

# 6. Add approval workflows

Now that you have invited your team and assigned their roles you can configure whatever approval workflow you need. 

To enable Add approvals on a workspace you are an admin on:

<ol type="a">
    <li>Click your profile image or icon in the bottom left menu</li>
    <li>Click <b>Workspaces</b> in the left menu</li>
    <li>Select the workspace where you want to add approvals</li>
    <li>Click <b>Workflows</b> in the left menu</li>
    <li>Click the toggle next to <b>Add approvals</b></li>
</ol>

To configure the default approval workflow for the workspace:

<ol type="a">
    <li>Click your profile image or icon in the bottom left menu</li>
    <li>Click <b>Workspaces</b> in the left menu</li>
    <li>Select the workspace where you want to set the approval workflow</li>
    <li>Click <b>Workflows</b> in the left menu</li>
    <li>Under <b>Expenses from Everyone</b>, click on <b>First approver</b></li>
    <li>Select the workspace member who should be the first approver in the approval workflow</li>
    <li>Under <b>Additional approver</b>, continue selecting workspace members until all the desired approvers are listed</li>
    <li>Click <b>Save</b></li>
</ol>

Note: When Add approvals is enabled, the workspace must have a default approval workflow.

To set an approval workflow that applies only to specific workspace members:

<ol type="a">
   <li>Click your profile image or icon in the bottom left menu</li>
   <li>Click <b>Workspaces</b> in the left menu</li>
   <li>Select the workspace where you want to add approvals</li>
   <li>Click <b>Workflows</b> in the left menu</li>
   <li>Under <b>Add approvals</b>, click on <b>Add approval workflow</b></li>
   <li>Choose the workspace member whose expenses should go through the custom approval workflow</li>
   <li>Click <b>Next</b></li>
   <li>Choose the workspace member who should be the first approver on submitted expenses in the approval workflow</li>
   <li>Click <b>Next</b></li>
   <li>Click <b>Additional approver</b> to continue selecting workspace members until all the desired approvers are listed</li>
   <li>Click <b>Add workflow</b> to save it</li>
</ol>

# 7. Add more features (Expensify Cards, Company Cards, Reimbursement, Distance Rates, Tags, & Rules)

The items that appear in your left menu under each workspace are determined by the features that are enabled for the workspace. For example, you can choose to enable or disable any of the following features: 

- [Expensify Cards](https://help.expensify.com/new-expensify/hubs/expensify-card/)
- [Rules](https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules)
- [Distance rates](https://help.expensify.com/articles/new-expensify/workspaces/Set-distance-rates)
- [Workflows - Payments](https://help.expensify.com/articles/new-expensify/expenses-&-payments/Connect-a-Business-Bank-Account)
- [Workflows - Delayed submission](https://help.expensify.com/articles/new-expensify/workspaces/Set-up-workflows#select-workflows)
- [Tags](https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-tags)
- [Taxes](https://help.expensify.com/articles/new-expensify/workspaces/Track-taxes) 

Once enabled, a new menu option with additional settings for the feature will appear in the left menu. Remember to chat with your assigned Setup Specialist or Concierge for any help enabling a feature you need. 

To add more features,

<ol type="a">
   <li>Click <b>More features</b> in the left menu.</li>
   <li>Enable any desired feature.</li> 
   <li>Click the related menu item that appears in the left menu to update its settings.</li>
</ol>

# 8. You are ready to make the most of your free trial! 

Easily monitor when your Free Trial starts and how many days are left on your Subscription page. Chat or schedule a call with your assigned Setup Specialist in your #admins chat room whenever you have a question. We’ll also notify you when your trial starts and ends, at which point you’ll add a billing card to continue using all your favorite features!

![Hightlight the free trial start and end date]({{site.url}}/assets/images/ExpensifyHelp-FreeTrial-1.png){:width="100%"}
 
</div>
