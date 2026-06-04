---
title: NetSuite FAQ
description: Learn how to resolve common NetSuite export issues, approval mismatches, permission errors, and connection problems in Expensify.
keywords: NetSuite export not working, report not exporting automatically, manually export report NetSuite, disconnect NetSuite, accounting approved vs paid in full, pending approval NetSuite, default payable account NetSuite, Expensify NetSuite troubleshooting
internalScope: Audience is Workspace Admins and Domain Admins using the NetSuite integration. Covers common NetSuite export issues, approval settings, and connection troubleshooting. Does not cover individual NetSuite error codes.
---

# NetSuite FAQ

---

# Why Is My Report Not Automatically Exporting to NetSuite?

An error is preventing the report from exporting automatically.

You can find the error in several places:

- The preferred exporter (set in Expensify configurations) will receive an email with error details.
- The error appears in the **report comments** section.
- Reports with errors will not automatically export until the issue is resolved.

## How to Resolve Automatic Export Failures

1. Open the report in Expensify.
2. Review the error message in the comments.
3. Make the required corrections.
4. A Workspace Admin can manually export the report once fixed.

---

# Why Am I Unable to Manually Export a Report to NetSuite?

Only reports in the following statuses can be exported:

- **Approved**
- **Done**
- **Paid**

If the report is in **Draft**, selecting Export may load an empty screen.

## How to Resolve Manual Export Issues

1. Submit the report if it is in **Draft**.
2. Have an approver approve it if it is **Outstanding**.
3. Once fully approved, a Workspace Admin can export it.

---

# How Do I Disconnect the NetSuite Connection?

On web:

1. Go to the **navigation tabs on the left** and select **Workspaces**.
2. Select your Workspace.
3. Select **Accounting**.
4. Click the **three-dot icon** next to the NetSuite connection.
5. Click **Disconnect**.
6. Confirm the disconnection.

Note: Disconnecting clears all imported options from Expensify.

---

# Why Am I Seeing “You Do Not Have Permissions to Set a Value for Element…” Errors?

This typically means a required field in NetSuite is hidden or restricted.

## How to Fix Field Permission Errors

1. In NetSuite, go to **Customization > Forms > Transaction Forms**.
2. Edit the preferred export form.
3. Locate the field mentioned in the error.
4. Ensure the field is marked as **Show**.
5. Save the form.
6. Sync the connection in Expensify and retry export.

---

# What If I’ve Made All Changes and Still See the Error?

If errors persist:

- Confirm your **Expensify Connect bundle** is up to date in NetSuite.
- Review **Customization > Workflows** in NetSuite for blockers.
- Ask your NetSuite admin to confirm no custom scripts are interfering.

---

# Why Are Reports Exporting as “Accounting Approved” Instead of “Paid in Full”?

This typically happens due to:

- Missing **Location**, **Class**, or **Department** on the Bill Payment form
- Incorrect Workspace configuration in Expensify

## How to Fix Missing Classifications

In NetSuite:

1. Go to **Customization > Forms > Transaction Forms**.
2. Locate the preferred **Bill Payment** form.
3. Click **Edit** or **Customize**.
4. Under **Screen Fields > Main**, enable **Show** for:
   - Department
   - Class
   - Location
5. Save.

## How to Fix Workspace Settings

In Expensify:

1. Go to **Workspaces > [Workspace Name] > Accounting > Advanced**.
2. Confirm:
   - **Sync Reimbursed Reports** is enabled with a payment account selected.
   - **Journal Entry Approval Level** is set to **Approved for Posting**.
   - The **A/P Approval Account** matches the account used for bill payments.

To verify the A/P account:

1. Open the bill or expense report.
2. Click **Make Payment**.
3. Confirm the account matches the setting in Expensify.

---

# Why Are Reports Exporting as Pending Approval?

If reports export as **Pending Approval**, adjust NetSuite approval settings.

## For Journal Entries or Vendor Bills

In NetSuite:

1. Go to **Setup > Accounting > Accounting Preferences**.
2. Under the **General** tab, uncheck **Require Approvals** for journal entries.
3. Under the **Approval Routing** tab, disable approval for journal entries/vendor bills.

Note: This affects all journal entries, not just Expensify reports.

## For Expense Reports

1. Go to **Setup > Company > Enable Features**.
2. Under the **Employee** tab, uncheck **Approval Routing**.

Note: This also affects purchase orders.

---

# “Invite Employees & Set Approval Workflow” Is Enabled — Why Aren’t NetSuite Approvers Updating?

This setting does not overwrite manual changes to the approval table.

If an employee was added before enabling this setting, their approver will not automatically update.

## How to Fix Approver Sync Issues

Option 1:

1. Go to **Workspaces > [Workspace Name] > Members**.
2. Remove the employee.
3. Go to **Workspaces > [Workspace Name] > Accounting**.
4. Click the **three-dot icon**.
5. Click **Sync now**.
6. Re-import the employee and approver.

Option 2:

- Manually update the employee’s approver under **Workspaces > [Workspace Name] > Members**.

---

# How to Change the Default Payable Account for Reimbursable Expenses in NetSuite

## For OneWorld Accounts

1. Go to **Setup > Company > Subsidiaries**.
2. Click **Edit** next to the subsidiary.
3. Under **Preferences**, update **Default Payable Account for Expense Reports**.
4. Click **Save**.

## For Non-OneWorld Accounts

1. Go to **Setup > Accounting > Accounting Preferences**.
2. Under the **Time & Expenses** tab, update **Default Payable Account for Expense Reports**.
3. Click **Save**.

---

# Why Is My Report Exporting as Accounting Approved Instead of Paid in Full?

This may happen due to:

- Missing classifications on the Bill Payment form
- Incorrect Expensify Workspace configuration

Follow the steps above under the **Accounting Approved vs Paid in Full** section to correct the issue.

---

# Why Is My Report Not Exporting Automatically Even After Fixing Errors?

After resolving errors:

1. Go to **Workspaces > [Workspace Name] > Accounting**.
2. Click the **three-dot icon** next to the NetSuite connection.
3. Click **Sync now**.
4. Manually export the corrected report.

Automatic exports resume only after all blocking errors are cleared.

---
