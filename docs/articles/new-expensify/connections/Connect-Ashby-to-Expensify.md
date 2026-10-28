---
title: Connect Ashby to Expensify
description: Learn how to connect Ashby to your Expensify workspace, choose which candidates to import, and set their expense approver.
keywords: [New Expensify, Ashby, Ashby integration, connect Ashby, recruiting integration, ATS, applicant tracking system, import candidates, candidate reimbursement, Ashby candidates not importing, sync Ashby, disconnect Ashby, hiring manager approver, Recruiting, Import settings, Default approver]
internalScope: Audience is workspace admins on Control plans. Covers connecting Ashby through the Recruiting page, completing the initial setup, choosing which candidates to import, setting the candidate approval mode, managing Ashby syncs, and disconnecting Ashby. Does not cover other ATS integrations such as Greenhouse, HR integrations, or accounting integrations.
contentType: task
platform: new
---

# Connect Ashby to Expensify

Connect Ashby to your Expensify workspace to automatically import candidates so they can submit travel, relocation, and interview expenses for reimbursement. You choose which candidates to import once, and Expensify keeps the workspace in sync with daily candidate syncs.

Once connected, the integration can:

- Add Ashby candidates who match your import settings to your Expensify workspace.
- Set each candidate's expense approver, including their recruiter, hiring manager, or recruiting coordinator from Ashby.
- Automatically sync candidates every day.

---

## Who can connect Ashby to Expensify

To connect Ashby, you must:

- Be a workspace admin on a Control plan workspace in Expensify.
- Be an administrator in Ashby.
- Have **Recruiting** enabled under **More features** in the workspace.

To enable **Recruiting**, select **Workspaces > [workspace name] > More features**, and under **Integrate**, enable **Recruiting**. If your workspace is on the Collect plan, you'll be asked to upgrade to the Control plan. After you upgrade, **Recruiting** is enabled automatically.

You can connect only one applicant tracking system (ATS) to a workspace at a time.

You can connect and manage Ashby on web and mobile.

---

## How to connect Ashby to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Recruiting**.
2. Next to **Ashby**, select **Connect**.
3. In the connection window that opens, sign in with your Ashby administrator account and authorize Expensify to access your Ashby account.
4. When the connection completes, select **Complete setup** in the **Connected. Complete setup to import candidates.** message under **Ashby**. You can also select **More (⋮)** next to **Ashby**, then select **Complete setup**.
5. On the **Import settings** page, choose which candidates to import, then select **Save**.

After you connect, you'll see **Your connection is syncing**. The first connection can take some time. Nothing is imported until you choose which candidates to import and select **Save**.

---

## How to choose which Ashby candidates to import

The **Import settings** page controls which Ashby candidates are imported into the workspace. You must use **Job stages**, **Tags**, or both. **Offices** is optional and narrows the import further.

When more than one filter is enabled, a candidate must match all of them to be imported. Within a single filter, a candidate only needs to match one of the values you select. For example, if you select two tags, a candidate with either tag is imported.

1. On the **Recruiting** page, select **Import settings**.
2. Enable **Job stages**, **Tags**, or both:
   - **Job stages** – Import candidates in the job stages you choose.
   - **Tags** – Import candidates with the tags you choose.
3. Optionally, enable **Offices** to import only candidates in the offices you choose.
4. By default, enabling a filter selects every value. To choose specific values, select **Job stage**, **Tag**, or **Office**, choose the values you want, then select **Save**.
5. Select **Save**.

If you select **Save** without enabling **Job stages** or **Tags**, you'll see **Select at least one Job stage or Tag to continue**. Enabling **Offices** by itself isn't enough.

Saving your import settings starts a sync. If a candidate has more than one application in Ashby, they're imported as long as any one of their applications matches your filters. Candidates without an email address in Ashby are skipped.

---

## What happens after Ashby syncs candidates to Expensify

- Candidates who match your import settings are added to the workspace and appear on the **Members** page.
- Candidates who don't already have an Expensify account receive an email invitation to finish setting up their account.
- The Ashby connection displays the **Last synced** timestamp.
- Expensify checks Ashby about once a day for new matching candidates and updates candidate details to match Ashby.
- Expensify doesn't remove candidates automatically, even after they move to a different stage or have their tag removed in Ashby.

If you're on the **Recruiting** or **Members** page when a sync finishes, the **Ashby sync complete** screen shows the **Added** and **Skipped** candidate counts. Select **Skipped** to see why each candidate was skipped. This screen doesn't appear for syncs that finish in the background, such as the daily sync, or if you leave the page before the sync finishes.

---

## How to set the default approver for Ashby candidates

The **Default approver** setting controls who approves expenses for candidates imported from Ashby.

1. On the **Recruiting** page, select **Default approver**.
2. Choose an approval mode:
   - **Basic approval** – Choose a single approver. Select **Approver**, then choose a workspace member. You can't save until you choose an approver.
   - **Advanced approval** – A member of the candidate's hiring team in Ashby becomes their expense approver. Select **First approver**, then choose **Recruiter**, **Hiring manager**, or **Recruiting coordinator**. To add a second approval step, select **Final approver (optional)**, then choose a workspace member.
   - **Custom approval** – Manually set approvers in Expensify.
3. Select **Save**.

With **Advanced approval**, Expensify looks up the role you chose on the hiring team of each candidate's application in Ashby. Custom hiring team roles in Ashby aren't supported. If no one on the hiring team has the role you chose, the candidate's expenses go to the final approver. If you haven't set a final approver, they go to the workspace owner.

---

## What happens to approval workflows when you set an Ashby approval mode

When **Basic approval** or **Advanced approval** is selected:

- Ashby manages the workspace's approval workflows.
- You can't edit approval workflows on the **Workflows** page.
- To change approvers, update the **Default approver** setting on the **Recruiting** page.

When **Custom approval** is selected, you manage approval workflows manually on the **Workflows** page.

Learn more about [how to add approvals to a workspace](/articles/new-expensify/workspaces/Add-Approvals).

---

## How to manually refresh the Ashby sync

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Recruiting**.
2. Next to **Ashby**, select **More (⋮)**, then select **Sync now**.

Manual syncs are limited to two in 24 hours. If you've reached the limit, you'll see **Try again tomorrow**. The daily sync still runs as usual.

---

## How to disconnect Ashby from Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Recruiting**.
2. Next to **Ashby**, select **More (⋮)**, then select **Disconnect**.
3. Select **Disconnect** again to confirm.

Disconnecting Ashby stops future candidate syncs.

---

# FAQ

## Why is Ashby connected but no candidates were imported?

Connecting Ashby only authorizes the integration. To start importing candidates, select **Complete setup** under **Ashby**, enable **Job stages** or **Tags** on the **Import settings** page, and select **Save**. If the sync finishes but no candidates were added, check that your import settings match candidates in Ashby.

## Why wasn't a candidate imported from Ashby?

A candidate isn't imported if they don't have an email address in Ashby or don't match your import settings. On the **Ashby sync complete** screen, select **Skipped** to see each skipped candidate and the reason they were skipped.

## Why did a candidate's expenses go to the final approver instead of their hiring manager?

With **Advanced approval**, expenses go to the final approver, or to the workspace owner if no final approver is set, when no one on the candidate's hiring team in Ashby has the role you chose as **First approver**. To fix this, add someone with that role to the candidate's hiring team in Ashby.

## Can I connect Ashby and another ATS to the same workspace?

No. You can connect only one ATS to a workspace at a time. If you try to connect another, you'll see **Cannot connect to multiple ATS platforms**. Disconnect your current ATS first.

## Should I use a separate workspace for candidates?

We recommend a separate workspace for candidates. This lets you set up categories, tags, and approval workflows for candidates without changing the settings your employees use.

## Why can't I disable Recruiting in my workspace?

You must disconnect Ashby before you can disable **Recruiting** under **More features**.

## What if I don't see my ATS on the Recruiting page?

To request another ATS integration, select **Ask Concierge** on the **Recruiting** page.
