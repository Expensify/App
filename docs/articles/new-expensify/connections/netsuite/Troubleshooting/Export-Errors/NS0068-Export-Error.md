---
title: NS0068 Export Error in NetSuite Integration
description: Learn what the NS0068 export error means and how to configure the Created From field (custbody_createdfrom_expensify) in NetSuite so Expensify can set it during export.
keywords: NS0068, NetSuite Created From field error, custbody_createdfrom_expensify, permission to set Created From NetSuite, Transaction Body Fields NetSuite, transaction form visibility NetSuite, custom form ID NetSuite, Expensify Connect bundle, Expensify Card journal entry error, Expensify NetSuite integration, workspace admin
internalScope: Audience is workspace admins using the NetSuite integration. Covers resolving the NS0068 export error caused by the Created From field (custbody_createdfrom_expensify) not applying to the export record type, being hidden on the export form, not being editable by the Expensify role, or missing from NetSuite. Does not cover token configuration issues.
---

<!-- cspell:ignore custbody createdfrom -->

# NS0068 Export Error in NetSuite Integration

If you see the error:

NS0068 Export Error: NetSuite won't let Expensify set the 'Created From' field (custbody_createdfrom_expensify).

This means NetSuite is blocking Expensify from setting the **Created From** field during export.

The **Created From** field is a custom transaction body field with the ID `custbody_createdfrom_expensify`. The **Expensify Connect bundle** adds it to NetSuite.

---

## Why the NS0068 export error happens in NetSuite

The NS0068 error typically occurs when:

- The **Created From** field does not apply to the record type you're exporting to (vendor bills, expense reports, or journal entries).
- The **Created From** field is hidden on the transaction form Expensify uses for your export type.
- The role used by the Expensify connection can't edit the **Created From** field.
- The **Created From** field is missing from NetSuite because the **Expensify Connect bundle** is not installed or is out of date.

If any of these apply, NetSuite prevents the integration from setting the field value and the export fails.

---

## How to fix the NS0068 export error

Follow the steps below to check the field setup, form visibility, and role access in NetSuite.

---

## How to check the Created From field settings in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Customization > Lists, Records, & Fields > Transaction Body Fields**.
3. Open the field with the ID **custbody_createdfrom_expensify**.
4. On the **Applies To** tab, confirm the option for your export type is selected: **Purchase** for vendor bills, **Expense Report** for expense reports, or **Journal** for journal entries.
5. On the **Access** tab, confirm **Default Access Level** is **Edit**. If the **Role** list includes the role used by the Expensify connection, such as **Expensify Integration**, confirm its access level is also **Edit**.
6. Select **Save**.

If you can't find **custbody_createdfrom_expensify**, update or reinstall the Expensify Connect bundle before continuing. [Learn how to update the Expensify Connect bundle in NetSuite](/articles/new-expensify/connections/netsuite/Update-Expensify-Connect-Bundle-in-NetSuite).

---

## How to make the Created From field visible on the export form

Expensify exports with the transaction form marked as **Preferred** in NetSuite. If you set a custom form under **Workspaces > [workspace name] > Accounting > Advanced > Custom form ID**, Expensify uses that form instead.

1. Go to **Customization > Forms > Transaction Forms**.
2. Locate the transaction form Expensify uses for your export type.
3. Select **Edit**.
4. Go to **Screen Fields > Main**.
5. Confirm the **Created From** field is marked as **Show**.
6. Select **Save**.

---

## How to sync the workspace in Expensify

After updating NetSuite:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Accounting**.
2. Select **More (⋮)** next to the NetSuite connection.
3. Select **Sync now**.

---

## How to retry the export

1. Open the report.
2. Retry exporting to NetSuite.

If the Created From field applies to your export type, is visible on the export form, and is editable by the Expensify role, the export should complete successfully.

---

## How to fix the NS0068 export error for Expensify Card journal entries

If you are exporting **Expensify Card transactions as journal entries**, confirm the Created From field is set up for journal entries.

1. Go to **Customization > Lists, Records, & Fields > Transaction Body Fields** and open **custbody_createdfrom_expensify**.
2. On the **Applies To** tab, confirm **Journal** is selected, then select **Save**.
3. Go to **Customization > Forms > Transaction Forms**.
4. Select **Edit** next to the preferred journal entry form.
5. Go to **Screen Fields > Main**.
6. Confirm **Created From** is marked as **Show**.
7. Select **Save**.

Then sync the workspace in Expensify before retrying the export.

---

# FAQ

## Does the NS0068 export error affect all export types?

It affects any export type where the Created From field doesn't apply to the record, is hidden on the export form, or isn't editable by the Expensify role.

## Do I need NetSuite admin access to fix the NS0068 export error?

Yes. Updating custom field settings and transaction form visibility requires NetSuite administrator permissions.

## Do I need to reconnect the integration?

No. Updating the Created From field settings and selecting **Sync now** is typically sufficient. If the field is missing, update or reinstall the Expensify Connect bundle first.
