---
title: Expensify Card Reconciliation
description: Learn how to reconcile expenses from Expensify Cards through Continuous Reconciliation or manual methods.
keywords: [Expensify Classic, Expensify Card reconciliation]
---
<div id="expensify-classic" markdown="1">

To manage unapproved Expensify Card expenses after closing your books for the month, you can set up **Continuous Reconciliation** with an accounting integration or **manually reconcile** the expenses. 

---
# How Continuous Reconciliation works

Continuous Reconciliation automates the accounting process for Expensify Card activity by syncing settled amounts and exported expenses through your connected accounting software.

## What gets reconciled

When using the Expensify Card, reconciliation involves two components:

- **Settlement:** The full balance spent on the Expensify Card is deducted from your linked checking account either daily or monthly. This figure includes posted and pending charges, which may be adjusted later due to merchant changes.
  
- **Expenses:** Each transaction becomes an expense that may be submitted, approved, and exported days or even weeks after the card is settled. A single settlement may cover expenses exported across multiple accounting periods.

## How daily Continuous Reconciliation works

When daily settlement is enabled:

1. The total settlement amount is pulled from your checking account and posted to a **clearing account**.
2. When an expense is exported, the expense amount moves from the clearing account to a **liability account**.
3. At the same time, the expense amount is moved from the liability account to the appropriate **expense account**.

This ensures expenses can be tracked and matched even if their approval/export happens later.

## How monthly Continuous Reconciliation works

When monthly settlement is enabled:

- The full amount is moved **directly** from your checking account to a **liability account**.
- The **clearing account step is skipped** in this workflow.

This streamlines accounting while preserving accurate tracking for exported expenses.

**Note:** The Continuous Reconciliation flow depends on your connected accounting integration and whether you’ve enabled daily or monthly settlement. The Clearing and Liability accounts will be created when the routine runs for the first time - please don't manually create or rename the accounts.

---

# Set Up Continuous Reconciliation

_**Note: A business bank account must be linked as your settlement account to complete this process.**_

## Steps to set up Continuous Reconciliation:
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

## What if Continuous Reconciliation is disabled for Expensify Cards?

A Domain Admin can set export accounts for individual cards via:
**Settings > Domains > [Domain Name] > Company Cards > Edit Exports**.

## How can I use Expensify's Continuous Reconciliation with Sage Intacct Smart Rules, and why are there issues?

Due to the highly customizable nature of Sage Intacct Smart Rules, Continuous Reconciliation may encounter conflicts, especially when Expensify attempts to create vendor accounts during the reconciliation process. To resolve this, you can temporarily disable all Smart Rules in Sage Intacct, allow Expensify to create the necessary vendor accounts, and then re-enable the Smart Rules. However, if some Smart Rules are implemented via a Sage Intacct Package and cannot be easily disabled, you may need to manually adjust the rules after account creation. This process might need to be repeated if new employees submit reports in the future. Expensify creates vendor accounts to associate reports with the email addresses that submitted them, and the "vendor" field is included in the journal entries posted via Continuous Reconciliation.

</div>
