---
title: Set Distance Rates
description: Set and manage distance rates for mileage reimbursement in your Expensify workspace.
keywords: [New Expensify, distance rates, mileage reimbursement, enable distance rates, workspace settings, bulk edit rates, exclude commutes, commuter exclusion, fixed distance]
---

Distance rates allow your workspace to reimburse mileage-based travel. Admins can create and manage one or more rates that members can select when submitting distance expenses.

---

# Enable Distance Rates in a Workspace

To activate distance rates for a workspace:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **More Features** in the left menu.
4. Toggle on **Distance Rates**.

Once enabled, a new **Distance Rates** tab will appear in the left-hand bar.

---

# Add, Edit, or Delete Distance Rates

You can create multiple distance rates to accommodate different reimbursement types (e.g., personal vehicle vs. company vehicle), and update or remove them as needed.

## Add a Distance Rate

1. Go to **Workspaces > [Workspace Name] > Distance Rates**.
2. Click **Add Rate** in the top-right corner.
3. Enter the rate value (e.g., $0.585 per mile or km).
4. Click **Save**.

## Edit, Make Inactive, or Delete a Single Rate

1. From the **Distance Rates** page, click on the rate you'd like to update.
2. To **make the rate active or inactive**, toggle the **Enable Rate** switch, then click **Save**.
3. To **edit** the rate amount, click the value field, enter the new number, and click **Save**.
4. To **permanently delete** the rate, click **Delete**.

**Note:** When distance rates are enabled, at least one rate must be active.

---

# Bulk Edit or Delete Distance Rates

You can apply actions to multiple rates at once from the main Distance Rates page.

1. Select the checkboxes next to the rates you want to update.
2. Click the **X selected** dropdown in the top-right corner.
3. Choose an action:
   - **Enable Rates** – Make all selected rates active.
   - **Disable Rates** – Make all selected rates inactive.
   - **Delete Rates** – Permanently remove the selected rates.

**Reminder:** When the feature is turned on, your workspace must always have at least one active distance rate.

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

