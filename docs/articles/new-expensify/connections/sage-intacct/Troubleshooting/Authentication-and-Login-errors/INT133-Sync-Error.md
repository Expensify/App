---
title: INT133 Sync Error in Sage Intacct Integration
description: Learn what the INT133 sync error means and how to reactivate the Sage Intacct web services user to restore the connection.
keywords: INT133, Sage Intacct inactive user, xmlgateway_expensify inactive, Sage Intacct web services user inactive, Sage Intacct sync authentication failure, PL04000076, Workspace Admin
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers resolving the INT133 sync error caused by an inactive Sage Intacct web services user. Does not cover incorrect credentials or Sender ID errors (see INT122).
---

# INT133 Sync Error in Sage Intacct Integration

If you see the error:

INT133 Sync Error: The Sage Intacct web services user is inactive. Please reactivate the user in Sage Intacct and attempt sync again.

This means Sage Intacct rejected the connection because the web services user is set to **Inactive**.

When the web services user is inactive, syncing and exports will not work.

---

## Why the INT133 Sync Error Happens in Sage Intacct

The INT133 error typically occurs when:

- The **xmlgateway_expensify** web services user was deactivated in Sage Intacct.
- An administrator changed the user's status to **Inactive** during a user cleanup or license review.
- The web services user that was used to connect the Workspace is no longer in use.

Reentering the same credentials will not fix this error. The user must be reactivated in Sage Intacct first.

---

## How to Fix the INT133 Sync Error

Follow the steps below to reactivate the web services user and restore the connection.

---

## Reactivate the Web Services User in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Go to **Company > Admin > Web Services users**.
3. Locate the **xmlgateway_expensify** web services user.
4. Click **Edit**.
5. Change the **Status** to **Active**.
6. Click **Save**.

If the web services user was deleted or can't be reactivated, create a new web services user and reconnect the Workspace with the new credentials.

---

## Retry the Sync

After reactivating the web services user:

1. Go to **Workspaces > [Workspace Name] > Accounting**.
2. Select **Sync Now**.
3. Confirm the sync completes successfully.

If the web services user is active, the sync should complete without errors.

---

# FAQ

## Do I Need Sage Intacct Admin Access to Fix This?

Yes. Changing the status of a web services user requires administrator permissions in Sage Intacct.

## Do I Need to Reenter My Credentials?

Not usually. If you reactivate the same web services user, the existing credentials will work. If you create a new web services user, enter the new credentials in the Workspace.

## Does This Error Affect Exports?

Yes. Exports and other integration features will not work until the web services user is active again.
