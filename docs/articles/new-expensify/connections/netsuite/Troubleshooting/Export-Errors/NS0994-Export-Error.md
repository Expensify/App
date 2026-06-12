---
title: NS0994 Export Error in NetSuite Integration
description: Learn what the NS0994 export error means and how to update company card export settings to use a valid vendor instead of Default.
keywords: NS0994, NetSuite enter value for entity, company card export vendor error, Default card vendor not accepted NetSuite, Domain Company Cards export error, Expensify NetSuite integration, Domain Admin
internalScope: Audience is Domain Admins and Workspace Admins using the NetSuite integration with company cards. Covers resolving the NS0994 export error caused by invalid default company card export vendor settings. Does not cover employee or vendor email mismatch issues.
---

# NS0994 Export Error in NetSuite Integration

If you see the error:

NS0994 Export Error: Enter value for 'entity'. Please confirm the associated vendor record includes the 'name' field.

This means the vendor or export account selected for the company card is not valid in NetSuite.

This commonly happens when the company card is set to **Default** instead of a specific vendor or card account.

---

## Why the NS0994 Export Error Happens in NetSuite

The NS0994 error typically occurs when:

- The company card export setting is set to **Default**.
- No specific vendor (entity) is selected for company card exports.
- The selected vendor record is incomplete or missing required fields such as **Name**.
- NetSuite requires a valid vendor (entity) for the transaction.

NetSuite cannot process company card transactions without a valid vendor reference.

This is a company card export configuration issue, not an employee or vendor email mismatch issue.

---

## How to Fix the NS0994 Export Error

Follow the steps below to update the company card export settings.

---

## Update Company Card Export Settings in Domain Settings

1. Go to **Settings > Domains**.
2. Select your Domain.
3. Click **Company Cards**.
4. Locate the card associated with the report.
5. Click **Edit Export** to the right of the card.
6. In the dropdown, select a specific **NetSuite vendor** or **card account** instead of **Default**.
7. Click **Save**.

Do not leave the company card export setting set to **Default**.

---

## Sync the Workspace and Retry the Export

After updating the company card export mapping:

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

Then retry exporting the report.

If a valid vendor or card account is selected, the export should complete successfully.

---

# FAQ

## Can I Leave the Company Card Export Set to Default?

No. A specific vendor or card account must be selected for company card exports to work correctly.

## Do I Need Domain Admin Access to Fix the NS0994 Export Error?

Yes. Updating company card export settings requires Domain Admin permissions.

## Does This Error Affect Only Company Card Transactions?

Yes. This error applies specifically to company card exports that require a valid vendor (entity).
