---
title: CER074 Error: Insufficient Permissions for Resource
description: Learn why CER074 appears when exporting to Certinia and how to configure the required Permission Controls for the report creator or submitter.
keywords: CER074, Certinia error CER074, insufficient permissions for resource, Certinia permission controls, report creator permission, report submitter permission, Sync Now, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER074 permission control error for report creators or submitters and re-syncing the Workspace. Does not cover unrelated Certinia permission errors or general role configuration.
---

# CER074 Error: Insufficient Permissions for Resource

If you see the error:

**“CER074 Error: Insufficient permissions for Resource. The report creator or submitter doesn’t have the required permission controls.”**

this means the report creator or submitter does not have the required Permission Controls configured in Certinia.

Until the correct permissions are applied, Certinia will block the export.

---

## Why CER074 Happens

Certinia requires Permission Controls to determine which users have access to specific Resources.

If the report creator or submitter does not have the required permission settings for the associated Resource, Certinia fails validation and returns error **CER074**.

This is a Certinia permission configuration issue — not an Expensify Workspace configuration issue.

---

## Who Can Fix CER074

You must have access to manage Permission Controls in Certinia (typically a Certinia Admin) to resolve this error.

---

## How to Create or Update Permission Controls in Certinia

1. Log in to Certinia.
2. Go to **Permission Controls**.
3. Click **New** to create a permission control.
4. Enter the required **User** and **Resource** fields.
5. Check all required permission fields to grant appropriate access.
6. Save your changes.

Ensure the Permission Control applies to the report creator or submitter and the specific Resource involved in the export.

---

## How to Sync Certinia After Updating Permission Controls

After creating or updating the Permission Control, re-sync the connection in Expensify.

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click **Sync Now**.

---

## How to Retry Exporting After CER074

After syncing:

1. Open the report you attempted to export.
2. Retry the export.
3. Confirm the export completes successfully.

If the error continues, confirm that the Permission Control is assigned to the correct user and Resource.

---

# FAQ

## Does CER074 mean the report is invalid?

No. The report itself is not invalid. The export failed because the required Permission Controls were not configured in Certinia.

---

## Is CER074 caused by Expensify settings?

No. CER074 is triggered by missing or incorrect Permission Controls in Certinia, not by Workspace settings in Expensify.

---

## Do I need to reconnect the Certinia integration?

No. In most cases, creating or updating the correct Permission Control and selecting **Sync Now** resolves the issue.
