---
title: Connect a recruiting integration to Expensify
description: Learn how to connect Greenhouse to your Expensify workspace to automatically import candidates, choose which candidates to import, and set their expense approver.
keywords: [New Expensify, recruiting integration, connect recruiting, Greenhouse, ATS, applicant tracking system, import candidates, candidate reimbursement, Recruiting, Import settings, Default approver]
internalScope: Audience is Workspace Admins on Control plans. Covers connecting Greenhouse through the Recruiting page, choosing which candidates to import, setting the candidate approval mode, and managing candidate syncs. Does not cover HR integrations, accounting integrations, or the legacy Greenhouse webhook integration in Expensify Classic.
---

# Connect a recruiting integration to Expensify

Connect your applicant tracking system (ATS) to your Expensify workspace to automatically import candidates so they can submit travel, relocation, and interview expenses for reimbursement. You choose which candidates to import once, and Expensify keeps the workspace in sync. Candidates are added when they match your import settings and removed when they no longer match, so you don't have to add or remove candidates by hand.

Once connected, a recruiting integration can:

- Add candidates who match your import settings to your Expensify workspace.
- Set each candidate's expense approver, including their recruiter or recruiting coordinator from your ATS.
- Remove candidates from the workspace when they no longer match your import settings.
- Automatically sync candidates every day.

You can connect only one ATS to a workspace at a time.

---

## Who can connect a recruiting integration to Expensify

To connect a recruiting integration, you must:

- Be a Workspace Admin on a Control workspace in Expensify.
- Be an administrator in your ATS.
- Have **Recruiting** enabled under **More features** in the workspace.

Each candidate needs an email address in your ATS. Candidates without one can't be imported.

---

## What recruiting integrations you can connect to Expensify

The **Recruiting** page lists the ATS providers you can connect. Currently, you can connect:

- Greenhouse

If you don't see your ATS on the **Recruiting** page, click **Ask Concierge** to request it.

---

## How to enable Recruiting in a workspace

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the workspace you want to import candidates into.
3. In the left menu, select **More features**.
4. Under **Integrate**, turn on **Recruiting**.

If your workspace is on the Collect plan, you'll be asked to upgrade to Control to use **Recruiting**. After you upgrade, **Recruiting** is turned on automatically.

---

## How to connect a recruiting integration to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the workspace you want to import candidates into.
3. In the left menu, select **Recruiting**.
4. Next to your ATS, click **Connect**.
5. In the connection window that opens, sign in with your ATS administrator account and authorize Expensify to access your account.
6. Wait for the connection to complete. The provider then displays **Connected. Complete setup to import candidates.**
7. Click **Complete setup** in that message, or select the three dots **(⋮)** next to the provider and click **Complete setup**.
8. Choose which candidates to import, then click **Save**.

> **Note:** After you connect, you'll see a **Your connection is syncing** message. The first connection can take some time to complete.

Nothing is imported until you choose which candidates to import and click **Save**.

---

## How to choose which candidates to import from your recruiting integration

The **Import settings** page controls which candidates are imported into the workspace. You must turn on **Job stages** or **Tags** before you can save. **Offices** is optional and narrows the import further.

1. On the **Recruiting** page, click **Import settings**.
2. Turn on one or more of the following:
   - **Job stages** – Import candidates in the job stages you choose.
   - **Tags** – Import candidates with the tags you choose.
   - **Offices** – Import only candidates in the offices you choose.
3. By default, turning on a filter selects every value. To choose specific values, click **Job stage**, **Tag**, or **Office**, select the values you want, and click **Save**.
4. Click **Save**.

If you click **Save** without turning on **Job stages** or **Tags**, you'll see **Enable Job stages or Tags to continue**. Turning on **Offices** by itself isn't enough.

Saving your import settings starts a sync. If a candidate has more than one application in your ATS, Expensify uses their most recent application to decide whether they match.

---

## How to set the approver for candidates imported from your recruiting integration

The **Default approver** setting controls who approves expenses for candidates imported from your ATS.

1. On the **Recruiting** page, click **Default approver**.
2. Choose an approval mode:
   - **Basic approval** – Choose a single approver. Click **Approver** and select a workspace member. You can't save until you choose an approver.
   - **Advanced approval** – The candidate's recruiter or coordinator becomes their expense approver. Click **First approver** and choose **Recruiter** or **Recruiting coordinator**. To add a second approval step, click **Final approver (optional)** and select a workspace member.
   - **Custom approval** – Manually set approvers in Expensify.
3. Click **Save**.

With **Basic approval** or **Advanced approval**, your ATS manages the workspace's approval workflows, and you can't edit them on the **Workflows** page. To change approvers, update the **Default approver** setting on the **Recruiting** page. Learn more about [how to add approvals to a workspace](/articles/new-expensify/workspaces/Add-Approvals).

---

## What happens after you connect a recruiting integration to Expensify

After each sync finishes:

- A sync complete screen opens, such as **Greenhouse sync complete**, with the **Added**, **Removed**, and **Skipped** candidate counts. Click **Skipped** to see each skipped candidate and the reason they were skipped, then click **Got it** to close the screen.
- The connection displays the **Last synced** timestamp.
- Candidates who match your import settings are added to the workspace and appear on the **Members** page.
- Candidates who don't already have an Expensify account receive an email invitation to finish setting up their account.

Expensify also runs a daily auto-sync to keep candidates up to date:

- New candidates who match your import settings are added to the workspace.
- Candidate details are updated to match your ATS.
- Candidates who no longer match your import settings are removed from the workspace automatically.

---

## How to sync your recruiting integration manually

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the workspace connected to your ATS.
3. In the left menu, select **Recruiting**.
4. Next to the connected provider, select the three dots **(⋮)**, then click **Sync now**.

You can sync manually up to two times in 24 hours. If you've reached the limit, you'll see **Try again tomorrow**. The daily auto-sync still runs as usual.

---

## How to disconnect a recruiting integration from Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the workspace connected to your ATS.
3. In the left menu, select **Recruiting**.
4. Next to the connected provider, select the three dots **(⋮)**, then click **Disconnect**.
5. Confirm by clicking **Disconnect** again.

Disconnecting a recruiting integration stops future candidate syncs.

---

# FAQ

## Why is my recruiting integration connected but no candidates were imported?

Connecting authorizes the integration. To start importing candidates, click **Complete setup** on the provider, turn on **Job stages** or **Tags** on the **Import settings** page, and click **Save**. If the sync finishes but no candidates were added, check that your import settings match candidates in your ATS.

## Why wasn't a candidate imported from my recruiting integration?

A candidate isn't imported if they don't have an email address in your ATS or don't match your import settings. After a sync, click **Skipped** on the sync complete screen to see why each candidate was skipped.

## Why was a candidate removed from my workspace?

Candidates are removed automatically when they no longer match your import settings, for example, when they move to a job stage you didn't select.

## Can I connect more than one recruiting integration to a workspace?

No. You can connect only one ATS to a workspace at a time. If you try to connect another, you'll see **Cannot connect to multiple ATS platforms**. Disconnect your current ATS first.

## Should I use a separate workspace for candidates?

We recommend a separate workspace for candidates. This lets you set up categories, tags, and approval workflows for candidates without changing the settings your employees use.

## Why can't I turn off Recruiting in my workspace?

You must disconnect your ATS before you can turn off **Recruiting** under **More features**.

## What's the difference between the Recruiting and HR pages?

The **Recruiting** page connects an ATS and imports candidates. The **HR** page connects an HR system and imports employees. Learn more about [how to connect an HR integration to Expensify](/articles/new-expensify/connections/Connect-an-HR-integration-to-Expensify).
