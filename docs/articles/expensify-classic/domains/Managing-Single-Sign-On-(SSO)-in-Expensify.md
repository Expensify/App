---
title: Managing Single Sign-On (SSO) and User Authentication in Expensify
description: Learn how to effectively manage Single Sign-On (SSO) and user authentication in Expensify alongside your preferred SSO provider. 
keywords: [Expensify Classic, SAML, single sign-on, SSO]
---


Expensify supports Single Sign-On (SSO) through the SAML protocol, allowing you to optimize user authentication and improve security across your organization. Whether you're an IT admin configuring your domain or a team lead ensuring secure user access, this guide walks you through setting up and managing SAML SSO for your Expensify account

---

# Accessing SAML Settings
⚠️ **Pre-requisite:** Ensure your [domain is verified](https://help.expensify.com/articles/expensify-classic/domains/Claim-And-Verify-A-Domain#step-2-verify-domain-ownership).

1. Navigate to: **Settings > Domains > [Domain Name] > SAML**.  
2. **From the Domains page:**  
   - Download Expensify's **Service Provider Metadata** to provide to your Identity Provider.  
   - Enter the **Identity Provider Metadata** from your SSO provider. (Contact your provider if unsure how to obtain this).  
   - Enable the **"SAML required for login"** option, ensuring users sign in via SSO only.

---

# Provider-Specific Setup Instructions

Click on your Identity (SAML) Provider for detailed steps:  
- [Amazon Web Services (AWS SSO)](https://static.global.sso.amazonaws.com/app-202a715cb67cddd9/instructions/index.htm)  
- [Google SAML (Gsuite)](https://support.google.com/a/answer/7371682)  
- [Microsoft Entra ID (formerly Azure Active Directory)](https://learn.microsoft.com/en-us/entra/identity/saas-apps/expensify-tutorial)  
- [Okta](https://saml-doc.okta.com/SAML_Docs/How-to-Configure-SAML-2.0-for-Expensify.html)  
- [OneLogin](https://onelogin.service-now.com/support?id=kb_article&sys_id=e44c9e52db187410fe39dde7489619ba)  
- [Oracle Identity Cloud Service](https://docs.oracle.com/en/cloud/paas/identity-cloud/idcsc/expensify.html#Expensify)  
- [SAASPASS](https://saaspass.com/saaspass/expensify-two-factor-authentication-2fa-single-sign-on-sso-saml.html)  
- Microsoft ADFS (instructions below).  

**Note:** If your provider isn't listed, contact them directly for guidance.

---

# Common Troubleshooting Scenarios

## User Login with SSO
- Employees using their **company email** or a **secondary linked email** (e.g., Gmail) will be prompted to log in through SSO.  
- Secondary login setup guide: [Change or Add Email Address](https://help.expensify.com/articles/expensify-classic/settings/Change-or-add-email-address).

## Error During SSO Setup?
- Use [samltool.com](https://samltool.com) to validate your configuration data.  
- Contact your Account Manager or Concierge for further help.  

## What is Expensify's Entity ID?
- Default: `https://expensify.com`  
- For Multi-Domain setups: `https://expensify.com/mydomainname.com`.

## Managing Multiple Domains with One Entity ID 
Yes, it's possible. Contact Concierge or your Account Manager to enable this feature.  

## Updating Microsoft Entra ID SSO Certificate
Steps to avoid configuration errors during certificate renewal:  
1. **Create** a new certificate in Microsoft Entra.  
2. **Remove** the old certificate before activating the new one.  
3. Replace the **IDP** in Expensify with the new one.  
4. Log in via SSO.  

If issues persist, contact Concierge Support for assistance.  

---

# Advanced Configurations

## Okta SCIM API for User Deactivation
Ensure your domain is verified and the SAML setup is complete. Then, do the following:
1. Go to **Settings > Domains > [Domain Name] > SAML**.  
2. Enable SAML Login and toggle **Required for login**.  
3. In Okta, add Expensify as an application, and configure user profile mappings.  
4. Request **Okta SCIM API** activation via concierge@expensify.com.  
5. Integrate the **SCIM token** with Okta API provisioning.  

Refer to the full setup in Okta's documentation for attribute mapping and provisioning options.

## Microsoft ADFS SAML Authentication
1. Open **ADFS Management Console** and add a new trust.  
2. Import Expensify's metadata XML from the SAML page.  
3. Configure **LDAP Attributes** for email or UPN.  
4. Add two claim rules:  
   - Send LDAP Attributes as Claims.  
   - Transform Incoming Claim (Name ID). 

