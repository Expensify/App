---
title: Set notifications
description: This article is about how to troubleshoot notifications from Expensify. 
--- 

# Overview 
Sometimes members may have trouble receiving important email notifications from Expensify, such as Expensify Magic Code emails, account validation emails, secondary login validations, integration emails, or report action notifications (rejections, approvals, etc.). 

# Troubleshooting missing Expensify notifications

## Issue: The email or notification is never received, and no message, banner, or additional context is provided 
Emails can sometimes be delayed and could take up to 30-60 minutes to arrive in your inbox. If you're expecting a notification that still hasn't arrived after waiting: 
 - Check your **Email Preferences** on the web via **Settings > Account > Preferences**. In the **Contact Preferences** section, ensure that the relevant boxes are checked for the email type you're missing.
 - Check your email spam and trash folders, as Expensify messages might end up there inadvertently.
 - Check to make sure you haven't unintentionally blocked Expensify emails. Allowlist the domain expensify.com with your email provider.

## Issue: A banner that says “We’re having trouble emailing you” shows the top of your screen.
Confirm the email address on your Expensify account is a deliverable email address, and then click the link in the banner that says "here". If successful, you will see a confirmation that your email was unblocked. 

 ![ExpensifyHelp_EmailError]({{site.url}}/assets/images/ExpensifyHelp_EmailError.png){:width="100%"}
 
 **If unsuccessful, you will see another error:**
 - If the new error or SMTP message includes a URL, navigate to that URL for further instructions. 
 - If the new error or SMTP message includes "mimecast.com", consult with your company's IT team.
 - If the new error or SMTP message includes "blacklist", it means your company has configured their email servers to use a third-party email reputation or blocklisting service. Consult with your company's IT team.
   
![ExpensifyHelp_SMTPError]({{site.url}}/assets/images/ExpensifyHelp_SMTPError.png){:width="100%"}

# Further troubleshooting for public domains

If you are still not receiving Expensify notifications and have an email address on a public domain such as gmail.com or yahoo.com, you may need to add Expensify's domain expensify.com to your email's allowlist by taking the following steps: 

 - Search for messages from expensify.com in your spam folder, open them, and click “Not Spam” at the top of each message.
 - Configure an email filter that identifies Expensify's email domain expensify.com and directs all incoming messages to your inbox, to avoid messages going to spam.
 - Add specific known Expensify email addresses such as concierge@expensify.com to your email contacts list. 

# Further troubleshooting for private domains 

If your organization uses a private domain, Expensify emails may be blocked at the server level. This can sometimes happen unexpectedly due to broader changes in email providers' handling or filtering of incoming messages. Consult your internal IT team to assist with the following:

 -  Ensure that the domains expensify.com, mg.expensify.com, and amazonSES.com are allowlisted on domain email servers. These domains are the sources of various notification emails, so it's important they are allowlisted. 
 - Confirm there is no server-level email blocking and that spam filters are not blocking Expensify emails. Even if you receive messages from our Concierge support, ensure that expensify.com, mg.expensify.com, and amazonSES.com are all allowlisted, as notifications may use different servers.

## Companies using Outlook

- Add Expensify to your personal Safe Senders list by following these steps: [Outlook email client](https://support.microsoft.com/en-us/office/add-recipients-of-my-email-messages-to-the-safe-senders-list-be1baea0-beab-4a30-b968-9004332336ce) / [Outlook.com](https://support.microsoft.com/en-us/office/safe-senders-in-outlook-com-470d4ee6-e3b6-402b-8cd9-a6f00eda7339)
- **Company IT administrators:** Add Expensify to your domain's Safe Sender list by following the steps here: [Create safe sender lists in EOP](https://learn.microsoft.com/en-us/defender-office-365/create-safe-sender-lists-in-office-365)
- **Company IT administrators:** Add expensify.com, mg.expensify.com, and amazonSES.com to the domain's explicit allowlist. You may need to contact Outlook support for specific instructions, as each company's setup varies. 
- **Company administrators:** Contact Outlook support to see if there are additional steps to take based on your domain's email configuration. 

## Companies using Google Workspaces: 

- **Company IT administrators:** Adjust your domain's email allowlist and safe senders lists to include expensify.com by following these steps: [Allowlists, denylists, and approved senders](https://support.google.com/a/answer/60752)

{% include faq-begin.md %}

## How can I be sure that emails from Expensify are legitimate and not spam?

Expensify's emails are SPF and DKIM-signed, meaning they are cryptographically signed and encrypted to prevent spoofing.

## Why do legitimate emails from Expensify sometimes end up marked as spam?

The problem typically arises when our domain or one of our sending IP addresses gets erroneously flagged by a 3rd party domain or IP reputation services. Many IT departments use lists published by such services to filter email for the entire company.

## What is the best way to ensure emails are not accidentally marked as Spam? 

For server-level spam detection, the safest approach to allowlisting email from Expensify is to verify DKIM and SPF, rather than solely relying on the third-party reputation of the sending IP address.

{% include faq-end.md %}
