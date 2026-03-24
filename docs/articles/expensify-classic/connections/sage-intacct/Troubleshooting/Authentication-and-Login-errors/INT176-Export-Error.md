---
title: INT176 Export Error in Sage Intacct Integration
description: Learn what the INT176 export error means in Sage Intacct and how to resolve session initialization connection issues.
keywords: INT176, Sage Intacct export error, session initialization error Sage Intacct, Expensify Sage Intacct connection issue, Sage Intacct integration session error, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT176 export error caused by session initialization and connection issues. Does not cover other Sage Intacct error codes.
---

# INT176 Export Error in Sage Intacct Integration

If you see the error:

INT176: Session initialization error.

This means Expensify was unable to establish a session with Sage Intacct, preventing the export from completing.

---

## Why the INT176 Export Error Happens in Sage Intacct

The INT176 error typically indicates:

- Expensify cannot initialize a session with Sage Intacct.
- There is a temporary connection disruption.
- Sage Intacct Web Services are unavailable.
- Integration settings require backend review.

Because the error occurs during session setup, the export cannot proceed.

This is a Sage Intacct connection issue, not a Workspace configuration issue.

---

## How to Fix the INT176 Export Error

This issue requires review by Concierge.

1. Open **Concierge** in Expensify.
2. Reference the **INT176 Export Error**.
3. Provide the report ID (if applicable).
4. Include the approximate time the export was attempted.

Concierge will review the integration logs and help restore the Sage Intacct connection.

You may retry the export in case the issue was temporary. If the error persists, contact Concierge.

---

# FAQ

## Can I Retry the Export?

Yes. If the issue was temporary, retrying may resolve it. If the error continues, contact Concierge.

## Does INT176 Affect All Exports?

It can. If the Sage Intacct session cannot initialize, multiple exports may fail until the connection is restored.

## Do I Need to Reconnect the Integration?

Not typically. Concierge will determine whether reconnection or backend adjustments are required.
