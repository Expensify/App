---
title: QuickBooks Online Sync Troubleshooting
description: Step-by-step decision tree to diagnose and resolve common QuickBooks Online sync errors before contacting support.
keywords: [New Expensify, QuickBooks Online, sync error, troubleshooting, decision tree, connection error, export error, ONL error, sync failed, integration sync, QuickBooks Online troubleshooting]
---

# QuickBooks Online Sync Troubleshooting

This guide walks you through a structured set of steps to diagnose and resolve common QuickBooks Online sync issues. Follow the decision tree below before looking up a specific error code or contacting support.

---

## Before You Start

Before diving into troubleshooting, confirm the following:

- **The QuickBooks Online connection is active.** Open your workspace settings and verify the connection is listed under Accounting. If it is not connected, follow the steps in [Connect to QuickBooks Online](https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Connect-to-QuickBooks-Online).
- **Check for a specific error code.** If you see an error code starting with **ONL** (for example, ONL301), look it up directly in the error code articles under the Troubleshooting folder for a targeted fix.
- **Note when the issue started.** Knowing whether the sync worked previously or never completed helps narrow down the cause.

---

## Decision Tree: Diagnosing Sync Issues

Work through these steps in order. Stop when you find the step that matches your situation.

### Step 1: Is the QuickBooks Online connection visible in your workspace?

- **No** — The connection may have been removed or was never set up. Go to [Connect to QuickBooks Online](https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Connect-to-QuickBooks-Online) and follow the setup steps.
- **Yes** — Continue to Step 2.

### Step 2: Is there a specific error code displayed?

- **Yes** — Look up the error code in the appropriate Troubleshooting subfolder:
  - [Sync Errors](https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Troubleshooting/Sync-Errors) for ONL sync error codes.
  - [Export Errors](https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Troubleshooting/Export-Errors) for ONL export error codes.
  - [Authentication and Login Errors](https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Troubleshooting/Authentication-and-Login-errors) for login-related codes.
  - [Connection Errors](https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Troubleshooting/Connection-errors) for connection-related codes.
- **No** — Continue to Step 3.

### Step 3: Has the sync ever succeeded?

- **No, it has never worked** — This usually points to an authentication or access issue. Verify:
  - You signed in with the correct QuickBooks Online account during the OAuth connection.
  - The connecting user has admin access to the QuickBooks Online company file.
  - Your QuickBooks Online subscription is active and not expired.
- **Yes, it worked before but stopped** — Continue to Step 4.

### Step 4: Did something change recently?

Think about what changed around the time the sync stopped working:

- **QuickBooks Online password was changed** — The OAuth token may have been invalidated. Disconnect and reconnect in Expensify. See [Connect to QuickBooks Online](https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Connect-to-QuickBooks-Online).
- **User access was revoked in QuickBooks Online** — The user who originally connected must still have admin access. If their access was removed, reconnect with a user who has admin permissions.
- **Company file was migrated or changed** — If the QuickBooks Online company file was replaced or migrated, reconnect to the new file.
- **QuickBooks Online subscription was downgraded** — Some features require specific QuickBooks Online plan tiers. Confirm your plan supports the features you are using.

---

## Common Causes by Category

### Authentication Issues
- The OAuth token expired and was not refreshed (tokens refresh automatically, but can fail if the user revokes access).
- The connecting user's QuickBooks Online password was changed.
- Two-factor authentication changes disrupted the connection.

### Permission Issues
- The connecting user no longer has admin access to the QuickBooks Online company file.
- The user was removed from the QuickBooks Online account.
- Company access was restricted by another admin.

### Data Issues
- A customer, vendor, account, or class referenced in Expensify was deleted or made inactive in QuickBooks Online.
- Items used in expense coding were merged or renamed.
- Currency settings differ between Expensify and QuickBooks Online.

### Configuration Issues
- Export settings in Expensify reference a QuickBooks Online account that no longer exists.
- Tax settings were changed in QuickBooks Online but not updated in Expensify.
- Category or class tracking was enabled or disabled in QuickBooks Online after the connection was set up.

---

## Self-Service Resolution Steps

If the decision tree above did not resolve your issue, try these steps in order:

1. **Re-sync manually.** Go to your workspace Accounting settings and trigger a manual sync to see if the issue clears on retry.
2. **Disconnect and reconnect.** Remove the QuickBooks Online connection from your workspace and set it up again following [Connect to QuickBooks Online](https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Connect-to-QuickBooks-Online).
3. **Review your QuickBooks Online configuration.** Compare your settings in Expensify against your QuickBooks Online setup using [Configure QuickBooks Online](https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Configure-Quickbooks-Online).
4. **Check recent changes in QuickBooks Online.** Review the QuickBooks Online audit log for recent changes to the chart of accounts, classes, customers, or user permissions.

---

## When to Contact Support

Contact Expensify Support if:

- You have followed all the steps above and the sync still fails.
- The error code you see is not listed in the Troubleshooting articles.
- The issue involves data that appears correct on both sides but still does not sync.
- You need help interpreting a specific error message or log entry.

To contact support, go to [new.expensify.com](https://new.expensify.com), open a chat with Concierge, and describe the issue along with any error codes you see.

---

## FAQ

### How long should a QuickBooks Online sync take?
Most syncs complete within a few minutes. If a sync appears stuck for more than 30 minutes, try triggering a manual sync.

### Will disconnecting and reconnecting QuickBooks Online lose my configuration?
Yes. Disconnecting removes all imported options and configuration settings from Expensify. You will need to reconfigure your export and coding settings after reconnecting.

### Why does my connection keep disconnecting?
QuickBooks Online OAuth tokens refresh automatically, but they can be invalidated if the connecting user changes their password, revokes app access in QuickBooks Online, or if the QuickBooks Online subscription lapses. Reconnecting typically resolves this.
