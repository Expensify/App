---
title: Sage Intacct Sync Troubleshooting
description: Step-by-step decision tree to diagnose and resolve common Sage Intacct sync errors before contacting support.
keywords: [Expensify Classic, Sage Intacct, sync error, troubleshooting, decision tree, connection error, export error, INT error, sync failed, integration sync, Sage Intacct troubleshooting]
---

# Sage Intacct Sync Troubleshooting

This guide walks you through a structured set of steps to diagnose and resolve common Sage Intacct sync issues. Follow the decision tree below before looking up a specific error code or contacting support.

---

## Before You Start

Before diving into troubleshooting, confirm the following:

- **The Sage Intacct connection is active.** Open your workspace settings and verify the connection is listed under Accounting. If it is not connected, follow the steps in [Connect to Sage Intacct](https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Connect-To-Sage-Intacct).
- **Check for a specific error code.** If you see an error code starting with **INT** (for example, INT109), look it up directly in the error code articles under the Troubleshooting folder for a targeted fix.
- **Note when the issue started.** Knowing whether the sync worked previously or never completed helps narrow down the cause.

---

## Decision Tree: Diagnosing Sync Issues

Work through these steps in order. Stop when you find the step that matches your situation.

### Step 1: Is the Sage Intacct connection visible in your workspace?

- **No** — The connection may have been removed or was never set up. Go to [Connect to Sage Intacct](https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Connect-To-Sage-Intacct) and follow the setup steps.
- **Yes** — Continue to Step 2.

### Step 2: Is there a specific error code displayed?

- **Yes** — Look up the error code in the appropriate Troubleshooting subfolder:
  - [Sync Errors](https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Troubleshooting/Sync-Errors) for INT sync error codes.
  - [Export Errors](https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Troubleshooting/Export-Errors) for INT export error codes.
  - [Authentication and Login Errors](https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Troubleshooting/Authentication-and-Login-errors) for login-related codes.
  - [Connection Errors](https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Troubleshooting/Connection-errors) for connection-related codes.
- **No** — Continue to Step 3.

### Step 3: Has the sync ever succeeded?

- **No, it has never worked** — This usually points to a credentials, sender ID, or permissions issue. Verify:
  - Your Web Services credentials (company ID, user ID, and user password) are correct.
  - The Expensify sender ID is authorized in Sage Intacct under Company > Setup > Company > Security > Web Services Authorizations.
  - The Web Services user has the required permissions, including access to the entities you want to sync.
  - Web Services is enabled for your Sage Intacct subscription.
- **Yes, it worked before but stopped** — Continue to Step 4.

### Step 4: Did something change recently?

Think about what changed around the time the sync stopped working:

- **Web Services password was changed** — Update the password in Expensify. See [Connect to Sage Intacct](https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Connect-To-Sage-Intacct).
- **The Expensify sender ID was removed from Web Services Authorizations** — Re-add the sender ID in Sage Intacct under Company > Setup > Company > Security > Web Services Authorizations.
- **User permissions or roles were changed** — Ensure the Web Services user still has access to all required modules (General Ledger, Accounts Payable, etc.) and entities.
- **New entities, dimensions, or custom fields were added** — Check that any new items are mapped correctly in [Configure Sage Intacct](https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Configure-Sage-Intacct).
- **Sage Intacct subscription changes** — Confirm your subscription still includes Web Services access.

---

## Common Causes by Category

### Authentication Issues
- The Web Services user password was changed or expired.
- The Expensify sender ID was removed from Web Services Authorizations.
- The Web Services user account was deactivated.

### Permission Issues
- The Web Services user lacks access to required modules (General Ledger, Accounts Payable, Expense Management).
- Entity-level permissions were restricted, preventing access to specific entities.
- Role-based permissions were modified for the Web Services user.

### Data Issues
- A dimension, account, vendor, employee, or location referenced in Expensify was deleted or made inactive in Sage Intacct.
- Custom dimensions were renamed or removed.
- Currency mismatches between Expensify and Sage Intacct.

### Configuration Issues
- Export settings in Expensify reference a Sage Intacct account or dimension that no longer exists.
- Entity mappings were changed after the initial connection.
- User-defined dimensions were added in Sage Intacct but not configured in Expensify.

---

## Self-Service Resolution Steps

If the decision tree above did not resolve your issue, try these steps in order:

1. **Re-sync manually.** Go to your workspace Accounting settings and trigger a manual sync to see if the issue clears on retry.
2. **Disconnect and reconnect.** Remove the Sage Intacct connection from your workspace and set it up again following [Connect to Sage Intacct](https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Connect-To-Sage-Intacct).
3. **Review your Sage Intacct configuration.** Compare your settings in Expensify against your Sage Intacct setup using [Configure Sage Intacct](https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Configure-Sage-Intacct).
4. **Check recent changes in Sage Intacct.** Review the Sage Intacct audit trail for recent changes to users, roles, Web Services authorizations, dimensions, or entity settings.

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

### How long should a Sage Intacct sync take?
Most syncs complete within a few minutes. Larger accounts with many entities, dimensions, or employees may take longer. If a sync appears stuck for more than 30 minutes, try triggering a manual sync.

### Will disconnecting and reconnecting Sage Intacct lose my configuration?
Yes. Disconnecting removes all imported options and configuration settings from Expensify. You will need to reconfigure your export and coding settings after reconnecting.

### Can I sync multiple Sage Intacct entities to one workspace?
The connection supports multiple entities within a single Sage Intacct company. Configure which entities to sync in [Configure Sage Intacct](https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Configure-Sage-Intacct).
