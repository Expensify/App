---
title: Update the Expensify Connect bundle in NetSuite
description: Update the Expensify Connect bundle, review customized role permissions, and verify your NetSuite connection after the update.
keywords: [update Expensify Connect bundle, upgrade NetSuite bundle, NetSuite role permissions, NetSuite RESTlet access, Workspace Admin]
internalScope: Audience is NetSuite administrators and Expensify Workspace Admins. Covers updating an installed Expensify Connect bundle and verifying permissions, deployment access, and sync afterward. Does not cover initial installation, OAuth migration, or SuiteTax configuration.
---

<!-- cspell:ignore customscript customdeploy -->

# Update the Expensify Connect bundle in NetSuite

Update the Expensify Connect bundle to receive changes to Expensify’s NetSuite scripts, custom fields, and integration role. This guide explains how to update the bundle, check customized permissions, and confirm access to the legacy tax RESTlet.

**Updating the bundle does not switch your connection from SOAP/token-based authentication to REST/OAuth 2.0. You do not need to disconnect your working connection just to update the bundle.**

## Who can update the Expensify Connect bundle

Ask your NetSuite administrator to perform the update in a web browser. You’ll also need an Expensify Workspace Admin to check the connection afterward. The NetSuite integration requires the **Control** plan in Expensify.

## What to record before updating the Expensify Connect bundle

If your organization customized the **Expensify Integration** role:

- Record the role’s name and internal ID. Similar names can refer to different roles.
- Save screenshots or a written record of its permission levels and restrictions. Include permissions your organization deliberately added, reduced, or removed.
- Check each permission section: Transactions, Reports, Lists, Setup, and Custom Record.

Bundle updates can overwrite customizations to bundled objects, including the integration role. An unlocked role is not protected from updates. Have your administrator review differences afterward rather than automatically accepting every change or restoring every old permission.

If an Expensify legacy tax RESTlet is already installed, also record its deployment status and audience—the users or roles allowed to run it.

## How to update the Expensify Connect bundle in NetSuite

**If the update preview reports a conflicting object, stop and contact Concierge before choosing a resolution.** This can happen if a script was installed separately. Renaming or replacing an existing object can affect the integration. Do not uninstall the existing bundle to resolve a conflict.

1. Sign in to NetSuite as an administrator.
2. Go to **Customization > SuiteBundler > Search & Install Bundles > List**.
3. Find **Expensify Connect**, bundle ID **283395**.
4. Open its **Action** menu and select **Update**.
5. Review the current version, new version, and proposed changes.
6. If the Expensify legacy tax RESTlet has a deployment preference, keep **Do Not Update Deployments** selected to preserve existing deployment settings.
7. Click **Update Bundle**, review the confirmation, and proceed when the changes match your expectations.
8. Refresh the installed-bundles list until the update finishes. Confirm the new version and successful status before continuing.

**Do Not Update Deployments** applies to existing script deployments, not the entire bundle. It does not prevent the script source from updating, and it does not preserve role permissions.

## How to check NetSuite integration role permissions after the bundle update

1. In NetSuite, go to **Setup > Users/Roles > Manage Roles**.
2. Open the bundled Expensify Integration role and compare its permissions and restrictions with your saved record.
3. Review the role’s **History** for permission changes.
4. Have your administrator correct unintended differences, preserving your organization’s approved access and the permissions required by your connection.

For a SOAP/token-based connection, retain the required **SOAP Web Services** and **Log in using Access Tokens** permissions. Do not remove them just because the bundle also includes REST-related permissions.

If your connection uses a separate, copied role, check that role too. Do not assume updates to the bundled role also update your copy. If a permission your organization needs is missing or cannot be restored, contact Concierge before continuing normal integration use.

## How to check NetSuite RESTlet access after the bundle update

The legacy tax RESTlet is a NetSuite script that reads legacy tax information for Expensify. This section applies when your connection uses that REST/OAuth tax-import feature. Existing SOAP connections do not need RESTlet access and do not need to migrate or reconnect for this update.

1. Go to **Customization > Scripting > Script Deployments**.
2. Find the Expensify legacy tax deployment and verify these IDs:
   - Script: `customscript_expensify_legacy_tax`
   - Deployment: `customdeploy_expensify_legacy_tax`
3. Confirm **Deployed** is checked and **Status** is **Released**. External RESTlet calls require Released status.
4. On **Audience**, confirm **Internal roles** includes the exact role used to authorize your Expensify connection:
   - **Administrator**, if you connected as Administrator.
   - **Expensify Integration**, if you connected with that role.
   - Your organization’s custom role, if you connected with a copied or customized role.
5. If needed, have your administrator edit the audience and add the connection role. Check any existing audience restrictions without removing them indiscriminately. Save only the intended changes.

Use the connection’s role, not simply the role you used to install the bundle. Do not select **All Internal Roles**, **All Employees**, or **All Partners** as a shortcut.

**Existing deployment audiences are preserved during bundle updates.** Updating the bundle alone may not add a missing role. This applies even when **Update Deployments** is selected.

The legacy tax RESTlet does not provide SuiteTax support. Do not disable SuiteTax to use it. Contact Concierge if you need help confirming the supported tax-import path for your account.

## How to verify the NetSuite connection after the bundle update

In New Expensify:

1. From the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces**.
2. Select your Workspace and open **Accounting**.
3. Open the three-dot menu beside NetSuite and select **Sync Now**.
4. Wait for the sync to finish and check for errors.
5. Check the imported coding data. If applicable, confirm your expected tax rates and default tax are still selected.
6. Check your next normal export. Do not re-export an already exported report just to test the update.

## How to get help with an Expensify Connect bundle update

Contact Concierge with the bundle version, exact error message, affected Workspace, time of the failure, and the NetSuite role used by the connection. Include relevant permission changes or deployment settings, but **never share passwords, access tokens, or token secrets**.

Updating the bundle prepares the NetSuite-side components. It does not, by itself, enable every REST feature in Expensify or change your authentication method.
