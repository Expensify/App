---
title: Exclude commutes from distance expenses
description: Set commuter exclusions on a workspace's distance rates so daily commute distance is removed from reimbursable mileage.
keywords: [New Expensify, distance rates, commuter exclusions, exclude commutes, commute, mileage, calculate by home and office, home address]
internalScope: Audience is Workspace Admins configuring distance rates. Covers setting the Exclude commutes method (including Calculate by home and office) and its prerequisites, does not cover creating distance rates or submitting distance expenses.
---

# Exclude commutes from distance expenses

Commuter exclusions remove a member's regular commute from the mileage they claim, so only business-related distance is reimbursed. You choose how the commute is calculated for each workspace, and Expensify subtracts it automatically when members submit distance expenses.

---

## Who can set commuter exclusions

- Only **Workspace Admins** can set commuter exclusions.
- **Distance rates** must be enabled on the workspace. If it isn't, [learn how to set distance rates](/articles/new-expensify/workspaces/Set-distance-rates).
- To use **Calculate by home and office**, the workspace must have an office location set on the **Overview** page, and each affected member must have a **Home address** saved in their private profile.

---

## How to set commuter exclusions on distance rates

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Workspaces > [Workspace name]**.
2. Click **Distance rates**.
3. In the top-right corner, click **Settings**.
4. Click **Exclude commutes**.
5. Select the method you want to use:
   - **Do not exclude commutes** — No commute is removed from claims.
   - **Exclude a fixed distance per claim** — Removes the same commute distance from each claim. Best for members who submit one claim per workday. Enter the amount in the **Distance** field.
   - **Calculate by home and office** — Uses the member's home address, work arrangement, and office assignment to calculate commute exclusions.
6. Click **Save**.

<!-- SCREENSHOT:
Suggestion: The Exclude commutes page showing the three options (Do not exclude commutes, Exclude a fixed distance per claim, Calculate by home and office).
Location: After step 5.
Purpose: Confirms members are on the correct page and clarifies which option maps to which calculation method.
-->

---

## What happens after you set Calculate by home and office

- If the workspace has no office location, Expensify blocks the setting with a **Not so fast...** message and prompts you to first add an office location on the **Overview** page.
- Members who don't have a **Home address** saved in their private profile are prompted to add one before they can track distance. They'll see a reminder on their **Home** page and a message on their expense report, and they'll be blocked from creating a distance expense until the address is added.
- Once the office location and each member's home address are in place, Expensify subtracts the calculated commute from distance expenses automatically.

Members add their home address in **Settings > Profile > Personal details** under **Home address**.

---

# FAQ

## Why can't I select Calculate by home and office?

The workspace doesn't have an office location yet. Add an office location on the workspace **Overview** page, then set the method again.

## What happens if a member has no home address?

The member is blocked from creating distance expenses until they add a **Home address** in **Settings > Profile > Personal details**. Expensify reminds them on their **Home** page and on the related expense report.

## Do commuter exclusions apply to existing distance expenses?

No. Changing the commuter exclusion method only affects distance expenses created after the change.
