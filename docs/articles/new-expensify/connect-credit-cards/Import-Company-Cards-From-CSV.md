---
title: Import Company Card Transactions from a CSV File
description: Learn how to import company card transactions into New Expensify using a CSV file, including how to map columns and assign cards.
keywords: [how to import company card transactions from CSV, CSV company cards, import transactions from file, company card file import, card feed CSV, New Expensify]
internalScope: Audience is Workspace Admins. Covers importing company card transactions via CSV file upload in New Expensify. Does not cover direct feeds, commercial feeds, or Expensify Classic CSV upload.
---

You can import company card transactions into New Expensify by uploading a CSV file. This is useful when your card provider is not supported via a direct or commercial feed, or when you need to import transactions from a custom source.

---

# Import Company Card Transactions from a CSV File

## Who can import company card transactions from a CSV file

Workspace Admins on a Collect or Control plan can import company card transactions using a CSV file.

## How to import company card transactions from a CSV file

1. Go to **Workspaces > [Workspace Name] > Company Cards**.
2. Click **Add cards**.
3. Select **Import transactions from file**.
4. Enter a **Company card layout name** to identify this card feed, then click **Save**.
5. Click **Next**.
6. Upload your CSV file.
7. Map each column in your file to the correct field. The following fields are required:
   - **Card number**
   - **Date**
   - **Merchant**
   - **Amount**
   - **Currency**
8. Click **Import**.

<!-- SCREENSHOT:
Suggestion: Show the column mapping screen with required fields highlighted.
Location: After step 7.
Purpose: Help users understand which columns need to be mapped.
-->

## How to use advanced fields when importing company card transactions

If your CSV file includes additional data beyond the required fields, you can enable advanced field mapping:

1. On the import setup screen, toggle on **Use advanced fields (not recommended)**.
2. After uploading your CSV, you can map columns to these additional fields:
   - **Original transaction date**
   - **Original amount**
   - **Original currency**
   - **Comment**
   - **Category**
   - **Tag**

## What happens after you import company card transactions from a CSV file

After a successful import, the transactions are added to the workspace and cards appear on the **Company Cards** page. You can then assign cards to workspace members.

The card feed appears with the layout name you entered during setup. You can manage the feed and assign cards the same way you would for a direct or commercial feed. Learn how to [assign and manage corporate cards](/articles/new-expensify/connect-credit-cards/Assign-and-Manage-Cards).

---

# FAQ

## What file formats are supported for company card transaction import?

CSV files are supported. Ensure your file includes columns for card number, date, merchant, amount, and currency at a minimum.

## Can I import transactions from the same CSV file more than once?

Yes, but duplicate transactions may be created if the same data is uploaded again. Review your file before each import to avoid duplicates.

## Why am I seeing an error about required columns?

All five required fields (card number, date, merchant, amount, and currency) must be mapped to a column in your file. If any are set to **Ignore**, you will see an error asking you to assign a column to each required attribute.

## Why am I seeing a duplicate column error?

Each field can only be mapped to one column. If you have mapped the same field to multiple columns, update the mappings so each field is assigned to a single column.
