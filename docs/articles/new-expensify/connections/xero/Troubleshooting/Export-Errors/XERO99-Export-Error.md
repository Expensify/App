---
title: XERO99 Export Error in Xero Integration
description: Learn what the XERO99 export error means and how to resolve Xero subscription plan limits on bill approvals in New Expensify.
keywords: XERO99, Xero invoice approval limit, Xero Early plan bill limit, Xero 5 bills per month limit, upgrade Xero plan, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO99 export error related to Xero subscription plan limits. Does not cover authentication or category configuration issues.
---

# XERO99 Export Error in Xero Integration

If you see the error:

XERO99 Export Error: Xero invoice approval limit reached. The “Early” Xero plan allows up to 5 bills per month. Please upgrade your plan or retry after the billing cycle resets.

This means your Xero subscription plan has reached its monthly bill approval limit.

The **Early** Xero plan allows only five approved bills per month.

---

## Why the XERO99 Export Error Happens in Xero

The XERO99 error typically occurs when:

- Your Xero account is on the **Early** plan.
- You have already approved five bills in the current billing cycle.
- An additional bill is exported from the Workspace.

Once the monthly limit is reached, Xero blocks additional bill approvals until:

- The billing cycle resets, or
- The subscription plan is upgraded.

This is a subscription plan limitation in Xero, not a connection or configuration issue.

---

# How to Fix the XERO99 Export Error

You can resolve this by upgrading your Xero plan or waiting for the billing cycle to reset.

---

## Upgrade Your Xero Subscription Plan

1. Log in to Xero with account-level admin permissions.
2. Go to your subscription or billing settings.
3. Upgrade to a plan that allows more bill approvals, such as **Growing** or **Established**.
4. Confirm the upgrade.

After upgrading, return to the Workspace and retry exporting the report.

---

## Wait for the Billing Cycle to Reset

If you prefer not to upgrade:

1. Wait until the next Xero billing cycle begins.
2. Once the monthly limit resets, open the report in the Workspace.
3. Retry exporting to Xero.

---

# FAQ

## Does the XERO99 Error Affect All Exports?

It affects bill exports that count toward the monthly approval limit on the **Early** plan.

## Do I Need Xero Admin Access to Upgrade the Plan?

Yes. Updating your Xero subscription requires account-level admin permissions in Xero.
