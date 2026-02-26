---
title: CER552 Error: No Project Managers Found in Certinia
description: Learn why CER552 appears when exporting to Certinia and how to ensure project managers exist as employees to complete the export.
keywords: CER552, Certinia error CER552, no project managers found, project managers employees Certinia, Certinia export error, Sync Now, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER552 project manager employee configuration error and re-syncing the Workspace. Does not cover unrelated Certinia role configuration or general employee setup.
---

# CER552 Error: No Project Managers Found in Certinia

If you see the error:

**“CER552 Error: No 'project managers' found in Certinia. Please confirm 'project managers' in Certinia exist as 'employees.'”**

this means Certinia cannot find project managers configured as employee records.

Until project managers are set up as employees, Certinia will block the export.

---

## Why CER552 Happens

Certinia requires project managers to exist as **Employee** records.

If a project manager is not configured as an employee in Certinia, the system cannot validate the export and returns error **CER552**.

This is a Certinia employee configuration issue — not an Expensify Workspace configuration issue.

---

## Who Can Fix CER552

You must have access to manage employee records in Certinia (typically a Certinia Admin) to resolve this error.

---

## How to Confirm Project Managers Exist as Employees in Certinia

1. Log in to Certinia.
2. Navigate to the employee records section.
3. Search for the project managers associated with the affected report or project.
4. Confirm each project manager exists as an **Employee** record.
5. If a project manager does not exist as an employee, create or update the record accordingly.
6. Save your changes.

Project managers must be properly configured as employees for Certinia to validate exports.

---

## How to Sync Certinia After Updating Employee Records

After confirming or creating the necessary employee records, re-sync the connection in Expensify.

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click **Sync Now**.

---

## How to Retry Exporting After CER552

After syncing:

1. Open the report you attempted to export.
2. Retry the export.
3. Confirm the export completes successfully.

If the error continues, confirm that all relevant project managers are correctly set up as employees and that changes were saved before retrying the export.

---

# FAQ

## Does CER552 mean the project manager does not exist in Certinia?

It means the project manager does not exist as an Employee record. The individual may exist in another capacity but must be configured as an employee.

---

## Is CER552 caused by Expensify settings?

No. CER552 is triggered by missing employee records for project managers in Certinia, not by Workspace settings in Expensify.

---

## Do I need to reconnect the Certinia integration?

No. In most cases, confirming or creating the employee records and retrying the export resolves the issue.
