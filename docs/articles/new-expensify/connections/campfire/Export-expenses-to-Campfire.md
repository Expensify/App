---
title: Export expenses to Campfire
description: Learn how to manually export reports and expenses to Campfire, mark them as exported, and resolve export errors.
keywords: [New Expensify, export to Campfire, Campfire export report, mark as exported Campfire, bulk export Campfire, Campfire export error, already exported]
internalScope: Audience is Workspace Admins and preferred exporters sending approved spend to Campfire. Covers manually exporting a report, bulk exporting from the Expenses page, Mark as exported, and the confirmation and error states. Does not cover connecting Campfire or configuring import, export, and advanced settings.
order: 3
---

# Export expenses to Campfire

Send approved spend from Expensify to Campfire manually, or record it as already exported so it doesn't get sent twice.

You can export a single report, export several expenses at once from the **Expenses** page, or mark spend as exported without sending it to Campfire.

Before you export, make sure your export settings are set up. Learn how to [configure your Campfire import, export, and advanced settings](/articles/new-expensify/connections/campfire/Configure-Campfire).

---

## Who can export to Campfire

To export to Campfire, you must:

- Be a Workspace Admin or the workspace's preferred exporter.
- Be on a workspace with a connected Campfire integration.

---

## How to export a report to Campfire

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**.
2. Open the report you want to export.
3. Select **More**.
4. Select **Export to Campfire**.

Expensify sends the report to Campfire and confirms when the export succeeds.

Reports can only be exported once they're approved or paid. If a report isn't ready yet, Expensify shows a **Not ready to export** state instead of sending it.

---

## How to export expenses to Campfire in bulk

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Expenses**.
2. Select the checkbox next to each expense you want to export, or use the top checkbox to select all.
3. Select **Selected** at the top.
4. Select **Export**.
5. Select **Export to Campfire**.

**Export to Campfire** appears in the same menu as **Basic export** and the **All Data** export templates. Choosing it sends the selected spend to Campfire instead of downloading a CSV file.

---

## How to mark a report as exported without sending it to Campfire

Use **Mark as exported** when spend has already been recorded in Campfire another way and you don't want Expensify to send it again.

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**.
2. Open the report.
3. Select **More**.
4. Select **Mark as exported**.

You can also mark several expenses at once from the **Expenses** page by selecting them, choosing **Selected > Export**, and then selecting **Mark as exported**.

Marking spend as exported records it as exported in Expensify only. Nothing is sent to Campfire.

---

## What to do when a report is already exported

If you export a report that Expensify has already exported to Campfire, a confirmation appears asking you to confirm before exporting it again. Exporting again creates a new record in Campfire, so only confirm if you intend to duplicate it.

---

## How to troubleshoot Campfire export errors

If an export fails, Expensify shows an error message describing what went wrong. Fix the underlying problem in Campfire or in your export settings, then export the report again.

The most common cause is a missing vendor. Out-of-pocket expenses export as vendor bills matched to the report submitter's email, so the export fails when no eligible Campfire vendor has that email address.

---

# FAQ

## Why don't I see Export to Campfire?

**Export to Campfire** only appears when Campfire is connected to the workspace and you're a Workspace Admin or the workspace's preferred exporter.

## Why does my report show Not ready to export?

Reports can only be exported after they're approved or paid. Approve or pay the report, then export it.

## Does Mark as exported send anything to Campfire?

No. It only records the spend as exported in Expensify so it isn't exported again by mistake.

## What happens if I export the same report twice?

Expensify asks you to confirm because the report was already exported. Confirming creates a second record in Campfire, so you'd need to remove the duplicate in Campfire.

## Do I have to export manually?

No. When auto-sync is enabled, eligible reports export automatically using your selected export method. Learn how to [configure your Campfire import, export, and advanced settings](/articles/new-expensify/connections/campfire/Configure-Campfire).
