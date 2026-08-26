---
title: Set Distance Rates
description: Set and manage distance rates for distance reimbursement in your Expensify workspace.
keywords: [New Expensify, distance rates, mileage reimbursement, enable distance rates, workspace settings, bulk edit rates, auto-update government rate, IRS standard rate, mileage rates, distance bands]
internalScope: Audience is Workspace Admins. Covers configuring and auto-updating Distance rates, does not cover creating distance expenses.
---

# Set Distance Rates

Distance rates determine how much members are reimbursed for distance-based travel. Workspace Admins can create multiple rates, control when each rate applies, configure taxes, and automatically update rates when supported government reimbursement rates change.

---

## Who can set Distance rates

Workspace Admins can configure Distance rates for a workspace.

Automatic updates are available for Collect workspaces with a default currency of USD, CAD, GBP, AUD, or NZD.

---

## How to enable Distance rates for a workspace

To activate Distance rates for a workspace:

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [workspace name]**.
2. Click **More Features**.
3. Toggle **Distance rates** to enable the setting. 

Once enabled, **Distance Rates** will appear in the left menu. 

---

## How to add Distance rates

1. Go to **Workspaces > [workspace Name] > Distance Rates**.
2. Click **Add Rate** in the top-right corner.
3. Enter the rate value (e.g., $0.585 per mile or km).
4. (Optional) Set a **Start date** and **End date** to define the period the rate applies to. Leave these blank if the rate has no time limit.
5. Click **Save**.

When a rate has a **Start date** or **End date**, Expensify uses it to apply the correct rate based on the expense date. See [How Expensify selects a rate when multiple rates exist](#How-Expensify-selects-a-Distance-rate-based-on-the-expense-date) below.

---

## How to change a Distance rate, effective dates, or tax settings

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [workspace name]**.
2. Click **Distance rates**.
3. Click on the rate you want to edit. 
4. Update any of the available settings:
   - Name
   - Rate
   - **Start date**
   - **End date**
   - Tax rate
   - Tax reclaimable amount
5. Click **Save**.

**Note:** If **Taxes** is enabled on the Workspace, each Distance rate can be associated with a tax rate and a tax reclaimable amount. The selected tax rate is automatically applied when the Distance rate is used on an expense. To enable tax tracking on a Workspace, [learn how to track Taxes](/articles/new-expensify/workspaces/Track-Taxes).

---

## How to remove Distance rates

To prevent members from using a Distance rate, you can either disable it or delete it.

- Disabled rates remain in the Workspace but cannot be selected on new Distance expenses.
- Deleted rates are permanently removed.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [workspace name]**.
2. Click **Distance rates**.
3. Select each rate you want to disable or delete.
4. Click **Selected**
5. Choose **Disable rates** or **Delete rates**.

---

## How to automatically update Distance rates when government rates change

Expensify can automatically update Distance rates in your Workspace when the standard government reimbursement rate changes, such as the IRS standard mileage rate in the United States or equivalent rates in supported countries.

When **Auto-update government rate** is enabled, Expensify adds a new effective-dated Distance rate when a supported government publishes a new rate. This means admins don't need to manually update the standard rate each time it changes.

Automatic updates are available for workspaces with a default currency of USD, CAD, GBP, AUD, or NZD.

To enable automatic updates:

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [workspace name]**.
2. Select **Distance rates**.
3. Select **Settings**.
4. Enable **Auto-update government rate**.

---

## What happens when Expensify automatically updates a Distance rate

When Auto-update government rate is enabled and a new supported government rate takes effect:

- Expensify adds a new rate with a **Start date** matching the date the new rate takes effect.
- Previous rates remain available so historical expenses can retain the rate that applied on their expense date.
- If the previous government rate does not have an End date, Expensify sets its End date to the day before the new rate takes effect.
- Workspace Admins are notified of the update in the workspace **#admins** room and in **Home > Announcements**.

Workspace Admins can still edit or disable an automatically added rate.

![Distance rates showing automatically created government rates]({{site.url}}/assets/images/Distance_rates_automatic_update.png){:width="100%"}

---

## How Expensify selects a Distance rate based on the expense date

When a workspace has more than one Distance rate, Expensify uses effective dates to determine which rate applies to an expense. This allows a workspace to keep multiple rates active, such as a previous year's rate and a new rate.

 - When a member creates or edits a Distance expense, Expensify selects the rate whose **Start date** and **End date** include the expense date.
 - If a member manually selects a rate that isn't valid for the expense date, the expense shows a violation indicating that the rate doesn't match the selected date. 
 - Setting effective dates is optional. Rates without a **Start date** or **End date** continue to apply without an effective-date restriction.

---

# FAQ

## Can I create multiple Distance rates?

Yes. A Workspace can have multiple active Distance rates. Members can select from the available rates when creating a Distance expense.

## Can I disable a Distance rate without deleting it?

Yes. Disabled Distance rates remain in the Workspace but cannot be selected on new Distance expenses. You can re-enable the rate at any time.

## Can I apply taxes to Distance rates?

Yes. If **Taxes** is enabled on the Workspace, you can associate a tax rate with each Distance rate. When a member selects that Distance rate on an expense, the associated tax rate is applied automatically.

## What is the Tax reclaimable amount?

The **Tax reclaimable** amount represents the portion of the Distance rate that can be reclaimed as tax. It is entered as a fixed monetary value for the Distance rate.

## What happens if I delete a Distance rate?

Deleted Distance rates are permanently removed from the Workspace and cannot be restored. If you want to prevent members from using a rate without removing it permanently, disable the rate instead.

## Can I change the reimbursement rate for existing Distance expenses?

No. Updating a Distance rate only affects future Distance expenses. Existing expenses keep the rate that was applied when the expense was created.

## Do I need at least one Distance rate?

Yes. When **Distance Rates** is enabled, the Workspace must always have at least one active Distance rate.

## Why isn't Auto-update government rate turned on for my workspace?

Auto-update government rate is turned on by default only for new workspaces. Existing workspaces are opted out by default, so you'll need to turn it on manually. It's also only available for workspaces with a default currency of USD, CAD, GBP, AUD, or NZD.
