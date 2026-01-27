---
title: Automatically submit employee reports
description: Learn how to configure automatic employee report submissions in Expensify Classic using the Submissions setting in your Workspace workflows.
internalScope: Audience is Workspace Admins. Covers how to enable and configure automatic employee report submissions in Expensify Classic. Does not cover manual report workflows or approval routing.
keywords: [Expensify Classic, automatic report submission, submission frequency, delay submissions, expense report schedule, Workspace workflows]
---


By setting a submission schedule for your workspace, expenses are automatically added to a report and submitted for approval based on the schedule you choose. This ensures employee expenses are collected without requiring manual submission each time.

---

# Automatically submit employee reports

When Submissions is enabled, employee expenses are automatically added to a report and submitted for approval based on the schedule you choose. This saves your team from submitting reports manually.

If there’s no open report, a new one is created automatically. Reports are submitted according to your selected frequency - daily, weekly, twice per month, by trip, instantly, or manually.

**Note:** Expenses with violations (like missing receipts or incorrect categories) won’t be submitted. They’re removed from the report and moved to a new open report. Once the violation is fixed, they'll be submitted on the next scheduled date.”

---

# Who can enable automatic report submissions

Only **Workspace Admins** can turn on Submissions and choose a submission frequency for their Workspace.

---

# Where to find the Submissions setting

- **Web:** Go to the navigation tabs on the left and select **Workspaces > [Workspace Name] > Workflows**
- **Mobile:** Tap the hamburger menu in the top-left corner, then select **Workspaces > [Workspace Name] > Workflows**

---

# Set an Expense Report Submission Schedule

To enable and configure automatic submissions:

1. Go to **Settings > Workspace > [Workspace Name] > Workflows**.
2. Find the **Submissions** section
3. Toggle it on (green)
4. Choose **how often expenses submit**:
   - **Instantly** — Expenses are submitted as soon as they’re created
   - **Daily** — Reports are submitted each evening (Pacific Time)
   - **Weekly** — Reports are submitted weekly on Sundays
   - **Twice a month** — Reports are submitted on the 15th and last day of the month
   - **By trip** — A report is submitted after two full days without new expenses
   - **Manually** — Expenses are auto-added to reports, but members must submit manually
  
![Submissions section in Expensify Workflows settings, showing the toggle enabled and Frequency set to By trip]({{site.url}}/assets/images/ExpensifyHelp-WorkspaceSubmissions_Classic.png){:width="100%"}

---

## How to use the By trip submission frequency

If your team travels often, choose **By trip** as your submission frequency. A report is submitted after two full days without any new expenses. A new trip report begins after that.

That way, travel expenses are grouped together without needing to sort them manually.

---

# FAQ

## What happens to expenses with violations?

Expenses with violations—like missing receipts, incorrect categories, or amounts over Workspace limits—won’t be submitted. They’re removed from the current report and moved to a new open report. Once the violation is fixed, they’ll be submitted on the next scheduled date.

## Why are reports still submitting automatically if I turned off Submissions?

If Submissions is disabled or set to **Manually** on the Workspace, check the member’s **Individual Workspace**. Their personal settings may still have Submissions enabled, which will apply by default.

## What time of day does automatic submission happen?

All scheduled report submissions occur in the **evening (Pacific Time)**, regardless of which frequency you choose.

## Can I create separate reports for each employee credit card?

No. Expenses from multiple cards are combined into a single report, based on the selected frequency.

To separate them:
- Manually create reports for each card
- Filter by card and assign expenses to the correct report

## Can employees override the Workspace submission schedule?

No. Once Submissions is enabled on the Workspace, it overrides any individual submission settings members may have in their own Workspaces.

## Can I pause automatic submissions during month-end review?

There’s no pause button, but you can temporarily change the Frequency setting to **Manually** to prevent automatic submissions. Just switch it back after your review period.

## Can employees still submit manually if Submissions is turned on?

Yes. Employees can submit reports manually at any time—even if a scheduled frequency (like Daily or By trip) is selected. The schedule just automates submission if they don’t act first.

## Do scheduled submissions include all unsubmitted expenses?

Only compliant expenses will be submitted. Expenses with violations, missing data, or issues will stay in an open report until fixed.
