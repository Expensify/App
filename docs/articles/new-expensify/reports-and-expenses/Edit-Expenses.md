---
title: Edit Expenses
description: Learn how to edit individual expenses, and edit multiple expenses at once.
keywords: [bulk edit expenses, edit multiple expenses Expensify, update expenses in bulk, modify multiple expenses, inline editing, edit expense inline, bulk edit multi-level tags, edit one tag level, who can edit expenses, edit an Unreported expense, expense fields read-only]
internalScope: Audience is all members. Covers editing expenses individually and in bulk editing multiple expenses at once, including how multi-level Tags are updated in bulk and who can edit an Unreported expense. Does not cover creating, submitting or reopening reports, or configuring tags. 
---

# Edit Expenses 

You can edit a single expense from within a report, or update multiple expenses at once using bulk edit. Both options let you change details like merchant, category, amount, and more.

## Who can edit expenses

- **All members**: Can edit expenses on their own Draft or Outstanding reports.
- **Current approver**: Can edit expenses on the submitter's Draft reports and on Outstanding reports pending their approval.
- **Workspace Admin**: Can edit expenses on any Draft or Outstanding report on the Workspace.
- **Expense creator only**: Unreported expenses, such as a tracked expense that isn't on a report yet, can only be edited by the member who created them.

Approver and Workspace Admin editing rights come from the report the expense sits on, so they don't apply to an Unreported expense. If another member can see an Unreported expense in a chat, every field on it is read-only for them, even if that member is an admin of their own Workspace.

Expenses on Approved reports must be unapproved before they can be edited. Expenses on Paid and Done reports cannot be edited. 

The one exception is receipts: a Workspace Admin can attach or replace a receipt on an expense in an Approved report without unapproving it. [Learn how to attach or replace a receipt on an Approved report](/articles/new-expensify/reports-and-expenses/Attach-and-edit-receipts-on-expenses).

---

## How to edit a single expense

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Expenses**. 
2. Select the expense to open it. 
3. Select the field you want to edit. 
4. Make your update. 
5. Click **Save**.

On the web, you can also edit an expense directly from the table without opening it. Hover over **date**, **merchant**, **description**, **category**, **tag**, or **amount** and click the pencil icon that appears to edit the value inline. 

---

## How to edit multiple expenses at once

Use edit multiple to update the same field across several expenses simultaneously.

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Expenses**. 
2. Select 2 or more expenses using the checkboxes.
3. Click **Selected**. 
4. Choose **Edit multiple**.
5. In the side panel, select the field you want to update. 
6. Enter the new value.
7. Click **Save**.

**Note:** If editing is not allowed on a field for any of the selected expenses, that field will not be available for editing. 

---

## How multi-level Tags are updated when you edit multiple expenses

If your Workspace uses multi-level Tags, the **Edit multiple** panel shows each tag level as its own field. Editing one level updates only that level on each selected expense, even when the selected expenses currently have different values on the other levels.

- **Independent Tags**: The levels you did not edit keep the value each expense already had. For example, if you update only the top level, each expense keeps its own lower-level tags.
- **Dependent Tags**: The levels above the one you edited are kept, and the levels below it are cleared. Lower-level options depend on the level you just changed, so the previous values are no longer valid. Select those levels again to set new values.

Learn more about [dependent and independent multi-level Tags](/articles/new-expensify/workspaces/Create-and-manage-expense-tags).
## How to add attendees to multiple expenses at once

**Attendees** appears in the **Edit multiple expenses** panel when every selected expense belongs to a Workspace on the Control plan that has **Attendee tracking** enabled. [Learn how to enable Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules).

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Expenses**. 
2. Select 2 or more expenses using the checkboxes.
3. Click **Selected**. 
4. Choose **Edit multiple**.
5. Click **Attendees**.
6. Select attendees from **Recents**, **Contacts**, or enter a name, email, or phone number.
7. Click **Save**.
8. Click **Save** again to apply your changes to every selected expense.

---
## What expense fields can be edited 

On Draft and Outstanding reports, you can edit: 

 - Amount (cash expenses only)
 - Description
 - Merchant
 - Date
 - Other fields like Category, Tag and Attendees

**Note:** Expenses on Approved reports must be unapproved before they can be edited. Expenses on Paid or Done reports cannot be edited. [Learn how to unapprove a report](/articles/new-expensify/reports-and-expenses/Approve-Expenses).

---

## What happens after you edit expenses 

- Edits apply to all selected expenses.
- Changes are saved immediately for each expense.
- Existing values are overwritten with the new values you enter.

---

# FAQ

## Can I edit expenses on Draft and Outstanding reports? 

Yes, expenses on Draft and Outstanding reports can still be edited.

## Can I edit expenses on Approved reports? 

Yes. However, the report submitter will need to ask the approver to unapprove the report before the expenses can be edited again. A Workspace Admin can attach or replace a receipt on an Approved report without unapproving it.

## Can I edit expenses on Paid and Done reports? 

No, expenses on Paid and Done reports are locked and cannot be reopened for editing. 

## Why are some fields not editable in the Edit multiple panel?

If a field is restricted for any selected expense (for example, amount on a card expense), it will be disabled in the **Edit multiple** panel.

## Why don't I see the Attendees field in Edit multiple?

**Attendees** only appears when every expense you selected sits on a Workspace that is on the Control plan and has **Attendee tracking** enabled under **Rules**. It is not available for invoices or for personal expenses that aren't on a Workspace.

## Does editing attendees in bulk keep the attendees already on my expenses?

No. The attendees you select replace the ones already on selected expense.

## Why can't I see the Edit multiple option?

**Edit multiple** only appears when you select 2 or more Unreported, Draft, or Outstanding expenses that have at least one editable field.

## Does editing one tag level clear the other tag levels on my expenses?

No. With independent multi-level Tags, the levels you did not edit keep the value each expense already had. With dependent multi-level Tags, the levels above the one you edited are kept, and the levels below it are cleared because their options depend on the level you changed.
