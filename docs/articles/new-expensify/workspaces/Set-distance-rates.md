---
title: Set Distance Rates
description: Set and manage rates for distance reimbursement in your Expensify workspace.
keywords: [New Expensify, distance rates, mileage reimbursement, enable distance rates, workspace settings, bulk edit rates, auto-update government rate, IRS standard rate, mileage rates, distance bands, require GPS or map entry, disable manual distance, disable odometer, block manual mileage, GPS only mileage]
internalScope: Audience is workspace admins. Covers configuring and auto-updating distance rates and requiring GPS or map entry, does not cover creating distance expenses.
---

# Set Distance Rates

Distance rates determine how much members are reimbursed for distance-based travel. Workspace admins can create multiple rates, control when each applies, configure the associated taxes, and automatically update rates when supported governments publish new ones.

---

## Who can set distance rates

Workspace admins can configure distance rates for a workspace.

Automatic updates are available for Control workspaces with a default currency of USD, CAD, GBP, AUD, or NZD.

---

## How to enable Distance rates for a workspace

1. In the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [workspace name]**.
2. Select **More features**.
3. Toggle **Distance rates** to enable the setting. 

Once enabled, **Distance rates** will appear in the workspace menu. 

---

## How to add distance rates

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Distance rates**.
3. Select **Add rate**.
4. Enter the display name and rate value (e.g., $0.585 per mile or km).
5. (Optional) Set a **Start date** and **End date** to define the period the rate applies to. Leave these blank if the rate has no time limit.
6. Click **Save**.

When a rate has a **Start date** or **End date**, Expensify automatically applies the correct rate based on the expense date. See [How Expensify selects a rate when multiple rates exist](#How-Expensify-selects-a-Distance-rate-based-on-the-expense-date) below.

---

## How to track tax on distance rates

To track taxes on distance rates, **Taxes** must be enabled on the workspace.[Learn how to track taxes](/articles/new-expensify/workspaces/Track-Taxes).

To enable **Track tax** for distance rates:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Distance rates**.
3. Select **Settings**.
4. Enable **Track tax**

Once **Track tax** is enabled, you can assign a tax rate and tax reclaimable amount to an existing distance rate. The selected tax rate is automatically applied when the distance rate is used. 

**Note:** You can't assign a tax rate when creating a distance rate. Create the distance rate first, then edit it to configure the tax rate and tax reclaimable amount.

## How to change a distance rate, effective dates, or tax rate

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Distance rates**.
3. Select the rate you want to edit. 
4. Update any of the available settings:
   - **Name**
   - **Rate**
   - **Start date**
   - **End date**
   - **Tax rate** (if enabled)
   - **Tax reclaimable** (if enabled)
5. Select **Save**.

---

## How to disable or delete distance rates

To prevent members from using a distance rate, you can either disable it or delete it.

- Disabled rates remain in the workspace but cannot be selected on new distance expenses.
- Deleted rates are permanently removed.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Distance rates**.
3. Select each rate you want to disable or delete.
4. Choose **Selected**.
5. Choose **Disable rates** or **Delete rates**.

---

## How to require GPS or map entry for distance expenses

Enable **Require GPS or map entry** when every distance expense on the workspace must come from a mapped route or a GPS-tracked trip. Manual and odometer entry are disabled for the workspace, so members can't type in a distance or enter odometer readings.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Distance rates**.
3. Select **Settings**.
4. Enable **Require GPS or map entry**.

<!-- SCREENSHOT:
Suggestion: The Distance rates Settings panel with the Require GPS or map entry toggle turned on, showing the subtitle "Manual and odometer entry will be disabled."
Location: Immediately after the numbered steps in this section.
Purpose: Admins look for this control under the rate list rather than behind Settings, so showing where the toggle sits prevents them from reporting the setting as missing.
-->

---

## What happens after you enable Require GPS or map entry

- When members create a distance expense on the workspace, only the **Map** and **GPS** tabs appear under **Track distance**. The **Manual** and **Odometer** tabs are hidden.
- If a member starts a manual or odometer expense somewhere else and then selects this workspace, Expensify blocks the expense and shows **Require GPS or map entry — This workspace requires either map-based or GPS-tracked distance expenses.**
- Members who belong to more than one workspace keep the **Manual** and **Odometer** tabs until every workspace they belong to requires GPS or map entry.
- Distance expenses that members track for themselves in **Your space** are not affected.

---

## How to automatically update distance rates when government rates change

Expensify can automatically update distance rates in your workspace when the standard government reimbursement rate changes, such as the IRS standard mileage rate in the United States or equivalent rates in supported countries.

When **Auto-update government rate** is enabled, Expensify adds a new effective-dated distance rate when a supported government publishes a new rate. This means admins don't need to manually update the standard rate each time it changes.

Automatic updates are available for workspaces with a default currency of USD, CAD, GBP, AUD, or NZD.

To enable automatic updates:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Distance rates**.
3. Select **Settings**.
4. Enable **Auto-update government rate**.

---

## What happens when Expensify automatically updates a distance rate

When **Auto-update government rate** is enabled and a new supported government rate takes effect:

- Expensify adds a new rate with a **Start date** matching the date the new rate takes effect.
- Previous rates remain available so historical expenses can retain the rate that applied on their expense date.
- If the previous government rate does not have an **End date**, Expensify sets its **End date** to the day before the new rate takes effect.

Workspace admins can still edit or disable an automatically added rate.

![Distance rates showing automatically created government rates]({{site.url}}/assets/images/Distance_rates_automatic_update.png){:width="100%"}

---

## How Expensify selects a distance rate based on the expense date

When a workspace has more than one distance rate, Expensify uses effective dates to determine which rate applies to an expense. This allows a workspace to keep multiple rates active, such as a previous year's rate and a new rate.

 - When a member creates a distance expense, Expensify selects the rate whose **Start date** and **End date** include the expense date, using the most narrow and most recent date range if multiple apply,
 - If a member manually selects a rate that isn't valid for the expense date, the expense shows a violation indicating that the rate doesn't match the selected date. 
 - Setting effective dates is optional. Rates without a **Start date** or **End date** continue to apply without an effective-date restriction.

---

# FAQ

## Can I create multiple distance rates?

Yes. A workspace can have multiple active distance rates. Members can select from the available rates when creating a distance expense.

## Can I disable a distance rate without deleting it?

Yes. Disabled distance rates remain in the workspace but cannot be selected on new distance expenses. You can re-enable the rate at any time.

## Can I apply taxes to distance rates?

Yes. **Taxes** must be enabled on the workspace, and **Track tax** must be enabled for **Distance rates**. You can then edit an existing distance rate to assign a tax rate and tax reclaimable amount. The selected tax rate is automatically applied when the distance rate is used.

## What does Tax reclaimable mean for a distance rate?

**Tax reclaimable** represents the portion of the distance rate that can be reclaimed as tax. It is entered as a fixed monetary value for the distance rate.

## What happens if I delete a distance rate?

Deleted distance rates are permanently removed from the workspace and cannot be restored. If you want to prevent members from using a rate without removing it permanently, disable the rate instead.

## Can I change the reimbursement rate for existing distance expenses?

No. Updating a distance rate only affects future distance expenses. Existing expenses keep the rate that was applied when the expense was created.

## Do I need at least one distance rate?

Yes. When **Distance rates** is enabled, the workspace must always have at least one active distance rate.

## Why can't I turn off Require GPS or map entry?

If the workspace excludes commutes from distance expenses, **Require GPS or map entry** stays on and is locked, because commute exclusions are calculated from route data. Set **Exclude commutes** to **Do not exclude commutes** to unlock the setting.

## Does Require GPS or map entry change distance expenses that already exist?

No. It applies to new distance expenses only. Distance expenses created before you enabled the setting keep the distance that was already recorded.

## Why isn't Auto-update government rate turned on for my workspace?

**Auto-update government rate** is turned on by default only for new workspaces. Existing workspaces are opted out by default, so you'll need to turn it on manually. It's also only available for workspaces with a default currency of USD, CAD, GBP, AUD, or NZD.
