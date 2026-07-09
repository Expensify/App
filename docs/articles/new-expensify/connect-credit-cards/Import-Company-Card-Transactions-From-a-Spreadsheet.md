---
title: Import Company Card Transactions From a Spreadsheet 
description: Learn how Workspace Admins can upload company card transactions manually from a spreadsheet file.
keywords: [New Expensify, import company card, upload file, import spreadsheet, CSV, TXT, XLS, XLSX, card feed, company card feed, bring your own card, BYOC, csv import, import csv, upload csv, spreadsheet import, import transactions, csv file, excel import, xls import]
internalScope: Audience is Workspace Admins. Covers how to import, update, and delete company card CSV feeds. Does not cover personal card imports or Plaid connections.
---

# Import Company Card Transactions From a Spreadsheet 

If your bank isn't supported by a direct connection, you can still import company card transactions into Expensify using a CSV, TXT, XLS, or XLSX file. This lets you bring your own card (BYOC) and manually upload company card transactions when a direct bank connection is unavailable.

If your bank does support a direct connection, you can connect your account to automatically import transactions. [Learn how to set up a direct company card feed connection](/articles/new-expensify/connect-credit-cards/Set-up-a-Direct-Company-Card-Feed-Connection). 

---

## Who can import company card transactions from a spreadsheet 

Only **Workspace Admins** can import transactions for company cards.

**Company Cards** must be enabled in the workspace before you can import transactions. If you don't see **Company Cards**, enable it under **More features > Company Cards**.

---

## How to import company card transactions from a spreadsheet

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to the **Workspaces** and select your workspace.
2. Click **Company Cards**.
3. Click on **Add card**.
 - If you already have a company card feed set up, click the feed name to see **Add Card**.
5. Choose **Import transactions from file**.
6. Choose the CSV, TXT, XLS, or XLSX file you want to upload. 
7. Enter a name for the card feed.
8. Set your field mappings (e.g., Card Number, Date, Amount, Merchant).
9. Assign cards to users based on the transactions in the file.
10. Click **Import**.

**Note:** Download the [CSV template](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1594908368712-Best+Example+CSV+for+Domains.csv) for an example of the recommended column structure and formatting for company card transaction imports.

---

## What happens after you import company card transactions from a spreadsheet

- Imported transactions appear in the assigned cardholder's account. 
- The cardholder can edit, categorize, and submit these expenses on a report.
- A Workspace Admin can upload additional files to update the assigned cards with new transactions. 

---

## How to upload additional transactions to an existing card feed

1. Go to **Workspaces > Company Cards**.
2. Select the name of the card feed you want to update.
3. Click **Settings**.
4. Choose **Import spreadsheet**.
5. Choose the CSV, TXT, XLS, or XLSX file you want to upload. 
6. Review and confirm the field mappings.
7. Click **Import**.

**Note:** Previously mapped fields will auto-fill to save time.

---

## How to delete a company card CSV feed

1. Go to **Workspaces > Company Cards**.
2. Select the name of the card feed you want to delete. 
3. Click **Settings**.
4. Select **Remove card feed**.
5. Confirm deletion.

**Note:** This removes the card feed and any **Deleted**, **Unreported**, and **Draft** expenses. **Outstanding**, **Approved** and **Paid** expenses are not deleted. [Learn more about expense and report statuses](/articles/new-expensify/reports-and-expenses/Understanding-Report-Statuses-and-Actions#report-statuses). 

---

# FAQ

## What should I do if my file upload fails or results in an error?

Ensure the file includes the required fields and matches the formatting guidelines. Use Expensify’s [CSV template](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1594908368712-Best+Example+CSV+for+Domains.csv) for reference.

## What file formats are supported for company card imports?

You can upload CSV, TXT, XLS, and XLSX files when importing company card transactions.

## What columns are required to import company card transactions?

Your file should include the following required columns:
- Card Number (or last 4 digits of the card number)
- Date
- Amount
- Merchant
- Currency (optional but recommended)

## What happens if I map the same spreadsheet column twice?

You’ll see an error message and won’t be able to proceed until the issue is resolved.

## What happens if a required column has empty values?

If you map a required field (such as Card Number, Date, Amount, or Merchant) to a column that contains one or more empty values, you’ll see an error message and won’t be able to proceed until every row in that column has a value.

## Can I change field mappings after importing transactions?

Yes. When importing new transactions, previous mappings will be suggested, but you can change them as needed.

## Do imported company card transactions sync across web and mobile?

Yes. Changes made to CSV feeds are reflected across both platforms and also sync with Expensify Classic.

