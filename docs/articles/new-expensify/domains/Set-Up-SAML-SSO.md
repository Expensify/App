---
title: Set Up SAML Single Sign-On (SSO)
description: Learn how to enable and configure SAML SSO in New Expensify to secure login for domain members using your organization's identity provider.
keywords: [New Expensify, SAML SSO, domain security, single sign-on, identity provider, verified domain, enable SAML, Okta, Google Workspace, Microsoft Entra, ADFS]
---

Set up secure and streamlined login across your organization by enabling SAML Single Sign-On (SSO) in New Expensify. This allows Workspace members to authenticate using your identity provider (IdP), rather than creating separate credentials.

# Where to find SAML Single Sign-On (SSO) settings

Go to Domains > [Domain Name] > SAML to manage SAML Single Sign-On (SSO).

**Note:** Your domain must be verified before you can enable SAML. [Learn how to claim and verify a domain](https://help.expensify.com/articles/new-expensify/workspaces/Claim-and-Verify-a-Domain).

Once you are a Domain Admin on a verified domain, you can configure SAML SSO login: 

1. Go to **Workspaces > [domain name] > SAML**.
2. Toggle **SAML Login** to **Enabled**.

---

# Who can manage SAML Single Sign-On (SSO)

Only **Domain Admins** can configure SAML for verified domains. SAML login applies to all Domain members whose email addresses match the verified domain.

---

# How to set up SAML Single Sign-On (SSO) 

1. Go to **Workspaces > [domain name] > SAML**.
2. Toggle **SAML Login** to **Enabled**.
3. Download Expensify’s **Service Provider metadata** to upload to your IdP.
4. Paste your IdP metadata in the **Identity Provider MetaData** field.
5. Test logging in to confirm that SAML SSO is configured correctly (recommended).
6. Enable **Required for login** to ensure  members sign in via SSO only.
   
Select your Identity (SAML) Provider for detailed steps on configuring SAML Single Sign-On (SSO): 

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

# How SAML Single Sign-On (SSO) affects member login

- Members with email addresses matching your verified domain will be prompted to log in through your configured IdP.
- Members using a personal or secondary email (e.g., Gmail) must [update their email address](https://help.expensify.com/articles/new-expensify/settings/Update-Email-Address) to match the verified domain for SSO access.

---

# Troubleshooting SAML Single Sign-On (SSO)

## If setup fails or login doesn't work:

- Use [samltool.com](https://samltool.com) to validate your IdP metadata and certificate.
- Make sure the email domain in your IdP exactly matches your verified domain in Expensify.

## What is Expensify’s Entity ID?

- Standard setup: `https://expensify.com`
- Multi-domain setup: `https://expensify.com/yourdomain.com`

Managing multiple domains with one Entity ID is supported. Contact Concierge or your Account Manager to enable this feature.

# Advanced configurations for SAML Single Sign-On (SSO)

## Okta SCIM API and SAML provisioning

Once SAML is configured: 

1. In Okta, add Expensify as an app and configure attribute mappings.
2. Request SCIM API access via **concierge@expensify.com**.
3. Add the SCIM token in your Okta provisioning settings.

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

## Can I use SAML Single Sign-On (SSO) for multiple Workspaces?

Yes, as long as all members are part of the same verified domain, SAML access applies across all Workspaces they belong to.

## How can I confirm my SAML Single Sign-On (SSO) setup is working?

Before enabling **Require SAML login**, make sure your SAML connection is working by testing both SP-initiated and IdP-initiated logins. You should also confirm that:

- The correct certificate and endpoints are in your Expensify metadata
- Members can log in successfully using the SAML flow

## Can I test a new SAML Single Sign-On (SSO) setup without locking members out?

Yes. Disable **Require SAML login** before making changes. This allows members to log in with email and password if SAML setup fails. Once you’ve confirmed that login works, you can re-enable enforcement.

## What do I do if a member can’t log in after SAML Single Sign-On (SSO) is enabled?

First, confirm that the member’s email matches your verified domain and that their account exists in your Identity Provider (IdP) with the correct access permissions.

## Are custom NameID, ACS, or SLO URLs supported in SAML Single Sign-On (SSO)?

No, the NameID Format, Login URL (ACS URL), and Logout URL (SLO URL) are static and cannot be modified.
