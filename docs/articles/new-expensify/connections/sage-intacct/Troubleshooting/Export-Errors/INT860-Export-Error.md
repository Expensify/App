---
title: INT860 Export Error: Account Linked to Credit Card Is Restricted in Sage Intacct
description: Learn why the INT860 export error occurs and how to remove restrictions from the GL account before retrying the export.
keywords: INT860, restricted account Sage Intacct, GL code restricted error, credit card account restricted, export transaction failure
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT860 export error related to restricted GL accounts linked to credit cards. Does not cover employee, tax, or approval configuration errors.
---

# INT860 Export Error: Account Linked to Credit Card Is Restricted in Sage Intacct

If you see the error message:

**“INT860 Export Error: Sage Intacct couldn’t create the transaction because account [XXXX] (linked to Credit Card [YYYY]) is restricted.”**

It means the general ledger (GL) account associated with the selected category or credit card is restricted in Sage Intacct.

Sage Intacct does not allow transactions to post to restricted accounts.

---

## Why the INT860 Export Error Happens

The INT860 export error occurs when:

- The GL code associated with the selected category in the Workspace is restricted in Sage Intacct, or  
- The credit card account linked to the transaction is tied to a restricted GL account  

If posting restrictions are applied to the account in Sage Intacct, the export cannot create the transaction.

---

# How to Fix the INT860 Export Error

Follow the steps below to remove account restrictions and retry the export.

---

## Step 1: Review the GL Account in Sage Intacct

1. Log in to Sage Intacct.  
2. Locate the account referenced in the error message ([XXXX]).  
3. Open the GL account record.  
4. Confirm that no posting restrictions or limitations are applied.  

If restrictions are present, update the account settings to allow transactions and save your changes.

---

## Step 2: Run Sync

1. Go to **Workspace > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 3: Retry the Export

Return to the report and retry the export.

If the GL account is no longer restricted, the export should complete successfully.

---

# FAQ

## Does this error mean the credit card is disconnected?

No. The error is related to account restrictions in Sage Intacct, not a connection issue.

## Can I fix this by selecting a different category?

Yes. If another category maps to an unrestricted GL account, updating the category may resolve the error.

## Do I need Sage Intacct admin permissions to fix this?

Yes. Updating GL account restrictions typically requires administrative permissions in Sage Intacct.
