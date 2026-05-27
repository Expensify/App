---
title: NetSuite Sync Troubleshooting
description: Step-by-step decision tree to diagnose and resolve common NetSuite sync errors before contacting support.
keywords: [Expensify Classic, NetSuite, sync error, troubleshooting, decision tree, connection error, export error, NS error, sync failed, integration sync, NetSuite troubleshooting]
---

# NetSuite Sync Troubleshooting

This guide walks you through a structured set of steps to diagnose and resolve common NetSuite sync issues. Follow the decision tree below before looking up a specific error code or contacting support.

---

## Before You Start

Before diving into troubleshooting, confirm the following:

- **The NetSuite connection is active.** Open your workspace settings and verify the connection is listed under Accounting. If it is not connected, follow the steps in [Connect to NetSuite](https://help.expensify.com/articles/expensify-classic/connections/netsuite/Connect-To-NetSuite).
- **Check for a specific error code.** If you see an error code starting with **NS** (for example, NS0109), look it up directly in the error code articles under the Troubleshooting folder for a targeted fix.
- **Note when the issue started.** Knowing whether the sync worked previously or never completed helps narrow down the cause.

---

## Decision Tree: Diagnosing Sync Issues

Work through these steps in order. Stop when you find the step that matches your situation.

### Step 1: Is the NetSuite connection visible in your workspace?

- **No** — The connection may have been removed or was never set up. Go to [Connect to NetSuite](https://help.expensify.com/articles/expensify-classic/connections/netsuite/Connect-To-NetSuite) and follow the setup steps.
- **Yes** — Continue to Step 2.

### Step 2: Is there a specific error code displayed?

- **Yes** — Look up the error code in the appropriate Troubleshooting subfolder:
  - [Sync Errors](https://help.expensify.com/articles/expensify-classic/connections/netsuite/Troubleshooting/Sync-Errors) for NS sync error codes.
  - [Export Errors](https://help.expensify.com/articles/expensify-classic/connections/netsuite/Troubleshooting/Export-Errors) for NS export error codes.
  - [Authentication and Login Errors](https://help.expensify.com/articles/expensify-classic/connections/netsuite/Troubleshooting/Authentication-and-Login-errors) for login-related codes.
  - [Connection Errors](https://help.expensify.com/articles/expensify-classic/connections/netsuite/Troubleshooting/Connection-errors) for connection-related codes.
- **No** — Continue to Step 3.

### Step 3: Has the sync ever succeeded?

- **No, it has never worked** — This usually points to a credentials or permissions issue. Verify:
  - Your NetSuite Token-Based Authentication (TBA) credentials are correct (account ID, token ID, and token secret).
  - The Expensify Integration role is assigned to the connecting user in NetSuite.
  - SuiteCloud features (Token-Based Authentication, Web Services) are enabled in NetSuite.
- **Yes, it worked before but stopped** — Continue to Step 4.

### Step 4: Did something change recently?

Think about what changed around the time the sync stopped working:

- **Password or token was changed** — Regenerate the token in NetSuite and update it in Expensify. See [Connect to NetSuite](https://help.expensify.com/articles/expensify-classic/connections/netsuite/Connect-To-NetSuite).
- **Role permissions were modified** — Ensure the Expensify Integration role still has the required permissions (Lists, Transactions, Reports, and Custom Records access).
- **New custom fields, segments, or record types were added** — Check that any new fields are mapped correctly in [Configure NetSuite](https://help.expensify.com/articles/expensify-classic/connections/netsuite/Configure-Netsuite).
- **NetSuite subscription or account changes** — Confirm your NetSuite edition still supports Web Services and TBA.

---

## Common Causes by Category

### Authentication Issues
- The access token was revoked or expired in NetSuite.
- The NetSuite admin password was changed.
- Token-Based Authentication was disabled in NetSuite.

### Permission Issues
- The Expensify Integration role is missing required permissions.
- The connecting user's role was changed or removed.
- Record-level or field-level permissions were restricted.

### Data Issues
- A subsidiary, department, class, or location referenced in Expensify was deleted or made inactive in NetSuite.
- Custom segments or lists were renamed or removed.
- Currency mismatches between Expensify and NetSuite.

### Configuration Issues
- Export settings in Expensify reference a NetSuite account or item that no longer exists.
- Subsidiary settings were changed after the initial connection.
- Custom form preferences in NetSuite conflict with Expensify export formats.

---

## Self-Service Resolution Steps

If the decision tree above did not resolve your issue, try these steps in order:

1. **Re-sync manually.** Go to your workspace Accounting settings and trigger a manual sync to see if the issue clears on retry.
2. **Disconnect and reconnect.** Remove the NetSuite connection from your workspace and set it up again following [Connect to NetSuite](https://help.expensify.com/articles/expensify-classic/connections/netsuite/Connect-To-NetSuite).
3. **Review your NetSuite configuration.** Compare your settings in Expensify against your NetSuite setup using [Configure NetSuite](https://help.expensify.com/articles/expensify-classic/connections/netsuite/Configure-Netsuite).
4. **Check recent changes in NetSuite.** Review the NetSuite system audit log for recent changes to roles, tokens, custom records, or preferences that may affect the integration.

---

## When to Contact Support

Contact Expensify Support if:

- You have followed all the steps above and the sync still fails.
- The error code you see is not listed in the Troubleshooting articles.
- The issue involves data that appears correct on both sides but still does not sync.
- You need help interpreting a specific error message or log entry.

To contact support, go to [expensify.com](https://www.expensify.com), open a chat with Concierge, and describe the issue along with any error codes you see.

---

## FAQ

### How long should a NetSuite sync take?
Most syncs complete within a few minutes. Larger accounts with many custom segments, employees, or subsidiaries may take longer. If a sync appears stuck for more than 30 minutes, try triggering a manual sync.

### Will disconnecting and reconnecting NetSuite lose my configuration?
Yes. Disconnecting removes all imported options and configuration settings from Expensify. You will need to reconfigure your export and coding settings after reconnecting.

### Can I sync multiple NetSuite subsidiaries to one workspace?
Each workspace connects to one NetSuite subsidiary. If you need to sync multiple subsidiaries, set up a separate workspace for each one.
