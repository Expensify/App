---
title: TriNet
description: Learn how to integrate TriNet with Expensify to automatically sync employees and manage approvals from the HR page.
keywords: [New Expensify, TriNet, Zenefits, HR integration, employee sync, approval workflow, HR page]
---

Expensify's integration with TriNet automates employee management by syncing employee data and approval workflows. This ensures seamless expense management when onboarding, updating, or offboarding employees.

Once connected, the TriNet integration will:
- **Create Expensify accounts** for full-time, active employees when they're hired.
- **Update approval workflows** based on changes in TriNet.
- **Deactivate Expensify accounts** when employees are removed from TriNet.

---

# Prerequisites

Before connecting TriNet, ensure that:
- You are an **admin** in both TriNet and Expensify.
- You have a **Control** or **Collect** workspace in Expensify. If not, you'll have the option to upgrade during setup.
- Every employee in TriNet has a **work email address**, as this is used as the unique identifier in Expensify.
- TriNet will sync all employees to **one** Expensify workspace. If your company uses multiple workspaces, you can select which one to connect during setup.

---

# Connect TriNet to Expensify

## Step 1: Enable the Integration
1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **HR** in the left menu.
4. On the HR page, select **Connect to TriNet**, then click **Sync with TriNet**.
5. Log in to TriNet using your admin credentials.
6. Authorize Expensify to access your TriNet account.

**Note:** You can exclude specific users from syncing before authorizing the connection. TriNet appears alongside [Gusto](https://help.expensify.com/articles/new-expensify/connections/Gusto) on the HR page if both are available.

## Step 2: Configure the Approval Workflow
On the TriNet card on the HR page, choose the approval process that best fits your team:
- **Basic Approval:** Employees submit reports to one final approver (default: Workspace Billing Owner).
- **Manager Approval:** Reports first go to the employee's direct manager before a final approver (default: Workspace Billing Owner).
- **Manual Configuration:** Customize report submission manually. This option does **not** import manager data from TriNet.

Once configured, the resulting approval chains are visible on the **Workflows** page under **Approvals**. To change the approval mode or final approver, return to the TriNet card on the **HR** page.

---

# FAQ

## Will my employees receive a notification?
Yes, each employee will receive a welcome email at their work email address. This email includes account validation steps and a password setup link. Employees can also download the Expensify app for iOS and Android.

**Note:** The welcome email **cannot** be disabled.

## Should I set up the integration from Expensify or TriNet?
It's up to you! You'll have the same setup options regardless of whether you start the sync from Expensify or TriNet.

## Where do I change the approval mode or final approver?
Go to the TriNet card on the **HR** page. The **Workflows** page displays the resulting approval chains but links back to the HR page for configuration changes.
