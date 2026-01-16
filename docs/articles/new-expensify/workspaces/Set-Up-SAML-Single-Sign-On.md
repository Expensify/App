---
title: Set Up SAML Single Sign-On (SSO)
description: Learn how to enable and configure SAML SSO in New Expensify to secure login for domain members using your organization's identity provider.
keywords: [New Expensify, SAML SSO, domain security, single sign-on, identity provider, verified domain, enable SAML, Okta, Google Workspace, Microsoft Entra, ADFS]
---

Set up secure and streamlined login across your organization by enabling SAML Single Sign-On (SSO) in New Expensify. This allows Workspace members to authenticate using your identity provider (IdP), rather than creating separate credentials.

# Where to find SAML Single Sign-On (SSO) settings

Go to Domains > [Domain Name] > SAML to manage SAML Single Sign-On (SSO).

**Note:** Your domain must be verified before you can enable SAML. [Learn how to claim and verify a domain](https://help.expensify.com/articles/new-expensify/workspaces/Claim-and-Verify-a-Domain)

Once your domain is verified, you can configure SAML-based login for enhanced authentication.

1. Go to the **Domains** tab from the navigation tabs on the left (web) or hamburger menu (mobile).
2. Select your verified domain.
3. Scroll to the **SAML** section.
4. Toggle **Enable SAML login**.
5. Download Expensify’s Service Provider metadata XML file and upload it to your IdP.
6. Paste your IdP metadata URL or XML file into Expensify.
7. Toggle **Require SAML login** to enforce SSO-only access for domain members.

---

# Who can use SAML Single Sign-On (SSO)

- Only **Domain Admins** on verified domains can configure SAML SSO.
- SSO applies to all Workspace members with email addresses matching the verified domain.

---

# Identity provider-specific SAML setup

Follow your identity provider’s documentation to configure SAML with Expensify:

- [Amazon Web Services (AWS SSO)](https://docs.aws.amazon.com/singlesignon/latest/userguide/)
- [Google Workspace / SAML](https://support.google.com/a/answer/6087519)
- [Microsoft Entra ID (formerly Azure AD)](https://learn.microsoft.com/en-us/entra/identity/)
- [Okta](https://help.okta.com/)
- [OneLogin](https://support.onelogin.com/)
- [Oracle Identity Cloud Service](https://docs.oracle.com/)
- [SAASPASS](https://saaspass.com/)
- [Microsoft ADFS](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/)

If your provider isn’t listed, contact them directly for assistance with metadata and configuration.

---

# How SAML Single Sign-On (SSO) affects member login

- Members with email addresses that match the verified domain will be redirected to log in via your configured IdP.
- If a member uses a personal or alternate email (e.g., Gmail), they’ll need to update their email to match the domain.

[Learn how to update your email address](https://help.expensify.com/articles/new-expensify/settings/Update-Email-Address)

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

---

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

---

# FAQ

## Can I use SAML for multiple Workspaces?

Yes, as long as all members are part of the same verified domain, SAML access applies across all Workspaces they belong to.

## How can I confirm my SAML setup is correct?

Before enabling **Require SAML login**, make sure your SAML connection is working by testing both SP-initiated and IdP-initiated logins. You should also confirm that:

- The correct certificate and endpoints are in your Expensify metadata
- Members can log in successfully using the SAML flow

## Can I test a new SAML setup without locking users out?

Yes. Disable **Require SAML login** before making changes. This allows users to log in with email and password if SAML setup fails. Once you’ve confirmed that login works, you can re-enable enforcement.

## What happens if a member can’t log in after SAML is enabled?

First, confirm that the member’s email matches your verified domain and that their account exists in your Identity Provider (IdP) with the correct access permissions.

If they’re still unable to log in, follow the steps in [Troubleshoot SAML SSO login](LINK) to identify and resolve the issue.


