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

**Helpful terminology**

- SmartScanned: Any receipt where the data is automatically entered by Expensify. Expenses are SmartScanned by default unless a user stops the SmartScan and enters the details manually.
- Credit card expense: Any transaction imported from a personal card, company card feed, or CSV.
- “Cash” expense: Any expense that wasn't imported from a personal card, company card feed, or CSV. 

**How can the icons and receipt images help me diagnose my issue?**

Look carefully at your expenses. Each expense has an icon that denotes where the expense came from:
- Cash (banknotes) icon: Added manually or by SmartScanning an expense
- Credit Card icon: Imported from a connected personal credit card
- Spreadsheet icon: Imported from a personal CSV import
- Locked Credit Card icon: Imported from a company card feed or CSV upload

Ideally, your credit card expenses will all also have a SmartScanned receipt attached. If you are in the US and your admin has allowed eReceipts for low-value expenses, your expense may include the locked credit card icon and a QR code for the receipt image.

![Image of different expenses]({{site.url}}/assets/images/Expenses.png){:width="100%"}

If you see any other combination of icon and image, there is likely a duplicate expense and you will need to manually merge the expenses using the steps above.

**Can Expensify automatically merge a cash expense with a credit card expense?**

Yes, when a card expense is imported that matches the date and amount for a SmartScanned expense, Expensify automatically merges the new expense into the existing SmartScanned expense, and the expense will now show a credit card icon. The same is true if a receipt is SmartScanned and the transaction has already been imported—it will merge as soon as the SmartScan is complete.

When expenses merge automatically, Expensify uses the SmartScanned merchant name over the merchant data from the bank statement. If the SmartScan is stopped, Expensify can no longer guarantee that the data entry is accurate, so the expenses will not merge.

{% include info.html %}
Expenses created via the Expensify [Expense Importer API](https://integrations.expensify.com/Integration-Server/doc/#expense-creator) will not automatically merge with card feed transactions.
{% include end-info.html %}

**Why didn’t my expenses merge automatically?**

Here are some possible reasons for receipt merge failures:
- The cash receipt was not SmartScanned (manual override by the user)
- The card expense has a different date than the cash expense
- The expenses have different amounts (same currency)
- The expense amounts are outside the FX 5% threshold (different currencies)
- The expense date is older than 90 days (cash or card)
- It’s a duplicate - the same receipt was added twice (and the other one merged)
- The cash receipt was submitted as a reimbursable expense, and reimbursed/exported before the credit card transaction was imported
- The credit card transaction and the receipt are not in the same Expensify user accounts

Using the above instructions, you can manually merge any Unreported/Open cash receipt and card transaction in the same account. 
