---
title: How to Fix the ONL583 Export Error in QuickBooks Online
description: Learn how to fix the ONL583 export error when a vendor, supplier, customer, or employee name in QuickBooks Online prevents Expensify from creating a vendor for the report submitter.
keywords: ONL583, QuickBooks Online duplicate name, vendor already exists, supplier name conflict, customer or employee name conflict, submitter email mismatch, Expensify QuickBooks Online export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers fixing the ONL583 export error caused by a name conflict when automatically creating a vendor for the report submitter. Does not cover other export error codes.
---

# How to Fix the ONL583 Export Error in QuickBooks Online

The ONL583 error identifies the submitter's email and the conflicting record name. For example:

> We could not find a vendor/supplier in QuickBooks Online for jane@acme.com. A record named 'Jane Doe' already exists in QuickBooks Online under a different email, or as another record type such as a customer or employee. Please rename that record, or create a vendor/supplier for jane@acme.com under a different name.

This means Expensify cannot find a matching vendor/supplier by email, and QuickBooks Online rejects creating one because its name is already in use.

---

## Why the ONL583 Export Error Happens in QuickBooks Online

The ONL583 error occurs when:

- Expensify cannot find a vendor/supplier matching the report submitter's email address.
- Expensify attempts to create a vendor for the submitter.
- The name is already used by a vendor/supplier with a different email, or by a customer or employee record.

Expensify matches vendors by email address. QuickBooks Online requires unique names across vendors/suppliers, customers, and employees.

---

## How to Fix the Name Conflict in QuickBooks Online

1. Log in to QuickBooks Online.
2. Search for the **record name shown in the error**, not just the submitter's email. Check vendor/supplier, customer, and employee records.
3. If the record is the correct vendor/supplier for the submitter, update its email to exactly match the submitter's email in Expensify and save your changes.
4. If the record belongs to someone else or is a customer or employee, choose one of these fixes:
   - Rename the conflicting record so Expensify can automatically create the vendor/supplier under the original name.
   - Create a vendor/supplier with a different, unique name and the submitter's exact email address.
5. Sync the QuickBooks Online connection in Expensify, then retry exporting the report.

---

# FAQ

## Does the Vendor Email Have to Match Exactly?

Yes. The vendor/supplier email in QuickBooks Online must exactly match the submitter's email address in Expensify for Expensify to match the records.

## Can a Customer or Employee Record Cause This Error?

Yes. A customer or employee record can use the name Expensify is trying to give the vendor/supplier. Search by the name shown in the error, even if that record uses a different email.

## Can I Fix This by Disabling Automatic Vendor Creation?

Disabling automatic creation does not resolve the name conflict or create a matching vendor/supplier. If you manage vendors manually, create a vendor/supplier with a unique name and the submitter's exact email, then sync and retry the export.
