---
title: ONL580 Export Error in QuickBooks Online
description: Learn how to fix the ONL580 export error in QuickBooks Online when the report currency does not match the export account currency.
keywords: ONL580, QuickBooks Online foreign currency error, report currency mismatch, posting account currency mismatch, multi-currency export error, change export account, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL580 export error caused by report and export account currency mismatches. Does not cover other export error codes.
---

# ONL580 Export Error in QuickBooks Online

If you see the error:

ONL580: Transactions can use only one foreign currency. The report’s currency must match the posting account (e.g., USD reports cannot post to a CAD account).

This means the currency of the report in Expensify does not match the currency of the export account configured in your Workspace or in QuickBooks Online.

---

## Why the ONL580 Export Error Happens in QuickBooks Online

The ONL580 error occurs when:

- The report currency differs from the export account currency.
- The employee or vendor record uses a different currency than the export account.
- The Workspace export configuration is pointing to an account with a different currency.
- Multi-currency is enabled and currencies are not aligned.

QuickBooks Online requires the transaction currency to match the posting account currency.

---

## Option One: Select a Different Export Account in Expensify

If the report currency is correct, update the export account.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Select a different export account that matches the report currency.
6. Click **Save**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Select a different export account that matches the report currency.
6. Tap **Save**.

Retry exporting the report.

---

## Option Two: Confirm Report, Employee, and Export Account Currencies Match

1. Open the report in Expensify and confirm the report currency.
2. In QuickBooks Online, open the employee or vendor record associated with the report creator.
3. Confirm the currency listed on the record.
4. In QuickBooks Online, go to **Accounting** > **Chart of Accounts**.
5. Confirm the export account currency matches both the report and vendor currency.

If needed, update the currency in QuickBooks Online so all currencies align.

After confirming currencies match, retry exporting the report.

---

## Option Three: Confirm the Report Currency in Expensify

If the report currency itself is incorrect:

- If the report status is **Paid: Confirmed**, the currency cannot be changed. A new report must be created with the correct currency.
- If the report status is **Paid**, **Done**, or **Approved**:

  1. Ask a Workspace Admin to unapprove or reject the report.
  2. Confirm the Workspace currency settings are correct.
  3. Have the member resubmit the report.
  4. Retry exporting the report.

All currencies must align before the export can succeed.

---

# FAQ

## Can a USD Report Be Exported to a CAD Account?

No. The report currency must match the posting account currency in QuickBooks Online.

## Does Multi-Currency Increase the Risk of This Error?

Yes. When multi-currency is enabled, it is important to ensure the report currency, vendor currency, and export account currency all match before exporting.
