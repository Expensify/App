---
title: Automatically Submit Employee Reports
description: Learn how to configure automatic report submissions in Expensify Classic using Submission Frequency in your Workspace settings.
keywords: [Expensify Classic, automatic report submission, delay submissions, submission frequency, expense report schedule]
---


By setting a submission schedule for your workspace, expenses are automatically added to a report and submitted for approval based on the schedule you choose. This ensures employee expenses are collected without requiring manual submission each time.

---

# Automatically Submit Employee Reports

When an employee creates an expense, it's automatically added to a report. If no report exists, a new one is created. Reports are then submitted according to the schedule you choose—daily, weekly, monthly, twice per month, by trip, or manually.

**Note:** If you're using **Submission Frequency** and an expense has a violation, it won't be submitted until the violation is fixed. That expense is removed from the current report and added to a new open report.

---

# Set an Expense Report Submission Schedule

To enable and configure automatic submissions:

1. Go to **Settings > Workspace > [Workspace Name] > Workflows**.
2. Turn on **Submission Frequency** by toggling it on.
3. Select a **Submission frequency** from the following options:
   - **Instantly** - Expenses are submitted upon creation.
   - **Daily** – Reports are submitted every evening. Violations are submitted once corrected.
   - **Weekly** – Reports are submitted weekly. Violations are submitted on Sunday after correction.
   - **Twice a month** – Reports are submitted on the 15th and the last day of the month. Violations are submitted at the next applicable date.
   - **Monthly** – Reports are submitted once a month on your selected day. Violations are submitted the following month.
   - **By trip** – A report is submitted when no new expenses are added for two full days. A new trip report starts after that.
   - **Manually** – Expenses are auto-added to a report, but employees must submit them manually.

---

# FAQ

## I turned off Submission Frequency. Why are reports still being submitted automatically?

Turning off Submission Frequency for a Workspace doesn't affect an employee's Workspace settings. If reports are still auto-submitted, the employee will likely have Submission Frequency enabled in their workspace.

## What time of day are reports submitted via Submission Frequency?

All automatic report submissions occur in the evening Pacific Standard Time (PST).

## What happens if Submission Frequency is enabled on both the Individual and Company Workspace?

The Company Workspace settings override the Individual Workspace settings. However, suppose your Company Workspace is configured to **Manually** submit reports, but an employee has Submission Frequency enabled on their **Individual Workspace** with a set frequency (like daily or weekly. In that case, their personal settings will control submission timing. Reports will be submitted automatically based on the frequency selected in their workspace.

## Does Submission Frequency automatically create separate reports for each of my credit cards?

No. All expenses are collected into a single report and submitted based on the selected frequency.

If you need reports separated by card:
- Manually create reports for each card and assign expenses accordingly.
- Use filters to group expenses by card before assigning them to reports.

