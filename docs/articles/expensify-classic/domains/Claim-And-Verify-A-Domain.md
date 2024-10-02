---
title: Claim and verify a domain
description: Grant specific employee permissions by claiming a private domain and verifying it in Expensify
---
<div id="expensify-classic" markdown="1">

If you have a private domain (like yourcompany.com), you can add the domain to your Expensify account. Claiming a domain allows you to grant specific permissions to accounts that include the domain in their email address (for example, if your domain is yourcompany.com, anyone who signs up under this domain—like yourname@yourcompany.com—will have these domain rules applied to their account). 

Claiming a domain also allows you to: 
* Import and reconcile company credit cards and Expensify Cards
* Add company credit card and Expensify Card rules and restrictions

Once you verify your domain, you’ll be able to:
* Assign delegates for employees who are on vacation
* Delete employee Expensify accounts
* Enable SAML / SSO settings for secure log in

{% include info.html %}
You can claim and verify private domains only. Public domains (like gmail.com) cannot be used to create a domain.
{% include end-info.html %}

# Step 1: Claim domain

<ol type="a">
   <li>Hover over Settings, then click <b>Domains</b>.</li>
   <li>Click <b>New Domain</b>.</li>  
   <li>Enter your domain name (e.g., yourcompany.com).</li>
   <li>Click <b>Submit</b>.</li>
</ol>

# Step 2: Verify domain ownership

{% include info.html %}
To complete this step, you must have a Control workspace, and you’ll need access to your domain provider account (GoDaddy, Wix, GSuite, etc.). If you don’t verify the domain, you will still have access to the domain to add and manage credit card expenses and domain admins, but you will not be able to invite members, add groups, use domain reporting tools, set delegates for employees on vacation, or enable SAML SSO. For more guidance on how to complete this process for a specific provider, check the provider’s website.
{% include end-info.html %}

<ol type="a">
   <li>Log in to your DNS service provider (which may be the website you purchased the domain from or that currently hosts the domain, like NameCheap, GoDaddy, DNSMadeEasy, or Amazon Route53. You may need to contact your company’s IT department if your domain is managed internally).</li>
   <li>Find the page for DNS records, which might be labeled as DNS Management or Zone File Editor.</li>  
   <li>Add a new TXT record with the value assigned to you in the domain verification settings.</li>
   <li>Save your changes.</li>
   <li>In Expensify, click the Domain Members tab and click <b>Verify</b>.</li>
</ol>

After successful verification, an email will be sent to all members of the Expensify domain to inform them that their accounts will be under domain control (i.e. the rules set for the domain will affect their account). 

# Add another domain

To add an additional domain, you’ll have to first add your email address that is connected with your domain as your [primary or secondary email] (https://help.expensify.com/articles/expensify-classic/settings/account-settings/Change-or-add-email-address) (for example, if your domain is yourcompany.com, then you want to add and verify your email address @yourcompany.com as your primary or secondary email address). Then you can complete the steps above to add the domain. 

</div>
