---
title: Zenefits Integration
description: Automatically sync employees between Zenefits and Expensify
---
# How the Zenefits integration works with Expensify

Expensify's direct integration with Zenefits will automatically:
- **Create new Expensify accounts** for full-time, active employees when they're hired
- **Update the approval workflow in Expensify** based on any changes in Zenefits
- **Deprovision an employee's Expensify account** upon Zenefits termination date

# How to connect the Zenefits integration
## Before connecting Expensify with Zenefits, please review the prerequisites:

- You must be an admin in Zenefits and in Expensify to establish the integration
- You must have a Control or Collect workspace in Expensify to integrate with Zenefits. If you do not, you'll be given the opportunity to upgrade to Control or Collect during the integration setup.
- Every employee record in Zenefits must have a work email address since we use this as the unique identifier in Expensify. 
- Zenefits will add all your employees to one Expensify workspace. If your company uses multiple Expensify workspaces, you'll be given the option to choose which workspace to connect to when you're setting up the integration.

## To connect your Expensify workspace to Zenefits:

1. Navigate to **Settings > Workspaces > Group > _[Workspace Name]_ > Connections**
2. Scroll down to HR Integrations, click the **Connect to Zenefits** radio button, then click **Sync with Zenefits**
3. Login to your Zenefits account using your Zenefits admin credentials and authorize Expensify to access your Zenefits account.
4. If you want to exclude an individual user from syncing with Expensify, make your selections before clicking **Authorize**

## To configure the connection:

1. Select the Approval Workflow that works best for your team:
    - **Basic Approval:** Each employee will submit expense reports to one final approver. By default, the final approver is the workspace's Billing Owner.
    - **Manager Approval:** Expense reports will first be submitted to each employee's direct manager, and then forwarded to one final approver. By default, the final approver is the workspace's Billing Owner.
    - **Configure Manually:** Use the members table to manually configure how employees submit reports. In this case, you're choosing to not import an employee's manager. You will need to set and update the approval workflow for each employee manually. If your team has a highly complex approval workflow, this option will allow for multi-tiered approval chains.

# Zenefit integration FAQs
## Will this notify my employees?
Each employee will receive a welcome email at their work email address along with a request to validate their account and choose a password. They can also download our mobile app for iOS and Android devices. Please note that there is no way to disable the welcome email.

## Should I connect the integration from Expensify or from Zenefits?
It's totally up to you! You'll have the same options available to you when syncing from either product.
