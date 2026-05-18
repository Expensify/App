---
Title: Connecting Personal Credit Cards to Expensify  
Description: Learn how to connect or manually import your personal credit card expenses into Expensify for seamless tracking and reimbursement.
---

Connecting a personal credit card to Expensify makes it easy to track your expenses and get reimbursed all in one place. You can either set up a direct connection to automatically import transactions or manually upload a CSV file. These methods also merge your expenses with SmartScanned receipts and, if enabled, allow you to generate IRS-compliant eReceipts.

---

# Option 1: Connect Directly to Your Credit Card Account

Follow these steps to import expenses automatically from your bank or credit card account:

1. Log in to Expensify and navigate to **Settings > Account**.
2. Select **Wallet**.
3. Under **Imported Card Feeds**, click **Import Bank/Card**.
4. Search for and select your bank from the list.
   - If your bank isn’t listed, proceed to **Option 2: (Manual Import via Spreadsheet)**.
5. Choose a transaction start date from the calendar.  
   _**Note:** Most banks allow importing up to 30 to 90 days of transactions. If you need older transactions, use a spreadsheet import (details below)._
6. Enter your online banking credentials.
7. Select the account(s) to import.
8. Click **Update** to sync the latest transactions.

---

# Option 2: Import Transactions via Spreadsheet

Use this method if your bank isn’t supported or you need older transactions. Supported file types: CSV, OFX, QFX, or XLS.

1. Download your transactions from your credit card account in one of the supported formats.
   - **Tip**: CSV files are a good fallback if OFX files aren’t compatible.
2. Ensure your file includes columns for **Merchant**, **Transaction Date**, and **Amount** (formatted as positive values). 
   - Keep only one header row.
   - Format dates (e.g., `yyyy-mm-dd` or `mm-dd-yyyy`). In Excel, go to **Format Cells > Custom** to update the format.
3. Log in to Expensify and go to **Settings > Account > Wallet > Imported Card Feeds**.
4. Select **Import Transactions from File** and click **Upload**.
5. For first-time uploads:
   - Keep the layout set to **Default**.
   - Assign a clear name for this card, like “Platinum Visa,” for future reference.
6. Set the date format and currency to match your file.
7. If you've imported transactions for this card before, choose a previously saved layout.
8. Map file columns to **Merchant**, **Date**, and **Amount**.  
   *Optional*: Map additional columns like categories and tags (only if there’s no accounting integration in your workspace). 
9. Review the **Output Preview**, then click **Add Expenses**.  

**Note:** For checking accounts, toggle **Flip Amount Sign** if transactions are listed as negatives.

---

# Managing Credit Card Settings

You can customize how imported card transactions appear:

1. Navigate to the card’s settings under **Settings > Account > Wallet**.
2. Change the card name or set the default reimbursement option:
   - **Reimbursable**: Expenses you need to be reimbursed for, such as personal card purchases made for work.
   - **Non-Reimbursable**: Expenses incurred with a company card or paid by someone else.

---

# Removing a Card

**Important:** Removing a card deletes all unsubmitted expenses associated with it, so any card expenses on a Draft report or left Unreported will be deleted. Card expenses that were submitted are unaffected (on reports that are Outstanding, Approved, Paid, or Done).

1. Go to **Settings > Account > Wallet**.
2. Under **Imported Card Feeds**, click the red trashcan icon next to the card.

---

# FAQ

## Should I Use Direct Import or Spreadsheet Upload?

- **Direct Import**: This option is ideal for personal or business cards that require regular reporting. If you are using a company-assigned corporate card, consult your Expensify Admin, as they may handle imports.  
- **Spreadsheet Upload**: This option is best for banks not supported by Expensify or when you need to import older transactions.

## Why Don’t I See My Imported Transactions?

Use the filters on the **Expenses** page (e.g., Date filter) to locate missing expenses.

## What’s the Difference Between Reimbursable and Non-Reimbursable Expenses?

- **Reimbursable**: Personal expenses incurred for work, including:
  - Cash or personal card purchases.
  - Per diem, hourly, or mileage expenses.
- **Non-Reimbursable**: Expenses paid using company funds, like a corporate card transaction, that require documentation but not reimbursement.

