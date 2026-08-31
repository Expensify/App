---
title: Edit Expenses
description: Learn how to edit individual expenses, and edit multiple expenses at once.
keywords: [bulk edit expenses, edit multiple expenses Expensify, update expenses in bulk, modify multiple expenses, inline editing, edit expense inline, bulk edit attendees, add attendees to multiple expenses]
internalScope: Audience is all members. Covers editing expenses individually and in bulk editing multiple expenses at once, including adding attendees in bulk. Does not cover creating, submitting or reopening reports. 
---

# Edit Expenses 

You can edit a single expense from within a report, or update multiple expenses at once using bulk edit. Both options let you change details like merchant, category, amount, and more.

## Who can edit expenses

- **All members**: Can edit expenses on their own Draft or Outstanding reports.
- **Current approver**: Can edit expenses on the submitter's Draft reports and on Outstanding reports pending their approval.
- **Workspace Admin**: Can edit expenses on any Draft or Outstanding report on the Workspace.

Expenses on Approved reports must be unapproved before they can be edited. Expenses on Paid and Done reports cannot be edited. 

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

## How to add attendees to multiple expenses at once

**Attendees** appears in the **Edit multiple expenses** panel when every selected expense belongs to a Workspace on the Control plan that has **Attendee tracking** turned on. [Learn how to enable Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules).

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Expenses**. 
2. Select 2 or more expenses using the checkboxes.
3. Click **Selected**. 
4. Choose **Edit multiple**.
5. Click **Attendees**.
6. Select attendees from **Recents**, **Contacts**, or enter a name, email, or phone number.
7. Click **Save**.
8. Click **Save** again to apply your changes to every selected expense.

The **Attendees** field starts empty, even when the selected expenses already have attendees. The attendees you select replace the attendees on each selected expense, and each expense total is split evenly across the new attendee list. [Learn how to add attendees to a single expense](/articles/new-expensify/reports-and-expenses/Adding-Attendees).

**Note:** You must select at least one attendee. If you click **Save** without selecting anyone, the error **At least one attendee must be selected** appears.

<!-- SCREENSHOT:
Suggestion: The Edit multiple expenses panel for a Control plan Workspace with Attendee tracking on, showing the Attendees row below the other editable fields.
Location: Immediately after the numbered steps in "How to add attendees to multiple expenses at once".
Purpose: Members often can't tell whether the missing Attendees row is a bug or a plan restriction; seeing where the row sits in the panel confirms they are looking in the right place.
-->

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

## Can I edit expenses on Paid and Done reports? 

No, Paid or Done reports are locked and cannot be reopened for editing. 

## Why are some fields not editable in the Edit multiple panel?

If a field is restricted for any selected expense (for example, amount on a card expense), it will be disabled in the **Edit multiple** panel.

## Why don't I see the Attendees field in Edit multiple?

**Attendees** only appears when every expense you selected sits on a Workspace that is on the Control plan and has **Attendee tracking** turned on under **Rules**. It is not available for invoices or for personal expenses that aren't on a Workspace.

## Does editing attendees in bulk keep the attendees already on my expenses?

No. The **Attendees** field opens empty, and the attendees you select replace whatever was already on each selected expense.

## Why can't I see the Edit multiple option?

**Edit multiple** only appears when you select 2 or more Unreported, Draft, or Outstanding expenses that have at least one editable field.
