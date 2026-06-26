---
title: Workspace Workflows
description: Configure your workspace approval and submission workflows to match your team's needs.
keywords: [New Expensify, workflows, approval workflows, delay submission, add approver, connect bank, workspace settings, submission frequency]
---

Workflows help you automate how expenses are submitted, approved, and reimbursed in your workspace. Whether you're tracking personal expenses or managing a team, you can adjust workflows to match your use case.

**Note:** Workflows are available on **Collect** and **Control** workspaces. **Workspace Admins** can enable and configure all workflow settings. **People Admins** can configure the **Approvals** section; the **Submissions** and **Payments** sections remain available to Workspace Admins only.

---

# Enable Workflows

To get started, enable the **Workflows** feature for your workspace.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **More Features**.
4. Under the **Spend** section, toggle on **Workflows**.

![Click Account Settings > Workspaces > click on the workspace]({{site.url}}/assets/images/submissions-01.png){:width="100%"}

![Click More Features > Enable Workflows]({{site.url}}/assets/images/submissions-02.png){:width="100%"}

---

## Configure Workflow Settings

Once enabled, go to the **Workflows** tab in the left menu to customize your submission and approval logic.

1. Click **Workflows**.
2. Use the toggles to enable the workflows you want to use.

![Enable workflow features]({{site.url}}/assets/images/submissions-03.png){:width="100%"}

## How to enable Approvals

- Requires each expense to be reviewed and approved before payment.
- You can assign an approver per workspace member.
- You can also set an over-limit approver for reports that exceed a specific amount. 
- The default approver is the **Workspace Owner**, but any workspace member can be selected.
- Both **Workspace Admins** and **People Admins** can enable and configure Approvals.

Learn how to [enable Approvals](https://help.expensify.com/articles/new-expensify/workspaces/Add-Approvals) on your workspace. 

## How to enable Submissions

- Controls when expenses are automatically submitted.
- Choose how frequently expenses are submitted:
   - Instantly - Expenses are submitted upon creation.
   - Daily – Reports are submitted every evening. Violations are submitted once corrected.
   - Weekly – Reports are submitted weekly. Violations are submitted on Sunday after correction.
   - Twice a month – Reports are submitted on the 15th and the last day of the month. Violations are submitted at the next applicable date.
   - Monthly – Reports are submitted once a month on your selected day. Violations are submitted the following month.
   - By trip – A report is submitted when no new expenses are added for two full days. A new trip report starts after that.
   - Manually – Expenses are automatically added to reports. Reports remain unsubmitted until a member submits them manually.

Note: If **Submissions** is disabled, expenses remain in the **Unreported** state until a member manually adds them to a report, and reports must be submitted manually. Use this configuration if you do not want expenses to be automatically added to reports.

[Learn how to configure Submissions](/articles/new-expensify/workspaces/Workspace-Workflows#how-to-set-a-submission-frequency) on your workspace. 

---

## How to Set Up a Payment Account

To reimburse employees or pay invoices directly from Expensify, connect your business bank account.

1. Go to **Workflows**.
2. Toggle on **Payments**.
3. Click **Connect Bank Account** and follow the [bank connection guide](https://help.expensify.com/articles/new-expensify/expenses-and-payments/Connect-a-Business-Bank-Account).
4. Choose an **authorized expense payer**—a Workspace Admin who has access to the bank account and will be the default reimburser.

Learn how to [pay expenses submitted on a workspace](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Pay-Expenses#how-to-pay-expenses-submitted-to-a-workspace).

---

## How to enable Mark as Paid

If you reimburse employees through another method, such as payroll or cash, you can enable **Payments** without connecting a bank account. This allows you to use **Mark as Paid** to record reimbursements processed outside of Expensify.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace name > Workflows**.
2. Enable **Payments**.

Once enabled, you can use **Mark as Paid** to keep track of reimbursements made outside of Expensify.

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

