---
title: Claim and Verify a Domain
description: Learn how to claim and verify a private domain in New Expensify to enable SAML login and unlock enhanced security features.
internalScope: Audience is Domain Admins and IT admins. Covers claiming a domain and verifying domain ownership via DNS. Does not cover SAML configuration details, Domain Members management, Domain Groups, or login troubleshooting.
keywords: [New Expensify, claim domain, verify domain, private domain, domain settings, enhanced security, SAML, domain admin, domain verification, DNS TXT record, verify domain for SAML, how to verify domain, SAML setup]
---

If you have a private domain (e.g., yourcompany.com), you can claim and verify it in Expensify to manage employee permissions and enable additional security features.

# What you can do with a claimed and verified domain

Once you've claimed and verified a domain, you can:
- Configure SAML login
- Enforce SAML login for domain members

## How to claim a domain in Expensify

To claim a private domain, you must:
- Be logged in with an email address from that domain
- Have verified your contact method with a magic code

1. From the left-hand menu, go to **Workspaces > Domains**.
2. Click the **Enable** button.
   - If you have already claimed one or more domains, click the **New** button in the upper-right hand corner > **New domain** to add a new domain.
3. Enter the name of your private domain (e.g., `yourcompany.com`) in the form.
4. Click **Continue**.

## Where to find Domain settings

From the left-hand menu, select **Workspaces > Domains**.

If you haven't claimed a domain yet, you'll see a section labeled **Enhanced security** explaining the benefits of domain control. Once domains are claimed, the **Enhanced security** section is relabeled as **Domains**.

Each domain is listed in its own row, showing:
- Domain name
- Verification status (Verified, Not verified)
- Overflow menu with management options

## What happens after claiming a domain?

Depending on your email setup:

- **If you're not using an email from that domain**: You'll see an error. You can't claim domains that don't match your email address.
- **If your email is from that domain but not verified**: You’ll be prompted to verify your login using a magic code.
- **If the domain is already claimed**: You’ll need to coordinate with an existing admin to request that your role be updated to Domain Admin.

After the domain is successfully claimed, the domain will appear under **Workspaces > Domains** in the **Not verified** state.

## How to verify a domain

To unlock advanced security settings and enable SAML, the domain must be verified through a DNS record.

## Steps to verify your domain

**Note**: This process may be managed by your IT department or web consultant.
1. Log in to your DNS service provider (e.g., Namecheap, GoDaddy, Amazon Route 53).
2. Locate the DNS Records page (sometimes labeled as DNS Management or Zone File Editor).
3. Add a TXT record with the verification value provided in Expensify under **Workspaces > Domains > three-dot menu > Verify domain**.
4. Save your changes.

Once verified, you’ll see a confirmation message and your domain will be marked as **Verified**.

---

# FAQ

## Do I need to verify my domain to use SAML?

Yes. Verifying the domain is required to enable and enforce SAML login. Without verification, the SAML configuration option will remain locked.

## Can I verify multiple domains?

Yes, you can claim and verify multiple domains if your organization operates under more than one. Each must be verified through its own DNS record.

## Can I skip domain verification and still use Expensify?

Yes, you can use Expensify without claiming a domain. However, domain control is required to enable SAML login and enforce centralized security policies.

## I added the TXT record but verification is still failing — what now?

Make sure:
- The record is live and publicly visible (use a DNS checker tool to confirm)
- You’ve added only one TXT record, and it matches the value from Expensify exactly
- You saved the changes and waited for DNS to propagate

If you're still stuck, reach out to your IT team or DNS host for help.

