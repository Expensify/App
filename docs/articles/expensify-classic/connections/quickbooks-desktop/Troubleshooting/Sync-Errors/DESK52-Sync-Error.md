---
title: DESK52 Sync Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK52 sync error in QuickBooks Desktop when unable to set a preferred exporter.
keywords: DESK52, QuickBooks Desktop preferred exporter error, unable to set preferred exporter, multiple QuickBooks Desktop connections, Expensify QuickBooks Desktop sync error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK52 sync error caused by multiple QuickBooks Desktop connections in one Workspace. Does not cover QuickBooks Online errors.
---

# DESK52 Sync Error in QuickBooks Desktop Web Connector

If you see the error:

DESK52: Unable to set user as 'preferred exporter' of the workspace.

This means there are multiple QuickBooks Desktop connections configured within the same Workspace in Expensify.

---

## Why the DESK52 Sync Error Happens in QuickBooks Desktop

The DESK52 error occurs when:

- More than one QuickBooks Desktop connection exists within the Workspace.
- The system cannot determine which connection should be assigned as the preferred exporter.
- The preferred exporter setting conflicts with existing Web Connector configurations.

Only one QuickBooks Desktop connection can be designated as the preferred exporter for a Workspace.

---

## How to Fix the DESK52 Sync Error

This issue requires review and adjustment by Concierge.

Please contact **Concierge** and provide:

- The Workspace name.
- The email address of the member you are attempting to set as the preferred exporter.
- Confirmation that QuickBooks Desktop is connected via Web Connector.

Concierge will review the Workspace configuration and remove or correct duplicate QuickBooks Desktop connections so a preferred exporter can be assigned.

---

# FAQ

## Can I Fix This Within Workspace Settings?

No. If multiple QuickBooks Desktop connections exist, Concierge must review and adjust the configuration.

## Does This Apply to QuickBooks Online?

No. DESK52 applies only to QuickBooks Desktop integrations using the Web Connector.
