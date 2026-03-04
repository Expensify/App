---
title: NS0336 Export Error in NetSuite Integration
description: Learn how to fix the NS0336 export error in NetSuite when unexpected errors occur due to special characters in merchant names.
keywords: NS0336, NetSuite unexpected error ID, merchant name special characters NetSuite, export error special symbols, NetSuite error ID troubleshooting, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0336 export error caused by special characters in merchant names. Does not cover other NetSuite error codes.
---

# NS0336 Export Error in NetSuite Integration

If you see the error:

NS0336: NetSuite encountered an unexpected error, Error ID [XXXXXXXXX].

This means NetSuite returned a server-side error during the export process.

---

## Why the NS0336 Export Error Happens in NetSuite

The NS0336 error commonly occurs when:

- Special characters or symbols are included in the **Merchant** field of an expense.
- Unsupported characters are passed from Expensify to NetSuite.
- NetSuite rejects the transaction and returns an internal Error ID.

Characters that may cause issues include:

- `*`
- `<`
- `>`
- Other special symbols

---

## How to Fix the NS0336 Export Error

### Step One: Review Merchant Names in Expensify

1. Open the report in Expensify.
2. Review each expense.
3. Check the **Merchant** field for special characters or symbols.
4. Remove any unsupported characters.
5. Save the changes.

---

### Step Two: Retry the Export

1. After updating the merchant names, retry exporting the report to NetSuite.

---

### If the Error Persists

If the export continues to fail:

1. Note the **Error ID** shown in the error message.
2. Contact **NetSuite Support** directly.
3. Provide the Error ID and transaction details for further investigation.

NetSuite Support can review the internal server error using the Error ID reference.

---

# FAQ

## Does NS0336 Mean My Integration Is Broken?

No. This error is usually caused by formatting issues in merchant names or a NetSuite server-side validation error.

## Do I Need to Reconnect NetSuite?

No. In most cases, removing unsupported characters resolves the issue. If not, NetSuite Support should review the Error ID.
