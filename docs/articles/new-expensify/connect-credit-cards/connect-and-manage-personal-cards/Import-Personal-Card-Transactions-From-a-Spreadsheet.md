---
title: Import Personal Card Transactions From a Spreadsheet
description: Learn how members can manually import personal card transactions using a spreadsheet or bank statement file in Wallet.
keywords: [New Expensify, import personal card, upload file, import spreadsheet, CSV, TXT, XLS, XLSX, OFX, QFX, bank statement, Wallet, card feed, reimbursable, bring your own card, BYOC, csv import, import csv, upload csv, spreadsheet import, import transactions, csv file, excel import, xls import, ofx import, qfx import, upload bank statement]
internalScope: Audience is all members. Covers how to import, update, and delete personal card transactions from a spreadsheet or an .ofx/.qfx bank statement file. Does not cover company cards or Plaid connections.
order: 3
---

# Import Personal Card Transactions From a Spreadsheet

If your bank isn't supported by a direct connection, you can still import personal card transactions into Expensify using a spreadsheet file or a bank statement file downloaded from your bank. This allows you to track and submit expenses without connecting your bank account.

If your bank is supported, you can connect your account to automatically import transactions. [Learn how to manage personal cards](/articles/new-expensify/connect-credit-cards/connect-and-manage-personal-cards/Manage-Personal-Cards). 

---

## Who can import personal card transactions from a spreadsheet

Anyone can import personal card transactions using a spreadsheet or bank statement file in their account.

---

## How to import personal card transactions from a spreadsheet

1. In the navigation tabs (on the left on web, on the bottom on mobile) select **Wallet**.
2. In the **Cards** section, choose **Import transactions**.
3. Enter a **Card display name** and configure the currency, reimbursable state, and amount sign direction, then click **Next**.
4. Click **Choose file** and select your spreadsheet, or drag and drop it onto the upload area.
5. Map your spreadsheet columns to the required fields (**Date**, **Merchant**, **Amount**).
6. Click **Import**.

<!-- SCREENSHOT:
Suggestion: The **Upload a spreadsheet** screen with the supported formats line and the **Choose file** button visible.
Location: Immediately after step 4.
Purpose: Members who don't know which file types Expensify accepts often upload an unsupported file and hit an invalid file type error; seeing the supported formats listed on the screen prevents that.
-->

---

## How to import personal card transactions from a bank statement file

If your bank lets you download an .ofx or .qfx statement, you can upload it instead of building a spreadsheet. Expensify reads the columns from the statement, so there is no mapping step.

1. In the navigation tabs (on the left on web, on the bottom on mobile) select **Wallet**.
2. In the **Cards** section, choose **Import transactions**.
3. Enter a **Card display name** and configure the currency, reimbursable state, and amount sign direction, then click **Next**.
4. Click **Choose file** and select your .ofx or .qfx statement, or drag and drop it onto the upload area.
5. Click **Got it** on the **Import successful** confirmation.

Expensify processes the statement after the upload finishes, so the new card and its transactions can take a few minutes to appear in the **Cards** section of your **Wallet**.

---

## What happens after you import personal card transactions from a spreadsheet

- Imported transactions appear as **Unreported** expenses.
- You can edit, categorize, and submit these expenses on a report.
- Imported transactions are available on both web and mobile.

[Learn how to create and submit a report](/articles/new-expensify/reports-and-expenses/Create-and-Submit-Reports). 

---

# FAQ

## What file formats are accepted for personal card imports?

You can import the following file types:
- .CSV  
- .TXT  
- .XLS  
- .XLSX  
- .OFX  
- .QFX  

## Why don't I see the column mapping step when I upload an .ofx or .qfx file?

An .ofx or .qfx statement already identifies its own date, merchant, and amount values, so Expensify imports the transactions without asking you to map columns.

## Why haven't the transactions from my .ofx or .qfx statement appeared yet?

The statement is processed after the upload finishes, which is why the confirmation says new cards and transactions may take some time to appear. Wait a few minutes, then check the **Cards** section of your **Wallet** again.

## Can I upload an .ofx or .qfx statement to a card I already imported from a spreadsheet?

No. Once a card has been imported from a spreadsheet, further imports to that card must also be spreadsheets. To import a statement file, create a new card import instead.

## What columns are required for personal card spreadsheet imports?

Your file must include at least the following columns:
- Date  
- Amount  
- Merchant  

## What happens if I use the same column twice when mapping fields?

You’ll see an error message and won’t be able to proceed until the issue is resolved.

## Can I import additional transactions to the same card?

Yes. You can simply repeat the import process.

## Can I delete personal card spreadsheet imports?

You cannot delete the imported file, but you can delete the individual expenses that were created. [Learn how to delete expenses](/articles/new-expensify/reports-and-expenses/How-to-Delete-Expenses). 
