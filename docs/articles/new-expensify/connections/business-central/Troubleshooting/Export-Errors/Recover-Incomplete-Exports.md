---
title: Recover an Incomplete Export to Dynamics 365 Business Central
description: Learn what to do when Business Central records already exist after a failed export, or a report exports but its payment or export status can't be confirmed.
keywords: [Business Central incomplete export, partial export, records already created in Business Central, report exported successfully but its payment could not be confirmed, export could not be recorded, duplicate export, workspace admin]
internalScope: Audience is workspace admins using the Dynamics 365 Business Central connection. Covers safe recovery when an export partially creates records or succeeds but payment confirmation or export recording fails. Does not cover individual BC-code validation errors, invalid export types, or initial connection setup.
contentType: task
platform: [web, mobile]
order: 100
---

# Recover an Incomplete Export to Dynamics 365 Business Central

## What to do before retrying a Business Central export

Don't export a report again if its error says records already exist in Business Central. Some export warnings mean the expenses exported successfully, even though a later step failed.

## Why a failed Business Central export can leave records behind

A report can create several purchase invoices or journal lines. If Business Central rejects a later creation or posting request, earlier records remain.

The report's error includes:

> (records already created in Business Central: [record types and IDs])

The listed records may or may not be posted. The message doesn't mean Business Central removed them.

## How to recover a partial Business Central export

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Spend > Reports** and open the report.
2. Copy the full error, including the original failure reason and the listed Business Central record IDs.
3. Ask your accounting team to review those records in the connected Business Central company.
4. Contact Concierge with the report link and full error before exporting again.

Concierge and your accounting team can determine how to handle the existing records before another export. Don't delete posted entries or re-export the whole report without that review.

## How to retry Business Central payment confirmation after a successful export

If the report shows:

> Report exported successfully, but its payment could not be confirmed. Sync the workspace to retry. Error: [reason]

The expenses exported, but Expensify couldn't confirm the reimbursement payment step. The payment may already exist in Business Central.

1. Read the reason after **Error:** and correct any configuration problem it identifies.
2. Select **Workspaces > [workspace name] > Accounting**.
3. Select **More (⋮)** next to **Dynamics 365 Business Central**, then select **Sync now**.
4. If the warning continues, contact Concierge rather than exporting the expenses again.

Don't create a duplicate payment manually while the existing payment's status is uncertain.

## How to resolve an unrecorded Business Central export

If the report shows:

> Report exported successfully, but its export could not be recorded. Contact Concierge before exporting again. Error: [reason]

The expenses exist in Business Central, but Expensify couldn't save their export status.

Contact Concierge with the report link and full message. Don't export the report again just because Expensify doesn't show a successful export.

## When to contact Concierge

Contact Concierge before retrying any export that lists existing Business Central records or says the export couldn't be recorded. For payment confirmation warnings, contact Concierge if syncing doesn't resolve the problem.

Include the report link, full error, and any record IDs. Never include your Business Central client secret.
