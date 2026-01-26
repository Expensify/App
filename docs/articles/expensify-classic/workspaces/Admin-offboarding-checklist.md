---
title: Admin Offboarding Checklist
description: Steps to follow when the main workspace admin leaves the business.
keywords: [Expensify Classic, admin offboarding, switch admins]
---

# Admin offboarding checklist for Expensify

This checklist is for scenarios where a key Expensify admin is **leaving the company or changing roles**, and their responsibilities need to be reassigned. It’s especially important if they are the:

- **Billing Owner**
- **Workspace Admin**
- **Domain Admin**
- **Technical Contact**
- **Bank Account Owner**

**Note:** If the issue is just billing access or payment management, you may only need to [take over billing and add a payment account](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-billing-owner-and-payment-account). This full checklist is not required in those cases.

---

# Checklist for the Current Admin

## Assign a new admin

1. [Invite the new admin](https://help.expensify.com/articles/expensify-classic/workspaces/Invite-members-and-assign-roles) to the workspace.
2. [Assign the Workspace Admin role](https://help.expensify.com/articles/expensify-classic/workspaces/Change-member-workspace-roles) to the new admin.
3. If your company uses **company card feeds, Expensify Cards, domain groups, or SAML**, add the new admin as a [Domain Admin](https://help.expensify.com/articles/expensify-classic/domains/Add-Domain-Members-and-Admins).

**Note:** The new admin must be added to all company workspaces to maintain a single consolidated Annual Subscription. If the previous admin retains ownership of any workspace, billing will be split across subscriptions.

## Share access to the company bank account

If you hvaae access to the company bank account in Expensify, [share the bank account](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/Business-Bank-Accounts-USD#how-to-share-a-verified-bank-account) with the new admin or another **Workspace Admin**.

---

# Checklist for the new admin

## Take over billing and add a payment account 
[Take over billing and payment responsibilities](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-billing-owner-and-payment-account) to ensure subscription payments continue smoothly.

## Re-verify the company bank account

After the bank account is shared:

1. Wait 1–2 business days for three test transactions (two withdrawals and one deposit) to appear.
2. Go to **Account > Settings > Payments**, or check your **Expensify Inbox**, to verify the transactions.


## Unshare the company bank account

Once verification is complete, [remove the previous admin’s access](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/Business-Bank-Accounts-USD#how-to-remove-access-to-a-verified-bank-account).

## Update the Expensify Card settlement account

If your company uses Expensify Cards:

1. Go to **Settings > Domains > [domain]**.
3. Click on **Company Cards**. 
4. Under **Imported Cards**, select your Expensify Card feed.
5. Click the **Settings** tab.
6. If the **settlement account** still lists the old admin, use the green chat icon to contact Concierge for or your Account Manager for reassignment.

**Note:** The new settlement account owner must be a **Domain Admin**.

## Update the default reimburser on all workspaces

1. Go to **Settings > Workspaces > [Workspace Name] > Workflows > Make or track payments**.
2. Confirm the correct bank account is set as the **reimbursement account**.
3. If the previous admin is listed as the **Default Reimburser**, assign a new one.


## Reconnect accounting integrations and set a new Technical Contact

1. Go to `Settings > Workspaces > [Workspace Name] > Accounting`.
2. If any integrations are linked to the previous admin’s credentials, reconnect them using your credentials for the integration account. 
3. [Update the Technical Contact](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-Technical-Contact) to yourself or another team member.
   
## Remove or downgrade the previous admin

- If they’re staying with the company:
  - [Change their role](https://help.expensify.com/articles/expensify-classic/workspaces/Change-member-workspace-roles) to **Employee**.
- If they’re leaving:
  1. [Remove them from the workspace](https://help.expensify.com/articles/expensify-classic/workspaces/Remove-Members).
  2. To fully close their Expensify account:
     1. Go to `Domains > [Your Domain] > Domain Members`.
     2. Check the box next to their name.
     3. Click **Close Accounts**, then **Confirm**.

---

By completing this checklist, you’ll avoid billing interruptions, protect sensitive financial access, and ensure company operations continue smoothly.

**ADD A SCREENSHOT HERE.** Suggestion: Domain Members tab showing the “Close Accounts” button.

**ADD A SCREENSHOT HERE.** Suggestion: Expensify Card Settings screen showing who owns the settlement account.

**ADD A SCREENSHOT HERE.** Suggestion: Workspace > Workflows > Make or track payments section showing the Default Reimburser field.

# FAQ

## Do I need to complete this checklist if I just want to manage billing?

No — if you only need to take over billing or payment management, follow the steps in Take over billing and add a payment account [link]. The full checklist is only needed when an admin is leaving the company.

## Who can verify a shared bank account?

Only the person who receives the test transactions can verify the bank account. After the bank is shared, the new admin must wait for the test deposits and verify them under **Account > Settings > Payments**.

## Can I remove the previous admin before verifying the bank account?

No. Keep the previous admin’s access until the new admin has verified the shared bank account and updated billing and reimbursement settings.
