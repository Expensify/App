---
title: XERO83 Export Error in Xero Integration
description: Learn what the XERO83 export error means and how to resolve invalid character issues when exporting to Xero from New Expensify.
keywords: XERO83, Xero XML invalid character, export invalid character Xero, special characters Xero export error, Expensify Xero integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Xero integration in New Expensify. Covers resolving the XERO83 export error related to invalid characters in exported data. Does not cover category or authentication issues.
---

# XERO83 Export Error in Xero Integration

If you see the error:

XERO83 Export Error: XML post data has an invalid character. Please reach out to Concierge for additional assistance.

This means the export contains a character that Xero cannot process.

Xero rejects XML data that includes unsupported or invalid characters.

---

## Why the XERO83 Export Error Happens in Xero

The XERO83 error typically occurs when:

- A field in the report contains an unsupported special character.
- Xero cannot process the character during export.
- Hidden or copied formatting characters are included in the data.

Common sources include:

- Merchant names.
- Expense descriptions.
- Tags or tracking categories.
- Comments or notes.

Examples of problematic characters may include:

- `&`, `<`, `>`, `*`
- Smart quotes or special punctuation.
- Hidden formatting characters copied from emails or documents.

Because this error occurs at the XML level, it may not clearly identify which specific field is causing the issue.

This is a data formatting issue, not a connection issue.

---

# How to Fix the XERO83 Export Error

Follow the steps below to identify and correct invalid characters.

---

## Review and Clean Up Report Fields

1. Open the report that failed to export.
2. Review all expenses on the report.
3. Check the following fields for unusual symbols or special characters:
   - Merchant name
   - Description
   - Tags or tracking categories
   - Comments
4. Remove or replace special symbols with standard characters.
5. Click **Save**.

After updating the report, retry exporting to Xero.

---

## Contact Concierge if the Error Persists

If the export continues to fail:

On web:
1. Go to the navigation tabs on the left.
2. Click **Concierge**.
3. Start a new message and reference the **XERO83 Export Error**.

On mobile:
1. Tap the navigation tabs on the bottom.
2. Tap **Concierge**.
3. Start a new message and reference the **XERO83 Export Error**.

Include:

- The report name or ID.
- Confirmation that special characters were reviewed and removed.

Concierge can review the export data and help identify the exact field causing the issue.

---

# FAQ

## Can I Try Fixing It Myself?

Yes. Removing unusual symbols or special characters from merchant names, descriptions, tags, and comments often resolves the issue.

## Does the XERO83 Error Affect Other Reports?

Only reports containing unsupported characters will fail. Other reports should export normally.
