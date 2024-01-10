---
title: How to use the ADP integration
description: Expensify’s ADP integration lets you pay out expense reports outside of the Expensify platform. Expensify creates a Custom Export Format that can be uploaded to ADP directly. 
---
# Overview
Expensify’s ADP integration lets you pay out expense reports outside of the Expensify platform. Expensify creates a Custom Export Format that can be uploaded to ADP directly. 

You’ll need to be on the Control Plan to create a Custom Export Format.

Your employee list in ADP can also be imported into Expensify via Expensify’s People table in CSV format, which will speed up the process of importing the correct values to sync up your employee’s reports with ADP. This feature is available on all plans. 

# How to use the ADP integration

## Step 1: Set up the ADP import file

A basic setup for an ADP import file includes five columns. In order (from left to right), these columns are: 

- **Company Code** - See “Edit Company” page in ADP
- **Batch ID** - Found in “Edit Company”
- **File #** - Employee number in ADP
- **Earnings 3 Code** - See “Edit Profit Center Group” page
- **Earnings 3 Amount** - Found in “Edit Profit Center Group”

There is a **File #** for each employee that you’re tracking in **Expensify** located under “**RUN Powered by ADP**” - navigate to **Reports tab > Tax Reports > Wage > Tax Register**.

In **Expensify**, the **File #** is entered in the **Custom Field 1 or 2** column in the **Members table**. 
The **Earnings 3 Code** is the ADP code that corresponds to a payroll account you’re tracking in **Expensify**. The **Earnings 3 Amount** is the total of a given expense you’re sending to payroll.

In **Expensify**, you can enter the **Earnings 3 Code** at **Settings > Workspaces > [Group Workspace Name] > Categories > Categories [Category Name] > Edit Rules > Add under Payroll Code**.

## Step 2:Create your ADP Export Format

For a basic setup, visit **Settings > Workspaces > [Group Workspace Name] > Export Formats** and add these column headings and corresponding formulas: 

- **Name:** Company Code
  - **Formula:** [From Step 1.]
  
- **Name:** BatchID
  - **Formula:** [From Step 1.]
  
- **Name:** File #
  - **Formula:** {report:submit.from:customfield1}
  
- **Name:** Earnings 3 Code
  - **Formula:** {expense:category:payrollcode}
  
- **Name:** Earnings 3 Amount
  - **Formula:** {expense:amount}

The Company Code column is hardcoded with your company’s code in ADP. Similarly, the Batch ID is hard coded with whatever Batch ID your company is using in ADP.

## Step 3.:Export to CSV or XLS

To export the file, do the following:

1. Go to your "Reports" page in Expensify
2. Select the reports you want to export
3. Click "Export to..." and choose your custom ADP format
4. Your download will begin automatically and be delivered in CSV or XLS format

## Step 4: Upload to ADP

You should be able to upload your ADP file directly to ADP without any changes.

# Deep Dive

## Using the ADP integration

You can set Custom Fields and Payroll Codes in bulk using a CSV upload in Expensify’s settings pages. 

If you have additional requirements for your ADP upload, for example, additional headings or datasets, reach out to your Expensify Account Manager who will assist you in customizing your ADP export. Expensify Account Managers are trained to accommodate your data requests and help you retrieve them from the system.

{% include faq-begin.md %} 

- Do I need to convert my employee list into new column headings so I can upload it to Expensify?

Yes, you’ll need to convert your ADP employee data to the same headings as the spreadsheet that can be downloaded from the Members table in Expensify. 

- Can I add special fields/items to my ADP Payroll Custom Export Format?

Yes! You can ask your Expensify Account Manager to help you prepare your ADP Payroll export so that it meets your specific requirements. Just reach out to them via the Chat option in Expensify and they’ll help you get set up.

{% include faq-end.md %}
