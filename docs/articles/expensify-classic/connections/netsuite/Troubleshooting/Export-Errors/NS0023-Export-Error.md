---
title: NS0023 Export Error in NetSuite Integration
description: Learn how to fix the NS0023 export error in NetSuite when the employee record does not match between NetSuite and Expensify.
keywords: NS0023, NetSuite employee does not exist, employee subsidiary mismatch NetSuite, employee email mismatch NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0023 export error caused by employee subsidiary or email mismatches. Does not cover other NetSuite error codes.
---

# NS0023 Export Error in NetSuite Integration

If you see the error:

NS0023: Employee does not exist in NetSuite. Please make sure employee’s subsidiary and email matches between NetSuite and Expensify.

This means Expensify cannot match the report creator to an employee record in NetSuite.

---

## Why the NS0023 Export Error Happens in NetSuite

The NS0023 error occurs when:

- The employee record in NetSuite does not exist.
- The employee’s **subsidiary** in NetSuite does not match the subsidiary used in Expensify.
- The employee’s **email address** in NetSuite does not exactly match their email in Expensify.
- The employee record is inactive in NetSuite.

Expensify matches employees based on both email address and subsidiary configuration.

---

## How to Fix the NS0023 Export Error

### Step One: Confirm the Employee Record in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Lists**.
3. Select **Employees**.
4. Locate the employee associated with the report creator.
5. Confirm:
   - The employee record exists.
   - The record is active.
   - The **Email** field exactly matches the employee’s email in Expensify.
   - The **Subsidiary** matches the one configured in Expensify.

Update the employee record if necessary and save changes.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

Once the employee’s email and subsidiary match in both systems, the export should complete successfully.

---

# FAQ

## Does the Email Have to Match Exactly?

Yes. The email address must exactly match between NetSuite and Expensify.

## Does NS0023 Mean the Integration Is Broken?

No. This error typically indicates a configuration mismatch between the employee record in NetSuite and Expensify.
