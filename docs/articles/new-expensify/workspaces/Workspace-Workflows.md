---
title: Workspace Workflows
description: Configure your workspace approval and submission workflows to match your team's needs.
keywords: [New Expensify, workflows, approval workflows, delay submission, add approver, connect bank, workspace settings, submission frequency, authorized payer, mark as paid, payer]
internalScope: Audience is Workspace Admins. Covers configuring approval, submission, and reimbursement workflows including choosing an authorized payer; does not cover connecting a bank account.
---

Workflows help you automate how expenses are submitted, approved, and reimbursed in your workspace. Whether you're tracking personal expenses or managing a team, you can adjust workflows to match your use case.

**Note:** Workflows are available on **Collect** and **Control** workspaces. **Workspace Admins** can enable and configure all workflow settings. **People Admins** can configure the **Approvals** section, and **Payments Admins** can configure the **Payments** section. The **Submissions** section remains available to Workspace Admins only.

---

# Workspace Workflows

## How to enable Workflows 

To get started, enable the **Workflows** feature for your workspace.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **More Features**.
4. Under the **Spend** section, toggle on **Workflows**.

![Click Account Settings > Workspaces > click on the workspace]({{site.url}}/assets/images/submissions-01.png){:width="100%"}

![Click More Features > Enable Workflows]({{site.url}}/assets/images/submissions-02.png){:width="100%"}

---

## How to configure Workflow Settings

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

To reimburse employees or pay invoices directly from Expensify, connect your business bank account. Both **Workspace Admins** and **Payments Admins** can connect a bank account, set the authorized expense payer, and manage payment methods.

1. Go to **Workflows**.
2. Toggle on **Payments**.
3. Click **Connect Bank Account** and follow the [bank connection guide](https://help.expensify.com/articles/new-expensify/expenses-and-payments/Connect-a-Business-Bank-Account).
4. Choose an **authorized expense payer**—a Workspace Admin who has access to the bank account and will be the default reimburser.

Learn how to [pay expenses submitted on a workspace](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Pay-Expenses#how-to-pay-expenses-submitted-to-a-workspace).

---

## How to choose who pays currency conversion fees

For cross-border reimbursements, the **Currency conversion fees** setting in the **Payments** section controls whether your company or your employee absorbs the foreign exchange (FX) rate difference and conversion fee when a reimbursement is paid in a currency other than your workspace currency.

1. Go to **Workflows**.
2. Under **Payments**, set **Currency conversion fees** to one of the following:
   - **Company pays** — Your company absorbs the FX rate difference and conversion fee, so the employee receives the full intended amount in their local currency. Your business bank account is debited more than the report total to cover these costs.
   - **Employee pays** — The employee absorbs the FX rate difference and conversion fee, so the amount deposited into their account can be less than the report total.

Existing Global Reimbursement setups default to **Employee pays**. New Global Reimbursement setups default to **Company pays**.

**Note:** The auto-pay threshold under **Payments** applies to the report total and may not include currency conversion fees. When your company pays currency conversion fees, the amount debited from your business bank account can exceed the report total.

---

## How to enable Mark as Paid

If you reimburse employees through another method, such as payroll or cash, you can enable **Payments** without connecting a bank account. This allows you to use **Mark as Paid** to record reimbursements processed outside of Expensify.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace name > Workflows**.
2. Enable **Payments**.

Once enabled, you can use **Mark as Paid** to keep track of reimbursements made outside of Expensify.

---

## How to choose an authorized payer without a connected bank account

When **Payments** is enabled, you can set an **Authorized payer** even if no bank account is connected. The authorized payer is the admin responsible for paying reports, and they'll be the one prompted to pay.

1. In the navigation tabs (on the left on web, and on the bottom on mobile), click **Workspaces > [Workspace name] > Workflows**.
2. Under **Payments**, click **Payer**.
3. Select the **admin** you want to set as the authorized payer.

## What happens after you set an authorized payer

Only the authorized payer is prompted to pay reports. They'll see a payment reminder in their **Inbox** and a **Pay** button next to the workspace chat, while other admins won't receive those prompts. Other admins can still open a report and pay it.

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

