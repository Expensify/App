---
title: INT133 Sync Error in Sage Intacct Integration
description: Learn what the INT133 sync error means in Sage Intacct and how to reactivate the web services user to restore your connection.
keywords: INT133, Sage Intacct inactive user, xmlgateway_expensify inactive, Sage Intacct web services user inactive, Expensify Sage Intacct sync error, PL04000076, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT133 sync error caused by an inactive Sage Intacct web services user. Does not cover incorrect credentials or Sender ID errors (see INT122).
---

# INT133 Sync Error in Sage Intacct Integration

If you see the error:

INT133 Sync Error: The Sage Intacct web services user is inactive. Please reactivate the user in Sage Intacct and attempt sync again.

This means Sage Intacct rejected the connection because the web services user is set to **Inactive**, preventing the sync from completing.

---

## Why the INT133 Sync Error Happens in Sage Intacct

The INT133 error typically indicates:

- The `xmlgateway_expensify` web services user was deactivated in Sage Intacct.
- An administrator changed the user's status to **Inactive** during a user cleanup or license review.
- The web services user that was used to connect the Workspace is no longer in use.

Reentering the same credentials will not fix this error. The user must be reactivated in Sage Intacct first.

---

## How to Fix the INT133 Sync Error

This issue must be resolved in Sage Intacct and then retried in Expensify.

### Reactivate the Web Services User in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Go to **Company > Admin > Web Services users**.
3. Locate the **xmlgateway_expensify** web services user.
4. Click **Edit**.
5. Change the **Status** to **Active**.
6. Click **Save**.

If the web services user was deleted or can't be reactivated, create a new web services user and reconnect the Workspace with the new credentials.

---

### Retry the Sync in Expensify

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Confirm the sync completes successfully.

---

# FAQ

## Do I Need Sage Intacct Admin Access?

Yes. Changing the status of a web services user requires administrator permissions in Sage Intacct.

## Do I Need to Reenter My Credentials?

Not usually. If you reactivate the same web services user, the existing credentials will work. If you create a new web services user, enter the new credentials in Expensify.

## Does INT133 Mean the Integration Is Disconnected?

Not necessarily. The connection settings are kept, but Sage Intacct rejects every sync until the web services user is active again.
