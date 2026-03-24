---
title: NS0034 Export Error in NetSuite Integration
description: Learn how to fix the NS0034 export error in NetSuite when a report already exists and is exported twice.
keywords: NS0034, NetSuite record already exists, duplicate export NetSuite, delete existing report NetSuite, reexport report Expensify, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0034 export error caused by duplicate exports. Does not cover other NetSuite error codes.
---

# NS0034 Export Error in NetSuite Integration

If you see the error:

NS0034: This record already exists. Please search for the report ID in NetSuite, delete the entry, and reexport from Expensify.

This means the report has already been exported to NetSuite and a duplicate export attempt was made.

---

## Why the NS0034 Export Error Happens in NetSuite

The NS0034 error occurs when:

- A report was successfully exported to NetSuite.
- The same report is exported again.
- A partial export exists in NetSuite with the same Report ID.
- The original record was not deleted before retrying export.

NetSuite prevents duplicate records with the same identifier.

---

## How to Fix the NS0034 Export Error

### Step One: Locate the Original Record in NetSuite

1. Log in to **NetSuite**.
2. Use the global search bar.
3. Search for the **Report ID** shown in Expensify.
4. Locate the existing transaction (vendor bill, journal entry, invoice, etc.).

---

### Step Two: Delete the Original Record

1. Open the record in NetSuite.
2. Delete the transaction.
3. Confirm the deletion.

Make sure no duplicate or partially created entries remain.

---

### Step Three: Sync in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Four: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

Once the duplicate record is removed, the export should complete successfully.

---

# FAQ

## Does NS0034 Mean the First Export Was Successful?

Yes. This error usually indicates the report was already exported.

## Do I Need to Reconnect NetSuite?

No. Deleting the duplicate record and running **Sync** is typically sufficient.
