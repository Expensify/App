---
title: Set Up SAML Single Sign-On (SSO)
description: Learn how to enable and configure SAML SSO in New Expensify to secure login for domain members using your organization's identity provider.
keywords: [New Expensify, SAML SSO, domain security, single sign-on, identity provider, verified domain, enable SAML]
---

<div id="new-expensify" markdown="1">

Expensify supports Single Sign-On (SSO) through the SAML protocol, allowing you to secure user authentication across your organization. This guide walks you through setting up and managing SAML SSO for your Expensify account.


# Set Up SAML Single Sign-On

⚠️ **Note:** Your domain must be verified before you can enable SAML. [Learn how to claim and verify a domain](https://help.expensify.com/articles/new-expensify/workspaces/Claim-and-Verify-a-Domain)

Once your domain is verified, you can configure SAML-based login for enhanced authentication.

1. Select your domain from **Workspaces > Domains**.
2. Open the **SAML** section.
3. Toggle **Enable SAML login**.
4. Download Expensify’s Service Provider Metadata to provide to your Identity Provider.
5. Enter the Identity Provider Metadata from your SSO provider. (Contact your provider if unsure how to obtain this).
6. Toggle on **Require SAML login**, ensuring users sign in via SSO only.


# Identity Provider-Specific SAML Setup

You can find provider-specific instructions here:

- [Amazon Web Services (AWS SSO)](https://docs.aws.amazon.com/singlesignon/latest/userguide/)
- [Google Workspace / SAML](https://support.google.com/a/answer/6087519)
- [Microsoft Entra ID (formerly Azure AD)](https://learn.microsoft.com/en-us/entra/identity/)
- [Okta](https://help.okta.com/)
- [OneLogin](https://support.onelogin.com/)
- [Oracle Identity Cloud Service](https://docs.oracle.com/)
- [SAASPASS](https://saaspass.com/)
- [Microsoft ADFS](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/)

If your provider isn’t listed, contact them directly for metadata and configuration help.


# Troubleshooting and Tips

## User login behavior
- Members with emails matching the verified domain will be prompted to log in via your IdP.
- If a member has a secondary email (e.g., Gmail), they may need to update their email to match the domain.

[How to add or change your email address](https://help.expensify.com/articles/new-expensify/settings/Update-Email-Address)

## Error during setup?
- Use [samltool.com](https://samltool.com) to validate your SAML fields.
- Confirm certificate formatting is correct (PEM format).
- Double-check that your domain is **verified** and matches the email domain used by your members.

## What is Expensify’s Entity ID?
- Default: `https://expensify.com`
- For custom multi-domain setups: `https://expensify.com/yourdomain.com`

## Managing Multiple Domains with One Entity ID
It is possible to manage multiple domains with one entity ID. Contact Concierge or your Account Manager to enable this feature.




# Advanced Configurations

## Okta SCIM API for User Deactivation

Ensure your domain is verified and the SAML setup is complete. Then, do the following:
1. Go to **Workspaces > Domains > [Domain Name] > SAML**.
2. Enable SAML Login and toggle on **Required for login**.
3. In Okta, add Expensify as an application, and configure user profile mappings.
4. Request Okta SCIM API activation via concierge@expensify.com.
5. Integrate the SCIM token with Okta API provisioning.

Refer to the full setup in Okta’s documentation for attribute mapping and provisioning options.


## Microsoft ADFS SAML Authentication
1. Open **ADFS Management Console** and add a new trust.
2. Import Expensify’s metadata XML from the SAML page.
3. Configure **LDAP Attributes** for email or UPN.
4. Add two claim rules:
   - Send LDAP Attributes as Claims.
   - Transform Incoming Claim (Name ID).


---

Still stuck? Reach out to Concierge from the bottom-left menu in New Expensify.

</div>
