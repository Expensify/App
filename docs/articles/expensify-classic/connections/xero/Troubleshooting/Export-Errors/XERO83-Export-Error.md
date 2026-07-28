---
title: XERO83 Export Error in Xero Integration
description: Learn what the XERO83 export error means and how to resolve invalid character issues when exporting to Xero.
keywords: XERO83, Xero XML invalid character, export invalid character Xero, special characters Xero export error, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration. Covers resolving the XERO83 export error caused by invalid or unsupported characters in exported data. Does not cover authentication or chart of accounts issues.
---

# XERO83 Export Error in Xero Integration

If you see the error:

XERO83 Export Error: XML post data has an invalid character. Please reach out to Concierge for additional assistance.

This means the export contains a character that Xero cannot process.

Xero rejects XML data that includes unsupported or invalid characters.

---

## Why the XERO83 Export Error Happens in Xero

The XERO83 error typically indicates:

- A field in the report contains an unsupported special character.
- The character is not valid in XML formatting.
- Xero validation failed while processing the exported data.

Common fields that may contain invalid characters include:

- Merchant names
- Descriptions
- Tags
- Comments
- Invoice or report titles

Common causes include:

- Special symbols
- Unsupported punctuation
- Emojis
- Hidden formatting characters copied from emails or documents

Because this error occurs at the XML level, it may not clearly identify the specific field causing the issue.

This is a data formatting issue, not an authentication or chart of accounts error.

---

## How to Fix the XERO83 Export Error

You can try removing unsupported characters or contact Concierge for assistance.

### Review and Clean Report Fields

1. Open the report that failed to export.
2. Review the following fields on each expense:
   - Merchant name
   - Description
   - Tags
   - Comments
3. Remove unusual symbols, emojis, or special characters.
4. Replace special punctuation with standard characters.
5. Click **Save**.

After updating the fields:

1. Retry exporting the report to Xero.

### Contact Concierge if the Error Persists

If the error continues after removing special characters:

Reach out to **Concierge** and include:

- The full error message.
- The report name or report ID.

Concierge can review the exported data, identify the invalid character, and guide you through correcting it.

---

# FAQ

## Can I Fix This by Editing the Merchant Name or Description?

Yes. Removing unusual symbols, emojis, or special characters from merchant names, descriptions, tags, or comments often resolves the issue.

## Does This Error Affect Other Reports?

Only reports containing unsupported characters will fail. Other reports should export normally.

## Do I Need to Reconnect the Integration?

No. This is a data formatting issue and does not require reconnecting Xero.
