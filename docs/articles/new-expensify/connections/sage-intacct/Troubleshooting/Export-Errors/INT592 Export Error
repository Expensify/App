---
title: INT592 Export Error: Smart Rule Violated – Must Be Created at the Entity Level
description: Learn why the INT592 export error occurs and how to ensure Smart Rules are configured at the entity level before retrying the export.
keywords: INT592, Smart Rule violated Sage Intacct, entity level Smart Rule error, multi-entity export issue, change export entity configuration
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT592 export error related to Smart Rule entity-level configuration. Does not cover category, tax, or employee validation errors.
---

# INT592 Export Error: Smart Rule Violated – Must Be Created at the Entity Level

If you see the error message:

**“INT592 Export Error: Smart Rule [XXXX] violated. This record must be created at the Entity level.”**

It means a Smart Rule in Sage Intacct is not configured at the entity level required for the transaction being exported.

Sage Intacct enforces Smart Rules based on entity-level configuration in multi-entity environments.

---

## Why the INT592 Export Error Happens

The INT592 export error occurs when:

- A Smart Rule in Sage Intacct is not created or applied at the entity level, and  
- The export attempts to create a record that violates that Smart Rule  

This typically occurs in environments with multiple entities when Smart Rules are configured at the top level instead of the entity level.

---

# How to Fix the INT592 Export Error

Follow the steps below to correct the Smart Rule configuration or entity selection.

---

## Step 1: Confirm the Smart Rule Is Created at the Entity Level

1. Log in to Sage Intacct.  
2. Locate the Smart Rule referenced in the error message.  
3. Confirm the Smart Rule is created or applied at the **entity level**, not only at the top level.  

If the Smart Rule is not configured at the entity level:

- Update the Smart Rule to apply at the entity level, or  
- Remove or adjust the Smart Rule if appropriate for your accounting configuration  

Save your changes.

---

## Step 2: Confirm the Correct Entity Is Selected

If your account includes multiple entities:

1. Go to **Workspace > [Workspace Name] > Accounting > Export**.  
2. Select the entity associated with the Smart Rule.  
3. Save your changes.  

Ensure the export configuration matches the entity where the Smart Rule is properly configured.

---

## Step 3: Retry the Export

Return to the report and retry the export.

If the Smart Rule is correctly configured at the entity level and the proper entity is selected, the export should complete successfully.

---

# FAQ

## What is an entity-level Smart Rule?

An entity-level Smart Rule applies specifically to a designated entity within Sage Intacct rather than only at the top level of a multi-entity account.

## Does this error only occur in multi-entity environments?

Most commonly, yes. It typically occurs when Smart Rules and export entity settings do not align.

## Do I need Sage Intacct admin access to update Smart Rules?

Yes. Updating Smart Rules typically requires administrative permissions in Sage Intacct.
