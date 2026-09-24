---
title: View Expensify Connect bundle release notes for NetSuite
description: Review the Expensify Connect bundle version history, permission changes, and compatibility notes before updating your NetSuite integration.
keywords: [NetSuite bundle release notes, Expensify Connect changelog, bundle 283395, NetSuite bundle version history, NetSuite bundle permissions]
internalScope: Audience is Workspace Admins and NetSuite administrators. Covers the production Expensify Connect bundle release history and version-specific upgrade considerations. Does not cover bundle installation steps, OAuth connection setup, NetSuite platform releases, or SuiteApp Marketplace releases.
---

# View Expensify Connect bundle release notes for NetSuite

These release notes describe changes to the **Expensify Connect** bundle for NetSuite, **bundle ID 283395**, with the newest version first. Use them to check what changed before updating your installed bundle.

Bundle versions are separate from NetSuite's own release numbers. Updating the bundle does not automatically switch an existing SOAP connection to REST or change its authentication method.

## How to read the Expensify Connect bundle release history

Each entry lists the release date, documented changes, and any version-specific precautions. **Added** identifies new components or permissions; **Changed** and **Removed** describe updates to existing ones. Historical entries reflect the records available, and missing details are identified rather than inferred.

## What changed in Expensify Connect 1.12

**Released: September 23, 2026**

**Added**

- A read-only **Expensify Legacy Tax RESTlet** script and deployment. These provide the NetSuite-side component for importing legacy tax codes and tax groups through OAuth in supported NetSuite OneWorld accounts.
- **REST Web Services (Full)** and **SuiteAnalytics Workbook (Edit)** permissions on the **Expensify Integration** role.

**Removed**

- **Close Manager Tasks (View)** and **Time-Off (Edit)** permissions from the bundled role. Expensify's integration does not use these permissions. If you use this role for other workflows, ask your NetSuite administrator to review their access requirements.

**Compatibility**

- The bundled role retains its SOAP Web Services and token-based login permissions. You do not need to disconnect a working SOAP connection just to update the bundle.
- Installing the RESTlet does not, by itself, enable legacy-tax imports in Expensify. The corresponding Expensify integration functionality must also be available for your connection.
- This RESTlet does not import SuiteTax data. Installing this version does not, by itself, enable SuiteTax imports.

**Before you upgrade**

Record any custom permissions you added to or removed from the bundled **Expensify Integration** role. A bundle update can overwrite those customizations. Compare the role after the update and restore your intended access where needed.

The bundle uses **Do Not Update Deployments** to retain existing script deployment settings. This setting does not preserve role permissions. If your connection uses the RESTlet, confirm that its deployment audience includes the exact role used by your connection, including Administrator or a custom role where applicable.

## What is documented for Expensify Connect 1.11

Detailed release notes are unavailable for this historical version, which preceded version 1.12.

## What changed in Expensify Connect 1.10

**Released: August 15, 2024**

**Removed**

- The **User Credentials** permission from the **Expensify** integration record because single sign-on (SSO) authentication was no longer supported for the integration.

## What changed in Expensify Connect 1.9.3

**Released: April 21, 2021**

**Changed**

- Granted write access to **Accounts** and **Documents/Files** on the **Expensify Integration** role to support account creation during exports, including accounts needed for reconciliation.

## What changed in Expensify Connect 1.9.2

**Released: November 13, 2020**

**Changed**

- Granted write access to **Employees** and **Vendors** on the **Expensify Integration** role so Expensify could create those records during exports without a manual role-permission update.

## What changed in Expensify Connect 1.9.1

**Released: November 10, 2020**

**Changed**

- Granted read/write access to **Pay Bills** and **Custom Record Types**, and read access to **Custom Segments**, on the **Expensify Integration** role.

## What changed in Expensify Connect 1.8

**Released: August 20, 2020**

**Changed**

- Granted read/write access to **Items** on the **Expensify Integration** role.
