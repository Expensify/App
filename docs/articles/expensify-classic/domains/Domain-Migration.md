---
title: Domain Migration
description: Learn how to migrate your company’s email domain and update user logins in Expensify Classic.
keywords: [Expensify Classic, domain migration, change email address, update company domain, migrate workspace]
---

<div id="expensify-classic" markdown="1">

If your company updates its email domain (e.g., from `@old-domain.com` to `@new-domain.com`), Expensify offers two migration options: **automatic** and **manual**. This guide walks you through both.

**Important:**  If your company uses the Expensify Card, do not request cards or create a new domain manually. Contact the Concierge or your Account Manager to have Expensify handle the migration.

---

# Automatic Domain Migration

If the following criteria are all met, Concierge can handle the migration automatically:
- The **current or new domain** is verified.
- Email addresses match **1:1 format** (e.g., `name@olddomain.com` → `name@newdomain.com`).
- Users **have not created** accounts under the new email address.

If **all conditions are true**, message **Concierge** and request a **Domain Migration**. This usually takes a few business days.  

If **any condition is false**, follow the manual migration steps below.

---

# Manual Domain Migration

Use this approach if automatic migration isn't possible. Have each employee follow these steps in the **exact order**:

## Step-by-step instructions

1. Add your new email address as a [secondary login](https://help.expensify.com/articles/expensify-classic/settings/account-settings/Change-or-add-email-address) to your current account.
2. [Claim and verify your new domain](https://help.expensify.com/articles/expensify-classic/domains/Claim-And-Verify-A-Domain).
3. If using [domain groups](https://help.expensify.com/articles/expensify-classic/domains/Create-A-Group), disable **Restrict Primary Login Selection** on all groups in the old domain.
4. Switch the **Primary Login** to the new email (swap primary and secondary emails).
5. Set up any card feeds under the new domain.
   - For **commercial card feeds**, email [concierge@expensify.com](mailto:concierge@expensify.com). Expensify will move them for you.
   - **Note:** Any unprocessed transactions must be submitted before migration, or they will be deleted when cards are reassigned.

6. Enter a **transaction start date** to avoid overlap with previous card imports.
7. Reset your old domain:
   - Remove all Domain Admins.
   - The **last remaining admin** will see a **Reset** button—click it to complete the process.

8. If someone has already created an account using the new email, they need to [merge accounts](https://help.expensify.com/articles/expensify-classic/settings/account-settings/Merge-accounts).
9. Rebuild your [domain groups](https://help.expensify.com/articles/expensify-classic/domains/Create-A-Group) on the new domain and assign users to them.

---

# FAQ

## What happens to my old email after migration?

Your old email becomes an additional contact method on your account. You can still use it to sign in, but all new activity will be associated with your new primary email address.

## Can users keep their historical data?

Yes! Migrating preserves your account history, reports, and settings as long as steps are followed in order.

## What if employees already created accounts under the new domain?

They’ll need to [merge their accounts](https://help.expensify.com/articles/expensify-classic/settings/account-settings/Merge-accounts) to keep everything in one place.

</div>
