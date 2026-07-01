---
title: Connect to Certinia
description: Connect Certinia (formerly FinancialForce) to New Expensify to streamline expense reporting, approvals, and accounting export.
keywords: [New Expensify, Certinia integration, FinancialForce, connect Certinia, Salesforce, FFA, PSA, SRP]
order: 1
---


Connect your Expensify Workspace to Certinia (formerly FinancialForce) to automate expense syncing, approvals, and accounting export. Certinia is a cloud-based financial management solution built on Salesforce, and Expensify supports both the **FFA** (Financial Force Accounting) and **PSA/SRP** (Professional Services Automation) modules. This guide walks you through installing the Expensify bundle, preparing your Certinia account, and finalizing the connection in New Expensify.

**Note:** The Certinia integration is only available on the **Control** plan.

**Before you begin, make sure:**

- You can log into Certinia (Salesforce) as an administrator
- A Certinia user and contact exists that matches your primary email in Expensify
- Each employee who will submit reports has a Certinia contact whose email matches their Expensify account email

---

# Step 1: Install the Expensify bundle in Certinia

Install the package that matches your Certinia module. You only need the bundle for the module you use.

- **FFA:** [FFA Installer](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t4p000001UQVj)
- **PSA/SRP:** [PSA/SRP Installer](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t2M000002J0BHD%252Fpackaging%252FinstallPackage.apexp%253Fp0%253D04t2M000002J0BH)

Follow the Salesforce prompts to complete the installation.

---

# Step 2: Verify contact details in Certinia

1. Confirm there is a Certinia user and contact whose email matches your **primary email** in Expensify.
2. Create contacts for every employee who will submit expense reports.
3. Make sure each contact's email exactly matches their Expensify account email.

---

# Step 3: Additional setup for PSA/SRP

> Skip this step if you use **FFA only**.

If you use Certinia PSA/SRP, complete the following before connecting in Expensify:

## Configure Permission Controls

1. Go to **Permission Controls** in Certinia and create a new permission control.
2. Set yourself (the exporter) as the user.
3. Select the resource (the report submitter).
4. Grant all available permissions.

## Configure Project Permissions

1. Go to **Projects > [Select a Project] > Project Attributes**.
2. Click **Edit** and enable **Allow Expenses Without Assignment**.
3. Confirm the setting is checked under the Project Attributes section, then save.

## Set up Expense Types (SRP only)

1. Go to **Main Menu > + > Expense Type GLA Mappings**.
2. Click **New** to add and configure expense type mappings.

---

# Step 4: Connect to Certinia in New Expensify

1. From the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting**.
2. Select **Certinia > Connect to Certinia**.
3. Log in to your Certinia (Salesforce) account when prompted.
4. Follow the on-screen prompts to authorize the connection.
5. Select the Certinia **company** to use for importing and exporting data.

Once connected, continue to [Configure Certinia](https://help.expensify.com/articles/new-expensify/connections/certinia/Configure-Certinia) to set up import, export, and advanced settings.

---

# Connect to a Certinia sandbox

If you want to test the integration against a Certinia **sandbox** instead of your production account, use the sandbox connection option. The configuration experience is identical to production once connected — only the connection endpoints and bundle differ.

1. Install the sandbox version of the Expensify bundle in your Certinia sandbox (the sandbox uses different bundle install links and OAuth endpoints than production).
2. From the navigation tabs, go to **Workspaces > [Workspace Name] > Accounting**.
3. Select **Certinia > Connect to Certinia Sandbox**.
4. Log in to your Certinia **sandbox** account and follow the on-screen prompts.
5. Select the company to use, then continue to [Configure Certinia](https://help.expensify.com/articles/new-expensify/connections/certinia/Configure-Certinia).

---

# FAQ

## What's the difference between FFA and PSA/SRP?

- **FFA (Financial Force Accounting)** is used for general accounting. Expenses export as **Payable Invoices**, and you map dimensions and a chart of accounts.
- **PSA/SRP (Professional Services Automation)** is used by project-based organizations. Expenses export as **Expense Reports**, and you import projects and assignments.

Expensify automatically tailors the available configuration options to the module you connect.

## Do employees who submit reports need a Certinia license?

Employees who only submit expense reports do not need Certinia access — but each must have a Certinia **contact** whose email matches their Expensify account email so their reports can map correctly on export.

## How do I disconnect Certinia?

1. From the navigation tabs, go to **Workspaces > [Workspace Name] > Accounting**.
2. Select the three-dot menu **(⋮)** next to the Certinia connection.
3. Click **Disconnect** and confirm.

Disconnecting clears all imported options from Expensify.
