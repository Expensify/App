---
title: CER091 Export Error: Invalid Field Name
description: Learn why CER091 appears when exporting to Certinia and how to update field accessibility settings so the export can complete successfully.
keywords: CER091, Certinia error CER091, invalid field name, field accessibility Certinia, Payable Invoice custom fields, Certinia export error, Sync Now, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER091 field accessibility error and re-syncing the Workspace. Does not cover unrelated Certinia field configuration or general object customization.
---

# CER091 Export Error: Invalid Field Name

If you see the error:

**“CER091 Export Error: Invalid field name. Please confirm field is accessible in Certinia.”**

this means a required field is not accessible to the user profile in Certinia.

Until the field is made visible and accessible, Certinia will block the export.

---

## Why CER091 Happens

Certinia requires certain fields to be accessible to the user profile connected to the integration.

If a required field is hidden or not visible under field-level security settings, Certinia cannot validate the export and returns error **CER091**.

This is a Certinia field accessibility configuration issue — not an Expensify Workspace configuration issue.

---

## Who Can Fix CER091

You must have access to manage object settings and field accessibility in Certinia (typically a Certinia Admin or Salesforce Admin).

---

## How to Update Field Accessibility in Certinia

1. Log in to Certinia.
2. Go to **Setup**.
3. Select **Build**, then expand **Create**.
4. Click **Object**.
5. Navigate to **Payable Invoice**.
6. Select **Custom Fields and Relationships**.
7. Click **View Field Accessibility**.
8. Locate the relevant employee profile.
9. If the field is marked as **Hidden**, select it.
10. Ensure both **Visible** checkboxes are selected.
11. Save your changes.

Making the field visible ensures Certinia can access and validate the data during export.

---

## How to Sync Certinia After Updating Field Accessibility

After updating field accessibility, re-sync the connection in Expensify.

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click **Sync Now**.

---

## How to Retry Exporting After CER091

After syncing:

1. Open the report you attempted to export.
2. Retry the export.
3. Confirm the export completes successfully.

If the error continues, confirm that the correct profile has visibility to the required field and that the changes were saved before syncing.

---

# FAQ

## Does CER091 mean the field does not exist?

Not necessarily. It usually means the field exists but is not accessible to the connected user profile.

---

## Is CER091 caused by Expensify settings?

No. CER091 is triggered by field accessibility settings in Certinia, not by Workspace settings in Expensify.

---

## Do I need to reconnect the Certinia integration?

No. In most cases, updating field accessibility and selecting **Sync Now** resolves the issue.
