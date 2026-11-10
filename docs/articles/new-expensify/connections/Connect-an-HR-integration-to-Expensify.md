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

To import candidates from an applicant tracking system (ATS), such as Greenhouse, use the **Recruiting** page instead of the **HR** page. Learn how to [connect Greenhouse to Expensify](/articles/new-expensify/connections/Connect-Greenhouse-to-Expensify).

---

## Who can connect an HR integration to Expensify

To connect an HR integration, you must:

- Be a Workspace Admin on a Control workspace in Expensify.
- Be an administrator in your HR system.
- Ensure every employee in your HR system has a work email address.

Each HR integration syncs employees to one Expensify workspace. If your organization uses multiple workspaces, choose the workspace you want to sync before connecting.

---

## What HR providers you can connect to Expensify

The **HR & People** tab on the **Connections** page lists the HR providers you can connect, including:

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

Gusto and TriNet also appear on the **HR & People** tab, but they use a different setup process. Learn how to [connect Gusto to Expensify](/articles/new-expensify/connections/Connect-Gusto-to-Expensify) or [connect TriNet to Expensify](/articles/new-expensify/connections/TriNet).

---

## How to connect an HR integration to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the workspace you want to connect to your HR system.
3. Select **Connections**.
4. In the **Find connections** search field, type the name of your HR provider to narrow down the list.
5. Select your provider.
6. In the connection window that opens, sign in with your HR system administrator account and authorize Expensify to access your account.
7. Wait for the initial connection to complete. The provider then displays **Complete setup** on the **Connections** page.
8. Select **Configure** next to the provider, then select **Complete setup**.
9. Choose which data to sync with this workspace, then click **Save**.
10. Wait for the initial sync to complete.

> **Note:** During the initial sync, you'll see a **Your connection is syncing** message. The initial sync can take several minutes to complete, especially for larger HR accounts, so keep the page open until the sync finishes.

For provider-specific setup details, see the dedicated articles for [BambooHR](/articles/new-expensify/connections/Connect-BambooHR-to-Expensify), [HiBob](/articles/new-expensify/connections/Connect-HiBob-to-Expensify), and [Workday](/articles/new-expensify/connections/Connect-Workday-to-Expensify).

---

## What happens after you connect an HR integration to Expensify

After the initial sync finishes:

- A sync complete screen opens — named for your provider, such as **Workday sync complete** — with the **Added**, **Removed**, and **Skipped** employee counts. Select **Skipped** to see each skipped employee and the reason they were skipped, then select **Got it** to close the screen. The screen only opens if you stay on the **Connections** page or the **Members** tab while the sync runs.
- The connection displays the **Last synced** timestamp.
- Active employees in your HR system are added to the workspace.
- Employees who don't already have an Expensify account receive an email invitation to finish setting up their account.
- The **Members** tab displays synced employees.
- You can configure the workspace's **Approval mode** and **Final approver** by selecting **Configure** next to the provider on the **Connections** page.

Expensify also runs a daily auto-sync to keep employee data up to date:

- Employee information and manager relationships are updated to match your HR system.
- Terminated employees in your HR system are removed from the workspace automatically.

---

## How to disconnect an HR integration from Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to your HR system.
3. Select **Connections**, then select **Configure** next to the connected provider.
4. Select **More (⋮)**, then select **Disconnect**.
5. Confirm by clicking **Disconnect** again.

Disconnecting an HR integration stops future employee syncs. Existing workspace members remain in the workspace.

---

# FAQ

## How do I find a specific HR provider on the Connections page?

Use the **Find connections** search field on the **Connections** page to narrow down the list of available providers, then select your provider.

## Can I connect more than one HR integration to a workspace?

No. You can connect only one HR platform to a workspace at a time. If you select another provider while one is already connected, you'll see **Replace connection?**. Select **Replace** to disconnect your current HR platform and connect the new one.

## Can I sync employees to different Expensify workspaces?

Yes. You can select which group to connect to each workspace, and connect different groups to different workspaces.

## Why is my HR integration connected but my employees haven't synced?

Connecting authorizes the integration. To start importing employees, select **Configure** next to the provider on the **Connections** page, select **Complete setup**, choose the data to sync, and select **Save**.
