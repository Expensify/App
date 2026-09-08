---
title: Troubleshoot adding your work email during account setup
description: Learn what to do when Expensify can’t add your work email during account setup, including when the email is a domain controlled login for an existing Expensify account.
keywords: [New Expensify, work email, add work email, couldn’t add work email, domain controlled login, existing Expensify account, account setup, contact methods, private domain, closed work account]
internalScope: Audience is people setting up a new Expensify account who are asked What’s your work email? Covers the messages shown when the work email can’t be added and how to add the email afterward as a contact method. Does not cover login troubleshooting for an existing account, domain claiming, or merging two existing accounts.
---

# Troubleshoot adding your work email during account setup

When you create a new Expensify account, Expensify asks **What’s your work email?** Connecting your work email lets you forward receipts to receipts@expensify.com and join colleagues who already use Expensify.

Adding a work email is optional. If Expensify can’t add the address you entered, you can finish setting up your account and add the address later.

---

## Who can add a work email during account setup

- Anyone creating a new Expensify account. The step appears once, while you set up your account.
- The address must be on a private company domain. Public domains, such as gmail.com, aren’t accepted.
- The address must be different from the email you signed up with.
- The address can’t already be a login on another Expensify account.

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

If the message appears under the work email field, correct the address and click **Add work email** again:

- **Please enter a valid work email from a private domain e.g. mitch@company.com** — enter an address on your company’s own domain instead of a personal address.
- **Please enter a different email than the one you signed up with** — enter your work address, not the address you used to create the account.
- **We couldn’t add your work email as you appear to be offline** — reconnect to the internet, then submit the address again.
- **This login is an existing account with Two-Factor Authentication (2FA) enabled.** — the address is already an Expensify login. Sign in to that account instead, or continue setup and add the address later.
- **This login is an existing account with SSO/SAML enabled.** — the address is already an Expensify login that authenticates through your company’s identity provider. Sign in to that account instead.
- **The work account associated with this email is closed.** — ask your company admin to reactivate the account, or finish setup and use a different address.

---

## How to add your work email after account setup

Add the address as a contact method on your account:

1. In the navigation tabs (on the left on web, and at the bottom on mobile), go to **Account** > **Profile**.
2. Click **Contact methods**.
3. Click **New contact method**.
4. Enter the email address, then follow the prompts to verify it.

An address that is a login on another Expensify account, including a domain controlled login, can’t be added as a contact method either. Sign in to that account instead.

---

# FAQ

## Do I have to add a work email to finish setting up my account?

No. Adding a work email is optional. Click **Got it** on the **Couldn’t add work email** screen and you’ll continue to the next setup step.

## Can I try a different work email on the same account?

No. The work email step appears once per account. Add the address you want as a contact method after setup instead.

## Can I merge the existing account into my new account instead?

Not if the existing account is on a private domain. You have to sign in to the company account and merge the personal account into it, and two company accounts on private domains can’t be merged. Learn how to [merge two Expensify accounts](/articles/new-expensify/settings/Merge-Accounts).
