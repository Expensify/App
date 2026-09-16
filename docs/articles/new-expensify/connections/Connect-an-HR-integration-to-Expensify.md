---
title: Connect an HR integration to Expensify
description: Learn how to connect a supported HR provider to your Expensify workspace to sync employees and approval workflows, and how to find your provider with the Find integration search.
keywords: [New Expensify, HR integration, connect HR, HR provider, HRIS, sync employees, Find integration, approval workflow]
internalScope: Audience is Workspace Admins on Control plans. Covers the shared flow for connecting a supported HR provider to a workspace and finding a provider with the Find integration search. Does not cover provider-specific setup details (see the dedicated BambooHR, HiBob, and Workday articles), the Gusto and TriNet integrations, or accounting integrations.
---

# Connect an HR integration to Expensify

Connect a supported HR provider to your Expensify workspace to automatically sync employees and approval workflows. Expensify supports a wide range of HR systems, and after the initial setup it keeps your workspace up to date with daily employee syncs.

Once connected, an HR integration can:

- Add new employees to your Expensify workspace.
- Update approval workflows based on manager relationships in your HR system.
- Remove terminated employees from the workspace.
- Automatically sync employee data every day.

You can connect only one HR platform to a workspace at a time.

---

## Who can connect an HR integration to Expensify

To connect an HR integration, you must:

- Be a Workspace Admin on a Control workspace in Expensify.
- Be an administrator in your HR system.
- Ensure every employee in your HR system has a work email address.
- Have **HR** enabled under **More features** in the workspace.

Each HR integration syncs employees to one Expensify workspace. If your organization uses multiple workspaces, choose the workspace you want to sync before connecting.

---

## What HR providers you can connect to Expensify

The **HR** page lists the HR providers you can connect, including:

- BambooHR
- Breathe
- Dayforce
- Freshteam
- HiBob
- HR Cloud
- Humaans
- Insperity Premier
- IntelliHR
- JumpCloud
- Justworks
- Kallidus
- Keka
- Lucca
- Namely
- Paychex
- Paycor
- Paylocity
- PeopleHR
- Simployer
- UKG Pro
- UKG Pro Workforce Management
- UKG Ready
- Workday

Gusto and TriNet also appear on the **HR** page, but they use a different setup process. Learn how to [connect Gusto to Expensify](/articles/new-expensify/connections/Connect-Gusto-to-Expensify) or [connect TriNet to Expensify](/articles/new-expensify/connections/TriNet).

---

## How to connect an HR integration to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the workspace you want to connect to your HR system.
3. In the left menu, select **HR**.
4. In the **Find integration** search field, type the name of your HR provider to narrow down the list.
5. Next to your provider, click **Connect**.
6. In the connection window that opens, sign in with your HR system administrator account and authorize Expensify to access your account.
7. Wait for the initial connection to complete. The provider then displays **Connected. Complete setup to import employees.**
8. Click **Complete setup** in that message, or select the three dots **(⋮)** next to the provider and click **Complete setup**.
9. Choose which data to sync with this workspace, then click **Save**.
10. Wait for the initial sync to complete.

> **Note:** During the initial sync, you'll see a **Your connection is syncing** message. The initial sync can take several minutes to complete, especially for larger HR accounts, so keep the page open until the sync finishes.

For provider-specific setup details, see the dedicated articles for [BambooHR](/articles/new-expensify/connections/Connect-BambooHR-to-Expensify), [HiBob](/articles/new-expensify/connections/Connect-HiBob-to-Expensify), and [Workday](/articles/new-expensify/connections/Connect-Workday-to-Expensify).

---

## What happens after you connect an HR integration to Expensify

After the initial sync finishes:

- The connection displays the **Last synced** timestamp.
- Active employees in your HR system are added to the workspace.
- Employees who don't already have an Expensify account receive an email invitation to finish setting up their account.
- The **Members** tab displays synced employees.
- You can configure the workspace's **Approval mode** and **Final approver** from the **HR** page.

Expensify also runs a daily auto-sync to keep employee data up to date:

- Employee information and manager relationships are updated to match your HR system.
- Terminated employees in your HR system are removed from the workspace automatically.

---

## How to disconnect an HR integration from Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to your HR system.
3. In the left menu, select **HR**.
4. Next to the connected provider, select the three dots **(⋮)**, then click **Disconnect**.
5. Confirm by clicking **Disconnect** again.

Disconnecting an HR integration stops future employee syncs. Existing workspace members remain in the workspace.

---

# FAQ

## How do I find a specific HR provider on the HR page?

Use the **Find integration** search field on the **HR** page to narrow down the list of available providers, then click **Connect** next to your provider. The search field appears whenever there are many providers to choose from.

If you already have an HR platform connected, the search field and the remaining providers are in the **Other** section of the **HR** page. Expand **Other** to search. This section appears once the connected platform's initial sync has finished.

## Can I connect more than one HR integration to a workspace?

No. You can connect only one HR platform to a workspace at a time. If you try to connect another while one is already connected, you'll see **Cannot connect to multiple HR platforms**. Disconnect your current HR platform first.

## Can I sync employees to different Expensify workspaces?

No. Each HR integration syncs all employees to a single Expensify workspace. You must choose one workspace when connecting.

## Why is my HR integration connected but my employees haven't synced?

Connecting authorizes the integration. To start importing employees, click **Complete setup** on the provider (or select the three dots **(⋮)** next to the provider and click **Complete setup**), choose the data to sync, and click **Save**.
