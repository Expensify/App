---
title: TriNet
description: Learn how to integrate TriNet with Expensify to automatically sync employees and manage approvals.
keywords: [Expensify Classic, TriNet, Zenefits, Expensify, HR integration, employee sync, approval workflow]
---

Expensify's integration with TriNet automates employee management by syncing employee data and approval workflows. This ensures seamless expense management when onboarding, updating, or offboarding employees.

Once connected, the TriNet integration will:
- **Create Expensify accounts** for full-time, active employees when they’re hired.
- **Update approval workflows** based on changes in TriNet.
- **Deactivate Expensify accounts** when employees are removed from TriNet.

---

# Prerequisites

Before connecting Expensify with TriNet, ensure that:
- You are an **admin** in both TriNet and Expensify.
- You have a **Control** or **Collect** workspace in Expensify. If not, you’ll have the option to upgrade during setup.
- Every employee in TriNet has a **work email address**, as this is used as the unique identifier in Expensify.
- TriNet will sync all employees to **one** Expensify workspace. If your company uses multiple workspaces, you can select which one to connect during setup.

---

# Connect TriNet to Expensify

## Step 1: Enable the Integration
1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Under **HR Integrations**, select **Connect to TriNet**, then click **Sync with TriNet**.
3. Log in to TriNet using your admin credentials.
4. Authorize Expensify to access your TriNet account.

**Note:** You can exclude specific users from syncing before authorizing the connection.

## Step 2: Configure the Approval Workflow
1. Choose the approval process that best fits your team:
   - **Basic Approval:** Employees submit reports to one final approver (default: Workspace Billing Owner).
   - **Manager Approval:** Reports first go to the employee’s direct manager before a final approver (default: Workspace Billing Owner).
   - **Manual Configuration:** Customize report submission manually. This option does **not** import manager data from TriNet.

---

# FAQ

## Will my employees receive a notification?
Yes, each employee will receive a welcome email at their work email address. This email includes account validation steps and a password setup link. Employees can also download the Expensify app for iOS and Android.

**Note:** The welcome email **cannot** be disabled.

## Should I set up the integration from Expensify or TriNet?
It’s up to you! You’ll have the same setup options regardless of whether you start the sync from Expensify or TriNet.

