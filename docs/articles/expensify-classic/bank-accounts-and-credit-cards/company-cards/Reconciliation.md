---
title: Company card reconciliation 
description: How to reconcile company card transactions
---
# Overview

If your company imports corporate card transactions into Expensify, you can reconcile them by using the Reconciliation dashboard under **Settings > Domains > Domain Name > Company Cards > Reconciliation**. To use the dashboard, simply enter the statement dates and click **Run**.    

# How to reconcile company cards  

## Confirm statement total  

To confirm the total of transactions imported into Expensify against a credit card statement: 
1. Review the **Imported Total**, which shows the sum of all expenses imported into Expensify for that statement period. This should match the total on your credit card statement. 
2. If there is a discrepancy, refresh the feed to import missing expenses. Click **Update all cards** for commercial card feeds, or update individual cards by clicking the blue cog icon and choosing **Update** for other feed types.
3. After updating, click **Run** to update the transaction totals.

## Confirm card totals  

If there is a discrepancy between the totals on the credit card statement and the Reconciliation dashboard, then review each card’s total to find the source of the missing transactions.   

1. Sort the cards by clicking the heading for **Card Name/Number**, **Assignee** or **Total** and compare each card's total to the statement to determine which card(s) don't match the statement total.
2. Click on the **Total** amount for a card to view the imported expenses and identify any that are missing from the statement. Confirm that all cards have been assigned to cardholders, as this could be another reason that the Imported Total doesn't match the statement.
3. If there is still a discrepancy after updating and re-calculating the totals, please contact concierge@expensify.com and provide the details of the expenses that are showing on your statement but are missing in Expensify. To investigate, we’ll need the cardholder email, expense date, and amount. Keep in mind sorting by column heading also makes locating expenses easier.

# Deep dive  

## Identifying outstanding unapproved expenses using the Reconciliation Dashboard
Use the **Unapproved total** and **Approved Total** on the Reconciliation Dashboard to identify expenses which have not yet been approved and/or exported:   

### View expenses 
- Click on the **Unapproved Total** heading to sort cards by those with outstanding expenses.
- Click the **Unapproved** amount for a card to view the expenses which are in the Unreported, Open, Processing, or Deleted states.

Note: You will need to be both a Domain Admin and a Workspace Admin to access expenses.

### Add unreported and/or deleted expenses to a report  

- Change the filters so that only Unreported and/or Deleted expenses are showing.
- Select all expenses, then click **Add to a Report > Auto Report**.
- If there is an open report in the cardholder's account, the expense(s) will be added to that. If not, a new report will be created with these expenses.
## Process reports  

- Workspace admins have the ability to code (categorize, tag, comment or add a receipt) unsubmitted expenses, submit Open reports, and approve Processing reports. Any changes made by an admin are tracked under Report History and Comments at the bottom of each report.
- You can remind members to submit and approve reports via the Report History and Comments. An email notification will be sent to all members who have taken action on that report.

## Prepare accrual  

If there are still unapproved expenses when you want to close your books for the month, then you can use the feed’s Imported, Approved, and Unapproved totals to create an accrual entry.
- Match Imported Total to Statement amount.
- Match Approved Total to Company Card Liability account in your accounting system.
- Unapproved Total becomes the Accrual amount (provided the first two amounts are correct).

# FAQ  

## Who can view and access the Reconciliation tab? 

Domain admins can access the Reconciliation tool under **Settings > Domains > Company Cards > Reconciliation**. 

## Who can view and process company card transactions?

Domain admins can view all company card transactions using the Reconciliation tool, even if they are unreported. Workspace admins can only view reported expenses on a workspace. So if a workspace admin does not have access to the domain, they will be unable to see any transaction that hasn’t been placed on a report. 

## What do I do if company card expenses are missing?

If a cardholder reports expenses as missing, we first recommend using the Reconciliation tool to try and locate the expense. Select the date range the expense falls under, and once the report is available, select the specific card to view the data. If the expense is not listed, you will want to click **Update** next to the card under the Card List tab. This will pull in any missing expenses. 

If after updating, the expense still hasn’t appeared, you should reach out to Concierge with the missing expense specifics (merchant, date, amount and last four digits of the card number). Please note, only posted transactions will import. 

