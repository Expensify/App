---
title: Admin Offboarding Checklist 
description: Step-by-step guide for Workspace Admins to securely transfer billing, bank access, and admin roles when an admin leaves the company.
keywords: [New Expensify, admin offboarding, transfer billing, remove admin, Expensify Card, change bank account, Workspace Admin, Domain Admin, business bank account, billing owner, reimbursements]
internalScope: Audience is Workspace Admins and Domain Admins. Covers how to transition admin responsibilities, billing ownership, and shared financial access during offboarding. Does not cover individual member removal or personal account deletion.
---

# Admin Offboarding Checklist

If a key admin is leaving your company or changing roles, follow this checklist to prevent billing issues and maintain admin continuity. This is required if the person leaving is a:

- **Billing Owner**
- **Workspace Admin**
- **Domain Admin**
- **Bank Account Owner**

**Important:**  This checklist applies **only when a Workspace Admin or Domain Admin is being offboarded**.

**Important:** This checklist applies **only when a Workspace Admin or Domain Admin is being offboarded**.
 - All steps **must** be completed if the **sole Workspace Admin or billing owner** is leaving the company.

**Note:** If you're only taking over billing or payment management, follow [these steps to switch billing owners and add a payment account](https://help.expensify.com/articles/new-expensify/billing-and-subscriptions/Billing-Overview#how-to-transfer-billing-ownership). You don’t need the full checklist.

---

## How to assign a new Workspace Admin

If you’re a current Workspace Admin, follow these steps to give another person access before you leave.

1. [Invite the new admin to the workspace](https://help.expensify.com/articles/new-expensify/workspaces/Managing-Workspace-Members#invite-members-to-a-workspace).
2. [Assign them the Workspace Admin role](https://help.expensify.com/articles/new-expensify/workspaces/Managing-Workspace-Members#change-a-users-role).

 **Note:** The new Workspace Admin must be added to **all** company workspaces to keep billing under a single subscription. If the former admin retains ownership of any workspace, billing may split across separate subscriptions.

---
## How to assign a new Domain Admin

If your company uses SAML, the Domain Admin role must also be reassigned.

As a Domain Admin: 

1. In the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces**
2. Scroll to **Domains** and choose your domain.
3. Select **Domain admins**
4. Select **Add admin**, then enter the new admin’s email.  
5. Confirm that the new admin appears in the **Admins** list.  

**Note:**  
Domain Admins control company-wide permission, so this step is required before offboarding the previous Domain Admin.

## How to share a business bank account with a new Workspace Admin

If you’re the current bank account owner in Expensify, [share the bank account](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Share-a-Business-Bank-Account) with the new Workspace Admin or another Workspace Admin so they can continue reimbursements and payments.
Domain Admins control company-wide permissions, so this step is required before offboarding the previous Domain Admin.
---

## How to take over billing and payment responsibilities

If you’re the new Workspace Admin taking over billing and payment responsibilities, follow these steps to transfer workspace ownership and payment details. 

1. [Follow the steps to become the Billing Owner and add a payment method](https://help.expensify.com/articles/new-expensify/workspaces/Managing-Workspace-Members#transfer-workspace-ownership).
2. Make sure your payment details are valid to prevent service interruption.

 **Note:** The new Workspace Admin must transfer ownership of **all** company workspaces to consolidate billing under a single Billing Owner. If the former admin remains Billing Owner on any workspace, billing may split across multiple subscriptions.

---

## How to verify a shared business bank account

If the former Workspace Admin shared a business bank account with you, follow these steps to complete verification as a new Workspace Admin:

1. Wait 1–2 business days for test transactions (two withdrawals and one deposit) to appear.
2. In the navigation tabs (on the left on web, and at the bottom on mobile), choose **Account > Wallet**.
3. Enter the test transaction amounts to complete verification.

**Note:** Only the person who sees the test transactions in their bank can complete the verification.

---

## How to change the default Payer on a workspace

If you’re the new Workspace Admin, make sure reimbursements continue without interruption.

1.  In the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [workspace name] > Workflows**. 
2. Under **Payments**, confirm the correct payment account is selected. 
3. Under **Payer**, select a current Workspace Admin. 

---
   
## How to revoke the former Workspace Admin's access to a verified bank account

Once the shared bank account is verified by the new Workspace Admin, they can [revoke the previous admin’s access](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Unshare-a-Business-Bank-Account) to maintain secure control.

**Note:** If you can’t unshare the account because the previous admin is still the Expensify Card settlement account owner, contact Concierge or your Account Manager to update the ownership.

---

## How to update Workspace accounting integration credentials

As the new Workspace Admin, check that all integrations are reconnected under your integration system login.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting**.
2. Select the three dots **(⋮)** next to the integration name.
3. Choose **Disconnect**
4. Choose **Connect** to reconnect the integration under your own login credentials.

---

## How to remove or downgrade the previous Workspace or Domain Admin 

If the previous admin is staying with the company, you can simply change their role.  
If they’re leaving entirely, remove them completely.

- If they’re staying with the company, a Workspace Admin can:
  - [Change their role](https://help.expensify.com/articles/new-expensify/workspaces/Managing-Workspace-Members#change-a-users-role) to **Employee**.
- If they’re leaving, a Domain Admin can: 
  1. [Remove them from the workspace](https://help.expensify.com/articles/new-expensify/workspaces/Managing-Workspace-Members#remove-workspace-members).
  2. Fully close their account by [removing them from the domain](https://help.expensify.com/articles/new-expensify/domains/Manage-Domain-Members#how-to-close-or-deactivate-a-domain-members-account). 

---

By completing this checklist, you’ll ensure uninterrupted billing, secure financial access, and a smooth transition of admin duties.

---

# FAQ

## Do I need to complete this checklist if I only want to manage billing?

No. If you're only taking over billing and payment responsibilities, follow [these steps](https://help.expensify.com/articles/new-expensify/billing-and-subscriptions/Billing-Overview#how-to-transfer-billing-ownership) instead. The full checklist is only needed if an admin is leaving or changing roles.

## Who can verify a shared business bank account?

Only the person who sees the test transactions in their external bank account can complete verification. Once the account is shared, the new admin must wait for the transactions and verify them under **Account > Wallet**.

## Can I remove the previous admin before verifying the bank account?

No. Keep the previous admin’s access until the new admin has verified the shared bank account and updated billing and reimbursement settings.

## What happens if the admin leaves before this checklist is completed?

If the departing admin is removed too early, you may lose access to:
 - Workspace billing settings
 - Expensify Card settlement settings
 - Shared bank accounts
 - Accounting integrations

To recover access, another Domain Admin must step in or contact Concierge for help. We recommend completing this checklist before offboarding the admin.

## Can multiple people share access to a business bank account?

Yes. A verified business bank account can be shared with multiple Workspace Admins. This ensures more than one person can reimburse, pay bills, or act as reimburser.
## What's the difference between a Workspace Admin and a Domain Admin?
## What’s the Difference Between a Workspace Admin and a Domain Admin?
- **Domain Admins** manage company-wide permissions like SAML. 
- **Workspace Admins** manage billing, reimbursements, integrations, and member roles for a single workspace.  
- **Domain Admins** manage company-wide permissions like SAML. 

If you’re unsure which role applies to you, check your permissions under **Workspaces** or **Workspaces > Domains**.


