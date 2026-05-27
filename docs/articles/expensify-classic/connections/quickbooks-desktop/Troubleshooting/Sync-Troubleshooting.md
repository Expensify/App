---
title: QuickBooks Desktop Sync Troubleshooting
description: Step-by-step decision tree to diagnose and resolve common QuickBooks Desktop sync errors before contacting support.
keywords: [Expensify Classic, QuickBooks Desktop, sync error, troubleshooting, decision tree, connection error, export error, DESK error, sync failed, integration sync, QuickBooks Desktop troubleshooting, Web Connector]
---

# QuickBooks Desktop Sync Troubleshooting

This guide walks you through a structured set of steps to diagnose and resolve common QuickBooks Desktop sync issues. Follow the decision tree below before looking up a specific error code or contacting support.

---

## Before You Start

Before diving into troubleshooting, confirm the following:

- **The QuickBooks Desktop connection is active.** Open your workspace settings and verify the connection is listed under Accounting. If it is not connected, follow the steps in [Connect to QuickBooks Desktop](https://help.expensify.com/articles/expensify-classic/connections/quickbooks-desktop/Connect-To-QuickBooks-Desktop).
- **Check for a specific error code.** If you see an error code starting with **DESK** (for example, DESK09), look it up directly in the error code articles under the Troubleshooting folder for a targeted fix.
- **Note when the issue started.** Knowing whether the sync worked previously or never completed helps narrow down the cause.

---

## Decision Tree: Diagnosing Sync Issues

Work through these steps in order. Stop when you find the step that matches your situation.

### Step 1: Is the QuickBooks Desktop connection visible in your workspace?

- **No** — The connection may have been removed or was never set up. Go to [Connect to QuickBooks Desktop](https://help.expensify.com/articles/expensify-classic/connections/quickbooks-desktop/Connect-To-QuickBooks-Desktop) and follow the setup steps.
- **Yes** — Continue to Step 2.

### Step 2: Is there a specific error code displayed?

- **Yes** — Look up the error code in the appropriate Troubleshooting subfolder:
  - [Sync Errors](https://help.expensify.com/articles/expensify-classic/connections/quickbooks-desktop/Troubleshooting/Sync-Errors) for DESK sync error codes.
  - [Export Errors](https://help.expensify.com/articles/expensify-classic/connections/quickbooks-desktop/Troubleshooting/Export-Errors) for DESK export error codes.
  - [Authentication and Login Errors](https://help.expensify.com/articles/expensify-classic/connections/quickbooks-desktop/Troubleshooting/Authentication-and-Login-errors) for login-related codes.
  - [Connection Errors](https://help.expensify.com/articles/expensify-classic/connections/quickbooks-desktop/Troubleshooting/Connection-errors) for connection-related codes.
- **No** — Continue to Step 3.

### Step 3: Has the sync ever succeeded?

- **No, it has never worked** — This usually points to a Web Connector or company file issue. Verify:
  - The QuickBooks Web Connector is installed and running on the computer where the QuickBooks Desktop company file is located.
  - The .QWC file was imported correctly into the Web Connector.
  - QuickBooks Desktop is open and the company file is accessible (not in single-user mode if another user needs access).
  - The computer running the Web Connector has internet access and is not blocked by a firewall.
- **Yes, it worked before but stopped** — Continue to Step 4.

### Step 4: Did something change recently?

Think about what changed around the time the sync stopped working:

- **The company file was moved or renamed** — The Web Connector references the file by its original path. Re-import the .QWC file or update the file location.
- **The computer was restarted or the Web Connector was closed** — The Web Connector must be running for syncs to process. Reopen it and ensure it is set to auto-sync.
- **Firewall or antivirus settings changed** — Ensure the Web Connector and QuickBooks Desktop are allowed through any firewall or security software.
- **QuickBooks Desktop was updated** — Some updates can affect the Web Connector. Confirm the Web Connector version is compatible with your QuickBooks Desktop version.
- **User permissions were changed** — The QuickBooks Desktop user associated with the connection must have admin-level access.

---

## Common Causes by Category

### Authentication Issues
- The Web Connector credentials are incorrect or expired.
- The QuickBooks Desktop user password was changed.
- The Web Connector was removed and needs to be reinstalled.

### Permission Issues
- The QuickBooks Desktop user does not have admin access.
- The company file is open in single-user mode and the connecting user cannot access it.
- Windows user permissions prevent the Web Connector from running.

### Data Issues
- An account, customer, vendor, or item referenced in Expensify was deleted or made inactive in QuickBooks Desktop.
- The company file is damaged or corrupted.
- List limits were reached in QuickBooks Desktop (names, accounts, or items).

### Configuration Issues
- The .QWC file is outdated or was configured for a different company file.
- Export settings in Expensify reference a QuickBooks Desktop account that no longer exists.
- The Web Connector sync schedule is not set or was disabled.

---

## Self-Service Resolution Steps

If the decision tree above did not resolve your issue, try these steps in order:

1. **Re-sync manually.** Open the Web Connector and click "Sync" to trigger a manual sync. Check for error messages in the Web Connector log.
2. **Restart the Web Connector.** Close and reopen the Web Connector, then try syncing again.
3. **Verify the company file is open.** QuickBooks Desktop must be open with the correct company file loaded for the Web Connector to sync.
4. **Disconnect and reconnect.** Remove the QuickBooks Desktop connection from your workspace and set it up again following [Connect to QuickBooks Desktop](https://help.expensify.com/articles/expensify-classic/connections/quickbooks-desktop/Connect-To-QuickBooks-Desktop).
5. **Review your configuration.** Compare your settings in Expensify against your QuickBooks Desktop setup using [Configure QuickBooks Desktop](https://help.expensify.com/articles/expensify-classic/connections/quickbooks-desktop/Configure-Quickbooks-Desktop).

---

## When to Contact Support

Contact Expensify Support if:

- You have followed all the steps above and the sync still fails.
- The error code you see is not listed in the Troubleshooting articles.
- The Web Connector shows errors that you cannot resolve.
- The issue involves data that appears correct on both sides but still does not sync.

To contact support, go to [expensify.com](https://www.expensify.com), open a chat with Concierge, and describe the issue along with any error codes you see.

---

## FAQ

### Does the Web Connector need to be running all the time?
Yes. The Web Connector must be open and running on the computer where the QuickBooks Desktop company file is located for syncs to process. If the computer is off or the Web Connector is closed, syncs will not run.

### Will disconnecting and reconnecting QuickBooks Desktop lose my configuration?
Yes. Disconnecting removes all imported options and configuration settings from Expensify. You will need to reconfigure your export and coding settings after reconnecting.

### Can I run the Web Connector on a different computer than QuickBooks Desktop?
No. The Web Connector must be installed on the same computer where the QuickBooks Desktop company file is stored and opened.
