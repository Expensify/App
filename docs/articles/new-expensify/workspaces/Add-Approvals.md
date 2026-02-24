---
title: Add Approvals
description: Require report approvals in your Expensify workspace, including setting approval thresholds and over-limit approvers.
keywords: [New Expensify, approvals, report approvals, approving reports, approval workflow, workspace workflows, approver, final approver, approval chain, approval threshold, approval limit, over-limit approval, report amount limit, dollar limit approver]
---

Each Expensify workspace can be configured to require additional approvals for reports before payments are authorized. When approvals are enabled, admins can set a default approval workflow for all members or create custom workflows for individual members.

Once a member submits a report, it must be approved by each person in their workflow before it can be paid. You can also add an additional approver that is only required when a report exceeds a specific dollar amount.

---

# Enable Approvals for a Workspace

To enable approvals on a workspace you manage:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your workspace name to access the settings for that workspace.
3. In the left menu, click **Workflows**.
4. Toggle on **Add approvals**.

Enabling **Add approvals** will reveal an option to set a default approval workflow for the workspace.

---

# Configure Approval Workflows

Set up default or custom approval workflows to route expenses through one or more approvers before they're paid. Default approval workflows are available on both Collect and Control plans, but custom workflows for specific members require the Control plan.

## Set the Default Approval Workflow

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your workspace name to access the settings for that workspace.
3. In the left menu, click **Workflows**.
4. Under **Expenses from Everyone**, click **Approver**.
5. Choose the first approver from the list of workspace members.
6. (Optional) Set an additional approval when a report exceeds a specific amount:
 - Enter a dollar amount in the Report amount field.
 - Select an Additional approver who should approve reports that exceed this amount. This adds another approval level and does not replace the existing approver.
7. Under **Additional approver**, continue adding members as needed. 
8. Click **Save**.

**Note:** When approvals are enabled, a default workflow is required for the workspace.

## Set a Custom Workflow for Specific Members

1. Navigate to **Workspaces > [Workspace Name] > Workflows**.
2. Under **Add approvals**, click **Add approval workflow**.
3. Choose the member whose expenses should have a custom workflow.
4. Click **Next**.
5. Select the first approver for their expenses.
6. (Optional) Set an additional approval when a report exceeds a specific amount:
 - Enter a dollar amount in the Report amount field.
 - Select an Additional approver who should approve reports that exceed this amount. This adds another approval level and does not replace the existing approver.
7. Click **Next**.
8. Use **Additional approver** to add more approvers.
9. Click **Add workflow** to save.

**Note:** Custom workflows are only available on the Control plan. To enable custom workflows, upgrade to the Control plan in Settings > Billing & Subscriptions.

---

## Edit or Delete Approval Workflows

You can update or remove approval workflows at any time as your team or process changes.

## Edit a Workflow

1. On the **Workflows** page, click the workflow you want to update.
2. Click the **Approver** field you want to change.
3. Select a new member or deselect one to remove them.
4. Click **Save**.

## Delete a Workflow

1. On the **Workflows** page, click the workflow you want to delete.
2. Click **Delete**.
3. In the confirmation window, click **Delete** again.

---

# FAQ

## Can an employee have more than one approval workflow applied to them?

No. Each employee can only be assigned one approval workflow per workspace.

## How can I assign custom approval workflows to specific members?

You’ll need to be on the Control plan, as this feature isn’t available on Collect.

## What happens when a report exceeds the over-limit threshold?

If a report exceeds the configured dollar amount in the Report amount field, it is automatically forwarded to the selected Additional approver for another review step.
