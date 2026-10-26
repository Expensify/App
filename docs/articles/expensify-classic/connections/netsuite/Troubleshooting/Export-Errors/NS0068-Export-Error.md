---
title: NS0068 Export Error in NetSuite Integration
description: Learn how to fix the NS0068 export error in NetSuite when Expensify can't set the Created From field (custbody_createdfrom_expensify) during export.
keywords: NS0068, NetSuite Created From field not visible, custbody_createdfrom_expensify, permission to set value Created From, Transaction Body Fields NetSuite, NetSuite transaction form visibility, Expensify Connect bundle, Expensify Card journal entry error, Expensify NetSuite export error, workspace admin
internalScope: Audience is workspace admins using the NetSuite integration. Covers fixing the NS0068 export error caused by the Created From field (custbody_createdfrom_expensify) not applying to the export record type, being hidden on the export form, not being editable by the Expensify role, or missing from NetSuite. Does not cover other NetSuite error codes.
---

<!-- cspell:ignore custbody createdfrom -->

# NS0068 Export Error in NetSuite Integration

If you see the error:

NS0068: NetSuite won't let Expensify set the 'Created From' field (custbody_createdfrom_expensify).

This means NetSuite is blocking Expensify from setting the **Created From** field during export.

The **Created From** field is a custom transaction body field with the ID `custbody_createdfrom_expensify`. The **Expensify Connect bundle** adds it to NetSuite.

---

## Why the NS0068 export error happens in NetSuite

The NS0068 error occurs when:

- The **Created From** field does not apply to the record type you're exporting to (vendor bills, expense reports, or journal entries).
- The **Created From** field is hidden on the preferred export form.
- The role used by the Expensify connection can't edit the **Created From** field.
- The **Created From** field is missing because the **Expensify Connect bundle** is not installed or is out of date.
- Expensify Card transactions are exported as journal entries and the journal entry form does not show the Created From field.

Expensify must be able to write to the Created From field during export.

---

## How to check the Created From field settings in NetSuite

1. Log in to **NetSuite** as an administrator.
2. Go to **Customization > Lists, Records, & Fields > Transaction Body Fields**.
3. Open the field with the ID **custbody_createdfrom_expensify**.
4. On the **Applies To** tab, confirm the option for your export type is selected: **Purchase** for vendor bills, **Expense Report** for expense reports, or **Journal** for journal entries.
5. On the **Access** tab, confirm **Default Access Level** is **Edit**. If the **Role** list includes the role used by the Expensify connection, such as **Expensify Integration**, confirm its access level is also **Edit**.
6. Select **Save**.

If you can't find **custbody_createdfrom_expensify**, install or update the Expensify Connect bundle in NetSuite before continuing. [Learn how to install the Expensify Connect bundle in NetSuite](/articles/expensify-classic/connections/netsuite/Connect-To-NetSuite).

---

## How to show the Created From field on vendor bill and expense report forms

1. Log in to **NetSuite** as an administrator.
2. Go to **Customization > Forms > Transaction Forms**.
3. Select **Edit** next to the form marked as **Preferred** for the export type. If you set a custom form ID for this export type in New Expensify, edit that form instead.
4. Go to **Screen Fields > Main**.
5. Confirm the **Created From** field is marked as **Show**.
6. Select **Save**.

---

## How to show the Created From field on Expensify Card journal entry forms

1. Log in to **NetSuite** as an administrator.
2. Confirm **custbody_createdfrom_expensify** applies to journal entries, using the steps in **How to check the Created From field settings in NetSuite** above.
3. Go to **Customization > Forms > Transaction Forms**.
4. Select **Edit** next to the preferred **Journal Entry** form.
5. Go to **Screen Fields > Main**.
6. Confirm the **Created From** field is marked as **Show**.
7. Select **Save**.

---

## How to sync NetSuite and retry the export

After updating NetSuite:

1. Go to **Settings > Workspaces > [workspace name] > Accounting**.
2. Select **Sync Now**.
3. Retry exporting the report.

---

# FAQ

## Does NS0068 mean my integration is broken?

No. This error is caused by the Created From field settings, form visibility, or role access in NetSuite.

## Do I need to reconnect NetSuite?

No. Updating the field and form settings and selecting **Sync Now** is typically sufficient. If the field is missing, install or update the Expensify Connect bundle first.
