---
title: INT073 Export Error in Sage Intacct Integration
description: Learn what the INT073 export error means in Sage Intacct and how to remove required account fields or configure them as tags in Expensify to restore successful exports.
keywords: INT073, Sage Intacct required field on account, Intacct account requires dimension, Expensify tag configuration Intacct, missing required dimension Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT073 export error caused by required account fields (dimensions/tags). Does not cover authentication or employee configuration errors.
---

# INT073 Export Error in Sage Intacct Integration

If you see the error:

INT073 Export Error: Sage Intacct requires a tag for account [XXXX], preventing the expense from being created. Either remove the required field from the account in Sage Intacct or configure the field as a tag in Expensify configurations.

This means a required field (dimension) is enforced on the specified account in Sage Intacct but is not being provided during export.

Sage Intacct blocks the transaction when required account-level fields are missing.

---

## Why the INT073 Export Error Happens in Sage Intacct

The INT073 error typically indicates:

- A specific account in Sage Intacct requires a dimension such as Department, Location, Project, or a User-Defined Dimension.
- That required field is not populated by Expensify during export.
- Sage Intacct validation failed due to missing required account-level data.

If the required dimension is not supplied, Sage Intacct prevents the expense from being created.

This is an account configuration issue in Sage Intacct or a tag configuration issue in Expensify, not an authentication or employee setup error.

---

## How to Fix the INT073 Export Error

You can resolve this by removing the required field in Sage Intacct or configuring the field as a tag in Expensify.

### Remove the Required Field from the Account in Sage Intacct

If the field should not be mandatory:

1. Log in to Sage Intacct.
2. Go to the **Chart of Accounts**.
3. Open the account referenced in the error.
4. Review the section where required dimensions are configured.
5. Disable the requirement for the field.
6. Save the account.

After updating the account:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

### Configure the Required Field as a Tag in Expensify

If the field should remain required in Sage Intacct:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Coding** tab.
6. Enable the relevant field for import, or edit the field and set it to import as **Tag (line-item level)**.
7. Click **Save**.
8. Click **Sync Now**.

After syncing:

1. Open the report.
2. Apply the required tag to the expense.
3. Retry exporting the report.

---

# FAQ

## What Kind of “Tag” Is This Referring To?

This typically refers to Sage Intacct dimensions such as Department, Location, Project, or User-Defined Dimensions.

## Should I Remove the Required Field or Configure It in Expensify?

If the dimension is part of your accounting controls, configure it in Expensify. Only remove the requirement in Sage Intacct if it is no longer needed.

## Do I Need Sage Intacct Admin Access?

You need sufficient permissions in Sage Intacct to modify required account fields.
