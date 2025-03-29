---
title: Zenefits-Integration.md
description: Learn how to integrate Zenefits with Expensify to automatically sync employees and manage approvals.
keywords: [Zenefits, Expensify, HR integration, employee sync, approval workflow]
---
<div id="expensify-classic" markdown="1">

Expensify's integration with Zenefits automates employee management by syncing employee data and approval workflows. This ensures seamless expense management when onboarding, updating, or offboarding employees.

# How the Zenefits Integration Works

Once connected, the Zenefits integration will:
- **Create Expensify accounts** for full-time, active employees when they’re hired.
- **Update approval workflows** based on changes in Zenefits.
- **Deactivate Expensify accounts** when employees are removed from Zenefits.

# Prerequisites

Before connecting Expensify with Zenefits, ensure that:
- You are an **admin** in both Zenefits and Expensify.
- You have a **Control** or **Collect** workspace in Expensify. If not, you’ll have the option to upgrade during setup.
- Every employee in Zenefits has a **work email address**, as this is used as the unique identifier in Expensify.
- Zenefits will sync all employees to **one** Expensify workspace. If your company uses multiple workspaces, you can select which one to connect during setup.

# How to Connect Zenefits to Expensify

## Step 1: Enable the Integration
1. Go to **Settings > Workspaces > Group > _[Workspace Name]_ > Connections**.
2. Under **HR Integrations**, select **Connect to Zenefits**, then click **Sync with Zenefits**.
3. Log in to Zenefits using your admin credentials.
4. Authorize Expensify to access your Zenefits account.

**Note:** You can exclude specific users from syncing before authorizing the connection.

## Step 2: Configure the Approval Workflow
1. Choose the approval process that best fits your team:
   - **Basic Approval:** Employees submit reports to one final approver (default: Workspace Billing Owner).
   - **Manager Approval:** Reports first go to the employee’s direct manager before a final approver (default: Workspace Billing Owner).
   - **Manual Configuration:** Customize report submission manually. This option does **not** import manager data from Zenefits.

# FAQ

## Will my employees receive a notification?
Yes, each employee will get a **welcome email** at their work email address. This email includes account validation steps and a password setup link. Employees can also download the Expensify app for iOS and Android.

**Note:** The welcome email **cannot** be disabled.

## Should I set up the integration from Expensify or Zenefits?
It’s up to you! You’ll have the same setup options regardless of whether you start the sync from Expensify or Zenefits.

</div>
