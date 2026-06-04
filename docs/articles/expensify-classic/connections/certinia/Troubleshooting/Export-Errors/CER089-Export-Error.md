---
title: CER089 Export Error in Certinia Integration
description: Learn what the CER089 export error means in Certinia and how to update Project settings to restore successful exports.
keywords: CER089, Certinia export error, assignment required for project, allow expense without assignment, Certinia project configuration, Expensify Certinia sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER089 export error caused by Project assignment requirements. Does not cover other Certinia error codes.
---

# CER089 Export Error in Certinia Integration

If you see the error:

CER089: Assignment required for Project.

This means the selected Project in Certinia requires an assignment before expenses can be exported, preventing the export from completing.

---

## Why the CER089 Export Error Happens in Certinia

The CER089 error typically indicates:

- The Project configuration requires expenses to be linked to an assignment.
- The expense being exported does not have an associated assignment.
- Certinia validation failed due to Project assignment rules.

This is a Certinia Project configuration issue, not a Workspace configuration issue.

---

## How to Fix the CER089 Export Error

This issue must be resolved in Certinia.

1. Log in to Certinia.
2. Go to **Projects**.
3. Select the affected Project.
4. Navigate to **Project Attributes**.
5. Enable **Allow Expense Without Assignment**.
6. Save your changes.

After updating the Project:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After enabling **Allow Expense Without Assignment** and selecting **Sync Now**, retry the export. If the error persists, confirm the correct Project was updated.

## Does CER089 Mean the Project Is Invalid?

No. The Project is valid, but its configuration requires an assignment before expenses can be exported.

## Is CER089 Caused by Workspace Settings?

No. CER089 is triggered by Project configuration settings in Certinia. Workspace accounting settings are not the cause.
