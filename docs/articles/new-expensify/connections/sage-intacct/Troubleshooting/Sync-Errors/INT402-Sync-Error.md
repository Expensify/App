---
title: INT402 Sync Error: Unable to Return Values for User-Defined Dimension
description: Learn why the INT402 sync error occurs and how to properly configure user-defined dimensions and permissions in Sage Intacct.
keywords: INT402, Sage Intacct user-defined dimension error, UDD sync error, dimension permissions Sage Intacct, configure user-defined dimensions Expensify
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers the INT402 sync error related to user-defined dimensions and permission setup. Does not cover export validation errors.
---

# INT402 Sync Error: Unable to Return Values for User-Defined Dimension

If you see the error message:

**“INT402 Sync Error: Sage Intacct couldn’t return values for dimension [X]. This typically occurs when user-defined dimensions aren’t set up correctly or are missing permissions.”**

It means Sage Intacct cannot retrieve values for a user-defined dimension (UDD).

This usually indicates a setup or permissions issue in Sage Intacct or an incorrect configuration in the Workspace.

---

## Why the INT402 Sync Error Happens

The INT402 sync error occurs when:

- A user-defined dimension is not fully configured in Sage Intacct, or  
- Required permissions are missing for the integration user, or  
- The dimension is incorrectly configured in the Workspace  

If Sage Intacct cannot return dimension values, the sync will fail.

---

# How to Fix the INT402 Sync Error

Follow the steps below to verify configuration and permissions.

---

## Step 1: Verify User-Defined Dimensions in Sage Intacct

1. Log in to Sage Intacct.  
2. Go to **Platform Services > Objects > List**.  
3. Filter by **User-Defined Dimensions**.  
4. Confirm the dimension referenced in the error:
   - Is fully configured  
   - Is active  
   - Has appropriate permissions for the integration user  

Update any missing configuration or permissions and save your changes.

---

## Step 2: Reconfigure the Dimension in the Workspace

1. Go to **Workspace > [Workspace Name] > Accounting > Coding**.  
2. Disable the affected user-defined dimension.  
3. Re-add the dimension by following the steps outlined here:  
   https://help.expensify.com/articles/new-expensify/connections/sage-intacct/Configure-Sage-Intacct#user-defined-dimensions-udds  

Save your changes.

---

## Step 3: Retry the Sync

Return to **Workspace > [Workspace Name] > Accounting** and run **Sync** again.

If the dimension is properly configured and permissions are correct, the sync should complete successfully.

---

# FAQ

## Do user-defined dimensions require special permissions?

Yes. The integration user must have permission to access the dimension object in Sage Intacct.

## Should I delete and recreate the dimension?

Not necessarily. First confirm the configuration and permissions are correct. Only recreate the dimension if it is incorrectly configured.

## Does this error affect exports?

Yes. If sync fails due to a dimension issue, exports that rely on that dimension may also fail until the issue is resolved.
