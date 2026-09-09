---
title: Import Company Card Transactions From a Spreadsheet 
description: Learn how Workspace Admins can upload company card transactions manually from a spreadsheet file.
keywords: [New Expensify, import company card, upload file, import spreadsheet, CSV, TXT, XLS, XLSX, card feed, company card feed, bring your own card, BYOC, csv import, import csv, upload csv, spreadsheet import, import transactions, csv file, excel import, xls import, unique ID, duplicate transactions, duplicate expenses, re-import csv, reupload csv]
internalScope: Audience is Workspace Admins. Covers how to import, update, and delete company card CSV feeds, including mapping Unique ID to avoid duplicate transactions on re-import. Does not cover personal card imports or Plaid connections.
---

# Import Company Card Transactions From a Spreadsheet 

If your bank isn't supported by a direct connection, you can still import company card transactions into Expensify using a CSV, TXT, XLS, or XLSX file. This lets you bring your own card (BYOC) and manually upload company card transactions when a direct bank connection is unavailable.

If your bank does support a direct connection, you can connect your account to automatically import transactions. [Learn how to set up a direct company card feed connection](/articles/new-expensify/connect-credit-cards/Set-up-a-Direct-Company-Card-Feed-Connection). 

---

## Who can import company card transactions from a spreadsheet 

Only **Workspace Admins** can import transactions for company cards.

**Company cards** must be enabled in the workspace before you can import transactions. If you don't see **Company cards**, enable it under **More features > Company cards**.

---

## How to import company card transactions from a spreadsheet

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to the **Workspaces** and select your workspace.
2. Click **Company cards**.
3. Click **Add cards**.
 - If you already have a company card feed set up, click the feed name to see **Add cards**.
4. Choose **Import transactions from file**.
5. Choose the CSV, TXT, XLS, or XLSX file you want to upload. 
6. Enter a name for the card feed.
7. Set your field mappings, mapping either a **Card number** or a **Card name**, along with **Date**, **Merchant**, **Amount**, and **Currency**.
8. Map **Unique ID** to a column that holds a unique reference for each transaction, if your file has one.
9. Assign cards to users based on the transactions in the file.
10. Click **Import**.

You must map at least one card-identity column — a **Card number** or a **Card name** — so each transaction can be grouped under a card.

**Note:** Download the [CSV template](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1594908368712-Best+Example+CSV+for+Domains.csv) for an example of the recommended column structure and formatting for company card transaction imports.

---

## How to use Unique ID to prevent duplicate transactions

**Unique ID** is an optional column mapping that tells Expensify how to recognize a transaction it has already imported. Map it to a column in your file that holds a unique reference for each transaction, such as the bank's own transaction ID or reference number.

When you map **Unique ID** and later upload a file that repeats some of the same rows, Expensify skips the rows it has already imported and only adds the new ones. This lets you upload overlapping files — for example, a full month-to-date export each week — without creating duplicate expenses.

If you don't map **Unique ID**, Expensify treats every row in the file as a new transaction. Re-uploading the same file creates a duplicate expense for each row.

For **Unique ID** to work, the values in that column must be unique within the file and stay the same for the same transaction across uploads. If the column repeats the same value on different transactions, Expensify treats them as the same transaction and skips the later ones.

Each **Unique ID** value must also be more than 5 characters long. A value of 5 characters or fewer is too short to reliably identify a transaction, so Expensify ignores it and imports the row again every time you re-upload the file. If your file numbers transactions with short values such as `1`, `2`, and `3`, map **Unique ID** to a longer reference column instead.

You must map **Unique ID** yourself on every import. Unlike the other field mappings, it is never filled in for you.

---

## What happens after you import company card transactions from a spreadsheet

- Imported transactions appear in the assigned cardholder's account. 
- The cardholder can edit, categorize, and submit these expenses on a report.
- A Workspace Admin can upload additional files to update the assigned cards with new transactions. 

---

## How to upload additional transactions to an existing card feed

1. Go to **Workspaces > Company cards**.
2. Select the name of the card feed you want to update.
3. Click **Settings**.
4. Choose **Import spreadsheet**.
5. Choose the CSV, TXT, XLS, or XLSX file you want to upload. 
6. Review and confirm the field mappings, and map **Unique ID** again if your file has a unique reference column.
7. Click **Import**.

**Note:** Previously mapped fields auto-fill to save time, with one exception: **Unique ID** is never restored, so map it again on every upload to keep Expensify from importing duplicate transactions.

---

## How to delete a company card CSV feed

1. Go to **Workspaces > Company cards**.
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

Your file must include a way to identify each card so transactions can be matched to it — map either a **Card number** column or a **Card name** column. At least one is required, and you can map both. It should also include the following columns:
- Date
- Merchant
- Amount
- Currency (optional but recommended)

**Unique ID** is optional, but map it whenever your file has a unique reference for each transaction so re-uploading the file doesn't create duplicates.

## How does matching transactions by card name work?

Instead of a **Card number**, you can map a **Card name** column, and Expensify groups each transaction under the card identified by that name. After you upload the file, those cards appear as entries you can assign to users — the name doesn't need to match a card you've already assigned. You only need one card-identity column, so map a **Card number** column instead if you'd rather identify cards by number.

## What happens if I map the same spreadsheet column twice?

You’ll see an error message and won’t be able to proceed until the issue is resolved.

## Why am I seeing an "Oops!" error about empty values? 

If you map a required field such as **Date**, **Merchant**, or **Amount** — or the **Card number** or **Card name** column you're using to identify each card — to a column that contains one or more empty cells, you'll see an "Oops!" error and won't be able to continue. Review the column you mapped, fill in any missing values, and then try importing again.

## Can I change field mappings after importing transactions?

Yes. When importing new transactions, previous mappings will be suggested, but you can change them as needed. **Unique ID** is the one mapping that is never suggested — set it again each time.

## Why do I get duplicate expenses when I upload the same file again?

Expensify only recognizes a repeat transaction when you map **Unique ID**. If you upload a file with no **Unique ID** mapping, every row imports as a new transaction, so overlapping rows become duplicate expenses. Map **Unique ID** to the column that holds each transaction's unique reference and re-import.

## Why is Unique ID blank when I upload another file to the same feed?

Expensify deliberately doesn't restore a saved **Unique ID** mapping. The saved mapping can't be told apart from an automatically generated one, so restoring it could point **Unique ID** at the wrong column of your new file and cause valid transactions to be skipped. Map it by hand on each upload.

## What happens to rows with a blank Unique ID?

Expensify imports them. A row with an empty **Unique ID** cell gets a generated ID instead, so it always imports and won't be matched against a later upload.

## Is there a minimum length for Unique ID?

Yes. A **Unique ID** value must be more than 5 characters long. Expensify ignores any value of 5 characters or fewer because it's too short to reliably identify a transaction, so those rows create duplicates on a re-upload even though **Unique ID** is mapped. Map **Unique ID** to a column with longer references, such as the bank's own transaction ID.

## Do imported company card transactions sync across web and mobile?

Yes. Changes made to CSV feeds are reflected across both platforms and also sync with Expensify Classic.

