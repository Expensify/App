---
title: Configure Company Card Settings
description: How to customize your company card settings
---

Once you’ve imported your company cards via [commercial card feed](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Commercial-Card-Feeds), [direct bank feed](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Direct-Bank-Connections), or [CSV import](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/CSV-Import), the next step is to configure the card settings. 

{% include info.html %}
You must be a Domain Admin to complete this process.
{% include end-info.html %}

# Configure company card settings

1. Hover over **Settings** and click **Domains**.
2. Select the desired domain.
3. Click the **Settings** tab located at the top of the Company Cards tab.
![Near the top right, click the Settings tab that is located between the Card List and Reconciliation tabs.](https://help.expensify.com/assets/images/compcard-01.png){:width="100%"} 
5. Set the following preferences, then click **Save**.

## Preferred Workspace

Setting a preferred Workspace for a company card feed ensures that the imported transactions are added to a report for that Workspace. This is useful when members are on multiple Workspaces and need to ensure their company card expenses are reported to a particular Workspace.

## Reimbursable preference

You can control how your employees' company card expenses are flagged for reimbursement:

- **Force Yes**: All expenses will be marked as reimbursable. Employees cannot change this setting.
- **Force No**: All expenses will be marked as non-reimbursable. Employees cannot change this setting.
- **Do Not Force**: Expenses will default to either reimbursable or non-reimbursable (your choice), but employees can adjust if necessary.

## Liability type

Choose the liability type that suits your needs:

- **Corporate Liability**: Users cannot delete company card expenses.
- **Personal Liability**: Users are allowed to delete company card expenses.

If you update the settings on an existing company card feed, the changes will apply to expenses imported after the date that the setting is saved. The update will not affect previously imported expenses.

# Use Scheduled Submit with company cards

With Scheduled Submit, employees no longer have to create their expenses, add them to a report, and submit them manually. All they need to do is SmartScan their receipts and Concierge will take care of the rest using a variety of schedules that you can set according to your preferences.

{% include info.html %}
Concierge won't automatically submit expenses on reports that have expense violations. These expenses will be moved to a new report for the current reporting period.
{% include end-info.html %}

To enable Scheduled Submit,

1. Hover over **Settings** and click **Workspaces**.
2. Select the desired Workspace.
3. Click the **Reports** tab on the left.
4. Enable the Scheduled Submit toggle.
5. Select the report submission frequency.
6. Select the date that reports will be submitted.  

# Connect company cards to an accounting integration

If you're using a connected accounting system such as NetSuite, Xero, Intacct, Quickbooks Desktop, or QuickBooks Online, you can also connect the card to export to a specific credit card GL account. First, connect the card itself, and once completed, follow the steps below:

1. Hover over **Settings** and click **Domains**
2. Select the desired domain.
3. Click **Edit Exports** near the top right and select the general ledger (GL) account you want to export expenses to.
![Find the desired card in the table. In that same row, click Edit Exports.](https://help.expensify.com/assets/images/cardfeeds-02.png){:width="100%"} 

Once the account is set, exported expenses will be mapped to the selected account when exported by a Domain Admin.

# Export company card expenses to a connected accounting integration

## Pooled GL account 

To export credit card expenses to a pooled GL account,

1. Hover over **Settings** and click **Workspaces**.
2. Select the desired Workspace.
3. Click the **Connections** tab on the left.
4. Under Accounting Integrations, click **Configure** next to the desired accounting integration.
5. For Non-reimbursable export, select **Credit Card / Charge Card / Bank Transaction**.
6. Review the Export Settings page for exporting Expense Reports to NetSuite.
7. Select the Vendor/liability account you want to export all non-reimbursable expenses to.

## Individual GL account 

1. Hover over **Settings** and click **Domains**.
2. Select the desired Domain.
3. Click the **Edit Exports** to the right of the desired card. Then select the general ledger (GL) account you want to export expenses to.
![Find the desired card in the table. In that same row, click Edit Exports.](https://help.expensify.com/assets/images/cardfeeds-02.png){:width="100%"} 

Once the account is set, exported expenses will be mapped to the selected account.

# Identify company card transactions

When you link your credit cards to Expensify, the transactions will appear in each user's account on the Expenses page as soon as they're posted. Transactions from centrally managed cards have a locked card icon next to them to indicate that they’re company card expenses.

# Import historical transactions 

Once a card is connected via direct connection or via Approved! banks, Expensify will import 30-90 days of historical transactions to your account (based on your bank's discretion). Any historical expenses beyond that date range can be imported using the [CSV import](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/CSV-Import). 

# Use eReceipts 

Expensify eReceipts are digital substitutes for paper receipts, eliminating the need to keep physical receipts or use SmartScan for receipts. For Expensify Card transactions, eReceipts are automatically generated for all amounts in these categories: Airlines, Commuter expenses, Gas, Groceries, Mail, Meals, Car rental, Taxis, and Utilities. For other card programs, eReceipts are generated for USD purchases of $75 or less.

{% include info.html %}
To ensure seamless automatic importation, it is key that you maintain your transactions in US Dollars. eReceipts can also be directly imported from your bank account. CSV/OFX imported files of bank transactions do not support eReceipts. eReceipts are not generated for lodging expenses. Due to incomplete or inaccurate category information from certain banks, there may be instances of invalid eReceipts being generated for hotel purchases. If you choose to re-categorize expenses, a similar situation may arise. It's crucial to remember that our Expensify eReceipt Guarantee excludes coverage for hotel and motel expenses.
{% include end-info.html %}

{% include faq-begin.md %}

**What plan/subscription is required in order to manage corporate cards?**

A Group Workspace is required. 

**When do my company card transactions import to Expensify?**

Credit card transactions are imported to Expensify once they’re posted to the bank account. This usually takes 1-3 business days between the point of purchase and when the transactions populate in your account.

**Scheduled Submit is disabled. Why are reports still being submitted automatically?**

If Scheduled Submit is disabled at the Group Workspace level or set to a manual frequency but expense reports are still being automatically submitted, Scheduled Submit is most likely enabled on the user’s Individual Workspace settings. 

{% include faq-end.md %}
