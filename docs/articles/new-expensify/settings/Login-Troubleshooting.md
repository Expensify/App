---
title: Login Troubleshooting
description: Troubleshoot common login issues — like missing Magic Codes, 2FA lockouts, SSO problems, or blocked emails — and find out who to contact to get back in fast.
keywords: [New Expensify, Expensify login, can't log in, login help, Magic Code missing, Two-Factor Authentication, SSO login, email domain blocked, login error, Concierge login support, account access issue, locked out]
---

# Login troubleshooting

If you're not able to log into your Expensify account, find your situation below to see what's causing it and how to fix it.

---

## Can't receive Magic Code login email

A Magic Code is a one-time login code that Expensify emails you when you try to sign in instead of asking for a password. If you’re not getting the email, your email provider might be blocking or filtering it.

**Common Cause**
Your email provider is blocking or filtering messages from Expensify. 

**What you can try**
- Wait up to **10 minutes** for the email to arrive — delivery can be delayed.
- Check your **spam**, **junk**, and **trash** folders.
- Search for **Expensify Magic Code** or concierge@expensify.com.
- Add concierge@expensify.com to your email contacts.
- Click **Didn't receive a magic code?** on the login screen to request the code be sent again. 
- Wait **2–3 minutes** between resend attempts. If you request a new code while one is still being generated, the older one won't work. 

**What won’t help**
- Clicking "Resend" repeatedly without checking your filters.
- Logging in with a phone number or backup email. The Magic Code is always sent to the primary login set on the account - not any secondary contact methods. 

**Who to contact**
- **Using a work email?** Ask your IT team to [allowlist Expensify emails](https://help.expensify.com/articles/expensify-classic/email/How-to-Allowlist-Expensify).
- **Using a personal email?** If you’ve already tried the steps above, contact Concierge.

[See the full guide to fixing email delivery →](https://help.expensify.com/articles/expensify-classic/email/Troubleshoot-Email-Delivery-Issues)

---

## Locked out by Two-Factor Authentication (2FA) 

Two-factor authentication (2FA) is a feature that adds an extra layer of security to your account, and can be enabled by you on your account or required by a Domain Admin. After entering your Magic Code, you’ll be prompted to enter another code — this one comes from your authenticator app.

**Common Cause**
Two-Factor Authentication (2FA) is enabled on your account, but you no longer have access to your authenticator app or recovery codes.

**What you can try**
- Search your phone for any authenticator apps (e.g., Google Authenticator, Authy).
- Search your device for backup or recovery codes, saved in a file called `two-factor-auth-codes`.

**What won’t help**
- Signing in again
- Reinstalling the authenticator app without recovery codes.

**Who to contact**
- **Work email?** Ask your Domain Admin to reset your 2FA. 
- **No Domain Admin?** [Claim your domain](https://help.expensify.com/articles/expensify-classic/domains/Claim-And-Verify-A-Domain) to claim the domain and reset your 2FA settings yourself.
- **Personal email?** Without recovery codes, you’ll need to create a new account.

[Learn more about 2FA and account recovery →](https://help.expensify.com/articles/expensify-classic/security/Two-Factor-Authentication-Overview)

---

## Can't log in with SAML SSO

If your company uses SAML SSO, you'll be redirected to your company's Identity Provider (e.g., Okta, Azure) to authenticate.

**Common Cause**
Your company's SAML SSO configuration may have an issue affecting your account or domain

**What you can try**
- If you see the option "Would you like to sign in with a magic code or Single Sign-On?", choose **Magic Code** to log in with a code instead. 
- Double-check your credentials to ensure you are inputting the right details into your Identity Provider login screen. 
- Log in to another app you access using the same Identity Provider login and see if you experience the same error.

**Who to contact**
- **Reach out to your IT team** to confirm SSO settings and ask them to follow the relevant steps to [Troubleshoot SAML SSO Login](https://help.expensify.com/articles/new-expensify/domains/Troubleshoot-SAML-SSO-Login)

[More about SSO logins →](https://help.expensify.com/articles/new-expensify/domains/Managing-Single-Sign-On-(SSO)-in-Expensify)

---

## Can't access your Expensify login email

**Common Cause**
You’ve changed jobs or lost access to the email inbox tied to your Expensify login. 

**What you can try**
- If your company still owns the email domain, ask the internal team who manages email access to restore the email account so you can regain access. 

**Who to contact**
- **Still with the company?** Contact your Domain Admin or IT team.
- **No longer with the company?** Message Concierge. Include your old email and any associated reports or expenses to help confirm your identity.

---

## Unblock your email address

If you see a banner that says "We're having trouble emailing you", it means Expensify emails are temporarily suspended for your email address.

**Common Cause**
Expensify tried to email you but it bounced, either because it was not a real email address or the incoming mail server rejected it. 

**What to do**
1. Confirm the primary email address on your Expensify account is a real email account that can accept incoming emails.
2. Confirm with your IT team or email server that Expensify emails are not being blocked. 
3. Click the link in the banner to unblock your email. 

If you see errors like "mimecast", "blacklist", or "SMTP errors": 
- Share the error message with your IT team.
- Ask them to allowlist `expensify.com`.

[More on allowlisting and domain blocks →](https://help.expensify.com/articles/expensify-classic/email/How-to-Allowlist-Expensify)

---

## General login troubleshooting steps

Try these general troubleshooting steps:
- [Force a clean sign out](https://www.expensify.com/signout.php?clean=true).
- Switch browsers or devices.
- Try logging in using Incognito or Private mode.
- Check [Expensify’s system status page](https://status.expensify.com).

**Still blocked? Contact Concierge and include:**
- The email you're trying to log in with.
- A short description of what you’re seeing.
- Screenshots of any errors (if available).

---

# FAQ

## Who is my Domain Admin?
Ask your Workspace Owner or the person who approves your reports. To find your Workspace Owner, go to **Workspaces** and check the **Owner**
column.

## How can I keep access to my Expensify account after leaving my company?
[Add a secondary contact method](https://help.expensify.com/articles/new-expensify/settings/Update-Email-Address) (like a personal email) so you can still log in if you lose access to your work email.

## Why is Expensify asking for a Two-Factor Authentication (2FA) code I don’t remember setting up?  
Your Domain Admin may have required it. Try searching your phone for an authenticator app or recovery codes with the file name `two-factor-auth-codes`. 

## Can Expensify reset Two-Factor Authentication (2FA) if I use a personal email?  
No. If you’re not part of a company domain and didn’t save your recovery codes, your 2FA can’t be reset.

## How can I contact Concierge if I can't log into my account? 
Email concierge@expensify.com from the email address associated with your Expensify account. 

