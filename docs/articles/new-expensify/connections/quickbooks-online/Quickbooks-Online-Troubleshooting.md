---
title: QuickBooks Online Troubleshooting
description: A list of common QuickBooks Online errors and how to resolve them
keywords: [New Expensify, QuickBooks Online errors, QBO export error, accounting sync, export failed]
---


Sometimes reports may fail to export or sync with QuickBooks Online. This guide outlines common errors and how to resolve them.

---

# Issue: Report won’t automatically export to QuickBooks Online

If an error occurs during automatic export:

- You’ll receive an email with error details
- The error will appear in the related Expense Chat (red dot next to report)
- Auto-sync errors also appear in the related **#admins** room with a link to the accounting settings

Errors will prevent automatic export until resolved.

## How to resolve

1. Open the expense
2. Make the required corrections
3. An admin must go to the report’s **Details** tab and click **Export**

---

# Issue: Unable to manually export a report

Only reports in **Approved**, **Done**, or **Paid** status can be exported. If the report is a **Draft**, the export button will load an empty screen.

## How to resolve

1. Submit the report (if it's a Draft)
2. Have an approver approve it (if it's Outstanding)
3. Then, a Workspace Admin can manually export the report

---

# Error: When exporting billable expenses, please make sure the account in QuickBooks Online has been marked as billable

This happens when the category used is not marked as billable.

## How to resolve

1. Log in to QuickBooks Online
2. Go to **Gear > Company Settings > Expenses**
3. Enable **Make expenses and items billable**
4. If “In multiple accounts” is selected:
   - Go to **Chart of Accounts**
   - Click **Edit** on the relevant account
   - Mark as billable and assign an income account
5. Sync the connection in Expensify under **Workspaces > [Workspace Name] > Accounting > QuickBooks Online**
6. Open the report and re-export

---

# Error: Feature Not Included in Subscription

This occurs when your QuickBooks subscription doesn’t support a selected feature.

## How to resolve

Turn off the unsupported feature in Expensify or upgrade your QuickBooks Online plan.

**Note:** QuickBooks Self-Employed is not supported in Expensify.

---

# Error: Error Creating Vendor

Occurs when a matching Employee Record already exists in QBO with the same name.

## How to resolve

**Option 1**:

1. Log in to QuickBooks Online
2. Go to **Employee Records** and edit the name
3. Sync your QuickBooks Online connection
4. Re-export the report

**Option 2**:

1. Manually create vendor records in QBO with matching email addresses
2. In Expensify, turn off **Automatically Create Entities** under **Workspaces > [Workspace Name] > Accounting > Advanced**

---

# Error: When You Use Accounts Payable, You Must Choose a Vendor in the Name Field

Occurs when exporting reimbursable expenses as Journal Entries to an A/P account.

## How to resolve

- **Option 1**: Change export type in **Accounting > Export** to something other than Journal Entry
- **Option 2**: Enable **Automatically Create Entities**
- **Option 3**: Manually create vendor records in QBO

---

# Error: Items marked as billable must have sales information checked

Occurs when an item used does not have sales info enabled.

## How to resolve

1. Log in to QuickBooks Online
2. Go to your **Items list**
3. Click **Edit** on the relevant item
4. Check **Sales**, assign an income account, and save
5. Sync the connection in Expensify under **Workspaces > [Workspace Name] > Accounting > QuickBooks Online**
6. Re-export the report

---

# Error: Couldn't Connect to QuickBooks Online

Occurs when your QBO credentials have changed or expired

Also appears as: **OAuth Token Rejected**

## How to resolve

1. Go to **Workspaces > [Workspace Name] > Accounting > QuickBooks Online**
2. Click **Sync Now**
3. In the pop-up, click **Reconnect** and log in with your current QBO credentials

If using new credentials, reconfigure settings after reconnecting. Take a screenshot of the settings beforehand.

---

# Error: Duplicate Document Number

This occurs if QBO is set to flag duplicate bill numbers.

## How to resolve

1. Log in to **QuickBooks Online**
2. Head to **Settings > Advanced**
3. Under **Other Preferences**, set “Warn if duplicate bill number is used” to **Off**
4. Sync the connection
5. Re-export the report

---

# Error: Currency mismatch with A/R or A/P accounts

Occurs when the currency of the vendor record doesn’t match the currency on the A/P account.

## How to resolve

1. Log in to QuickBooks Online
2. Open the **Vendor Record**
3. Confirm:
   - Correct currency
   - Associated A/P account
   - Email matches Expensify user

**If you have duplicate vendors with the same email and different currencies**:

1. Remove the email from the unwanted vendor
2. Sync Expensify
3. Re-export the report

**If issues persist**:

- In Expensify, go to **Accounting > Export**
- Check that the selected A/P accounts use the correct currency

---

# FAQ

## Why are company card expenses exporting to the wrong account?

1. Go to **Settings > Domains > Company Cards**
2. Click **Edit Export** for the affected card and confirm the correct account
3. Verify that expenses have the **Card + Lock** icon (to be mapped correctly)

**Is the exporter a domain admin?**

- The preferred exporter (used by Concierge) must be a domain admin
- If not, exports will default to the fallback company card account

Check the exporter's role in **Workspaces > [Workspace Name] > Accounting > QuickBooks Online > Export**

## How do I disconnect the QuickBooks Online connection?

1. Click your profile image in the bottom-left menu
2. Go to **Workspaces**
3. Select your workspace
4. Click **Accounting**
5. Click the **three-dot icon** next to QuickBooks Online and select **Disconnect**
6. Confirm to disconnect

**Note:** This clears all imported options from Expensify

## Can I export negative expenses?

Yes — QuickBooks Online accepts negative expenses across all export types.

