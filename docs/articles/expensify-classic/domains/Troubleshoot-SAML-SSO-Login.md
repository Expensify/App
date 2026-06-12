---
title: Troubleshoot SAML SSO login
description: Learn how to quickly diagnose and resolve issues with SAML SSO login in Expensify Classic, including lockouts, expired certificates, and identity provider errors.
keywords: [Expensify Classic, SAML SSO, SSO login failed, Require SAML login, domain locked out, expired certificate, identity provider, IdP, metadata, troubleshooting]
---

If you're having trouble logging in with SAML Single Sign-On (SSO) in Expensify Classic, this guide will help you identify the issue, understand what’s causing it, and get access restored quickly.

---

# Where to find SAML SSO settings in Expensify Classic

To check your domain's SAML SSO configuration, go to **Settings > Domains > [Domain Name] > SAML**.

From this page, Domain Admins can: 

- Enable SAML SSO login for the domain 
- View and update your Identity Provider (IdP) metadata
- Disable or enable **Require SAML login**

**Note:** SAML SSO settings are not available on mobile. 

# How to fix domain-wide SAML SSO login issues

## SAML login suddenly fails for all members

A domain-wide issue usually points to a problem with your Identity Provider (IdP). 

**Has your IdP certificate expired or rotated?**

 If yes, copy the updated metadata XML from your IdP and paste it into the **Identity Provider Metadata** field in your Expensify SAML settings.

**Have any IdP settings changed?**

Changes to entity IDs, SSO endpoints, or user attributes can break login.
 - If your certificate or SSO endpoints have changed, upload updated metadata from your IdP to Expensify.
 - If user attributes like NameID Format or email mappings have changed, confirm they match the values expected in your domain's SAML settings in Expensify.

**Is “Require SAML login” turned on?**  

 If enabled, no one — including Domain Admins — can log in without a working SAML configuration. If you're still signed in, go to your domain’s SAML settings and temporarily disable **Require SAML login** while troubleshooting. 

## Some members can’t log in, but others can

This is often caused by an email alias not recognized by your identity provider (IdP), or because the member hasn’t been added to the correct SAML rule or group. Confirm that the member’s email matches your verified domain in Expensify, and check your IdP to ensure they’re included in the appropriate SAML group or rule.

## All Domain Admins are locked out

If no Domain Admins can log in, you won’t be able to access SAML settings. Email **concierge@expensify.com** from an address that matches your verified domain for help.

---

# How to resolve common SAML SSO error messages 

## Signature validation failed  

This typically happens when the certificate has expired, is malformed, or doesn't match the one used by your IdP. To fix it, copy the updated metadata XML from your IdP and paste it into the **Identity Provider Metadata** field in your Expensify SAML settings.

---

## SAML Response not found. Only supported HTTP_POST Binding  

Your Identity Provider is not sending the `SAMLResponse` in the POST body as expected. To fix it, update your IdP configuration to use **HTTP POST binding** when sending the SAML Response.

---

## No user with that partnerUserID/partnerUserSecret  

This occurs when your IdP sends an email (NameID) that doesn’t match the one stored in Expensify for that member. To fix it, confirm that the NameID value sent by your IdP exactly matches the member’s email address in Expensify. If needed, update the member's email in your IdP or in Expensify to resolve the mismatch.

---

## Bad XML metadata

Your metadata file may contain formatting issues — often extra line breaks or copy/paste errors in the x.509 certificate.  
**How to fix it:** Use a certificate formatting tool (like [samltool.com](https://samltool.com)) to clean and validate your metadata before pasting it into Expensify.

**Note:** When copying a certificate, make sure it includes the full `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` block with no formatting errors.

---

## SAML login not available on your domain  

This appears when **Require SAML login** is enabled, but SAML isn’t fully configured. To fix it, follow the steps to [Configure Single Sign On (SSO)](https://help.expensify.com/articles/expensify-classic/domains/Managing-Single-Sign-On-(SSO)-in-Expensify) for your domain. 

---

# How to contact Expensify if you're locked out

If you can't sign in due to a SAML issue, email **concierge@expensify.com** from an address that matches your verified domain.

---

# FAQ

## What should I do before making changes to my domain's SAML SSO setup?

Before making changes to your Identity Provider setup — like rotating certificates or updating endpoints — we recommend **temporarily disabling Require SAML login** in Expensify.

This ensures Domain Admins can still sign in with email and password if the new configuration doesn’t work. Once you’ve uploaded the new metadata and confirmed login is working, you can safely re-enable Require SAML login.

## Can I make SAML login optional for some members?

No. SAML settings apply to the entire domain. If **Require SAML login** is enabled, **all members** must authenticate via SAML — there’s no way to allow some members to log in with email and password while others use SAML.

## Can I test a new SAML setup without locking members out?

Yes. You can disable **Require SAML login** while testing or updating your SAML settings. This allows members to log in with email/password if needed. Once you're confident the new metadata works, re-enable SAML enforcement.

## How can I confirm my SAML setup is correct?

Before enabling **Require SAML login**, make sure your SAML connection is working by testing both SP-initiated and IdP-initiated logins. You should also confirm that:

- The correct certificate and endpoints are in your Expensify metadata
- Your IdP sends the proper NameID (usually the member's email)
- Members can log in successfully using the SAML flow

For step-by-step setup and testing instructions, check out the [SAML setup guide](https://help.expensify.com/articles/expensify-classic/domains/Managing-Single-Sign-On-(SSO)-in-Expensify).



