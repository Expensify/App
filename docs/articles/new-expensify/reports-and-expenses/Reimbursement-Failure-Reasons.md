---
title: Reimbursement Failure Reasons in Expensify
description: Learn why a reimbursement failed in Expensify, what each Corpay ACH return reason means, and how Workspace Admins and members can fix and retry the payment.
keywords: reimbursement failed, reimbursement unsuccessful, ACH bounce, Corpay return code, payment bounced, report returned to Approved, bank account name mismatch, retry reimbursement, Workspace Admin, update bank account Expensify
internalScope: Audience is Workspace Admins and members who submit reports. Covers Corpay ACH return reason messages, what each reimbursement failure means, and how to resolve and retry payment. Does not cover bank account setup steps in detail, accounting integrations, non-ACH payments, or non-Corpay failures.
---

When a reimbursement fails in Expensify, you’ll see a message in the report chat explaining why the payment was unsuccessful.

The report automatically returns to **Approved** status so the issue can be fixed and the payment can be retried.

This article explains the most common Corpay ACH return reasons, what they mean, and exactly what to do next.

---

# What Happens When a Reimbursement Fails in Expensify

If an ACH reimbursement fails:

- A message appears in the report chat with the failure reason.
- The report moves from **Processing** back to **Approved**.
- A Workspace Admin must retry the payment after the issue is resolved.

---

# Common Reimbursement Failure Reasons in Expensify

Below are the most common messages you may see, what they mean, and how to resolve them.

---

## The Account Name Is a Close Match but Not Exact

The name on the bank account is similar to the name in Expensify, but not an exact match.

Example:
- Bank account: Robert Smith  
- Expensify profile: Bob Smith  

**How to fix it:** The member should:

1. Confirm the exact account holder name with their bank.
2. Update their bank account name in Expensify to match exactly.

Even small differences like nicknames, missing middle initials, or extra spaces can cause ACH rejection.

---

## The Account Name Does Not Match

The account holder name provided in Expensify does not match the name on file with the bank.

**How to fix it:** The member should:

1. Contact their bank to confirm the exact account holder name.
2. Update their bank account details in Expensify so the name matches exactly.
3. Notify the Workspace Admin once updated so the payment can be retried.

---

## The Account Name Matches for a Business Account

The payment was sent as a personal reimbursement, but the bank account is registered as a business account.

**How to fix it:** Confirm the intended account type:

- Personal bank account
- Business bank account

Then update the connected bank account in Expensify to match.

---

## The Account Name Matches for a Personal Account

The payment was sent as a business reimbursement, but the connected account is a personal account.

**How to fix it:** Confirm the intended account type and reconnect the correct bank account in Expensify.

---

## Account Not Found

The account number or routing number does not correspond to a valid bank account.

**How to fix it:** The member should:

1. Double-check their account and routing numbers.
2. Remove the incorrect bank connection.
3. Reconnect their bank account with the correct details.

---

## Account Has Been Switched

The bank account has been migrated, closed, or transferred to a new account number.

**How to fix it:** The member should:

1. Confirm their current bank account details.
2. Reconnect their bank account in Expensify using the updated information.

---

## Unable to Confirm Account Name

The bank does not support account name verification for this account type.

Expensify cannot automatically verify the account holder name through the bank.

**What to do:** Manually confirm the account details with the member, then retry the payment once confirmed.

---

## Unable to Check Account Name

The account holder opted out of name verification at their bank.

**What to do:** Verify the bank details directly with the member, then retry the reimbursement once confirmed.

---

# How Workspace Admins Retry a Failed Reimbursement in Expensify

If you're a Workspace Admin, follow these steps:

1. Go to the **Reports** tab.
   - On web: Select **Reports** from the navigation tabs on the left.
   - On mobile: Tap **Reports** in the navigation tabs on the bottom.
2. Open the returned report (status: **Approved**).
3. Review the failure message in the report chat.
4. Confirm the member has corrected their bank details.
5. Click **Pay** to retry the reimbursement.

Payments aren't retried automatically -- you must manually click **Pay** after the issue is resolved.

---

# How Members Fix Bank Details After a Reimbursement Failure

If your reimbursement failed, follow these steps:

1. Open the report from the **Reports** tab.
   - On web: Select **Reports** from the navigation tabs on the left.
   - On mobile: Tap **Reports** in the navigation tabs on the bottom.
2. Review the failure message in the report chat.
3. Go to **Settings**.
   - On web: Select **Settings** from the navigation tabs on the left.
   - On mobile: Tap your profile picture, then tap **Settings**.
4. Select **Wallet**.
5. Remove your existing bank connection.
6. Add your bank account again using the exact name and correct account details.
7. Let your Workspace Admin know once your information is updated.

---

# Retry the Reimbursement After Fixing Bank Details

Once bank details are corrected:

- The report remains in **Approved** status.
- A Workspace Admin must click **Pay** to send the reimbursement again.

This ensures the issue is fully resolved before funds are resent.

---

# FAQ

## Does Expensify automatically retry failed reimbursements?

No. The report returns to **Approved** status. A Workspace Admin must manually click **Pay** to retry the reimbursement.

---

## How long does a retried reimbursement take to process?

Retried payments follow the same ACH processing timeline as the original payment.

---

## What if a reimbursement failure message not listed here appears?

If the message appears as a raw return reason from Corpay and is unclear:

- Workspace Admins can review the full message in the report chat.
- If additional help is needed, contact Concierge with the exact error message.

---

## Does this article apply to all reimbursement failures?

No. This article covers ACH reimbursement failures processed through Corpay. It does not apply to:

- International wire payments  
- Non-ACH payment methods  
- Accounting sync issues  
- Bank connection setup errors  
