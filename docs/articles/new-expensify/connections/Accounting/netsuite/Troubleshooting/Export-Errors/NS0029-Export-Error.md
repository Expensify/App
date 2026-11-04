---
title: NS0029 Export Error in NetSuite Integration
description: Learn what the NS0029 export error means when exporting reports to NetSuite and what to do to resolve the connection issue.
keywords: NS0029, NetSuite export error, unable to export report NetSuite, NetSuite connection issue, Expensify NetSuite integration, report export failed NetSuite, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0029 export error caused by NetSuite connection issues. Does not cover general NetSuite integration setup or configuration.
---

# NS0029 Export Error in NetSuite Integration

If you see the error:

NS0029 Export Error: Unable to export this report due to an error.

This means there is a connection issue between the Workspace and NetSuite.

The error appears when you attempt to export a report to NetSuite and the export fails.

---

## Why the NS0029 Export Error Happens in NetSuite

The NS0029 error typically indicates that Expensify is unable to successfully communicate with NetSuite at the time of export.

Common causes include:

- An expired or disconnected NetSuite integration.
- Authentication issues between Expensify and NetSuite.
- Permission changes in NetSuite.
- Temporary connectivity issues.
- A change to the NetSuite role or access token used for the integration.

Because this error is tied to the NetSuite connection, it cannot be resolved directly from the report itself.

This is a connection or authentication issue, not a report data issue.

---

## How to Fix the NS0029 Export Error

Follow the steps below to resolve the issue.

### Retry the Export

1. Open the report.
2. Retry exporting to NetSuite.

If the issue was temporary, the export may complete successfully.

### Contact Concierge for Assistance

If the error persists:

1. Do not delete the report.
2. Reach out to **Concierge**.
3. Include:
   - The report ID.
   - Confirmation that you’re seeing the **NS0029 Export Error**.
   - The approximate time the export was attempted.

Concierge will review the NetSuite connection, check authentication and permission settings, and help restore the integration so you can export the report successfully.

---

# FAQ

## Can I Retry the Export After Seeing the NS0029 Export Error?

Yes. If the issue was temporary, retrying the export may resolve it. If it continues to fail, the integration likely needs review.

## Does the NS0029 Export Error Affect Other Reports?

Yes. If the issue is related to your NetSuite connection or authentication, other report exports may also fail until the connection is fixed.

## Should I Disconnect and Reconnect NetSuite?

Do not disconnect the NetSuite integration unless directed by Concierge. Reconnecting without guidance may require reconfiguration.
