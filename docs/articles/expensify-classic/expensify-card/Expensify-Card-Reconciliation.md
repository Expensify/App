---
title: Expensify Card reconciliation
description: Reconcile expenses from Expensify Cards
---

<div id="expensify-classic" markdown="1">

To handle unapproved Expensify Card expenses that are left after you close your books for the month, you can set up auto-reconciliation with an accounting integration, or you can manually reconcile the expenses.

# Set up automatic reconciliation

Auto-reconciliation automatically deducts Expensify Card purchases from your company’s settlement account on a daily or monthly basis.

{% include info.html %}
You must link a business bank account as your settlement account before you can complete this process.
{% include end-info.html %}

1. Hover over Settings, then click **Domains**.
2. Click the desired domain name. 
3. On the Company Cards tab, click the dropdown under the Imported Cards section to select the desired Expensify Card.
4. To the right of the dropdown, click the **Settings** tab.
5. Click the Expensify Card settlement account dropdown and select your settlement business bank account. 
   - To verify which account is your settlement account: Hover over Settings, then click **Account**. Click the **Payments** tab on the left and verify the bank account listed as the Settlement Account. If these accounts do not match, repeat the steps above to select the correct bank account.
6. Click **Save**.

If your workspace is connected to a QuickBooks Online, Xero, NetSuite, or Sage Intacct integration, complete the following additional steps.

1. Click the Expensify Card Reconciliation Account dropdown and select the GL account from your integration for your Settlement Account. Then click **Save**.
2. (Optional) If using the Sage Intacct integration, select your cash-only and accrual-only journals. If your organization operates on a cash-only or accrual-only basis, choose **No Selection** for the journals that do not apply.
3. Click the **Advanced** tab and ensure Auto-Sync is enabled. Then click **Save**
4. Hover over **Settings**, then click **Workspaces**. 
5. Open the workspace linked to the integration. 
6. Click the **Connections** tab.
7. Next to the desired integration, click **Configure**. 
8. Under the Export tab, ensure that the Preferred Exporter is also a Workspace Admin and has an email address associated with your Expensify Cards' domain. For example, if your domain is company.com, the Preferred Exporter's email should be name@company.com.

# Manually reconcile expenses 

To manually reconcile Expensify Card expenses, 

1. Hover over Settings, then click **Domains**.
2. Click the desired domain name. 
3. On the Company Cards tab, click the dropdown under the Imported Cards section to select the desired Expensify Card.
4. To the right of the dropdown, click the **Reconciliation** tab.
5. For the Reconcile toggle, ensure Expenses is selected. 
6. Select the start and end dates, then click **Run**. 
7. Use the Imported, Approved, and Unapproved totals to manually reconcile your clearing account in your accounting system. 
   - The Unapproved total should match the final clearing account balance. Depending on your accounting policies, you can use this balance to book an accrual entry by debiting the appropriate expense and crediting the offsetting clearing account in your accounting system.

## Troubleshooting

Use the steps below to do additional research if:
- The amounts vary to a degree that needs further investigation.
- The Reconciliation tab was not run when the accounts payable (AP) was closed.
- Multiple subsidiaries within the accounting system closed on different dates.
- There are foreign currency implications in the accounting system.

To do a more in-depth reconciliation, 

1. In your accounting system, lock your AP.

{% include info.html %}
It’s best to do this step at the beginning or end of the day. Otherwise, expenses with the same export date may be posted in different accounting periods.
{% include end-info.html %}

2. In Expensify, click the **Reports** tab.
3. Set the From date filter to the first day of the month or the date of the first applicable Expensify Card expense, and set the To date filter to today’s date. 
4. Set the other filters to show **All**.
5. Select all of the expense reports by clicking the checkbox to the top left of the list. If you have more than 50 expense reports, click **Select All**. 
6. In the top right corner of the page, click **Export To** and select **All Data - Expense Level Export**. This will generate and send a CSV report to your email. 
7. Click the link from the email to automatically download a copy of the report to your computer. 
8. Open the report and apply the following filters (or create a pivot with these filters) depending on whether you want to view the daily or monthly settlements:
   - Daily settlements: 
      - Date = the month you are reconciling
      - Bank = Expensify Card
      - Posted Date = the month you are reconciling
      - [Accounting system] Export Non Reimb = blank/after your AP lock date 
   - Monthly settlements:
      - Date = the month you are reconciling
      - Bank = Expensify Card
      - Posted Date = The first date after your last settlement until the end of the month
      - [Accounting system] Export Non Reimb = the current month and new month until your AP lock date
         - To determine your total Expensify Card liability at the end of the month, set this filter to blank/after your AP lock date.

This filtered list should now only include Expensify Card expenses that have a settlement/card payment entry in your accounting system but don’t have a corresponding expense entry (because they have not yet been approved in Expensify). The sum is shown at the bottom of the sheet.

The sum of the expenses should equal the balance in your Expensify Clearing or Liability Account in your accounting system. 

# Tips

- Enable [Scheduled Submit](https://help.expensify.com/articles/expensify-classic/workspaces/reports/Scheduled-Submit) to ensure that expenses are submitted regularly and on time.
- Expenses that remain unapproved for several months can complicate the reconciliation process. If you're an admin in Expensify, you can communicate with all employees who have an active Expensify account by going to [new.expensify.com](http://new.expensify.com) and using the #announce room to send a message. This way, you can remind employees to ensure their expenses are submitted and approved before the end of each month.
- Keep in mind that although Expensify Card settlements/card payments will post to your general ledger on the date it is recorded in Expensify, the payment may not be withdrawn from your bank account until the following business day.
- Based on your internal policies, you may want to accrue for the Expensify Cards.

{% include faq-begin.md %}

**Why is the amount in my Expensify report so different from the amount in my accounting system?**

If the Expensify report shows an amount that is significantly different to your accounting system, there are a few ways to identify the issues:
- Double check that the expenses posted to the GL are within the correct month. Filter out these expenses to see if they now match those in the CSV report.
- Use the process outlined above to export a report of all the transactions from your Clearing (for Daily Settlement) or Liability (for monthly settlement) account, then create a pivot table to group the transactions into expenses and settlements. 
   - Run the settlements report in the “settlements” view of the Reconciliation Dashboard to confirm that the numbers match.
   - Compare “Approved” activity to your posted activity within your accounting system to confirm the numbers match. 

{% include faq-end.md %}

</div>
