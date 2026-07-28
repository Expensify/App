---
title: XERO56 Export Error in Xero Integration
description: Learn what the XERO56 export error means and how to resolve Xero contact syncing issues before retrying your export.
keywords: XERO56, Xero contacts not loading, unable to load Xero contacts, Xero contact list too large, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO56 export error caused by Xero contact syncing issues. Does not cover authentication or category configuration issues.
---

# XERO56 Export Error in Xero Integration

If you see the error:

XERO56 Export Error: Unable to load Xero contacts.

This means the Workspace is unable to retrieve the contact list from Xero.

Without access to contacts, exports that require customers or vendors may fail.

---

## Why the XERO56 Export Error Happens in Xero

The XERO56 error typically indicates:

- The Xero contact list failed to sync.
- There was a temporary issue retrieving contacts from Xero.
- The contact list in Xero is very large.
- Xero did not return contact data during sync.

Large contact lists, especially those nearing or exceeding 10,000 contacts, can prevent the Workspace from successfully loading all contacts during sync.

This is a contact syncing issue, not an authentication or category configuration error.

---

## How to Fix the XERO56 Export Error

Follow the steps below to restore contact syncing.

### Sync the Workspace in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

After syncing, retry exporting the report.

### Review the Xero Contact List Size

If the error continues:

1. Log in to Xero.
2. Go to **Contacts**.
3. Review the total number of contacts.

If the list is near or exceeds 10,000 contacts:

- Remove old or duplicate contacts that are no longer needed.
- Archive unused contacts where possible.

### Sync the Workspace Again

After cleaning up contacts in Xero:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.
5. Retry exporting the report.

---

# FAQ

## Does the XERO56 Export Error Affect All Exports?

It affects exports that require access to Xero contacts, such as billable expenses or vendor-related transactions.

## Do I Need Xero Admin Access to Fix the XERO56 Export Error?

You need sufficient permissions in Xero to manage, archive, or remove contacts.

## Do I Need to Reconnect the Integration?

No. In most cases, selecting **Sync Now** or reducing the contact list resolves the issue.
