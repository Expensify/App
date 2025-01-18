---
title: Reconcile Company Card Expenses
description: How to reconcile company card transactions
---

If your company imports corporate card transactions into Expensify, you can reconcile them by using the Reconciliation dashboard. 

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain.
3. Click the **Reconciliation** tab near the top of the page.
4. Enter the statement dates and click **Run**.    

# Confirm statement total  

To confirm the total of transactions imported into Expensify against a credit card statement: 
1. Review the **Imported Total**, which shows the sum of all expenses imported into Expensify for that statement period. This should match the total on your credit card statement. 
2. If there is a discrepancy, refresh the feed to import missing expenses. Click **Update all cards** for commercial card feeds, or update individual cards by clicking the blue cog icon and choosing **Update** for other feed types.
3. After updating, click **Run** to update the transaction totals.

# Confirm card totals  

If there is a discrepancy between the totals on the credit card statement and the Reconciliation dashboard, then review each card’s total to find the source of the missing transactions.   

1. Sort the cards by clicking the heading for **Card Name/Number**, **Assignee** or **Total** and compare each card's total to the statement to determine which card(s) don't match the statement total.
2. Click on the **Total** amount for a card to view the imported expenses and identify any that are missing from the statement. Confirm that all cards have been assigned to cardholders, as this could be another reason that the Imported Total doesn't match the statement.
3. If there is still a discrepancy after updating and re-calculating the totals, contact concierge@expensify.com and provide the details of the expenses that are showing on your statement but are missing in Expensify. To investigate, we’ll need the cardholder email, expense date, and amount. Keep in mind sorting by column heading also makes locating expenses easier.

# Identify outstanding unapproved expenses

Use the **Unapproved total** and **Approved Total** to identify expenses that have not yet been approved and/or exported.   

# View expenses

- Click the **Unapproved Total** heading to sort cards by those with outstanding expenses.
- Click the **Unapproved** amount for a card to view the expenses which are in the Unreported, Open, Processing, or Deleted states.

*Note: You must be both a Domain Admin and a Workspace Admin to access expenses.*

# Add unreported and/or deleted expenses to a report  

1. Change the filters so that only Unreported and/or Deleted expenses are showing.
2. Select all expenses, then click **Add to a Report,** then **Auto Report**.
3. If there is an open report in the cardholder's account, the expense(s) will be added to it. If not, a new report will be created with the expenses.

# Process reports  

- Workspace admins have the ability to code (categorize or tag an expense or add a receipt or comment to it) unsubmitted expenses, submit Open reports, and approve Processing reports. Any changes made by an admin are tracked under Report History and Comments at the bottom of each report.
- You can remind members to submit and approve reports via the Report History and Comments. An email notification will be sent to all members who have taken action on the report.

# Prepare accrual  

If there are still unapproved expenses when you want to close your books for the month, then you can use the feed’s Imported, Approved, and Unapproved totals to create an accrual entry.
- Match the Imported Total to the Statement amount.
- Match the Approved Total to the Company Card Liability account in your accounting system.
- The Unapproved Total becomes the Accrual amount (if the two amounts above are correct).

{% include faq-begin.md %}  

**Who can view and access the Reconciliation tab?**

Only Domain admins have access to the Reconciliation tool. 

**Who can view and process company card transactions?**

- Domain admins can view all company card transactions using the Reconciliation tool, even if they are unreported.
- Workspace admins can only view reported expenses on a workspace. So if a workspace admin does not have access to the domain, they will be unable to see any transaction that hasn’t been placed on a report. 

**What do I do if company card expenses are missing?**

If a cardholder reports expenses as missing, we first recommend using the Reconciliation tool to try and locate the expense. Select the date range the expense falls under, and once the report is available, select the specific card to view the data. If the expense is not listed, you will want to click **Update** next to the card under the Card List tab. This will pull in any missing expenses. 

If after updating, the expense still hasn’t appeared, you should reach out to Concierge with the missing expense specifics (merchant, date, amount and last four digits of the card number). Please note, only posted transactions will import. 

{% include faq-end.md %}
