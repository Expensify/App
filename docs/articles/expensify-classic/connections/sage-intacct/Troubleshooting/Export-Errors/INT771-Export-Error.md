---
title: INT771 Export Error in Sage Intacct Integration
description: Learn what the INT771 export error means and how to reopen the reporting period or update the export date before retrying.
keywords: INT771, Sage Intacct reporting period closed, batches closed export error, change export date Workspace, xml_gateway open books closed books permissions, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT771 export error caused by closed reporting periods or export date configuration. Does not cover category or tax configuration errors.
---

# INT771 Export Error in Sage Intacct Integration

If you see the error:

INT771 Export Error: Export not completed. The batches for this reporting period are closed in Sage Intacct. Reopen the period or change the export date in workspace configurations.

This means the reporting period associated with the export is closed in Sage Intacct.

Sage Intacct does not allow transactions to post to closed reporting periods.

---

## Why the INT771 Export Error Happens in Sage Intacct

The INT771 error typically indicates:

- The export date falls within a closed reporting period in Sage Intacct.
- The reporting period batches are closed.
- Sage Intacct validation failed because transactions cannot be created in that period.

This commonly occurs when the Workspace export date is based on the **Submitted date** or **Date of last expense**, and that reporting period has already been closed.

This is a reporting period or export date configuration issue, not a category or tax configuration error.

---

## How to Fix the INT771 Export Error

You can resolve this by reopening the reporting period, confirming integration permissions, or updating the export date configuration.

### Confirm Permissions for the xml_gateway User in Sage Intacct

1. Log in to Sage Intacct.
2. Locate the **xml_gateway** user.
3. Confirm the user has permissions for:
   - Open books
   - Closed books
4. Click **Save** if changes were made.

### Change the Export Date Configuration in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. In the **Export date** field, change the setting:
   - From **Submitted date** or **Date of last expense**
   - To **Exported date**
7. Click **Save**.

This ensures exports post to the current open reporting period instead of a closed one.

### Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the export date falls within an open reporting period, the export should complete successfully.

---

# FAQ

## Do I Need to Reopen the Reporting Period?

Not necessarily. Changing the export date to **Exported date** is often the simplest solution.

## What Does the xml_gateway User Do?

The `xml_gateway` user is the integration user that allows Expensify to communicate with Sage Intacct. It must have appropriate permissions to post transactions.

## Does This Error Mean the Integration Is Broken?

No. The integration is functioning correctly, but Sage Intacct is preventing transactions from being posted to a closed reporting period.
