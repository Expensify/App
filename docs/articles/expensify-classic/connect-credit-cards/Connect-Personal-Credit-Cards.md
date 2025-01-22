---
title: Connect Personal Credit Cards
description: Connect or import your personal credit cards into Expensify for tracking and reimbursement
---

Connecting your pesonal credit card accounts to Expensify allows you to track your expenses and get reimbursed for them all in one place. You can set up a connection to automatically import your credit card expenses directly from your credit card account, or you can import them manually from a CSV file. 

These options also automatically merge your expenses with any related SmartScanned expenses in your Expensify account. Additionally, importing directly from your credit card account also allows you to generate IRS-compliant eReceipts (if enabled).

# Import directly from your credit card account

1. In Expensify, hover over **Settings** and click **Account**.
2. Click **Credit Card Import***.
3. Click **Import Bank/Card**.
4. Choose your bank from the list or use the search box.
   - If your bank isn't listed, you can use the process below to upload a spreadsheet instead.
5. Select a transaction start date using the calendar dropdown.

{% include info.html %}
Depending on your bank, you may be able to go back up to 90 days. If you need to include transactions from an earlier date, you can upload a spreadsheet of those transactions separately using the process below.
{% include end-info.html %}

{:start="6"}

6. Click **Take me there**.
7. Enter the username and password you use for online banking.
8. Select the account(s) you want to import.
9. Click **Update** to import the latest transactions into your account.

# Import via spreadsheet

To import a CSV, OFX, QFX, or XLS file,

1. Download a spreadsheet of your expenses directly from your credit card account. *Note: An OFX file won't require additional editing but not all bank OFX files are compatible. CSV is a good option to have as a backup.*
2. Modify your spreadsheet as needed. At minimum, you should have columns for the merchant, transaction date, and amount.
   - Make sure you only have one header row.
   - Format the date column using your preferred format (e.g., yyyy-mm-dd or mm-dd-yyyy). If you use Excel, you can do this by clicking **Format Cells** and selecting **Custom**. 
3. In Expensify, hover over **Settings** and click **Account**.
4. Click **Credit Card Import**.
5. Click **Import Transactions from File**, then select **Upload**.
6. If this is the first time you're uploading for this card, keep the layout set to **Default** and choose a mapping name, such as Platinum Visa. You might use this layout again in the future, so be sure to choose something that’s easy to remember.
7. Set the date format that matches your CSV. Then adjust the currency to match your credit card account currency.
8. If you've previously imported expenses for this card, choose the default layout of a previously uploaded spreadsheet.
9. Scroll down and select which columns map to the merchant, date, and amount (as a number without a currency symbol).
10. If applicable, you can also map specific categories and tags as long as you don't have an accounting integration connected to the Workspace. In this case, you'll want to add the categories and tags to the expense after it is uploaded.
11. Check the preview of your selection under Output Preview. If everything looks good, click **Add Expenses**.

*Note: For checking accounts, you may need to "Flip Amount Sign," as transactions are often exported as negative amounts.*

# Manage settings

You can change the name of a card or determine whether the card's expenses are reimbursable or non-reimbursable by default. 

1. Click **Settings** under the card.
2. Change the card name or change the default to reimbursable or non-reimbursable.
   - **Reimbursable expenses** are owed back to you by the person/company you are submitting them to. If you incurred an expense on a personal card you, it is likely reimbursable.
   - **Non-reimbursable expenses** are expenses that are not owed back to you. This is likely spend incurred on a company card or any card that someone else pays the balance for that you incur spend on and must track the expenses for. 

# Remove a card

{% include info.html %}
Removing a card will delete all unsubmitted expenses for that card from your account. Any imported card transactions in a Processing, Approved, Closed, or Reimbursed report will remain unaffected. 
{% include end-info.html %}

To remove a card, click the red trashcan icon next to the card. 

{% include faq-begin.md %}

**Should I import directly from my bank or do the spreadsheet upload?**

**Direct import**: If you incur expenses on your personal or business card that need to be reported to your company, this could be a good option for you. However, if you have a company-assigned corporate card, check with your company's Expensify Admin about the process for handling these expenses. Admins often take care of card assignments, which may mean that you won't need to import them yourself.

**Spreadsheet import**: This is a good option for manually creating expenses in bulk if:
- You have already imported your card but need earlier transactions.
- Your bank is not supported through a direct connection with Expensify. To determine if your bank is supported, try importing it. If your bank is not listed, it is not supported at this time.

**Why can't I see the transactions I imported when I click View Expenses?**

Use the filters at the top of the Expenses page (such as the Date filter). This will often reveals "missing" expenses.

**What’s the difference between a reimbursable and non-reimbursable expense?**

- **Reimbursable expenses**: Expenses that the company has agreed to pay you back for. This may include:
   - Cash & personal card: Expenses paid for by the employee on behalf of the business.
   - Per diem: Expenses for a daily or partial daily rate configured in your Workspace.
   - Time: An hourly rate for your employees or jobs as set for your workspace. This expense type is usually used by contractors or small businesses billing the customer via Expensify Invoicing.
   - Distance: Expenses related to business travel.
- **Non-reimbursable expenses**: Expenses that you pay for with company money that need to be documented for accounting purposes (like a lunch paid for with a company card).

{% include faq-end.md %}
