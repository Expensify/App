---
title: Company-Card-Settings.md
description: Company card settings 
---
# Overview
Once you’ve imported your company cards via commercial card feed, direct bank feed, or CSV import, the next step is to configure the cards’ settings. 

As a Domain Admin, you can access the company card settings by navigating to Settings > Domains> Domain Name > Company Card > Settings. 

If you cannot access Domains, you will need to request Domain Admin access my the Domain Admin. 

# How to configure company card settings 
You can manage company cards and set and adjust the settings from the Domains page by navigating to Settings > Domains > [Domain name] > Settings

## Reimbursable preference

You can control how your employees' company card expenses are flagged for reimbursement:

Force Yes: All expenses will be marked as reimbursable, and employees cannot change this setting.
Force No: All expenses will be marked as non-reimbursable, and employees cannot change this setting.
Do Not Force: Expenses will default to either reimbursable or non-reimbursable (your choice), but employees can adjust if necessary.

## Liability type

Choose the liability type that suits your needs:

Corporate Liability: Users cannot delete company card expenses.
Personal Liability: Users are allowed to delete company card expenses.

If you update the settings on an existing company card feed, the changes will apply to expenses imported after the date the setting is saved. The update will not affect previously imported expenses.

## Preferred policy

Setting a preferred policy for a company card feed will ensure that the imported transactions are added to a report on the policy you set. This setting is useful when members are on multiple policies and need to ensure their company card expenses are reported to a particular policy.

# How to use Scheduled Submit with company cards
All expenses must be placed on a report if they need to be approved; with Scheduled Submit, you no longer need to worry about the arduous task of employees creating their expenses, adding them to a report, and submitting them manually. All they need to do is SmartScan their receipts and Concierge will take care of the rest, on a variety of schedules that you can set according to your preferences!

Concierge won't automatically submit expenses on reports that have Expense Violations. Instead, these expenses will be moved to a new report, creating an additional report for the current reporting period.

An employee can add comments in the Expense Comment field or at the bottom of the report to clarify any details.

## Enable Scheduled Submit
Scheduled Submit is enabled in the Group Policy by navigating to Settings > Policies > Group > Policy Name > Reports > Scheduled Submit 
Use the toggle to enable Scheduled Submit 
Choose your desired frequency 

If Scheduled Submit is disabled on the group policy level (or set to a manual frequency), and you have noticed expense reports are still automatically submitted to the group policy, it's likely Scheduled Submit is enabled on the user’s Individual Policy settings. 

# How to connect company cards to an accounting integration

If you're using a connected accounting system such as NetSuite, Xero, Intacct, Quickbooks Desktop, or QuickBooks Online, you can also connect the card to export to a specific credit card GL account. First, connect the card itself, and once completed, follow the steps below:
Go to Settings > Domains > Domain name > Company Cards
Click Edit Exports on the right-hand side of the card table and select the GL account you want to export expenses to 
You're all done. After the account is set, exported expenses will be mapped to the specific account selected when exported by a Domain Admin.

# How to export company card expenses to a connected accounting integration

## Pooled GL account 

To export credit card expenses to a pooled GL account:
Go to Settings > Policies > Group > Policy Name > Connections > Accounting Integrations > Configure
Select Credit Card / Charge Card / Bank Transaction as your Non-reimbursable export option. 
Please review the Export Settings page for exporting Expense Reports to NetSuite
Select the Vendor/liability account you want to export all non-reimbursable expenses to.

## Individual GL account 

Go to Settings > Domain > Domain name > Company Cards
Click the Export Settings cog to the right-hand side of the card and select the GL account you want to export expenses to. 
You're all done! After the account is set, exported expenses will be mapped to the specific account selected.

# Deep Dive
## Identifying company card transactions
When you link your credit cards to Expensify, the transactions will appear in each user's account on the Expenses page as soon as they're posted. You can identify transactions from centrally managed cards by seeing the locked card icon next to them. That icon indicates that they’re company card expenses:
[add image here]

## Importing historical transactions 

After a card is connected via direct connection or via Approved! banks, Expensify will import 30-90 days' worth of historical transactions to your account (the timeframe is based on your bank's discretion). Any historical expenses beyond that date range can be imported using the CSV spreadsheet import method. 

## Using eReceipts 
Expensify eReceipts serve as digital substitutes for paper receipts in your purchase transactions, eliminating the necessity to retain physical receipts or utilize SmartScanning receipts. In the case of Expensify Card transactions, eReceipts are automatically generated for all amounts. For other card programs, eReceipts are specifically generated for purchases amounting to $75 or less, provided the transactions are in USD.
To ensure seamless automatic importation, it's essential to maintain your transactions in US Dollars. Additionally, eReceipts can be directly imported from your bank account. Please be aware that CSV/OFX imported files of bank transactions do not support eReceipts.
It's important to note that eReceipts are not generated for lodging expenses. Moreover, due to incomplete or inaccurate category information from certain banks, there may be instances of invalid eReceipts being generated for hotel purchases. If you choose to re-categorize expenses, a similar situation may arise. It's crucial to remember that our Expensify eReceipt Guarantee excludes coverage for hotel and motel expenses.

# FAQ
## What plan/subscription is required in order to manage corporate cards?
Group Policy (Collect or Control plan only) 
## When do my company card transactions import to Expensify?
Credit card transactions are imported to Expensify once they’re posted to the bank account. This usually takes 1-3 business days between the point of purchase and when the transactions populate in your account.
