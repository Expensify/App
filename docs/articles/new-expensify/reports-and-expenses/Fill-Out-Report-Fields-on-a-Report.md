---
title: Fill Out Report Fields on a Report
description: Enter and update report field values directly on an expense report in New Expensify, without opening a separate page.
keywords: [New Expensify, report fields, fill out report fields, edit report fields on a report, report field values, project name on report, Control plan]
internalScope: Audience is Workspace Admins, report owners, and approvers. Covers entering and updating report field values on an expense report. Does not cover enabling Report fields, creating or deleting report fields, report titles, or invoice fields.
---

# Fill Out Report Fields on a Report

Report fields collect header-level details on an expense report, such as a project name, a client code, or a trip type. You fill them out on the report itself: each field is an input above the expenses, and the value saves as soon as you finish the field, so you never leave the report to change a value.

Report fields are only available on the **Control plan**, and a Workspace Admin has to turn them on and create the fields first. To set them up, [learn how to enable Report fields](/articles/new-expensify/workspaces/Enable-Report-Fields).

---

## Who can fill out Report fields on a report

- **Workspace Admins**, the report owner, and the report's approvers can change report field values. Other members see the values, but the fields are read-only for them.
- The workspace must be on the **Control plan** with **Report fields** turned on.
- Once a report is approved, closed, or paid, only a **Workspace Admin** can change its report field values.
- **Formula** fields always show a calculated value and can't be edited by anyone.

---

## How to fill out Report fields on a report

1. Open the report.
2. Click the field you want to fill out, above the list of expenses.
3. Enter the value for that field type:
   - **Text** — Type the value, then press **Enter** or click outside the field.
   - **Date** — Choose a date in the calendar that opens.
   - **List** — Choose a value from the list that opens under the field.
4. Repeat for each field you need to fill out.

<!-- SCREENSHOT:
Suggestion: An expense report on a wide screen showing three report fields side by side above the expenses, with one list field open.
Location: Immediately after the steps in "How to fill out Report fields on a report".
Purpose: Report fields used to be rows that opened a separate page, so members who learned that flow can't tell that the fields on the report are now inputs they type into in place.
-->

---

## What the Report fields on a report show

- Fields appear above the expenses, in the order set on the workspace.
- On a wide screen, up to three fields appear side by side in each row. On a narrow screen, on mobile, or on a report with a single expense, the fields stack one per row.
- A list field with eight or more values includes a search box at the top of its list.
- A **Formula** field shows its calculated value and is read-only.

---

## What happens after you fill out a Report field

- The value saves as soon as you press **Enter**, click outside a text field, or choose a date or list value. There's no separate save step.
- If you're offline, the value is greyed out until you're back online, then it saves.
- If you clear a text field that requires a value, **This field is required** appears under it and the empty value isn't saved.
- If a field that requires a value is still empty after you leave it, **[Field name] is required** appears under the field.

---

# FAQ

## Do I have to open a separate page to change a report field value?

No. You type into the field, choose a date, or choose a list value on the report itself. Clicking a field no longer opens a separate page.

## Why can't I change a report field on a report?

Check each of the following:

- You're a **Workspace Admin**, the report owner, or one of the report's approvers. The fields are read-only for everyone else.
- The report isn't already approved, closed, or paid. After that, only a **Workspace Admin** can change the values.
- The field isn't a **Formula** field, which is always read-only.

## Why does my report show only one report field per row?

Report fields stack one per row when the window is narrow, when you're on mobile, or when the report has a single expense. Widening the window puts up to three fields back in each row.

## Can I fill out report fields on mobile?

Yes. The fields work the same way on mobile, stacked one per row.
