---
title: INT073 Export Error in Sage Intacct Integration
description: Learn what the INT073 export error means and how to configure required account fields or tags before retrying the export.
keywords: INT073, Sage Intacct required tag for account, account requires dimension Sage Intacct, Chart of Accounts required field Intacct, configure tag line-item level, Workspace Accounting Coding sync
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT073 export error caused by required account-level fields or dimension configuration. Does not cover employee or tax configuration errors.
---

# INT073 Export Error in Sage Intacct Integration

If you see the error:

INT073 Export Error: Sage Intacct requires a tag for account [XXXX], preventing the expense from being created. Either remove the required field from the account in Sage Intacct or configure the field as a tag in Expensify configurations.

This means the referenced account in Sage Intacct requires a specific **dimension or field**, but that value was not provided on the expense.

Sage Intacct blocks the transaction if a required account-level field is missing.

---

## Why the INT073 Export Error Happens in Sage Intacct

The INT073 error typically occurs when:

- A specific account in the **Chart of Accounts** has a required dimension (such as Department, Location, Project, or a User-Defined Dimension).
- That required value is not included on the expense during export.
- The Workspace is not configured to send that dimension as a tag.

If a required account-level field is not supplied, Sage Intacct prevents the expense from being created.

This is an account configuration issue, not an employee or tax configuration issue.

---

# How to Fix the INT073 Export Error

You can resolve this in one of two ways.

---

## Option 1: Disable the Required Field on the Account in Sage Intacct

If the dimension is no longer needed:

1. Log in to Sage Intacct.
2. Go to **General Ledger > Chart of Accounts**.
3. Locate the account referenced in the error message ([XXXX]).
4. Open the account record.
5. Review the section where dimensions or fields are marked as required.
6. Disable the required field if it is not needed.
7. Click **Save**.

Then:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Retry exporting the report.

---

## Option 2: Configure the Required Field as a Tag in the Workspace

If the dimension must remain required in Sage Intacct:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Coding** tab.
6. Locate the corresponding dimension or field.
7. Enable it for import if it is not already enabled.
8. Set it to import as **Tag (line-item level)** if required.
9. Click **Save**.

Then:

1. Click **Sync Now** under **Accounting**.
2. Open the report.
3. Apply the required tag to each affected expense.

Retry exporting the report.

---

# FAQ

## What Is a Required Account Field in Sage Intacct?

A required account field is a dimension or value that must be included whenever that account is used in a transaction.

## Should I Disable the Required Field or Configure It as a Tag?

If your accounting process requires that dimension, configure it as a tag in the Workspace. If it is no longer needed, disable the requirement in Sage Intacct.

## Do I Need to Run Sync After Updating Settings?

Yes. Selecting **Sync Now** ensures the latest account and dimension configuration is applied before retrying the export.
