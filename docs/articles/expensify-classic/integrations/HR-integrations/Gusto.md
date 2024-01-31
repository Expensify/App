---
title: Gusto Integration
description: Automatically sync employees between Gusto and Expensify
---

# Overview

Expensify's direct integration with Gusto will automatically:

- **Create new Expensify accounts** for full-time, active employees when they're hired
- **Update the approval workflow in Expensify** based on any changes in Gusto
- **Deprovision an employee's Expensify account** upon Gusto termination date

# How to connect the Gusto integration
## Before connecting Expensify with Gusto, please review the prerequisites:

- You must be an admin in both Gusto and in Expensify to establish the integration
- You must have a paid group workspace in Expensify (i.e. a Control or Collect workspace)
- Every employee record in Gusto must have an email address, since that’s how each employee will sign into Expensify. We recommend that each employee's Gusto record use their work email address.
- Gusto will add all employees to one Expensify workspace, so if you have more than one workspace, you'll need to choose one to connect to Gusto

## To connect your Expensify workspace to Gusto:

1. Navigate to **Settings > Workspaces > _[Workspace Name]_ > Connections**
2. Scroll down to HR Integrations, click the **Connect with Gusto** radio button, then click the **Connect with Gusto** button
3. Login to your Gusto account using your Gusto admin credentials and authorize Expensify to access your Gusto account

## To configure the connection:

1. Select the Approval Workflow that works best for your team
    a. **Basic Approval** - Each employee will submit expense reports to one final approver. By default, the final approver is the workspace's Billing Owner in Expensify.
    b. **Manager Approval** - Expense reports will first be submitted to each employee's direct manager as listed in Gusto, and then forwarded to one final approver (the Expensify workspace's Billing Owner by default). This option is only available on the Control workspace plan.
    c. **Configure Manually** - Use the Members table to manually configure how employees submit reports. In this case, you're choosing to not import employee managers, and you will need to manually set and update the approval workflow for each employee. This option is only available on the Control workspace plan.
2. Click **Save** in the bottom right corner to sync employees into Expensify
3. If the connection is successful, you'll see a summary of how many employees were synced. If any employees were skipped, we'll tell you why.

{% include faq-begin.md %}
## Can I import different sets of employees into different Expensify workspaces?

No - Gusto will add all employees to one Expensify workspace, so if you have more than one workspace, you'll need to choose when connecting.

## Can I change the Approval Workflow mode after connecting?

Yes! You can change the Approval Workflow mode in two ways:

1. Go to **Settings > Workspaces >  _[Workspace Name]_ > Members**, then scroll down to Approval Mode below the list of workspace members
2. Go to **Settings > Workspaces >  _[Workspace Name]_ > Connections**, click Configure under Gusto, then select the desired Approval Mode and **Save**


## Why do my employees have duplicate Expensify accounts after I set up the Gusto integration?

If your employees are set up in Expensify with their company emails, but with their personal emails in Gusto, then they will end up with duplicate Expensify accounts after you connect the two systems. The Gusto integration imports users from Gusto using the emails entered in Gusto - if it's a different email from an existing account in Expensify, then a new, separate account will be created.

To resolve this, you can ask each affected employee to merge their existing Expensify account with the new Expensify account by navigating to **Settings > Account > Account Details** and scrolling down to **Merge Accounts**.


{% include faq-end.md %}
