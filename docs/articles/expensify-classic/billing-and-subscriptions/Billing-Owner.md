---
title: Billing-Owner
description:  The Billing Owner is the person responsible for payment for all usage on a given Workspace
---
# Overview
In Expensify, each Workspace has a Billing Owner. The Billing Owner is the person responsible for payment for all usage on a given Workspace. The Billing Owner is also a Workspace Admin, but it’s important to note that not all Workspace Admins are Billing Owners.
# How to set a billing owner
If you've just created a new Group Workspace, you first need to add a payment card to your account. You can do this by going to the web app's Home page and completing the payment card task. Alternatively, you can add a payment card directly from the Payments page (**Settings > Account > Payment**).
- If you already own a Group Workspace subscription, you can edit your payment card details or manage subscription options within the web app under **Settings > Workspaces > Group > Subscription**.
- If you're an individual Workspace owner, you can activate a new monthly subscription in the web app by going to **Settings > Workspaces > Individual > Subscription** section.
# How to change the Billing Owner
A Group Workspace's Billing Owner is typically the user who initially created the Workspace. However, any Workspace Admin can take over the role of Billing Owner by choosing to "Take Over Billing."
Any Workspace Admin can take over the billing responsibility of a Group Workspace as long as they are already a member of that Workspace. If you wish to become the Billing Owner of a Workspace you're not currently a member of, you need to contact an existing Workspace Admin and ask them to add you to the Group Workspace.
To take over billing:
1. Go to **Settings > Workspaces > Group**.
1. Click on the relevant Workspace name.
1. Click on "Take Over Billing." If you haven't added a payment card to your settings yet, you'll be prompted to do so to complete the transfer.

That's it! As the new Billing Owner, you will receive a monthly email receipt for the Group Workspaces you now own.
# How to update payment details in Expensify
If you're a policy billing owner, you can change your payment information like your payment card and billing currency. If you are a billing owner using the Expensify Card, your monthly company policy charges will be billed to your Expensify Card.

To change your payment details:
1. Log in to your account using a web browser or Android app (not available on iOS).
1. Go to **Settings > Account > Payments**.
1. To change your payment card, click "Change Payment Card" in the Payment Details section.
1. To change your billing currency, click "Change Billing Currency" and choose a new currency. You'll need to enter the CVC code of your payment card. You can pay in USD, GBP, NZD, or AUD.
# Deep Dive
## Taking over an existing subscription
If the previous Billing Owner had a 12-month subscription, it will be transferred to your Expensify account. If you already have an annual subscription, the sizes of both subscriptions will be combined. For example, if you have a subscription for 10 users and take over from someone with 50 users, your subscription will now cover 60 users. To take over the Annual Subscription, you need to transfer billing ownership of all Workspaces under the previous Billing Owner's name.

## Taking over Consolidated Domain Billing
If a Domain Admin has enabled Consolidated Domain Billing (**Settings > Domains > Domain Name > Domain Admins**), all Group Workspaces owned by users with email addresses matching the domain will be billed to the Consolidated Domain Billing owner. You can take over billing for the entire domain by following these steps:

To take over billing for the entire domain, you must:
1. Ensure you have a linked card on your **Settings > Account > Billing** page.
1. Be designated as the Primary Domain Admin.
1. Go to **Settings > Domains > _Domain Name_ > Domain Admins** and enable Consolidated Domain Billing.

Currently, Consolidated Domain Billing simply consolidates the amounts due for each Group Workspace Billing Owner (listed on the **Settings > Workspaces > Group** page). If you want to use the Annual Subscription across all Workspaces on the domain, you must also be the Billing Owner of all Group Workspaces.
# FAQ
## Why can't I see the option to take over billing?
There could be two reasons:
1. You may not have the role of Workspace Admin. If you can't click on the Workspace name (if it's not a blue hyperlink), you're not a Workspace Admin. Another Workspace Admin for that Workspace must change your role before you can proceed.
1. Your domain might have Consolidated Domain Billing enabled. Refer to the Deep Dive section to understand how to take over Consolidated Domain Billing.
## What if the current Billing Owner is no longer an employee?
There are two ways to resolve this:
1. Have your IT dept. gain access to the account so that you can make yourself an admin. Your IT department may need to recreate the ex-employee's email address. Once your IT department has access to the employee's Home page, you can request a magic link to be sent to that email address to gain access to the account.
1. Have another admin make you a Workspace admin.
