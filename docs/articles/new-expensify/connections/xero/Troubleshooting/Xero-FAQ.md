---
title: Xero FAQ
description: Learn how to resolve common Xero export issues, automatic export failures, and connection problems in New Expensify.
keywords: Xero export not working, report not exporting automatically Xero, manually export report Xero, disconnect Xero New Expensify, already connected to Xero error
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers common Xero export issues and connection troubleshooting. Does not cover individual Xero error codes.
---

# Xero FAQ

---

# Why Is My Report Not Automatically Exporting to Xero?

An error is preventing the report from exporting automatically.

You can find the error in several places:

- The **Preferred Exporter** (set in the Workspace configuration) will receive an email with error details.
- The error appears in the **report comments** section.
- Reports with errors will not automatically export until the issue is resolved.

## How to Resolve Automatic Export Failures

1. Open the report in Expensify.
2. Review the error message in the comments.
3. Make the required corrections.
4. A Workspace Admin can manually export the report once fixed.

---

# Why Am I Unable to Manually Export a Report to Xero?

Only reports in the following statuses can be exported:

- **Approved**
- **Done**
- **Paid**

If the report is in **Draft**, selecting Export may load an empty screen.

## How to Resolve Manual Export Issues

1. Submit the report if it is in **Draft**.
2. Have an approver approve it if it is **Outstanding**.
3. Once fully approved, a Workspace Admin can export it.

---

# How Do I Disconnect the Xero Connection?

On web:

1. Go to the **navigation tabs on the left** and select **Workspaces**.
2. Select your Workspace.
3. Select **Accounting**.
4. Click the **three-dot icon** to the right of the Xero connection.
5. Click **Disconnect**.
6. Confirm the disconnection.

On mobile:

1. Tap the **navigation tabs on the bottom** and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the Xero connection.
5. Tap **Disconnect** and confirm.

Note: Disconnecting clears all imported options from Expensify.

---

# Why Does It Show That I’m Already Connected to Xero When Trying to Connect for the First Time?

This usually means the Workspace is still connected in Xero under Connected Apps.

## How to Fix It

### Step 1: Disconnect in Xero

In Xero:

1. Go to the company you want to connect.
2. Click **App Marketplace > Go to Connected Apps**.
3. Find **Expensify** in the list.
4. Click the **three-dot icon** to the right.
5. Click **Disconnect**.

---

### Step 2: Reconnect in Expensify

1. Go to the **navigation tabs on the left** and select **Workspaces**.
2. Select your Workspace.
3. Select **Accounting**.
4. Attempt the Xero connection again.

After disconnecting from Xero and reconnecting from Expensify, the integration should complete successfully.

---

# FAQ

## Who Can Manually Export Reports?

Only **Workspace Admins** can manually export reports to Xero.

## Does Disconnecting Remove My Configuration?

Yes. Disconnecting clears imported categories, contacts, and configuration settings. Take screenshots of your Workspace settings before disconnecting if needed.

---
