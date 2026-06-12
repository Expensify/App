---
title: Integrate Deel and Expensify
description: Learn how to integrate Expensify with Deel to automate expense syncing for employee reimbursements.
keywords: [New Expensify, integrate Deel Expensify, Expensify Deel integration, expense syncing Deel, reimbursements Deel Expensify, approval workflow Deel]
internalScope: Audience is Workspace Admins and Deel Organization Managers. Covers integrating Expensify with Deel and understanding how the sync works. Does not cover employee or contractor usage within Deel.
---

# Integrate Deel and Expensify

Expensify’s API allows you to integrate with tools like Deel to automate expense syncing and reimbursements.

This integration enables Expensify to act as the source of truth for employee expenses, while Deel handles reimbursement processing. The setup is self-serve and typically managed by your internal team.

To begin, review Expensify's [Integration Server Documentation](https://integrations.expensify.com/Integration-Server/doc/#introduction) to understand how Expensify’s API works and how to authenticate your account.

If you are an employee or contractor using Expensify within your company, refer to:

- [Employee Guide to Using Expensify with Deel](https://help.letsdeel.com/hc/en-gb/articles/7123572847761-Employee-s-Guide-to-Using-Expensify-With-Deel)
- [Contractor Guide to Using Expensify with Deel](https://help.letsdeel.com/hc/en-gb/articles/9640208314897-How-Contractors-Can-Use-Expensify-With-Deel)

---

## Who can integrate Deel and Expensify

- Workspace Admins in Expensify
- Organization Manager permissions  in Deel

**Prerequisites:**
- Deel Organization Manager permissions  
- Expensify Admin permissions for the selected Workspaces  

---

## How to integrate Deel and Expensify

The integration is configured using Expensify’s API and completed within Deel. For a step-by-step guide, refer to Deel's setup guide: [How To Set Up The Expensify Integration On Deel For EOR Employees And Contractors](https://help.letsdeel.com/hc/en-gb/articles/5871319525521-How-To-Set-Up-The-Expensify-Integration-On-Deel-For-EOR-Employees-And-Contractors).

---

## How the Deel integration with Expensify works

By connecting Expensify to Deel, you can use Expensify’s approval workflows to control which expenses are eligible for reimbursement.

- Deel scans for approved expenses from matched users in selected Workspaces  
- Only approved expenses in Expensify are eligible for syncing  
- Expenses are imported into Deel for reimbursement processing  

Key details:

- **One-way sync:** Expenses approved in Expensify sync to Deel. Expenses created in Deel do not sync back to Expensify.  
- **Approval workflow:** Only approved expenses are synced  
- **Sync timing:** Expense syncing is not immediate and depends on Deel processing  

---

## What happens after you integrate Deel and Expensify

- Deel continuously scans the connected Expensify Workspaces  
- Approved expenses are synced to Deel  
- Expenses are processed in Deel for reimbursement  
- Expensify remains the system of record for expense data  
- Sync timing may vary and is not immediate  

---

# FAQ

## Can expenses sync from Deel back to Expensify?

No. This is a one-way integration. Expenses only sync from Expensify to Deel.

## Why aren’t my expenses syncing?

Common reasons include:
- The expense is not approved in Expensify  
- The user is not mapped between Deel and Expensify  
- The Workspace is not connected  
- The integration setup is incomplete  

## Do employees or contractors need to do anything?

Employees and contractors submit expenses in Expensify as usual. Admins manage the integration and approval workflow.

## Does Expensify support the integration setup?

Expensify can help with basic troubleshooting, but your internal team is responsible for setting up and maintaining the API integration.

## Where can I learn more about the Deel setup process?

Review Deel’s official guide for setting up the Expensify integration and managing expense syncing: [How To Set Up The Expensify Integration On Deel For EOR Employees And Contractors](https://help.letsdeel.com/hc/en-gb/articles/5871319525521-How-To-Set-Up-The-Expensify-Integration-On-Deel-For-EOR-Employees-And-Contractors).
