---
title: INT907 Error in Sage Intacct Integration
description: Learn what the INT907 error means and what to do when the Sage Intacct connection configuration is invalid or broken.
keywords: INT907, invalid connection configuration Sage Intacct, Sage Intacct integration error, Sage Intacct connection issue, Sage Intacct sync configuration failure, Workspace Admin
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers resolving the INT907 error caused by invalid or broken Sage Intacct connection configuration. Does not cover export data validation errors.
---

# INT907 Error in Sage Intacct Integration

If you see the error:

INT907 Error: Invalid connection configuration.

This means the Sage Intacct integration configuration is invalid or no longer properly authenticated.

This is a connection-level issue, not a report data issue.

---

## Why the INT907 Error Happens in Sage Intacct

The INT907 error typically occurs when:

- The Sage Intacct connection settings are incomplete.
- Authentication details are no longer valid.
- Required configuration steps were not completed.
- The integration was partially set up and not finalized.
- Credentials were changed in Sage Intacct but not updated in the Workspace.

Because this error relates to the integration configuration itself, updating report data will not resolve it.

---

# How to Fix the INT907 Error

This error requires investigation of the connection configuration.

---

## Contact Concierge for Assistance

Please reach out to **Concierge** and include:

- The full INT907 error message.
- The Workspace name.
- The date and time the error occurred.
- Whether any recent changes were made to Sage Intacct credentials or configuration.

Concierge will:

- Review the Sage Intacct connection settings.
- Confirm whether credentials need to be refreshed.
- Determine if the integration needs to be reconfigured.

---

# FAQ

## Can I Fix This by Running Sync Now?

No. This error indicates a configuration issue that typically requires backend review or reconnection steps.

## Does This Mean the Integration Is Disconnected?

Not necessarily. The connection may still appear active, but the configuration is invalid. Concierge can confirm whether the integration needs to be refreshed or reconfigured.

## Does This Affect All Exports?

Yes. If the connection configuration is invalid, syncing and exports will fail until the issue is resolved.
