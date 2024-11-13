---
title:  Import company cards from CSV
description: How to upload a CSV file containing your company card transactions
---

You can upload a CSV file containing your company card transactions and assign them to cardholders within your Expensify domain. This is also a good option to manage company card expenses when direct connections or commercial card feeds aren't available. 

{% include info.html %}
To complete this process, you must have Domain Admin access.
{% include end-info.html %}

# Import company cards via CSV

1. Download a CSV of transactions from your bank by logging into their website and finding the relevant statement.
2. Format the CSV for upload using [this template](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1594908368712-Best+Example+CSV+for+Domains.csv) as a guide. At a minimum, your file must include the following columns:
  - **Card Number**: Each number in this column should display at least the last four digits, and you can obscure up to 12 characters 
(e.g., 543212XXXXXX12334).
  - **Posted Date**: Use the YYYY-MM-DD format in this column (and any other date column in your spreadsheet).
  - **Merchant**: Enter the name of the individual or business that provided goods or services for the transaction.
  - **Posted Amount**: Use the number format in this column and indicate any negative amounts with parentheses (e.g., (335.98) for -$335.98).
  - **Posted Currency**: Use currency codes (e.g., USD, GBP, EUR) to indicate the currency of the posted transactions.
  - You can also add mapping for Categories and Tags, but those parameters are optional.
![Your CSV template should include, at a minimum, a column for the card number, posted date, merchant, posted amount, and posted currency.](https://help.expensify.com/assets/images/csv-01.png){:width="100%"}
{:start="3"}
3. In Expensify, hover over **Settings** and click **Domains**. 
4. Select the desired domain. 
5. Click **Manage/Import CSV**.
![Click Manage/Import CSV located in the top right between the Issue Virtual Card button and the Import Card button.](https://help.expensify.com/assets/images/csv-02.png){:width="100%"}
{:start="6"}
6. Create a Company Card Layout Name for your spreadsheet.
7. Click **Upload CSV**.
8. Review the mapping of your spreadsheet to ensure that the Card Number, Date, Merchant, Amount, and Currency fields match your data. 
9. Review the Output Preview for any errors and refer to the common error solutions listed in the FAQ below, if needed. 
10. Once the mapping is correct, click **Submit Spreadsheet** to complete the import.
11. Click **I'll wait a minute**, then wait about 1-2 minutes for the import to process. The domain page will refresh once the upload is complete.

# Assign new cards 

If you're assigning cards via CSV upload for the first time,

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain name. 
3. Click the card dropdown below Imported Cards and select the new CSV file you imported.
![Click the dropdown located right below the Imported Cards title near the top of the page. Then select a card from the list.](https://help.expensify.com/assets/images/csv-03.png){:width="100%"}
{:start="5"}
5. Click **Assign New Cards**.
6. Enter or select the employee's email address. *Note: Employees must have an email address under this domain in order to assign a card to them.*
7. Select the last four digits of the card number.
8. (Optional) Select the transaction start date, if desired. 
9. Click **Assign**.

The transactions will now be imported to the cardholder's account, where they can add receipts, code the expenses, and submit them for review and approval.

# Upload new expenses for existing assigned cards

To add new expenses to an existing uploaded and assigned card,

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain name.
3. Click **Manage/Import CSV**.
![Click Manage/Import CSV located in the top right between the Issue Virtual Card button and the Import Card button.](https://help.expensify.com/assets/images/csv-02.png){:width="100%"}
{:start="5"}
5. Select the saved layout from the drop-down list.
6. Click **Upload CSV**.
7. Click **Update All Cards** to retrieve the new expenses for the assigned cards.

{% include faq-begin.md %} 

## Why did I receive an error message and how do I resolve it?

If the CSV upload isn't formatted correctly, it may cause the following errors when you try to import or assign cards.  

**Error: "Attribute value mapping is missing"**

This error means that the spreadsheet may be missing critical details like the card number, date, merchant, amount, or currency. 

To resolve this error, 

1. Click the **X** at the top of the page to close the mapping window.
2. Confirm what's missing from the spreadsheet.
3. Add a new column to your spreadsheet and add the missing detail.
4. Click **Manage Spreadsheet** to upload the revised spreadsheet.
5. Enter a **Company Card Layout Name**.
6. Click **Upload CSV**.

**Error: "We've detected an error while processing your spreadsheet feed"**

This error usually occurs when there's an upload issue. 

To resolve this error, 

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain name.
3. Click **Manage/Import CSV**.
4. In the "Upload Company Card transactions for" dropdown, look for the layout name you previously created.
   - If the layout is listed, wait at least one hour and then sync the cards to see if new transactions are imported. 
   - If the layout isn't listed, create a new company card layout name and upload the spreadsheet again.

**Error: "An unexpected error occurred, and we could not retrieve the list of cards"**

This error occurs when there's an issue uploading the spreadsheet or the upload fails. 

To resolve this error,

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain name.
3. Click **Manage/Import CSV**.
4. In the "Upload Company Card transactions for" dropdown, look for the layout name you previously created.
   - If the layout is listed, wait at least one hour and then sync the cards to see if new transactions are imported. 
   - If the layout isn't listed, create a new company card layout name and upload the spreadsheet again.

## I added a new parameter to an existing spreadsheet, but the data isn't showing in Expensify after the upload completed.

This may mean that the modification caused an issue. 

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain name.
3. Click **Manage/Import CSV**.
4. Select your saved layout in the dropdown list.
5. Click **Upload CSV** and select the revised spreadsheet.
6. Compare the Output Preview row count to your revised spreadsheet to ensure they match.
   - If they don't match, revise the spreadsheet by following the CSV formatting guidelines in step 2 of the "Import company cards via CSV" process above. Once you do that, save the revised spreadsheet with a new layout name and try to upload the revised spreadsheet again. 

## Why can't I see my CSV transactions immediately after uploading them?

You'll typically need to wait 1-2 minutes after clicking **I understand, I'll wait!**.

## I'm trying to import a credit. Why isn't it uploading?

Negative expenses shouldn't include a minus sign. Instead, they should just be wrapped in parentheses. For example, to indicate "-335.98," you'll want to make sure it's formatted as "(335.98)."

{% include faq-end.md %}
