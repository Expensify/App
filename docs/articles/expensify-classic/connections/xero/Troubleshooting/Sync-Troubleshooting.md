---
title: Xero Sync Troubleshooting
description: Step-by-step decision tree to diagnose and resolve common Xero sync errors before contacting support.
keywords: [Expensify Classic, Xero, sync error, troubleshooting, decision tree, connection error, export error, XERO error, sync failed, integration sync, Xero troubleshooting]
---

# Xero Sync Troubleshooting

This guide walks you through a structured set of steps to diagnose and resolve common Xero sync issues. Follow the decision tree below before looking up a specific error code or contacting support.

---

## Before You Start

Before diving into troubleshooting, confirm the following:

- **The Xero connection is active.** Open your workspace settings and verify the connection is listed under Accounting. If it is not connected, follow the steps in [Connect to Xero](https://help.expensify.com/articles/expensify-classic/connections/xero/Connect-To-Xero).
- **Check for a specific error code.** If you see an error code starting with **XERO** (for example, XERO08), look it up directly in the error code articles under the Troubleshooting folder for a targeted fix.
- **Note when the issue started.** Knowing whether the sync worked previously or never completed helps narrow down the cause.

---

## Decision Tree: Diagnosing Sync Issues

Work through these steps in order. Stop when you find the step that matches your situation.

### Step 1: Is the Xero connection visible in your workspace?

- **No** — The connection may have been removed or was never set up. Go to [Connect to Xero](https://help.expensify.com/articles/expensify-classic/connections/xero/Connect-To-Xero) and follow the setup steps.
- **Yes** — Continue to Step 2.

### Step 2: Is there a specific error code displayed?

- **Yes** — Look up the error code in the appropriate Troubleshooting subfolder:
  - [Sync Errors](https://help.expensify.com/articles/expensify-classic/connections/xero/Troubleshooting/Sync-Errors) for XERO sync error codes.
  - [Export Errors](https://help.expensify.com/articles/expensify-classic/connections/xero/Troubleshooting/Export-Errors) for XERO export error codes.
  - [Authentication and Login Errors](https://help.expensify.com/articles/expensify-classic/connections/xero/Troubleshooting/Authentication-and-Login-errors) for login-related codes.
  - [Connection Errors](https://help.expensify.com/articles/expensify-classic/connections/xero/Troubleshooting/Connection-errors) for connection-related codes.
- **No** — Continue to Step 3.

### Step 3: Has the sync ever succeeded?

- **No, it has never worked** — This usually points to an authentication or organization access issue. Verify:
  - You signed in with the correct Xero account during the OAuth2 connection.
  - The connecting user has admin or standard access to the Xero organization.
  - Your Xero subscription plan supports API integrations (some Xero Starter plans may have limitations).
  - The correct Xero organization was selected during setup if you have access to multiple organizations.
- **Yes, it worked before but stopped** — Continue to Step 4.

### Step 4: Did something change recently?

Think about what changed around the time the sync stopped working:

- **Xero password was changed or OAuth2 access was revoked** — Disconnect and reconnect in Expensify. See [Connect to Xero](https://help.expensify.com/articles/expensify-classic/connections/xero/Connect-To-Xero).
- **User access was revoked in Xero** — The user who originally connected must still have access to the Xero organization. If their access was removed, reconnect with a user who has appropriate permissions.
- **Xero organization was migrated or changed** — If the Xero organization was transferred or a new organization was created, reconnect to the correct organization.
- **Xero subscription was downgraded or expired** — Confirm your Xero plan is active and supports the features you are using.

---

## Common Causes by Category

### Authentication Issues
- The OAuth2 connection was revoked in Xero (under Connected Apps).
- The connecting user's Xero password was changed.
- The OAuth2 token expired and could not be refreshed.

### Permission Issues
- The connecting user no longer has access to the Xero organization.
- The user's role was changed to a restricted role (e.g., Invoicing only).
- Organization-level settings restrict third-party app access.

### Data Issues
- An account, contact, or tracking category referenced in Expensify was deleted or archived in Xero.
- Chart of accounts changes in Xero are not reflected in Expensify.
- Currency mismatches between Expensify and Xero.

### Configuration Issues
- Export settings in Expensify reference a Xero account that no longer exists.
- Tracking categories were enabled or disabled in Xero after the connection was set up.
- Tax rate changes in Xero have not been synced to Expensify.

---

## Self-Service Resolution Steps

If the decision tree above did not resolve your issue, try these steps in order:

1. **Re-sync manually.** Go to your workspace Accounting settings and trigger a manual sync to see if the issue clears on retry.
2. **Disconnect and reconnect.** Remove the Xero connection from your workspace and set it up again following [Connect to Xero](https://help.expensify.com/articles/expensify-classic/connections/xero/Connect-To-Xero).
3. **Review your Xero configuration.** Compare your settings in Expensify against your Xero setup using [Configure Xero](https://help.expensify.com/articles/expensify-classic/connections/xero/Configure-Xero).
4. **Check recent changes in Xero.** Review the Xero history and audit trail for recent changes to accounts, contacts, tracking categories, or user permissions.

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

### How long should a Xero sync take?
Most syncs complete within a few minutes. If a sync appears stuck for more than 30 minutes, try triggering a manual sync.

### Will disconnecting and reconnecting Xero lose my configuration?
Yes. Disconnecting removes all imported options and configuration settings from Expensify. You will need to reconfigure your export and coding settings after reconnecting.

### Can I connect multiple Xero organizations to one workspace?
No. Each workspace connects to one Xero organization. If you need to sync multiple organizations, set up a separate workspace for each one.
