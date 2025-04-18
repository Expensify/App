---
title: Filter and Reconcile the Expensify Cards
description: Learn how to reconcile Expensify Card transactions using filters and exports in New Expensify, with tips for both card and payment reconciliation.
keywords: [New Expensify, Expensify Card reconciliation, card filters, export transactions, payment reconciliation, report filters, posted date, settlement matching]
---
<div id="new-expensify" markdown="1">

Once employees use the Expensify Card, you can easily view and reconcile their transactions from the Reports page in New Expensify.


# View Card Transactions by Employee or Company

To view card transactions for a specific employee or for the entire company:

1. Go to the **Reports** page.
2. Click **Filters** in the top-right corner.
3. Click **Card** to filter cards:
   - Select a feed from **Card feeds** to view expenses from all cards in the feed. 
   - Select a card from **Individual cards** to view expenses from that card. 

This view allows you to review all transactions made on the Expensify Card, grouped by employee or feed.

---

# Export Card Transactions by Date

You can export transactions from a specific date range to help with monthly reconciliations:

1. From the **Reports** page, select **Expenses** in the left-hand-bar. 
2. Select **All** above the expenses list. 
3. Click **Filters**.
4. Apply the following filters: 
   - **Card**: select the applicable card feed. 
   - **Posted date**: Set the appropriate date range (e.g., `posted<2025-02-28 AND posted>2025-02-01`)
5. Alternatively, you can enter this directly in the search bar (e.g., `type:expense status:all feed:"all in cards" posted<2025-02-28 posted>2025-02-01`)
6. Once filtered, click the **Export** icon in the top-right corner to download the report as a spreadsheet.

---

# Reconcile Card Payments Manually

To align exported card expenses with bank withdrawals:

- Group the **posted dates** in your spreadsheet by **day** or **month**.
- This allows you to match the totals with the amounts withdrawn from your **settlement account**.

**Note:** This manual method is currently the best way to reconcile card payments. We're working on a more streamlined reconciliation tool, but it's not yet available.

---

# FAQ

## Where do I find the Card filter?

On the **Reports** page:
- Click **Filters**.
- Click into the **Card** section.
- Choose a specific card feed or select all feeds to view all transactions.

## Can I reconcile card transactions for a custom date range?

Yes. Use the **Posted date** filter or add the search query directly to the search bar.

## Is there a reconciliation tool available?

Not yet. A more automated reconciliation tool is in development, but for now, we recommend using the manual export and filter method.

## Where can I learn more about using the Reports page?

Check out [Using Reports in New Expensify](https://docs.expensify.com/help/using-reports-in-new-expensify) for more details.

</div>
