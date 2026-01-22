---
title: Domain Migration
description: Learn how to migrate your company’s email domain in New Expensify.
internalScope: Audience is Domain Admins and IT admins. Covers high-level options and the recommended process for migrating from one email domain to another. Does not cover detailed card-feed migration edge cases or individual account recovery beyond directing users to Concierge.
keywords: [New Expensify, Workspaces, Domains, domain migration, change email domain, update email address, domain control]
---

If your company's email domain changes, such as from `@old-domain.com` to `@new-domain.com`, Expensify can help you migrate domain control and update employee logins.

*Settings > Workspaces > Domains*

**Important:** If your company uses the Expensify Card or active company card feeds, contact Concierge or your Account Manager before attempting a migration.

---

## Option 1: Automatic Domain Migration (Concierge-assisted)

Concierge can typically help with an automatic migration when:
- The current domain or new domain is verified
- Email addresses match a 1:1 format, such as `name@olddomain.com` to `name@newdomain.com`
- Users have not already created separate accounts under the new email address

If these conditions are met, message **Concierge** and request a **Domain Migration**.

---

## Option 2: Manual Domain Migration

Use this approach if automatic migration isn’t possible.

### Step-by-step instructions

1. Add your new email address as an additional contact method on your account.
   - [How to update your email address](https://help.expensify.com/articles/new-expensify/settings/Update-Email-Address)
2. Claim and verify your new domain.
   - [Claim and verify a domain](https://help.expensify.com/articles/new-expensify/domains/Claim-and-Verify-a-Domain)
3. If you use domain groups, update group restrictions on the old domain. This includes disabling any setting that prevents switching the primary contact method. Then recreate the needed groups on the new domain.
   - [Domain groups](https://help.expensify.com/articles/new-expensify/domains/Domain-Groups)
4. Switch your primary contact method to the new email address (swap primary and secondary emails).
5. Move any card feeds to the new domain.
   - For commercial card feeds, message Concierge to assist with the move.
   - **Note:** Any unprocessed transactions may need to be handled before migration to avoid data loss.
6. Remove/reset any legacy domain setup that is no longer needed, such as removing extra domain admins from the old domain if applicable.

If employees already created separate accounts under the new email or you encounter errors during migration, message **Concierge** so Support can help you keep account history intact.
