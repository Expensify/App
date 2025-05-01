---
title: Setting Up Report Currency
description: Define a currency in your workspace's settings.
keywords: [Expensify Classic, workspace currency, expense conversion, report output currency]
---
<div id="expensify-classic" markdown="1">
  
As a workspace admin, you can choose a default currency for your employees' expense reports, and Expensify will automatically convert any expenses into that currency.  

**Key Considerations:**
- The currency setting applies to **all expenses** within a workspace.
- If different employees need different default currencies, create **separate workspaces** for them.
- Admin-set workspace currency **overrides** individual user settings.

---

# Select or Update the Currency on a Workspace

## As an Admin on a Company Workspace

You must be a Workspace Admin to update the currency settings for a company workspace. 

1. Sign in to your Expensify web account.
2. Go to **Settings > Workspace > [Workspace Name] > Overview > Default currency**.
3. Adjust the **Report Output Currency** using the drop-down menu.

## On an Individual Workspace

1. Sign in to your Expensify web account.
2. Go to **Settings > Workspaces > [Workspace Name] > Overview > Report Currency**.
3. Adjust the **Report Output Currency** using the drop-down menu.

**Note:** The currency setting on an individual workspace is overridden when a report is submitted on a company workspace.

---

# Currency Conversion Rates

- Expensify uses **Open Exchange Rates** to convert expenses.
- Expenses are converted using the **daily average rate** on the date of purchase.
- If the markets are closed (e.g., on weekends), the most recent available rate is used.
- Future-dated expenses will reflect the latest available exchange rate until the transaction occurs.

---

# Managing Multiple Currencies Across Locations

If your employees submit reports in various currencies, the best approach is to:

- **Create separate workspaces** for different regions or currencies.
- Set each workspace’s default currency to match the **reimbursement currency**.

**Example:** If you have employees in the US, France, Japan, and India:
- Create **four separate workspaces**.
- Assign employees to their respective workspaces.
- Set the workspace currency to **USD, EUR, JPY, and INR**, respectively.

---

# FAQ

## I have expenses in multiple currencies. How will they appear on a report?
Each expense is recorded in its original currency. Expensify automatically converts it to the **workspace’s default currency** in the final report.

## How does currency affect the conversion rate?
Foreign currency expenses are converted using the **daily average trading rate** from [Open Exchange Rates](https://openexchangerates.org/). If needed, you can manually enter expenses in your default currency to bypass automatic conversion.

</div>
