---
title: Resolve the BC54 Export Error in Dynamics 365 Business Central
description: Learn how to resolve the BC54 export error by matching the report submitter to an active Dynamics 365 Business Central employee.
keywords: [BC54, BC54 export error, no active Business Central employee matches submitter, Business Central employee email, Auto-create employees/vendors, workspace admin]
internalScope: Audience is workspace admins exporting reimbursable expenses as general journals to Dynamics 365 Business Central. Covers resolving BC54 through employee matching or automatic employee creation. Does not cover employee matching during reimbursement sync (BC69) or vendor matching (BC95).
contentType: task
platform: [web, mobile]
order: 54
---

# Resolve the BC54 Export Error in Dynamics 365 Business Central

## What the BC54 export error means

If a report shows this error:

> BC54 Export Error: No active Business Central employee matches submitter [email]. Add an active employee with that email in Business Central, or enable auto-create employees/vendors in the advanced settings, then try exporting again.

Expensify needs an employee record for reimbursable expenses exported as a general journal. It can't find an active employee matching the submitter, and **Auto-create employees/vendors** is disabled.

## Why the BC54 export error happens

The employee is missing, isn't **Active**, or has neither an email nor a personal email matching the report submitter's email in Expensify.

## How to fix the BC54 export error in Business Central

1. In the connected Business Central company, search for **Employees** and open the submitter's employee card, or create one.
2. Confirm the **Status** is **Active** and the email or personal email matches the submitter's email in Expensify.
3. Open the report in Expensify and export it again.

If you want Expensify to create missing employees instead:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Under **Dynamics 365 Business Central**, select **Advanced**.
3. Enable **Auto-create employees/vendors**, then export the report again.

Check for an existing inactive employee first to avoid creating a duplicate.

## When to contact Concierge

Contact Concierge if the employee is active and the email matches, but BC54 still appears. Include the report link.
