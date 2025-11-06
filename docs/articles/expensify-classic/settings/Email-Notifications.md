---
title: Expensify Email Notifications
description: Troubleshooting steps for receiving emails and notifications from Expensify, including Magic Code login emails and unblock procedures.
keywords: [Expensify Classic, Email notifications, spam settings, magic code not received, login email missing, cannot sign in, expensify email blocked, expensify login help, email deliverability, spam filter, unblock email]
---
Occasionally, members may have trouble receiving Email notifications from Expensify, including Magic Code Emails, account validation Emails, contact method validations, integration Emails, or report action notifications.

---

# Magic Code Login Emails

Magic Code emails are sent when you log in to Expensify and are critical for account access. These emails may be delayed or blocked due to spam filtering, corporate email policies, or server-level blocks. If you choose to or are automatically directed to sign in via SAML/SSO, you will **not** receive a magic code.

## Quick Fixes for Users

If you're not receiving your Magic Code email:

1. **Wait up to 10 minutes** - Magic Codes may be delayed due to email processing
2. **Check spam/junk folders** - Search for emails from "expensify.com" or "concierge@expensify.com"
3. **Search your entire inbox** for "Expensify" to find filtered messages
4. **Add concierge@expensify.com to your contacts** to prevent future filtering
5. **Try resending the code** by clicking "Resend" on the login screen

## Expected Wait Times

- **Normal delivery:** 0-3 minutes
- **Delayed delivery:** Up to 10 minutes
- **If no email after 10 minutes:** Follow the troubleshooting steps below

## When to Escalate

Contact Expensify Concierge if you've tried the above steps and still can't receive Magic Codes. Include:
- Your email domain (e.g., @company.com)
- Timestamp of your login attempt
- Any bounce or SMTP error messages you received

---

# Troubleshooting Missing Expensify Notifications

## Issue: The Email or Notification Is Never Received, and No Error Message Appears

Emails can sometimes be delayed and may take up to 10 minutes to arrive. If an expected notification has not arrived:

- Check your **Email Preferences** via **Settings > Account > Preferences**. In the **Contact Preferences** section, ensure the relevant notification types are enabled.
- Check your Email spam and trash folders, as Expensify messages might be filtered incorrectly.
- Ensure that Expensify Emails are not blocked by adding the domain **expensify.com** to your Email provider's allowlist.

## Issue: A Banner Says "We're Having Trouble Emailing You"

This banner appears when Expensify detects that emails to your address are bouncing or being blocked.

### Step 1: Try the Self-Service Unblock

1. Confirm that all Email addresses on your Expensify account are valid (including all Contact Methods and Secondary Logins)
2. Click the link in the banner labeled **"here"**
3. If successful, you will see a confirmation that your Email was unblocked

![Expensify Email Error](https://help.expensify.com/assets/images/Email Error - Classic.png){:width="100%"}

### Step 2: If the Unblock Fails

**If unsuccessful, another error may appear:**

- If the error or SMTP message includes a URL, follow the provided link for further instructions.
- If the message references **"mimecast.com"**, consult your IT team.
- If the message mentions **"blacklist"**, your company may use a third-party Email filtering service. Contact your IT team for assistance.

![Expensify SMTP Error](https://help.expensify.com/assets/images/ExpensifyHelp_SMTPError.png){:width="100%"}

### Step 3: Persistent Unblock Issues

If clicking "here" doesn't resolve the issue or you keep getting re-blocked:

**Common Causes:**
- Corporate email servers automatically re-block after bounce events
- Third-party spam filters maintain their own blacklists
- Email server configuration changes

**Next Steps:**
1. Contact your IT team with the error message details
2. Request a permanent allowlist for **expensify.com** 
3. If the issue persists after IT involvement, contact Expensify Concierge with:
   - Screenshots of the error messages
   - Confirmation that your IT team has allowlisted expensify.com
   - Your company's email domain

---

# Further Troubleshooting for Public Domains

If you use a public Email provider (e.g., **gmail.com** or **yahoo.com**), try the following steps:

- Search for messages from **expensify.com** in your spam folder, open them, and mark them as **Not Spam**.
- Configure an Email filter to direct all messages from **expensify.com** to your inbox.
- Add known Expensify Email addresses (e.g., **concierge@expensify.com**) to your contacts list.

---

# Further Troubleshooting for Private Domains

If your organization uses a private domain, Expensify Emails may be blocked at the server level. This may happen due to changes in your Email provider’s filtering settings. Work with your IT team to:

- Ensure **expensify.com** is allowlisted on your domain Email servers.
- Confirm that there is no server-level Email blocking.
- Verify that spam filters are not blocking Expensify Emails.

Even if you have received Expensify Emails in the past, confirm that **expensify.com** is still allowlisted.

## Companies Using Outlook

- Add Expensify to your personal Safe Senders list:
  - [Outlook Email Client](https://support.microsoft.com/en-us/office/add-recipients-of-my-email-messages-to-the-safe-senders-list-be1baea0-beab-4a30-b968-9004332336ce)
  - [Outlook.com](https://support.microsoft.com/en-us/office/safe-senders-in-outlook-com-470d4ee6-e3b6-402b-8cd9-a6f00eda7339)
- **IT Administrators:** Add Expensify to the domain’s Safe Senders list:
  - [Create Safe Sender Lists in EOP](https://learn.microsoft.com/en-us/defender-office-365/create-safe-sender-lists-in-office-365)
- **Company Administrators:** Contact Outlook support for domain-specific configurations.

## Companies Using Google Workspaces

- **IT Administrators:** Adjust Email allowlist and safe senders settings to include **expensify.com**:
  - [Allowlists, Denylists, and Approved Senders](https://support.google.com/a/answer/60752)

---

# FAQ

## What if I still don't get my Magic Code after following all the steps?

If you've waited 10+ minutes, checked spam folders, and tried resending but still don't receive your Magic Code:

1. **Try an alternate contact method** if you have one configured in your account settings
2. **Contact Expensify Concierge** with your email domain and timestamp of the login attempt
3. **Ask your IT team** to check server logs for blocked messages from expensify.com

## How long should I wait before trying to resend my Magic Code?

- **First retry:** Wait at least 2-3 minutes before requesting a new code
- **Subsequent retries:** Wait 5-10 minutes between attempts to avoid overwhelming email filters
- **If no success after 3 attempts:** Follow the troubleshooting steps or contact support

## When should I contact my IT team vs Expensify support?

**Contact your IT team first if:**
- You work for a company with managed email (not Gmail, Yahoo, etc.)
- The error message mentions "mimecast," "blacklist," or specific filtering services
- Other employees at your company report similar email issues

**Contact Expensify Concierge if:**
- You use a personal email provider (Gmail, Yahoo, Outlook.com, etc.)
- Your IT team has confirmed expensify.com is allowlisted but you're still blocked
- You need help with account access after trying all troubleshooting steps

## How Can I Be Sure That Emails from Expensify Are Legitimate and Not Spam?

Expensify Emails are **SPF** and **DKIM-signed**, meaning they are cryptographically signed and encrypted to prevent spoofing.

## Why Do Legitimate Emails from Expensify Sometimes End Up Marked as Spam?

This typically happens when a third-party domain or IP reputation service mistakenly flags our domain or one of our sending IP addresses. Many IT departments use these lists to filter company-wide email.

## What Is the Best Way to Ensure Expensify Emails Are Not Marked as Spam?

For server-level spam detection, the best approach is to verify **DKIM** and **SPF** rather than relying solely on the reputation of the sending IP address.
