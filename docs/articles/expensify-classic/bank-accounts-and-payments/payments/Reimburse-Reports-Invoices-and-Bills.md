---
title: Reimburse reports, invoices, and bills
description: Use direct deposit or indirect reimbursement to pay reports, invoices, and bills
---
<div id="expensify-classic" markdown="1">

Once a report, invoice, or bill has been submitted and approved for reimbursement, you can reimburse the expenses using direct deposit or an indirect reimbursement option outside of Expensify (like cash, a check, or a third-party payment processor).
 
# Pay with direct deposit

{% include info.html %}
Before a report can be reimbursed with direct deposit, the employee or vendor receiving the reimbursement must connect their personal U.S. bank account, and the reimburser must connect a verified business bank account. 

Direct deposit is available for U.S. and global reimbursements. It is not available for Australian bank accounts. For Australian accounts, review the process for reimbursing Australian expenses. 
{% include end-info.html %}

1. Open the report, invoice, or bill from the email or Concierge notification, or from the **Reports** tab.
2. Click the **Reimburse** (for reports) or **Pay** (for bills and invoices) dropdown and select **Via Direct Deposit (ACH)**.
3. Confirm that the correct VBA is selected or use the dropdown menu to select a different one. 
4. Click **Accept Terms & Pay**. 

The reimbursement is now queued in the daily batch. 

# Pay with indirect reimbursement

When payments are submitted through Expensify, the report is automatically labeled as Reimbursed after it has been paid. However, if you are reimbursing reports via paper check, payroll, or any other method that takes place outside of Expensify, you’ll want to manually mark the bill as paid in Expensify to track the payment history.

To label a report as Reimbursed after sending a payment outside of Expensify,

1. Pay the report, invoice, or bill outside of Expensify.
2. Open the report, invoice, or bill from the email or Concierge notification, or from the **Reports** tab.
3. Click **Reimburse**.
4. Select **I’ll do it manually - just mark it as reimbursed**. This changes the report status to Reimbursed.

Once the recipient has received the payment, the submitter can return to the report and click **Confirm** at the top of the report. This will change the report status to Reimbursed: CONFIRMED.

{% include faq-begin.md %}

**Is there a maximum total report total?**

Expensify cannot process a reimbursement for any single report over $20,000. If you have a report with expenses exceeding $20,000 we recommend splitting the expenses into multiple reports.

**Why is my account locked?**

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

**How are bills and invoices processed in Expensify?**

Here is the process a vendor or supplier bill goes through from receipt to payment:

1. A vendor or supplier bill is received in Expensify. 
2. Automatically, the document is SmartScanned and a bill is created for the primary domain contact. The bill will appear under the Reports tab on their default group policy.
3. When the bill is ready for processing, it is submitted and follows the primary domain contact’s approval workflow until the bill has been fully approved.
4. The final approver pays the bill from their Expensify account using one of the methods outlined in the article above.
5. If the workspace is connected to an accounting integration, the bill is automatically coded with the relevant imported GL codes and can be exported back to the accounting software.

**When a vendor or supplier bill is sent to Expensify, who receives it?**

Bills are sent to the primary contact for the domain. They’ll see a notification from Concierge on their Home page, and they’ll also receive an email.

**How can I share access to bills?**

By default, only the primary contact for the domain can view and pay the bill. However, you can allow someone else to view or pay bills. 

- **To allow someone to view a bill**: The primary contact can manually share the bill with others to allow them to view it. 
   1. Click the **Reports** tab.
   2. Click the report.
   3. Click **Details** in the top right.
   4. Click the **Add Person** icon.
   5. Enter the email address or phone number of the person you will share the report with.
   6. Enter a message, if desired.
   7. Click **Share Report**. 

- **To allow someone to pay bills**: The primary domain contact can allow others to pay bills on their behalf by [assigning those individuals as Copilots](https://help.expensify.com/articles/expensify-classic/copilots-and-delegates/Assign-or-remove-a-Copilot).

**Is Bill Pay supported internationally?**

Payments are currently only supported for users paying in United States Dollars (USD).

**What’s the difference between a bill and an invoice?**

- A **bill** is a payable that represents an amount owed to a payee (usually a vendor or supplier), and it is usually created from a vendor invoice. 
- An **invoice** is a receivable that indicates an amount owed to you by someone else.

**Who can reimburse reports?**

Only a Workspace Admin who has added a verified business bank account to their Expensify account can reimburse employee reports.

**Why can’t I trigger direct ACH reimbursements in bulk?**

Expensify does not offer bulk reimbursement, but you can set up automatic reimbursement to automatically reimburse approved reports via ACH that do not exceed the threshold that you define.

{% include faq-end.md %}

</div>
