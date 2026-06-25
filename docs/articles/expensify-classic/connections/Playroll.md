---
title: Playroll
description: Learn how to connect Expensify with Playroll to automatically sync approved expenses for HR and EOR processing.
keywords: [Expensify Classic, Playroll, HR, EOR, expense sync, integration, payroll]
internalScope: Audience is Workspace Admins and Workspace Owners. Covers connecting to Playroll for one-way expense syncing. Does not cover Playroll configuration beyond the Expensify integration.
---

# Playroll 

The Expensify-Playroll integration allows approved expenses in Expensify to automatically sync into Playroll for processing. This is a one-way integration (Expensify to Playroll only) — changes made after syncing will not sync back.

**Important:** Only approved expenses will sync, and expenses without receipts will not sync to Playroll.

---

## Who can connect Expensify to Playroll

You can connect Expensify to Playroll if:

- You are a Workspace Admin or Workspace Owner
- You have permission to configure integrations in Playroll
- You are signed into the Expensify account that owns or administers the workspace

This feature is not available on mobile.

---

## How to connect Expensify to Playroll

Before connecting Playroll, configure the required workspace settings in Expensify.

1. In the navigation tabs on the left, go to **Settings > Workspaces**.
2. Select your workspace.
3. Go to **Rules**.
4. Enable **Public Receipt Visibility**.
5. Set **Receipt Required Amount** to **$0**.
6. Save your changes.

Then connect the integration in Playroll.

1. In Playroll, go to **Dashboard > Tools > Integrations**.
2. Select **Expensify**.
3. Open the **Configuration** tab.
4. Click **Connect**.
5. In Expensify, click **Find our Partner ID**.
6. Copy the **Partner User ID** and **Partner User Secret**.
7. Paste the credentials into Playroll.
8. Click **Submit**.

After the integration connects successfully, Playroll displays the status as **Active / Connected**.

Employee email addresses in Expensify must match the Personal Email addresses in Playroll.

---

## What happens after you connect Expensify to Playroll

After the integration is connected:

- Approved expenses automatically sync from Expensify to Playroll
- Expenses without attached receipts do not sync
- Changes made after syncing do not sync back into Expensify
- Expense category mappings in Playroll determine how synced expenses appear in Playroll

---

# FAQ

## Why are expenses not syncing to Playroll?

Expenses may not sync if:

- The expense is not approved
- The expense does not include a receipt
- **Public Receipt Visibility** is disabled
- Employee email addresses do not match between Expensify and Playroll
- Expense categories are not mapped in Playroll

## Can members connect Expensify to Playroll?

No. Only Workspace Admins and Workspace Owners can configure the integration.

## Does the Playroll integration sync changes back into Expensify?

No. The integration only syncs expenses from Expensify to Playroll.

## Can I connect Expensify to Playroll on mobile?

No. This feature is not available on mobile.
