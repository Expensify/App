---
title: Workspace Tags
---
# Overview
You can use tags to assign expenses to a specific department, project, location, cost center, and more. 

Note that tags function differently depending on whether or not you connect Expensify to a direct account integration (i.e., QuickBooks Online, NetSuite, etc.). With that said, this article covers tags that work for all account setups.
# How to use Tags
Tags are a workspace-level feature. They’re generally used to code expenses to things like customers, projects, locations, or departments. at the expense level. You can have different sets of tags for different workspaces, allowing you to customize coding for cohorts of employees.

With that said, tags come in two forms: single tags and multi-level tags.

## Single Tags
Single tags refer to the simplest version of tags, allowing users to code expenses on a single level. With a single tag setup, users will pick from the list of tags you created and make a single selection on each expense.
## Multi-Level Tags
On the other hand, Multi-Level Tags refer to a more advanced tagging system that allows you to code expenses in a hierarchical or nested manner. Unlike single tags, which are standalone labels, multi-level tags enable you to create a structured hierarchy of tags, with sub-tags nested within parent tags. This feature is particularly useful for organizations that require a more detailed and organized approach to expense tracking.
# How to import single tags (no accounting integration connected)
## Add single tags via spreadsheet
To set up Tags, follow these steps:
- Go to **Settings > Workspace > Group / Individual > [Workspace name] > Tags**.
- You can choose to add tags one by one, or upload them in bulk via a spreadsheet.

After downloading the CSV and creating the tags you want to import, go to the Tags section in the policy editor: Settings > Workspaces > Group > [Workspace name] > Tags
 Enable multi-level tags by toggling the button.
Click "Import from Spreadsheet" to bring in your CSV.
 Indicate whether the first line contains the tag header.
Choose if the tag list is independent or dependent (matching your CSV).
Decide if your tags list includes GL codes.
Upload your CSV or TSV file.
Confirm your file and update your tags list.
## Manually add single tags

If you need to add Tags to your workspace manually, you can follow the steps below.

On web: 

1. Navigate to Settings > Workspace > Group / Individual > [Workspace name] > Tags. 
2. Add new tags under Add a Category.
   
On mobile:

1. Tap the three-bar menu icon at the top left corner of the app
2. Tap on Settings in the menu on the left side
3. Scroll to the Workspace subhead and click on tags listed underneath the default policy
4. Add new categories by tapping the + button in the upper right corner. To delete a category, on iOS swipe left, on Android press and hold. Tap a category name to edit it.
   
# How to import multi-level tags (no accounting integration connected)
To use multi-level tags, go to the Tags section in your workspace settings.
Toggle on "Do you want to use multiple levels of tags?"

This feature is available for companies with group workspaces and helps accountants track more details in expenses.

If you need to make changes to your multi-level tags, follow these steps:
1. Start by editing them in a CSV file.
2. Import the revised tags into Expensify.
3. Remember to back up your tags! Uploading a CSV will replace your existing settings.
4. Safest Option: Download the old CSV from the Tags page using 'Export to CSV,' make edits, then import it.

## Manage multi-level tags
Once multi-level tagging has been set up, employees will be able to choose more than one tag per expense. Based on the choice made for the first tag, the second subset of tag options will appear. After the second tag is chosen, more tag lists can appear, customizable up to 5 tag levels.

### Best Practices
- Multi-level tagging is available for companies on group workspaces and is intended to help accountants track additional information at the expense line-item level.
- If you need to make any changes to the Tags, you need to first make them on the CSV and import the revised Tags into Expensify. 
- Make sure to have a backup of your tags! Every time you upload a CSV it will override your previous settings. 
- The easiest way to keep the old CSV is to download it from the Tags page by clicking Export to CSV, editing the list, and then importing it to apply the changes.


# How to import tags with an accounting integration connected
If you have connected Expensify to a direct integration such as QuickBooks Online, QuickBooks Desktop, Sage Intacct, Xero, or NetSuite, then Expensify automatically imports XYZ from your accounting system as tags.

When you first connect your accounting integration you’ll configure classes, customers, projects, departments locations, etc. to import as tags in Expensify. 

If you need to update your tags in Expensify, you will first need to update them in your accounting system, then sync the connection in Expensify by navigating to Settings > Workspace > Group > [Workspace Name] > Connection > Sync Now.

Alternatively, if you update the tag details in your accounting integration, be sure to sync the policy connection so that the updated information is available on the workspace. 

# Deep Dive
## Make tags required
You can require tags for any workspace expenses by enabling People must tag expenses on the Tags page by navigating to Settings > Workspace > Group > [Workspace Name] > Tags.
# FAQ

## What are the different tag options? 
If you want your second tag to depend on the first one, use dependent tags. Include GL codes if needed, especially when using accounting integrations.
For other scenarios, like not using accounting integrations, use independent tags, which can still include GL codes if necessary.


## Are the multi-level tags only available with a certain subscription (pricing plan)?
Multi-level tagging is only available with the Control type policy.

## I can’t see "Do you want to use multiple level tags" feature on my company's expense workspace. Why is that?
If you are connected to an accounting integration, you will not see this feature. You will need to add those tags in your integration first, then sync the connection.


