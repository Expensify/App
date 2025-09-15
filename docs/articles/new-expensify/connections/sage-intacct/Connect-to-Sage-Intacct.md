---
title: Connect to Sage Intacct
description: Set up the Sage Intacct integration in Expensify to streamline expense syncing and reduce manual entry.
keywords: [New Expensify, Sage Intacct integration, connect Sage Intacct, expense report export, vendor bill export]
---


Connect your Workspace to Sage Intacct to automate expense syncing and reduce manual data entry. This guide walks through the setup for user-based and role-based permissions and covers options for exporting expenses as reports or vendor bills.

**Note:** The Sage Intacct integration is only available on the **Control** plan.

---

# Overview of Sage Intacct Integration

With this integration, you can:

- Import standard dimensions like **Department**, **Class**, **Location**, **Customer**, and **Project/Job**
- Import **user-defined dimensions**
- Export expenses as **Expense Reports** or **Vendor Bills**
- Sync using **role-based** or **user-based** permissions

Your available features may vary depending on your Sage Intacct subscription. If a feature isn’t supported, you'll see an error in Expensify during setup or export.

---

# Integration Setup Checklist

Complete these steps to set up the integration:

1. Create a web services user and configure permissions
2. Enable the Time & Expenses (T&E) module (if exporting expense reports)
3. Set up Employees in Sage Intacct (if exporting expense reports)
4. Set up Expense Types in Sage Intacct (if exporting expense reports)
5. Enable Customization Services
6. Download the Expensify Package
7. Upload the package to Sage Intacct
8. Add web services authorization
9. Enter credentials in Expensify and connect to Sage Intacct
10. Configure integration sync options

---

# Step 1a: Set up a web services user (User-based permissions)

If your Sage Intacct instance doesn’t match these steps, skip to **Step 1B**.

1. Go to **Company > Web Services Users > New**
2. Fill out the form:
   - **User ID:** `xmlgateway_expensify`
   - **Name:** Expensify
   - **Email:** Use your shared accounting email
   - **User type:** Business
   - **Admin privileges:** Full
   - **Status:** Active
3. Assign the following permissions:
   - Administration (All)
   - Company (Read-only)
   - Cash Management (All)
   - General Ledger (All)
   - Time & Expense (All) – if exporting as Expense Reports
   - Projects (Read-only) – if using Projects or Customers
   - Accounts Payable (All) – if exporting as Vendor Bills

---

# Step 1b: Set up a web services user (Role-based permissions)

If your Sage Intacct instance uses role-based permissions, follow these steps:

**Create the role:**

1. Go to **Company > Roles > + New Role**
2. Name it `Expensify` and click **Save**
3. Go to **Roles > Subscriptions** and configure the same permissions listed in Step 1a

**Create the user:**

1. Go to **Company > Web Services Users > New**
2. Complete the user form as in Step 1a
3. Assign the `Expensify` role to the user and save

---

# Step 2: Enable and configure the Time & Expenses module

> **Required if exporting out-of-pocket expenses as Expense Reports**

1. Go to **Company > Subscriptions > Time & Expenses**
2. Toggle on the subscription
3. Under **Auto-numbering sequences**:
   - Expense Report: `EXP`
   - Employee: `EMP`
   - Duplicate Numbers: **Do not allow creation**
   - Set up sequence ID `EXP` with:
     - Print Title: `EXPENSE REPORT`
     - Starting Number: 1
     - Next Number: 2
4. Under **Advanced Settings**:
   - Fixed Number Length: 4
   - Fixed Prefix: `EXP`
5. Uncheck **Enable expense report approval**
6. Click **Save**

---

# Step 3: Set up Employees in Sage Intacct

> **Required if exporting as Expense Reports**

1. Go to **Time & Expenses > + Employees**
   - If this menu is missing, check role permissions under **Company > Roles > Time & Expenses**
2. Provide:
   - Employee ID
   - Primary contact name
   - Email address (create a contact if needed)

---

# Step 4: Set up Expense Types in Sage Intacct

> **Required if exporting as Expense Reports**

1. Confirm your Chart of Accounts is set up via **Company Setup Checklist > Import**
2. Go to **Time & Expense > Setup > + Expense Types**
3. For each type, provide:
   - Expense Type name
   - Description
   - Linked Account Number

---

# Step 5: Enable Customization Services

**Note:** If you already have Platform Services enabled, you can skip this step.

In Sage Intacct, go to **Company > Subscriptions > Customization Services** to activate **Customization Services**.

---

# Step 6: Download the Expensify Package

1. In Expensify, from the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting**
2. Select **Sage Intacct > Connect to Sage Intacct**
3. Click **Download Package**

---

# Step 7: Upload the package in Sage Intacct

Depending on your setup:

- **Customization Services:** Go to **Customization Services > Custom Packages > New Package**

- **Platform Services:** Go to **Platform Services > Custom Packages > New Package**

Then:
1. Click **Choose File** and select the downloaded package
2. Click **Import**

---

# Step 8: Add web services authorization

1. Go to **Company > Company Info > Security > Edit**
2. Under **Web Services Authorizations**, add `expensify` (lowercase) as the Sender ID

---

# Step 9: Enter credentials and connect to Sage Intacct

1. In Expensify, go to **Workspaces > [Workspace Name] > Accounting**
2. Click **Set up** next to Sage Intacct
3. Enter your web services user credentials
4. Click **Confirm**

---

# FAQ

## Why wasn’t my report automatically exported to Sage Intacct?

If auto-export fails, the specific error will appear in the report’s comment section. Once resolved, you can manually export the report from the report header.

## Can I export negative expenses to Sage Intacct?

Yes, but reports exported as **Expense Reports** must not have a total below $0.

