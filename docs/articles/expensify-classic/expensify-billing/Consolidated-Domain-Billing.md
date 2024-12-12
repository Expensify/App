---
title: Consolidated Domain Billing
description: Consolidated Domain Billing allows organizations to have different billing owners with only one person being billed for all paid workspaces.
---
<!-- The lines above are required by Jekyll to process the .md file -->
# Overview
If your organization requires that different workspaces have different billing owners, but only one person should pay the Expensify bill each month, you can enable Consolidated Domain Billing.
# How to enable Consolidated Domain Billing
Consolidated Domain Billing is a domain-level feature, so to access this setting, you’ll first need to claim and verify your domain. You can do this by heading to **Settings > Domains > Domain Name** > clicking on a setting such as **Groups** > and then clicking **Verify**.

Once the domain is verified, you can enable Consolidated Domain Billing under **Settings > Domains > Domain Name > Domain Admins > Primary Contact and Billing**.
# How to use Consolidated Domain Billing 
When a Domain Admin enables Consolidated Domain Billing, all Group workspaces owned by any user with an email address matching the domain will get billed to the Consolidated Domain Billing owner’s account.
# Deep Dive
## Consolidated Domain Billing best practices
If you don’t have multiple billing owners across your organization, or if you want to keep billing separate for any reason, then this feature isn’t necessary.

If you have an Annual Subscription and enable Consolidated Domain Billing, the Consolidated Domain Billing feature will gather the amounts due for each Group workspace Billing Owner (listed under **Settings > Workspaces > Group**). To make full use of the Annual Subscription for all workspaces in your domain, you should also be the billing owner for all Group workspaces.

{% include faq-begin.md %}

## How do I take over the billing of a workspace with Consolidated Domain Billing enabled? 
You’ll have to toggle off Consolidated Domain Billing, take over ownership of the workspace, and then toggle it back on.

## Can I use Consolidated Domain Billing to cover the bill for some workspaces, but not others?
No, this feature means that you’ll be paying the bill for all domain members who choose a subscription.

{% include faq-end.md %}
