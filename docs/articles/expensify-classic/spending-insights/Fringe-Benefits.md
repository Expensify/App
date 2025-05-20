---
title: Fringe Benefits
description: How to track your Fringe Benefits
keywords: [Expensify Classic, fringe benefits, payroll code]
---

<div id="expensify-classic" markdown="1">

If you need to track and report expense data for **Fringe Benefits Tax (FBT)**, Expensify offers a workflow to capture the required information and export it to a spreadsheet.  

---  

# Set Up Fringe Benefits Tax  

## Add Attendee Count Tags  
To start tracking FBT, add the following tags to your **Workspace**:  
- **Number of Internal Attendees**  
- **Number of External Attendees**  

These tags **must be named exactly** as written above, without extra spaces.  

## Setting up Tags:  
1. Go to **Settings > Workspaces > Group > [Workspace Name] > Tags**.  
2. Create tags with numeric values (e.g., **"01", "02", "03"**) up to your expected maximum number of attendees.  
3. These tags can be used alongside existing accounting solution tags.  
4. Follow [these instructions](https://help.expensify.com/articles/expensify-classic/workspaces/Tags) to add tags.  

## Add Payroll Code  
1. Navigate to **Settings > Workspaces > Group > [Workspace Name] > Categories**.  
2. Select **Edit Category** for the relevant expense categories.  
3. Add the payroll code **“TAG”**.  

## Enable the FBT Workflow  
Once you've added the attendee count tags and payroll code, email **concierge@expensify.com** with this request:  

> **Subject:** Enable Fringe Benefits Tax Workflow  
> **Message:** Can you please add the custom workflow/DEW named **FRINGE_BENEFIT_TAX** to my company workspace named **Your Company Workspace Name**?  

Once enabled, expenses coded with **“TAG”** will require the attendee count tags before they can be submitted.  

---  

# For Workspace Members  

- When submitting expenses under **FBT-tracked categories**, users **must** include internal and external attendee counts.  
- If these fields are missing, the expense **cannot be submitted**.  

---  

# For Workspace Admins  

## Running Reports  
You can generate reports that include FBT-tracked expenses and attendee counts.  

To extract the data:  
1. Use a **Custom CSV Export** to format your report.  
2. Apply these formulas to reference attendee counts:  
   - `{expense:tag:ntag-3}` → **Internal Attendees**  
   - `{expense:tag:ntag-4}` → **External Attendees**  

## Example: Expense Coding Levels  
If your expenses have multiple coding levels, your report might include:  
- **GL Code** (Category)  
- **Department** (Tag 1)  
- **Location** (Tag 2)  
- **Number of Internal Attendees** (Tag 3)  
- **Number of External Attendees** (Tag 4)  

For more details, visit our [Custom Templates guide](https://help.expensify.com/articles/expensify-classic/insights-and-custom-reporting/Custom-Templates).  

</div>
