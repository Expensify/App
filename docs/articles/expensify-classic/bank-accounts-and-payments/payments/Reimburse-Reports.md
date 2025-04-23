---
title: Reimburse Reports
description: Learn how to reimburse reports in Expensify using direct deposit, global reimbursement, third-party payment providers, or manual tracking methods.
keywords: [Expensify Classic, reimburse reports, direct deposit, USD, ACH, global reimbursement]
---
<div id="expensify-classic" markdown="1">

Once a report is submitted and approved, you can reimburse the expenses directly via direct deposit or global reimbursement, use an indirect reimbursement method (such as a third-party payment processor), or mark the report as reimbursed outside of Expensify (if your organization bundles reimbursements in payroll, for instance).

---

# Direct Deposit - USD

Before a report can be reimbursed via direct deposit:
- The reimburser must [connect a verified business bank account](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/bank-accounts/Connect-US-Business-Bank-Account)
- The recipient must [connect a personal bank account](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/bank-accounts/Connect-Personal-US-Bank-Account)

To reimburse a report via direct deposit (USD):
1. Open the report.
2. Click the **Reimburse** button and select **Via Direct Deposit**.
3. Confirm that the correct bank account is listed in the dropdown menu.
4. Click **Accept Terms & Pay**. 

If the reimbursement is less than $200, it will typically be deposited into the employee's bank account immediately. If the reimbursement is more than $200, the deposit will be processed within one to five business days. 

---

# Direct Deposit - Global Reimbursement
Before a report can be reimbursed via global reimbursement:
- A workspace admin must [set up global reimbursements](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/bank-accounts/Enable-Global-Reimbursements)
- Employees must [connect a deposit account](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/bank-accounts/Connect-Personal-US-Bank-Account)

To reimburse a report via global reimbursement:
1. Open the report.
2. Click the **Reimburse** button and select **Via Direct Deposit**.
3. Confirm that the correct bank account is listed in the dropdown menu.
4. Click **Accept Terms & Pay**.

The reimbursement should be processed within five business days. If the payment hasn't been processed within that timeframe, reach out to Expensify Support for assistance.

---

# Indirect Reimbursement
If you are reimbursing reports outside of Expensify via paper check or payroll, you’ll want to manually mark the report as paid to track the payment history.

To label a report as Reimbursed after sending a payment outside of Expensify:
1. Open the report
2. Click **Reimburse**.
3. Select **I’ll do it manually - just mark it as reimbursed**. This changes the report status to **Reimbursed**.

Once the recipient has received the payment, the submitter can return to the report and click **Confirm**. This will change the report status to **`Reimbursed: CONFIRMED`**.

## Reimburse a report via a third-party payment provider

If both the reimburser and the payment recipient have Venmo accounts, you can [connect them directly to Expensify](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/Third-Party-Payments) to send and receive reimbursements. 

## Reimburse a report via ABA batch file

Workspace Admins can reimburse AUD expense reports by downloading an ABA file containing the accounts needing payment and uploading the file to the bank. This can be done for a single report or for a batch of payments.

More information on reimbursing reports via ABA batch file can be found **[here](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/payments/Reimburse-Australian-Reports)**.

---

# FAQ

## Is there a maximum report total?

Expensify cannot process a reimbursement for any single report over $20,000. If you have a report with expenses exceeding $20,000 we recommend splitting the expenses into multiple reports.

## Why is my business bank account locked?

When you reimburse a report, you authorize Expensify to withdraw the funds from your account and send them to the person requesting reimbursement. If your bank rejects Expensify’s withdrawal request, your verified bank account is locked until the issue is resolved.

Withdrawal requests can be rejected if the bank account has not been enabled for direct debit or due to insufficient funds. If you need to enable direct debits from your verified bank account, your bank will require the following details:
- The ACH CompanyIDs: 1270239450 and 4270239450
- The ACH Originator Name: Expensify 

Once resolved, you can request to unlock the bank account by completing the following steps: 
1. Hover over **Settings**, then click **Account**. 
2. Click the **Payments** tab. 
3. Click **Bank Accounts**. 
4. Next to the bank account, click **Fix**. 

Our support team will review and process the request within 4-5 business days.

## Who can reimburse reports?

Only a Workspace Admin who has added a verified business bank account connected to their Expensify account can reimburse employee reports.

## How can I add another employee as a reimburser?

You can give another employee access to reimburse reports by doing the following:
1. If they're not already a workspace admin, add them as one under **Settings > Workspaces > [Workspace Name] > Members**.
2. Share the business bank account with them by heading to **Settings > Account > Payments** and clicking **Share**.
3. The new reimburser will need to validate the shared bank connection by entering the test deposits that Expensify sends to the bank account.
4. Once validated, the employee will have access to reimburse reports. You can make them the default reimburser for all reports submitted on a specific workspace by selecting them from the dropdown menu under **Settings > Workspaces > [Workspace Name] > Reimbursements > Reimburser**.

## Why can’t I trigger direct ACH reimbursements in bulk?

Expensify does not offer bulk reimbursement, but you can automate reimbursements by setting a threshold amount under **Settings > Workspaces > [Workspace Name] > Reimbursement**. After setting a threshold amount, an employee's reimbursement is triggered once a report is **Final Approved**. If the total of a report is more than the threshold amount, the reimbursement will need to be manually triggered.

</div>
