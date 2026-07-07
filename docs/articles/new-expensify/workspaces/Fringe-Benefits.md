---
title: Fringe Benefits
description: How to track your Fringe Benefits
internalScope: Audience is Workspace Admins and Workspace Members. Covers setting up Fringe Benefits Tax tracking, submitting FBT expenses, and exporting FBT data. Does not cover general tag setup, non-FBT payroll codes, or non-FBT CSV reporting.
keywords: [New Expensify, fringe benefits tax, FBT, track fringe benefits, attendee count, workspace tags, CSV export fringe benefits, fringe benefits reporting, payroll code]
---

# How to track Fringe Benefits Tax

If you need to track and report expense data for **Fringe Benefits Tax (FBT)**, Expensify offers a workflow to capture the required information and export it to a spreadsheet.  

---  

## How to set up Fringe Benefits Tax tracking

This section covers the **one-time Workspace Admin setup** required to enable Fringe Benefits Tax tracking.

## Add attendee count tags for Fringe Benefits Tax

To start tracking FBT, add the following tags to your **Workspace**:  
- **Number of Internal Attendees**  
- **Number of External Attendees**  

These tags **must be named exactly** as written above, without extra spaces.  

## How to create attendee count tags for Fringe Benefits Tax

1. Navigate to **Workspaces > [Workspace Name] > Tags**.  
2. Create tags with numeric values (for example, **01, 02, 03**) up to your expected maximum number of attendees.
3. These tags can be used alongside existing accounting tags.
   
For more detailed guidance, see [Configure Tags on a Workspace](https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-tags).

## How to add the Fringe Benefits Tax payroll code

1. Navigate to **Workspaces > [Workspace Name] > Categories**.  
2. Select the category you want to track for Fringe Benefits Tax.
3. Add the payroll code **TAG**.

For more detailed guidance, see [Create expense tags](https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-tags).

---

## How to enable the Fringe Benefits Tax workflow

After adding the attendee count tags and payroll code, email **concierge@expensify.com** with the following request:

> **Subject:** Enable Fringe Benefits Tax Workflow  
> **Message:** Can you please add the custom workflow/DEW named **FRINGE_BENEFIT_TAX** to my company workspace named **[Workspace Name]**?

Once enabled, expenses coded with **TAG** will require attendee count tags before they can be submitted.

---  

## How Workspace Members submit Fringe Benefits Tax expenses

This section applies to **Workspace Members submitting expenses** under Fringe Benefits Tax categories.

- When submitting expenses under **FBT-tracked categories**, both internal and external attendee counts are **required**.
- If attendee counts are missing, the expense **cannot be submitted**.  

---  

## How Workspace Admins export Fringe Benefits Tax data

This section applies to **Workspace Admins reporting and exporting** Fringe Benefits Tax data. 

## How to export Fringe Benefits Tax data using CSV

Before exporting, you must create a custom CSV template and add the formulas needed to capture attendee counts.

**Note:** Creating custom CSV templates is currently only available in Expensify Classic. This limitation applies only to template setup, not to exporting reports.

Add the following formulas to your CSV template:
- `{expense:tag:ntag-3}` → **Internal Attendees**
- `{expense:tag:ntag-4}` → **External Attendees**

For instructions on creating a custom CSV template, see [Create a custom export template](https://help.expensify.com/articles/expensify-classic/spending-insights/Export-Expenses-And-Reports#create-a-custom-export-template).

Once your template is set up, export expenses using the custom CSV template to capture Fringe Benefit Tax data. 

For more detailed guidance on exporting expenses, see [Download via CSV](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Search-and-Download-Expenses#export-as-csv).

## Example of Fringe Benefits Tax expense coding levels

If your Workspace uses multiple coding levels, a Fringe Benefits Tax report may include:

- **GL Code** (Category)  
- **Department** (Tag 1)  
- **Location** (Tag 2)  
- **Number of Internal Attendees** (Tag 3)  
- **Number of External Attendees** (Tag 4)  

For more details on exporting data, see [Search and download expenses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Search-and-Download-Expenses#export-as-csv).

