---
title: Manage duplicate expenses
description: Identify and manage duplicate expense requests
---

<div id="new-expensify" markdown="1">

Duplicate Detection helps prevent duplicate expense requests by flagging expense requests that have the same date and amount as another request in the same member's account. 

When an expense has been flagged as a potential duplicate, a red dot appears in the left menu or the expense’s chat room, and it is put on “hold.”

{% include info.html %}
This feature is available exclusively for Collect & Control plans.
{% include end-info.html %}

# Review & resolve duplicates

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Click the red dot in the left menu or open the expense’s chat room to open the flagged request.
2. Click the green **Review duplicates** button at the top of the request.
3. Review the list of potential duplicates.
4. To resolve a duplicate, click either **Keep all** or **Keep this one**. 
   - **Keep all**: Keeps all expenses as their separate charges and removes the hold.
   - **Keep this one**: Keeps this expense and discards its other related duplicates.
5. If discrepancies exist between the duplicates (e.g., category, tags), choose which details to keep.
6. Confirm your selection to merge the requests or keep all.

The expenses are removed from the duplicates list and the hold is removed.

{% include end-option.html %}

{% include option.html value="mobile" %}
1. Tap the red dot in the left menu or open the expense’s chat room to open the flagged request.
2. Tap the green **Review duplicates** button at the top of the request.
3. Review the list of potential duplicates.
4. To resolve a duplicate, tap either **Keep all** or **Keep this one**. 
   - **Keep all**: Keeps all expenses as their separate charges and removes the hold.
   - **Keep this one**: Keeps this expense and discards its other related duplicates.
5. If discrepancies exist between the duplicates (e.g., category, tags), choose which details to keep.
6. Confirm your selection to merge the requests or keep all.

The expenses are removed from the duplicates list and the hold is removed.
{% include end-option.html %}

{% include end-selector.html %}




{% include faq-begin.md %}
**Can I review a discarded duplicate later?**

Yes, approvers can review discarded duplicates to ensure accuracy and prevent fraud.

**Can I edit a duplicate request once resolved?**

Yes, you can edit the details of a duplicate request once it has been resolved, but the hold must be removed first.

**If two expenses are SmartScanned on the same day for the same amount, will they be flagged as duplicates?**

Yes, the expenses will be flagged as duplicates unless one of the following is true:
- The expenses were split from a single expense
- The expenses were imported from a credit card
- Matching email receipts sent to receipts@expensify.com were received with different timestamps

**What happens if Concierge flags a receipt as a duplicate?**

If Concierge lets you know it has flagged a receipt as a duplicate, scanning the receipt again will trigger the same duplicate flagging. You can still find these in the [deleted](https://www.expensify.com/expenses?reportStatusList=Deleted) filter on Expensify Classic.
{% include faq-end.md %}

</div>
