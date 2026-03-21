---
title: INT771 Export Error in Sage Intacct Integration
description: Learn what the INT771 export error means and how to update export date settings or permissions when the reporting period is closed in Sage Intacct.
keywords: INT771, reporting period closed Sage Intacct, batches closed export error, change export date Workspace, xml_gateway open closed books permissions, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT771 export error caused by closed reporting periods and export date configuration. Does not cover tax or employee validation errors.
---

# INT771 Export Error in Sage Intacct Integration

If you see the error:

INT771 Export Error: Export not completed. The batches for this reporting period are closed in Sage Intacct. Reopen the period or change the export date in Workspace configurations.

This means the reporting period associated with the export is closed in Sage Intacct.

Sage Intacct does not allow transactions to post to closed reporting periods.

---

## Why the INT771 Export Error Happens in Sage Intacct

The INT771 error typically occurs when:

- The export date falls within a closed reporting period in Sage Intacct.
- Sage Intacct prevents new transactions from being created in that period.
- The export date is based on the **Submitted date** or **Date of last expense**, and that accounting period has already been closed.

When the selected date falls in a closed period, Sage Intacct blocks the transaction.

This is a reporting period configuration issue, not a connection issue.

---

# How to Fix the INT771 Export Error

You can resolve this by confirming permissions or updating the export date configuration.

---

## Confirm xml_gateway User Permissions in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Locate the **xml_gateway** user.
3. Confirm the user has permissions for:
   - Open books
   - Closed books
4. Update the permissions if necessary.
5. Click **Save**.

If permissions are restricted, Sage Intacct may block exports to certain periods.

---

## Change the Export Date Configuration in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Locate the **Export date** setting.
5. Change the selection:
   - From **Submitted date** or **Date of last expense**
   - To **Exported date**
6. Click **Save**.

Using **Exported date** ensures transactions post to the current open reporting period instead of a closed one.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the export date falls within an open reporting period, the export should complete successfully.

---

# FAQ

## Do I Need to Reopen the Reporting Period?

Not necessarily. Changing the export date to **Exported date** is often the simplest solution.

## Does the INT771 Error Mean the Integration Is Disconnected?

No. The integration is functioning, but Sage Intacct is preventing transactions from posting to a closed reporting period.

## What Does the xml_gateway User Do?

The **xml_gateway** user is the integration user that allows the Workspace to communicate with Sage Intacct and post transactions.
