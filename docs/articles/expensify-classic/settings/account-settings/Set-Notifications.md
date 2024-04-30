---
title: Set notifications
description: This article is about how to troubleshoot notifications from Expensify. 
--- 

# Overview 
Sometimes, members may have trouble receiving important email notifications from Expensify, such as Expensify Magic Code emails, account validation emails, secondary login validations, integration emails, or report action notifications (rejections, approvals, etc.). 

# Here's how to troubleshoot missing Expensify notifications:

1. **No error message, but the email is never received**
The email might be delayed; give it 30-60 minutes to arrive in your inbox.
Check **Email Preferences** on the web via **Settings > Your Account > Preferences**In the **Contact Preferences** section. Ensure that the relevant boxes are checked for the email type you're missing. Check your email spam and trash folders, as Expensify messages might end up there inadvertently.
Check to make sure you haven't unintentionally blocked Expensify emails and whitelist [expensify.com](https://community.expensify.com/home/leaving?allowTrusted=1&target=http%3A%2F%2Fexpensify.com%2F), mg.expensify.com, and [amazonSES.com](https://community.expensify.com/home/leaving?allowTrusted=1&target=http%3A%2F%2Famazonses.com%2F) with your email provider.

2. **A "We're having trouble emailing you" banner at the top of your screen**
Verify that your email address in your account settings is correct and is a real deliverable email address. 
Re-send Verification Email: Look for an option to re-send a verification email, usually provided when this banner appears.

![ExpensifyHelp_EmailError]({{site.url}}/assets/images/ExpensifyHelp_EmailError.png){:width="100%"}

# Deep Dive 

**For Private Domains**:

If your organization uses a private domain, consult your IT department or IT person to ensure that the following domains are whitelisted to receive our emails: expensify.com, mg.expensify.com, and amazonSES.com. These domains are the sources of various notification emails, so make sure they aren't being blocked.

**For Public Domains (e.g., Gmail, Yahoo, Hotmail)**:

To whitelist our emails on public email services:

1. Check your Spam Folder: Search for messages from expensify.com in your Spam folder, open them, and click "Not Spam" at the top of the message.
2. Create a Filter: Set up a filter that identifies the entire expensify.com domain and directs all incoming messages to your inbox, preventing them from going to Spam.
3. Add Specific Contacts: While optional, adding specific email addresses from Expensify as contacts can further prevent emails from going to Spam.

Please note that even if you receive emails from our Concierge support communication, ensure that both expensify.com and mg.expensify.com are whitelisted as they use different servers.

**Email Server Blocking**:
Your email server may be blocking our emails due to spam filters or other services. Check with your IT department to investigate and resolve any server-level email blocking issues.

**Mimecast**:
If your company uses Mimecast, a service that can affect email deliverability, check with your IT department. If Mimecast is in use, reach out to us at concierge@expensify.com through a new email, as this should ensure delivery to your inbox. Mimecast should eventually recognize the Expensify domain, preventing future filtering.

**For Outlook Users**:
For Outlook users specifically:

1. Click the gear icon in Outlook and select "View all Outlook settings."
2. Choose "Mail" from the settings menu.
3. Under the "Junk email" submenu, click "Add" under "Safe senders and domains."
4. Enter the email address you want to whitelist.
5. Click "Save."

When you click the "Settings" link in the banner in Expensify, you'll be directed to your account settings page, where you may encounter a few different scenarios:

- "Temporarily Suspended Emails": If the message mentions "temporarily suspended emails to," follow the steps provided in the yellow box. This situation typically occurs when we can't find a valid inbox to send our emails to. Possible reasons include:
     - A misspelled email address during account creation.
     - Use of a distribution list email (acting as an "alias" email) without a linked inbox.
     - An auto-responder that has been responding to our emails for an extended period.
- To resolve this issue, confirm that the email address is indeed associated with an active inbox. Then, click the link that says "here," and your email should be unblocked shortly.
- SMTP Error (Gray Box): In some cases, you might encounter a gray box with an SMTP error message. This error can vary, but it typically looks something like this:

![ExpensifyHelp_SMTPError]({{site.url}}/assets/images/ExpensifyHelp_SMTPError.png){:width="100%"}

**These look a bit cryptic, yes, but hang in there!** 

The error messages you see are the raw message text received from your email provider's server to Amazon. These messages can vary in text, but the best course of action is to follow the link provided (by copying and pasting) in the text for the next steps.

**Scenario 1**: If the message in the gray box includes "mimecast.com": It means that our emails are being blocked by the server. In this case, you should contact your IT person or team to address the issue.

**Scenario 2**: If the message in the gray box mentions "blacklist at org/.com/.net," or resembles the screenshot provided, it indicates that your IT team has configured your email to use a third-party email reputation or blacklisting service. Here's what you need to know:
- All our emails are SPF and DKIM-signed, meaning they are cryptographically signed as coming from us and are not spam.
- The problem arises because we send mail from a cloud-based service. This means that the sender's IP serves multiple vendors, including Expensify. If one of those vendors is marked as spam, it can block all messages from that IP, even if they're from different vendors (including us).
- The better approach is for the server to flag spam via DKIM and SPF (rather than solely relying on the sender's IP address), as our messages are correctly signed and encrypted to prevent spoofing.

To resolve these issues, consider discussing them with your IT team, as they can help implement the necessary changes to ensure you receive our emails without interruption.
