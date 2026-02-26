---
title: INT993 Export Error: Could Not Create 'cctransaction' Record in Sage Intacct
description: Learn why the INT993 export error occurs and what to do when a connection issue prevents creation of a cctransaction record in Sage Intacct.
keywords: INT993, cctransaction error Sage Intacct, credit card transaction export failure, Sage Intacct connection issue, integration export error
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT993 export error related to connection or session issues when creating cctransaction records. Does not cover category, tax, or employee configuration errors.
---

# INT993 Export Error: Could Not Create 'cctransaction' Record in Sage Intacct

If you see the error message:

**“INT993 Export Error: Could not create 'cctransaction' record in Sage Intacct.”**

It means there is a connection or session issue between Expensify and Sage Intacct that is preventing the credit card transaction record from being created.

---

## Why the INT993 Export Error Happens

The INT993 export error indicates a communication issue between Expensify and Sage Intacct.

This can occur if:

- The integration session is interrupted  
- Authentication has expired  
- Sage Intacct is unable to process the request  

Because this error relates to the integration connection, it cannot be resolved by updating report data.

---

# How to Fix the INT993 Export Error

This error requires additional investigation.

Please reach out to **Concierge** for support. Include:

- The full error message  
- The report name or ID  
- The time the export was attempted  

Concierge will review the integration logs and help restore the connection so you can successfully export your report.

---

# FAQ

## Can I fix this by running Sync?

No. This error is related to transaction creation and connection status, and typically requires backend review.

## Does this mean the integration is disconnected?

Not necessarily. It indicates a transaction creation issue, but Concierge can confirm whether the connection needs to be refreshed or reconfigured.
