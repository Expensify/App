---
title: CER091 Export Error in Certinia Integration
description: Learn what the CER091 export error means in Certinia and how to update field accessibility settings to restore successful exports.
keywords: CER091, Certinia export error, invalid field name, field accessibility Certinia, payable invoice custom field error, Expensify Certinia sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER091 export error caused by field accessibility restrictions. Does not cover other Certinia error codes.
---

# CER091 Export Error in Certinia Integration

If you see the error:

CER091: Invalid field name.

This means a required field in Certinia is not accessible to the integration user, preventing the export from completing.

---

## Why the CER091 Export Error Happens in Certinia

The CER091 error typically indicates:

- A required field exists but is hidden under field-level security.
- The integration user profile does not have visibility to the field.
- Certinia validation failed due to restricted field access.

Certinia requires required fields to be visible and accessible to the connected user profile during export.

This is a Certinia field accessibility configuration issue, not a Workspace configuration issue.

---

## How to Fix the CER091 Export Error

This issue must be resolved in Certinia.

1. Log in to Certinia.
2. Go to **Setup**.
3. Navigate to **Object Manager** (or Build > Create > Object, depending on your configuration).
4. Select **Payable Invoice**.
5. Click **Fields & Relationships**.
6. Locate the affected custom field.
7. Select **View Field Accessibility**.
8. Confirm the integration user’s profile has **Visible** access.
9. If marked as hidden, enable visibility.
10. Save your changes.

After updating field visibility:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After updating field accessibility and selecting **Sync Now**, retry the export. If the error persists, confirm the correct profile has field visibility.

## Does CER091 Mean the Field Does Not Exist?

Not necessarily. It usually means the field exists but is not accessible to the connected user profile.

## Is CER091 Caused by Workspace Settings?

No. CER091 is triggered by field accessibility settings in Certinia. Workspace accounting settings are not the cause.
