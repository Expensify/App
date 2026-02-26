---
title: INT043 Export Error: xml_gateway User Is Missing Required Permissions
description: Learn why the INT043 export error occurs and how to update xml_gateway user or role permissions in Sage Intacct.
keywords: INT043, xml_gateway permissions error, Sage Intacct user permissions missing, role subscriptions Sage Intacct, export permission failure
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers the INT043 export error related to missing xml_gateway user or role permissions. Does not cover export data validation errors.
---

# INT043 Export Error: xml_gateway User Is Missing Required Permissions

If you see the error message:

**“INT043 Export Error: The 'xml_gateway' user is missing required permissions in Sage Intacct. Please update the user or role permissions.”**

It means the Sage Intacct integration user does not have sufficient permissions to complete the export.

Sage Intacct requires specific module permissions for the integration to function correctly.

---

## Why the INT043 Export Error Happens

The INT043 export error occurs when:

- The **xml_gateway** user does not have required permissions, or  
- The role assigned to the xml_gateway user is missing required subscriptions  

Without proper permissions, Sage Intacct blocks transaction creation during export.

---

# How to Fix the INT043 Export Error

Follow the steps below to update permissions based on how access is configured.

---

## Step 1: Update Permissions in Sage Intacct

### If Using User-Based Permissions

1. Log in to Sage Intacct.  
2. Go to **Company > Users > Subscriptions**.  
3. Locate the **xml_gateway** user.  
4. Confirm the following permissions are set:

- **Administration:** All  
- **Company:** Read-only  
- **Cash Management:** All  
- **Time and Expense:** All  
- **General Ledger:** All  
- **Projects:** Read-only  
- **Accounts Payable:** All  

Save your changes.

---

### If Using Role-Based Permissions

1. Log in to Sage Intacct.  
2. Go to **Company > Roles > Subscriptions**.  
3. Locate the role assigned to the **xml_gateway** user.  
4. Confirm the same permissions listed above are enabled.  

Save your changes.

---

## Step 2: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the Sage Intacct connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 3: Retry the Export

Return to the report and retry the export.

If the xml_gateway user has the required permissions, the export should complete successfully.

---

# FAQ

## Do I need Sage Intacct admin access to fix this?

Yes. Updating user or role subscriptions requires administrative permissions in Sage Intacct.

## Does this error affect syncing as well?

Yes. Missing permissions can impact both sync and export functionality.

## Do I need to reconnect the integration?

No. Updating permissions and running **Sync Now** is typically sufficient.
