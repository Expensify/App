---
title: How to import company card transactions via CSV in Expensify
description: Learn how Workspace Admins can upload company card transactions manually using a CSV file in Expensify.
keywords: import company card, upload CSV, Workspace Admin, company card feed, bring your own card, BYOC
internalScope: Audience is Workspace Admins. Covers how to import, update, and delete company card CSV feeds. Does not cover personal card imports or Plaid connections.
---

# How to import company card transactions via CSV in Expensify

If your bank isn't supported by a direct connection, you can still import company card transactions into Expensify using a CSV file. This lets you bring your own card (BYOC) and stay compliant without needing Expensify Cards or direct bank feeds.

---

## Who can use CSV company card import

Only **Workspace Admins** can import transactions for **company cards** via CSV.

---

## Where to find company card CSV import options

- **Web:** Navigation tabs on the left > **Workspaces** > **Company Cards**
- **Mobile:** Tap the hamburger menu > **Workspaces** > **Company Cards**

---

## How to import company card transactions via CSV

1. Go to the **Workspaces** tab and select your workspace.
2. Click **Company Cards**.
3. Select **Add card**.
4. Choose **Import transactions from file**.
5. Upload your CSV file.
6. Enter a name for the card feed.
7. Set your field mappings (e.g., Card Number, Date, Amount, Merchant).
8. Assign cards to users based on the transactions in the file.
9. Click **Import**.

---

## How to update a company card CSV feed

1. Go to **Workspaces > Company Cards**.
2. Select the card feed you want to update.
3. Click **Settings**.
4. Choose **Import spreadsheet**.
5. Upload a new CSV with additional transactions.
6. Review and confirm the field mappings.
7. Import the transactions. Any new cards will show as unassigned.

**Note:** Previously mapped fields will auto-fill to save time.

---

## How to delete a company card CSV feed

1. Go to **Workspaces > Company Cards**.
2. Click on the card feed.
3. Open **Settings**.
4. Select **Remove card feed**.
5. Confirm deletion.

**Note:** This removes the card and its open expenses. Submitted expenses are retained.

---

# FAQ

## What format should my CSV file use for company card imports?

Your file should include at minimum the following columns:
- Card Number (or Last 4 digits)
- Date
- Amount
- Merchant
- Currency (optional but recommended)

## What happens if I use the same column twice when mapping fields?

You’ll see an error message and won’t be able to proceed until the issue is resolved.

## Can I edit mapped fields after I’ve set up the card?

Yes. When importing new transactions, previous mappings will be suggested, but you can change them as needed.

## Do CSV imports sync between mobile and web?

Yes. Changes made to CSV feeds are reflected across both platforms and also sync with Expensify Classic.

---

**ADD A SCREENSHOT HERE.** Suggestion: Error message showing duplicate field mapping issue.
