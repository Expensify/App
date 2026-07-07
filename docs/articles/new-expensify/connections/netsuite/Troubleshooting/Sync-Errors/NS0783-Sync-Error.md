---
title: NS0783 Sync Error in NetSuite Integration
description: Learn what the NS0783 sync error means and how to correct the ScriptID format for Custom Records in NetSuite before syncing.
keywords: NS0783, NetSuite ScriptID error, incorrect ScriptID format NetSuite, CustomRecord ScriptID NetSuite, custcol format NetSuite, NetSuite custom field ID, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0783 sync error caused by incorrect ScriptID format for Custom Records or Custom Fields. Does not cover role permissions or token configuration issues.
---

# NS0783 Sync Error in NetSuite Integration

If you see the error:

NS0783 Sync Error: Incorrect ScriptID format for CustomRecord. Example of correct format — 'custcol123'.

This means the **ScriptID** for a Custom Record or Custom Field in NetSuite is not formatted correctly.

The Workspace must use the exact ScriptID format defined in NetSuite to sync custom records successfully.

---

## Why the NS0783 Sync Error Happens in NetSuite

The NS0783 error typically occurs when:

- The ScriptID entered in the Workspace does not match the exact NetSuite ScriptID.
- The ScriptID uses an incorrect prefix.
- The ScriptID includes extra characters or incorrect formatting.
- Capitalization does not match NetSuite exactly.

NetSuite ScriptIDs follow a strict naming pattern. Common examples include:

- `custcol123`
- `custbody_example`
- `custrecord_example`

If the ScriptID does not match NetSuite exactly, the sync will fail.

This is a ScriptID formatting issue, not a role permission or token configuration issue.

---

## How to Fix the NS0783 Sync Error

Follow the steps below to confirm and correct the ScriptID.

---

## Locate the Correct ScriptID in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Customization > Lists, Records, & Fields > Record Types**.
3. Click the linked record name.
4. Locate the **ID** field on the record page.
5. Copy the exact ScriptID shown.

For Custom Fields:

1. Go to **Customization > Lists, Records, & Fields > Transaction Body Fields** (or the relevant field type).
2. Open the custom field.
3. Locate the **ID** field.
4. Copy the exact ScriptID.

Make sure the ScriptID matches exactly, including capitalization and structure.

---

## Update the ScriptID in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Update the Custom Record or Custom Field ScriptID with the exact value from NetSuite.
5. Click **Save**.
6. Click the three-dot menu next to the NetSuite connection.
7. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Update the Custom Record ScriptID field.
5. Tap **Save**.
6. Tap the three-dot menu next to the NetSuite connection.
7. Tap **Sync Now**.

Retry the sync after updating the ScriptID.

---

# FAQ

## Are ScriptIDs Case-Sensitive?

Yes. ScriptIDs must match NetSuite exactly, including capitalization and formatting.

## Does the NS0783 Sync Error Affect Only Custom Records?

It can affect both **Custom Records** and **Custom Fields** if their ScriptIDs are entered incorrectly.

## Do I Need NetSuite Admin Access to Fix the NS0783 Sync Error?

Yes. You need permission to view Custom Records and Custom Fields in NetSuite to confirm the correct ScriptID.
