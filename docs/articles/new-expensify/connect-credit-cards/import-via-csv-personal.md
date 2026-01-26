---
title: How to import personal card transactions via CSV in Expensify
description: Learn how Members can manually import personal card transactions using a CSV file in Expensify's Wallet tab.
keywords: import personal card, upload CSV, Wallet, card feed, reimbursable, bring your own card, BYOC
internalScope: Audience is Members. Covers how to import, update, and delete personal card transactions via CSV. Does not cover company cards or Plaid connections.
---

# How to import personal card transactions via CSV in Expensify

If your bank isn't supported by a direct connection, you can still import personal card transactions into Expensify using a CSV file. This helps you keep your expenses organized even without syncing to a bank.

---

## Who can use CSV personal card import

- Any **Member** with access to their **Wallet** tab can import personal card transactions via CSV.

---

## Where to find personal card CSV import options

- **Web:** Navigation tabs on the left > **Wallet**
- **Mobile:** Tap the hamburger menu > **Wallet**

---

## How to import personal card transactions via CSV

1. Go to the **Wallet** tab.
2. Tap **Add personal card**.
3. Select **Import transactions from file**.
4. Upload your CSV file.
5. Set a display name, currency, reimbursable state, and amount sign direction.
6. Map your CSV columns to required fields (Date, Merchant, Amount, Category).
7. Click **Import**.

**Note:** Transactions will import as **Unreported** by default.

---

## How to update a personal card CSV feed

1. Go to **Wallet > Assigned Cards**.
2. Select the card you previously imported.
3. Tap **Import spreadsheet**.
4. Upload a new CSV file.
5. Confirm the field mappings.
6. Import the new transactions.

**Note:** The card’s **Last updated** field will reflect the new import.

---

## How to delete a personal card CSV feed

1. Go to **Wallet > Assigned Cards**.
2. Select the imported CSV card.
3. Tap **Delete**.
4. Confirm deletion.

---

# FAQ

## What format should my CSV file use for personal card imports?

Your file should include at minimum the following columns:
- Date
- Amount
- Merchant

## What happens if I use the same column twice when mapping fields?

You’ll see an error message and won’t be able to proceed until the issue is resolved.

## Can I edit mapped fields after I’ve set up the card?

Yes. When importing new transactions, previous mappings will be suggested, but you can change them as needed.

## Do CSV imports sync between mobile and web?

Yes. Changes made to CSV feeds are reflected across both platforms and also sync with Expensify Classic.

---
