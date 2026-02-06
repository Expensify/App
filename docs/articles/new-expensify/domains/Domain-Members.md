---
title: Domain Members
description: Learn how to manage domain members in New Expensify.
internalScope: Audience is Domain Admins. Covers inviting/adding domain members, closing accounts, and promoting members to Domain Admin. Does not cover domain verification, SAML setup, Domain Groups configuration, or account access troubleshooting.
keywords: [New Expensify, Workspaces, Domains, domain members, verify domain, domain admin, domain control, remove domain member, deactivate domain user, invite domain user, promote to domain admin, workspace admins]
---

Managing domain members helps your organization control who can use Expensify with your company email domain, and which domain-level settings apply to them.

*Settings > Workspaces > Domains > Domain Members*

There are two types of members within Domain Settings:
- **Domain Member**: Subject to domain rules. Members must have an email address under the domain as their primary or secondary contact method, such as `@yourcompany.com`.
- **Domain Admin**: Has full control over domain settings, including adding/removing members, managing rules, and configuring security settings. Admins do not need an email address associated with the domain.

Your domain must be verified before you can invite and manage members. Learn how to [claim and verify a domain](https://help.expensify.com/articles/new-expensify/domains/Claim-and-Verify-a-Domain).

---

# How to add a Domain Member

You can add Domain Members in two ways: automatically or manually.

1. **Automatic signup**: Accounts created with a domain email, such as `name@yourcompany.com`, are added automatically.
2. **Manual addition**: A Domain Admin can invite members.

## How Domain Members are added automatically 

Members are automatically added when they use an email from your verified domain.

- **Members new to Expensify**: Accounts created with a domain email are automatically added as members.
- **Existing Expensify members**: Members can add a domain email as a primary or secondary contact method. Once verified, the members are automatically added to the domain.

If a member has multiple contact methods, the primary contact method takes precedence.

## How to manually invite a Domain Member

1. Go to **Workspaces > Domains**.
2. Select your domain.
3. Click **Domain Members**.
4. Enter the member’s email address, then click **Invite**.

---

## How to close or deactivate a Domain Member's account

Domain Admins can close a member’s account when they leave the company.

1. Go to **Workspaces > Domains**.
2. Select your domain.
3. Click **Domain Members**.
4. Select the member.
5. Click **Close account**.

**Note:** Closed accounts can be reopened by reinviting the member from the Domain Members page.

---

## How to promote a Domain Member to Domain Admin

You can give any member permission to manage domain settings by promoting them to a Domain Admin.

1. Go to **Workspaces > Domains**.
2. Select your domain.
3. Open **Domain Admins**.
4. Add the member’s email address or phone number.

# FAQ

## What happens if a user removes their domain email?

If a user removes their domain email from their contact methods, they’ll no longer be listed as a Domain Member.

## Can Domain Admins be outside the company domain?

Yes. Domain Admins don’t need to use a domain email — they can manage the domain from any account.

## Can I remove a Domain Member without closing their account?

No. To remove a Domain Member, you must deactivate (close) the account. However, you can always reinvite them later.

