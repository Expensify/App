---
title: INT907 Error in Sage Intacct Integration
description: Learn what the INT907 error means and what to do when the Sage Intacct connection configuration is invalid.
keywords: INT907, invalid connection configuration Sage Intacct, Sage Intacct integration error, Sage Intacct connection issue, sync configuration failure, Workspace Admin
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers resolving the INT907 error related to invalid or broken connection configuration. Does not cover export data validation or report-level errors.
---

# INT907 Error in Sage Intacct Integration

If you see the error:

INT907 Error: Invalid connection configuration.

This means the Sage Intacct integration configuration is invalid or no longer properly authenticated.

This error indicates a connection-level issue rather than a problem with report data.

---

## Why the INT907 Error Happens in Sage Intacct

The INT907 error typically occurs when:

- The Sage Intacct connection settings are incomplete or corrupted.
- Authentication credentials are no longer valid.
- Required configuration steps were not completed during setup.
- The integration user permissions were changed or removed.
- The connection requires reauthorization.

Because this error relates to the integration configuration, it cannot be resolved by updating individual reports.

This is a connection configuration issue, not an export validation issue.

---

# How to Fix the INT907 Error

Follow the steps below to review the connection and restore the integration.

---

## Review the Sage Intacct Connection in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Review the Sage Intacct connection status.
5. Confirm all required fields are completed.
6. Reenter Sage Intacct admin credentials if prompted.
7. Click **Save**.

After updating the configuration, click **Sync Now** to test the connection.

---

## Contact Concierge if the Error Persists

If the connection continues to show as invalid:

Contact **Concierge** and include:

- The full error message.
- The Workspace name.
- The date and time the error occurred.

Concierge can review the integration configuration and logs to help restore the connection.

---

# FAQ

## Can I Fix This by Running Sync?

No. If the connection configuration is invalid, sync will continue to fail until the integration settings are corrected.

## Does the INT907 Error Mean the Integration Is Fully Disconnected?

Not necessarily. The configuration is invalid or incomplete, but the integration can typically be restored by updating credentials or reauthorizing the connection.
