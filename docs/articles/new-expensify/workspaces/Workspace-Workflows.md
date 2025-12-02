---
title: Workspace Workflows
description: Configure your workspace approval and submission workflows to match your team's needs.
keywords: [New Expensify, workflows, approval workflows, delay submission, add approver, connect bank, workspace settings, submission frequency]
---

Workflows help you automate how expenses are submitted, approved, and reimbursed in your workspace. Whether you're tracking personal expenses or managing a team, you can adjust workflows to match your use case.

**Note:** Workflows are available on **Collect** and **Control** workspaces. Only **Workspace Admins** can enable and configure them.

---

# Enable Workflows

To get started, enable the **Workflows** feature for your workspace.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **More Features**.
4. Under the **Spend** section, toggle on **Workflows**.

![Click Account Settings > Workspaces > click on the workspace]({{site.url}}/assets/images/ExpensifyHelp-Workflows-1.png){:width="100%"}

![Click More Features > Enable Workflows]({{site.url}}/assets/images/ExpensifyHelp-Workflows-2.png){:width="100%"}

---

# Configure Workflow Settings

Once enabled, go to the **Workflows** tab in the left menu to customize your submission and approval logic.

1. Click **Workflows**.
2. Use the toggles to enable the workflows you want to use.

![Enable workflow features]({{site.url}}/assets/images/ExpensifyHelp-Workflows-3.png){:width="100%"}

## Add Approvals

- Requires each expense to be reviewed and approved before payment.
- You can assign an approver per workspace member.
- The default approver is the **Workspace Owner**, but any **Workspace Admin** can be selected.

## Submission Frequency

- Controls when expenses are automatically submitted.
- Choose how frequently expenses are submitted:
   - Instantly - Expenses are submitted upon creation.
   - Daily – Reports are submitted every evening. Violations are submitted once corrected.
   - Weekly – Reports are submitted weekly. Violations are submitted on Sunday after correction.
   - Twice a month – Reports are submitted on the 15th and the last day of the month. Violations are submitted at the next applicable date.
   - Monthly – Reports are submitted once a month on your selected day. Violations are submitted the following month.
   - By trip – A report is submitted when no new expenses are added for two full days. A new trip report starts after that.
   - Manually – Expenses are auto-added to a report, but employees must submit them manually.
- If turned **off**, all reimbursable and non-reimbursable expenses are submitted instantly.

---

# Set Up a Payment Account

To reimburse employees or pay invoices directly from Expensify, connect your business bank account.

1. Go to **Workflows**.
2. Toggle on **Payments**.
3. Click **Connect Bank Account** and follow the [bank connection guide](https://help.expensify.com/articles/new-expensify/expenses-and-payments/Connect-a-Business-Bank-Account).
4. Choose an **authorized expense payer**—a Workspace Admin who has access to the bank account and will be the default reimburser.

---

# FAQ

## What happens if I don’t choose a submission frequency?

Expenses will remain in the **Unreported** state until the submitter adds the expense to a report, and reports will need to be submitted manually.

## Why are reports still being submitted without an automatic submission frequency set?

This happens if the submitter has set a submission frequency on their Individual workspace in Expensify Classic. In that case, expenses and reports will follow the cadence set in the Individual workspace.

## What time of day are reports submitted when an automated submission frequency is set?

All automatic report submissions occur in the evening Pacific Time (PT).

## Can I automatically create separate reports for each of my credit cards?

Not at this time. All expenses are collected into a single report and submitted based on the selected frequency.

