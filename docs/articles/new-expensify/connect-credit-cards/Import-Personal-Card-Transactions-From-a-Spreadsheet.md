---
title: Import personal card transactions from a spreadsheet
description: Learn how Members can manually import personal card transactions using a spreadsheet in Wallet. 
keywords: [New Expensify, import personal card, upload file, import spreadsheet, CSV, TXT, XLS, XLSX, Wallet, card feed, reimbursable, bring your own card, BYOC, csv import, import csv, upload csv, spreadsheet import, import transactions, csv file, excel import, xls import]
internalScope: Audience is all members. Covers how to import, update, and delete personal card transactions via CSV. Does not cover bank statement (OFX/QFX) imports, company cards, or Plaid connections.
---

# Import personal card transactions from a spreadsheet

If your bank isn't supported by a direct connection, you can still import personal card transactions into Expensify using a spreadsheet file. This allows you to track and submit expenses without connecting your bank account.

If your bank is supported, you can connect your account to automatically import transactions. [Learn how to manage personal cards](/articles/new-expensify/connect-credit-cards/Manage-Personal-Cards). 

If your bank gives you an OFX or QFX file instead of a spreadsheet, [learn how to import personal card transactions from a bank statement](/articles/new-expensify/connect-credit-cards/Import-Personal-Card-Transactions-From-a-Bank-Statement).

---

## Who can import personal card transactions from a spreadsheet

Anyone can import personal card transactions using a spreadsheet file in their account.

---

## How to import personal card transactions from a spreadsheet

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Wallet**.
2. In the **Cards** section, select **Import transactions**.
3. On **Import transactions from file**, enter a **Card display name**.
4. Set the **Currency**, the **Transactions are reimbursable** toggle, and the **Flip amount sign** toggle.
5. Click **Next**.
6. Drag and drop your spreadsheet onto the upload area, or click **Choose file** and select it.
7. Map your spreadsheet columns to the required fields (**Date**, **Merchant**, **Amount**).
8. Click **Import**.

---

## What happens after you import personal card transactions from a spreadsheet

- Imported transactions appear as **Unreported** expenses.
- You can edit, categorize, and submit these expenses on a report.
- Imported transactions are available on both web and mobile.

[Learn how to create and submit a report](/articles/new-expensify/reports-and-expenses/Create-and-Submit-Reports). 

---

# FAQ

## What spreadsheet file formats are accepted for personal card imports?

You can import the following file types:
- .CSV  
- .TXT  
- .XLS  
- .XLSX  

Bank statement files (.OFX and .QFX) are accepted at the same upload step, but Expensify reads them for you and skips column mapping. [Learn how to import personal card transactions from a bank statement](/articles/new-expensify/connect-credit-cards/Import-Personal-Card-Transactions-From-a-Bank-Statement).

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
