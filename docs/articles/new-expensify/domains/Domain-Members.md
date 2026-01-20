---
title: Domain Members
description: Learn how to manage domain members in New Expensify.
internalScope: Audience is Domain Admins. Covers inviting/adding domain members, closing accounts, and promoting members to Domain Admin. Does not cover domain verification, SAML setup, Domain Groups configuration, or account access troubleshooting.
keywords: [New Expensify, domain members, verify domain, domain admin, domain control]
---

Managing domain members helps your organization control who can use Expensify with your company email domain, and which domain-level settings apply to them.

There are two types of users within Domain Settings:
- **Domain Member**: Subject to domain rules. Members must have an email address under the domain (e.g., `@yourcompany.com`) as their primary or secondary contact method.
- **Domain Admin**: Has full control over domain settings, including adding/removing members, managing rules, and configuring security settings. Admins do not need an email address associated with the domain.

Your domain must be verified before you can invite and manage members. Learn how to [claim and verify a domain](https://help.expensify.com/articles/new-expensify/domains/Claim-and-Verify-a-Domain).

---

# Add a Domain Member

There are two ways to add a domain member:
1. **Automatic signup**: Users who create an account using a domain email (e.g., `name@yourcompany.com`) are added automatically.
2. **Manual addition**: A Domain Admin can invite members.

## Automatically add members
- **New Expensify users**: Accounts created with a domain email are automatically added as members.
- **Existing Expensify users**: Users can add their domain email as a primary or secondary contact method. Once verified, they are added to the domain.

If a user has multiple contact methods, the primary contact method takes precedence.

## Manually invite a member
1. Go to **Workspaces > Domains**.
2. Select your domain.
3. Open **Domain Members**.
4. Enter the member’s email address, then click **Invite**.

---

# Close (Deactivate) a Domain Member Account

Domain Admins can close a member’s account when they leave the company.

1. Go to **Workspaces > Domains**.
2. Select your domain.
3. Open **Domain Members**.
4. Select the member.
5. Click **Close account**.

**Note:** Closed accounts can usually be re-opened by reinviting the user from the Domain Members page.

---

# Make a Member a Domain Admin

If you want a member to help manage domain settings, add them as a Domain Admin.

1. Go to **Workspaces > Domains**.
2. Select your domain.
3. Open **Domain Admins**.
4. Add the member’s email address or phone number.
