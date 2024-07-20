---
title: Duplicate Detection
description: Identify and manage duplicate expense requests
---

<div id="new-expensify" markdown="1">

Duplicate Detection helps prevent duplicate expense requests within a member’s account. By identifying and flagging potential duplicates, it ensures better oversight and control over expenses, enhances fraud prevention, and eases the approval process. This feature is available exclusively for paid plans (Collect & Control).

# What is a Duplicate?

A duplicate is an expense request with the same date and amount as another request in an individual member's account. When detected, duplicates are flagged as with a violation and put on “hold”.

# Surfacing Potential Duplicates

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Identify the red dot indicator in the Left-Hand Navigation (LHN) or workspace chat, which signifies a potential duplicate.
2. Click on the flagged request to open it.
3. Review the system message indicating the request is on hold due to a potential duplicate.
4. Click the green **Review duplicates** button in the request header to navigate to the resolve duplicates page.
{% include end-option.html %}

{% include option.html value="mobile" %}
1. Identify the red dot indicator in the LHN or workspace chat, which signifies a potential duplicate.
2. Tap on the flagged request to open it.
3. Review the system message indicating the request is on hold due to a potential duplicate.
4. Tap the green **Review duplicates** button in the request header to navigate to the resolve duplicates page.
{% include end-option.html %}

{% include end-selector.html %}

# Resolving Duplicates

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. On the resolve duplicates page, review the chronological list of potential duplicates.
2. Choose an action:
   - **Keep all**: Dismiss the duplicates and remove the hold.
   - **Keep this one**: Merge duplicates, keeping one request and discarding the rest.
3. If discrepancies exist (e.g., category, tags), choose which details to keep using the one-by-one flow.
4. Confirm your selection to merge requests or keep all.
5. The hold is removed, and system messages are updated accordingly.
{% include end-option.html %}

{% include option.html value="mobile" %}
1. On the resolve duplicates page, review the chronological list of potential duplicates.
2. Choose an action:
   - **Keep all**: Dismiss the duplicates and remove the hold.
   - **Keep this one**: Merge duplicates, keeping one request and discarding the rest.
3. If discrepancies exist (e.g., category, tags), choose which details to keep using the one-by-one flow.
4. Confirm your selection to merge requests or keep all.
5. The hold is removed, and system messages are updated accordingly.
{% include end-option.html %}

{% include end-selector.html %}

# Approver Review

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Identify the red dot and "Duplicate" indicators in the expense report.
2. Click the request with the duplicate indicator.
3. Click the green **Review duplicates** button to navigate to the review duplicates page.
4. Choose an action:
   - **Keep all**: Confirm to keep all requests and resolve duplicates.
   - **Keep this one**: Navigate through the one-by-one flow to choose the details to keep, followed by confirmation.
5. Confirm your choices to finalize the action and update system messages accordingly.
{% include end-option.html %}

{% include option.html value="mobile" %}
1. Identify the red dot and "Duplicate" indicators in the expense report.
2. Tap the request with the duplicate indicator.
3. Tap the green **Review duplicates** button to navigate to the review duplicates page.
4. Choose an action:
   - **Keep all**: Confirm to keep all requests and resolve duplicates.
   - **Keep this one**: Navigate through the one-by-one flow to choose the details to keep, followed by confirmation.
5. Confirm your choices to finalize the action and update system messages accordingly.
{% include end-option.html %}

{% include end-selector.html %}

# Next Steps

- **For members**: Once resolved, the request is automatically unheld, and a system message indicates the resolution.
- **For approvers**: After confirming the resolution, system messages are updated, and the request status is appropriately adjusted.

{% include faq-begin.md %}
**Can I review a dismissed duplicate later?**

Yes, approvers can review dismissed duplicates to ensure accuracy and prevent fraud.

**What happens if I choose to keep all duplicates?**

Choosing to keep all duplicates will remove the hold from the requests, and system messages will be updated to reflect this action.

**Can I edit a duplicate request once resolved?**

Yes, you can edit the details of a duplicate request once it has been resolved, but the hold must be removed first.

**What if there are discrepancies in the duplicate requests?**

You will be guided through a one-by-one flow to choose which details to keep from each request.

**If two expenses are SmartScanned on the same day for the same amount, will they be flagged as duplicates?**

Yes, they will be flagged as duplicates unless:
- The expenses were split from a single expense,
- The expenses were imported from a credit card, or
- Matching email receipts sent to receipts@expensify.com were received with different timestamps.

**What happens if Concierge flags a receipt as a duplicate?**

If Concierge lets you know it has flagged a receipt as a duplicate, scanning the receipt again will trigger the same duplicate flagging.
{% include faq-end.md %}

</div>
