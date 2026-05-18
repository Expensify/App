---
title: DESK18 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK18 export error means and how to remove unsupported characters from expense descriptions before exporting to QuickBooks Desktop.
keywords: DESK18, unsupported characters QuickBooks Desktop, description field special characters, QuickBooks export error invalid characters, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK18 export error related to unsupported characters in expense descriptions. Does not cover mapping or connection configuration errors.
---

# DESK18 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK18 Export Error: QuickBooks Desktop encountered an error processing the data because of unsupported characters in the Description field. Remove any special characters and retry the export.

This means one or more expenses on the report contain unsupported characters in the **Description** field.

QuickBooks Desktop cannot process certain special characters during export.

---

## Why the DESK18 Export Error Happens in QuickBooks Desktop

The DESK18 error occurs when:

- The **Description** field contains unsupported special characters.
- QuickBooks Desktop rejects the export due to invalid formatting.

Common unsupported characters may include:

- `“` or `”` (smart quotes)
- `|` (pipe symbol)
- `\` (backslash)
- Certain special punctuation or copied formatting
- Other non-standard symbols

These characters may be copied from emails, PDFs, or external documents.

This is a formatting issue in the Description field, not a connection issue.

---

# How to Fix the DESK18 Export Error

Follow the steps below to remove unsupported characters.

---

## Remove Special Characters From Expense Descriptions

1. Open the report that failed to export.
2. Review each expense on the report.
3. Check the **Description** field for unusual or special characters.
4. Remove or replace any unsupported symbols.
5. Click **Save**.

Make sure all descriptions contain only standard letters, numbers, and basic punctuation.

---

## Retry the Export

1. Open the report.
2. Retry exporting to QuickBooks Desktop.

If all unsupported characters have been removed, the export should complete successfully.

---

# FAQ

## Does the DESK18 Error Affect Only One Expense?

It can affect one or multiple expenses. Any expense containing unsupported characters in the Description field may cause the export to fail.

## Can I Leave Basic Punctuation?

Yes. Standard characters such as letters, numbers, periods, commas, and basic symbols are typically supported.

## Do I Need to Reconnect the Integration?

No. This is a formatting issue within the report, not a connection issue.
