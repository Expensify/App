---
title: Fringe Benefits
description: How to track your Fringe Benefits
---
# Overview 
If you’re looking to track and report expense data to calculate Fringe Benefits Tax (FBT), you can use Expensify’s special workflow that allows you to capture extra information and use a template to export to a spreadsheet.

# How to set up Fringe Benefit Tax

## Add Attendee Count Tags 
First, you’ll need to add these two tags to your Workspace: 
1) Number of Internal Attendees
2) Number of External Attendees 

These tags must be named exactly as written above, ensuring there are no extra spaces at the beginning or at the end. You’ll need to set the tags to be  numbers 00 - 10 or whatever number you wish to go up to (up to the maximum number of attendees you would expect at any one time), one tag per number i.e. “01”, “02”, “03” etc. These tags can be added in addition to those that are pulled in from your accounting solution. Follow these [instructions](https://help.expensify.com/articles/expensify-classic/workspace-and-domain-settings/Tags) to add tags.

## Add Payroll Code
Go to **Settings > Workspaces > Group > _Workspace Name_ > Categories** and within the categories you wish to track FBT against, select **Edit Category** and add the code “TAG”:

## Enable Workflow
Once you’ve added both tags (Internal Attendees and External Attendees) and added the payroll code “TAG” to FBT categories, you can send a request to Expensify at concierge@expensify.com to enable the FBT workflow. Please send the following request:
>“Can you please add the custom workflow/DEW named FRINGE_BENEFIT_TAX to my company workspace named <insert your company workspace name> ?”
Once the FBT workflow is enabled, it will require anything with the code “TAG” to include the two attendee count tags in order to be submitted.


# For Users
Once these steps are completed, users who create expenses coded with any category that has the payroll code “TAG” (e.g. Entertainment Expenses) but don’t add the internal and external attendee counts, will not be able to submit their expenses.
# For Admins
You are now able to create and run a report, which shows all expenses under these categories and also shows the number of internal and external attendees. Because we don’t presume to know all of the data points you wish to capture, you’ll need to create a Custom CSV export. 
Here are a couple of examples of Excel formulas to use to report on attendees:
- `{expense:tag:ntag-1}` outputs the first tag the user chooses.
- `{expense:tag:ntag-3}` outputs the third tag the user chooses.

Your expenses may have multiple levels of coding, i.e.:
- GL Code (Category)
- Department (Tag 1)
- Location (Tag 2)
- Number of Internal Attendees (Tag 3)
- Number of External Attendees (Tag 4)

In the above case, you’ll want to use `{expense:tag:ntag-3}` and `{expense:tag:ntag-4}` as formulas to report on the number of internal and external attendees.

Our article on [Custom Templates](https://help.expensify.com/articles/expensify-classic/insights-and-custom-reporting/Custom-Templates) shows how to create a custom CSV. 
