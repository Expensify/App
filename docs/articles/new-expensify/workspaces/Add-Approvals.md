---
title: Add Approvals
description: Require report approvals in your Expensify workspace, including setting approval thresholds and over-limit approvers.
keywords: [New Expensify, approvals, report approvals, approving reports, approval workflow, workspace workflows, approver, final approver, approval chain, approval threshold, approval limit, over-limit approval, report amount limit, dollar limit approver, reassign approver, automatic approver reassignment, change approver workflow, automatic approval, approval audit, category approver, tag approver, category rules, tag rules, invite member to approval workflow, invite new user approval workflow, disable approvals, approvals toggle locked, can't turn off approvals, Smart Limit, Expensify Card limit type]
---

Each Expensify workspace can be configured to require additional approvals for reports before payments are authorized. When approvals are enabled, admins can set a default approval workflow for all members or create custom workflows for individual members.

**Note:** Workspace Admins and People Admins can enable and configure approval workflows, including default and custom workflows, over-limit approvers, and approver assignment.

Once a member submits a report, it must be approved by each person in their workflow before it can be paid. You can also add an additional approver that is only required when a report exceeds a specific dollar amount.

---

# Enable Approvals for a Workspace

To enable approvals on a workspace you manage:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your workspace name to access the settings for that workspace.
3. In the left menu, click **Workflows**.
4. Toggle on **Approvals**.

Enabling **Approvals** will reveal an option to set a default approval workflow for the workspace.

**Note:** If your workspace is connected to an HR integration such as Gusto or TriNet, approval workflows managed through that integration appear on the **Workflows** tab with the integration's indicator. To manage these approval settings, go to the **HR** tab in your workspace settings. [Learn about connecting Gusto to Expensify](/articles/new-expensify/connections/Connect-Gusto-to-Expensify) or [learn about connecting TriNet to Expensify](/articles/new-expensify/connections/TriNet).

---

## How to turn off Approvals when Expensify Cards use a Smart Limit

An Expensify Card with a **Smart Limit** restores the cardholder's available spend as their expenses are approved, so approvals must stay on for those cards to work. While any card in the workspace uses a **Smart Limit**, the **Approvals** toggle is locked on and the **Workflows** page shows this message in place of the usual description:

> Expensify Cards from this workspace currently rely on approval to define their Smart Limits. Please amend the limit types of any Expensify Cards with Smart Limits before disabling approvals.

To unlock the toggle:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your workspace name to access the settings for that workspace.
3. In the left menu, click **Expensify Card**.
4. Click each card that uses a **Smart Limit** and change its limit type, or deactivate the card.
5. In the left menu, click **Workflows**. You can now toggle off **Approvals**.

This lock applies to both Workspace Admins and People Admins, and it applies no matter who issued the cards.

Learn how to [issue and manage Expensify Cards](/articles/new-expensify/expensify-card/Set-Up-and-Manage-the-Expensify-Card-US).

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
2. Under **Approvals**, click **Add approval workflow**.
3. On the **Expenses from** page, choose the member whose expenses should have a custom workflow. To route expenses from someone who isn't a workspace member yet, type their email address and select them from the list.
4. Click **Next**. If you selected someone who isn't a workspace member, the **Invite new member** screen appears. Click **Invite** to add them to the workspace and continue.
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

**Note:** When you change an approver in a workflow, any Outstanding reports assigned to the approver you replaced are reassigned to the new approver. A system message appears in the report confirming the reassignment. Reports are also reassigned when you remove an approver from the workspace or shorten an approval chain. Some reports are intentionally excluded — see the FAQ below for the full list of triggers and exclusions.

## Delete a Workflow

1. On the **Workflows** page, click the workflow you want to delete.
2. Click **Delete**.
3. In the confirmation window, click **Delete** again.

---

## Enable Concierge to auto-approve compliant reports

Concierge can automatically approve reports that don't exceed a specific threshold and don't contain violations.

## Set the auto-approve threshold

1. On the **Workflows** page, click the **Auto-approve compliant reports** toggle.
2. Click **Auto-approve reports with all expenses under**
3. Enter the maximum amount a report can have before requiring manual approval.
4. Click **Save**.

## Set a random audit percentage

Even with auto-approvals enabled, you can route a percentage of compliant reports for manual approval.

1. On the **Workflows** page, click **Random report audit**.
2. Enter your desired percentage amount.
3. Click **Save**.

**Note:** Custom auto-approval settings are only available on the Control plan. Collect plans will have a $100 auto-approval threshold and 0% random audit percentage. 

---

# Set Category and Tag approvers

In addition to the workspace approval workflow, Control plan workspaces can assign an approver to a specific **Category** or **Tag**. When a report contains an expense that uses one of these categories or tags, the report is routed to the Category and Tag approvers *before* it continues through the workspace's normal approval workflow.

The approval order is:

1. **Category approver(s)** – approve first.
2. **Tag approver(s)** – approve next.
3. **Workspace workflow approver(s)** – the default or custom workflow you configured above runs last.

Category and Tag approvers are added to the approval chain — they don't replace the workflow approvers. To set them up, see:

- [Create expense categories](/articles/new-expensify/workspaces/Create-expense-categories) (Category Rules > Approver)
- [Create and manage expense tags](/articles/new-expensify/workspaces/Create-and-manage-expense-tags) (Tag Rules > Approver)

---

# FAQ

## Can an employee have more than one approval workflow applied to them?

No. Each employee can only be assigned one approval workflow per workspace.

## Why did adding an approver to one workflow change other members' workflows?

Approval routing is built from per-approver relationships, not separate paths for each submitter. When you place someone *after* an approver in a workflow, you're defining who that approver forwards their approvals to — and that applies to **every** report they approve, not just one submitter's.

For example, if Joe is the first approver for several members and you set up a workflow of **John → Joe → Jane**, you're telling Expensify that "Joe forwards to Jane." Because Joe also approves for other members, their reports will now route to Jane after Joe approves them too.

This is why you may see the following warning when editing a workflow:

> This member already belongs to another approval workflow. Any updates here will reflect there too.

Deleting and recreating the workflow won't change this, because the limitation is tied to the shared approver's forwarding rather than to any one submitter's workflow.

To keep a second-level approver limited to a single submitter, that submitter's first approver must be unique to their chain — that is, not shared as an approver for any other member. If your goal is instead to add an extra review step only when a report exceeds a certain amount, use the workflow-specific over-limit **Additional approver** (set in the **Report amount** field), which applies only to that workflow.

## How can I assign custom approval workflows to specific members?

You’ll need to be on the Control plan, as this feature isn’t available on Collect.

## What happens to pending reports when I change an approver?

Outstanding reports are automatically reassigned to the new approver, with no prompt or confirmation required. A system message appears in each report indicating the approver was reassigned. This applies to reports that are already in the approval process, not just new reports, and it happens in these situations:

- **You change an approver in a workflow:** reports pending with the previous approver move to the new approver.
- **You remove an approver from the workspace:** if you remove a member who is an approver on pending reports, those reports are reassigned to the **workspace owner**.
- **You shorten an approval chain:** if you remove a downstream approver from a chain, reports already partway through move to the appropriate remaining approver. For example, in an Alice → Bob → Claire chain where Bob has already approved and you remove Claire, the report returns to Bob for final approval.
- **The workflow changes through an integration:** the same reassignment happens when the workflow changes through an HR integration such as Gusto or TriNet, or through a bulk member update. In that case, the report's system message indicates the change came from the integration rather than from a specific person.

## Are there cases where reports are not automatically reassigned?

Yes. Reports are not automatically reassigned in these cases:

- **The current approver is a Category or Tag approver:** reports awaiting a Category or Tag approver are not reassigned. Those approval steps run before, and take precedence over, the workspace approval workflow.
- ​**The report already moved past the approver you changed:** If it's further along the approval chain, it stays where it is.
- **​You changed the default workspace approver, but the employee has their own approver set:**​ Employees with a specific approver aren't affected by default-approver changes; only employees using the default are.

## Why can't I toggle off Approvals?

At least one Expensify Card in the workspace uses a **Smart Limit**. Those cards depend on approvals to restore the cardholder's available spend, so **Approvals** stays locked on until you change the limit type on every card that uses a **Smart Limit** or deactivate those cards.

## Why can't I choose Smart Limit when I issue an Expensify Card?

**Approvals** is turned off for the workspace. Turn on **Approvals** on the **Workflows** page first, then issue the card.

## What happens when a report exceeds the over-limit threshold?

If a report exceeds the configured dollar amount in the Report amount field, it is automatically forwarded to the selected Additional approver for another review step.
