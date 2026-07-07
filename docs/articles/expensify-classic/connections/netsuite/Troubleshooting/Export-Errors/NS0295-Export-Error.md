---
title: NS0295 Export Error in NetSuite Integration
description: Learn how to fix the NS0295 export error in NetSuite when no employee or vendor record matches the report submitter’s email.
keywords: NS0295, NetSuite employee not found by email, NetSuite vendor not found by email, email mismatch NetSuite Expensify, export error employee vendor record, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0295 export error caused by missing or mismatched employee or vendor email records. Does not cover other NetSuite error codes.
---

# NS0295 Export Error in NetSuite Integration

If you see the error:

NS0295: NetSuite couldn’t find an employee or vendor record with the email [XXXX].

This means Expensify cannot find a matching employee or vendor record in NetSuite using the report submitter’s email address.

---

## Why the NS0295 Export Error Happens in NetSuite

The NS0295 error occurs when:

- The report creator does not have an associated employee or vendor record in NetSuite.
- The email address in NetSuite does not exactly match the email used in Expensify.
- The record exists but the email field is blank or outdated.
- The record is inactive.

Expensify matches employees and vendors using the exact email address.

---

# How to Fix NS0295 for Vendor Bill Exports

If you are exporting as a **Vendor Bill**:

### Step One: Confirm the Vendor Record in NetSuite

1. Log in to **NetSuite**.
2. Go to **Lists**.
3. Select **Vendors**.
4. Locate the vendor associated with the report submitter.
5. Click **Edit**.
6. Confirm the **Email** field exactly matches the email used in Expensify.
7. Save the record.

The email must match exactly, including capitalization and spacing.

---

### Step Two: Sync in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Retry exporting the report.

---

# How to Fix NS0295 for Journal Entry or Expense Report Exports

If you are exporting as a **Journal Entry** or **Expense Report**:

### Step One: Confirm the Employee Record in NetSuite

1. Log in to **NetSuite**.
2. Go to **Lists**.
3. Select **Employees**.
4. Locate the employee associated with the report submitter.
5. Click **Edit**.
6. Confirm the **Email** field exactly matches the email used in Expensify.
7. Save the record.

---

### Step Two: Sync in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Retry exporting the report.

---

# FAQ

## Does the Email Have to Match Exactly?

Yes. The email in NetSuite must exactly match the report submitter’s email in Expensify.

## Does NS0295 Mean the Record Is Missing?

Not necessarily. The record may exist, but the email field may be blank, incorrect, or not an exact match.
