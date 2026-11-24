---
title: Resolve an Invalid Export Type in Dynamics 365 Business Central
description: Learn what to do when a Business Central report export fails with Invalid export type.
keywords: [Invalid export type, Business Central export error, General journal, Purchase invoices, Dynamics 365 Business Central, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers checking export destinations and escalating the Invalid export type error, which has no BC code. Does not cover individual BC-code errors or recovery of partially created records.
contentType: task
platform: [web, mobile]
order: 101
---

# Resolve an Invalid Export Type in Dynamics 365 Business Central

## What the Business Central invalid export type error means

If a report shows this error:

> Invalid export type

Expensify can't use the configured export destination for the affected expenses.

## Why the Business Central invalid export type error happens

The export configuration doesn't resolve to a supported destination. Business Central exports support **General journal** and **Purchase invoices**, configured separately for reimbursable and company card expenses.

## How to resolve an invalid export type for Business Central

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Under **Dynamics 365 Business Central**, select **Export**.
3. Check **Export reimbursable expenses as** and **Export company card expenses as**.
4. Confirm each uses **General journal** or **Purchase invoices**, according to your accounting team's requirements.
5. If a selection was missing or incorrect, correct it and export the report again.

## When to contact Concierge

Contact Concierge if both destinations already show valid selections, you can't update them, or the error continues. Include the report link and the selected export destinations.
