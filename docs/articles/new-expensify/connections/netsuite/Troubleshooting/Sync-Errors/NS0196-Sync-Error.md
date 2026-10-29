---
title: NS0196 Sync Error in NetSuite Integration
description: Learn what the NS0196 sync error means and how to fix required field and payment configuration issues in NetSuite that prevent expense reports from being marked as paid.
keywords: NS0196, NetSuite mark expense report as paid error, could not mark expense reports as paid NetSuite, Bill Payment form NetSuite required fields, payment account configuration NetSuite, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0196 sync error caused by required field visibility and payment configuration issues in NetSuite. Does not cover bundle updates or token configuration issues.
---

# NS0196 Sync Error in NetSuite Integration

If you see the error:

NS0196 Sync Error: Could not mark expense reports as paid.

This means NetSuite is preventing the payment status from updating.

This typically happens because required fields in NetSuite are not properly configured, or a required payment account setting is missing.

---

## Why the NS0196 Sync Error Happens in NetSuite

The NS0196 error typically occurs when:

- A required field on the **Bill Payment** form is hidden or mandatory but not populated.
- The payment account configured in the Workspace is incorrect or inactive.
- A default classification (such as **Department**) on the employee record conflicts with the payment transaction.
- The preferred Bill Payment form is misconfigured.

If NetSuite cannot complete the payment transaction, it blocks the sync.

This is a required field or payment configuration issue, not a bundle or token issue.

---

## How to Fix the NS0196 Sync Error

Follow the options below to identify and resolve the issue.

---

## Confirm Payment Account Settings in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Advanced**.
5. Confirm the correct **Payment Account** is selected.
6. Click **Save** if changes are made.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Advanced**.
5. Confirm the correct payment account is selected.
6. Tap **Save**.

Then:

1. Go to **Accounting**.
2. Click the three-dot menu next to the NetSuite connection.
3. Click **Sync Now**.

Retry marking the report as paid.

---

## Confirm Required Fields on the Bill Payment Form in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Customization > Forms > Transaction Forms**.
3. Locate the **Bill Payment** form marked as **Preferred**.
4. Click **Edit**.
5. Review fields under:
   - **Screen Fields > Main**
   - **Screen Fields > Apply**
6. Ensure required fields are visible and properly configured.
7. Remove unnecessary required fields if appropriate.
8. Click **Save**.

Then return to the Workspace and select **Sync Now**, and retry.

---

## Review Default Settings on the Employee Record

1. In NetSuite, go to **Lists > Employees**.
2. Open the employee record associated with the report.
3. Review any default **Department**, **Class**, or **Location** settings.
4. Remove default values if they are not required.
5. Click **Save**.

Then in the Workspace:

1. Go to **Workspaces > Accounting**.
2. Click **Sync Now**.
3. Retry the payment sync.

---

# FAQ

## Does the NS0196 Sync Error Affect All Payments?

It can. If required fields or payment settings are misconfigured in NetSuite, any report being marked as paid may fail.

## Do I Need NetSuite Admin Access to Fix the NS0196 Sync Error?

Yes. Updating transaction forms, employee records, and required fields requires NetSuite administrator permissions.

## Do I Need to Reconnect the Integration?

No. Correcting the payment account or required field configuration and selecting **Sync Now** is typically sufficient.
