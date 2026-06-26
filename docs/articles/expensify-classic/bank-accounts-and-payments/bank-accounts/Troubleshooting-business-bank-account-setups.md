---
title: Troubleshooting business bank account setup
description: Fix common errors when adding or verifying a verified business bank account in Expensify.
keywords: [bank account troubleshooting, verified business account, Onfido error, missing test transactions, ACH whitelisting, ID upload issues, missing verification amounts, missing micro deposits, validation failed, test deposits wrong, Fix button missing, Unlock button missing, bank account pending, verification stuck, documentation review]
---
<div id="expensify-classic" markdown="1">

If you're having trouble connecting or verifying your business bank account in Expensify, this guide covers the most common issues and how to fix them.

---

# Troubleshooting Verification Errors

## Why is Expensify asking for additional documents?

If automatic verification fails, Concierge may request additional documentation or a letter from your bank. Concierge will message you directly with next steps.

---

## What does “Your bank account is almost set up!” mean?

This message means we’ve sent three test transactions to your bank account. Once you receive them (usually within 1–2 business days), enter the exact amounts to finish setup.

> **Note:** The account is not ready to use until you enter the test amounts.

---

## What if I don’t receive all three test transactions?

After two business days:
- Ask your bank to whitelist Expensify’s ACH IDs:
  - **1270239450**
  - **4270239450**
- Then contact Concierge to re-trigger the transactions.

---

## My bank requires additional security checks

If your bank has 2FA or security verification:
- Complete the security prompt when connecting
- If it fails, close the window and select **Connect manually**

Manual connection allows you to proceed without live login.

---

# Troubleshooting ID and Video Upload Issues

## I received a “something’s gone wrong” error when adding my ID to Onfido

Check the following:
- Use **Safari (iPhone)** or **Chrome (Android)**
- Allow browser access to camera and microphone
- Clear your web cache
- Close overlapping apps (e.g., Messenger bubbles)
- If on corporate Wi-Fi, check **firewall settings**
- On **iOS 15+**, disable **Hide IP address** in Safari

Try again using a different device if needed.

---

## Why can’t I input my address or upload my ID?

Make sure:
- You’re using a **U.S. address**
- You have a valid **U.S.-issued photo ID** and **SSN**

If not, ask another admin who meets the requirements to add the bank account.

---

# Ownership and Industry Restrictions

## Should I add a Beneficial Owner if my business is owned by another company?

No. Only enter **individuals** who own **25% or more** of the business.

---

## Are there industries Expensify does not support for payments?

Yes. Expensify cannot process payments for:

- Securities brokers & dealers
- Escort or dating services
- Massage parlors
- Gambling or casinos
- Non-bank financial institutions
- Wire/money order services
- Government-owned lotteries
- Online gambling or betting platforms
- Horse or dog racing operations
- Crypto-related businesses
- Marijuana-related businesses
- Firearms manufacturers or sellers
- NFT-related businesses

If your business operates in one of these industries, you may not be able to use Expensify for payments.

---

# Troubleshooting Test Transaction Validation

## I entered the correct test transaction amounts but validation failed

If you can see the test transactions in your bank account but the amounts are being rejected:

- **Wait for transactions to fully post.** Pending transactions may display slightly different amounts than the final posted values. Only enter amounts after they have fully posted.
- **Double-check for rounding.** Enter the exact amounts including cents. Even a one-cent difference will cause validation to fail.
- **Verify you have the right transactions.** Look for transactions labeled "Expensify, Inc. Validation" or similar. If you have multiple bank accounts connected, make sure you are not mixing up transactions from different accounts.

If you have confirmed all of the above and validation still fails, contact Concierge for assistance.

## Validation is temporarily locked after multiple failed attempts

Entering incorrect amounts multiple times will temporarily lock the validation process. The lock typically lasts a few hours. After the lock period, retry by navigating to your bank account in **Settings > Account > Payments** and clicking the pending bank account.

If you are unable to validate after the lock period has passed, contact Concierge.

## Test transactions expired or validation window closed

Test transactions and the validation window are active for a limited time. If you did not complete validation before the window expired, contact Concierge to request a new set of test transactions.

---

# Troubleshooting Additional Documentation Review

## Concierge says my account requires additional documentation

If automatic verification cannot be completed, Expensify may request a manual review of your supporting documents. This can happen when:

- Business information does not match public records
- The business is newly formed or has limited public data
- Additional verification is required for compliance reasons

Concierge will send you a message with specific instructions on what to provide. Common documents include a bank statement, business license, articles of incorporation, or EIN confirmation letter.

## How long does the documentation review take?

Reviews are typically completed within **1-3 business days** after all requested documents are submitted. You will receive a message from Concierge when the review is complete. If your review is taking longer than expected, contact Concierge for a status update.

</div>
