---
title: ONL329 Export Error in QuickBooks Online
description: Learn what the ONL329 export error means in QuickBooks Online when receipt images exceed file size limits and how to access your report details.
keywords: ONL329, QuickBooks Online receipt image error, file exceeded size limit, PDF attachment not included, QuickBooks Online attachment limit, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers understanding the ONL329 export error related to receipt image size limits. Does not cover other export error codes.
---

# ONL329 Export Error in QuickBooks Online

If you see the error:

ONL329: Error downloading receipt image — the file exceeded your accounting system’s size limit. The report exported without the PDF attachment.

This means the report successfully exported to QuickBooks Online, but the attached receipt PDF was too large to be included.

---

## Why the ONL329 Export Error Happens in QuickBooks Online

The ONL329 error occurs when:

- A report includes receipt images or PDF attachments.
- The combined attachment file size exceeds QuickBooks Online’s file size limit.
- QuickBooks Online blocks the attachment but still accepts the financial data.

The report data exports correctly, but the PDF attachment is not sent.

---

## What Happens When the ONL329 Export Error Appears

- The report still exports to QuickBooks Online.
- The accounting data (expenses, totals, categories, etc.) is included.
- The PDF attachment is not included in QuickBooks Online.
- The full report and receipts remain available in Expensify.

No additional action is required unless you specifically need the receipt images stored in QuickBooks Online.

---

## How to Access Receipts After an ONL329 Export Error

Even if the PDF attachment is not included in QuickBooks Online:

1. Open the report in Expensify.
2. Review individual expenses.
3. Click into each expense to view the attached receipt image.

You can cross-reference the exported transaction in QuickBooks Online with the original report in Expensify if additional detail is needed.

---

# FAQ

## Did the Export Fail If I See ONL329?

No. The export to QuickBooks Online is successful. Only the PDF attachment is excluded due to file size limits.

## Can I Reduce the Receipt File Size and Re-Export?

QuickBooks Online enforces file size limits for attachments. If you need attachments stored in QuickBooks Online, you would need to reduce the file size outside of Expensify and manually attach the smaller file in QuickBooks Online.

Otherwise, you can rely on Expensify to store and manage all receipt images.
