---
title: Xero FAQ
description: Learn how to resolve common Xero export issues, company card mapping problems, and connection errors in Expensify Classic.
keywords: Xero export not working, report not exporting automatically Xero, company card wrong account Xero, disconnect Xero Expensify Classic, preferred exporter domain admin, credit card misc Xero
internalScope: Audience is Workspace Admins and Domain Admins using the Xero integration in Expensify Classic. Covers common Xero export issues, company card mapping, and connection troubleshooting. Does not cover individual Xero error codes.
---

# Xero FAQ

---

# Why Is My Report Not Automatically Exporting to Xero?

An error is preventing the report from exporting automatically.

You can find the error in several places:

- The **Preferred Exporter** (set in Expensify configurations) will receive an email with error details.
- The error appears in the **report comments** section.
- Reports with errors will not automatically export until the issue is resolved.

## How to Resolve Automatic Export Failures

1. Open the report in Expensify.
2. Review the error message in the comments.
3. Make the required corrections.
4. A Workspace Admin can manually export the report once fixed.

---

# Why Am I Unable to Manually Export a Report to Xero?

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

# Why Are Company Card Expenses Exporting to the Wrong Account?

This usually means the company card mapping is incorrect or the Preferred Exporter does not have the required permissions.

## Step 1: Confirm Company Card Mapping

1. Go to **Settings > Domains > Company Cards**.
2. Click **Edit Export** for the affected card.
3. Confirm the correct Xero account is selected.
4. Save your changes.

Also confirm that the expenses display the **Card + Lock** icon, which indicates they were imported from a company card.

---

## Step 2: Confirm the Preferred Exporter Is a Domain Admin

The Preferred Exporter (used by Concierge) must be a **Domain Admin**.

If not:

- Exports will default to the fallback company card account set in the Workspace configuration.

To check:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting > Configure > Export**.
4. Confirm the **Preferred Exporter** is a Domain Admin.

---

# How Do I Disconnect the Xero Connection?

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the gray **Disconnect** button under the Xero connection.
5. Confirm the disconnection.

Note: Disconnecting clears all imported options from Expensify.

---

# Why Does It Show That I’m Already Connected to Xero?

If you see a message that you are already connected when trying to connect for the first time, the existing connection may still be active in Xero.

## How to Fix It

In Xero:

1. Go to the company you want to connect.
2. Click **App Marketplace > Go to Connected Apps**.
3. Find **Expensify** in the list.
4. Click the **three-dot icon**.
5. Click **Disconnect**.

Then in Expensify:

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Attempt the connection again.

---

# Why Do Non-Reimbursable Expenses Show “Credit Card Misc” Instead of the Merchant?

If a merchant name in Expensify does not exactly match a Contact in Xero (for example, `Merchant` vs. `Merchant.com`), the expense will default to **Expensify Credit Card Misc** to prevent duplicate contacts.

## How to Fix It

Use **Expense Rules** in Expensify to standardize merchant names.

Learn more here:  
[Expense Rules (Expensify Classic)](https://help.expensify.com/articles/expensify-classic/expenses/Expense-Rules)

---

# Why Are Company Card Expenses Still Exporting to the Wrong Account?

If the issue persists:

1. Confirm company cards are mapped correctly:
   - **Settings > Domains > Company Cards > Edit Export**
2. Confirm expenses display the **Card + Lock** icon.
3. Verify the Preferred Exporter is a **Domain Admin**:
   - **Settings > Workspaces > [Workspace Name] > Accounting > Configure > Export**
4. Confirm you are reviewing the correct Workspace if multiple Workspaces are connected.

---

# What If I Fixed the Settings but Exports Still Fail?

After making updates:

1. Go to **Settings > Workspaces > [Workspace Name] > Accounting**.
2. Click **Sync now**.
3. Retry exporting the report.

If the issue persists, review:

- Company card mapping
- Preferred Exporter permissions
- Category and contact sync status

---

# FAQ

## Does disconnecting Xero remove my configuration?

Yes. Disconnecting removes imported categories, contacts, and settings. Take screenshots of your configuration before disconnecting.

## Do I need Xero admin access for most fixes?

Yes. Many connection, account, and contact updates require Xero admin permissions.

---
