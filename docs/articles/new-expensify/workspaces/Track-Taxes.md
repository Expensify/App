---
title: Track Taxes
description: Set up and manage tax rates in your Expensify workspace for non-USD currencies.
keywords: [New Expensify, tax rates, VAT, GST, QST, PST, expense tax codes, foreign currency taxes, workspace settings]
---

Workspaces on **Collect** and **Control** plans can add tax rates to track VAT, GST, or other regional taxes. Tax rates are applied by default based on currency, but can also be manually selected per expense.

**Note:** If your workspace uses a direct accounting integration (like QuickBooks, Xero, or NetSuite), you must manage tax rates within that system, not in Expensify.

---

# Enable Taxes in a Workspace

To enable tax tracking in a workspace:

1. In the **navigation tabs** on the left (web) or bottom (mobile), click Workspaces.
2. Click your **workspace name**.
3. Click **More Features**.
4. Under the **Spend** section, toggle on **Taxes**.

Once enabled, a new **Taxes** section will appear in the left-hand menu.

**Note:** Taxes can only be enabled in workspaces where the default currency is not USD.

---

# Add, Edit, or Delete Tax Rates

Once the **Taxes** feature is enabled, you can create and manage tax rates.

## Add a Tax Rate

1. Go to **Workspaces > [Workspace Name] > Taxes**.
2. Click **Add Rate** in the top-right corner.
3. Enter a **Name**, **Value**, and **Tax Code**.
4. Click **Save**.

## Edit, Make Inactive, or Delete a Single Tax Rate

1. Click the tax rate you want to edit.
2. Use the toggle to **make it active or inactive**, then click **Save**.
3. To edit the name, value, or code, click the field, make changes, and **Save**.
4. To permanently remove the rate, click **Delete**.

**Note:** The **workspace default currency tax rate** cannot be removed or made inactive.

## Bulk Edit or Delete Tax Rates

1. On the **Taxes** page, select the checkboxes next to the rates you want to modify.
2. Click **X selected** in the top-right menu.
3. Choose one of the following actions:
   - **Enable Rates** – Mark selected rates as active.
   - **Disable Rates** – Mark selected rates as inactive.
   - **Delete Rates** – Permanently remove selected tax rates.

**Note:** The workspace’s default tax rate must remain active and cannot be removed.

---

# Change Default Tax Rates

You can set separate default tax rates for:

- **Workspace Currency** – Used for expenses in the workspace’s default currency.
- **Foreign Currency** – Used for expenses in any other currency.

To update these defaults:

1. Go to **Workspaces > [Workspace Name] > Taxes**.
2. Click **Settings** in the top-right.
3. Choose **Workspace Currency Default** or **Foreign Currency Default**.
4. Select the desired tax rate.

# FAQ

## How do I set up multiple taxes (GST/PST/QST) for indirect connections?

Expenses sometimes have more than one tax applied to them (for example, in Canada, expenses can have both a Federal GST and a provincial PST or QST). 

To handle multiple tax rates, you can create a new tax rate that combines both into a single rate. For example, if you have a GST of 5% and PST of 7%, you can add them together and create a new tax rate of 12%.

You can generate a CSV from the Reports page containing all the expense information, including the split-out taxes, by going to the Reports tab, clicking **Export To**, and selecting **Tax Report**. 

## How do I handle the taxes for a receipt that includes more than one tax rate?

If your receipt includes more than one tax rate, there are two ways you can handle the tax rate:

- Many tax authorities do not require reporting tax amounts by rate; therefore, you can apply the highest rate on the receipt and then modify the tax amount on the receipt if necessary. Please check with your tax advisor to determine if this approach suits you.
- Alternatively, you can apply each specific tax rate by splitting the expense by the applicable costs for each rate. To do this, open the expense and click **Split Expense**. Then, apply the correct tax rate to each.

## What if my workspace has multiple tax rates?

You'll have the option to change the tax rate from within the expense as needed.

## What should I do if the tax amount on my expense is missing or incorrect?

In Expensify, tax is *inclusive*, meaning it's already part of the total amount shown. If the tax amount doesn't show up on your receipt or is different from the calculated amount, you can manually type in the correct amount.

To determine the inclusive tax from a total price that already includes tax, you can use the following formula:

**Tax amount = (Total price x Tax rate) ÷ (1 + Tax Rate)**

For example, if an item costs $100  and the tax rate is 20%:
Tax amount = (**$100** x .20) ÷ (1 + .**20**) = **$16.67**
This means the tax amount of $16.67 is included in the total.

If you are simply trying to calculate the price before tax, you can use the formula: 

**Price before tax = (Total price) ÷ (1 + Tax rate)**
