---
title: XERO99 Export Error in Xero Integration
description: Learn what the XERO99 export error means and how to resolve Xero subscription plan limits on bill approvals.
keywords: XERO99, Xero invoice approval limit, Xero Early plan bill limit, Xero 5 bills per month limit, upgrade Xero plan, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO99 export error caused by Xero subscription plan limits. Does not cover authentication or category configuration issues.
---

# XERO99 Export Error in Xero Integration

If you see the error:

XERO99 Export Error: Xero invoice approval limit reached. The 'Early' Xero plan allows up to 5 bills per month. Please upgrade your plan or retry after the billing cycle resets.

This means your Xero subscription plan has reached its monthly bill approval limit.

The **Early** Xero plan allows only five approved bills per month.

---

## Why the XERO99 Export Error Happens in Xero

The XERO99 error typically indicates:

- Your Xero organization is on the **Early** plan.
- Five bills have already been approved in the current billing cycle.
- Xero is blocking additional bill approvals until the limit resets.

Once the monthly limit is reached, Xero prevents additional bill exports that require approval.

This is a Xero subscription plan limitation, not an authentication or category configuration issue.

---

## How to Fix the XERO99 Export Error

You have two options depending on your subscription needs.

### Upgrade Your Xero Plan

Upgrade your Xero subscription to a plan that allows more bill approvals, such as:

- **Growing**
- **Established**

Log in to Xero and update your subscription under your organization’s billing settings.

### Wait for the Billing Cycle to Reset

If you prefer not to upgrade:

1. Wait until the next Xero billing cycle begins.
2. Once the monthly limit resets, return to the Workspace.
3. Retry exporting the report.

---

# FAQ

## Does This Error Affect All Exports?

It affects bill exports that count toward the monthly approval limit on the Early plan. Other export types may continue to function normally.

## Do I Need Xero Admin Access to Upgrade the Plan?

Yes. Updating your Xero subscription requires organization-level admin permissions.

## Will the Export Automatically Retry After the Limit Resets?

No. After the billing cycle resets, you will need to manually retry exporting the report.
