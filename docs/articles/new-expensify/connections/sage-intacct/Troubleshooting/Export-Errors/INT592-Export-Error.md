---
title: INT592 Export Error in Sage Intacct Integration
description: Learn what the INT592 export error means and how to configure Smart Rules at the entity level in Sage Intacct before retrying the export.
keywords: INT592, Sage Intacct Smart Rule violated, entity level Smart Rule error, multi-entity export configuration, change export entity Sage Intacct, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT592 export error caused by Smart Rules not configured at the entity level. Does not cover tax, category, employee, or vendor validation errors.
---

# INT592 Export Error in Sage Intacct Integration

If you see the error:

INT592 Export Error: Smart Rule [XXXX] violated. This record must be created at the Entity level.

This means a Smart Rule in Sage Intacct is not configured at the entity level required for the transaction being exported.

Sage Intacct enforces Smart Rules based on entity-level configuration, especially in multi-entity environments.

---

## Why the INT592 Export Error Happens in Sage Intacct

The INT592 error typically occurs when:

- A Smart Rule was created or applied at the top level instead of the entity level.
- The export attempts to create a transaction within a specific entity.
- The Smart Rule requires the record to be created at the entity level.

This most commonly occurs in multi-entity Sage Intacct environments where Smart Rule configuration and export entity settings do not align.

This is a Smart Rule configuration issue, not a category or employee validation issue.

---

# How to Fix the INT592 Export Error

Follow the steps below to correct the Smart Rule configuration or entity selection.

---

## Configure the Smart Rule at the Entity Level in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Locate the Smart Rule referenced in the error message.
3. Review where the Smart Rule is applied.
4. Confirm the Smart Rule is created or enabled at the **entity level**, not only at the top level.
5. Update the Smart Rule configuration if needed.
6. Click **Save**.

If appropriate for your accounting setup, you may also adjust or remove the Smart Rule.

---

## Confirm the Correct Entity Is Selected in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Review the selected entity in the export configuration.
5. Update the entity if necessary.
6. Click **Save**.

Ensure the Workspace is exporting to the same entity where the Smart Rule is properly configured.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the Smart Rule is configured at the entity level and the correct entity is selected, the export should complete successfully.

---

# FAQ

## What Is an Entity-Level Smart Rule?

An entity-level Smart Rule applies specifically to a designated entity within Sage Intacct rather than only at the top level of a multi-entity account.

## Does the INT592 Error Only Occur in Multi-Entity Environments?

Most commonly, yes. It typically occurs when Smart Rule configuration and export entity settings do not align.

## Do I Need Sage Intacct Admin Access to Update Smart Rules?

Yes. Updating Smart Rules typically requires administrative permissions in Sage Intacct.
