---
title: Admin offboarding checklist for New Expensify
description: Step-by-step instructions to transfer billing, bank access, and admin roles when a Workspace Admin or Billing Owner leaves your company.
keywords: [admin offboarding, transfer billing, remove admin, take over billing, New Expensify, Workspace Admin, Domain Admin]
internalScope: Audience is Workspace Admins and Domain Admins. Covers how to reassign billing, admin roles, and bank access when a primary admin is leaving. Does not cover general permission changes or account recovery.
---

# Admin offboarding checklist for New Expensify

Use this checklist when a **primary admin** is leaving the company or changing roles. This includes anyone who is currently the:

- **Billing Owner**
- **Workspace Admin**
- **Domain Admin**
- **Technical Contact**
- **Bank Account Owner**

**Note:** If you just need to update billing or manage payments, you can [take over billing](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-billing-owner-and-payment-account) without following the full checklist.

---

# Checklist for the current admin

## Assign a new Workspace Admin and Domain Admin

1. On web: Go to the **Workspaces** tab on the left.
   - On mobile: Tap the **Workspaces** tab at the bottom.
2. Open the workspace and tap the **People** tab.
3. Invite the new admin and assign them the **Workspace Admin** role.
4. If you're using **Expensify Cards, company card feeds, domain groups, or SSO**, make them a **Domain Admin**:
   - Web: Go to the **Settings** tab on the left > **Domains**.
   - Mobile: Tap the hamburger menu in the top-left > **Settings > Domains**.

**Note:** Make sure the new admin is added to **all workspaces** your company uses. If the previous admin retains ownership of any, it may trigger duplicate subscriptions.

## Share access to the verified company bank account

1. Go to the **Settings** tab (left on web, top-left menu on mobile).
2. Select **Account > Payments**.
3. Choose the verified business bank account.
4. Share access with the new admin or another Workspace Admin.

---

# Checklist for the new admin

## Take over billing and add a payment account

[Take over billing and add a payment method](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-billing-owner-and-payment-account) so subscription payments stay up to date.

## Re-verify the company bank account

After the previous admin shares the bank account with you:

1. Wait 1–2 business days for **three test transactions** (two withdrawals and one deposit).
2. Go to **Settings > Account > Payments** to enter the verification amounts, or follow the prompt in your Inbox.

## Remove the previous admin from bank account access

Once verified, remove the previous admin’s access:
- Go to **Settings > Account > Payments**
- Select the bank account and remove their name from the access list.

## Update the Expensify Card settlement account

If you're using Expensify Cards:

1. Go to **Settings > Domains > [Your Domain]**.
2. Tap the **Company Cards** tab.
3. Under **Imported Cards**, select the correct feed.
4. Open the **Settings** tab for the Expensify Card.
5. If the **settlement account** still shows the previous admin, use the green chat icon to message Concierge for help.

**Note:** The new owner must be a **Domain Admin**.

**ADD A SCREENSHOT HERE.** Suggestion: Expensify Card > Settings tab showing the current settlement account owner.

## Update the default reimburser

1. Go to **Settings > Workspaces > [Workspace Name] > Workflows > Make or track payments**.
2. Confirm that the correct bank account is selected for reimbursements.
3. If the previous admin is listed as the **Default Reimburser**, assign a new reimburser.

**ADD A SCREENSHOT HERE.** Suggestion: Workspace settings showing the Default Reimburser dropdown.

## Reconnect accounting integrations and assign a new Technical Contact

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Reconnect any integrations using your account (e.g., QuickBooks or Xero).
3. [Update the Technical Contact](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-Technical-Contact) if the previous admin was listed.

## Remove or downgrade the previous admin

- If they’re staying at the company:
  - Change their role to **Employee** under the Workspace > People tab.
- If they’re leaving:
  1. Remove them from each workspace via the **People** tab.
  2. Go to **Settings > Domains > [Your Domain] > Domain Members**.
  3. Check the box next to their name and click **Close Accounts**, then confirm.

**ADD A SCREENSHOT HERE.** Suggestion: Domain Members tab showing the “Close Accounts” action.

---

# FAQ

## Do I need to complete this checklist if I just want to manage billing?

No — if you're not offboarding anyone, and just want billing access, use [Take over billing and add a payment account](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-billing-owner-and-payment-account).

## Who can verify a shared bank account?

Only the person who receives the test transactions can complete verification. That person must log in to their account and confirm the amounts under **Account > Payments**.

## Can I remove the previous admin before verifying the bank account?

No. You’ll need to keep their access until the new admin completes bank verification and updates all payment and reimbursement settings.

## What happens if the previous admin still owns a workspace?

They’ll continue to be billed for it under a separate subscription. To avoid duplicate billing, make sure the new admin is listed as owner on all company workspaces.

