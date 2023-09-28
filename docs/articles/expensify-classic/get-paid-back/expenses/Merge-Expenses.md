---
title: Merge Expenses
description: This article shows you all the ways that you can merge your expenses in Expensify!
---
<!-- The lines above are required by Jekyll to process the .md file -->

# About
The merge expense function helps combine two separate expenses into one. This is useful when the same expense has been accidentally entered more than once, or if you have a connected credit card and an imported expense didn’t automatically merge with a manual entry. 

# How-to merge expenses
It’s important to note that merging expenses doesn't add the two values together. Instead, merging them combines both expenses to create a single, consolidated expense.

Keep in mind: 
1. Merging expenses cannot be undone.
2. You can only merge two expenses at a time.
3. You can merge a cash expense with a credit card expense, or two cash expenses - but not two credit card expenses.
4. In order to merge, both expenses will need to be in an Open or Unreported state.

# How to merge expenses on the web app
To merge two expenses from the Expenses page:
1. Sign into your Expensify account.
2. Navigate to the Expenses page on the left-hand navigation.
3. Click the checkboxes next to the two expenses you wish to merge.
4. Click **Merge**.
5. You'll be able to choose which aspect of each of the two expenses you would like to be used on the resulting expense, such as the receipt image, card, merchant, category, and more.  

To merge two expenses from the Reports page:
1. Sign into your Expensify account.
2. Navigate to the Reports page on the left-hand navigation.
3. Click the Report that contains the expenses that you wish to merge.
4. Click on the **Details** tab, then the Pencil icon.
5. Select the two expenses that you wish to merge.
6. You'll be able to choose which aspect of each of the two expenses you would like to be used on the resulting expense, such as the receipt image, card, merchant, category, and more.   

# How to merge expenses on the Expensify mobile app
On the mobile app, merging is prompted when you see the message _"Potential duplicate expense detected"_. Simply tap **Resolve Now** to take a closer look, then hit **Merge Expense**, and you're done! 

If the expenses exist on two different reports, you will be asked which report you'd like the newly created single expense to be reported onto.

# FAQ

## Can you merge expenses across different reports?

You cannot merge expenses across different reports. Expenses will only merge if they are on the same report. If you have expenses across different reports that you wish to merge, you’ll need to move both expenses onto the same report (and ensure they are in the Open status) in order to merge them.

## Can you merge expenses across different accounts?

You cannot merge expenses across two separate accounts. You will need to choose one submitter and transfer the expense information to that user's account in order to merge the expense.
## Can you merge expenses with different currencies?

Yes, you can merge expenses with different currencies. The conversion amount will be based on the daily exchange rate for the date of the transaction, as long as the converted rates are within +/- 5%. If the currencies are the same, then the amounts must be an exact match to merge.

## Can Expensify automatically merge a cash expense with a credit card expense?

Yes, Expensify can merge a cash expense with a credit card expense. A receipt will need to be SmartScanned via the app or forwarded to [receipts@expensify.com](mailto:receipts@expensify.com) in order to merge with a card expense. Note that the SmartScan must be fully completed and not stopped or edited, otherwise the two won’t merge. 

## It doesn’t look like my cash and card expenses merged properly. What are some troubleshooting tips?
First, check the expense types - you can only merge a SmartScanned receipt (which will initially show with a cash icon) with a card transaction imported from a bank or via CSV.  

If the card expense in your Expensify account is older than the receipt you're trying to merge it with, they won't merge, and if the receipt is dated more than 7 days prior to the card expense, then they also will not merge.

If you have any expenses that are more than 90 days old from the date they were incurred (not the date they were imported to Expensify), Expensify will not automatically merge them. This safeguard helps prevent the merging of very old expenses that might not align with recent transactions or receipts.

Lastly, transactions imported with the Expensify API (via the Expense Importer) will not automatically merge with SmartScanned transactions.
