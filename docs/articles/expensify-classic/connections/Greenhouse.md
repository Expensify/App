---
title: Greenhouse-Integration.md
description: Learn how to integrate Greenhouse with Expensify to automatically send candidates for seamless reimbursement.
keywords: [Greenhouse, Expensify, integration, candidate reimbursement, workspace setup]
---

# Greenhouse Integration with Expensify

Expensify's integration with Greenhouse allows you to automatically send candidate details from Greenhouse to Expensify for easy reimbursement. You can also set the candidate's recruiter or recruiting coordinator as their expense approver.

---

## Prerequisites

Before setting up the integration, ensure you meet these requirements:

- You must be a **Workspace Admin** in Expensify and an **Admin** in Greenhouse with Developer Permissions.
- Each Greenhouse candidate record must include an **email address** (used as a unique identifier in Expensify).
- We recommend creating a **separate Expensify workspace for candidates** to customize workflows, Categories, and Tags independently from employees.

---

# Connecting Greenhouse to Expensify

## Step 1: Establish the Connection

1. Log into Expensify as a **Workspace Admin**.
2. Navigate to **Settings > Workspaces > _[Workspace Name]_ > Connections**.
3. Under **Greenhouse**, click **Connect to Greenhouse**.
4. Click **Sync with Greenhouse** to open the Greenhouse Integration instructions in a new tab.

## Step 2: Create the Web Hook

1. In the Greenhouse Integration instructions page, click the link under Step 1, or:
   - Log into Greenhouse.
   - Go to **Configure > Dev Center > Web Hooks > Web Hooks**.
2. Follow the Greenhouse Integration instructions to complete the web hook setup.

## Step 3: Create the Custom Candidate Field

1. In the Greenhouse Integration instructions page, click the link under Step 2, or:
   - Log into Greenhouse.
   - Navigate to **Configure > Custom Options > Custom Company Fields > Candidates**.
2. Follow the Greenhouse Integration instructions to create the custom candidate field.
3. Click **Finish** (Step 3 in the Greenhouse Integration instructions) to complete the integration.

---

# Sending Candidates from Greenhouse to Expensify

## In Greenhouse

1. Log into Greenhouse and open a candidate’s **Details** tab.
2. Ensure the **Email** field is populated.
3. (Optional) Select the **Recruiter** field to assign the candidate’s recruiter as their expense approver in Expensify.
   > **Note:** To set the **Recruiting Coordinator** as the default approver instead, contact **concierge@expensify.com** or your account manager.
4. Toggle the **Invite to Expensify** field to **Yes**, then click **Save**.

## In Expensify

1. Go to **Settings > Workspaces > Group > _[Workspace Name]_ > Members**.
2. The candidate should now appear in the workspace members list.
3. If the **Recruiter** (or **Recruiting Coordinator**) field was selected in Greenhouse, the candidate will submit expense reports to that approver.  
   - If no approver was selected, the candidate will follow the default Expensify workspace approval workflow.

---

# FAQ

## What happens if a candidate doesn’t have an email address in Greenhouse?
The candidate will not be sent to Expensify, as an email is required as their unique identifier.

## Can I change the default expense approver later?
Yes. Contact **concierge@expensify.com** or your account manager to modify the default approver settings.

## What if I want candidates to use different Categories or Tags than employees?
We recommend setting up a **separate Expensify workspace** for candidates to configure a customized workflow.
