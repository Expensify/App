---
title: XERO84 Sync Error in Xero Integration
description: Learn what the XERO84 sync error means and how to select the correct Xero organization for your Workspace in New Expensify.
keywords: XERO84, Xero organization not selected, select Xero company Expensify, Xero sync error organization, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO84 sync error related to missing Xero organization selection. Does not cover authentication token, connection expiration, or export mapping issues.
---

# XERO84 Sync Error in Xero Integration

If you see the error:

XERO84 Sync Error: There was a problem syncing Xero data. Please select which Xero organization or company this Workspace should sync with.

This means no Xero organization is selected in your Workspace settings.

Until an organization is selected, the Workspace cannot sync data with Xero.

---

## Why the XERO84 Sync Error Happens in Xero

The XERO84 error typically occurs when:

- The Workspace is connected to Xero.
- No specific **Xero organization** has been selected in the Workspace configuration.
- The organization selection was cleared or not completed during setup.

Without selecting an organization, the Workspace does not know which Xero company to sync with.

This is a configuration issue, not an authentication token or export mapping issue.

---

# How to Fix the XERO84 Sync Error

Follow the steps below to select the correct Xero organization and retry the sync.

---

## Select the Xero Organization in the Workspace

On web:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. At the top of the page, select the correct **Xero organization** from the dropdown.
6. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Accounting**.
5. Tap **Export**.
6. Select the appropriate **Xero organization**.
7. Tap **Save**.

---

## Run Sync

After saving:

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click the three-dot icon next to the Xero connection.
3. Click **Sync now**.

If the correct organization is selected, the sync should complete successfully.

---

# FAQ

## Why Don’t I See My Xero Organization in the Dropdown?

Make sure you are logged in with a Xero account that has access to the organization. If needed, disconnect and reconnect using the correct Xero admin account.

## Do I Need Xero Admin Access to Select the Organization?

Yes. The connected Xero account must have access to the organization you want to sync with.
