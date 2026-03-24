---
title: INT043 Export Error in Sage Intacct Integration
description: Learn what the INT043 export error means and how to update xml_gateway user or role permissions in Sage Intacct.
keywords: INT043, xml_gateway permissions error Sage Intacct, Sage Intacct user permissions missing, Sage Intacct role subscriptions xml_gateway, Sage Intacct export permission failure, Workspace Admin
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers resolving the INT043 export error caused by missing xml_gateway user or role permissions. Does not cover export data validation errors.
---

# INT043 Export Error in Sage Intacct Integration

If you see the error:

INT043 Export Error: The 'xml_gateway' user is missing required permissions in Sage Intacct. Please update the user or role permissions.

This means the Sage Intacct integration user does not have sufficient permissions to complete the export.

Sage Intacct requires specific module subscriptions and permissions for the integration to create transactions.

---

## Why the INT043 Export Error Happens in Sage Intacct

The INT043 error typically occurs when:

- The **xml_gateway** user does not have the required module permissions.
- The role assigned to the **xml_gateway** user is missing required subscriptions.
- Required applications are not enabled for the integration user.

If the integration user cannot access the required modules, Sage Intacct blocks transaction creation during export.

This is a permissions configuration issue, not a report data issue.

---

# How to Fix the INT043 Export Error

Follow the steps below based on how permissions are configured in your Sage Intacct environment.

---

## Update Permissions for the xml_gateway User

### If Using User-Based Permissions

1. Log in to Sage Intacct as an administrator.
2. Go to **Company > Users**.
3. Select the **xml_gateway** user.
4. Click **Subscriptions**.
5. Confirm the following permissions are enabled:

- **Administration:** All  
- **Company:** Read-only  
- **Cash Management:** All  
- **Time & Expense:** All  
- **General Ledger:** All  
- **Projects:** Read-only  
- **Accounts Payable:** All  

6. Click **Save**.

---

### If Using Role-Based Permissions

1. Log in to Sage Intacct.
2. Go to **Company > Roles**.
3. Select the role assigned to the **xml_gateway** user.
4. Click **Subscriptions**.
5. Confirm the same permissions listed above are enabled.
6. Click **Save**.

---

## Sync the Workspace

After updating permissions:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the **xml_gateway** user has the required permissions, the export should complete successfully.

---

# FAQ

## Do I Need Sage Intacct Admin Access to Fix This?

Yes. Updating user or role subscriptions requires administrative permissions in Sage Intacct.

## Does This Error Affect Syncing as Well?

Yes. Missing permissions can impact both sync and export functionality.

## Do I Need to Reconnect the Integration?

No. Updating permissions and selecting **Sync Now** is typically sufficient.
