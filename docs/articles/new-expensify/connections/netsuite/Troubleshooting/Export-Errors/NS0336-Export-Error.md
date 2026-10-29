---
title: NS0336 Export Error in NetSuite Integration
description: Learn what the NS0336 export error means and how to resolve unexpected NetSuite errors caused by special characters in merchant names.
keywords: NS0336, NetSuite unexpected error, NetSuite Error ID, special characters merchant name NetSuite, export error NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0336 export error caused by special characters in merchant names and escalation to NetSuite with an Error ID. Does not cover role permission or account configuration issues.
---

# NS0336 Export Error in NetSuite Integration

If you see the error:

NS0336 Export Error: NetSuite encountered an unexpected error, Error ID [XXXXXXXXX].

This means NetSuite returned a system-level error during export.

This error is often related to formatting issues in the expense data.

---

## Why the NS0336 Export Error Happens in NetSuite

The NS0336 error typically occurs when NetSuite encounters unsupported or invalid characters during export.

A common cause is special characters in the **merchant name** field.

Characters that frequently cause issues include:

- `*`
- `<`
- `>`
- Other uncommon symbols or formatting characters

If NetSuite cannot process certain characters, it may return a generic unexpected error along with an **Error ID**.

This is a data formatting issue, not a role permission or account configuration issue.

---

## How to Fix the NS0336 Export Error

Follow the steps below to clean up formatting and retry the export.

---

## Review Merchant Names in the Report

1. Open the report.
2. Review each expense.
3. Check the **Merchant** field for special characters such as:
   - `*`
   - `<`
   - `>`
   - Unusual symbols or formatting
4. Remove any unsupported characters.
5. Click **Save**.

---

## Sync the Workspace and Retry the Export

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.
6. Retry exporting the report.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.
6. Retry exporting the report.

---

## Contact NetSuite if the Error Persists

If the error continues after removing special characters:

1. Note the **Error ID** shown in the error message.
2. Contact NetSuite support.
3. Provide the Error ID and transaction details.

The Error ID allows NetSuite support to investigate the issue on their side.

---

# FAQ

## Does the NS0336 Export Error Always Relate to Special Characters?

Not always, but special characters in merchant names are a common cause.

## Can the Workspace Resolve the NS0336 Export Error Directly?

If the issue is due to data formatting, yes. If the error persists after cleaning the data, NetSuite must investigate using the provided Error ID.

## Does This Error Affect All Exports?

It affects only the specific transaction that triggers the unexpected NetSuite error. Other exports may succeed normally.
