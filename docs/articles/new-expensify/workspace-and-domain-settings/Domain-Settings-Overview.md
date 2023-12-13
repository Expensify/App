---
title: Domains
description: Want to gain greater control over your company settings in Expensify? Read on to find out more about our Domains feature and how it can help you save time and effort when managing your company expenses. 
---

# Overview
Domains is a feature in Expensify that allows admins to have more nuanced control over a specific Expensify activity, as well as providing a bird’s eye view of company card expenditure. Think of it as your command center for things like managing user account access, enforcing stricter Workspace rules for certain groups, or issuing cards and reconciling statements.
There are several settings within Domains that you can configure so that you have more control and visibility into your organization’s settings. Those features are:
- Company Cards
- Domain Admins
- Domain Members
  - Two-Factor Authentication
- Domain Groups
  - Domain Group Settings
- Reporting Tools
- SAML

There are two ways to use Domains – as an unverified domain or a verified domain. An unverified domain allows you to import Company Cards and manage them, whereas a verified domain allows you to do that in addition to:
1. Receive vendor bills in Expensify
2. Fine-tune user restrictions using domain Groups
3. Configure SAML SSO for easier login to Expensify
4. Set vacation delegates for your domain members
5. Use consolidated domain billing

# How to claim a domain
To use the domains feature with an unverified domain, you’ll need to claim the domain first. 
To claim a domain, you need to be a Workspace Admin with a company email address. This allows you to manage company bills, company cards, and reconciliation. Claiming requires an email matching your company's domain.
1. Create an Expensify account
2. Set up an expense Workspace
3. Go to **Settings > _Domains_**. 
Whichever member runs through those steps will automatically be made a Domain Admin. 


# How to verify a domain
To use the domains feature with a verified domain, you’ll want to go through the steps of verifying it. 

To verify domain ownership, follow these steps:
1. Log in to your DNS service provider, which could be your Domain Name Registrar like NameCheap or GoDaddy, a dedicated DNS service provider like DNSMadeEasy or Amazon Route53, or managed internally by your company's IT department.
2. Find the page for editing DNS records for expensify.com. This might be labeled as DNS Management or Zone File Editor.
3. Add a new TXT record and set the value as: **532F6180D8**
4. Save your changes
5. Click the Verify button to confirm domain ownership

After successful verification, you can remove the TXT DNS record. Please note that an email will be sent to all Expensify users on the domain to inform them that their accounts will be under Domain Control after verification.

**Tips:**
Not sure how to do this? Check the below guides from some of the most popular hosts on the web:
[123-reg.co.uk](https://www.123-reg.co.uk/)
[One.com](https://www.one.com/en/)
[Wix.com](https://www.wix.com/)
Google/GSuite
[Godaddy](https://www.godaddy.com/)
When creating the TXT record, input only the code and no other values or information.
You can always confirm if you added the TXT code correctly here: https://viewdns.info/dnsrecord/?domain=[enterdomainhere]

# Domain settings

## Domain Admins
Domain Admins have full authority over domain settings. They can modify member group names and rules, link or modify Company Cards, and add or remove domain members and other admins.

### Adding a Domain Admin
1. Head to **Settings > Domains > [Domain Name] > Domain Admins**
2. In the "Email or Phone" field, type in the email address of the person you want to make a Domain Admin (this can be any email not specifically tied to the domain)
3. Click "Add Admin"

### Removing a Domain Admin:
1. If you're already a Domain Admin, go to **Settings > Domains > [Domain Name] > Domain Admins**
2. Locate the list of Domain Admins and find the one you want to remove
3. Next to the Domain Admin's name, click the red trash can icon. This will remove that person from the Domain Admin role

## Domain Members
A domain member is a user associated with a specific domain (usually a company or another group) in Expensify and typically managed by a Domain Admin. This is also where you can enable Two-Factor authentication for your domain.

### Adding users to the domain
When a Domain Admin adds a user to the domain, that will create a new Expensify account for that user, and they'll receive invitations to set up their account. Users can also join a verified domain by creating their own account, as long as they have an email address associated with that domain (e.g. yourname@yourcompany.com). Once they have verified the account, all Domain Admins will be notified, and the employee will be added to the Default Group.
**Important Note:** If someone who isn't a Domain Admin invites a user to a Workspace before they're invited to the domain, their account will be created, but in a closed state. A closed state means that the account cannot be used until it has been validated. Once the Domain Admin has invited the user, the user will receive a magic link to verify their account, sign in, and open the account completely.

### How to add users
1. In your web account, go to **Settings > Domains > [Domain Name] > Domain Admins**
2. In the email field, enter the user you want to invite. This will create their Expensify account and send them an invitation

### Removing users from the Domain
Removing a user means taking them out of your domain and closing their Expensify account completely if they don't have another login. Be cautious because closing an account is permanent and deletes any unsubmitted or processing reports.

### How to remove users
In your web account, go to **Settings > Domains > [Domain Name] > Domain Admins**
Check the box next to the employee's name you want to remove, then click “Close Accounts”.

### Important notes about closing accounts through Domain settings:
If a user has a Secondary Login linked to their Expensify account, they can still access their account after it's closed in the domain. This is helpful for accessing financial data, like tax-related receipts.
Closing an account through the domain permanently removes any unsubmitted receipts/reports. Make sure to approve or reimburse all employee reports before closing an account.
If an employee doesn't have a Secondary Login, they'll be automatically removed from the group Workspace. If they have a Secondary Login, it will continue to be associated with the group Workspace.

## Domain Groups
Domain Groups can be accessed if you have verified your domain. Groups are used to set rules or permissions for groups of users so you can enforce multiple different expense workspaces and rules. If you are a Domain Admin, you can create and edit Domain Groups under **Settings > Domains > _Domain Name_ > Groups**.

### Creating Domain Groups
1. In your Expensify account on the web, navigate to **Settings > Domains > _Domain Name_ > Groups**
2. Select “Create Group” to create the group. This will allow you to name the Group, as well as configure permissions that will apply to members of the Group. 

### Adding members to a Domain Group
1. In your Expensify account on the web, navigate to **Settings > Domains > [Domain Name] > Domain Members**
2. Select the checkbox next to the domain members you wish to add to the Domain Group
3. Select “Add to Group” to select the Group you wish to add them to

### Editing Domain Groups
1. In your Expensify account on the web, navigate to **Settings > Domains > _Domain Name_ > Groups**
2. Next to the Group you wish to edit, select “Edit”
3. This will open the Edit Permission Group pane, where you can edit the rules and permissions for that group
4. Make your edits and click “Save”

## Domain Group settings
These are the settings that can be customized for each group you have created. Typically, companies use two groups (Employees and Managers) and enforce stricter rules for Employees. The settings are:  
- Strict Workspace Enforcement: When enabled, all Workspace rules must be followed for a report to be submitted. If a rule is violated, the report can't be submitted until the issue is fixed. Employees can't bypass this by dismissing notifications.
- Login Restrictions: Enabling this prevents users from using non-company email addresses as their primary login. Secondary logins are still allowed.
- Workspace Creation and Removal Restrictions: This feature stops users from creating new group workspaces or unsubscribing from existing workspaces. Admins who need these abilities should be in a separate group with this restriction turned off.
- Preferred Workspace: When enabled, group members can only create reports under one designated Workspace. They can move a report to a different Workspace or their personal one later if needed. This helps keep personal and company expenses separate. If a company card uses a specific Workspace, this setting overrides it for more control over company card expenses.
- Setting a Preferred Workspace: If Preferred Workspace is on, you can choose a default group Workspace for all Group Members.

## SAML
To enable SAML SSO in Expensify you will first need to claim and verify your domain. Once you have a verified domain, you can access SAML SSO by navigating to **Settings > Domains > _Domain Name_ > SAML**

## Enable Two-Factor Authentication (2FA)
1. As a Domain Admin, head to: **Settings > Domains > _Your Domain Name_ > Domain Members**
2. Turn on Two Factor Authentication by toggling it to ENABLED
3. Any Domain members that do not have two-factor authentication enabled will be asked to set it up on their Home page when they next log in, and won't be able to use Expensify until they do.
4. To turn it off, simply toggle it off and refresh the page.

**Tips:**
- When using SAML, two-factor authentication cannot be required.
- For disputing digital Expensify Card purchases, two-factor authentication must be enabled.
- It might take up to 2 hours for domain-level enforcement to take effect, and users will be prompted to configure their individual 2FA settings on their next login to Expensify.

# FAQ

## How many domains can I have?
You can manage multiple domains by adding them through **Settings > Domains > New Domain**. However, to verify additional domains, you must be a Workspace Admin on a Control Workspace. Keep in mind that the Collect plan allows verification for just one domain.

## What’s the difference between claiming a domain and verifying a domain?
Claiming a domain is limited to users with matching email domains, and allows Workspace Admins with a company email to manage bills, company cards, and reconciliation. Verifying a domain offers extra features and security.
