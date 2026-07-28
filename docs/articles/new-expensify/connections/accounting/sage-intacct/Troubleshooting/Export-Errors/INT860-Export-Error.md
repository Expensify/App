---
title: INT860 Export Error in Sage Intacct Integration
description: Learn what the INT860 export error means and how to remove restrictions from a GL account linked to a credit card before retrying the export.
keywords: INT860, restricted account Sage Intacct, GL code restricted error, credit card account restricted, export transaction failure, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT860 export error caused by restricted GL accounts linked to credit cards. Does not cover employee, tax, or approval configuration errors.
---

# INT860 Export Error in Sage Intacct Integration

If you see the error:

INT860 Export Error: Sage Intacct couldn’t create the transaction because account [XXXX] (linked to Credit Card [YYYY]) is restricted.

This means the general ledger (GL) account associated with the selected category or credit card is restricted in Sage Intacct.

Sage Intacct does not allow transactions to post to restricted accounts.

---

## Why the INT860 Export Error Happens in Sage Intacct

The INT860 error typically occurs when:

- The GL code associated with the selected category in the Workspace is restricted in Sage Intacct.
- The credit card account linked to the transaction is tied to a restricted GL account.
- Posting restrictions are applied to the GL account in Sage Intacct.

If restrictions are enabled on the account, Sage Intacct blocks the transaction during export.

This is an account restriction issue, not a connection or approval workflow issue.

---

# How to Fix the INT860 Export Error

Follow the steps below to review and update the GL account before retrying the export.

---

## Review the GL Account in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Locate the account referenced in the error message ([XXXX]).
3. Open the GL account record.
4. Review the account settings for any posting restrictions or limitations.
5. Remove or update the restrictions to allow transactions.
6. Click **Save**.

If the restriction cannot be removed, confirm whether a different GL account should be used.

---

## Sync the Workspace

After updating the GL account:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes account data from Sage Intacct.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the GL account is no longer restricted, the export should complete successfully.

---

# FAQ

## Does the INT860 Error Mean the Credit Card Is Disconnected?

No. The error is related to GL account restrictions in Sage Intacct, not a connection issue.

## Can I Fix This by Selecting a Different Category?

Yes. If another category maps to an unrestricted GL account, updating the category may resolve the error.

## Do I Need Sage Intacct Admin Permissions to Fix This?

Yes. Updating GL account restrictions typically requires administrative permissions in Sage Intacct.
