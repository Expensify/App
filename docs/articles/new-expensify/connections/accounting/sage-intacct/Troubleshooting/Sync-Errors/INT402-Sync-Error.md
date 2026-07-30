---
title: INT402 Sync Error in Sage Intacct Integration
description: Learn what the INT402 sync error means and how to properly configure user-defined dimensions and permissions in Sage Intacct.
keywords: INT402, Sage Intacct user-defined dimension error, UDD sync error, dimension permissions Sage Intacct, configure user-defined dimensions Workspace, Sage Intacct integration
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers resolving the INT402 sync error related to user-defined dimensions and permission setup. Does not cover export validation or report-level errors.
---

# INT402 Sync Error in Sage Intacct Integration

If you see the error:

INT402 Sync Error: Sage Intacct couldn’t return values for dimension [X]. This typically occurs when user-defined dimensions aren’t set up correctly or are missing permissions.

This means Sage Intacct cannot retrieve values for a user-defined dimension (UDD).

This usually indicates a setup or permissions issue in Sage Intacct or an incorrect configuration in the Workspace.

---

## Why the INT402 Sync Error Happens in Sage Intacct

The INT402 error typically occurs when:

- A user-defined dimension is not fully configured in Sage Intacct.
- The dimension is inactive.
- Required permissions are missing for the integration user.
- The dimension is incorrectly configured in the Workspace.
- The integration user does not have access to the dimension object.

If Sage Intacct cannot return dimension values, the sync will fail.

This is a dimension configuration or permissions issue, not an export data issue.

---

# How to Fix the INT402 Sync Error

Follow the steps below to verify configuration and permissions.

---

## Verify User-Defined Dimensions in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Go to **Platform Services > Objects > List**.
3. Filter by **User-Defined Dimensions**.
4. Locate the dimension referenced in the error message.
5. Confirm the dimension:
   - Is fully configured.
   - Is active.
   - Has appropriate permissions assigned to the integration user.
6. Update any missing configuration or permissions.
7. Click **Save**.

Ensure the integration user has access to view and retrieve values for the dimension.

---

## Reconfigure the User-Defined Dimension in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Open the coding or dimension settings section.
5. Disable the affected user-defined dimension.
6. Save your changes.
7. Re-enable or re-add the dimension after confirming it is correctly configured in Sage Intacct.
8. Click **Save**.

Reconfiguring ensures the Workspace is aligned with the current Sage Intacct dimension setup.

---

## Run Sync

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

If the dimension is properly configured and permissions are correct, the sync should complete successfully.

---

# FAQ

## Do User-Defined Dimensions Require Special Permissions?

Yes. The integration user must have permission to access and retrieve values for the user-defined dimension object in Sage Intacct.

## Should I Delete and Recreate the Dimension?

Not necessarily. First confirm the configuration and permissions are correct. Only recreate the dimension if it is incorrectly configured or corrupted.

## Does the INT402 Error Affect Exports?

Yes. If sync fails due to a dimension issue, exports that rely on that dimension may also fail until the issue is resolved.
