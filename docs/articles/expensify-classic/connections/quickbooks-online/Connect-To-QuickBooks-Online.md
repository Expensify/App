---
title: QuickBooks Online
description: Everything you need to know about using Expensify's direct integration with QuickBooks Online.
order: 1
---
# Connect to QuickBooks Online

The Expensify integration with QuickBooks Online brings in your expense accounts and other data and even exports reports directly to QuickBooks for easy reconciliation. Plus, with advanced features in QuickBooks Online, you can fine-tune coding settings in Expensify for automated data export to optimize your accounting workflow.

## Before connecting

It’s crucial to understand the requirements based on your specific QuickBooks subscription:
- While all the features are available in Expensify, their accessibility may vary depending on your QuickBooks Online subscription.
- An error will occur if you try to export to QuickBooks Online with a feature enabled that isn’t part of your subscription.
- Please be aware that Expensify does not support the Self-Employed subscription in QuickBooks Online.

![QuickBooks Online - Subscription types]({{site.url}}/assets/images/QBO1.png){:width="100%"}

# Step 1: Setup Employees in QuickBooks Online
Employees must be set up as either Vendors or Employees in QuickBooks Online. Make sure to include the submitter’s email in their record.

If you use vendor records, you can export as Vendor Bills, Checks, or Journal Entries. If you use employee records, you can export as Checks or Journal Entries (if exporting against a liability account).

**Additional Options for Streamlined Setup:**
1. Automatic Vendor Creation: Enable “Automatically Create Entities” in your connection settings to automatically generate Vendor or Employee records upon export for submitters that don’t already exist in QBO.
2. Employee Setup Considerations: If setting up submitters as Employees, ensure you activate QuickBooks Online Payroll. This will grant access to the Employee Profile tab to input employee email addresses.

# Step 2: Connect Expensify and QuickBooks Online
1. Click Settings near the bottom of the left-hand menu.
2. Navigate to Workspaces > Groups > [workspace Name] > Connections.
3. Click on **Connect to QuickBooks Online**.
4. Click the **Create a New QuickBooks Online Connection** button.
5. Enter your QuickBooks Online Administrator’s login information and choose the QuickBooks Online Company File you want to connect to Expensify (you can connect one Company File per Workspace). Then click **Authorize**.
6. Enter your QuickBooks Online Administrator’s login information and choose the QuickBooks Online Company File you want to connect to Expensify (you can connect one Company File per Workspace):
7. You will be redirected back to Expensify and the connection will import some initial settings from QuickBooks Online to Expensify.
8. Once the sync is complete, the configuration window for QuickBooks Online will open automatically so you can configure your export, import, and advanced settings. 
9. Click the **Save** button when you’re done configuring to finalize the connection.

## Step 2B: Exporting Historical Reports to QuickBooks Online

After connecting QuickBooks Online to Expensify, you may receive a prompt to export all historical reports from Expensify. To export multiple reports at once, follow these steps:

1. Go to the Reports page on the web.
2. Check the box to the left of the reports you want to export.
3. Click **Export To** and select **QuickBooks Online**.
    - If you don’t want to export specific reports, select “Mark as manually entered” instead.

