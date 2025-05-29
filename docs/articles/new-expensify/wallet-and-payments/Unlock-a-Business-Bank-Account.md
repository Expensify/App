---
title: Unlock a Business Bank Account
description: Learn how to resolve issues with a locked business bank account in Expensify.
keywords: [New Expensify, unlock bank account, reimbursements, direct debit, ACH, bank rejected withdrawal]
---
<div id="new-expensify" markdown="1">

When you reimburse a report, Expensify initiates a withdrawal from your connected business bank account. If your bank rejects this withdrawal—due to **insufficient funds**, **missing authorization**, or **direct debit restrictions**—your account will be **locked** until the issue is resolved.

---

# Why Is My Bank Account Locked?

Common reasons include:

- Your bank account is not enabled for **ACH direct debits**
- There were **insufficient funds** available during a reimbursement attempt
- Your bank blocked the debit attempt

When this occurs, Expensify pauses reimbursements and locks the verified account as a precaution.

---

# How to Request an Unlock

To unlock your account:

1. Go to **Workspaces > [Workspace Name] > Bank Account**.
2. Click the **Fix** button next to the locked account.

This sends a request to the Expensify support team. A Concierge agent will contact you with the next steps.

> **Note:** Unlocking a bank account may take several business days due to ACH processing timelines and clawback periods.

---

# Enable Direct Debit with Your Bank

To ensure your bank allows direct debit from Expensify, share the following ACH details with your financial institution:

### For Reimbursements via Expensify:

- **ACH Company IDs**:  
  `1270239450`, `4270239450`, `2270239450`  
- **ACH Originator Name**: `Expensify`

### For Bill Payments via Stripe:

- **ACH Company IDs**:  
  `1800948598`, `4270465600`  
- **ACH Originator Name**: `expensify.com`  
- [Stripe ACH ID Reference](https://support.stripe.com/questions/ach-direct-debit-company-ids-for-stripe)

### For International Reimbursements via CorPay:

- **ACH Company IDs**:  
  `1522304924`, `2522304924`  
- **ACH Originator Name**: `Cambridge Global Payments`

---

Once your bank has approved these IDs and your account is reviewed, Concierge will notify you when it is unlocked and reimbursements can resume.

</div>
