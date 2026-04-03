---
title: Update Contact Methods
description: Add or update contact methods for your Expensify account, including changing your default email or phone number.
keywords: [New Expensify, change email, add email, change phone number, add phone number, contact method, update default email, account access, secondary login, login methods, additional email, multiple logins]
internalScope: Audience is all members. Covers adding contact methods, login behavior, verification, default contact method rules. Does not cover workspace-level settings, domain controls, account recovery edge cases.
---

# Update contact methods 

Keep your Expensify account secure and accessible by adding or updating contact methods. You can add multiple emails or phone numbers, choose a default contact method, and remove outdated contact methods.

If your company uses SAML SSO, you can only log in with your company email address.

If you're having trouble logging into your account, see the [login troubleshooting guide](https://help.expensify.com/articles/new-expensify/settings/Login-Troubleshooting).

---

## Why add another contact method to your Expensify account

Adding an additional contact method helps you:

- **Log in using multiple options** — any added email or phone number can be used to access your account.
- **Maintain access** if your primary email is tied to an employer domain.
- **Switch your default contact method** to a new email or phone number.

 **Note:** Even if you log in using a secondary contact method, **the magic code is always sent to your default contact method**.
 
---

## How to add or change a contact method

To add or update a contact method:

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Account > Profile**.
2. In the **Public** section, select **Contact methods**.
3. Select **New Contact Method**.
4. Enter the verification code sent to your current default contact method. 
5. Enter the new email address or phone number you want to add.
6. Click **Add**.
7. Enter the verification code sent to the new contact method, then select **Verify**.

After verifying, select any contact method to:

- Set it as your default
- Remove it
- Re-send verification

---

## How login works with multiple contact methods

- You can log in using any verified email or phone number on your account.
- All added contact methods can be used as login credentials.
- The magic code is always sent to your default contact method, regardless of which one you used to log in.

Example:
- You log in using a secondary email → the magic code is sent to your default email or phone number, not the one you entered.

# FAQ

## Why is my magic code sent to a different email than the one I used to log in?

Expensify always sends the magic code to your default contact method. Even if you log in with a secondary email or phone number, the code goes to your default for security and consistency.

## Can I change where my magic code is sent?

Yes. Set a different contact method as your default, and future magic codes will be sent there.

## Can I log in with a phone number instead of an email?

Yes. Any verified phone number or email added to your account can be used to log in.

## How can I confirm my current default contact method?

You can view your current default contact method by navigating to **Account > Profile** and clicking **Contact methods**. Your default contact method will show a note that says "_We'll use this method to contact you_".

## Why don't I see **Set as default** under a contact method? 

Only verified contact methods can be set as default. If you don't see **Set as default** under your contact method, please verify it by entering the magic code sent to the current default contact method. 
