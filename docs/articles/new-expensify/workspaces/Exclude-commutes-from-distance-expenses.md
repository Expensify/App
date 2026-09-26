---
title: Exclude commutes from distance expenses
description: Set up Exclude commutes on a workspace so a member's regular commute is subtracted from the distance expenses they create.
keywords: [New Expensify, exclude commutes, commute exclusion, commuter miles, exclude usual commute, remove fixed distance, home and office, distance rates, mileage deduction, workspace admin]
internalScope: Audience is workspace admins. Covers turning on Exclude commutes for distance rates and how each exclusion method changes a member's distance expense. Does not cover creating distance expenses, setting distance rate amounts, or configuring taxes on distance rates.
---

# Exclude commutes from distance expenses

**Exclude commutes** subtracts a member's regular commute from the distance expenses they create on your workspace, so you reimburse business travel only. You choose whether to subtract each member's usual home-to-office commute or the same fixed distance from every claim.

The expense is created for the remaining distance, and the member can still see the original trip distance and the distance that was removed.

---

## Who can set up Exclude commutes

- Workspace admins can set up **Exclude commutes**.
- **Distance rates** must be enabled on the workspace. [Learn how to set distance rates](/articles/new-expensify/workspaces/Set-distance-rates)
- A commute is only excluded from expenses created on the workspace. Distance expenses created outside a workspace, such as in a DM or in Your space, are not affected.
- A commute is only excluded from map-based and GPS distance expenses, because the exclusion is calculated from the trip's route. Manual and odometer entry are not affected.
- **Exclude usual commute** additionally requires a **Company address** on the workspace and a **Home address** on the member's account.

---

## How to turn on Exclude commutes for distance rates

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Distance rates**.
3. Select **Settings**.
4. Select **Exclude commutes**.
5. Select the method you want to use:
   - **Exclude usual commute** — Subtracts each member's regular commute based on their home, work arrangement, and office.
   - **Remove fixed distance** — Subtracts the same distance from every claim. Enter the amount in the **Distance** field.
6. Select **Save**.

The **Exclude commutes** row then shows the method in use: **Use home and office locations** for **Exclude usual commute**, or **Exclude [distance] [unit] per claim** for **Remove fixed distance**.

<!-- SCREENSHOT:
Suggestion: The Exclude commutes screen with all three options visible (Do not exclude commute, Exclude usual commute, Remove fixed distance) and the Distance field shown under Remove fixed distance.
Location: Immediately after the numbered steps above.
Purpose: Admins choosing a method need to see that the fixed distance amount is entered inline under the option, rather than on a following screen.
-->

**Note:** While **Exclude commutes** is turned on, **Require GPS or map entry** stays on and is locked, because the exclusion needs route data. To change that setting, first set **Exclude commutes** to **Do not exclude commute**.

---

## How to add the addresses that Exclude usual commute needs

**Exclude usual commute** compares each member's home address to the workspace's office address, so both must be on file. You can't select this method until the workspace has an address.

To add the workspace address:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Overview**.
3. Select **Company address** and enter the office address.

Each member adds their own home address from **Account settings > Profile > Home address**. When a workspace they belong to uses **Exclude usual commute**, the **Home address** row notes that the workspace uses this address for commuter exclusions.

---

## How Exclude usual commute changes a distance expense

When a member creates a map-based or GPS distance expense on the workspace, Expensify compares the trip to their commute and removes the commuting portion:

- A trip from home to the office, or from the office to home, is entirely commute, so the whole distance is excluded and nothing is reimbursed.
- A trip that starts at home and continues past the office has the home-to-office distance excluded, and the rest is reimbursed.
- A trip that starts at the office and ends somewhere other than home has nothing excluded, and the full distance is reimbursed.

The exclusion is recalculated whenever the trip changes. If a member edits the start, stop, or additional stops on an existing expense, Expensify works out the commute again for the new route.

---

## How Remove fixed distance changes a distance expense

**Remove fixed distance** subtracts the distance you entered from every map-based or GPS distance expense on the workspace, no matter where the trip started or ended. If a trip is shorter than the fixed distance, the whole trip is excluded and nothing is reimbursed.

A fixed distance is stored on the expense when it's created. If you later change the fixed distance on the workspace, existing expenses keep the amount that was removed when they were created.

---

## What members see on a distance expense with a commute removed

On an expense with a commute removed:

- The **Distance** field shows the reimbursable distance, labeled with the trip's original distance, such as **Distance • Original: 25.00 mi**.
- A hint below the field shows how much was taken off, such as **Removed 12 commuter miles**.
- The amount is calculated from the reimbursable distance and the applicable distance rate.
- A message in the expense thread records the removal and links to the workspace distance settings.

[Learn how to create distance expenses](/articles/new-expensify/reports-and-expenses/Distance-Expenses)

---

# FAQ

## Does Exclude commutes apply to manual or odometer distance expenses?

No. A commute is only excluded from map-based and GPS distance expenses, because the exclusion is calculated from the trip's route. This is why **Require GPS or map entry** stays on while **Exclude commutes** is turned on.

## Why can't I select Exclude usual commute?

The workspace needs an office address first. Add one from **Workspaces > [workspace name] > Overview > Company address**, then select **Exclude usual commute** again.

## Does changing the Exclude commutes method change existing expenses?

No. Changing the method or the fixed distance only affects distance expenses created afterward. Existing expenses keep the exclusion that applied when they were created.

## How do members know a commute was removed?

The expense shows the original trip distance next to the **Distance** field and a hint with the distance that was removed, and a message in the expense thread records the removal.

## Does Exclude commutes apply to expenses created outside a workspace?

No. Only distance expenses created on a workspace that has **Exclude commutes** turned on are affected.
