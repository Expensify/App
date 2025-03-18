---
title: Accelo Troubleshooting
description: Resources to help you solve issues with your Accelo integration.
---

# Overview
Most of the Accelo integration with Expensify is managed on the Accelo side. You will find their [help site](https://help.accelo.com/guides/integrations-guide/expensify/) helpful, especially the [FAQs](https://help.accelo.com/guides/integrations-guide/expensify/#faq). 

## Information sync between Expensify and Accelo
The Accelo integration does a one-way sync, bringing expenses from Expensify into Accelo. When this happens, it transfers specific information from Expensify expenses to Accelo:

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


## Can I use an Accelo and an accounting integration in Expensify at the same time?
Yes, you can use Accelo and an accounting system simultaneously. In order to update your Expensify tags with your Accelo Projects, Tickets, or Retainers, you will need to have a special switch enabled that allows you to have non-accounting tags alongside your accounting connection. Please contact Concierge to request that our support team enable the “Indirect Tag Uploads” switch for you.
