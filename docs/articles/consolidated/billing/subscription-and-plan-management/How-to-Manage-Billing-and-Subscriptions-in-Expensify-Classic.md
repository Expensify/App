---
title: Manage Billing & Subscriptions in Expensify Classic
description: Step-by-step instructions for billing owners and Workspace Admins to manage subscriptions, resolve billing issues, delete workspaces, and transfer billing ownership in Expensify Classic.
keywords: [Expensify Classic, billing owner, manage subscription, retry billing, take over billing, delete workspace, transfer billing ownership]
internalScope: Step-by-step instructions for managing paid subscriptions in Expensify Classic only. Relies on the shared conceptual article for billing rules, eligibility, and constraints.
---

This article explains **how to manage billing and subscriptions in Expensify Classic**.  
For information about billing ownership rules, cancellation eligibility, and ownership transfer timing, see **Understanding Billing Ownership & Subscription Management**.

# Where to manage billing and subscriptions

In Expensify Classic, billing and subscription actions are primarily located under **Settings > Account > Subscription**, with some workspace-specific actions available in **Workspace settings**.

# View subscription details

If you are the billing owner, you can view subscription details by navigating to:

**Settings > Account > Subscription**

From here, you can review:
- Current subscription or plan
- Subscription size
- Billing history and receipts
- Payment status and outstanding balances
- Payment method on file

If you don't see these options, you are likely not the billing owner.

# Update payment methods

Only the **billing owner** can update the payment method used for billing.

To update your payment method:
1. Go to **Settings > Account > Subscription**
2. Under **Payments**, add a new payment card or update the existing one

If a previous payment failed due to insufficient funds, you may need to retry billing after updating your payment method.

# Retry failed billing

Expensify Classic explicitly surfaces a **Retry Billing** option when a payment fails.

To retry billing:
1. Go to **Settings > Account > Subscription**
2. Under **Payments**, click **Retry Billing**

Once the payment is successfully processed, any out-of-date billing notifications will be cleared.

# Identify the billing owner

If you're blocked from managing billing, first confirm who the billing owner is:

1. Hover over **Settings** and click **Workspaces**
2. Select the workspace with a billing alert or notification
3. Locate the **Billing Owner** listed in the workspace details

Only the billing owner can resolve billing issues unless ownership is transferred.

# Take Over Billing (Workspace Admins)

Expensify Classic allows Workspace Admins to explicitly take over billing if needed.

To take over billing:
1. Go to **Settings > Workspaces > [Workspace Name]**
2. Locate the **Take Over Billing** option
3. Add a valid payment method when prompted

Once completed, billing ownership will transfer, and you will become responsible for future charges starting the following month.

# Canceling subscriptions in Expensify Classic

Subscription cancellation options depend on the workspace plan and subscription type.

- Monthly subscriptions can be canceled from **Settings > Account > Subscription**
- Annual subscriptions may require eligibility review and, in some cases, a refund request

All cancellation actions must be performed by the billing owner.

# Delete a workspace in Expensify Classic

Only the billing owner can delete a paid workspace.

To delete a workspace:
1. Go to **Settings > Workspaces**
2. Select the workspace you want to delete
3. Click the workspace settings icon
4. Choose **Delete**

**Important notes:**
- Workspace deletion is permanent and cannot be undone
- Billing may still apply for any usage during the final billing period
- Deleting a workspace removes its settings and members but does not delete user accounts or historical expenses

# Transfer billing ownership in Expensify Classic

Billing ownership can be transferred to another **Workspace Admin**.

To transfer billing ownership:
1. Confirm the new owner is a Workspace Admin
2. Go to **Settings > Workspaces > [Workspace Name]**
3. Select **Take Over Billing** or follow the ownership transfer option
4. The new owner adds a valid payment method

Billing ownership transfers on the **1st of the following month**. Until then, the current billing owner remains responsible for charges.

# When billing actions are blocked

You may be unable to manage billing or subscriptions if:
- You are not the billing owner
- The payment method is expired, invalid, or has insufficient funds
- A subscription is active and not eligible for cancellation

In these cases, resolve the payment issue or transfer billing ownership before proceeding.
