---
title: XERO08 Export Error in Xero Integration
description: Learn what the XERO08 export error means and how to resolve PDF size limits when exporting reports to Xero.
keywords: XERO08, Xero PDF too large, report exceeds 10MB Xero, Xero attachment size limit, Expensify Xero export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO08 export error caused by Xero’s 10MB attachment size limit. Does not cover chart of accounts or authentication issues.
---

# XERO08 Export Error in Xero Integration

If you see the error:

XERO08 Export Error: PDF of report is too large to export (>10MB). Please reach out to Concierge for additional assistance.

This means the generated PDF of the report exceeds Xero’s 10MB attachment size limit.

Xero does not allow attachments larger than 10MB.

---

## Why the XERO08 Export Error Happens in Xero

The XERO08 error typically indicates:

- The generated PDF of the report is larger than **10MB**.
- Xero rejected the attachment during export.
- The report contains large or high-resolution receipt images.

Large PDFs are commonly caused by:

- High-resolution receipt images.
- Multiple large attachments on a single report.
- Scanned documents with large file sizes.

This is an attachment size limitation in Xero, not a chart of accounts or authentication issue.

---

## How to Fix the XERO08 Export Error

You can reduce the PDF size or request assistance.

### Review and Remove Large Attachments

1. Open the report that failed to export.
2. Review each expense and its attached receipts.
3. Remove any duplicate or unnecessary attachments.
4. Replace extremely large images with smaller versions, if available.
5. Save your changes.

### Retry the Export

1. Open the report.
2. Retry exporting to Xero.

If the PDF size is under 10MB, the export should complete successfully.

### Contact Concierge for Assistance

If the report still exceeds 10MB after removing large attachments, reach out to **Concierge** and include:

- The report name or report ID.
- Confirmation that the error is **XERO08**.

Concierge can review the report and provide guidance on how to successfully export it.

---

# FAQ

## Can I Reduce the PDF Size Myself?

Yes. Removing unnecessary attachments or replacing large images with smaller versions can reduce the PDF size.

## Does This Error Affect All Exports?

No. Only reports with PDFs larger than 10MB will fail. Reports under the size limit will export normally.

## Does Xero Allow Larger Attachments?

No. Xero enforces a 10MB attachment limit per export.
