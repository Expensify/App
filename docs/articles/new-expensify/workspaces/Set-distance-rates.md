---
title: Set Distance Rates
description: Set and manage distance rates for mileage reimbursement in your Expensify workspace.
keywords: [New Expensify, distance rates, mileage reimbursement, enable distance rates, workspace settings, bulk edit rates, exclude commutes, commute exclusion]
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

1. Go to **Workspaces > [Workspace Name] > Distance Rates**.
2. Click **Add Rate** in the top-right corner.
3. Enter the rate value (e.g., $0.585 per mile or km).
4. (Optional) Set a **Start date** and **End date** to define the period the rate applies to. Leave these blank if the rate has no time limit.
5. Click **Save**.

When a rate has a **Start date** or **End date**, Expensify uses it to apply the correct rate based on the expense date. See [How Expensify selects a rate when multiple rates exist](#how-expensify-selects-a-rate-when-multiple-rates-exist) below.

---

## How to edit Distance rate settings

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace name]**.
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

**Note:** If **Taxes** is enabled on the Workspace, each Distance rate can be associated with a tax rate and a tax reclaimable amount. The selected tax rate is automatically applied when the Distance rate is used on an expense. To track **Taxes** on a Workspace, [learn how to track Taxes](/articles/new-expensify/workspaces/Track-Taxes).

---

## How to remove Distance rates

To prevent members from using a Distance rate, you can either disable it or delete it.

- Disabled rates remain in the Workspace but cannot be selected on new Distance expenses.
- Deleted rates are permanently removed.

1. In the navigation tabs (on the left on web, and at the bottom on mobile), click **Workspaces > [Workspace name]**.
2. Click **Distance rates**.
3. Select each rate you want to disable or delete.
4. Click **Selected**
5. Choose **Disable rates** or **Delete rates**.

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

---

## How Expensify Selects a Rate When Multiple Rates Exist

When a Workspace has more than one distance rate, Expensify automatically applies the rate that matches the expense date. This lets you keep multiple rates active at once — for example, last year's mileage rate and this year's updated rate.

- When a member creates or edits a Distance expense, Expensify selects the rate whose **Start date** and **End date** range includes the expense date.
- If a member manually selects a rate that isn't valid for the expense date, the expense shows a violation indicating the rate doesn't match the selected date. This is informational and does not block submission.

**Note:** Setting effective dates is optional. If your rates don't have **Start date** or **End date** values, Expensify continues to apply rates as before.

---

# Exclude Commutes from Distance Rate Claims

Workspace Admins can deduct a member's regular commute from each distance claim, so that only business-related mileage is reimbursed. This is useful when members submit distance expenses from their home and you don't want to reimburse the portion of the trip that covers their normal commute.

## How to set a commute exclusion on distance rates

1. Go to **Workspaces > [Workspace Name] > Distance Rates**.
2. Click **Settings**.
3. Click **Exclude commutes**.
4. Choose how commutes are handled:
   - **Do not exclude commutes** – No commute exclusion is applied.
   - **Exclude a fixed distance per claim** – Removes the same commute distance from each claim. Best for members who submit one claim per workday.
5. If you selected **Exclude a fixed distance per claim**, enter the amount in the **Distance** field. The distance must be greater than 0.
6. Click **Save**.

<!-- SCREENSHOT:
Suggestion: Show the Exclude commutes page with "Exclude a fixed distance per claim" selected and a value in the Distance field.
Location: After the steps in "How to set a commute exclusion on distance rates"
Purpose: Help admins confirm they are on the correct page and selecting the right option.
-->

## What happens after you set a commute exclusion

When **Exclude a fixed distance per claim** is selected, the distance you entered is subtracted from each distance claim before reimbursement is calculated. The deduction applies per claim, so it works best for members who submit one distance claim per workday.

To stop excluding commutes, return to the **Exclude commutes** page, select **Do not exclude commutes**, and click **Save**.

