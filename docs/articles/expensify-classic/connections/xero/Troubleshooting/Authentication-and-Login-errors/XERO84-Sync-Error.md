---
title: XERO84 Sync Error in Xero Integration
description: Learn what the XERO84 sync error means and how to select the correct Xero organization for your Workspace before retrying the sync.
keywords: XERO84, Xero organization not selected, select Xero company Workspace, Xero sync error organization, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO84 sync error caused by a missing Xero organization selection. Does not cover authentication token or export mapping issues.
---

# XERO84 Sync Error in Xero Integration

If you see the error:

XERO84 Sync Error: There was a problem syncing Xero data. Please select which Xero organization or company this workspace should sync with.

This means the Workspace is connected to Xero, but no specific Xero organization is selected.

Until an organization is selected, syncing cannot proceed.

---

## Why the XERO84 Sync Error Happens in Xero

The XERO84 error typically indicates:

- The Workspace is successfully connected to Xero.
- No **Xero organization** has been selected in the configuration.
- Expensify does not know which Xero company to sync with.

Without an organization selected, all sync attempts will fail.

This is an organization selection issue, not an authentication token or export mapping error.

---

## How to Fix the XERO84 Sync Error

Follow the steps below to select the correct Xero organization.

### Select the Xero Organization in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. At the top of the window, select the correct **Xero organization** from the dropdown menu.
7. Click **Save**.

### Retry the Sync

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

If the correct organization is selected, the sync should complete successfully.

---

# FAQ

## Why Don’t I See My Xero Organization in the Dropdown?

Make sure you are logged in with a Xero account that has access to the organization. If needed, disconnect and reconnect using the correct Xero admin account.

## Do I Need Xero Admin Access to Select the Organization?

Yes. The connected Xero account must have access to the organization you want to sync with.

## Does This Error Affect All Syncs?

Yes. Until a Xero organization is selected, all sync attempts for that Workspace will fail.
