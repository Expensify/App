---
title: NS0144 Export Error in NetSuite Integration
description: Learn what the NS0144 export error means in NetSuite and how to resolve internal server errors during export.
keywords: NS0144, NetSuite internal server error, export to NetSuite failed, NetSuite connection issue, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0144 export error caused by connection or server-side issues. Does not cover other NetSuite error codes.
---

# NS0144 Export Error in NetSuite Integration

If you see the error:

NS0144: Internal server error when attempting to export to NetSuite.

This means NetSuite returned a server-side error during the export process.

---

## Why the NS0144 Export Error Happens in NetSuite

The NS0144 error typically indicates:

- A temporary communication issue between Expensify and NetSuite.
- A backend processing error within NetSuite.
- A token or authentication interruption.
- A permissions or configuration issue that triggered a server error.

Because this error originates from NetSuite’s server response, additional review is required to determine the exact cause.

---

## How to Fix the NS0144 Export Error

Please reach out to **Concierge** and provide:

- The Workspace name.
- The report ID that failed to export.
- The approximate time of the failed export.
- Any recent changes made to NetSuite roles, tokens, or permissions.

Concierge will review the integration logs and coordinate next steps if needed.

---

# FAQ

## Can I Retry the Export?

Yes. If the issue was temporary, retrying the export may succeed.

## Does NS0144 Mean My Data Is Lost?

No. This error indicates the export did not complete. The report remains in Expensify until the issue is resolved.
