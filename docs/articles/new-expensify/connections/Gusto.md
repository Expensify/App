---
title: Gusto
description: Learn how to connect and sync employees between Gusto and Expensify from the HR page.
keywords: [New Expensify, Gusto, HR integration, employee sync, approval workflow, HR page]
---

Expensify's direct integration with Gusto helps automate employee management by:
- **Creating Expensify accounts** for new full-time employees upon hiring.
- **Updating approval workflows** in Expensify when changes occur in Gusto.
- **Deprovisioning employees** from Expensify upon their termination in Gusto.

---

# Prerequisites

Before connecting Gusto, ensure the following:
- You must be an **admin** in both Gusto and Expensify.
- Your Expensify account must have a **paid group workspace** (Control or Collect).
- Each Gusto employee record must have an **email address** (preferably their work email).
- All employees will sync to **one Expensify workspace** -- choose the appropriate one if you have multiple.

---

# Connect Gusto to Expensify

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **HR** in the left menu.
4. On the HR page, select **Connect with Gusto**, and click **Connect with Gusto**.
5. Log in to Gusto with your admin credentials and authorize Expensify.

---

# Configure the Approval Workflow

On the Gusto card on the HR page, choose an **Approval Workflow** mode:
- **Basic Approval** -- All reports go to a single final approver (default: Billing Owner).
- **Manager Approval** (Control plan only) -- Reports first go to the employee's direct manager in Gusto, then to a final approver.
- **Manual Configuration** (Control plan only) -- Set up approval workflows manually in Expensify.

Click **Save** to sync employees. If successful, a summary of synced employees appears. If employees are skipped, Expensify will provide reasons.

Once configured, the resulting approval chains are visible on the **Workflows** page under **Approvals**. To change the approval mode or final approver, return to the Gusto card on the **HR** page.

---

# FAQ

## Can I sync different employees to different Expensify workspaces?

No, Gusto syncs all employees to a **single** Expensify workspace. You must choose one workspace when connecting.

## Can I change the Approval Workflow mode later?

Yes. Go to the Gusto card on the **HR** page and select a different approval mode.

## Where do I see the approval chains?

The **Workflows** page displays the resulting approval chains, but links back to the **HR** page for configuration changes. This is the same behavior as [TriNet](https://help.expensify.com/articles/new-expensify/connections/TriNet).

## Why do some employees have duplicate Expensify accounts?

Duplicate accounts occur if an employee's email in Expensify differs from that in Gusto. The integration imports employees based on their Gusto email.

**To fix this, employees should merge their accounts in Expensify:**
1. Go to **Settings > Account > Profile**.
2. Scroll to **Merge Accounts** and follow the steps.
