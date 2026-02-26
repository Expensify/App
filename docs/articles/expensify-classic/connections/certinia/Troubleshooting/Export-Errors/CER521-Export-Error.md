---
title: CER521 Export Error: Assignment Resource Must Match Expense Report Resource
description: Learn why CER521 appears when exporting to Certinia and how to align assignment resources between Certinia and Expensify to complete the export.
keywords: CER521, Certinia error CER521, assignment resource must match expense report resource, assignment not available to employee, Certinia assignment error, resource mismatch Certinia, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER521 assignment resource mismatch error and retrying the export. Does not cover unrelated Certinia assignment configuration or project setup.
---

# CER521 Export Error: Assignment Resource Must Match Expense Report Resource

If you see the error:

**“CER521 Export Error: Assignment resource must match expense report resource. The selected assignment is not available to this employee in Certinia.”**

this means the assignment selected on the report does not match the employee’s assigned resource in Certinia.

Until the assignment and employee resource match, Certinia will block the export.

---

## Why CER521 Happens

Certinia requires that the assignment selected on an expense report matches the employee’s assigned resource.

If the employee’s resource record in Certinia is assigned differently than what was selected on the report in Expensify, Certinia fails validation and returns error **CER521**.

This is a Certinia assignment configuration issue — not an Expensify Workspace configuration issue.

---

## Who Can Fix CER521

You must have access to review employee resources and assignments in Certinia (typically a Certinia Admin or PSA Admin) to resolve this error.

---

## How to Verify Employee Assignments in Certinia

1. Log in to Certinia.
2. Navigate to the report submitter’s **Employee Resource** record.
3. Review the assignments associated with that employee.
4. Confirm which assignments are available and active.

Ensure you are reviewing the correct employee resource tied to the report creator or submitter.

---

## How to Match Assignment Tags in Expensify

1. Open the affected report in Expensify.
2. Review the selected tags or assignment fields on the expenses.
3. Compare these selections to the assignments listed on the employee resource in Certinia.
4. Adjust any selections in Expensify so they match what is listed and available in Certinia.

The assignment selected in Expensify must match an assignment available to that employee in Certinia.

---

## How to Retry Exporting After CER521

After confirming or updating the assignment:

1. Retry exporting the report.
2. Confirm the export completes successfully.

If the error continues, verify that:
- The correct employee resource was reviewed.
- The assignment is active and available in Certinia.
- The updated selections were saved before retrying the export.

---

# FAQ

## Does CER521 mean the assignment does not exist?

Not necessarily. It usually means the assignment exists but is not available to the specific employee resource tied to the report.

---

## Is CER521 caused by Expensify settings?

No. CER521 is triggered by a mismatch between the employee resource and assignment configuration in Certinia, not by Workspace settings in Expensify.

---

## Do I need to reconnect the Certinia integration?

No. In most cases, aligning the assignment in Expensify with the employee’s available assignments in Certinia resolves the issue.
