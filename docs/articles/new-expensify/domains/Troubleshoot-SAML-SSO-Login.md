---
title: Troubleshoot SAML SSO login
description: Learn how to quickly diagnose and resolve issues with SAML SSO login in Expensify Classic, including lockouts, expired certificates, and identity provider errors.
keywords: [New Expensify, SAML SSO, SSO login failed, Require SAML login, domain locked out, expired certificate, identity provider, IdP, metadata, troubleshooting]
---

If you're having trouble logging in with SAML Single Sign-On (SSO) in New Expensify, this guide will help you identify the issue, understand what’s causing it, and get access restored quickly.

---

# Where to find SAML SSO settings in New Expensify

To check your SAML SSO configuration, go to Workspaces > [domain name] > SAML. 

From this page, you can:
- View your current metadata and certificate information
- Check if **Require SAML login** is enabled
- Re-upload or update your identity provider (IdP) metadata file
- Disable SAML enforcement (if you're still signed in)

**Note:** When copying a certificate from your IdP, ensure it includes the full `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` block and is correctly formatted to avoid upload errors.

---

# How to fix domain-wide SAML SSO login issues

## SAML login suddenly fails for all users

This usually points to a domain-wide issue. Check the following:

- **Has your IdP certificate expired or rotated?**  
  If yes, re-upload the new metadata file from your IdP.

- **Have any IdP settings changed?**  
  Changes to entity IDs, SSO endpoints, or user attributes can break login.

- **Is “Require SAML login” turned on?**  
  If enabled, no one can log in without a working SAML connection — not even Domain Admins.

## Some users can’t log in, but others can

This is often caused by:

- An email mismatch (e.g., alias not recognized by your IdP)
- A new user not yet added to the SAML rule group
- Inconsistent enforcement of SAML settings

**To fix it:**
- Confirm the user's email matches your verified domain in Expensify.
- Ask your IdP admin to ensure the user is included in the correct SAML group or rule.

## All Domain Admins are locked out

If no Domain Admins can log in, you won’t be able to access SAML settings. In this case contact Concierge for help. 

---

# How to resolve common SAML SSO error messages 

## Signature validation failed  
This typically happens when the certificate has expired expired, is malformed, or doesn't match the one used by your IdP.  
**How to fix it:** Re-upload a properly formatted metadata file from your IdP.

---

## SAML Response not found. Only supported HTTP_POST Binding  
Your Identity Provider is not sending the `SAMLResponse` in the POST body as expected.  
**How to fix it:** Update your IdP configuration to use **HTTP POST binding** when sending the SAML Response.

---

## No user with that partnerUserID/partnerUserSecret  
This occurs when your IdP sends an email (NameID) that doesn’t match the one stored in Expensify for that user.  
**How to fix it:** Contact Concierge to reset the user’s SAML login.

---

## Bad XML metadata  
Your metadata file may contain formatting issues — often extra line breaks or copy/paste errors in the x.509 certificate.  
**How to fix it:** Use a formatting tool to clean the x.509 certificate before re-uploading.

---

## SAML login not available on your domain  
This appears when **Require SAML login** is enabled, but SAML isn’t fully configured.  
**How to fix it:** Re-upload your IdP metadata or toggle SAML off and on again in the domain editor to refresh the connection.

---

# How to contact Expensify if you're locked out

If you can't sign in due to a SAML issue, email **concierge@expensify.com** from an address that matches your verified domain.

---

# FAQ

## What should I do before making changes to my domain's SAML SSO setup

Before making changes to your Identity Provider setup — like rotating certificates or updating endpoints — we recommend **temporarily disabling Require SAML login** in Expensify.

This ensures Domain Admins can still sign in with email and password if the new configuration doesn’t work. Once you’ve uploaded the new metadata and confirmed login is working, you can safely re-enable Require SAML login.

## Can I make SAML login optional for some users?

No. SAML settings apply to the entire domain. If **Require SAML login** is enabled, **all users** must authenticate via SAML — there’s no way to allow some users to log in with email and password while others use SAML.

## Can I test a new SAML setup without locking users out?

Yes. You can disable **Require SAML login** while testing or updating your SAML settings. This allows members to log in with email/password if needed. Once you're confident the new metadata works, re-enable SAML enforcement.

## How can I confirm my SAML setup is correct?

Before enabling **Require SAML login**, make sure your SAML connection is working by testing both SP-initiated and IdP-initiated logins. You should also confirm that:

- The correct certificate and endpoints are in your Expensify metadata
- Your IdP sends the proper NameID (usually the user's email)
- Members can log in successfully using the SAML flow

For step-by-step setup and testing instructions, check out the [SAML setup guide](ADD LINK).






