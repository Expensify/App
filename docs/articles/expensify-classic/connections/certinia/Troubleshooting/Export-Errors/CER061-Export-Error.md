---
title: CER061 Export Error: Object Validation Failed – Credit Terms Not Correctly Defined
description: Learn why CER061 appears when exporting to Certinia and how to correctly configure credit terms on the related account to restore successful exports.
keywords: CER061, Certinia error CER061, object validation failed, credit terms not defined, Certinia export error, PSA project account, FFA resource account, Sync Now, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER061 credit terms configuration error and re-syncing the Workspace. Does not cover unrelated Certinia validation errors or general Certinia account setup.
---

# CER061 Export Error: Object Validation Failed – Credit Terms Not Correctly Defined

If you see the error:

**“CER061 Export Error: Object validation failed. The credit terms for the selected account are not correctly defined.”**

this means the account used for the export does not have properly configured credit terms in Certinia.

Until the credit terms are corrected, Certinia will block the export.

---

## Why CER061 Happens

Certinia requires valid credit term settings for the account associated with the exported report.

If required credit term fields are missing or incorrectly configured, Certinia fails validation and returns error **CER061**.

The affected account depends on your Certinia configuration:

- **PSA/SRP users:** Project account  
- **FFA users:** Resource-linked account  

This is a Certinia account configuration issue — not an Expensify Workspace configuration issue.

---

## Who Can Fix CER061

You must have access to edit account settings in Certinia (typically a Certinia Admin) to resolve this error.

---

## How to Fix Credit Terms in Certinia

### Step 1: Identify the Account Used for Export

Determine which account is tied to the report export:

- PSA/SRP environments use the **Project account**
- FFA environments use the **Resource-linked account**

---

### Step 2: Update Credit Terms in Certinia

1. Log in to Certinia.
2. Navigate to the applicable account (Project account or Resource-linked account).
3. Locate the credit terms configuration.
4. Update the following fields:

   - **Base Date 1** → Set to **Invoice**  
     This field determines when payment terms begin, such as from the invoice date.
   - **Days Offset** → Enter **one or more**
   - Ensure a **Currency** is selected

5. Save your changes.

These settings allow Certinia to correctly calculate payment terms and pass validation during export.

---

## How to Sync Certinia After Updating Credit Terms

After updating the account settings, re-sync the connection in Expensify.

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click **Sync Now**.

---

## How to Retry Exporting After CER061

After syncing:

1. Open the report you attempted to export.
2. Retry the export.
3. Confirm the export completes successfully.

If the error continues, confirm that:

- The correct account was updated.
- **Base Date 1** is set to Invoice.
- **Days Offset** is populated with one or more.
- A currency is selected.

---

# FAQ

## Does CER061 mean my report failed permanently?

No. The export failed due to missing or invalid credit term settings in Certinia. Once corrected, you can retry the export.

---

## Is CER061 caused by Expensify settings?

No. CER061 is triggered by incorrect credit term configuration in Certinia, not by Workspace settings in Expensify.

---

## Do I need to reconnect the Certinia integration?

No. In most cases, correcting the credit terms and selecting **Sync Now** resolves the issue.
