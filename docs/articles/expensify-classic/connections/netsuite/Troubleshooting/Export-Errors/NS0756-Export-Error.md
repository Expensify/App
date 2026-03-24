---
title: NS0756 Export Error in NetSuite Integration
description: Learn how to fix the NS0756 export error in NetSuite when the transaction nexus is not valid for the selected subsidiary.
keywords: NS0756, NetSuite transaction nexus invalid, nexus not valid subsidiary NetSuite, Expensify Integration role subsidiary access, NetSuite role subsidiary permissions, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0756 export error caused by subsidiary access restrictions on the Expensify Integration role. Does not cover other NetSuite error codes.
---

# NS0756 Export Error in NetSuite Integration

If you see the error:

NS0756: The transaction nexus isn’t valid for the selected subsidiary. Update the Expensify Integration role to allow access to all subsidiaries in NetSuite.

This means the NetSuite role used for the Expensify integration does not have access to the required subsidiary for the transaction.

---

## Why the NS0756 Export Error Happens in NetSuite

The NS0756 error occurs when:

- The Expensify Integration role does not have access to the subsidiary selected in Expensify.
- The transaction nexus is restricted by subsidiary permissions.
- The role is limited to specific subsidiaries instead of all required subsidiaries.
- A new subsidiary was added but the role was not updated.

NetSuite requires the integration role to have access to the subsidiary associated with the transaction.

---

## How to Fix the NS0756 Export Error

### Step One: Update Subsidiary Access for the Expensify Integration Role

1. Log in to **NetSuite** as an Administrator.
2. Go to **Setup**.
3. Select **Users/Roles**.
4. Click **Manage Roles**.
5. Locate the **Expensify Integration** role.
6. Click **Edit**.
7. Scroll to the **Subsidiary** section.
8. Select **Selected**.
9. Highlight and select **all subsidiaries** in the list.
10. Save the role.

Granting access to all subsidiaries ensures the role can process transactions across entities.

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

Once the Expensify Integration role has access to the required subsidiaries, the export should complete successfully.

---

# FAQ

## Does NS0756 Mean the Nexus Is Misconfigured?

Not necessarily. This error usually indicates a subsidiary access restriction on the role.

## Do I Need to Reconnect NetSuite?

No. Updating the role’s subsidiary access and running **Sync** is typically sufficient.
