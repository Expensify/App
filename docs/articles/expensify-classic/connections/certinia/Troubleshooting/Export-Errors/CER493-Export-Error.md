---
title: CER493 Export Error in Certinia Integration
description: Learn what the CER493 export error means in Certinia and how to update field accessibility settings for GLA Code (Billable) to restore successful exports.
keywords: CER493, Certinia export error, necessary field unavailable in mapping, GLA Code Billable field error, Expense Type GLA Mapping accessibility, Expensify Certinia sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER493 export error caused by restricted access to the GLA Code (Billable) field. Does not cover other Certinia error codes.
---

# CER493 Export Error in Certinia Integration

If you see the error:

CER493: Necessary field unavailable in mapping.

This means the **GLA Code (Billable)** field is not accessible or editable for the Certinia role connected to the integration, preventing the export from completing.

---

## Why the CER493 Export Error Happens in Certinia

The CER493 error typically indicates:

- The **GLA Code (Billable)** field exists but is not accessible to the connected user role.
- The field is not marked as editable under field-level security.
- Certinia validation failed due to restricted field access.

Certinia requires the integration role to have editable access to this field when billable settings are enabled.

This is a Certinia field accessibility configuration issue, not a Workspace configuration issue.

---

## How to Fix the CER493 Export Error

This issue must be resolved in Certinia.

1. Log in to Certinia.
2. Go to **Setup**.
3. Navigate to **Object Manager** (or Build > Create > Objects, depending on your configuration).
4. Select **Expense Type GLA Mapping**.
5. Click **Fields & Relationships**.
6. Select **GLA Code (Billable)**.
7. Click **View Field Accessibility**.
8. Locate the role used for the integration.
9. Ensure the field is marked as **Editable**.
10. Save your changes.

After updating field accessibility:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After updating field accessibility and selecting **Sync Now**, retry the export. If the error persists, confirm the correct role has editable access.

## Does CER493 Mean the Field Does Not Exist?

No. The field typically exists but is not accessible or editable for the connected role.

## Is CER493 Caused by Workspace Settings?

No. CER493 is triggered by field-level security settings in Certinia. Workspace accounting settings are not the cause.
