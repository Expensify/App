---
title: INT860 Export Error in Sage Intacct Integration
description: Learn what the INT860 export error means and how to remove GL account restrictions in Sage Intacct before retrying the export.
keywords: INT860, Sage Intacct account restricted, GL code restricted error, credit card account restricted Sage Intacct, export failure restricted account, Sync Now Sage Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT860 export error caused by restricted GL accounts linked to credit cards. Does not cover category mapping or employee record errors.
---

# INT860 Export Error in Sage Intacct Integration

If you see the error:

INT860 Export Error: Sage Intacct couldn’t create the transaction because account [XXXX] (linked to Credit Card [YYYY]) is restricted.

This means the general ledger (GL) account associated with the selected category or credit card is restricted in Sage Intacct.

Sage Intacct does not allow transactions to post to restricted accounts.

---

## Why the INT860 Export Error Happens in Sage Intacct

The INT860 error typically indicates:

- The GL code associated with the selected category in the Workspace is restricted in Sage Intacct.
- The credit card account linked to the transaction is tied to a restricted GL account.
- Sage Intacct validation failed due to posting restrictions on the account.

If restrictions are applied to the account in Sage Intacct, the export cannot create the transaction.

This is a GL account configuration issue, not a category mapping or employee record error.

---

## How to Fix the INT860 Export Error

Follow the steps below to remove account restrictions and retry the export.

### Review the GL Account in Sage Intacct

1. Log in to Sage Intacct.
2. Locate the account referenced in the error message (account [XXXX]).
3. Open the GL account record.
4. Review the account settings for any posting restrictions or limitations.
5. Remove or adjust any restrictions preventing transactions from posting.
6. Click **Save**.

### Sync the Workspace in Expensify

After updating the GL account:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the GL account is no longer restricted, the export should complete successfully.

---

# FAQ

## Does This Error Mean the Credit Card Is Disconnected?

No. The error is related to account restrictions in Sage Intacct, not a connection issue.

## Can I Fix This by Selecting a Different Category?

Yes. If another category maps to an unrestricted GL account, updating the category may resolve the error.

## Do I Need Sage Intacct Admin Permissions to Fix This?

You need sufficient permissions in Sage Intacct to update GL account restrictions.
