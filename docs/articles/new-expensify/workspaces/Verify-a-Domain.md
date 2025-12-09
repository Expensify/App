---
title: Claim and Verify a Domain
description: Learn how to claim and verify a private domain in New Expensify to enable SAML login and unlock enhanced security features.
keywords: [New Expensify, claim domain, verify domain, private domain, domain settings, enhanced security, SAML, domain admin]
---

<div id="new-expensify" markdown="1">

If you have a private domain (e.g., yourcompany.com), you can claim and verify it in Expensify to manage employee permissions and enable additional security features.

# What you can do with a claimed domain

Once you've claimed a domain, you can:
- Configure SAML login (once verified)
- Monitor domain status and ownership

Once verified, you’ll also be able to:
- Enforce SAML login for domain members

# Step 1: Claim Your Domain

To claim a private domain, you must:
- Be logged in with an email address from that domain
- Have verified your contact method with a magic code

## Steps to claim your domain
1. From the left-hand menu, go to **Workspaces > Domains**.
2. Click the Enable button.
a. If you have already claimed one or more domains, click the **New** button in the upper-right hand corner > **New domain** to add a new domain.
4. Enter the name of your private domain (e.g., `yourcompany.com`) in the form.
5. Click **Continue**.


# Where to find domains in New Expensify

From the left-hand menu, select **Workspaces > Domains**.

If you haven't claimed a domain yet, you'll see a section labeled **Enhanced security** explaining the benefits of domain control. Once domains are claimed, this section is labeled **Domains**.

Each domain is listed in its own row, showing:
- Domain name
- Verification status (Verified, Not verified)
- Overflow menu with management options


## What happens next?

Depending on your email setup:

- **If you're not using an email from that domain**: You'll see an error. You can’t claim domains you don’t belong to.
- **If your email is from that domain but not verified**: You’ll be prompted to verify your login using a magic code.
- **If the domain is already claimed**: You’ll need to coordinate with an existing admin to verify your access to the domain.

After a successful claim, you’ll see a confirmation screen, and the domain will appear under **Workspaces > Domains** in the **Not verified** state.


# Step 2: Verify Your Domain

To unlock advanced security settings and enable SAML, the domain must be verified through DNS.

## Steps to verify your domain

1. Log in to your DNS service provider (e.g., Namecheap, GoDaddy, Amazon Route 53). If your domain is managed internally, contact your IT department.
2. Locate the DNS Records page (sometimes labeled as DNS Management or Zone File Editor).
3. Add a TXT record with the verification value provided in Expensify under **Workspaces > Domains > three-dot menu > Verify domain**.
4. Save your changes.

Once verified, you’ll see a confirmation message and your domain will be marked as **Verified**.
