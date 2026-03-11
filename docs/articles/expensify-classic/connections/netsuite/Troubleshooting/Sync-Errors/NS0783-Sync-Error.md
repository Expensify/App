---
title: NS0783 Sync Error in NetSuite Integration
description: Learn how to fix the NS0783 sync error in NetSuite when a Custom Record ScriptID is in the incorrect format.
keywords: NS0783, NetSuite incorrect ScriptID format, CustomRecord ScriptID error, custcol format NetSuite, Custom Record ID format NetSuite, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0783 sync error caused by incorrect Custom Record ScriptID formatting. Does not cover other NetSuite error codes.
---

# NS0783 Sync Error in NetSuite Integration

If you see the error:

NS0783: Incorrect ScriptID format for CustomRecord. Example of correct format — 'custcol123'.

This means the ScriptID for a Custom Record in NetSuite is not formatted correctly.

---

## Why the NS0783 Sync Error Happens in NetSuite

The NS0783 error occurs when:

- A Custom Record ScriptID does not follow NetSuite’s required format.
- The ScriptID was manually edited and does not start with the correct prefix.
- The ID format does not match what Expensify expects.
- The ScriptID contains unsupported characters.

NetSuite requires Custom Record ScriptIDs to follow a specific format.

Example of correct format:

- `custcol123`

---

## How to Fix the NS0783 Sync Error

### Step One: Locate the Custom Record in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Customization**.
3. Select **Lists, Records, & Fields**.
4. Click **Record Types**.
5. Locate and click the linked record name on the left.

---

### Step Two: Confirm the ScriptID Format

1. Open the record details.
2. Locate the **ID** field (ScriptID).
3. Confirm the ID follows the correct format:
   - Begins with `custcol`
   - Contains no special characters
   - Matches NetSuite naming standards

Example of correct format:

- `custcol123`

If the ScriptID does not match the required format:

- Update it to follow the correct naming convention.
- Save your changes.

---

### Step Three: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Four: Retry the Sync

After correcting the ScriptID format and syncing the Workspace, the sync should complete successfully.

---

# FAQ

## Does NS0783 Mean the Custom Record Is Invalid?

No. The Custom Record exists, but its ScriptID format does not meet NetSuite requirements.

## Do I Need to Reconnect NetSuite?

No. Correcting the ScriptID format and running **Sync** is typically sufficient.
