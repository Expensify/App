---
title: Configure Accelo
description: Learn how to configure the Accelo integration with Expensify, including exporting and coding settings.
keywords: [Accelo, Expensify Classic, project codes, expense sync]
---

Accelo integrates with Expensify to streamline expense management. Follow these steps to configure the integration and sync expense data effectively.

---

# Connect Accelo to Expensify

To enable the integration, follow these steps:

1. Log into **Accelo**.
2. Navigate to **Settings** > **Integrations**.
3. Select the **Expensify** tab.
4. Enter your **Expensify Integration Server Credentials**.
5. Provide your **Partner User ID** and **Partner User Secret** from Expensify.
6. Click **Save** to complete the setup.

---

# Upload Accelo Project Codes as Tags in Expensify

Once connected, you must upload your Accelo Project Codes as tags in Expensify:

1. Go to **Settings > Workspaces > [Workspace Name] Tags**.
2. Choose to upload a CSV file.
3. If you also integrate with **Xero** or **QuickBooks Online**, append your Project Codes to existing tags:
   - Navigate to **Settings > Workspaces > [Workspace Name] > Tags**.
   - Click **Append a custom tag list from a CSV** and upload your file.

---

# How Expensify Data Syncs with Accelo

The Accelo integration syncs **one way**, meaning expense data flows from Expensify to Accelo. The following fields are mapped:

| Expensify           | Accelo                |
|---------------------|-----------------------|
| Comment             | Title                 |
| Date                | Date Incurred         |
| Category            | Type                  |
| Tags                | Against (relevant Project, Ticket or Retainer) |
| Distance (mileage)  | Quantity              |
| Hours (time expenses) | Quantity            |
| Amount              | Purchase Price and Sale Price |
| Reimbursable?       | Reimbursable?         |
| Billable?           | Billable?             |
| Receipt             | Attachment            |
| Tax Rate            | Tax Code              |
| Attendees           | Submitted By          |

---

# Expense Status Syncing

Expensify report statuses sync to the corresponding Accelo statuses:

| Expensify Report Status | Accelo Expense Status |
|-------------------------|-----------------------|
| Draft                   | Submitted             |
| Outstanding             | Submitted             |
| Approved                | Approved              |
| Paid                    | Approved              |
| Rejected                | Declined              |
| Archived                | Approved              |
| Done                    | Approved              |

---

# How Expenses Are Imported

Accelo checks for new expenses in Expensify **once every hour**. Any newly created or updated expenses since the last sync will be imported into Accelo automatically.
