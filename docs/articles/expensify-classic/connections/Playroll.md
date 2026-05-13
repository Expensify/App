---
title: Playroll Integration
description: Learn how to connect Expensify with Playroll to automatically sync approved expenses for HR and EOR processing.
keywords: [Expensify Classic, Playroll, HR, EOR, expense sync, integration, payroll]
---


The Expensify-Playroll integration allows approved expenses in Expensify to automatically sync into Playroll for processing. This is a one-way integration (Expensify to Playroll only) — changes made after syncing will not sync back.

**Important:** Only approved expenses will sync, and expenses without receipts will not sync to Playroll.

---

# Prerequisites

Before setting up the integration, ensure the following:

- You are a **Workspace Admin** or **Workspace Owner** in Expensify
- You have Playroll integration permissions
- You are logged into the same Expensify account that owns or administers the workspace
- You can access Expensify Classic

---

# Setup Steps

## Step 1: Switch to Expensify Classic

1. Log into Expensify.
2. Click your account logo.
3. Select **Troubleshoot**.
4. Click **Switch to Expensify Classic**.

## Step 2: Enable Public Receipt Visibility

1. Go to **Settings > Workspaces**.
2. Select the workspace you want to connect.
3. Go to **Rules**.
4. Enable **Public Receipt Visibility**.

{% include info.html %}
If Public Receipt Visibility is not enabled, expenses will not sync to Playroll.
{% include end-info.html %}

## Step 3: Set Receipt Required Amount to $0

1. In the **Rules** section, locate **Receipt Required Amount**.
2. Set the value to **$0**.
3. Save your changes.

{% include info.html %}
Expenses without receipts do not sync to Playroll. Setting this to $0 ensures all expenses have receipts attached.
{% include end-info.html %}

## Step 4: Confirm Workspace Permissions

Verify that the user configuring the integration is a **Workspace Admin** or **Workspace Owner**.

## Step 5: Connect Expensify to Playroll

1. In Playroll, go to **Dashboard**.
2. Click **Tools > Integrations**.
3. Select **Expensify**.
4. Open the **Configuration** tab.
5. Click **Connect**.
6. You will need your **Partner User ID** and **Partner User Secret**. To get these credentials:
   - While logged into Expensify, click **Find our Partner ID**.
   - Copy your **Partner User ID** and **Partner User Secret**.
   - Paste them into Playroll.
   - Click **Submit**.

A successful setup will display **Active / Connected**.

## Step 6: Map Expense Categories

1. Open the Expensify integration page in Playroll.
2. Go to **Expense Categories**.
3. Click **Map Categories**.
4. Match your Expensify categories to the corresponding Playroll categories.
5. Save your mappings.

For example:
- Expensify "Car" → Playroll "Car Rental"
- Expensify "Equipment" → Playroll "Equipment"

{% include info.html %}
Employee email addresses in Expensify must match Personal Emails in Playroll for expenses to sync correctly.
{% include end-info.html %}

---

# Completion Checklist

- [ ] Public Receipt Visibility enabled
- [ ] Receipt Required Amount set to $0
- [ ] Correct workspace permissions confirmed
- [ ] Expensify connected to Playroll (showing "Active / Connected")
- [ ] Expense categories mapped and saved
