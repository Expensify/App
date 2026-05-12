---
title: NS0042 Export Error in NetSuite Integration
description: Learn what the NS0042 export error means and how to match vendor subsidiary and email settings between NetSuite and the Workspace.
keywords: NS0042, NetSuite vendor already exists, vendor subsidiary mismatch NetSuite, vendor email mismatch NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0042 export error caused by vendor record subsidiary and email mismatches. Does not cover employee record mismatches or role permission issues.
---

# NS0042 Export Error in NetSuite Integration

If you see the error:

NS0042 Export Error: Vendor already exists in NetSuite. Please make sure vendor record subsidiary and email matches between NetSuite and Expensify.

This means the Workspace attempted to create a new vendor record, but NetSuite already has a vendor with the same name.

This typically happens when the existing vendor record cannot be matched due to a subsidiary or email mismatch.

---

## Why the NS0042 Export Error Happens in NetSuite

The NS0042 error typically occurs when:

- The Workspace cannot locate an existing vendor record in NetSuite.
- The integration attempts to create a new vendor record.
- A vendor with the same name already exists in NetSuite.
- The vendor’s **email address** does not match between NetSuite and the Workspace.
- The vendor’s **subsidiary** does not match the subsidiary configured in the Workspace.

If either the email or subsidiary differs, NetSuite cannot match the vendor and blocks the duplicate record.

This is a vendor record configuration issue, not an employee record or role permission issue.

---

## How to Fix the NS0042 Export Error

Follow the steps below to correct the vendor record.

### Confirm Vendor Settings in NetSuite

1. Log in to NetSuite as an administrator.
2. Locate the vendor record associated with the report creator or submitter.
3. Confirm that:
   - The **Email address** exactly matches the email used in the Workspace.
   - The **Subsidiary** matches the subsidiary configured for the export.
4. Update any incorrect fields.
5. Click **Save**.

### Sync the Workspace

After confirming or updating the vendor record:

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

### Retry the Export

1. Open the report.
2. Retry exporting to NetSuite.

If the vendor’s email and subsidiary match correctly, the export should complete successfully.

---

# FAQ

## Why Is the Workspace Trying to Create a New Vendor?

If the integration cannot find a vendor record that matches both the email and subsidiary, it attempts to create a new vendor during export.

## Do I Need NetSuite Admin Access to Fix the NS0042 Export Error?

Yes. Updating vendor records in NetSuite requires appropriate permissions.

## Does the Email Have to Match Exactly?

Yes. The vendor email must match exactly, including spelling and formatting, for NetSuite to recognize the existing record.
