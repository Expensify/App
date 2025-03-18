---
title: Configure Accelo
description: Configure Accelo's export and coding settings.
order: 2
---

# Configure Accelo
1. Log into Accelo
2. Navigate to the Integrations page
3. Select the **Expensify** tab
4. Enter Expensify Integration Server Credentials
5. Provide your Expensify Integration Server’s Partner User ID and Partner User Secret
6. Click “Save” to complete the setup

## Upload Accelo Project Codes as Tags in Expensify
Once you have connected Accelo to Expensify, the next step is to upload your Accelo Project Codes as Tags in Expensify:
1. Head to to **Settings** > **Workspaces** > **Group** > _[Workspace Name]_ > **Tags**
2. Choose to upload a CSV
3. If you also integrate with Xero or QuickBooks Online, you must upload your Project Codes by appending your tags
   - Go to **Settings** > **Workspaces** > **Group** > _[Workspace Name]_ > **Tags**
   - Click on **Append a custom tag list from a CSV** to upload your Project Codes via a CSV

## Information sync between Expensify and Accelo
The Accelo integration does a one-way sync, which means it brings expenses from Expensify into Accelo. When this happens, it transfers specific information from Expensify expenses to Accelo:

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

## Expense Status
The status of your expense report in Expensify is also synced in Accelo.

| Expensify Report Status | Accelo Expense Status |
|-------------------------|-----------------------|
| Open                    | Submitted             |
| Submitted               | Submitted             |
| Approved                | Approved              |
| Reimbursed              | Approved              |
| Rejected                | Declined              |
| Archived                | Approved              |
| Closed                  | Approved              |

## Importing expenses from Expensify to Accelo
Accelo checks Expensify for new expenses once every hour. It automatically adds expenses that have been created or changed since the connection's last sync.
