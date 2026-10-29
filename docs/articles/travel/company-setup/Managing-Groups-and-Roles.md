---
title: Managing Groups and Roles
description: Learn how Travel Admins can use groups, roles, and scopes to manage user access and permissions in Expensify Travel.
keywords: [manage travel permissions, groups and roles, travel groups, travel roles, travel scopes, assign travel roles, company admins]
internalScope: Audience is Travel Admins. Covers managing user access in Expensify Travel using groups, predefined roles, scopes, group membership, and direct role assignments. Does not cover traveler provisioning, traveler profile settings, or travel policy configuration.
---

# How to access Expensify Travel

* **In New Expensify:** Click the **+** button in the bottom-left corner of your screen, then select **Book travel**.
* **In Classic Expensify:** Click **Travel** in the left-hand menu, then select **Book or manage travel**.

**Need to enable travel still?** Reach out to your Account Manager or Concierge to schedule a travel demo and get it enabled for your account.

---

## Who can manage groups and roles?

Only Travel Admins can manage groups, roles, scopes, and group membership.

Users must already be provisioned to Expensify Travel before they can be added to a group or assigned a role. See [Managing Users](Managing-Users.md) for more information about how users are provisioned and managed.

---

## How groups, roles, and scopes work

Groups, roles, and scopes work together to control access in Expensify Travel:

* **Groups** are collections of users who need the same access.
* **Roles** are predefined sets of permissions that determine what users can access and manage.
* **Scopes** determine where the permissions from a role apply.

For example, you can create a group, assign the appropriate roles and scopes to it, then add users as members. All members receive the access assigned to that group.

You can also assign a role and scope directly to an individual user without adding them to a group.

Access is cumulative. If a user receives access from multiple groups or direct role assignments, removing one assignment won't remove access they still receive from another.

---

## How to manage groups and roles

1. Open **Expensify Travel**.
2. Click **Program** in the top navigation bar.
3. Navigate to **Company > People > Groups and roles**.
4. Select:

   * **Groups** to create groups and manage their roles, scopes, and members.
   * **Roles** to view the predefined roles and their permissions.

---

## How to create a group

Use groups when multiple users need the same access.

1. Go to **Program > Company > People > Groups and roles**.
2. Select the **Groups** tab.
3. Click **Add group**.
4. Enter a group name and description.
5. Click **Create**.

Once the group is created, you can assign roles and scopes and add members.

---

## How to assign roles and scopes to a group

Roles determine what members of the group can access and manage. Each role assignment includes a scope that determines where those permissions apply.

1. Go to **Program > Company > People > Groups and roles**.
2. Select the **Groups** tab.
3. Select the group you want to manage.
4. Under **Roles and scopes**, click **Assign role**.
5. Select one or more roles.
6. Under **Define scope**, select the scope for the role.
7. Select the organization or trip template where the role should apply.
8. Click **Assign**.

Depending on the selected role, you can scope access by **Organization**, **Trip Template**, or both. The condition is automatically set to **is one of** and can't be changed.

The available scope options also depend on the combination of roles you select. If you select multiple roles at once, only scope types supported by all selected roles are available.

For example, if one selected role supports Organization and Trip Template but another only supports Organization, only Organization will be available when defining the scope.

---

## How to add members to a group

1. Go to **Program > Company > People > Groups and roles**.
2. Select the **Groups** tab.
3. Select the group you want to manage.
4. Select the **Members** tab.
5. Click **Add members**.
6. Select the users you want to add.
7. Confirm your changes.

Members receive the roles and scopes assigned to the group.

Users must already be provisioned to Expensify Travel before they'll appear as available members. See [Managing Users](Managing-Users.md) for more information about user provisioning.

---

## How to remove a member from a group

1. Go to **Program > Company > People > Groups and roles**.
2. Select the **Groups** tab.
3. Select the group you want to manage.
4. Select the **Members** tab.
5. Click the delete icon next to the user you want to remove.
6. Confirm the change.

Removing a user from a group removes the access they received through that group. If the user receives the same or overlapping access from another group or a directly assigned role, that access remains.

---

## How to assign a group to an individual user

You can also manage group membership directly from a user's travel profile.

1. Go to **Program > Company > People > Users**.
2. Select the user you want to manage.
3. Select the **Groups and roles** tab.
4. Under **Assigned groups**, click **Assign group**.
5. Select an existing group.
6. Confirm your changes.

The user receives the roles and scopes already configured for the assigned group.

To remove the user from a group, click the delete icon next to the group under **Assigned groups**.

---

## How to assign a role directly to an individual user

If a user needs access that doesn't apply to an entire group, you can assign a role directly to their travel profile.

1. Go to **Program > Company > People > Users**.
2. Select the user you want to manage.
3. Select the **Groups and roles** tab.
4. Under **Assigned roles**, click **Assign role**.
5. Select one or more roles.
6. Define the scope for the selected roles.
7. Click **Assign**.

The scope isn't predefined when you assign a role directly. You'll select the applicable scope as part of the role assignment.

Direct role assignments work in addition to any access the user receives through their assigned groups.

---

## How to view available roles and permissions

Roles are predefined and can't be created, deleted, or modified.

To review a role:

1. Go to **Program > Company > People > Groups and roles**.
2. Select the **Roles** tab.
3. Select a role to open its details.
4. Review the role description and permissions.

To customize where a role's permissions apply, configure its scope when assigning the role to a group or individual user.

---

## How the Company Admins group works

The **Company Admins** group is automatically managed by Expensify and provides full company management access in Expensify Travel.

Users with the **Workspace Admin** role on the Travel-enabled Expensify workspace are automatically added to the Company Admins group.

If their Expensify role changes from Workspace Admin to another workspace role, they're automatically removed from the Company Admins group. If they're later assigned the Workspace Admin role again, they're automatically added back.

The Company Admins group can't be deleted, and its predefined roles and scopes can't be changed.

---

## How to delete a group

A custom group can't be deleted while it has assigned roles.

1. Go to **Program > Company > People > Groups and roles**.
2. Select the **Groups** tab.
3. Select the group you want to delete.
4. Remove all roles assigned to the group.
5. Return to the **Groups** list.
6. Click the delete icon next to the group.
7. Confirm the deletion.

You don't need to remove members before deleting the group. All members are automatically removed from the group when it's deleted.

Access users receive from other groups or directly assigned roles isn't affected.

---

# FAQ

## Should I use a group or assign a role directly to a user?

Use a group when multiple users need the same access. This makes it easier to manage their permissions together.

Assign a role directly when an individual user needs access that doesn't apply to an entire group.

## Can I create a custom role?

No. Roles and their permissions are predefined. They can't be created, deleted, or modified.

You can customize where a role applies by defining its scope when assigning it to a group or user.

## What is a scope?

A scope determines where a role's permissions apply.

Depending on the role, access can be scoped by **Organization**, **Trip Template**, or both. The condition is automatically set to **is one of**.

If you select multiple roles at once, only scope types supported by all selected roles will be available.

## Why did the Trip Template scope disappear when I selected another role?

The available scope options depend on all roles being assigned together.

If one selected role supports Organization and Trip Template but another only supports Organization, **Trip Template** won't be available. Remove the role that only supports Organization, and Trip Template will become available again.

## Can a user belong to more than one group?

Yes. Users can belong to multiple groups and can also have roles assigned directly to their travel profile.

Access from groups and directly assigned roles is cumulative.

## How do I give someone Company Admin access?

Assign the user the **Workspace Admin** role on the Travel-enabled Expensify workspace. Expensify will automatically add them to the Company Admins group in Expensify Travel.

If their Workspace Admin role is removed, they'll automatically be removed from the Company Admins group.

## Can I delete the Company Admins group?

No. The Company Admins group is automatically managed by Expensify and can't be deleted or have its predefined roles and scopes changed.

## Why can't I find a user when adding members to a group?

The user must already be provisioned to Expensify Travel before they can be added to a group.

See [Managing Users](Managing-Users.md) for provisioning requirements and troubleshooting steps.

## Why can't I delete a group?

A custom group can't be deleted while roles are assigned to it.

Remove all assigned roles first, then delete the group. You don't need to remove the group's members first.
