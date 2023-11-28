---
title:  Import and assign company cards from CSV file
description: uploading a CSV file containing your company card transactions
---

# Overview
Expensify offers a convenient CSV import feature for managing company card expenses when direct connections or commercial card feeds aren't available. This feature allows you to upload a CSV file containing your company card transactions and assign them to cardholders within your Expensify domain.
This feature is available on Group Workspaces and requires Domain Admin access.

# How to import company cards via CSV
1. Download a CSV of transactions from your bank by logging into their website and finding the relevant statement.
2. Format the CSV for upload using [this template](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1594908368712-Best+Example+CSV+for+Domains.csv) as a guide. 
- At a minimum, your file must include the following columns:
  - **Card Number** - each number in this column should display at least the last four digits, and you can obscure up to 12 characters 
(e.g., 543212XXXXXX12334).
  - **Posted Date** - use the YYYY-MM-DD format in this column (and any other date column in your spreadsheet).
  - **Merchant** - the name of the individual or business that provided goods or services for the transaction. This is a free-text field. 
  - **Posted Amount** - use the number format in this column, and indicate negative amounts with parentheses (e.g., (335.98) for -$335.98).
  - **Posted Currency** - use currency codes (e.g., USD, GBP, EUR) to indicate the currency of the posted transactions.
- You can also add mapping for Categories and Tags, but those parameters are optional. 
3. Log into Expensify on your web browser.
4. Head to Settings > Domains > Domain Name > Company Cards
5. Click Manage/Import CSV
6. Create a Company Card Layout Name for your spreadsheet
7. Click Upload CSV
8. Review the mapping of your spreadsheet to ensure that the Card Number, Date, Merchant, Amount, and Currency match your data. 
9. Double-check the Output Preview for any errors and, if needed, refer to the common error solutions listed in the FAQ below. 
10. Once the mapping is correct, click Submit Spreadsheet to complete the import.
11. After submitting the spreadsheet, click I'll wait a minute. Then, wait about 1-2 minutes for the import to process. The domain page will refresh once the upload is complete.

# How to assign new cards 
If you're assigning cards via CSV upload for the first time:
1. Head to **Settings > Domains > Domain Name > Company Cards**
2. Find the new CSV feed in the drop-down list underneath **Imported Cards**
3. Click **Assign New Cards**
4. Under **Assign a Card**, enter the relevant info
5. Click **Assign**
From there, transactions will be imported to the cardholder's account, where they can add receipts, code the expenses, and submit them for review and approval.

# How to upload new expenses for existing assigned cards
There's no need to create a new upload layout for subsequent CSV uploads. Instead, add new expenses to the existing CSV:
1. Head to **Settings > Domains > Domain Name > Company Cards**
2. Click **Manage/Import CSV**
3. Select the saved layout from the drop-down list
4. Click **Upload CSV**
5. After uploading the more recent CSV, click **Update All Cards** to retrieve the new expenses for the assigned cards.

# Deep dive
If the CSV upload isn't formatted correctly, it will cause issues when you try to import or assign cards. Let's go over some common issues and how to fix them. 

## Error: "Attribute value mapping is missing"
If you encounter an error that says "Attribute-value mapping is missing," the spreadsheet likely lacks critical details like Card Number, Date, Merchant, Amount, or Currency. To resolve:
1. Click the **X** at the top of the page to close the mapping window
2. Confirm what's missing from the spreadsheet
3. Add a new column to your spreadsheet and add the missing detail
4. Upload the revised spreadsheet by clicking **Manage Spreadsheet**
5. Enter a **Company Card Layout Name** for the contents of your spreadsheet
6. Click **Upload CSV**

## Error: "We've detected an error while processing your spreadsheet feed"
This error usually occurs when there's an upload issue. 
To troubleshoot this:
1. Head to **Settings > Domains > Domain Name > Company Cards** and click **Manage/Import CSV**
2. In the **Upload Company Card transactions for** dropdown list, look for the layout name you previously created.
3. If the layout is listed, wait at least one hour and then sync the cards to see if new transactions are imported. 
4. If the layout isn't listed, create a new **Company Card Layout Name** and upload the spreadsheet again.

## Error: "An unexpected error occurred, and we could not retrieve the list of cards"
This error occurs when there's an issue uploading the spreadsheet or the upload fails. 
To troubleshoot this: 
1. Head to **Settings > Domains > Domain Name > Company Cards** and click **Manage/Import CSV**
2. In the **Upload Company Card transactions for** dropdown list, look for the layout name you previously created.
3. If the layout is listed, wait at least one hour and then sync the cards to see if new transactions are imported. 
4. If the layout isn't listed, create a new **Company Card Layout Name** and upload the spreadsheet again.


## I added a new parameter to an existing spreadsheet, but the data isn't showing in Expensify after the upload completes. What's going on?
If you added a new card to an existing spreadsheet and imported it via a saved layout, but it isn't showing up for assignment, this suggests that the modification may have caused an issue.
The next step in troubleshooting this issue is to compare the number of rows on the revised spreadsheet to the Output Preview to ensure the row count matches the revised spreadsheet. 
To check this:
1. Head to **Settings > Domains > Domain Name > Company Cards** and click **Manage/Import CSV** 
2. Select your saved layout in the dropdown list
3. Click **Upload CSV** and select the revised spreadsheet
4. Compare the Output Preview row count to your revised spreadsheet to ensure they match


If they don't match, you'll need to revise the spreadsheet by following the CSV formatting guidelines in step 2 of "How to import company cards via CSV" above.
Once you do that, save the revised spreadsheet with a new layout name.
Then, try to upload the revised spreadsheet again: 

1. Click **Upload CSV**
2. Upload the revised file 
3. Check the row count again on the Output Preview to confirm it matches the spreadsheet
4. Click **Submit Spreadsheet**

# FAQ 
## Why can't I see my CSV transactions immediately after uploading them?
Don't worry! You'll typically need to wait 1-2 minutes after clicking **I understand, I'll wait!**

## I'm trying to import a credit. Why isn't it uploading?
Negative expenses shouldn't include a minus sign. Instead, they should just be wrapped in parentheses. For example, to indicate "-335.98," you'll want to make sure it's formatted as "(335.98)."
