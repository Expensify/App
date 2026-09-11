---
title: Troubleshoot adding your work email during account setup
description: Learn what to do when Expensify can’t add your work email during account setup, including when the email is a domain controlled login for an existing Expensify account.
keywords: [New Expensify, work email, add work email, couldn’t add work email, domain controlled login, existing Expensify account, account setup, contact methods, private domain, closed work account]
internalScope: Audience is people who signed up with a personal address on a public domain and are asked What’s your work email? during account setup. Covers who sees the step, the verify and merge path for an ordinary existing account, the messages shown when the work email can’t be added, and how to add the email afterward as a contact method. Does not cover login troubleshooting for an existing account, domain claiming, or merging two existing accounts.
---

# Troubleshoot adding your work email during account setup

When you create a new Expensify account with a personal email address, Expensify asks **What’s your work email?** Connecting your work email lets you forward receipts to receipts@expensify.com and join colleagues who already use Expensify.

Adding a work email is optional. If Expensify can’t add the address you entered, you can finish setting up your account. If the address isn’t already a login on another Expensify account, you can add it later as a contact method.

---

## Who sees the work email step

- You signed up with a personal address on a public domain, such as gmail.com. If you signed up with your company address, Expensify doesn’t ask for a work email.
- The address you enter must be on a private company domain. Public domains aren’t accepted.
- The address you enter must be different from the email you signed up with.

---

## What happens if the address is already an Expensify login

If the address is a login on an ordinary Expensify account, Expensify shows **Verify your work email** and sends a security code to that address. Enter the code and Expensify merges the account you just created into the work account, then signs you in to it.

Some existing accounts can’t be merged this way: accounts with Two-Factor Authentication (2FA) or SSO/SAML enabled, closed accounts, and domain controlled logins. Sign in to the existing account directly instead.

---

## What the Couldn’t add work email screen means

If the address you entered is a login on an existing Expensify account that your company controls, Expensify replaces the form with a screen titled **Couldn’t add work email** that reads:

> [your work email] is a domain controlled login for an existing Expensify account.

Your company’s Domain Admins manage that login, so it can’t also be added to the new account you’re setting up. Click **Got it** to continue setting up your account.

To use that address, sign in to the existing account instead of the new one. If you can’t sign in to it, ask a Domain Admin at your company for access. Learn more about [what Domain Admins manage](/articles/new-expensify/domains/Domain-Admins).

If Expensify couldn’t add the address for any other reason, the same screen reads **We couldn’t add [your work email]. Please try again later in Settings or chat with Concierge for guidance.** Click **Got it** to continue setting up your account, then add the address as a contact method later.

<!-- SCREENSHOT:
Suggestion: The full-screen Couldn’t add work email state during account setup, showing the domain controlled login message with an email address filled in and the Got it button.
Location: Immediately after this section.
Purpose: Confirms to members that this full-screen message is expected behavior for a domain controlled address and is not a failed or broken account setup.
-->

---

## How to fix each work email message during account setup

These messages appear under the work email field, and the form stays open. Correct the address and click **Add work email** again:

- **Please enter a valid work email from a private domain e.g. mitch@company.com** — enter an address on your company’s own domain instead of a personal address.
- **Please enter a different email than the one you signed up with** — enter your work address, not the address you used to create the account.
- **We couldn’t add your work email as you appear to be offline** — reconnect to the internet, then submit the address again.
- **This login is an existing account with Two-Factor Authentication (2FA) enabled.** — the address is already an Expensify login that can’t be merged. Sign in to that account instead, or enter a different address.
- **This login is an existing account with SSO/SAML enabled.** — the address is already an Expensify login that authenticates through your company’s identity provider. Sign in to that account instead.
- **The work account associated with this email is closed.** — ask your company admin to reactivate the account, or enter a different address.

---

## How to add your work email after account setup

Add the address as a contact method on your account:

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Account** > **Profile**.
2. Click **Contact methods**.
3. Click **New contact method**.
4. Enter the email address, then follow the prompts to verify it.

This works for an address that isn’t a login on another Expensify account. If the address is a domain controlled login, or a login on an account with 2FA or SSO/SAML enabled, adding it as a contact method fails with **Failed to add this contact method. Please reach out to Concierge for help.** Sign in to that account instead, or chat with Concierge.

---

# FAQ

## Do I have to add a work email to finish setting up my account?

No. Adding a work email is optional. On the **What’s your work email?** form, click **Skip** to continue to the next setup step. If you’re already on the **Couldn’t add work email** screen, click **Got it** instead.

## Can I try a different work email on the same account?

Yes, while the work email step is still open. If the message appears under the field, correct the address and click **Add work email** again. Once you click **Skip** or **Got it**, the step doesn’t appear again — add the address you want as a contact method after setup instead.

## Can I merge the existing account into my new account instead?

No, the merge only runs the other way. When Expensify can merge the accounts, it moves the new account you just created into the work account and signs you in to that one. Two company accounts on private domains can’t be merged. Learn how to [merge two Expensify accounts](/articles/new-expensify/settings/Merge-Accounts).
