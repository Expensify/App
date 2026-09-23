---
title: Domain Admins
description: Learn how to add and manage Domain Admins in New Expensify.
internalScope: Audience is Domain Admins. Covers adding and removing Domain Admins, reviewing pending admin access requests, and what the Domains tab badge means. Does not cover Domain Members, Domain Groups, SAML setup, or login troubleshooting.
keywords: [New Expensify, domain admins, domain control, domain settings, domain management, domain admin request, review domain admin requests, approve admin request, deny admin request, Requests, Domains tab badge, domain badge, pending admin access]
---

Domain Admins manage your company’s domain settings in Expensify. They can claim domains, verify domain ownership, manage domain members, and configure domain-level security settings (like [SAML SSO](https://help.expensify.com/new-expensify/hubs/domains/)).

---

## How to add a Domain Admin

**To add a Domain Admin:**
1. Go to **Workspaces**, then select the **Domains** tab.
2. Select your domain.
3. Open **Domain Admins**.
4. Enter the admin’s email address or phone number, then click **Add**.

**Note:** A Domain Admin does not need an email address on the company domain. For example, an external bookkeeper can be a Domain Admin.

---

## How to remove a Domain Admin

**To remove a Domain Admin:**
1. Go to **Workspaces**, then select the **Domains** tab.
2. Select your domain.
3. Open **Domain Admins**.
4. Select the admin, then click **Remove**.

---

## How to review pending Domain Admin access requests

When someone asks for admin access to a domain you administer, Expensify prompts you in two places:

- A **Review 1 domain admin request** to-do under **To-dos** on **Home**. The wording changes to **Review 2 domain admin requests** when there is more than one. Click **Begin** to go straight to the requests. If only one of your domains has requests, this opens that domain’s **Domain admins** page. If more than one domain has requests, it opens the **Domains** tab so you can choose a domain.
- A count badge on the **Domains** tab.

**To approve or deny a request:**
1. Go to **Workspaces**, then select the **Domains** tab.
2. Select the domain.
3. Open **Domain admins**.
4. Under **Requests**, click **Approve** to make the requester a Domain Admin, or **Deny** to turn down the request.

Approved requesters move from **Requests** into the **Admins** list and can manage the domain right away. Both prompts clear once you have resolved every request.

<!-- SCREENSHOT:
Suggestion: The Domain admins page with the Requests section showing one pending requester row and its Approve and Deny buttons.
Location: After step 4 in "How to review pending Domain Admin access requests".
Purpose: Confirms where the Requests section sits relative to the Admins list, so admins who arrive from the Home to-do don't miss it and assume the request disappeared.
-->

---

## What the Domains tab badge means

The badge on the **Domains** tab counts the domains that need your attention, not the number of requests. A domain is counted once when it has a pending admin access request, an error, or both.

The badge color tells you what kind of attention is needed:
- **Green** — the only thing waiting on you is a pending admin access request.
- **Red** — at least one of your domains has an error. Errors take priority over requests, so the badge turns red even when requests are also pending.

The count is the same either way, so a red badge reading **2** can mean one domain with an error and one domain with a pending request.

The badge is hidden when none of your domains need attention.

---

# FAQ

## Do I need to verify my domain to add Domain Admins?

No. You can add Domain Admins after you claim the domain. Verification is required to enable advanced features like SAML and to manage domain members.

## Can I have multiple Domain Admins?

Yes. There’s no limit to the number of Domain Admins you can assign. We recommend giving access to multiple people in case someone becomes unavailable.

## Can I add a Domain Admin who doesn’t have a company email?

Yes. Domain Admins do not need to use your company’s email domain. You can add personal emails, contractors, or partners as Domain Admins if needed.

## How do I revoke Domain Admin access?

Go to **Workspaces**, then select the **Domains** tab, open your domain, and select **Domain Admins**. From there, click **Remove** next to the person you want to revoke access for.

## Who can be a Domain Admin

You can add any Expensify user as a Domain Admin, regardless of whether they use your private domain or a public domain like gmail.com. 

## Why don’t I see the Review domain admin request to-do?

The to-do only appears on **Home** when someone is waiting on you for a domain you administer. You won’t see it for domains you don’t administer, and your own pending request to join a domain never counts toward it.

## Why does the number in the to-do not match the Domains tab badge?

They count different things. The to-do counts pending requests, so three people asking for access to the same domain show as **Review 3 domain admin requests**. The badge counts domains that need attention, so those same three requests show as **1**.

## What happens to the person I deny?

Denying a request removes it from **Requests** without granting access, and the requester is not added to the domain. They can ask for admin access again later.

