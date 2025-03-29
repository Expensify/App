---
title: Accelo-Troubleshooting.md
description: Learn how to troubleshoot and resolve common issues with the Accelo integration in Expensify.
keywords: [Accelo, Expensify, integration, troubleshooting, expense sync, accounting]
---
<div id="expensify-classic" markdown="1">

The Accelo integration with Expensify primarily operates on Accelo’s end. For detailed support, refer to their [help site](https://help.accelo.com/guides/integrations-guide/expensify/) and [FAQs](https://help.accelo.com/guides/integrations-guide/expensify/#faq).

## How Expensify and Accelo Sync Data

The Accelo integration is a one-way sync that transfers expenses from Expensify into Accelo. The table below outlines how specific Expensify expense details map to Accelo:

| Expensify           | Accelo                |
|---------------------|-----------------------|
| Description             | Title                 |
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

## Expense Status Sync

Expense report statuses in Expensify correspond to specific statuses in Accelo, as shown below:


| Expensify Report Status | Accelo Expense Status |
|-------------------------|-----------------------|
| Open                    | Submitted             |
| Submitted               | Submitted             |
| Approved                | Approved              |
| Reimbursed              | Approved              |
| Rejected                | Declined              |
| Archived                | Approved              |
| Closed                  | Approved              |

## Using Accelo and an Accounting Integration Together

Yes, you can integrate Accelo and an accounting system simultaneously in Expensify. However, to sync Accelo Projects, Tickets, or Retainers as tags in Expensify, you’ll need a special setting enabled.  

**To request this setting:**  
Contact Concierge and ask for the **"Indirect Tag Uploads"** switch to be enabled.

---

For further assistance, visit the [Accelo help site](https://help.accelo.com/guides/integrations-guide/expensify/) or reach out to Concierge.

</div>
