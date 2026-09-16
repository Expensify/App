---
title: Import personal card transactions from a bank statement
description: Learn how Members can import personal card transactions into Wallet by uploading an OFX or QFX bank statement file.
keywords: [New Expensify, import personal card, bank statement, OFX, QFX, .ofx, .qfx, upload bank statement, statement import, Wallet, import transactions, bring your own card, BYOC, quicken file, bank download]
internalScope: Audience is all members. Covers importing personal card transactions by uploading an OFX or QFX bank statement in Wallet. Does not cover spreadsheet imports, company cards, or direct bank connections.
---

# Import personal card transactions from a bank statement

If your bank isn't supported by a direct connection, you can download a statement from your bank in OFX or QFX format and upload it to Expensify. Expensify reads the statement for you, so there is no column mapping step. The transactions land on a personal card in your **Wallet**, ready to categorize and submit.

If your bank is supported, you can connect your account to import transactions automatically. [Learn how to manage personal cards](/articles/new-expensify/connect-credit-cards/Manage-Personal-Cards).

If you have a spreadsheet instead of a statement file, [learn how to import personal card transactions from a spreadsheet](/articles/new-expensify/connect-credit-cards/Import-Personal-Card-Transactions-From-a-Spreadsheet).

---

## Who can import personal card transactions from a bank statement

Anyone can import personal card transactions from a bank statement in their own account. This is available on both web and mobile.

---

## How to import personal card transactions from a bank statement

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Wallet**.
2. In the **Cards** section, select **Import transactions**.
3. On **Import transactions from file**, enter a **Card display name**.
4. Set the **Currency**, the **Transactions are reimbursable** toggle, and the **Flip amount sign** toggle.
5. Click **Next**.
6. Drag and drop your `.ofx` or `.qfx` file onto the upload area, or click **Choose file** and select it.
7. Click **Got it** on the **Import successful** confirmation.

<!-- SCREENSHOT:
Suggestion: The file upload step showing the drag-and-drop area with the line "Drag and drop your spreadsheet or bank statement here, or choose a file below. Supported formats: .csv, .txt, .xls, .xlsx, .ofx, and .qfx."
Location: Immediately after step 6.
Purpose: The page is titled Import spreadsheet, so members with a statement file are unsure they are in the right place; the screenshot confirms .ofx and .qfx are accepted here.
-->

---

## What happens after you import personal card transactions from a bank statement

- Expensify parses the statement, so you are not asked to map columns.
- A new card using the display name you entered appears in the **Cards** section of your **Wallet**.
- Transactions from the statement are added to that card as **Unreported** expenses that you can edit, categorize, and submit on a report.
- The statement is processed in the background, so the card and its transactions can take a few minutes to appear.

[Learn how to create and submit a report](/articles/new-expensify/reports-and-expenses/Create-and-Submit-Reports).

---

# FAQ

## What bank statement file formats are accepted for personal card imports?

You can upload the following file types:
- .OFX
- .QFX

Spreadsheet files (.CSV, .TXT, .XLS, and .XLSX) are handled by the spreadsheet import instead.

## Why am I not asked to map columns after uploading a bank statement?

OFX and QFX files already identify the date, merchant, and amount for each transaction, so Expensify reads them directly and skips the column mapping step.

## Why haven't my transactions appeared yet?

The statement is processed in the background after it uploads. The confirmation tells you that new cards and transactions may take some time to appear, so wait a few minutes and check your **Wallet** again.

## Can I import another bank statement to the same card?

Yes. In the **Cards** section of your **Wallet**, select the card, then select **Import spreadsheet** and upload another `.ofx` or `.qfx` file.

## Why can't I upload a bank statement to a card I imported from a spreadsheet?

A card created from a spreadsheet only accepts spreadsheet files, so `.ofx` and `.qfx` files are not offered for it. Start a new import from the **Cards** section to bring that statement in on its own card.

## Can I delete a bank statement import?

You cannot delete the uploaded statement, but you can delete the individual expenses it created. [Learn how to delete expenses](/articles/new-expensify/reports-and-expenses/How-to-Delete-Expenses).
