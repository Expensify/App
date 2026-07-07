---
title: CER521 Export Error in Certinia Integration
description: Learn what the CER521 export error means in Certinia and how to align assignment resources to restore successful exports.
keywords: CER521, Certinia export error, assignment resource must match expense report resource, assignment not available to employee, Certinia resource mismatch, Expensify Certinia export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia integration. Covers resolving the CER521 export error caused by assignment resource mismatches. Does not cover other Certinia error codes.
---

# CER521 Export Error in Certinia Integration

If you see the error:

CER521: Assignment resource must match expense report resource.

This means the assignment selected on the report does not match the employee’s assigned resource in Certinia, preventing the export from completing.

---

## Why the CER521 Export Error Happens in Certinia

The CER521 error typically indicates:

- The selected assignment is not available to the employee resource.
- The assignment is inactive or not linked to the employee.
- Certinia validation failed due to a resource mismatch.

Certinia requires the assignment selected on the report to match an assignment available to the employee’s resource record.

This is a Certinia assignment configuration issue, not a Workspace configuration issue.

---

## How to Fix the CER521 Export Error

This issue must be resolved in Certinia and confirmed in Expensify.

1. Log in to Certinia.
2. Navigate to the employee’s **Resource** record.
3. Review the assignments associated with that resource.
4. Confirm the correct assignment is active and available.

Then in Expensify:

1. Open the affected report.
2. Review the selected assignment or tag on the expenses.
3. Update the assignment to match one available to the employee in Certinia.
4. Save your changes.

Retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After aligning the assignment with the employee’s available resource assignments, retry the export. If the error persists, confirm the assignment is active and correctly linked.

## Does CER521 Mean the Assignment Does Not Exist?

Not necessarily. It usually means the assignment exists but is not available to the specific employee resource.

## Is CER521 Caused by Workspace Settings?

No. CER521 is triggered by a mismatch between the employee resource and assignment configuration in Certinia. Workspace accounting settings are not the cause.
