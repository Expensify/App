---
title: NS0021 Export Error in NetSuite Integration
description: Learn how to fix the NS0021 export error in NetSuite when there is an invalid tax code reference.
keywords: NS0021, NetSuite invalid tax code reference, tax group mapping error NetSuite, GST 10% NCT-AU, No GST 0% NCF-AU, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0021 export error caused by incorrect tax group mappings. Does not cover other NetSuite error codes.
---

# NS0021 Export Error in NetSuite Integration

If you see the error:

NS0021: Invalid tax code reference.

This means the tax code mapped in NetSuite does not match the expected tax group configuration.

---

## Why the NS0021 Export Error Happens in NetSuite

The NS0021 error occurs when:

- A tax group in NetSuite is incorrectly mapped.
- The tax code used in Expensify does not align with the NetSuite tax group.
- The wrong tax reference is assigned for GST or No GST transactions.

Incorrect tax group mapping causes NetSuite to reject the export.

---

## How to Fix the NS0021 Export Error

Review and update the tax group mapping in NetSuite.

### Confirm the Following Tax Mappings

- **GST 10%** should map to **NCT-AU**, not **TS-AU**.
- **No GST 0%** should map to **NCF-AU**, not **TFS-AU**.

### Steps to Verify in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Navigate to the **Tax Code** or **Tax Group** settings.
3. Locate the relevant tax codes.
4. Confirm the correct mapping for:
   - GST 10%
   - No GST 0%
5. Update the mappings if needed.
6. Save your changes.

---

## Sync and Retry the Export

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.
6. Retry exporting the report.

Once the tax groups are mapped correctly, the export should complete successfully.

---

# FAQ

## Does NS0021 Mean My Tax Rates Are Incorrect?

Not necessarily. The issue is typically with the tax group reference, not the tax rate itself.

## Do I Need to Reconnect NetSuite?

No. Updating the tax group mappings and running **Sync** in Expensify is usually sufficient.
