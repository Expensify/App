---
title: DESK18 Export Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK18 export error in QuickBooks Desktop caused by unsupported characters in the Description field.
keywords: DESK18, QuickBooks Desktop unsupported characters, description field error, special characters export error, QuickBooks Desktop data processing error, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK18 export error caused by unsupported characters in expense descriptions. Does not cover QuickBooks Online errors.
---

# DESK18 Export Error in QuickBooks Desktop Web Connector

If you see the error:

DESK18: QuickBooks Desktop encountered an error processing the data because of unsupported characters in the Description field. Remove any special characters and retry the export.

This means one or more expenses on the report contain special characters that QuickBooks Desktop does not support.

---

## Why the DESK18 Export Error Happens in QuickBooks Desktop

The DESK18 error occurs when unsupported characters are used in the **Description** field of an expense in Expensify.

Common unsupported characters include:

- Double quotation marks ( " )
- Vertical bars ( | )
- Backslashes ( \ )
- Other special formatting symbols

QuickBooks Desktop cannot process these characters during export.

---

## How to Fix the DESK18 Export Error

1. Open the report in Expensify.
2. Review each expense on the report.
3. Edit the **Description** field.
4. Remove any special or unsupported characters.
5. Save the changes.

After updating all affected expenses:

1. Retry exporting the report to QuickBooks Desktop.

Once the unsupported characters are removed, the export should complete successfully.

---

# FAQ

## Do I Need to Update Every Expense?

Only expenses that contain unsupported characters in the Description field need to be updated.

## Does This Apply to QuickBooks Online?

No. DESK18 applies only to QuickBooks Desktop integrations using the Web Connector.
