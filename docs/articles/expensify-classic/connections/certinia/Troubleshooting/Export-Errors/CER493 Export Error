---
title: CER493 Export Error: Necessary Field Unavailable in Mapping
description: Learn why CER493 appears when exporting to Certinia and how to make the GLA Code (Billable) field accessible and editable for the connected role.
keywords: CER493, Certinia error CER493, necessary field unavailable in mapping, GLA Code Billable, Expense Type GLA Mapping, field accessibility Certinia, Sync Now, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER493 field accessibility error related to GLA Code (Billable) and re-syncing the Workspace. Does not cover unrelated Certinia mapping configuration or general GLA setup.
---

# CER493 Export Error: Necessary Field Unavailable in Mapping

If you see the error:

**“CER493 Export Error: Necessary field unavailable in mapping. Please confirm 'GLA Code (Billable)' is accessible and editable to use role connected.”**

this means the **GLA Code (Billable)** field is either not accessible or not editable for the Certinia role used to connect the integration.

Until the field is accessible and editable, Certinia will block the export.

---

## Why CER493 Happens

Certinia requires the **GLA Code (Billable)** field when billable settings are enabled.

If the connected user role does not have proper field-level access to this field, Certinia cannot complete the export and returns error **CER493**.

This is a Certinia field accessibility configuration issue — not an Expensify Workspace configuration issue.

---

## Who Can Fix CER493

You must have access to manage object settings and field accessibility in Certinia (typically a Certinia Admin or Salesforce Admin).

---

## How to Make GLA Code (Billable) Editable in Certinia

1. Log in to Certinia.
2. Go to **Setup**.
3. Navigate to **Build**.
4. Select **Create**.
5. Click **Objects**.
6. Open **Expense Type GLA Mapping**.
7. Select **Custom Fields and Relationships**.
8. Click **GLA Code (Billable)**.
9. Select **View Field Accessibility**.
10. Locate the role used to connect Certinia in Expensify.
11. Ensure the field is marked as **Editable**.
12. Save your changes.

The connected integration role must have editable access to the **GLA Code (Billable)** field for exports to succeed.

---

## How to Sync Certinia After Updating Field Accessibility

After updating the field accessibility, re-sync the connection in Expensify.

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click **Sync Now**.

---

## How to Retry Exporting After CER493

After syncing:

1. Open the report you attempted to export.
2. Retry the export.
3. Confirm the export completes successfully.

If the error continues, confirm that:

- The correct role was updated.
- The **GLA Code (Billable)** field shows as Editable.
- The changes were saved before syncing.

---

# FAQ

## Does CER493 mean the field does not exist?

No. The field typically exists but is not accessible or editable for the connected role.

---

## Is CER493 caused by Expensify settings?

No. CER493 is triggered by field-level security settings in Certinia, not by Workspace settings in Expensify.

---

## Do I need to reconnect the Certinia integration?

No. In most cases, updating field accessibility and selecting **Sync Now** resolves the issue.
