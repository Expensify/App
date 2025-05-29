---
title: Domain Groups
description: How to set different rules for different members of your domain
keywords: [Expensify Classic, domain groups, domain restrictions, additional permissions, rules]
---

<div id="expensify-classic" markdown="1">

To set different domain rules for different members, you can place them into groups. This allows organizations to customize permissions based on roles, such as employees and managers, ensuring they have the appropriate access and settings.  

---

# Configuring Domain Groups  

1. Hover over **Settings**, then click **Domains**.  
2. Click the name of the domain.  
3. Click the **Groups** tab.  
4. Click **Create Group**.  
5. Configure the group settings and permissions:  
   - **Permission Group Name**: Enter a name for the group.  
   - **Default Group**: Choose if new domain members will be automatically added to this group.  
   - **Strictly enforce expense workspace rules**: Decide if all expense rules must be met before group members can submit a report.  
   - **Restrict primary contact method selection**: Choose whether members can access their Expensify account using a personal email.  
   - **Restrict expense workspace creation/removal**: Set whether members can create or remove workspaces.  
   - **Preferred workspace**: Select a default workspace for group members' expenses and reports.  
   - **Set preferred workspace to**: If enabled, specify which workspace will be set as preferred.  
   - **Expensify Card Preferred Workspace**: If the preferred workspace is enabled, check whether Expensify Card transactions for this group will be posted to the preferred workspace for the Expensify Card instead of the one in the above settings. 
6. Click **Save**.

---

# When to Use Different Domain Group Permissions  

## Strictly enforce expense workspace rules
This setting ensures all workspace-level rules are followed before an expense report is submitted. This prevents expense reports from being submitted with missing receipts, incorrect categories, or violations.  

## Restrict primary contact method selection
Enable this setting to ensure employees use their company email instead of a personal email account when submitting expense reports. This helps to maintain security and compliance within your organization.  

## Restrict expense workspace creation/removal
Set this to prevent employees from creating additional workspaces outside of the company workspace they're already a member of. This will ensure expense reports are always routed through the correct company-approved channels.  

## Preferred workspace
If you have multiple workspaces across several teams, use this setting to assign an employee to their corresponding workspace. For instance, use this for sales teams so their expenses automatically post to the "Sales Department" workspace, reducing the need for manual adjustments.  

## Expensify Card Preferred Workspace
Enable this if your team uses the Expensify Cards for business expenses. This will ensure that all transactions are posted directly to the correct workspace without additional setup.  
</div>
