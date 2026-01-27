---
title: Admin Offboarding Checklist in Expensify
description: Step-by-step instructions to transition billing, bank access, and admin roles when a Workspace Admin or Domain Admin leaves the company.
keywords: [Expensify Classic, admin offboarding, transfer billing, remove admin, Expensify Card, change bank account, Workspace Admin, Domain Admin]
internalScope: Audience is Workspace Admins and Domain Admins. Covers how to reassign responsibilities when an admin leaves the business. Does not cover individual member removal or account deletion outside admin offboarding.
---

# Admin offboarding checklist for Expensify

If a key admin is leaving your company or changing roles, follow this checklist to prevent billing issues and maintain admin continuity. This is required if the person leaving is a:

- **Billing Owner**
- **Workspace Admin**
- **Domain Admin**
- **Technical Contact**
- **Bank Account Owner**

**Note:** If you're only taking over billing or payment management, follow [these steps to switch billing owners and add a payment account](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-billing-owner-and-payment-account). You don’t need the full checklist.

---

# Checklist for the current admin

## How to assign a new Workspace Admin and Domain Admin

1. [Invite the new admin to the workspace](https://help.expensify.com/articles/expensify-classic/workspaces/Invite-members-and-assign-roles).
2. [Assign them the Workspace Admin role](https://help.expensify.com/articles/expensify-classic/workspaces/Change-member-workspace-roles).
3. If your company uses company card feeds, Expensify Cards, domain groups, or SAML, [add the new admin as a Domain Admin](https://help.expensify.com/articles/expensify-classic/domains/Add-Domain-Members-and-Admins).

**Note:** The new admin must be added to **all** company workspaces to keep billing under a single Annual Subscription. If the old admin remains on any workspace, billing may split across separate subscriptions.

## How to share a business bank account with a new admin

If you have access to a verified business bank account in Expensify, [share the bank account](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/Business-Bank-Accounts-USD#how-to-share-a-verified-bank-account) with the new admin or another Workspace Admin.

---

# Checklist for the new admin

## How to take over billing and payment responsibilities

1. [Follow the steps to become the Billing Owner and add a payment method](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-billing-owner-and-payment-account).
2. Make sure your payment details are valid to prevent service interruption.

## How to verify a shared business bank account

1. Wait 1–2 business days for test transactions (two withdrawals and one deposit) to appear.
2. On web: Go to **Settings > Account > Wallet**.
   - On mobile: Tap the **Settings** tab on the bottom > **Account** > **Wallet**.
3. Enter the test transaction amounts to complete verification.

**Note:** Only the person who sees the test transactions in their bank can complete the verification.

## How to revoke the previous admin’s access to a verified bank account

Once you verify the bank account, [revoke the previous admin’s access](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/bank-accounts/Share-Verified-Business-Bank-Account#revoke-access-to-a-verified-business-bank-account) to maintain secure control.

**Note:** If you can’t unshare the account because the previous admin is still the Expensify Card settlement account owner, contact Concierge or your Account Manager to update the ownership.

## How to change the default reimburser on all workspaces

1. Go to **Settings > Workspaces > [Workspace Name] > Workflows > Payments**.
2. Confirm that the correct bank account is selected as the **reimbursement account**.
3. If **Direct** reimbursement is used and the old admin is listed as the **Reimburser**, assign a new Workspace Admin.

ADD A SCREENSHOT HERE. Suggestion: Workspace > Workflows > Payments screen showing the Default Reimburser field.


## How to reconnect accounting integrations and update the Technical Contact

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Reconnect any integrations that were tied to the old admin’s login.
3. [Update the Technical Contact](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-Technical-Contact) to yourself or another team member.

## How to remove or downgrade the previous admin

- If they’re staying with the company:
  - [Change their role](https://help.expensify.com/articles/expensify-classic/workspaces/Change-member-workspace-roles) to **Employee**.
- If they’re leaving:
  1. [Remove them from the workspace](https://help.expensify.com/articles/expensify-classic/workspaces/Remove-Members).
  2. Fully close their account:
     - Go to **Settings > Domains > [Domain Name] > Domain Members**.
     - Check the box next to their name.
     - Click **Close Accounts**, then **Confirm**.

ADD A SCREENSHOT HERE. Suggestion: Domain Members tab showing the “Close Accounts” button.


---

By completing this checklist, you’ll ensure uninterrupted billing, secure financial access, and a smooth transition of admin duties.

---

# FAQ

## Do I need to complete this checklist if I only want to manage billing?

No. If you're only taking over billing and payment responsibilities, follow [these steps](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-billing-owner-and-payment-account) instead. The full checklist is only needed if an admin is leaving or changing roles.

## Who can verify a shared business bank account?

Only the person who sees the test transactions in their external bank account can complete verification. Once the account is shared, the new admin must wait for the transactions and verify them under **Account > Settings > Wallet**.

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

