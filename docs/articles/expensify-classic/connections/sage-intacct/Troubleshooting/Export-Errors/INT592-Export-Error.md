---
title: INT592 Export Error in Sage Intacct Integration
description: Learn what the INT592 export error means and how to ensure Smart Rules are created at the entity level in Sage Intacct before exporting.
keywords: INT592, Sage Intacct Smart Rule entity level, Smart Rule violated export error, Sage Intacct entity configuration error, change entity export configuration, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT592 export error caused by Smart Rule entity-level configuration issues. Does not cover category, tax, or employee record errors.
---

# INT592 Export Error in Sage Intacct Integration

If you see the error:

INT592 Export Error: Smart Rule [XXXX] violated. This record must be created at the Entity level.

This means a Smart Rule in Sage Intacct is configured incorrectly for the entity being used during export.

Sage Intacct requires certain Smart Rules to be created at the **entity level** in order for transactions to post successfully.

---

## Why the INT592 Export Error Happens in Sage Intacct

The INT592 error typically indicates:

- A Smart Rule in Sage Intacct was not created at the entity level.
- The export attempts to create a record that violates that Smart Rule.
- The selected entity in the Workspace does not align with the Smart Rule configuration.

This most commonly occurs in multi-entity environments where Smart Rules are restricted to a specific entity configuration.

If the Smart Rule is not configured at the correct level, Sage Intacct blocks the export.

This is an entity or Smart Rule configuration issue, not a category, tax, or employee record error.

---

## How to Fix the INT592 Export Error

Follow the steps below to correct the Smart Rule configuration or entity selection.

### Confirm the Smart Rule Is Created at the Entity Level in Sage Intacct

1. Log in to Sage Intacct.
2. Locate the Smart Rule referenced in the error message.
3. Confirm that the Smart Rule is created at the **entity level**, not only at the top level.
4. If the Smart Rule is not configured at the entity level:
   - Update the Smart Rule to apply at the appropriate entity level, or
   - Adjust or remove the Smart Rule if appropriate for your accounting setup.
5. Click **Save**.

### Confirm the Correct Entity Is Selected in the Workspace

If your Sage Intacct environment includes multiple entities:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.
6. Confirm the correct entity is selected for export.
7. Click **Save**.

### Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the Smart Rule is properly configured at the entity level and the correct entity is selected, the export should complete successfully.

---

# FAQ

## What Is an Entity-Level Smart Rule?

An entity-level Smart Rule applies specifically to a designated entity within Sage Intacct, rather than only at the top level of a multi-entity configuration.

## Does This Error Only Occur in Multi-Entity Environments?

Most commonly, yes. It typically occurs when multiple entities exist and the Smart Rule or export entity configuration does not align.

## Do I Need Sage Intacct Admin Permissions to Fix This?

You need sufficient administrative permissions in Sage Intacct to update Smart Rules or entity configurations.
