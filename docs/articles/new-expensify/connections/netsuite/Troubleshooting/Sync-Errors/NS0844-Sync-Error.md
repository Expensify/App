---
title: NS0844 Sync Error in NetSuite Integration
description: Learn what the NS0844 sync error means and how to update NetSuite access token role permissions to allow Vendor record access.
keywords: NS0844, NetSuite Vendor permission error, Expensify Integration role Vendors Full permission, NetSuite access token role Vendor access, NetSuite sync error Vendor, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0844 sync error caused by missing Vendor record permissions on the Expensify Integration role. Does not cover bundle updates or multi-currency issues.
---

# NS0844 Sync Error in NetSuite Integration

If you see the error:

NS0844 Sync Error: Permission error querying NetSuite for 'Vendor'. Please ensure the connected role has access to this record type in NetSuite.

This means the NetSuite role linked to your access token does not have proper permission to access **Vendor** records.

Without Vendor access, the Workspace cannot sync or export data that references vendors.

---

## Why the NS0844 Sync Error Happens in NetSuite

The NS0844 error typically occurs when:

- The wrong role is assigned to the NetSuite access token.
- The **Expensify Integration** role does not have sufficient Vendor permissions.
- The access token is tied to a user-role combination without **Vendors** access.

NetSuite access tokens are tied to both a specific **User** and **Role**. If the assigned role does not include Vendor permissions, NetSuite blocks the query.

This is a role and token configuration issue, not a bundle update or multi-currency issue.

---

## How to Fix the NS0844 Sync Error

Follow the steps below to confirm the correct role and permissions.

---

## Confirm the Access Token Is Assigned to the Expensify Integration Role

1. Log in to NetSuite as an administrator.
2. Search for **Access Tokens**.
3. Click **View** next to the token used for the Workspace connection.
4. Confirm the **Role** is set to **Expensify Integration**.

If the token is tied to a different role:

- Generate a new token using the correct user and **Expensify Integration** role.
- Update the connection credentials in the Workspace.

---

## Update Vendor Permissions on the Expensify Integration Role

1. Go to **Setup > Users/Roles > Manage Roles**.
2. Select **Expensify Integration**.
3. Click **Edit**.
4. Scroll to **Permissions > Lists**.
5. Locate **Vendors**.
6. Set **Vendors** to **Full**.
7. Click **Save**.

Confirm the permission level is saved.

---

## Sync the Workspace and Retry

After updating the role permissions:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

Retry the sync or export after it completes.

---

# FAQ

## Does the NS0844 Sync Error Affect Invoice Exports?

Yes. If Vendor permissions are restricted, invoice exports and other vendor-related transactions may fail.

## Do I Need NetSuite Admin Access to Fix the NS0844 Sync Error?

Yes. Updating role permissions and managing access tokens requires NetSuite administrator permissions.

## Do I Need to Reconnect the Integration?

Only if the access token was created using the wrong role. Otherwise, updating the role permissions and selecting **Sync Now** is typically sufficient.
