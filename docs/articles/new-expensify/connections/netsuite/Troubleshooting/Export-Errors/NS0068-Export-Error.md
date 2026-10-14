---
title: NS0068 Export Error in NetSuite Integration
description: Learn what the NS0068 export error means and how to configure the Created From field (custbody_createdfrom_expensify) in NetSuite so Expensify can set it during export.
keywords: NS0068, NetSuite Created From field error, custbody_createdfrom_expensify, permission to set Created From NetSuite, Transaction Body Fields NetSuite, transaction form visibility NetSuite, Expensify Connect bundle, Expensify Card journal entry error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0068 export error caused by the Created From field (custbody_createdfrom_expensify) not applying to the export record type, being hidden on the preferred form, not being editable by the Expensify role, or missing from NetSuite. Does not cover token configuration issues.
---

<!-- cspell:ignore custbody createdfrom -->

# NS0068 Export Error in NetSuite Integration

If you see the error:

NS0068 Export Error: NetSuite won't let Expensify set the 'Created From' field (custbody_createdfrom_expensify).

This means NetSuite is blocking Expensify from setting the **Created From** field during export.

The **Created From** field is a custom transaction body field with the ID `custbody_createdfrom_expensify`. It is added to NetSuite by the **Expensify Connect bundle**.

---

## Why the NS0068 Export Error Happens in NetSuite

The NS0068 error typically occurs when:

- The **Created From** field does not apply to the record type you're exporting to (for example, vendor bills, expense reports, or journal entries).
- The **Created From** field is hidden on the transaction form marked as **Preferred** for your export type.
- The role used by the Expensify connection can't edit the **Created From** field.
- The **Created From** field is missing from NetSuite because the **Expensify Connect bundle** is not installed or is out of date.

If any of these apply, NetSuite prevents the integration from setting the field value and the export fails.

---

## How to Fix the NS0068 Export Error

Follow the steps below to check the field setup, form visibility, and role access in NetSuite.

---

## Check the Created From Field Settings in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Customization > Lists, Records, & Fields > Transaction Body Fields**.
3. Open the field with the ID **custbody_createdfrom_expensify**.
4. On the **Applies To** tab, confirm the field applies to the record type you're exporting to.
5. On the **Access** tab, confirm the role used by the Expensify connection has **Edit** access to the field.
6. Click **Save**.

If you can't find **custbody_createdfrom_expensify**, [update the Expensify Connect bundle](https://help.expensify.com/articles/new-expensify/connections/netsuite/Update-Expensify-Connect-Bundle-in-NetSuite), or reinstall it, before continuing.

---

## Make the Created From Field Visible on the Preferred Form

1. Go to **Customization > Forms > Transaction Forms**.
2. Locate the transaction form marked as **Preferred** for your export type.
3. Click **Edit**.
4. Locate the **Created From** field.
5. Ensure the field is marked as **Show**.
6. Click **Save**.

Confirm the field is visible on the preferred form before proceeding.

---

## Sync the Workspace in Expensify

After updating NetSuite:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to NetSuite.

If the Created From field applies to your export type, is visible on the preferred form, and is editable by the Expensify role, the export should complete successfully.

---

# Additional Steps for Expensify Card Journal Entries

If you are exporting **Expensify Card transactions as journal entries**, confirm the Created From field is set up for journal entries.

1. Go to **Customization > Lists, Records, & Fields > Transaction Body Fields** and open **custbody_createdfrom_expensify**.
2. On the **Applies To** tab, confirm the field applies to journal entries, then click **Save**.
3. Go to **Customization > Forms > Transaction Forms**.
4. Click **Edit** next to the preferred journal entry form.
5. Go to **Screen Fields > Main**.
6. Confirm **Created From** is marked as **Show**.
7. Click **Save**.

Then return to the Workspace and select **Sync Now** before retrying the export.

---

# FAQ

## Does the NS0068 Export Error Affect All Export Types?

It affects any export type where the Created From field doesn't apply to the record, is hidden on the preferred form, or isn't editable by the Expensify role.

## Do I Need NetSuite Admin Access to Fix the NS0068 Export Error?

Yes. Updating custom field settings and transaction form visibility requires NetSuite administrator permissions.

## Do I Need to Reconnect the Integration?

No. Updating the Created From field settings and selecting **Sync Now** is typically sufficient. If the field is missing, update or reinstall the Expensify Connect bundle first.
