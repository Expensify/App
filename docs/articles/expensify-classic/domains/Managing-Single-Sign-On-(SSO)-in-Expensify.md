---
title: Managing Single Sign-On (SSO) and User Authentication in Expensify
description: Learn how to set up and manage SAML-based Single Sign-On (SSO) for secure member login in Expensify Classic.
keywords: [Expensify Classic, SAML SSO, single sign-on, identity provider, domain security, authentication, user login]
---

Set up secure and streamlined login across your organization by enabling SAML Single Sign-On (SSO) in Expensify Classic. This allows Workspace members to authenticate using your identity provider (IdP), rather than creating separate credentials.

---

# Where to find SAML Single Sign-On (SSO) settings

Before setting up SSO, make sure your domain is verified.  
[Learn how to claim and verify your domain](https://help.expensify.com/articles/expensify-classic/domains/Claim-And-Verify-A-Domain#step-2-verify-domain-ownership)

Once your domain is verified:

1. Go to **Settings > Domains > [Domain Name] > SAML**.
2. From the **SAML** section:
   - Download Expensify’s **Service Provider metadata** to upload to your IdP.
   - Enter your **IdP metadata** or upload the file from your provider.
   - Toggle **SAML required for login** to enforce SSO-only login.

---

# Who can manage SAML Single Sign-On (SSO)

- Only **Domain Admins** can configure SAML for verified domains.
- SAML login applies to all Workspace members whose emails match the verified domain.

---

# How to set up SAML Single Sign-On (SSO) with your identity provider

Follow these links for configuration steps with your identity provider:

- [Amazon Web Services (AWS SSO)](https://static.global.sso.amazonaws.com/app-202a715cb67cddd9/instructions/index.htm)
- [Google Workspace / SAML (Gsuite)](https://support.google.com/a/answer/7371682)
- [Microsoft Entra ID (formerly Azure AD)](https://learn.microsoft.com/en-us/entra/identity/saas-apps/expensify-tutorial)
- [Okta](https://saml-doc.okta.com/SAML_Docs/How-to-Configure-SAML-2.0-for-Expensify.html)
- [OneLogin](https://onelogin.service-now.com/support?id=kb_article&sys_id=e44c9e52db187410fe39dde7489619ba)
- [Oracle Identity Cloud Service](https://docs.oracle.com/en/cloud/paas/identity-cloud/idcsc/expensify.html#Expensify)
- [SAASPASS](https://saaspass.com/saaspass/expensify-two-factor-authentication-2fa-single-sign-on-sso-saml.html)
- Microsoft ADFS – see instructions below

**Note:** If your provider isn't listed, contact them directly for guidance with metadata and setup.

---

# How SAML Single Sign-On (SSO) affects login behavior

- Members with email addresses matching your verified domain will be prompted to log in through your configured IdP.
- Members using a personal or secondary email (e.g., Gmail) must [update their email address](https://help.expensify.com/articles/expensify-classic/settings/Change-or-add-email-address) to match the verified domain for SSO access.

---

# Troubleshooting SAML Single Sign-On (SSO)

## If setup fails or login doesn't work:

- Use [samltool.com](https://samltool.com) to validate your IdP metadata and certificate.
- Confirm that your public certificate is in **PEM** format.
- Make sure the email domain in your IdP exactly matches your verified domain in Expensify.
- Confirm that your domain is verified in Expensify before enabling SAML.

## What is Expensify’s Entity ID?

- Standard setup: `https://expensify.com`
- Multi-domain setup: `https://expensify.com/yourdomain.com`

## Can I manage multiple domains with one Entity ID?

Yes, managing multiple domains with one Entity ID is supported. Contact Concierge or your Account Manager to enable this feature.

# Advanced configurations for SAML Single Sign-On (SSO)

## Okta SCIM API and SAML provisioning

Once SAML is enabled:

1. Go to `Domains > [Domain Name] > SAML`.
2. Toggle on both **Enable SAML login** and **Require SAML login**.
3. In Okta, add Expensify as an app and configure attribute mappings.
4. Request SCIM API access via **concierge@expensify.com**.
5. Add the SCIM token in your Okta provisioning settings.

Refer to Okta’s documentation for complete instructions.

## Microsoft ADFS configuration

1. Open the **ADFS Management Console** and create a new trust.
2. Upload Expensify’s metadata XML file.
3. Map **LDAP attributes** (email or UPN) to outgoing claims.
4. Add two claim rules:
   - Send LDAP Attributes as Claims
   - Transform Incoming Claim to Name ID
  
## Microsoft Entra ID certificate update process

To avoid setup errors during certificate renewal:

1. Create the new certificate in Microsoft Entra.
2. Remove the old certificate before activating the new one.
3. Replace the existing IdP metadata in Expensify.
4. Log in via SSO to confirm the new certificate works.

# FAQ

## Can I use SAML for multiple Workspaces?

Yes, as long as all members are part of the same verified domain, SAML access applies across all Workspaces they belong to.

## How can I confirm my SAML SSO setup is correct?

Before enabling **Require SAML login**, make sure your SAML connection is working by testing both SP-initiated and IdP-initiated logins. You should also confirm that:

- The correct certificate and endpoints are in your Expensify metadata
- Members can log in successfully using the SAML flow

## Can I test a new SAML SSO setup without locking users out?

Yes. Disable **Require SAML login** before making changes. This allows users to log in with email and password if SAML setup fails. Once you’ve confirmed that login works, you can re-enable enforcement.

## What happens if a member can’t log in after SAML SSO is enabled?

First, confirm that the member’s email matches your verified domain and that their account exists in your Identity Provider (IdP) with the correct access permissions.

If they’re still unable to log in, follow the steps in [Troubleshoot SAML SSO login](LINK) to identify and resolve the issue.

