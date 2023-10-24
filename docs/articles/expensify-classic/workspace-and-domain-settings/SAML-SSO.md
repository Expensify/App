---
title: Managing Single Sign-On (SSO) and User Authentication in Expensify
description: Learn how to effectively manage Single Sign-On (SSO) and user authentication in Expensify alongside your preferred SSO provider. Our comprehensive guide covers SSO setup, domain verification, and specific instructions for popular providers like AWS, Okta, and Microsoft Azure. Streamline user access and enhance security with Expensify's SAML-based SSO integration.
---
# Overview
This article provides a comprehensive guide on managing Single Sign-On (SSO) and user authentication in Expensify alongside your preferred SSO provider. Expensify uses SAML to enable and manage SSO between Expensify and your SSO provider. 

# How to Use SSO in Expensify
Before setting up Single Sign-On with Expensify you will need to make sure your domain has been verified. Once the domain is verified, you can access the SSO settings by navigating to Settings > Domains > [Domain Name] > SAML. 
On this page, you can: 
- Get Expensify's Service Provider MetaData. You will need to give this to your identity provider. 
- Enter your Identity Provider MetaData. Please contact your SAML SSO provider if you are unsure how to get this. 
- Choose whether you want to make SAML SSO required for login. If you choose this option, members will only be able to log in to Expensify via SAML SSO.
Instructions for setting up Expensify for specific SSO providers can be found below. If you do not see your provider listed below, please contact them and request instructions.
- [Amazon Web Services (AWS SSO)](https://static.global.sso.amazonaws.com/app-202a715cb67cddd9/instructions/index.htm)
- [Bitium](https://support.bitium.com/administration/saml-expensify/)
- [Google SAML](https://support.google.com/a/answer/7371682) (for GSuite, not Google SSO)
- [Microsoft Azure Active Directory](https://azure.microsoft.com/en-us/documentation/articles/active-directory-saas-expensify-tutorial/)
- [Okta](https://saml-doc.okta.com/SAML_Docs/How-to-Configure-SAML-2.0-for-Expensify.html)
- [OneLogin](https://onelogin.service-now.com/support?id=kb_article&sys_id=e44c9e52db187410fe39dde7489619ba)
- [Oracle Identity Cloud Service](https://docs.oracle.com/en/cloud/paas/identity-cloud/idcsc/expensify.html#Expensify)
- [SAASPASS](https://saaspass.com/saaspass/expensify-two-factor-authentication-2fa-single-sign-on-sso-saml.html)
- Microsoft Active Directory Federation Services (see instructions in the FAQ section below)

When SSO is enabled, employees will be prompted to sign in through Single Sign-On when using their company email (private domain email) and also a public email (e.g. gmail.com) linked as a secondary login.

## How can I update the Microsoft Azure SSO Certificate?
Expensify's SAML configuration doesn't support multiple active certificates. This means that if you create the new certification ahead of time without first removing the old one, the respective IdP will include two unique x509 certificates instead of one and the connection will break. Should you need to access Expensify, switching back to the old certificate will continue to allow access while that certificate is still valid.

To transfer from one Microsoft Azure certificate to another, please follow the below steps:
1. In Azure Directory , create your new certificate.
2. In Azure Director, remove the old, expiring certificate.
3. In Azure Directory, activate the remaining certificate, and get a new IdP for Expensify from it.
4. In Expensify, replace the previous IdP with the new IdP.
5. Log in via SSO. If login continues to fails, write into Concierge for assistance.

## How can I enable deactivating users with the Okta SSO integration?
Companies using Okta can deactivate users in Expensify using the Okta SCIM API. This means that when a user is deactivated in Okta their access to Expensify will expire and they will be logged out of both the web and mobile apps. Deactivating a user through Okta will not close their account in Expensify, if you are offboarding this employee, you will still want to close the account. You will need have a verified domain and SAML fully setup before completing setting up the deactivation feature.

To enable deactivating users in Okta, follow these steps:
1. In Expensify, head to *Settings > Domains > _[Domain Name]_ > SAML*
2. Ensure that the toggle is set to Enabled for *SAML Login* and *Required for login*
3. In Okta, go to *Admin > Applications > Add Application*
4. Search for Expensify and click on Add.
5. On the next screen, enter your company domain (e.g. yourcompany.com).
6. In the tab Sign-On Options, click *Next* (leaving default settings).
7. In the tab Assign to People, click *Next* and then click Done.
8. Next, in Okta, go to *Admin > Applications > Expensify > Sign On > View Setup Instructions* and follow the steps listed.
9. Then, go to *Directory > Profile Editor > Okta user > Profile*
10. Click the information bubble to the right of the *First name* and *Last name* attributes
11. Uncheck *Yes* under *Attribute required* field and press *Save Attribute*.
12. Email concierge@expensify.com providing your domain and request that Okta SCIM be enabled. You will receive a response when this step has been completed.
13. In Expensify, go to *Domains > _[Domain Name]_ > SAML > Show Token* and copy the Okta SCIM Token you received.
14. In Okta, go to *Admin > Applications > Expensify > Provisioning > API Integration >  Configure API Integration*
15. Select Enable API Integration and paste the Okta SCIM Token in API Token field and then click Save.
15. Go to To App, click Edit Provisioning Users, select Enable Deactivate Users and then Save. (You may also need to set up the Expensify Attribute Mappings if you have not previously in steps 9-11).

Successful activation of this function will be indicated by the green Push User Deactivation icon being enabled at the top of the app page.

## How can I set up SAML authentication with Microsoft ADFS?
Before getting started, you will need to have a verified domain and Control plan in order to set up SSO with Microsoft ADFS.

To enable SSO with Microsoft ADFS follow these steps:
1. Open the ADFS management console, and click the *Add Relying Party Trust* link on the right.
2. Check the option to *Import data about the relying party from a file*, then click the *Browse* button. You will input the XML file of Expensify’s metadata which can be found on the Expensify SAML setup page.
3. The metadata file will provide the critical information that ADFS needs to set up the trust. In ADFS, give it a name, and click Next.
4. Select the option to permit all users, then click Next.
5. The next step will give you an overview of what is being configured. Click Next.
6. The new trust is now created. Highlight the trust, then click *Edit claim rules* on the right.
7. Click *Add a Rule*.
8. The default option should be *Send LDAP Attributes as Claims*. Click Next. 
9. Depending upon how your Active Directory is set up, you may or may not have a useful email address associated with each user, or you may have a policy to use the UPN as the user attribute for authentication. If so, using the UPN user attribute may be appropriate for you. If not, you can use the emailaddress attribute.
10. Give the rule a name like *Get email address from AD*. Choose Active Directory as the attribute store from the dropdown list. Choose your source user attribute to pass to Expensify that has users’ email address info in it, usually either *E-Mail-Address* or *User-Principal-Name*. Select the outgoing claim type as “E-Mail Address”. Click OK. 
11. Add another rule; this time, we want to *Transform an Incoming Claim*. Click Next. 
12. Name the rule *Send email address*. The Incoming claim type should be *E-Mail Address*. The outgoing claim type should be *Name ID*, and the outgoing name ID format should be *Email*. Click OK.
13. You should now have two claim rules.

Assuming you’ve also set up Expensify SAML configuration with your metadata, SAML logins on Expensify.com should now work. For reference, ADFS’ default metadata path is: https://yourservicename.yourdomainname.com/FederationMetadata/2007-06/FederationMetadata.xml.

# FAQ
## What should I do if I’m getting an error when trying to set up SSO? 
You can double check your configuration data for errors using samltool.com. If you’re still having issues, you can reach out to your Account Manager or contact Concierge for assistance.

## What is the EntityID for Expensify? 
The entityID for Expensify is https://expensify.com. Remember not to copy and paste any extra slashes or spaces. If you've enabled the Multi-Domain support (see below) then your entityID will be https://expensify.com/mydomainname.com.

## Can you have multiple domains with only one entityID?
Yes. Please send a message to Concierge or your account manager and we will enable the ability to use the same entityID with multiple domains.

