---
title: Claim and Verify a Domain
description: Learn how to claim and verify a private domain in Expensify to manage employee permissions and enable advanced features.
keywords: [Expensify Classic, claim a domain, domain permissions, verify domain]
---

<div id="expensify-classic" markdown="1">

If you have a private domain (e.g., `yourcompany.com`), you can claim and verify it in Expensify to manage employee permissions and enable additional security features.

## Claiming a domain allows you to:
- Grant specific permissions to employees using the domain in their email address.
- Import and reconcile company credit cards and Expensify Cards.
- Apply company credit card and Expensify Card rules.

## Verifying a domain allows you to:
- Assign delegates for employees on vacation.
- Delete employee Expensify accounts.
- Enable SAML/SSO for secure login.

**Note:** Only private domains can be claimed and verified. Public domains (e.g., gmail.com) cannot be used.

---

# Step 1: Claim Your Domain
1. Hover over **Settings**, then click **Domains**.
2. Click **New Domain**.
3. Enter your domain name (e.g., `yourcompany.com`).
4. Click **Submit**.

---

# Step 2: Verify Domain Ownership
To verify a domain, you must have a **Control** workspace and access to your domain provider account (e.g., GoDaddy, Wix, Google Domains).

**If you don’t complete the verification, you can still:**
- Manage credit card expenses and domain admins.
- Add and remove domain admins.

**Without verifying the domain, you cannot:**
- Invite domain members.
- Add groups.
- Use domain reporting tools.
- Set delegates for employees on vacation.
- Enable SAML/SSO.

For provider-specific instructions, refer to your domain provider’s documentation.

## To Verify a Domain:
1. Log in to your **DNS service provider** (e.g., Namecheap, GoDaddy, Amazon Route 53). If your domain is managed internally, contact your IT department.
2. Locate the **DNS Records** page (sometimes labeled as DNS Management or Zone File Editor).
3. Add a **TXT record** with the verification value provided in Expensify.
4. Save your changes.
5. In Expensify, go to the **Domain Members** tab and click **Verify**.

Once verified, an email will be sent to all domain members informing them that their accounts are now managed under the domain rules.

---

# Add Another Domain
To add an additional domain:
1. Add your domain email address (`@yourcompany.com`) as a **primary or secondary email** in Expensify -- [How to add an email](https://help.expensify.com/articles/expensify-classic/settings/account-settings/Change-or-add-email-address)
2. Follow the steps above to claim and verify the new domain.

</div>
