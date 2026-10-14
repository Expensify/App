---
title: NS0068 Export Error in NetSuite Integration
description: Learn how to fix the NS0068 export error in NetSuite when Expensify can't set the Created From field (custbody_createdfrom_expensify) during export.
keywords: NS0068, NetSuite Created From field not visible, custbody_createdfrom_expensify, permission to set value Created From, Transaction Body Fields NetSuite, NetSuite transaction form visibility, Expensify Connect bundle, Expensify Card journal entry error, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0068 export error caused by the Created From field (custbody_createdfrom_expensify) not applying to the export record type, being hidden on the preferred form, not being editable by the Expensify role, or missing from NetSuite. Does not cover other NetSuite error codes.
---

<!-- cspell:ignore custbody createdfrom -->

# NS0068 Export Error in NetSuite Integration

If you see the error:

NS0068: NetSuite won't let Expensify set the 'Created From' field (custbody_createdfrom_expensify).

This means NetSuite is blocking Expensify from setting the **Created From** field during export.

The **Created From** field is a custom transaction body field with the ID `custbody_createdfrom_expensify`. It is added to NetSuite by the **Expensify Connect bundle**.

---

## Why the NS0068 Export Error Happens in NetSuite

The NS0068 error occurs when:

- The **Created From** field does not apply to the record type you're exporting to (for example, vendor bills, expense reports, or journal entries).
- The **Created From** field is hidden on the preferred export form.
- The role used by the Expensify connection can't edit the **Created From** field.
- The **Created From** field is missing because the **Expensify Connect bundle** is not installed or is out of date.
- Expensify Card transactions are exported as journal entries and the Journal Entry form does not show the Created From field.

Expensify must be able to write to the Created From field during export.

---

## How to Fix the NS0068 Export Error

### Check the Created From Field Settings

1. Log in to **NetSuite** as an Administrator.
2. Go to **Customization**.
3. Select **Lists, Records, & Fields**.
4. Click **Transaction Body Fields**.
5. Open the field with the ID **custbody_createdfrom_expensify**.
6. On the **Applies To** tab, confirm the field applies to the record type you're exporting to.
7. On the **Access** tab, confirm the role used by the Expensify connection has **Edit** access to the field.
8. Save the field.

If you can't find **custbody_createdfrom_expensify**, update or reinstall the **Expensify Connect bundle** in NetSuite before continuing.

---

### If Exporting Vendor Bills or Standard Transactions

1. Log in to **NetSuite** as an Administrator.
2. Go to **Customization**.
3. Select **Forms**.
4. Click **Transaction Forms**.
5. Click **Edit** next to the form marked as **Preferred** for the export type.
6. Locate the **Created From** field.
7. Ensure the field is marked as **Show**.
8. Save the form.

Then in Expensify:

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.
6. Retry exporting the report.

---

### If Exporting Expensify Card Transactions as Journal Entries

1. Log in to **NetSuite**.
2. Confirm **custbody_createdfrom_expensify** applies to journal entries, using the steps in **Check the Created From Field Settings** above.
3. Go to **Customization**.
4. Select **Forms**.
5. Click **Transaction Forms**.
6. Click **Edit** next to the preferred **Journal Entry** form.
7. Go to **Screen Fields**.
8. Open the **Main** tab.
9. Ensure the **Created From** field is marked as **Show**.
10. Save the form.

Then in Expensify:

1. Go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.
6. Retry exporting the report.

---

# FAQ

## Does NS0068 Mean My Integration Is Broken?

No. This error is caused by the Created From field settings, form visibility, or role access in NetSuite.

## Do I Need to Reconnect NetSuite?

No. Updating the field and form settings and running **Sync** is typically sufficient. If the field is missing, update or reinstall the Expensify Connect bundle first.
