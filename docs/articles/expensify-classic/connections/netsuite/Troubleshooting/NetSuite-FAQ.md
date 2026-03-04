---
title: NetSuite FAQ
description: Learn how to troubleshoot common NetSuite integration issues, including export failures, approval settings, company card mapping, and disconnecting the connection.
keywords: NetSuite export FAQ, report not exporting NetSuite, manually export report NetSuite, company card wrong account NetSuite, disconnect NetSuite integration, approval workflow NetSuite Expensify, Expensify NetSuite troubleshooting, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers common export, approval, and configuration questions. Does not cover specific NetSuite error codes.
---

# NetSuite FAQ

## Why Is My Report Not Automatically Exporting to NetSuite?

An error is preventing the report from exporting automatically.

You can find the error in several ways:

- The **preferred exporter** (set in Workspace accounting settings) receives an email with error details.
- The error appears in the report’s **comments section**.
- Automatic export is paused until the issue is resolved.

### How to Resolve Automatic Export Errors

1. Open the report in Expensify.
2. Review the error message in the comments.
3. Make the required corrections.
4. Once resolved, a Workspace Admin can manually export the report.

Automatic exports will resume after errors are cleared.

---

## Why Am I Unable to Manually Export a Report to NetSuite?

Only reports in the following statuses can be exported:

- **Approved**
- **Done**
- **Paid**

If the report is in **Draft** status, the export button may load an empty screen.

### How to Fix Manual Export Issues

1. Submit the report if it is in Draft status.
2. Have an approver approve it if it is Outstanding.
3. Once the report is Approved, Done, or Paid, a Workspace Admin can manually export it.

---

## Why Are Company Card Expenses Exporting to the Wrong Account?

This usually means the company card export mapping is incorrect.

### How to Confirm Company Card Mapping

1. Go to **Settings**.
2. Select **Domains**.
3. Click **Company Cards**.
4. Click **Edit Export** for the affected card.
5. Confirm the correct NetSuite account is selected.
6. Click **Save**.

Also confirm:

- The expenses display the **Card + Lock** icon.
- The preferred exporter is a **Domain Admin**.

If the preferred exporter is not a Domain Admin, exports may default to the fallback company card account set in Workspace configurations.

To verify the preferred exporter:

1. Go to **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.

---

## How Do I Disconnect the NetSuite Connection?

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click the gray **Disconnect** button under the connection.
6. Confirm to disconnect.

Note: Disconnecting clears all imported options from Expensify.

---

## Why Am I Seeing “You Do Not Have Permissions to Set a Value for Element…” Errors?

This usually means:

- A required field is hidden on the preferred NetSuite form.
- The field is mandatory but not being populated by Expensify.

To fix:

1. In NetSuite, go to **Customization** > **Forms** > **Transaction Forms**.
2. Edit the preferred export form.
3. Confirm the field mentioned in the error is marked as **Show**.
4. Save the form.
5. In Expensify, click **Sync** and retry the export.

---

## What If I’ve Made All Changes and Still See the Error?

Check the following:

- Confirm your **Expensify Connect bundle version** is up to date in NetSuite.
- Review **Customization > Workflows** for blockers.
- Ask your NetSuite Admin to confirm no custom scripts are interfering.

---

## Why Are Reports Exporting as “Accounting Approved” Instead of “Paid in Full”?

This usually happens due to:

- Missing **Location, Class, or Department** values.
- Misconfigured Workspace settings in Expensify.
- Bill Payment form fields not set to **Show** in NetSuite.

### How to Fix Missing Locations, Classes, or Departments

1. In NetSuite, go to **Customization** > **Forms** > **Transaction Forms**.
2. Find the preferred **Bill Payment** form.
3. Click **Edit** or **Customize**.
4. Under **Screen Fields > Main**, enable **Show** for:
   - Department
   - Class
   - Location
5. Save changes.

### How to Fix Workspace Configuration

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure** > **Advanced**.
6. Confirm:
   - **Sync Reimbursed Reports** is enabled with a payment account selected.
   - **Journal Entry Approval Level** is set to **Approved for Posting**.
   - The **A/P Approval Account** matches the account used in NetSuite.

To verify the A/P Approval Account:

1. Open the bill or expense report in NetSuite.
2. Click **Make Payment**.
3. Confirm the account matches what is configured in Expensify.

---

## Why Are Reports Exporting as “Pending Approval”?

This means NetSuite approval routing is enabled.

### For Journal Entries or Vendor Bills

1. In NetSuite, go to **Setup** > **Accounting** > **Accounting Preferences**.
2. Under the **General** tab, uncheck **Require Approvals on Journal Entries**.
3. Under the **Approval Routing** tab, disable approval for journal entries or vendor bills.

Note: This affects all journal entries in NetSuite.

### For Expense Reports

1. Go to **Setup** > **Company** > **Enable Features**.
2. Under the **Employees** tab, uncheck **Approval Routing**.

Note: This also affects purchase orders.

---

## “Invite Employees & Set Approval Workflow” Is Enabled — Why Aren’t NetSuite Approvers Being Set?

This setting does not overwrite manual approval changes.

If an employee was added before enabling this setting:

- The integration will not automatically update their approver.

### How to Fix

Option 1:

1. Go to **Settings** > **Workspaces** > **Members**.
2. Remove the employee from the Workspace.
3. Go to **Settings** > **Workspaces** > **Accounting**.
4. Click **Sync Now** to re-import the employee with their NetSuite supervisor.

Option 2:

- Manually update the employee’s approver under:
  - **Settings** > **Workspaces** > **Members**

---

## How to Change the Default Payable Account for Reimbursable Expenses in NetSuite

### For OneWorld Accounts

1. Go to **Setup** > **Company** > **Subsidiaries**.
2. Click **Edit** next to the subsidiary.
3. Under **Preferences**, update the **Default Payable Account for Expense Reports**.
4. Click **Save**.

### For Non-OneWorld Accounts

1. Go to **Setup** > **Accounting** > **Accounting Preferences**.
2. Open the **Time & Expenses** tab.
3. Update the **Default Payable Account for Expense Reports**.
4. Click **Save**.

---

## Still Need Help?

If you’ve confirmed all configurations and are still experiencing issues:

- Review your NetSuite bundle version.
- Confirm no custom workflows or scripts are blocking transactions.
- Contact Concierge with the Workspace name and report ID for further review.
