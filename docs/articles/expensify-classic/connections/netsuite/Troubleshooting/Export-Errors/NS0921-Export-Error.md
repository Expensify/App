---
title: NS0921 Export Error in NetSuite Integration
description: Learn how to fix the NS0921 export error in NetSuite when a subsidiary reference is invalid.
keywords: NS0921, NetSuite invalid subsidiary reference, subsidiary mismatch NetSuite export, category tag account wrong subsidiary, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0921 export error caused by subsidiary mismatches across report components. Does not cover other NetSuite error codes.
---

# NS0921 Export Error in NetSuite Integration

If you see the error:

NS0921: Invalid subsidiary reference [X]. Please ensure the report, user, accounts, tags, and categories all use the subsidiary selected in the workspace.

This means one or more elements on the report are assigned to a different subsidiary than the one connected in the Workspace.

---

## Why the NS0921 Export Error Happens in NetSuite

The NS0921 error occurs when something on the report is tied to a different subsidiary than the one configured in Expensify.

This may include:

- The report submitter’s employee record  
- The selected expense category (account)  
- A customer or project tag  
- A department, location, or class  
- The export account  
- The vendor record  

All components used in the export must belong to the same subsidiary selected in the Workspace’s NetSuite connection.

---

## How to Fix the NS0921 Export Error

### Step One: Confirm the Workspace Subsidiary in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Confirm the connected **Subsidiary**.

---

### Step Two: Verify All Report Components in NetSuite

Log in to **NetSuite** and confirm the following are assigned to the same subsidiary:

- The employee record for the report submitter  
- The vendor record (if applicable)  
- The expense category (account)  
- Any selected customer or project  
- Any department, location, or class  
- The export account  

Each record must:

- Be active  
- Be assigned to the connected subsidiary  

If any item belongs to a different subsidiary, update it or select a valid alternative in Expensify.

---

### Step Three: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Four: Retry the Export

1. Open the report in Expensify.
2. Confirm the correct tags and categories are selected.
3. Retry exporting to NetSuite.

Once all elements match the connected subsidiary, the export should complete successfully.

---

# FAQ

## Does NS0921 Mean the Subsidiary Is Incorrect?

Not necessarily. The subsidiary selected in the Workspace may be correct, but one or more records on the report belong to a different subsidiary.

## Do I Need to Reconnect NetSuite?

No. Updating the records and running **Sync** is typically sufficient.
