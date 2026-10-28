---
title: Connect a Recruiting Integration to Expensify
description: Learn how to connect an applicant tracking system (ATS) to your Expensify workspace from the Recruiting page to import candidates and set their expense approvers.
keywords: [New Expensify, Recruiting, recruiting integration, ATS, applicant tracking system, connect ATS, import candidates, candidate reimbursement, Ashby, Greenhouse, Import settings, Default approver]
internalScope: Audience is workspace admins on Control plans. Covers the shared flow for connecting a supported ATS from the Recruiting page and which ATS platforms are supported. Does not cover provider-specific setup details (see the dedicated Ashby and Greenhouse articles), HR integrations, or accounting integrations.
contentType: task
platform: new
---

# Connect a Recruiting Integration to Expensify

Connect your applicant tracking system (ATS) to your Expensify workspace to automatically import candidates so they can submit travel, relocation, and interview expenses for reimbursement. You choose which candidates to import once, and Expensify keeps the workspace in sync with daily candidate syncs.

Once connected, a recruiting integration can:

- Add candidates who match your import settings to your Expensify workspace.
- Set each candidate's expense approver, including a member of their hiring team from your ATS.
- Automatically sync candidates every day.

You can connect only one ATS to a workspace at a time.

To sync employees from an HR system, use the **HR** page instead of the **Recruiting** page. Learn how to [connect an HR integration to Expensify](/articles/new-expensify/connections/Connect-an-HR-integration-to-Expensify).

---

## Who can connect a recruiting integration to Expensify

To connect a recruiting integration, you must:

- Be a workspace admin on a Control plan workspace in Expensify.
- Be an administrator in your ATS.
- Have **Recruiting** enabled under **More features** in the workspace.

To enable **Recruiting**, select **Workspaces > [workspace name] > More features**, and under **Integrate**, enable **Recruiting**. If your workspace is on the Collect plan, you'll be asked to upgrade to the Control plan. After you upgrade, **Recruiting** is enabled automatically.

You can connect and manage recruiting integrations on web and mobile.

---

## What ATS platforms you can connect to Expensify

The **Recruiting** page lists the ATS platforms you can connect:

- Ashby
- Greenhouse

Learn how to [connect Ashby to Expensify](/articles/new-expensify/connections/Connect-Ashby-to-Expensify) or [connect Greenhouse to Expensify](/articles/new-expensify/connections/Connect-Greenhouse-to-Expensify).

---

## How to connect a recruiting integration to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Recruiting**.
2. Next to your ATS, select **Connect**.
3. In the connection window that opens, sign in with your ATS administrator account and authorize Expensify to access your account.
4. When the connection completes, select **Complete setup** in the **Connected. Complete setup to import candidates.** message under your ATS. You can also select **More (⋮)** next to your ATS, then select **Complete setup**.
5. On the **Import settings** page, enable **Job stages**, **Tags**, or both, and optionally enable **Offices**. Then select **Save**.
6. On the **Recruiting** page, select **Default approver** and choose who approves candidate expenses.

Nothing is imported until you enable **Job stages** or **Tags** and select **Save**.

---

## What happens after you connect a recruiting integration to Expensify

- Candidates who match your import settings are added to the workspace and appear on the **Members** page.
- Candidates who don't already have an Expensify account receive an email invitation to finish setting up their account.
- The connection displays the **Last synced** timestamp.
- Expensify checks your ATS about once a day for new matching candidates and updates candidate details to match your ATS.
- Expensify doesn't remove candidates automatically.

---

# FAQ

## Can I connect more than one ATS to a workspace?

No. You can connect only one ATS to a workspace at a time. If you try to connect another, you'll see **Cannot connect to multiple ATS platforms**. Disconnect your current ATS first.

## Which hiring team roles can I use as the first approver?

It depends on your ATS. With Ashby, choose **Recruiter**, **Hiring manager**, or **Recruiting coordinator**. With Greenhouse, choose **Recruiter** or **Recruiting coordinator**.

## What if I don't see my ATS on the Recruiting page?

To request another ATS integration, select **Ask Concierge** on the **Recruiting** page.
