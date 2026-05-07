---
title: XERO56 Export Error in Xero Integration
description: Learn what the XERO56 export error means and how to resolve Xero contact syncing issues in New Expensify.
keywords: XERO56, Xero contacts not loading, unable to load Xero contacts, Xero contact list too large, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO56 export error related to syncing Xero contacts. Does not cover authentication or category configuration issues.
---

# XERO56 Export Error in Xero Integration

If you see the error:

XERO56 Export Error: Unable to load Xero contacts.

This means the Workspace cannot retrieve the contact list from Xero.

Without access to contacts, exports that require customers or vendors may fail.

---

## Why the XERO56 Export Error Happens in Xero

The XERO56 error typically occurs when:

- The Xero contacts list fails to sync.
- The Xero contact list is very large.
- The connection is unable to return all contact records during sync.
- There is a temporary communication issue with Xero.

Large contact lists, especially those near or over **10,000 contacts**, can prevent the Workspace from successfully loading all contacts.

This is a contact sync issue, not a category configuration issue.

---

# How to Fix the XERO56 Export Error

Follow the steps below to refresh the connection and review your contact list.

---

## Run Sync in the Workspace

On web:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the Xero connection.
5. Click **Sync now**.

On mobile:

1. Tap the navigation tabs on the bottom.
2. Tap **Workspaces**.
3. Select your Workspace.
4. Tap **Accounting**.
5. Tap the three-dot icon next to the Xero connection.
6. Tap **Sync now**.

After syncing, retry exporting the report.

---

## Review the Xero Contact List Size

If the error continues:

1. Log in to Xero with appropriate permissions.
2. Go to **Contacts**.
3. Review the total number of contacts.

If the contact list is near or exceeds **10,000 contacts**:

- Archive or remove old and inactive contacts that are no longer needed.
- Reduce the total number of active contacts.

After cleaning up contacts, return to the Workspace and run **Sync now** again.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If the contact list sync completes successfully, the export should proceed normally.

---

# FAQ

## Does the XERO56 Error Affect All Exports?

It affects exports that require access to Xero contacts, such as billable expenses or vendor-related transactions.

## Do I Need Xero Admin Access to Fix the XERO56 Error?

Yes. Managing, archiving, or removing contacts in Xero requires appropriate permissions.
