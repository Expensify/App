---
title: Set Distance Rates
description: Set and manage distance rates for mileage reimbursement in your Expensify workspace.
keywords: [New Expensify, distance rates, mileage reimbursement, enable distance rates, workspace settings, bulk edit rates]
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
4. (Optional) Set a **Start date** and **End date** to define the period the rate applies to. Leave these blank if the rate has no time limit.
5. Click **Save**.

When a rate has a **Start date** or **End date**, Expensify uses it to apply the correct rate based on the expense date. See [How Expensify selects a rate when multiple rates exist](#how-expensify-selects-a-rate-when-multiple-rates-exist) below.

## Edit, Make Inactive, or Delete a Single Rate

1. From the **Distance Rates** page, click on the rate you'd like to update.
2. To **make the rate active or inactive**, toggle the **Enable Rate** switch, then click **Save**.
3. To **edit** the rate amount, click the value field, enter the new number, and click **Save**.
4. To **update the effective dates**, click the **Start date** or **End date** field, choose a new date, and click **Save**.
5. To **permanently delete** the rate, click **Delete**.

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

# How Expensify Selects a Rate When Multiple Rates Exist

When a workspace has more than one distance rate, Expensify automatically applies the rate that matches the expense date. This lets you keep multiple rates active at once — for example, last year's mileage rate and this year's updated rate.

- When a member creates or edits a distance expense, Expensify selects the rate whose **Start date** and **End date** range includes the expense date.
- If a member manually selects a rate that isn't valid for the expense date, the expense shows a violation indicating the rate doesn't match the selected date. This is informational and does not block submission.

**Note:** Setting effective dates is optional. If your rates don't have **Start date** or **End date** values, Expensify continues to apply rates as before.

