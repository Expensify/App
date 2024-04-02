---
title: Merge expenses
description: Combine two expenses into one
---

Combine two separate expenses by merging them into one single, consolidated expense.

{% include info.html %}
Merging expenses cannot be undone, and you cannot merge two credit card expenses.
{% include end-info.html %}

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
To merge expenses from the Expenses tab,

1. Click the **Expenses** tab.
2. Select the checkbox next to the two expenses you wish to merge.
3. Click **Merge**.
4. Choose which details to use from each of the expenses, such as the receipt image, card, merchant, category, etc.

To merge expenses from the Reports tab,

1. Click the **Reports** tab.
2. Click the Report that contains the expenses that you wish to merge.
3. Click the **Details** tab, then the Edit icon.
4. Select the two expenses that you wish to merge.
5. You’ll be able to choose which details to use from each of the two expenses, such as the receipt image, card, merchant, category, etc.
{% include end-option.html %}

{% include option.html value="mobile" %}
On the mobile app, you’ll be notified of duplicate expenses and can click **Resolve Now** to review them. To merge the two expenses into one expense, tap **Merge Expense**.

If the expenses exist on two different reports, you will be asked which report you’d like the newly created single expense to be reported onto.
{% include end-option.html %}

{% include end-selector.html %}

# FAQs

**Why can’t I merge expenses that are on my submitted report?**
You cannot merge expenses that are on reports that have already been submitted. 

**Can I merge expenses that are under different accounts?**
No, you cannot merge expenses across two separate accounts. 

**Can you merge expenses with different currencies?**
Yes, you can merge expenses with different currencies. The conversion amount will be based on the daily exchange rate for the date of the transaction, as long as the converted rates are within +/- 5%. If the currencies are the same, then the amounts must be an exact match to merge.

**Can Expensify automatically merge a cash expense with a credit card expense?**
Yes, Expensify merges a cash expense with a credit card expense if the receipt is SmartScanned or forwarded to receipts@expensify.com. However, these expenses will not merge if:
- The card expense added to your Expensify account is older than the receipt you’re trying to merge it with
- The receipt is dated older than 7 days of the card expense date
- Either expense date (the date the Expense was incurred, not the date it was added into Expensify) is older than 90 days
- The transaction was imported with the Expensify API

However, if a receipt does not automatically merge with the card entry, you can complete this process manually.
