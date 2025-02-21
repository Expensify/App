---
title: Edit Expenses
description: Learn how to edit expenses in Expensify, including restrictions and permissions.
---

You can edit expenses in Expensify to update details like category, description, or attendees. However, some fields have restrictions based on the expense type and report status.

# Edit an Expense

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}

1. Click the **Expenses** tab.
2. Select the expense you want to edit.
3. Click the field you want to change (e.g., category, description, attendees).
4. Make your changes and click **Save**.

{% include end-option.html %}

{% include option.html value="mobile" %}

1. Tap the **Expenses** tab.
2. Select the expense you want to edit.
3. Tap **More Options**.
4. Update the relevant fields and tap **Save**.

{% include end-option.html %}

{% include end-selector.html %}

# Expense Editing Rules

Editing restrictions apply based on expense type and report status.

## General Editing Rules
- **Category, description, attendees, and report assignment** can be edited by the expense owner, approvers, and Workspace Admins.
- **Amount** can be edited for most manually entered expenses, except for company card transactions.
- **Tag and billable status** can be updated as long as the report is in an editable state.

## Company Card Expenses
- **Amount cannot be edited** for expenses imported from a company card.
- **Category, tag, and billable status** can be edited if the report is in the Open or Processing state.
- **Receipt images** can be added or replaced at any time.

## Submitted and Approved Expenses
- **Submitted expenses** can only be edited by an approver or Workspace Admin.
- **Approved expenses** cannot be edited unless they are reopened.
- **Expenses in a Closed report** cannot be edited.

# Delete an Expense

Expenses can only be deleted by the submitter, and the report must be in the Open state.

1. Navigate to the **Expenses** tab.
2. Select the expense you want to delete.
3. Click **Delete** and confirm.

{% include info.html %}
If the report has been submitted, you must retract it before deleting an expense. 
{% include end-info.html %}

# FAQ

## Who can edit an expense?
- **Expense owner**: Can edit expenses if the report is Open.
- **Approvers and Workspace Admins**: Can edit submitted expenses before final approval.
- **Finance teams**: May have additional permissions based on workspace settings.

## Why can’t I edit my expense amount?
Company card expenses have a fixed amount based on imported transaction data and cannot be changed.

## Can I edit an expense after it has been approved?
No, approved expenses cannot be edited unless the report is reopened.

## How do I update an expense in a submitted report?
If you need to edit an expense in a submitted report, contact an approver or Workspace Admin to reopen the report.
