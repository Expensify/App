---
title: Troubleshoot SAML SSO login
description: Diagnose and resolve SAML SSO login issues in New Expensify, including domain-wide login failures, member-specific issues, expired certificates, and Identity Provider errors.
keywords: [New Expensify, SAML SSO, SSO login failed, Require SAML login, domain locked out, expired certificate, identity provider, IdP, metadata, troubleshooting, session expired, signed out while working, re-authentication]
internalScope: Audience is domain admins and IT admins. Covers troubleshooting SAML SSO login failures, common SAML errors, domain admin lockouts, and expected SAML re-authentication behavior. Does not cover initial SAML configuration or general login troubleshooting.
---

# Troubleshoot SAML SSO Login

If members are having trouble signing in with SAML Single Sign-On (SSO) in New Expensify, use the symptoms and error messages below to identify the cause and restore access.

---

## Who can troubleshoot SAML SSO login

Domain admins can review and update the domain's SAML SSO configuration on the web. This feature is not available on mobile.

---

## Where to find SAML SSO settings in New Expensify

1. In the navigation tabs on the left, select **Workspaces**.
2. Select **Domains > [domain name]**.
3. Select **SAML**.

From this page, domain admins can: 

- Enable SAML SSO login for the domain 
- View and update the Identity Provider (IdP) metadata
- Disable or enable **Require SAML login**

---

## How to troubleshoot SAML login failures for all members

If SAML login suddenly stops working for everyone on the domain, check the Identity Provider (IdP) configuration first.

**Check whether the IdP certificate expired or rotated.**

If the certificate changed, copy the updated metadata XML from your IdP and paste it into the **Identity Provider Metadata** field in Expensify.

**Check whether your IdP configuration changed.**

Changes to entity IDs, SSO endpoints, or member attributes can prevent SAML login.

* If the certificate or SSO endpoints changed, update the IdP metadata in Expensify.
* If attributes such as NameID Format or email mappings changed, confirm they match the values expected by your domain's SAML configuration.

**Check whether Require SAML login is enabled.**

When **Require SAML login** is enabled, everyone on the domain, including domain admins, must use the configured SAML login.

If you're still signed in as a domain admin, temporarily disable **Require SAML login** while troubleshooting the SAML configuration.

---

## How to troubleshoot SAML when only some members can't log in

If some members can sign in with SAML but others can't, check the affected members' email addresses and IdP access.

Confirm that:

* The member's email matches your verified domain in Expensify.
* The email or alias is recognized by your IdP.
* The member is included in the appropriate SAML group or rule in your IdP.

---

## What to do if all domain admins are locked out

If no domain admin can sign in, you won't be able to access the domain's SAML settings to change the configuration.

Email **[concierge@expensify.com](mailto:concierge@expensify.com)** from an address that matches your verified domain for assistance.

---

## How to fix the “Signature validation failed” SAML error

This error can occur when the IdP certificate has expired, is malformed, or doesn't match the certificate Expensify expects.

Copy the updated metadata XML from your IdP and paste it into the **Identity Provider Metadata** field in your Expensify SAML settings.

---

## How to fix the “SAML Response not found. Only supported HTTP_POST Binding” error

This error occurs when your IdP isn't sending the `SAMLResponse` in the POST body as expected.

Update your IdP configuration to use **HTTP POST binding** when sending the SAML Response.

---

## How to fix the “No user with that partnerUserID/partnerUserSecret” error

This error occurs when your IdP sends an email address in the NameID that doesn't match the email address stored in Expensify for that member.

Confirm that the NameID sent by your IdP exactly matches the member's email address in Expensify. If necessary, update the email address in your IdP or Expensify so they match.

---

## How to fix a bad XML metadata error

This error can occur when the metadata contains formatting problems, including errors introduced when copying the X.509 certificate.

Check that the certificate contains the complete `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` block and that the metadata doesn't contain formatting errors.

You can also use a certificate formatting tool (like [samltool.com](https://samltool.com)) to clean and validate your metadata before pasting it into Expensify.

---

## How to fix “SAML login not available on your domain”

This error appears when **Require SAML login** is enabled but SAML isn't fully configured for the domain.

Complete the domain's SAML configuration before requiring members to use SAML login.

[Learn how to configure Single Sign-On (SSO)](/articles/new-expensify/domains/Set-Up-SAML-SSO).

---

## Why SAML SSO sign-in restarts while you're working

When **Require SAML login** is enabled, your SAML session may periodically expire. When this happens, New Expensify sends you through your Identity Provider again to re-authenticate.

This is expected SAML behavior rather than a login failure.

During re-authentication:

* The sign-in page may appear briefly.
* Your IdP may sign you back in without requiring additional input.
* You're returned to the page you were viewing, with your filters still applied.

If you manually sign out and sign back in, you'll start on the **Home** tab instead of returning to the page you were viewing.

If you're offline when re-authentication is required, the process waits until your connection returns. Once you're back online, authentication resumes and you're returned to the same page.

---

## What happens after you resolve a SAML SSO login issue

Once the SAML configuration and IdP settings match, affected members should be able to sign in through the configured Identity Provider again.

If **Require SAML login** was temporarily disabled while troubleshooting, confirm that SAML login is working before enabling it again.

---

# FAQ

## What should I do before making changes to my domain's SAML SSO setup?

Before making changes to your Identity Provider setup — like rotating certificates or updating endpoints — we recommend temporarily disabling **Require SAML login** in Expensify.

This ensures domain admins can still sign in with email and security code if the new configuration doesn’t work. Once you’ve uploaded the new metadata and confirmed login is working, you can safely re-enable **Require SAML login**.

## Can I make SAML login optional for some members?

No. SAML settings apply to the entire domain. If **Require SAML login** is enabled, **all members** must authenticate via SAML — there’s no way to allow some members to log in with email and security code while others use SAML.

## Can I test a new SAML setup without locking members out?

Yes. You can disable **Require SAML login** while testing or updating your SAML settings. This allows members to log in with email and security code if needed. Once you're confident the new metadata works, re-enable SAML enforcement.

## Do I lose my place when SAML SSO signs me back in?

No. You return to the page you were viewing, with your filters still applied. Only a manual sign out sends you back to the **Home** tab the next time you sign in.

## How can I confirm my SAML setup is correct?

Before enabling **Require SAML login**, make sure your SAML connection is working by testing both SP-initiated and IdP-initiated logins. You should also confirm that:

- The correct certificate and endpoints are in your Expensify metadata
- Your IdP sends the proper NameID (usually the member's email)
- Members can log in successfully using the SAML flow
