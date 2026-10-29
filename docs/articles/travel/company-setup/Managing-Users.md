---
title: Managing Users
description: Learn how Travel Admins can view and manage traveler profiles, groups, roles, and configuration settings in Expensify Travel.
keywords: [manage users, travel users, traveler profile, expensify travel admin, travel groups, travel roles, legal entity, secondary approvers, travel arranger]
internalScope: Audience is Travel Admins. Covers traveler provisioning, individual traveler profile settings, and user-level group and role assignments in Expensify Travel. Does not cover creating or managing groups, role definitions, scopes, or travel policy configuration.
---

Travel Admins can view and manage traveler profiles, access, and configuration settings under the **Users** section of Expensify Travel.

---

## How to access Expensify Travel

* **In New Expensify:** Click the **+** button in the bottom-left corner of your screen, then select **Book travel**.
* **In Classic Expensify:** Click **Travel** in the left-hand menu, then select **Book or manage travel**.

**Need to enable travel still?** Reach out to your Account Manager or Concierge to schedule a travel demo and get it enabled for your account.

---

## Who can manage users?

Only Travel Admins can manage other users' traveler profiles, groups, roles, and configuration settings.

---

## How users are provisioned to Expensify Travel

Users are automatically provisioned to Expensify Travel when they belong to the Travel-enabled Expensify workspace and have it set as their default workspace. Users can't be manually added directly from Expensify Travel.

To be provisioned to Expensify Travel, a user must:

* Be a member of the Travel-enabled Expensify workspace.
* Have the Travel-enabled workspace set as their default workspace.

If either of these requirements is no longer met, the user is automatically deprovisioned from Expensify Travel.

For example, a user will be deprovisioned if they're removed from the Travel-enabled workspace or change their default workspace to a different workspace.

### Workspace Admins

Users with the **Workspace Admin** role on the Travel-enabled Expensify workspace are automatically added to the **Company Admins** group in Expensify Travel.

If their Expensify role changes from Workspace Admin to another workspace role, they're automatically removed from the Company Admins group. If they're later assigned the Workspace Admin role again, they're automatically added back to the group.

For more information about groups and roles in Expensify Travel, see [Managing Groups and Roles](Managing-Groups-and-Roles.md).

---

## How to manage users

1. Open **Expensify Travel**.
2. Click **Program** in the top navigation bar.
3. Navigate to **Company** > **People** > **Users**.

The Users page lists travelers who have been provisioned to your company in Expensify Travel.

Click a user's name to open their traveler profile and manage their settings.

---

## General tab

The **General** tab contains the traveler's personal, contact, employment, and company information.

### Traveler Information

* Required: First name and Last name
* Optional: Title, Middle name, Preferred name, Suffix, Tier

  * *Preferred name* is only used within the platform and does not affect bookings.

### Contact Details

* Phone country code and phone number
* Email address, which is imported from Expensify and isn't editable

### Employment Details

* Job title
* Employee ID
* Accounting code
* Worker type
* Direct manager

Use **Add manager** to assign a direct manager. This can be used to route travel approvals.

### Company Settings

* Required: **Legal entity** (Expensify workspace)
* Optional: Office location, Department, Cost center, Country/Region

---

## How the Groups and roles tab works

The **Groups and roles** tab shows the groups and roles assigned to an individual user.

### Assigned groups

Groups give multiple users the same set of travel permissions.

To assign a group:

1. Under **Assigned groups**, click **Assign group**.
2. Select an existing group.
3. Confirm your changes.

To remove the user from a group, click the delete icon next to the assigned group.

The user receives the roles and scopes configured for each group they're assigned to.

### Assigned roles

Roles can also be assigned directly to an individual user.

To assign a role:

1. Under **Assigned roles**, click **Assign role**.
2. Select one or more roles.
3. Define the scope for the selected roles.
4. Click **Assign**.

Roles are predefined sets of permissions. The scope determines where those permissions apply.

Access from groups and directly assigned roles is cumulative. If a user receives the same or overlapping access from multiple assignments, removing one assignment won't remove access they still receive through another.

For more information about creating groups, assigning roles and scopes, and managing permissions, see [Managing Groups and Roles](Managing-Groups-and-Roles.md).

---

## Configuration tab

The **Configuration** tab contains additional booking and approval settings for the traveler.

### Book travel for guests

Enable this setting to allow the user to book travel for guests who aren't Expensify travelers, such as candidates or an employee's family member.

### Secondary approvers

Add one or more secondary approvers who can receive notifications and approve travel requests on the user's behalf.

This is helpful when using **hard approval** rules that require explicit approval of travel requests if the traveler's primary approver is unavailable.

### My arrangers

Assign users who can arrange travel for this traveler.

Arrangers can book and manage travel on the traveler's behalf. The users available to assign as arrangers depend on their access in Expensify Travel.

For more information about managing Travel access, see [Managing Groups and Roles](Managing-Groups-and-Roles.md).

---

# FAQ

## Why isn't a workspace member showing up in Expensify Travel?

Confirm that the user:

* Is a member of the Travel-enabled Expensify workspace.
* Has the Travel-enabled workspace set as their default workspace.

Both conditions must be met for the user to be provisioned to Expensify Travel.

Users can't be manually added directly in Expensify Travel. If they're removed from the Travel-enabled workspace or change their default workspace, they're automatically deprovisioned.

## How do I give someone Company Admin access in Expensify Travel?

Assign the user the **Workspace Admin** role on the Travel-enabled Expensify workspace. Once synced, they'll automatically be added to the **Company Admins** group in Expensify Travel.

If their Workspace Admin role is removed, they'll automatically be removed from the Company Admins group.

## Can I assign other travel permissions to a user?

Yes. Open the user's **Groups and roles** tab to assign an existing group or assign a predefined role and scope directly to the user.

For more information, see [Managing Groups and Roles](Managing-Groups-and-Roles.md).

## Can I import user data like departments or cost centers from my accounting software?

Not at this time. If this functionality would benefit your team, talk to your Account Manager to share feedback and explore alternatives.

## Can users assign their own arrangers or secondary approvers?

Yes. Users can update their arrangers and secondary approvers in their own profile settings if permitted.


Yes. Users can update their arrangers and secondary approvers in their own profile settings if permitted.
