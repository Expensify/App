---
title: Gusto
description: Learn how to connect and sync employees between Gusto and Expensify automatically.
keywords: [Gusto, Expensify Classic, integration, HR sync, employee management]
---

<div id="expensify-classic" markdown="1">

Expensify's direct integration with Gusto helps automate employee management by:
- **Creating Expensify accounts** for new full-time employees upon hiring.
- **Updating approval workflows** in Expensify when changes occur in Gusto.
- **Deprovisioning employees** from Expensify upon their termination in Gusto.

---

# Prerequisites for Connecting with Gusto

Before connecting Expensify with Gusto, ensure the following:

- You must be an **admin** in both Gusto and Expensify.
- Your Expensify account must have a **paid group workspace** (Control or Collect).
- Each Gusto employee record must have an **email address** (preferably their work email).
- All employees will sync to **one Expensify workspace**—choose the appropriate one if you have multiple.

---

# Connect Expensify to Gusto

To set up the integration:

1. Navigate to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Scroll to **HR Integrations**, select **Connect with Gusto**, and click **Connect with Gusto**.
3. Log in to Gusto with your admin credentials and authorize Expensify.

---

# Configuring the Integration

Once connected, configure the approval workflow under **Settings > Workspaces > [Workspace Name] > Workflows**:

1. Choose an **Approval Workflow** mode:
   - **Basic Approval** – All reports go to a single final approver (default: Billing Owner).
   - **Manager Approval** (Control plan only) – Reports first go to the employee’s direct manager in Gusto, then to a final approver.
   - **Manual Configuration** (Control plan only) – Set up approval workflows manually in Expensify.
2. Click **Save** to sync employees.
3. If successful, a summary of synced employees appears. If employees are skipped, Expensify will provide reasons.

---

# FAQ

## Can I sync different employees to different Expensify workspaces?

No, Gusto syncs all employees to a **single** Expensify workspace. You must choose one workspace when connecting.

## Can I change the Approval Workflow mode later?

Yes, update it by:

1. Going to **Settings > Workspaces > [Workspace Name] > Workflows** and updating the Approval Mode.
2. Navigating to **Settings > Workspaces > [Workspace Name] > Accounting**, selecting **Configure** under Gusto, and saving the desired Approval Mode.

## Why do some employees have duplicate Expensify accounts?

Duplicate accounts occur if an employee's email in Expensify differs from that in Gusto. The integration imports employees based on their Gusto email.

**To fix this, employees should merge their accounts in Expensify:**
1. Go to **Settings > Account > Profile**.
2. Scroll to **Merge Accounts** and follow the steps.

</div>
