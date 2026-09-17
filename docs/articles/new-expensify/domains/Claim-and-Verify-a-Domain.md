---
title: Claim and Verify a Domain
description: Learn how to claim and verify a private domain in New Expensify to enable SAML login and unlock enhanced security features.
internalScope: Audience is Domain Admins and IT admins. Covers claiming a domain, requesting admin access to a domain someone else already set up, and verifying domain ownership via DNS. Does not cover SAML configuration details, Domain Members management, Domain Groups, or login troubleshooting.
keywords: [New Expensify, claim domain, verify domain, private domain, domain settings, enhanced security, SAML, domain admin, domain verification, DNS TXT record, verify domain for SAML, how to verify domain, SAML setup, domain already set up, domain exists, ask for admin access, request admin access, domain already exists in your account]
---

If you have a private domain (e.g., yourcompany.com), you can claim and verify it in Expensify to manage employee permissions and enable additional security features.

# What you can do with a claimed and verified domain

Once you've claimed and verified a domain, you can:
- Configure SAML login
- Enforce SAML login for domain members

## How to claim a domain in Expensify

To claim a private domain, you must:
- Be logged in with an email address from that domain
- Have verified your contact method with a security code

1. From the left-hand menu, select **Workspaces**, then select the **Domains** tab.
2. Click **New domain**.
   - If you have already claimed one or more domains, click **New** in the upper right to add a new domain.
3. Enter the name of your private domain (e.g., `yourcompany.com`) in the form.
4. Click **Continue**.

## Where to find Domain settings

From the left-hand menu, select **Workspaces**, then select the **Domains** tab.

If you haven't claimed a domain yet, you'll see an empty state titled **Enhance your security with domains** explaining the benefits of domain control. Once you claim a domain, it's listed on the **Domains** tab.

Each domain is listed in its own row, showing:
- Domain name
- Verification status (Verified, Not verified)
- The three dots **(⋮)** with management options

## What happens after claiming a domain?

Depending on your email setup:

- **If you're not using an email from that domain**: You'll see an error. You can't claim domains that don't match your email address.
- **If your email is from that domain but not verified**: You’ll be prompted to verify your login using a security code.
- **If someone else already set the domain up**: You’ll land on the **Domain exists** page, where you can ask that domain’s admins for admin access.
- **If the domain is already in your account**: You’ll see the error **This domain already exists in your account.** under the **Domain name** field. Go back to the **Domains** tab and select the domain there instead.

After the domain is successfully claimed, the domain will appear on the **Domains** tab in the **Not verified** state.

## How to request admin access to a domain someone else set up

A private domain can only be set up once. If another Expensify account already set up your domain, you can ask that domain’s admins to make you a Domain Admin.

1. From the left-hand menu, select **Workspaces**, then select the **Domains** tab.
2. Click **New domain**.
   - If you have already claimed one or more domains, click **New** in the upper right to add a new domain.
3. Enter the name of the private domain (e.g., `yourcompany.com`) in the form.
4. Click **Continue**.
5. On the **Domain exists** page, click **Ask for admin access**.

To leave without sending a request, click **Never mind** instead. Both buttons return you to the **Domains** tab.

<!-- SCREENSHOT:
Suggestion: The Domain exists page showing the heading "Domain already set up. Request access?" with the Ask for admin access and Never mind buttons.
Location: After step 5 in "How to request admin access to a domain someone else set up".
Purpose: Confirms members have hit the expected page rather than an error, so they don't retry adding the domain or contact Support believing the add failed.
-->

## What happens after you ask for admin access

- Your request goes to the existing Domain Admins for that domain. An admin has to add you before you can manage it.
- The domain does **not** appear on your **Domains** tab while the request is pending, because you don’t have access to it yet.
- If you start the flow again for the same domain before an admin responds, the **Domain exists** page shows a disabled **Request sent** button so you don’t send a duplicate request.

[Learn how to add and manage Domain Admins](/articles/new-expensify/domains/Domain-Admins) to see what you'll be able to do once an admin adds you.

## How to verify a domain

To unlock advanced security settings and enable SAML, the domain must be verified through a DNS record.

## Steps to verify your domain

**Note**: This process may be managed by your IT department or web consultant.
1. Log in to your DNS service provider (e.g., Namecheap, GoDaddy, Amazon Route 53).
2. Locate the DNS Records page (sometimes labeled as DNS Management or Zone File Editor).
3. Add a TXT record with the verification value provided in Expensify. To find it, go to the **Domains** tab, select the three dots **(⋮)** next to your domain, then select **Verify domain**.
4. Save your changes.

Once verified, you’ll see a confirmation message and your domain will be marked as **Verified**.

---

# FAQ

## Do I need to verify my domain to use SAML?

Yes. Verifying the domain is required to enable and enforce SAML login. Without verification, the SAML configuration option will remain locked.

## Why does Expensify say the domain is already set up?

Each private domain can only be set up once, and someone at your company got there first. Click **Ask for admin access** on the **Domain exists** page to request that a Domain Admin add you.

## Why does the domain I requested access to not show on my Domains tab?

Requesting access doesn't give you access. The domain only appears on your **Domains** tab after an existing Domain Admin adds you as a Domain Admin.

## Why does the button say Request sent?

You already asked for admin access to that domain and no admin has responded yet. The button is disabled so you don't send a duplicate request.

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

