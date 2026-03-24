---
title: ONL097 Export Error in QuickBooks Online Integration
description: Learn what the ONL097 export error means in QuickBooks Online and how to configure vendor settings when exporting reimbursable expenses as journal entries.
keywords: ONL097, QuickBooks Online export error, vendor required in name field, journal entry Accounts Payable QuickBooks, reimbursable expense export error, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL097 export error caused by vendor requirements when exporting reimbursable expenses as Journal Entries to Accounts Payable. Does not cover other QuickBooks Online error codes.
---

# ONL097 Export Error in QuickBooks Online Integration

If you see the error:

ONL097: Please select a vendor in the Name field.

This means reimbursable expenses are being exported as Journal Entries to an Accounts Payable account, and QuickBooks Online requires a Vendor in the Name field, preventing the export from completing.

---

## Why the ONL097 Export Error Happens in QuickBooks Online

The ONL097 error typically indicates:

- Reimbursable expenses are exported as **Journal Entries**.
- The export account is **Accounts Payable (A/P)**.
- A Vendor record does not exist or is not selected.
- Employee records are enabled in QuickBooks Online.

When posting Journal Entries to Accounts Payable, QuickBooks Online requires a Vendor in the Name field.

This is a QuickBooks Online export configuration issue, not a Workspace configuration issue.

---

## How to Fix the ONL097 Export Error

You can resolve this by adjusting export settings or creating Vendor records.

### Option 1: Change the Export Type to Check

If you do not want to use Vendor records:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Change the export type for **Reimbursable expenses** to **Check**.
7. Click **Save**.

Retry exporting the report.

---

### Option 2: Enable Automatically Create Entities

If you want Expensify to automatically create Vendor records:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Advanced** tab.
6. Enable **Automatically Create Entities**.
7. Click **Save**.

Then click **Sync Now** and retry exporting the report.

---

### Option 3: Manually Create a Vendor Record

If you prefer manual control:

1. Log in to QuickBooks Online.
2. Go to **Vendors**.
3. Create a Vendor record for the report creator or submitter.
4. Ensure the email address exactly matches the email used in Expensify.
5. Save the record.

After creating the Vendor:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After adjusting export settings or creating a Vendor record, retry the export.

## Does ONL097 Mean Employee Records Are Configured Incorrectly?

No. It means QuickBooks requires a Vendor record when posting Journal Entries to Accounts Payable.

## Do I Need to Reconnect QuickBooks Online?

No. Updating export settings or Vendor records and running **Sync Now** is typically sufficient.
