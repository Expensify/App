---
title: CER061 Export Error in Certinia Integration
description: Learn what the CER061 export error means in Certinia and how to correct credit terms configuration to restore successful exports.
keywords: CER061, Certinia export error, object validation failed, credit terms not defined, PSA project account error, FFA resource account error, Expensify Certinia sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER061 export error caused by incorrect credit term configuration. Does not cover other Certinia error codes.
---

# CER061 Export Error in Certinia Integration

If you see the error:

CER061: Object validation failed. The credit terms for the selected account are not correctly defined.

This means the account used for the export does not have properly configured credit terms in Certinia, preventing the export from completing.

---

## Why the CER061 Export Error Happens in Certinia

The CER061 error typically indicates:

- Required credit term fields are missing on the associated account.
- Credit term configuration does not meet Certinia validation requirements.
- The export is being blocked due to incomplete payment term settings.

The affected account depends on your Certinia configuration:

- **PSA/SRP environments** use the Project account.
- **FFA environments** use the Resource-linked account.

This is a Certinia account configuration issue, not a Workspace configuration issue.

---

## How to Fix the CER061 Export Error

This issue must be resolved in Certinia.

1. Log in to Certinia.
2. Navigate to the applicable account (Project account or Resource-linked account).
3. Locate the credit terms configuration.
4. Update the required fields:
   - Set **Base Date 1** to **Invoice**.
   - Enter one or more in **Days Offset**.
   - Ensure a **Currency** is selected.
5. Save your changes.

After updating the account:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After correcting the credit terms and selecting **Sync Now**, retry the export. If the error persists, confirm all required credit term fields are populated correctly.

## Does CER061 Mean My Report Failed Permanently?

No. The report remains in Expensify. The export failed due to account validation settings in Certinia.

## Is CER061 Caused by Workspace Settings?

No. CER061 is triggered by incorrect credit term configuration in Certinia. Workspace accounting settings are not the cause.
