---
title: Expensify Card Auto-Reconciliation
description: Everything you need to know about Expensify Card Auto-Reconciliation
---
<!-- The lines above are required by Jekyll to process the .md file -->

# Overview
If your company uses the Expensify Card, and connects to a direct accounting integration, you can auto-reconcile card spending each month.

The integrations that auto-reconciliation are available on are:

- QuickBooks Online
- Xero
- NetSuite
- Sage Intacct

# How-to Set Up Expensify Card Auto-Reconciliation

## Auto-Reconciliation Prerequisites

- Connection: 
1. A Preferred Workspace is set. 
2. A Reconciliation Account is set and matches the Expensify Card settlement account.
- Automation: 
1. Auto-Sync is enabled on the Preferred Workspace above.
2. Scheduled Submit is enabled on the Preferred Workspace above.
- User: 
1. A Domain Admin is set as the Preferred Workspace’s Preferred Exporter.

To set up your auto-reconciliation account with the Expensify Card, follow these steps:
1. Navigate to your Settings.
2. Choose "Domains," then select your specific domain name.
3. Click on "Company Cards."
4. From the dropdown menu, pick the Expensify Card.
5. Head to the "Settings" tab.
6. Select the account in your accounting solution that you want to use for reconciliation. Make sure this account matches the settlement business bank account.

![Company Card Settings section](https://help.expensify.com/assets/images/Auto-Reconciliaton_Image1.png){:width="100%"}

That's it! You've successfully set up your auto-reconciliation account.

## How does Auto-Reconciliation work
Once Auto-Reconciliation is enabled, there are a few things that happen. Let’s go over those! 

### Handling Purchases and Card Balance Payments
**What happens**: When an Expensify Card is used to make purchases, the amount spent is automatically deducted from your company’s 'Settlement Account' (your business checking account). This deduction happens on a daily or monthly basis, depending on your chosen settlement frequency. Don't worry; this settlement account is pre-defined when you apply for the Expensify Card, and you can't accidentally change it.
**Accounting treatment**: After your card balance is settled each day, we update your accounting system with a journal entry. This entry credits your bank account (referred to as the GL account) and debits the Expensify Card Clearing Account. To ensure accuracy, please make sure that the 'bank account' in your Expensify Card settings matches your real-life settlement account. You can easily verify this by navigating to **Settings > Account > Payments**, where you'll see 'Settlement Account' next to your business bank account. To keep track of settlement figures by date, use the Company Card Reconciliation Dashboard's Settlements tab:

![Company Card Reconciliation Dashboard](https://help.expensify.com/assets/images/Auto-Reconciliation_Image2.png){:width="100%"}

### Submitting, Approving, and Exporting Expenses
**What happens**: Users submit their expenses on a report, which might occur after some time has passed since the initial purchase. Once the report is approved, it's then exported to your accounting software.
**Accounting treatment**: When the report is exported, we create a journal entry in your accounting system. This entry credits the Clearing Account and debits the Liability Account for the purchase amount. The Liability Account functions as a bank account in your ledger, specifically for Expensify Card expenses.

# Deep Dive
## QuickBooks Online

### Initial Setup
1. Start by accessing your group workspace linked to QuickBooks Online. On the Export tab, make sure that the user chosen as the Preferred Exporter holds the role of a Workspace Admin and has an email address associated with your Expensify Cards' domain. For instance, if your domain is company.com, the Preferred Exporter's email should be email@company.com.
2. Head over to the Advanced tab and ensure that Auto-Sync is enabled.
3. Now, navigate to **Settings > Domains > *Domain Name* > Company Cards > Settings**. Use the dropdown menu next to "Preferred Workspace" to select the group workspace connected to QuickBooks Online and with Scheduled Submit enabled.
4. In the dropdown menu next to "Expensify Card reconciliation account," choose your existing QuickBooks Online bank account for reconciliation. This should be the same account you use for Expensify Card settlements.
5. In the dropdown menu next to "Expensify Card settlement account," select your business bank account used for settlements (found in Expensify under **Settings > Account > Payments**).

### How This Works
1. On the day of your first card settlement, we'll create the Expensify Card Liability account in your QuickBooks Online general ledger. If you've opted for Daily Settlement, we'll also create an Expensify Clearing Account.
2. During your QuickBooks Online auto-sync on that same day, if there are unsettled transactions, we'll generate a journal entry totaling all posted transactions since the last settlement. This entry will credit the selected bank account and debit the new Expensify Clearing Account (for Daily Settlement) or the Expensify Liability Account (for Monthly Settlement).
3. Once the transactions are posted and the expense report is approved in Expensify, the report will be exported to QuickBooks Online with each line as individual credit card expenses. For Daily Settlement, an additional journal entry will credit the Expensify Clearing Account and debit the Expensify Card Liability Account. For Monthly Settlement, the journal entry will credit the Liability account directly and debit the appropriate expense categories.

### Example
- We have card transactions for the day totaling $100, so we create the following journal entry upon sync:
![QBO Journal Entry](https://help.expensify.com/assets/images/Auto-Reconciliation QBO 1.png){:width="100%"}
- The current balance of the Expensify Clearing Account is now $100:
![QBO Clearing Account](https://help.expensify.com/assets/images/Auto-reconciliation QBO 2.png){:width="100%"}
- After transactions are posted in Expensify and the report is approved and exported, a second journal entry is generated:
![QBO Second Journal Entry](https://help.expensify.com/assets/images/Auto-reconciliation QBO 3.png){:width="100%"}
- We reconcile the matching amounts automatically, clearing the balance of the Expensify Clearing Account:
![QBO Clearing Account 2](https://help.expensify.com/assets/images/Auto-reconciliation QBO 4.png){:width="100%"}
- Now, you'll have a debit on your credit card account (increasing the total spent) and a credit on the bank account (reducing the available amount). The Clearing Account balance is $0.
- Each expense will also create a credit card expense, similar to how we do it today, exported upon final approval. This action debits the expense account (category) and includes any other line item data.
- This process occurs daily during the QuickBooks Online Auto-Sync to ensure your card remains reconciled.

**Note:** If Auto-Reconciliation is disabled for your company's Expensify Cards, a Domain Admin can set an export account for individual cards via **Settings > Domains > *Domain Name* > Company Cards > Edit Exports**. The Expensify Card transactions will always export as Credit Card charges in your accounting software, even if the non-reimbursable setting is configured differently, such as a Vendor Bill.

## Xero 

### Initial Setup
1. Begin by accessing your group workspace linked to Xero. On the Export tab, ensure that the Preferred Exporter is a Workspace Admin with an email address from your Expensify Cards domain (e.g. company.com).
2. Head to the Advanced tab and confirm that Auto-Sync is enabled.
3. Now, go to **Settings > Domains > *Domain Name* > Company Cards > Settings**. From the dropdown menu next to "Preferred Workspace," select the group workspace connected to Xero with Scheduled Submit enabled.
4. In the dropdown menu for "Expensify Card settlement account," pick your settlement business bank account (found in Expensify under **Settings > Account > Payments**).
5. In the dropdown menu for "Expensify Card reconciliation account," select the corresponding GL account from Xero for your settlement business bank account from step 4.

### How This Works
1. During the first overnight Auto Sync after enabling Continuous Reconciliation, Expensify will create a Liability Account (Bank Account) on your Xero Dashboard. If you've opted for Daily Settlement, an additional Clearing Account will be created in your General Ledger. Two Contacts —Expensify and Expensify Card— will also be generated:
![Xero Contacts](https://help.expensify.com/assets/images/Auto-reconciliation Xero 1.png){:width="100%"}
2. The bank account for Expensify Card transactions is tied to the Liability Account Expensify created. Note that this doesn't apply to other cards or non-reimbursable expenses, which follow your workspace settings.

### Daily Settlement Reconciliation
- If you've selected Daily Settlement, Expensify uses entries in the Clearing Account to reconcile the daily settlement. This is because Expensify bills on posted transactions, which you can review via **Settings > Domains > *Domain Name* > Company Cards > Reconciliation > Settlements**.
- At the end of each day (or month on your settlement date), the settlement charge posts to your Business Bank Account. Expensify assigns the Clearing Account (or Liability Account for monthly settlement) as a Category to the transaction, posting it in your GL. The charge is successfully reconciled.

### Bank Transaction Reconciliation
- Expensify will pay off the Liability Account with the Clearing Account balance and reconcile bank transaction entries to the Liability Account with your Expense Accounts.
- When transactions are approved and exported from Expensify, bank transactions (Receive Money) are added to the Liability Account, and coded to the Clearing Account. Simultaneously, Spend Money transactions are created and coded to the Category field. If you see many Credit Card Misc. entries, add commonly used merchants as Contacts in Xero to export with the original merchant name.
- The Clearing Account balance is reduced, paying off the entries to the Liability Account created in Step 1. Each payment to and from the Liability Account should have a corresponding bank transaction referencing an expense account. Liability Account Receive Money payments appear with "EXPCARD-APPROVAL" and the corresponding Report ID from Expensify.
- You can run a Bank Reconciliation Summary displaying entries in the Liability Account referencing individual payments, as well as entries that reduce the Clearing Account balance to unapproved expenses.
- **Important**: To bring your Liability Account balance to 0, enable marking transactions as reconciled in Xero. When a Spend Money bank transaction in the Liability Account has a matching Receive Transaction, you can mark both as Reconciled using the provided hyperlink.

**Note**: If Auto-Reconciliation is disabled for your company's Expensify Cards, a Domain Admin can set an export account for individual cards via **Settings > Domains > *Domain Name* > Company Cards > Edit Exports**. The Expensify Card transactions will always export as a Credit Card charge in your accounting software, regardless of the non-reimbursable setting in their accounting configuration.

## NetSuite

### Initial Setup
1. Start by accessing your group workspace connected to NetSuite and click on "Configure" under **Connections > NetSuite**.
2. On the Export tab, ensure that the Preferred Exporter is a Workspace Admin with an email address from your Expensify Cards' domain. For example, if your domain is company.com, the Preferred Exporter's email should be email@company.com.
3. Head over to the Advanced tab and make sure Auto-Sync is enabled.
4. Now, go to **Settings > Domains > *Domain Name* > Company Cards > Settings**. From the dropdown menu next to "Preferred Workspace," select the group workspace connected to NetSuite with Scheduled Submit enabled.
5. In the dropdown menu next to "Expensify Card reconciliation account," choose your existing NetSuite bank account used for reconciliation. This account must match the one set in Step 3.
6. In the dropdown menu next to "Expensify Card settlement account," select your daily settlement business bank account (found in Expensify under **Settings > Account > Payments**).

### How This Works with Daily Settlement
1. After setting up the card and running the first auto-sync, we'll create the Expensify Card Liability account and the Expensify Clearing Account within your NetSuite subsidiary general ledger.
2. During the same sync, if there are newly posted transactions, we'll create a journal entry totaling all posted transactions for the day. This entry will credit the selected bank account and debit the new Expensify Clearing account.
3. Once transactions are approved in Expensify, the report will be exported to NetSuite, with each line recorded as individual credit card expenses. Additionally, another journal entry will be generated, crediting the Expensify Clearing Account and debiting the Expensify Card Liability account.

### How This Works with Monthly Settlement
1. After the first monthly settlement, during Auto-Sync, Expensify creates a Liability Account in NetSuite (without a clearing account).
2. Each time the monthly settlement occurs, Expensify calculates the total purchase amount since the last settlement and creates a Journal Entry that credits the settlement bank account (GL Account) and debits the Expensify Liability Account in NetSuite.
3. As expenses are approved and exported to NetSuite, Expensify credits the Liability Account and debits the correct expense categories.

**Note**: By default, the Journal Entries created by Expensify are set to the approval level "Approved for posting," so they will automatically credit and debit the appropriate accounts. If you have "Require approval on Journal Entries" enabled in your accounting preferences in NetSuite (**Setup > Accounting > Accounting Preferences**), this will override that default. Additionally, if you have set up Custom Workflows (**Customization > Workflow**), these can also override the default. In these cases, the Journal Entries created by Expensify will post as "Pending approval." You will need to approve these Journal Entries manually to complete the reconciliation process.

### Example
- Let's say you have card transactions totaling $100 for the day.
- We create a journal entry:
![NetSuite Journal Entry](https://help.expensify.com/assets/images/Auto-reconciliation NS 1.png){:width="100%"}
- After transactions are posted in Expensify, we create the second Journal Entry(ies):
![NetSuite Second Journal Entry](https://help.expensify.com/assets/images/Auto-reconciliation NS 2.png){:width="100%"}
- We then reconcile the matching amounts automatically, clearing the balance of the Expensify Clearing Account.
- Now, you'll have a debit on your Credit Card account (increasing the total spent) and a credit on the bank account (reducing the amount available). The clearing account has a $0 balance.
- Each expense will also create a Journal Entry, just as we do today, exported upon final approval. This entry will debit the expense account (category) and contain any other line item data.
- This process happens daily during the NetSuite Auto-Sync to keep your card reconciled.

**Note**: Currently, only Journal Entry export is supported for auto-reconciliation. You can set other export options for all other non-reimbursable spend in the **Configure > Export** tab. Be on the lookout for Expense Report export in the future!

If Auto-Reconciliation is disabled for your company's Expensify Cards, a Domain Admin can set an export account for individual Expensify Cards via **Settings > Domains > Company Cards > Edit Exports**. The Expensify Card transactions will always export as a Credit Card charge in your accounting software, regardless of the non-reimbursable setting in their accounting configuration.

## Sage Intacct 

### Initial Setup
1. Start by accessing your group workspace connected to Sage Intacct and click on "Configure" under **Connections > Sage Intacct**.
2. On the Export tab, ensure that you've selected a specific entity. To enable Expensify to create the liability account, syncing at the entity level is crucial, especially for multi-entity environments.
3. Still on the Export tab, confirm that the user chosen as the Preferred Exporter is a Workspace Admin, and their email address belongs to the domain used for Expensify Cards. For instance, if your domain is company.com, the Preferred Exporter's email should be email@company.com.
4. Head over to the Advanced tab and make sure Auto-Sync is enabled.
5. Now, go to **Settings > Domains > *Domain Name* > Company Cards > Settings**. From the dropdown menu next to "Preferred Workspace," select the group workspace connected to Sage Intacct with Scheduled Submit enabled.
6. In the dropdown menu next to "Expensify Card reconciliation account" pick your existing Sage Intacct bank account used for daily settlement. This account must match the one set in the next step.
7. In the dropdown menu next to "Expensify Card settlement account" select your daily settlement business bank account (found in Expensify under **Settings > Account > Payments**).
8. Use the dropdown menus to select your cash-only and accrual-only journals. If your organization operates on a cash-only or accrual-only basis, choose "No Selection" for the journals as needed. If your organization uses both cash and accrual methods, please select both a cash-only and an accrual-only journal. Don't forget to save your settings!

### How This Works with Daily Settlement
1. After setting up the card and running the first auto-sync, we'll create the Expensify Card Expensify Clearing Account within your Sage Intacct general ledger. Once the first card transaction is exported, we'll create a Liability Account.
2. In the same sync, if there are newly posted transactions from your Expensify Cards, we'll then create a journal entry totaling all posted transactions for the day. This entry will credit the business bank account (set in Step 4 above) and debit the new Expensify Clearing account.
3. Once Expensify Card transactions are approved in Expensify, the report will be exported to Sage Intacct, with each line recorded as individual credit card expenses. Additionally, another journal entry will be generated, crediting the Expensify Clearing Account and debiting the Expensify Card Liability Account.

### How This Works with Monthly Settlement
1. After the initial export of a card transaction, Expensify establishes a Liability Account in Intacct (without a clearing account).
2. Each time a monthly settlement occurs, Expensify calculates the total purchase amount since the last settlement and creates a Journal Entry. This entry credits the settlement bank account (GL Account) and debits the Expensify Liability Account in Intacct.
3. As expenses are approved and exported to Intacct, Expensify credits the Liability Account and debits the appropriate expense categories.

# FAQ

## What are the timeframes for auto-reconciliation in Expensify?
We offer either daily or monthly auto-reconciliation: 
- Daily Settlement: each day, as purchases are made on your Expensify Cards, the posted balance is withdrawn from your Expensify Card Settlement Account (your business bank account).
- Monthly Settlement: each month, on the day of the month that you enabled Expensify Cards (or switched from Daily to Monthly Settlement), the posted balance of all purchases since the last settlement payment is withdrawn from your Expensify Card Settlement Account (your business bank account).

## Why is my Expensify Card auto-reconciliation not working with Xero?
When initially creating the Liability and Bank accounts to complete the auto-reconciliation process, we rely on the system to match and recognize those accounts created. You can't make any changes or we will not “find” those accounts.

If you have changed the accounts. It's an easy fix, just rename them!
- Internal Account Code: must be **ExpCardLbl**
- Account Type: must be **Bank**

## My accounting integration is not syncing. How will this affect the Expensify Card auto-reconciliation?
When you receive a message that your accounting solution’s connection failed to sync, you will also receive an email or error message with the steps to correct the sync issue. If you do not, please contact Support for help. When your accounting solution’s sync reconnects and is successful, your auto-reconciliation will resume.

If your company doesn't have auto-reconciliation enabled for its Expensify Cards, you can still set up individual export accounts. Here's how:

1. Make sure you have Domain Admin privileges.
2. Navigate to **Settings > Domains**
3. Select 'Company Cards'
4. Find the Expensify Card you want to configure and choose 'Edit Exports.'
5. Pick the export account where you want the Expensify Card transactions to be recorded.
6. Please note that these transactions will always be exported as Credit Card charges in your accounting software. This remains the case even if you've configured non-reimbursable settings as something else, such as a Vendor Bill.

These simple steps will ensure your Expensify Card transactions are correctly exported to the designated account in your accounting software.

## Why does my Expensify Card Liability Account have a balance?
If you’re using the Expensify Card with auto-reconciliation, your Expensify Card Liability Account balance should always be $0 in your accounting system.

If you see that your Expensify Card Liability Account balance isn’t $0, then you’ll need to take action to return that balance to $0. 

If you were using Expensify Cards before auto-reconciliation was enabled for your accounting system, then any expenses that occurred prior will not be cleared from the Liability Account.
You will need to prepare a manual journal entry for the approved amount to bring the balance to $0.

To address this, please follow these steps:
1. Identify the earliest date of a transaction entry in the Liability Account that doesn't have a corresponding entry. Remember that each expense will typically have both a positive and a negative entry in the Liability Account, balancing out to $0.
2. Go to the General Ledger (GL) account where your daily Expensify Card settlement withdrawals are recorded, and locate entries for the dates identified in Step 1.
3. Adjust each settlement entry so that it now posts to the Clearing Account.
4. Create a Journal Entry or Receive Money Transaction to clear the balance in the Liability Account using the funds currently held in the Clearing Account, which was set up in Step 2. 
