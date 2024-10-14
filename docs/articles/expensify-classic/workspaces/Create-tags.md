---
title: Create Tags
description: Code expenses by creating tags
---
<div id="expensify-classic" markdown="1">

You can tag expenses for a specific department, project, location, cost center, customer, etc. You can also use different tags for each workspace to create customized coding for different employees.

You can use single tags or multi-level tags:
- **Single Tags**: Employees click one dropdown to select one tag. Single tags are helpful if employees need to select only one tag from a list, for example, their department.
- **Multi-level Tags**: Employees click multiple dropdowns to select more than one tag. You can also create dependent tags that only appear if another tag has already been selected. Multi-tags are helpful if you have multiple tags, for example, projects, locations, cost centers, etc., for employees to select or if you have dependent tags. For example, if an employee selects a specific department, another tag can appear where they have to select their project. 

To add your tags, you can either import them for an accounting system or spreadsheet or add them manually.

# Single Tags

## Import via spreadsheet

You can add a list of single tags by importing them via .csv, .txt, .xls, or .xlsx spreadsheet:
1. Hover over Settings, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name. 
4. Click the **Tags** tab on the left. 
5. Click **Import from Spreadsheet**.
6. Review the guidelines, select the checkbox if your file has headers as the first row, and click **Upload File**. 

{% include info.html %}
Each time you upload a list of tags, it will override your previous list. To avoid losing tags, update your current spreadsheet and re-import it into Expensify.
{% include end-info.html %}

## Manually add individual tags
You can also add single tags by adding them manually:
1. Hover over Settings, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name. 
4. Click the **Tags** tab on the left. 
5. Enter a tag name into the field and click **Add**. 

# Multi-level Tags

## Automatic import via accounting integration

When you first connect your accounting integration (for example, QuickBooks Online, QuickBooks Desktop, Sage Intacct, Xero, or NetSuite), you’ll configure classes, customers, projects, department locations, etc., that automatically import into Expensify as tags.

To update your tags in Expensify, you must first update the tag in your accounting system:
1. Hover over Settings, then click **Workspaces**.
2. Click the **Group** tab on the left.
3. Click the desired workspace name.
4. Click the **Connections** tab on the left.
5. Click **Sync Now**.

Once the tags are updated in your accounting integration, the changes will reflect in Expensify automatically after running the connection sync. 

## Import via spreadsheet

You can add mutli-level tags by importing them in a .csv, .txt, .xls, or .xlsx spreadsheet.

First, determine whether you will use independent (a separate tag for department and project) or dependent tags (the project tags populate different options based on the department selected) and whether you will capture general ledger (GL) codes. 

Then use one of the following templates to build your tags list:
   - [Dependent tags with GL codes]({{site.url}}/assets/Files/Dependent+with+GL+codes+format.csv)
   - [Dependent tags without GL codes]({{site.url}}/assets/Files/Dependent+without+GL+codes+format.csv)
   - [Independent tags with GL codes]({{site.url}}/assets/Files/Independent+with+GL+codes+format.csv)
   - [Independent tags without GL codes]({{site.url}}/assets/Files/Independent+without+GL+codes+format.csv)

{% include info.html %}
If you have more than 50,000 tags, divide them into two separate files.
{% include end-info.html %}

To import multi-level tags:
1. Hover over Settings, then click **Workspaces**.
2. Click the **Group** tab on the left.
3. Click the desired workspace name.
4. Click the **Tags** tab on the left.
5. Enable the “Use multiple levels of tags” option.
6. Click **Import from Spreadsheet**.
7. Select the applicable checkboxes and click **Upload Tags**.  

{% include info.html %}
Each time you upload a list of tags, it will override your previous list. To avoid losing tags, update your current spreadsheet and re-import it into Expensify.
{% include end-info.html %} 

# FAQ

## Why can’t I see a "Do you want to use multiple level tags" option on my workspace?

If you are connected to an accounting integration, you will not see this feature. You will need to add those tags in your integration first, then sync the connection.
 
</div>
