---
title: Edit Expenses
description: Learn how to edit individual expenses, and edit multiple expenses at once.
keywords: [bulk edit expenses, edit multiple expenses Expensify, update expenses in bulk, modify multiple expenses, inline editing, edit expense inline, bulk edit multi-level tags, edit one tag level, edit expenses on approved reports, edit expenses on paid reports, edit finalized expenses, recode approved expenses]
internalScope: Audience is all members, with Workspace Admin specific behavior for Approved and Paid reports. Covers editing expenses individually and in bulk editing multiple expenses at once, including how multi-level Tags are updated in bulk and which fields a Workspace Admin can still edit on Approved and Paid reports. Does not cover creating, submitting or reopening reports, or configuring tags. 
---

# Edit Expenses 

You can edit a single expense from within a report, or update multiple expenses at once using bulk edit. Both options let you change details like merchant, category, amount, and more.

## Who can edit expenses

- **All members**: Can edit expenses on their own Draft or Outstanding reports.
- **Current approver**: Can edit expenses on the submitter's Draft reports and on Outstanding reports pending their approval.
- **Workspace Admin**: Can edit expenses on any Draft or Outstanding report on the Workspace.

On Approved and Paid reports, most fields are locked. A Workspace Admin, and the approver the report is currently with, can still update the coding fields — **Category**, **Tag**, **Description**, **Tax**, and **Attendees** — without unapproving the report. Everyone else needs the report unapproved first. Expenses on Done reports cannot be edited.

Receipts work the same way: a Workspace Admin can attach or replace a receipt on an expense in an Approved report without unapproving it. [Learn how to attach or replace a receipt on an Approved report](/articles/new-expensify/reports-and-expenses/Attach-and-edit-receipts-on-expenses).

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

## How to edit multiple expenses on Approved and Paid reports

A Workspace Admin can include expenses from Approved and Paid reports in an **Edit multiple** selection. This is useful when a Category or Tag has been renamed in your accounting system and expenses still coded to the old name have to be recoded before they can export.

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Expenses**.
2. Select 2 or more expenses using the checkboxes. The selection can mix expenses on Approved or Paid reports with expenses on Draft or Outstanding reports.
3. Click **Selected**.
4. Choose **Edit multiple**.
5. Select the coding field you want to update, such as **Category** or **Tag**.
6. Enter the new value.
7. Click **Save**.
8. On the **Edit finalized expenses?** confirmation, click **Yes, continue**.

The confirmation names how many of the selected expenses sit on an Approved or Paid report, so you can check the count before the edit is applied. It only appears when your selection includes at least one of those expenses.

**Note:** **Amount**, **Merchant**, **Date**, **Billable**, and **Reimbursable** are disabled whenever the selection includes an expense on an Approved or Paid report, because those fields are locked once a report is finalized.

<!-- SCREENSHOT:
Suggestion: The Edit finalized expenses? confirmation open over the Edit multiple expenses panel, with the count sentence and both the Cancel and Yes, continue buttons visible.
Location: Immediately after step 8 of How to edit multiple expenses on Approved and Paid reports.
Purpose: Members who have been told Approved reports are locked will hesitate at this confirmation and abandon the edit. Showing the count sentence and the Yes, continue button confirms the prompt is expected and tells them which button completes the edit.
-->

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

On Approved and Paid reports, a Workspace Admin can edit only:

 - Category
 - Tag
 - Description
 - Tax
 - Attendees

**Note:** Amount, Currency, Merchant, Date, Billable, and Reimbursable stay locked on Approved and Paid reports. To change one of those, the report has to be unapproved first. Expenses on Done reports cannot be edited. [Learn how to unapprove a report](/articles/new-expensify/reports-and-expenses/Approve-Expenses).

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

Yes, with limits. A Workspace Admin can update **Category**, **Tag**, **Description**, **Tax**, and **Attendees** on an Approved report, one expense at a time or with **Edit multiple**, without unapproving it. To change **Amount**, **Merchant**, or **Date**, the report submitter will need to ask the approver to unapprove the report first. A Workspace Admin can also attach or replace a receipt on an Approved report without unapproving it.

## Can I edit expenses on Paid and Done reports? 

Paid reports work the same way as Approved reports: a Workspace Admin can still update **Category**, **Tag**, **Description**, **Tax**, and **Attendees**, and every other field is locked. Expenses on Done reports are locked and cannot be reopened for editing. 

## Why are some fields not editable in the Edit multiple panel?

If a field is restricted for any selected expense (for example, amount on a card expense), it will be disabled in the **Edit multiple** panel.

## Why don't I see the Attendees field in Edit multiple?

**Attendees** only appears when every expense you selected sits on a Workspace that is on the Control plan and has **Attendee tracking** enabled under **Rules**. It is not available for invoices or for personal expenses that aren't on a Workspace.

## Does editing attendees in bulk keep the attendees already on my expenses?

No. The attendees you select replace the ones already on selected expense.

## Why can't I see the Edit multiple option?

**Edit multiple** appears when you select 2 or more expenses that each still have at least one field you can edit. Expenses on Approved and Paid reports count toward that, as long as you are a Workspace Admin and the coding fields are still editable. It does not appear if you select whole reports instead of individual expenses.

## Why do I see the Edit finalized expenses confirmation?

Your selection includes at least one expense on an Approved or Paid report. The confirmation names how many, so you can check the count before the edit is applied. Click **Yes, continue** to apply it, or **Cancel** to return to the **Edit multiple expenses** panel with your changes still in place.

## Does editing one tag level clear the other tag levels on my expenses?

No. With independent multi-level Tags, the levels you did not edit keep the value each expense already had. With dependent multi-level Tags, the levels above the one you edited are kept, and the levels below it are cleared because their options depend on the level you changed.
