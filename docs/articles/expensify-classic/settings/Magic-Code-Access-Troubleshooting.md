---
title: Troubleshooting Missing Magic Code Emails
description: Dedicated guide for resolving Magic Code login email delivery issues and accessing your Expensify account.
keywords: [magic code not received, login email missing, cannot sign in, expensify email blocked, expensify login help, email deliverability, magic code troubleshooting, account access]
---
Magic Code emails are critical for logging into your Expensify account. If you're not receiving these emails, this guide provides step-by-step troubleshooting to help you regain access.

---

# Quick Fixes for Users

**Try these steps first before contacting support:**

## 1. Wait and Check Basic Locations

- **Wait up to 10 minutes** - Magic Codes may be delayed due to email processing
- **Check your spam/junk folder** - Look specifically for emails from "expensify.com"
- **Search your entire inbox** for "Expensify" to find filtered messages
- **Check your trash/deleted items** folder

## 2. Improve Email Delivery

- **Add concierge@expensify.com to your contacts** to prevent future filtering
- **Mark previous Expensify emails as "Not Spam"** if found in spam folder
- **Create an email filter** to direct all expensify.com emails to your inbox

## 3. Try Resending

- **Click "Resend Magic Code"** on the login screen
- **Wait 2-3 minutes** between resend attempts
- **Limit to 3 attempts** before trying other solutions

---

# Alternate Access Options

## Use Backup Contact Methods

If you have multiple email addresses or phone numbers configured:

1. Go to the **"Can't access your account?"** link on the login page
2. **Try an alternate email** if you have one configured
3. **Use phone verification** if available for your account

## Update Contact Methods

If you can access your account through alternate means:

1. Go to **Settings > Account > Contact Methods**
2. **Add a backup email** for future login issues
3. **Verify the new contact method** before you need it

---

# For IT Teams and Administrators

## Email Server Diagnostics

**Check these common blocking points:**

1. **Review email server logs** for messages from expensify.com
2. **Verify domain allowlist** includes the full expensify.com domain
3. **Check third-party filters** (Mimecast, Proofpoint, Barracuda, etc.)
4. **Confirm SPF/DKIM settings** allow Expensify's authentication

## Allowlist Configuration

**Ensure these domains and addresses are allowlisted:**

- **Domain:** expensify.com
- **Key addresses:** concierge@expensify.com, receipts@expensify.com
- **IP ranges:** Contact Expensify Concierge for current sending IP ranges

## Test Email Delivery

1. **Send a test email** to receipts@expensify.com from the affected domain
2. **Monitor server logs** for delivery confirmation or bounce messages
3. **Check with your email provider** about any recent filtering changes

---

# When to Escalate

## Contact Your IT Team If:

- You work for a **company with managed email** (not Gmail, Yahoo, etc.)
- Error messages mention **"mimecast," "blacklist," or filtering services**
- **Multiple employees** report similar email delivery issues
- You're using **corporate Wi-Fi or VPN** that might affect email

## Contact Expensify Concierge If:

- You use a **personal email provider** (Gmail, Yahoo, Outlook.com, etc.)
- Your **IT team has confirmed allowlisting** but you're still blocked
- You need **immediate account access** for business purposes
- **All troubleshooting steps** have been completed without success

### Information to Include When Contacting Support:

- **Your email domain** (e.g., @company.com or @gmail.com)
- **Exact timestamp** of your login attempt
- **Screenshots of any error messages**
- **Steps you've already tried** from this guide
- **Any bounce or SMTP error messages** you received

---

# FAQ

## How long should I wait for a Magic Code?

- **Normal delivery:** 1-3 minutes
- **Acceptable delay:** Up to 10 minutes
- **Contact support if:** No email after 10+ minutes

## Can I log in without a Magic Code?

Magic Codes are required for security. However, you may be able to use:
- **Alternate email addresses** configured on your account
- **Phone verification** if enabled
- **SSO login** if your company uses single sign-on

## What if I keep getting re-blocked after unblocking?

This usually indicates:
- **Corporate email servers** automatically re-blocking after bounce events
- **Third-party spam filters** maintaining persistent blocks
- **Email configuration changes** at your organization

**Solution:** Work with your IT team to implement permanent allowlisting rather than temporary unblocks.

## Why do Magic Codes work sometimes but not others?

**Common causes:**
- **Email server load** causing intermittent delays
- **Spam filter updates** changing blocking behavior
- **Network connectivity issues** between email providers
- **Corporate policy changes** affecting email routing

## Is it safe to add Expensify to my email allowlist?

Yes. Expensify emails are:
- **SPF and DKIM-signed** to prevent spoofing
- **Cryptographically authenticated** to verify legitimacy
- **Sent only from verified domains** controlled by Expensify
