---
title: CER074 Export Error in Certinia Integration
description: Learn what the CER074 export error means in Certinia and how to configure the required Permission Controls to restore successful exports.
keywords: CER074, Certinia export error, insufficient permissions for resource, Certinia permission controls error, Expensify Certinia sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER074 export error caused by missing or incorrect Permission Controls. Does not cover other Certinia error codes.
---

# CER074 Export Error in Certinia Integration

If you see the error:

CER074: Insufficient permissions for Resource.

This means the report creator or submitter does not have the required Permission Controls configured in Certinia, preventing the export from completing.

---

## Why the CER074 Export Error Happens in Certinia

The CER074 error typically indicates:

- The report creator or submitter does not have access to the associated Resource.
- Required Permission Controls have not been configured.
- Certinia validation failed due to missing user-resource permissions.

Certinia requires Permission Controls to define which users can access specific Resources during export.

This is a Certinia permission configuration issue, not a Workspace configuration issue.

---

## How to Fix the CER074 Export Error

This issue must be resolved in Certinia.

1. Log in to Certinia.
2. Go to **Permission Controls**.
3. Create a new Permission Control or update an existing one.
4. Enter the required **User** and **Resource**.
5. Enable all required permission fields.
6. Save your changes.

After updating permissions:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After creating or updating the correct Permission Control and selecting **Sync Now**, retry the export. If the error persists, confirm the permission is assigned to the correct user and Resource.

## Does CER074 Mean the Report Is Invalid?

No. The report remains valid in Expensify. The export failed due to missing permission configuration in Certinia.

## Is CER074 Caused by Workspace Settings?

No. CER074 is triggered by missing or incorrect Permission Controls in Certinia. Workspace accounting settings are not the cause.
