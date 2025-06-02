---
title: automatically-submit-employee-reports.md
description: Learn how to configure automatic report submissions in Expensify Classic using Delay Submissions in your Workspace settings.
keywords: automatic report submission, delay submissions, Expensify Classic, submission frequency, expense report schedule
---

<div id="expensify-classic" markdown="1">

Set up automatic report submissions so employee expenses are collected and submitted on a regular schedule—no manual work required. Configure this from your Workspace settings to fit your team's workflow.

# Automatically submit employee reports

When an employee creates an expense, it's automatically added to a report. If no report exists, a new one is created. Reports are then submitted based on the schedule you choose—daily, weekly, monthly, twice per month, by trip, or manually.

**Note:** If you’re using *Delayed Submissions* and an expense has a violation, it won’t be submitted until the violation is fixed. That expense is removed from the current report and added to a new open report.

---

## Set an expense report submission schedule

To enable and configure automatic submissions:

1. Go to `Settings > Workspace > [Workspace Name] > Workflows`.
2. Turn on **Delay Submissions** by toggling it on.
3. Select a **Submission frequency** from the following options:
   - **Daily** – Reports are submitted every evening. Violations are submitted once corrected.
   - **Weekly** – Reports are submitted weekly. Violations are submitted the following Sunday after correction.
   - **Twice a month** – Reports are submitted on the 15th and the last day of the month. Violations are submitted at the next applicable date.
   - **Monthly** – Reports are submitted once a month on your selected day. Violations are submitted the following month.
   - **By trip** – A report is submitted when no new expenses are added for two full days. A new trip report starts after that.
   - **Manually** – Expenses are auto-added to a report, but employees must submit them manually.

---

# FAQ

## I turned off Delay Submissions. Why are reports still being submitted automatically?

Turning off Delay Submissions for a Workspace doesn’t override an employee’s Individual Workspace settings. If reports are still being auto-submitted, the employee likely has Delay Submissions enabled in their own workspace.

## What time of day are reports submitted via Delay Submissions?

All automatic report submissions occur in the evening Pacific Standard Time (PST).

## What happens if Delay Submissions is enabled on both the Individual and Company Workspace?

The Company Workspace settings override the Individual Workspace settings. However, if your Company Workspace is configured to **Manually** submit reports, but an employee has Delay Submissions enabled on their **Individual Workspace** with a set frequency (like daily or weekly), their personal settings will control submission timing. Reports will be submitted automatically based on the frequency selected in their personal workspace.

## Does Delay Submissions automatically create separate reports for each of my credit cards?

No. All expenses are collected into a single report and submitted based on the selected frequency.

If you need reports separated by card:
- Manually create reports for each card and assign expenses accordingly.
- Use filters to group expenses by card before assigning them to reports.

</div>
