---
title: Expensify Card reconciliation
description: Learn how to reconcile expenses from Expensify Cards through auto-reconciliation or manual methods.
---

To manage unapproved Expensify Card expenses after closing your books for the month, you can set up **auto-reconciliation** with an accounting integration or **manually reconcile** the expenses. 

---
# Set Up Automatic Reconciliation

Auto-reconciliation deducts Expensify Card purchases from your company's settlement account on a daily or monthly basis.

_**Note: A business bank account must be linked as your settlement account to complete this process.**_

## Steps to set up auto-reconciliation:
1. Go to **Settings > Domains**.
2. Click your desired domain name.
3. Under the **Company Cards** tab, find the **Imported Cards** section and select the desired Expensify Card from the dropdown.
4. To the right of the dropdown, click **Settings**.
5. Use the **Settlement Account** dropdown to select your settlement business bank account.
   - To verify your settlement account, go to **Settings > Account > Payments** and check the listed settlement account.
   - If the accounts do not match, repeat the steps above to update the account.
6. Click **Save**.

If your workspace is integrated with QuickBooks Online, Xero, NetSuite, or Sage Intacct, complete these additional steps:

1. From the **Reconciliation Account** dropdown, select the GL account associated with your settlement account and click **Save**.
2. *(Optional)* For Sage Intacct users:
   - Specify cash-only or accrual-only journals.
   - Choose **No Selection** for journals that do not apply.
3. Navigate to the **Advanced** tab and enable **Auto-Sync**. Click **Save**.
4. Go to **Settings > Workspaces**.
5. Open the workspace linked to the integration.
6. Click the **Connections** tab.
7. Next to the desired integration, click **Configure**.
8. Under the **Export** tab:
   - Ensure the **Preferred Exporter** is a Workspace Admin.
   - Verify their email matches the domain of the Expensify Cards (e.g., name@company.com).

---
# Manually Reconcile Expenses

Follow these steps to reconcile Expensify Card expenses manually:

1. Navigate to **Settings > Domains**.
2. Click your desired domain name.
3. Under the **Company Cards** tab, select the desired Expensify Card from the **Imported Cards** dropdown.
4. Click the **Reconciliation** tab on the right.
5. Ensure the **Expenses** toggle is selected for reconciliation.
6. Set the start and end dates, then click **Run**.
7. Use the **Imported**, **Approved**, and **Unapproved** totals to reconcile your clearing account in your accounting system:
   - The **Unapproved** total should match the clearing account balance.
   - Depending on your policies, book an accrual entry by debiting the appropriate expense and crediting the clearing account.

---
# Troubleshooting Reconciliation Issues

## When to Troubleshoot:
- Amounts vary significantly.
- Reconciliation was not run when accounts payable (AP) closed.
- Multiple subsidiaries closed on different dates.
- Foreign currency complications arise.

## Steps for In-Depth Reconciliation:

1. Lock your AP in your accounting system.
   > **Tip**: Perform this step at the beginning or end of the day to avoid overlapping entries.
2. In Expensify, go to the **Reports** tab.
3. Filter by date:
   - **From**: First day of the month (or date of the first applicable expense).
   - **To**: Today's date.
4. Set other filters to **All**.
5. Select all expense reports by checking the top-left checkbox. For more than 50 reports, click **Select All**.
6. Click **Export To > All Data - Expense Level Export**. This sends a CSV report to your email.
7. Open the report and apply filters (or create a pivot table):
   - **Daily Settlements**:
      - Filter by Date = Month being reconciled.
      - Bank = Expensify Card.
      - Posted Date = Month being reconciled.
      - Export Non-Reimb = Blank or after AP lock date.
   - **Monthly Settlements**:
      - Filter by Date = Month being reconciled.
      - Bank = Expensify Card.
      - Posted Date = First date after last settlement until month-end.
      - Export Non-Reimb = Current and new month until AP lock date.

The filtered list will show expenses with settlement entries but no corresponding approved entries in Expensify. The total at the bottom should equal the balance in your Clearing or Liability Account.

---
# Tips for Efficient Reconciliation

- Enable [Scheduled Submit](https://help.expensify.com/articles/expensify-classic/workspaces/reports/Scheduled-Submit) to ensure timely expense submissions.
- Communicate with employees about unapproved expenses via the #announce room on [new.expensify.com](http://new.expensify.com).
- Be aware that Expensify Card payments are posted to your general ledger immediately but may not be withdrawn from your bank until the next business day.
- Consider accruing for Expensify Cards based on your internal policies.

---
# FAQ

## Why is the Expensify report amount different from my accounting system?

- Verify that expenses were posted to the correct GL month.
- Export all transactions from your Clearing (Daily Settlement) or Liability (Monthly Settlement) account and group them into expenses and settlements via pivot tables:
   - Run the settlements report in the Reconciliation Dashboard.
   - Compare **Approved** activity to posted activity in your accounting system.

## What if Auto-Reconciliation is disabled for Expensify Cards?

A Domain Admin can set export accounts for individual cards via:
**Settings > Domains > [Domain Name] > Company Cards > Edit Exports**.
