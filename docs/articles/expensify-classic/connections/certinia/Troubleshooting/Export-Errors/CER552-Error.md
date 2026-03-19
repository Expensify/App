---
title: CER552 Export Error in Certinia Integration
description: Learn what the CER552 export error means in Certinia and how to configure project managers as employees to restore successful exports.
keywords: CER552, Certinia export error, no project managers found, project manager employee record missing, Certinia employee configuration, Expensify Certinia sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER552 export error caused by missing project manager employee records. Does not cover other Certinia error codes.
---

# CER552 Export Error in Certinia Integration

If you see the error:

CER552: No project managers found in Certinia.

This means Certinia cannot find project managers configured as employee records, preventing the export from completing.

---

## Why the CER552 Export Error Happens in Certinia

The CER552 error typically indicates:

- A project manager is assigned to the project.
- The project manager does not exist as an **Employee** record in Certinia.
- Certinia validation failed because required employee records are missing.

Certinia requires project managers to be configured as employee records for export validation.

This is a Certinia employee configuration issue, not a Workspace configuration issue.

---

## How to Fix the CER552 Export Error

This issue must be resolved in Certinia.

1. Log in to Certinia.
2. Navigate to the employee records section.
3. Search for the project managers associated with the affected project or report.
4. Confirm each project manager exists as an **Employee** record.
5. If a project manager does not exist as an employee, create or update the record.
6. Save your changes.

After updating employee records:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After confirming project managers are configured as employees and selecting **Sync Now**, retry the export.

## Does CER552 Mean the Project Manager Does Not Exist?

It means the project manager does not exist as an Employee record. The individual may exist in another capacity but must be configured as an employee.

## Is CER552 Caused by Workspace Settings?

No. CER552 is triggered by missing employee records in Certinia. Workspace accounting settings are not the cause.
