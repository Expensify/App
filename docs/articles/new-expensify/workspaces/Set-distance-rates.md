---
title: Set Distance Rates
description: Set and manage distance rates for mileage reimbursement in your Expensify workspace.
keywords: [New Expensify, distance rates, mileage reimbursement, enable distance rates, workspace settings, bulk edit rates, exclude commutes, commuter exclusion, fixed distance]
---

# Set Distance Rates

Distance rates allow your workspace to reimburse mileage-based travel. Admins can create and manage one or more rates that members can select when submitting distance expenses.

---

## How to enable Distance rates 

To activate Distance rates for a workspace:

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace name]**.
2. Click **More Features**.
3. Toggle **Distance rates** to enable the setting. 

Once enabled, **Distance Rates** will appear in the left menu. 

---

## How to add Distance rates

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace name]**.
2. Click **Distance rates**.
3. Click **Add rate**. 
4. Enter the rate value. 
5. Click **Save**.


## How to edit Distance rate settings 

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace name]**.
2. Click **Distance rates**.
3. Click on the rate you want to edit. 
4. Update any of the available settings:
   - Name
   - Rate
   - Tax rate
   - Tax reclaimable amount
5. Click **Save**.

**Note:** If **Taxes** is enabled on the Workspace, each Distance rate can be associated with a tax rate and a tax reclaimable amount. The selected tax rate is automatically applied when the Distance rate is used on an expense. To track **Taxes** on a Workspace, [learn how to track Taxes](/articles/new-expensify/workspaces/Track-Taxes).


## How to remove Distance rates

To prevent members from using a Distance rate, you can either disable it or delete it.

- Disabled rates remain in the Workspace but cannot be selected on new Distance expenses.
- Deleted rates are permanently removed.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace name]**.
2. Click **Distance rates**.
3. Select each rate you want to disable or delete.
4. Click **Selected**
5. Choose **Disable rates** or **Delete rates**.

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

---

# Exclude commutes from distance expenses

On Control workspaces, you can exclude part of each mileage claim that represents ordinary commuting, so members are reimbursed only for the eligible portion of a route.

To configure how commutes are excluded:

1. Go to **Workspaces > [Workspace Name] > Distance Rates**.
2. Click **Settings** in the top-right corner.
3. Under **Exclude commutes**, choose one of the following:
   - **Do not exclude commutes** – No commute distance is excluded, and the full route distance is reimbursed.
   - **Exclude a fixed distance per claim** – A distance you set is subtracted from each eligible distance claim before the rate is applied.
4. If you select **Exclude a fixed distance per claim**, enter the distance to subtract from each claim.
5. Click **Save**.

**Note:** When any exclusion method is enabled, members can only create distance expenses using **Map** or **GPS** routes. **Manual** and **Odometer** entry are hidden because they don't provide enough route detail to calculate the excluded distance.

## How the fixed-distance exclusion is applied

When **Exclude a fixed distance per claim** is selected:

- The configured distance is subtracted from each eligible route-based distance claim individually.
- If the excluded distance is greater than the route distance, the reimbursable distance is set to zero (it never goes negative).
- The exclusion applies per claim. Expensify does not combine multiple claims in the same day or carry unused excluded distance between claims.
- Changing the exclusion method or amount only affects future expenses. Existing expenses are not recalculated.

Members see the excluded distance and the resulting reimbursable distance on the confirmation screen when creating the expense, and it's also explained on the receipt and in a system message after the expense is created.

<!-- SCREENSHOT:
Suggestion: Distance Rates > Settings page showing the Exclude commutes method selector with "Exclude a fixed distance per claim" selected and a fixed distance value entered
Location: After the steps in "Exclude commutes from distance expenses"
Purpose: Show admins exactly where the commute exclusion setting lives and how to configure it
-->

