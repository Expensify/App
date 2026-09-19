---
title: Review Domain Admin Requests
description: Learn how Domain Admins approve or deny requests for Domain Admin access in New Expensify.
internalScope: Audience is Domain Admins. Covers the Requests section on the Admins page, approving or denying a request for Domain Admin access, and the green dot that flags a pending request. Does not cover adding or removing Domain Admins directly, sending an access request, Domain Members, Domain Groups, or SAML setup.
keywords: [New Expensify, domain admin request, request admin access, approve domain admin, deny domain admin, pending domain admin request, Requests section, Admins page, green dot, domain access request, someone asked for admin access]
---

# Review Domain Admin Requests

A private domain can only be set up once. When someone else at your company tries to add a domain you already set up, they can ask your domain's admins for access instead. Their request shows up in a **Requests** section on the **Admins** page for that domain, where you can approve it to make them a Domain Admin or deny it to clear it.

---

## Who can review Domain Admin requests

Only Domain Admins for that domain see the **Requests** section. If you are not a Domain Admin, the section does not appear.

---

## How to find a pending Domain Admin request

A green dot flags a request that is waiting on you, so you don't have to open each domain to check. It shows on:

- The **Workspaces** tab in the navigation tabs (on the left on web, on the bottom on mobile)
- The domain's row on the **Domains** tab
- The **Domain admins** menu item for that domain

The green dot clears once no requests are left to review.

<!-- SCREENSHOT:
Suggestion: The Domains tab with a green dot on a domain row that has a pending request.
Location: After the bulleted list in "How to find a pending Domain Admin request".
Purpose: Shows admins that the green dot is an informational marker on the domain row, so they don't read it as an error on the domain and open a support request.
-->

---

## How to approve or deny a Domain Admin request

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Select the **Domains** tab.
3. Select the domain.
4. Select **Domain admins**.
5. Find the person in the **Requests** section, listed above the **Admins** section.
6. Click **Approve** to make them a Domain Admin, or **Deny** to clear the request.

<!-- SCREENSHOT:
Suggestion: The Admins page showing the Requests section above the Admins section, with one request row and its Approve and Deny buttons.
Location: After step 6 in "How to approve or deny a Domain Admin request".
Purpose: Confirms admins are looking at the right section, since Requests and Admins are two groups in the same list and the request row is the only one with Approve and Deny buttons.
-->

---

## What happens after you approve or deny a Domain Admin request

- If you approve the request, the person moves out of the **Requests** section and into the **Admins** section with full Domain Admin access.
- If you deny the request, the row disappears from the **Requests** section and the person is not added as a Domain Admin.
- The **Requests** section only appears when at least one request is waiting, so it disappears once you handle the last one.
- Any Domain Admin for the domain can handle a request, so a request you don't act on may be cleared by another admin.

[Learn what Domain Admins can manage](/articles/new-expensify/domains/Domain-Admins) once you approve a request.

---

# FAQ

## Why do I see a green dot on the Workspaces tab?

Someone has asked for Domain Admin access to a domain you administer. Select **Workspaces**, then select the **Domains** tab, and look for the domain row that also has a green dot.

## Can I add someone as a Domain Admin without waiting for a request?

Yes. On the **Admins** page, click **Add admin** and enter their email address or phone number. They do not need to request access first.

## Why does the Requests section not appear on the Admins page?

No one is currently waiting for access to that domain, or you are not a Domain Admin for it.

## What happens if the person asks for access again after I deny them?

Their request comes back in the **Requests** section, and you can approve or deny it again.

## Why did approving or denying a request fail?

You'll see **Unable to approve this request. Please try again.** or **Unable to deny this request. Please try again.** on the row. Dismiss the message and try again. If you are offline, the action is queued and runs once you reconnect.
