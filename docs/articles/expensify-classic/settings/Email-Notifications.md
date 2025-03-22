---
title: Expensify Email Notifications
description: Troubleshooting steps for receiving emails and notifications from Expensify.
keywords: [Expensify Classic, Email notifications, spam settings]
---
<div id="expensify-classic" markdown="1">

Occasionally, members may have trouble receiving Email notifications from Expensify, including Magic Code Emails, account validation Emails, contact method validations, integration Emails, or report action notifications.

---

# Troubleshooting Missing Expensify Notifications

## Issue: The Email or Notification Is Never Received, and No Error Message Appears

Emails can sometimes be delayed and may take up to 30–60 minutes to arrive. If an expected notification has not arrived:

- Check your **Email Preferences** via **Settings > Account > Preferences**. In the **Contact Preferences** section, ensure the relevant notification types are enabled.
- Check your Email spam and trash folders, as Expensify messages might be filtered incorrectly.
- Ensure that Expensify Emails are not blocked by adding the domain **expensify.com** to your Email provider’s allowlist.

## Issue: A Banner Says “We’re Having Trouble Emailing You”

Confirm that the Email address on your Expensify account is valid, then click the link in the banner labeled **"here."** If successful, you will see a confirmation that your Email was unblocked.

![Expensify Email Error](https://help.expensify.com/assets/images/Email Error - Classic.png){:width="100%"}

**If unsuccessful, another error may appear:**

- If the error or SMTP message includes a URL, follow the provided link for further instructions.
- If the message references **"mimecast.com"**, consult your IT team.
- If the message mentions **"blacklist"**, your company may use a third-party Email filtering service. Contact your IT team for assistance.

![Expensify SMTP Error](https://help.expensify.com/assets/images/ExpensifyHelp_SMTPError.png){:width="100%"}

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

## How Can I Be Sure That Emails from Expensify Are Legitimate and Not Spam?

Expensify Emails are **SPF** and **DKIM-signed**, meaning they are cryptographically signed and encrypted to prevent spoofing.

## Why Do Legitimate Emails from Expensify Sometimes End Up Marked as Spam?

This typically happens when a third-party domain or IP reputation service mistakenly flags our domain or one of our sending IP addresses. Many IT departments use these lists to filter company-wide email.

## What Is the Best Way to Ensure Expensify Emails Are Not Marked as Spam?

For server-level spam detection, the best approach is to verify **DKIM** and **SPF** rather than relying solely on the reputation of the sending IP address.

</div>
