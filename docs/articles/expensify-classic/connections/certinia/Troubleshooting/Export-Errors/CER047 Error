---
title: CER047 Error: Ops Edit Permission Is Required to Edit Approved Records
description: Learn why CER047 appears when exporting expenses to Certinia and how to enable the Expense Ops Edit permission to restore syncing.
keywords: CER047, Certinia error CER047, Ops Edit permission, Expense Ops Edit, approved records, Certinia export error, Sync Now, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER047 Ops Edit permission error and re-syncing the Workspace. Does not cover unrelated Certinia errors or general Certinia permission configuration.
---

# CER047 Error: Ops Edit Permission Is Required to Edit Approved Records

If you see the error:

**“CER047 Error: 'Ops Edit' permission is required to edit approved records.”**

this means the connected Certinia integration user does not have permission to edit approved records.

This permission is required to successfully export approved expenses from Expensify to Certinia.

---

## Why CER047 Happens

Certinia requires the **Expense Ops Edit** permission to modify approved expense records.

When Expensify exports an approved report, Certinia may need to update those records during processing. If the connected user does not have the required permission, Certinia blocks the export and returns error **CER047**.

This is a Certinia permission issue — not an Expensify Workspace configuration issue.

---

## Who Can Fix CER047

You must have access to manage permission sets in Certinia (typically a Certinia Admin) to resolve this error.

---

## How to Enable Expense Ops Edit Permission in Certinia

1. Log in to Certinia.
2. Go to **Permission Controls**.
3. Select the relevant permission set assigned to the integration user.
4. Locate **Expense Ops Edit**.
5. Ensure **Expense Ops Edit** is enabled.
6. Save your changes.

This permission allows users to modify approved records, which is required for exporting expenses from Expensify.

---

## How to Sync Certinia After Enabling Expense Ops Edit

After enabling the permission, re-sync the connection in Expensify.

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click **Sync Now**.

---

## How to Retry Exporting After CER047

After syncing:

1. Open the report you attempted to export.
2. Retry the export.
3. Confirm the export completes successfully.

If the error continues, confirm that the **Expense Ops Edit** permission is applied to the exact Certinia user connected to the integration.

---

# FAQ

## Does CER047 mean my expense was deleted?

No. The expense remains in Expensify. The export failed because Certinia blocked the update due to missing permissions.

---

## Is CER047 caused by Expensify settings?

No. CER047 is triggered by missing permissions in Certinia, not by Workspace settings in Expensify.

---

## Do I need to reconnect the Certinia integration?

No. In most cases, enabling **Expense Ops Edit** and selecting **Sync Now** resolves the issue.
