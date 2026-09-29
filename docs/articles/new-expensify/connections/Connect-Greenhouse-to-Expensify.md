---
title: Connect Greenhouse to Expensify
description: Learn how to connect Greenhouse to your Expensify workspace, choose which candidates to import, and set their expense approver.
keywords: [New Expensify, Greenhouse, Greenhouse integration, connect Greenhouse, recruiting integration, ATS, applicant tracking system, import candidates, candidate reimbursement, Greenhouse candidates not importing, sync Greenhouse, disconnect Greenhouse, Recruiting, Import settings, Default approver]
internalScope: Audience is Workspace Admins on Control plans. Covers connecting Greenhouse through the Recruiting page, completing the initial setup, choosing which candidates to import, setting the candidate approval mode, managing Greenhouse syncs, and disconnecting Greenhouse. Does not cover HR integrations, accounting integrations, or the legacy Greenhouse webhook integration in Expensify Classic.
contentType: task
platform: new
---

# Connect Greenhouse to Expensify

Connect Greenhouse to your Expensify workspace to automatically import candidates so they can submit travel, relocation, and interview expenses for reimbursement. You choose which candidates to import once, and Expensify keeps the workspace in sync with daily candidate syncs.

Once connected, the integration can:

- Add Greenhouse candidates who match your import settings to your Expensify workspace.
- Set each candidate's expense approver, including their recruiter or recruiting coordinator from Greenhouse.
- Automatically sync candidates every day.

---

## Who can connect Greenhouse to Expensify

To connect Greenhouse, you must:

- Be a Workspace Admin on a Control workspace in Expensify.
- Be an administrator in Greenhouse.
- Have **Recruiting** enabled under **More features** in the workspace.

To turn on **Recruiting**, go to **Workspaces** > [Workspace Name] > **More features**, and under **Integrate**, turn on **Recruiting**. If your workspace is on the Collect plan, you'll be asked to upgrade to Control. After you upgrade, **Recruiting** is turned on automatically.

You can connect only one applicant tracking system (ATS) to a workspace at a time.

---

## How to connect Greenhouse to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace you want to import candidates into.
3. In the left menu, select **Recruiting**.
4. Next to **Greenhouse**, click **Connect**.
5. In the connection window that opens, sign in with your Greenhouse administrator account and authorize Expensify to access your Greenhouse account.
6. When the connection completes, click **Complete setup** in the **Connected. Complete setup to import candidates.** message under **Greenhouse**. You can also select the three dots **(⋮)** next to **Greenhouse** and click **Complete setup**.
7. On the **Import settings** page, choose which candidates to import, then click **Save**.

<!-- SCREENSHOT:
Suggestion: The Recruiting page right after authorization, showing the Greenhouse row with the "Connected. Complete setup to import candidates." message and the Complete setup link.
Location: After step 6 of "How to connect Greenhouse to Expensify".
Purpose: Shows admins that the connection isn't finished yet and where to click to start importing candidates, which prevents "connected but nothing imported" questions.
-->

After you connect, you'll see **Your connection is syncing**. The first connection can take some time. Nothing is imported until you choose which candidates to import and click **Save**.

---

## How to choose which Greenhouse candidates to import

The **Import settings** page controls which Greenhouse candidates are imported into the workspace. You must use **Job stages**, **Tags**, or both. **Offices** is optional and narrows the import further.

When more than one filter is on, a candidate must match all of them to be imported. Within a single filter, a candidate only needs to match one of the values you select. For example, if you select two tags, a candidate with either tag is imported.

1. On the **Recruiting** page, click **Import settings**.
2. Turn on **Job stages**, **Tags**, or both:
   - **Job stages** – Import candidates in the job stages you choose.
   - **Tags** – Import candidates with the tags you choose.
3. Optionally, turn on **Offices** to import only candidates in the offices you choose.
4. By default, turning on a filter selects every value. To choose specific values, click **Job stage**, **Tag**, or **Office**, select the values you want, and click **Save**.
5. Click **Save**.

<!-- SCREENSHOT:
Suggestion: The Import settings page with Job stages and Tags turned on, Offices turned off, and the Job stage row showing a specific selected value instead of "All job stages".
Location: After step 5 of "How to choose which Greenhouse candidates to import".
Purpose: Clarifies the difference between turning on a filter (which selects every value) and opening the filter row to pick specific values, a common source of importing too many candidates.
-->

If you click **Save** without turning on **Job stages** or **Tags**, you'll see **Enable Job stages or Tags to continue**. Turning on **Offices** by itself isn't enough.

Saving your import settings starts a sync. If a candidate has more than one application in Greenhouse, they're imported as long as any one of their applications matches your filters. Candidates without an email address in Greenhouse are skipped.

---

## How to control when Greenhouse candidates get an Expensify invite

Combine a job stage and a tag so candidates don't get an Expensify invite before they hear from you.

1. In Greenhouse, create a tag called **Ready for Expensify**.
2. In Expensify, on the **Import settings** page, turn on **Job stages** and select **Onsite Interview**.
3. Turn on **Tags**, select **Ready for Expensify**, and click **Save**.

Then, for each candidate:

1. When a candidate reaches the **Onsite Interview** stage, email them to let them know they're moving forward.
2. After you've emailed them, add the **Ready for Expensify** tag to the candidate in Greenhouse.
3. On the next sync, Expensify imports the candidate and sends their invite.

Because candidates must match both the stage and the tag, no one is invited until you've tagged them.

---

## How to import Greenhouse candidates into different workspaces by office

If you use separate workspaces for different entities, use **Offices** to send each candidate to the workspace that exports to the right entity.

1. In each workspace, set up the same **Job stages** and **Tags** filters.
2. In the workspace that exports to your UK entity, turn on **Offices** and select **London**.
3. In the workspace that exports to your US entity, turn on **Offices** and select **New York**.

London candidates are imported only into the UK workspace, and New York candidates only into the US workspace.

---

## What happens after Greenhouse syncs candidates to Expensify

- Candidates who match your import settings are added to the workspace and appear on the **Members** page.
- Candidates who don't already have an Expensify account receive an email invitation to finish setting up their account.
- The Greenhouse connection displays the **Last synced** timestamp.
- Expensify checks Greenhouse about once a day for new matching candidates and updates candidate details to match Greenhouse.
- Expensify doesn't remove candidates automatically, even after they move to a different stage or have their tag removed in Greenhouse.

If you're on the **Recruiting** or **Members** page when a sync finishes, the **Greenhouse sync complete** screen shows the **Added**, **Removed**, and **Skipped** candidate counts. Click **Skipped** to see why each candidate was skipped. This screen doesn't appear for syncs that finish in the background, such as the daily sync, or if you leave the page before the sync finishes.

---

## How to set the default approver for Greenhouse candidates

The **Default approver** setting controls who approves expenses for candidates imported from Greenhouse.

1. On the **Recruiting** page, click **Default approver**.
2. Choose an approval mode:
   - **Basic approval** – Choose a single approver. Click **Approver** and select a workspace member. You can't save until you choose an approver.
   - **Advanced approval** – The candidate's recruiter or coordinator in Greenhouse becomes their expense approver. Click **First approver** and choose **Recruiter** or **Recruiting coordinator**. To add a second approval step, click **Final approver (optional)** and select a workspace member.
   - **Custom approval** – Manually set approvers in Expensify.
3. Click **Save**.

---

## What happens to approval workflows when you set a Greenhouse approval mode

When **Basic approval** or **Advanced approval** is selected:

- Greenhouse manages the workspace's approval workflows.
- You can't edit approval workflows on the **Workflows** page.
- To change approvers, update the **Default approver** setting on the **Recruiting** page.

When **Custom approval** is selected, you manage approval workflows manually on the **Workflows** page.

Learn more about [how to add approvals to a workspace](/articles/new-expensify/workspaces/Add-Approvals).

---

## How to manually refresh the Greenhouse sync

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to Greenhouse.
3. In the left menu, select **Recruiting**.
4. Next to **Greenhouse**, select the three dots **(⋮)**, then click **Sync now**.

Manual syncs are limited to two in 24 hours. If you've reached the limit, you'll see **Try again tomorrow**. The daily sync still runs as usual.

---

## How to disconnect Greenhouse from Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to Greenhouse.
3. In the left menu, select **Recruiting**.
4. Next to **Greenhouse**, select the three dots **(⋮)**, then click **Disconnect**.
5. Confirm by clicking **Disconnect** again.

Disconnecting Greenhouse stops future candidate syncs.

---

# FAQ

## Why is Greenhouse connected but no candidates were imported?

Connecting Greenhouse only authorizes the integration. To start importing candidates, click **Complete setup** under **Greenhouse**, turn on **Job stages** or **Tags** on the **Import settings** page, and click **Save**. If the sync finishes but no candidates were added, check that your import settings match candidates in Greenhouse.

## Why wasn't a candidate imported from Greenhouse?

A candidate isn't imported if they don't have an email address in Greenhouse or don't match your import settings. On the **Greenhouse sync complete** screen, click **Skipped** to see each skipped candidate and the reason they were skipped.

## Can I connect Greenhouse and another ATS to the same workspace?

No. You can connect only one ATS to a workspace at a time. If you try to connect another, you'll see **Cannot connect to multiple ATS platforms**. Disconnect your current ATS first.

## Should I use a separate workspace for candidates?

We recommend a separate workspace for candidates. This lets you set up categories, tags, and approval workflows for candidates without changing the settings your employees use.

## Why can't I turn off Recruiting in my workspace?

You must disconnect Greenhouse before you can turn off **Recruiting** under **More features**.

## What if I don't see my ATS on the Recruiting page?

To request another ATS integration, click **Ask Concierge** on the **Recruiting** page.
