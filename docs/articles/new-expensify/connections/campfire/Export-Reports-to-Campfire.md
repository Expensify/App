---
title: Export Reports to Campfire
description: Learn how to export one or more reports to Campfire, mark reports as exported, and fix Campfire export errors.
keywords: [New Expensify, export to Campfire, Campfire export, bulk export to Campfire, mark as exported, Campfire export failed, Campfire vendor not found, export again, Workspace Admin, preferred exporter]
internalScope: Audience is Workspace Admins and preferred exporters on a workspace connected to Campfire. Covers exporting a single report or multiple reports to Campfire, marking reports as exported, re-exporting, and fixing export errors. Does not cover connecting Campfire, configuring export settings, or exporting reports to CSV.
order: 3
---

# Export Reports to Campfire

Export approved reports from Expensify to Campfire, one at a time or in bulk. If you entered a report in Campfire yourself, you can mark it as exported instead.

If **Auto-sync** is on, Expensify exports reports automatically based on your **Export method**. Use the steps below to export a report manually, retry a failed export, or export several reports at once.

---

## Who can export reports to Campfire

To export reports to Campfire, you must:

- Be a Workspace Admin or the preferred exporter.
- Have an approved, paid, or closed expense report.
- Use a workspace connected to Campfire.

Learn how to [connect to Campfire](/articles/new-expensify/connections/campfire/Connect-to-Campfire).

---

## How to export a report to Campfire

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**.
2. Open the report you want to export.
3. Select **More**.
4. Select **Export**.
5. Select **Export to Campfire**.

If **Auto-sync** is off, or the last export failed, you can also select **Export to Campfire** at the top of the report.

The report history shows when the export starts and when it finishes.

---

## How to export multiple reports to Campfire

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**.
2. Select the checkbox next to each report you want to export, or use the top checkbox to select all.
3. Select the **X selected** button at the top (for example, **2 selected**).
4. Select **Export**.
5. Select **Campfire**.

If only some of the selected reports can be exported, Expensify asks you to confirm before exporting the rest.

**Note:** You can only export reports together when their workspaces connect to the same Campfire company.

<!-- SCREENSHOT:
Suggestion: The Reports page with several reports selected and the Export menu open, showing Campfire and Mark as exported above the CSV templates.
Location: After step 5 of "How to export multiple reports to Campfire".
Purpose: The bulk option is labeled Campfire, not Export to Campfire, so admins may miss it among the CSV export templates.
-->

---

## How to mark a report as exported to Campfire

Mark a report as exported when you already entered it in Campfire and don't want Expensify to export it.

For a single report:

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**.
2. Open the report.
3. Select **More**.
4. Select **Export**.
5. Select **Mark as exported**.

For multiple reports:

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Spend > Reports**.
2. Select the checkbox next to each report.
3. Select the **X selected** button at the top (for example, **2 selected**).
4. Select **Export**.
5. Select **Mark as exported**.

The report history shows that the report was marked as manually exported to Campfire.

---

## What happens when you export a report to Campfire again

If a report was already exported, Expensify shows a **Careful!** message before exporting it again. Select **Yes, export again** to export a second copy, or **Cancel** to stop.

---

## How to fix a failed export to Campfire

When an export fails, the report history shows **failed to export this report to Campfire** with the reason. The most common reasons are:

- **No matching vendor** – Reimbursable expenses export as vendor bills to the Campfire vendor whose email matches the report submitter's email. Add the submitter as a vendor in Campfire with the same email, then export the report again.
- **No company card account** – Company card expenses need a Campfire account. Choose a **Company card account** in your Campfire export settings, then export the report again.

Learn how to [configure Campfire export settings](/articles/new-expensify/connections/campfire/Configure-Campfire).

---

# FAQ

## Why don't I see Export to Campfire on a report?

The report may not be approved, paid, or closed yet, or it may already be exported. You also need to be a Workspace Admin or the preferred exporter.

## Why don't I see Export to Campfire at the top of a report?

When **Auto-sync** is on, Expensify exports reports automatically, so the button only appears at the top of the report if the last export failed. You can still export from **More > Export**.

## Can I export individual expenses to Campfire?

No. You export whole reports to Campfire. Reimbursable expenses become vendor bills and company card expenses become journal entries.
