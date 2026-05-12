---
title: CER937 Export Error in Certinia Integration
description: Learn what the CER937 export error means in Certinia and how to update the Expensify integration configuration to restore successful syncing.
keywords: CER937, Certinia export error, update Expensify in Certinia, Certinia integration update required, Expensify Certinia sync error, Workspace Admin
internalScope: Audience is Workspace Admins and Certinia Admins using the Certinia integration. Covers resolving the CER937 export error caused by an outdated Certinia integration configuration. Does not cover other Certinia error codes.
---

# CER937 Export Error in Certinia Integration

If you see the error:

CER937: Please update Expensify in Certinia.

This means Certinia has detected that the Expensify integration configuration is outdated and must be updated before exports or syncs can proceed.

---

## Why the CER937 Export Error Happens in Certinia

The CER937 error typically indicates:

- A newer version of the Expensify integration is available in Certinia.
- The existing integration configuration has not been updated.
- Certinia is blocking exports until the integration version is aligned.

This is a Certinia configuration issue, not a Workspace configuration issue.

---

## How to Fix the CER937 Export Error

This issue must be resolved in Certinia.

1. Log in to Certinia as an administrator.
2. Locate the **Expensify Integration** configuration.
3. Select the option to **Update** the integration.
4. Follow any prompts to upgrade, reinstall, or refresh metadata.
5. Confirm API credentials or OAuth tokens if prompted.
6. Save your changes.

If you do not see an update option, contact your Certinia administrator or Certinia support to confirm access to the latest integration release.

After updating Certinia:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After updating the integration and selecting **Sync Now**, retry the export. If the error persists, confirm the integration version in Certinia is current.

## Does CER937 Mean My Data Is Lost?

No. The report remains in Expensify. The export is blocked until the Certinia integration is updated.

## Is CER937 Caused by Workspace Settings?

No. CER937 is triggered by an outdated integration configuration in Certinia. Workspace accounting settings are not the cause.
