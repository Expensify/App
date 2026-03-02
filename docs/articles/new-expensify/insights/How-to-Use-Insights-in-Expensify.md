---
title: How to Use Insights in Expensify
description: Learn how to use Insights to analyze spending trends and make data-driven financial decisions in New Expensify.
keywords: [New Expensify, Insights, spending analysis, expense reports, analytics, Top Spenders, Top Categories, Top Merchants, Spend over time, financial insights, budget analysis, expense trends]
internalScope: Audience is all workspace members. Covers how Insights reports work, how to access them, available report types, grouping logic, view modes, exporting data, and customization. Does not cover troubleshooting individual reports.
---

# How to Use Insights in Expensify

Insights are pre-built reports that help you understand spending patterns and trends without exporting data or creating complex custom searches. Each Insight is a suggested search that groups and analyzes your expense data automatically.

---

## Who can use Insights

Anyone can use Insights. What you can see depends on your role in the workspace.

- Regular members can view Insights that include their own submitted expenses.
- Approvers can view Insights that include their own expenses plus expenses submitted to them for approval.
- Workspace Admins can view Insights that include all workspace expenses.
- Auditors can view Insights that include all workspace expenses.

Insights always respect workspace permissions. You will only see data you’re allowed to access.

## Where to find Insights

You can access Insights on both web and mobile.

1. Click **Reports** in the navigation tabs (on the left on web, or on the bottom on mobile).
2. Scroll to **Insights**. 
3. Select an Insight to open the report.

---

# Available Insights

## Spend over time

Spend over time shows how total expenses change across a selected date range.

You can use Spend over time to:

 - Monitor overall spending trends
 - Identify increases or decreases in expenses
 - Compare spend across months or custom date ranges
 - Track seasonal or recurring spending patterns
 - Support budgeting and forecasting decisions

[Learn more about the Spend over time report](https://help.expensify.com/articles/new-expensify/insights/View-the-Spend-over-time-report). 

## Top Spenders

Top Spenders shows which members submitted the highest total expenses in the previous calendar month.

You can use Top Spenders to: 

- Identify unusually high spenders
- Monitor employee-level spending patterns
- Evaluate policy compliance
- Support reimbursement and approval reviews

[Learn more about the Top Spenders report](https://help.expensify.com/articles/new-expensify/insights/View-the-Top-Spenders-report).

---

## Top Categories 

Top Categories shows which expense categories had the highest total spend in the previous calendar month.

You can use Top Categories to: 

- Understand where most money is being spent by expense type
- Compare spending across categories like Travel, Meals, and Office Supplies
- Make budget allocation decisions

[Learn more about the Top Categories report](https://help.expensify.com/articles/new-expensify/insights/View-the-Top-Categories-report)

---

## Top Merchants

Top Merchants shows which merchants or vendors received the highest total payments in the previous calendar month.

You can use Top Merchants to: 

- Track vendor spending trends
- Identify opportunities for volume discounts
- Monitor subscription and recurring expenses

[Learn more about the Top Merchants report](https://help.expensify.com/articles/new-expensify/insights/View-the-Top-Merchants-report)

---

## How Insights work

Each Insight is powered by Expensify's search query engine using grouping filters and operators to: 

- Automatically group expenses by relevant dimensions (employee, category, merchant, time period)
- Calculate totals and counts
- Sort results to show the highest values first
- Update dynamically as new expenses are added

---

## How to switch between views in Insights

Insights support four viewing modes:

**Bar View**
Displays grouped results as a bar chart. This is the default view for **Top categories** and makes comparisons easy at a glance.

**Table View**
Displays grouped data in rows and columns for more detailed analysis. This is the default view for **Top spenders** and simplifies side-by-side comparisons. 

**Line View**
Displays grouped data in a line chart for analyzing trends. This is the default view for **Spend over time** and helps you monitor changes and patterns.

**Pie view**
Displays grouped data as a pie chart to show proportional distribution. This is the default for **Top merchants** and helps you understand distribution instantly.

---

To switch views:

1. Open any Insight.
2. Click **View** in the top navigation.
3. Select **Table**, **Bar**, **Line** or **Pie**.

---

## How to customize Insights

While you can't modify the suggested Insight searches directly, you can:

- Apply additional date filters
- Filter by workspace or member
- Expand groups to view individual expenses
- Export data to CSV
- Save a modified search

## How to create a custom spending report using Insights

If you want to build your own grouped report:

1. Open an Insight as your starting point.
2. Modify the filters to match your needs.
3. Adjust the date range if needed.
4. Click **Save search** to store your custom version.

This allows you to automate recurring analysis without rebuilding the search each time.

[Learn how to use search operators and grouping](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Using-search-operators)

---

## How to export data from an Insight

Insights cannot export grouped totals directly. However, you can export the underlying expenses.

To export Insight data:

1. Open the Insight.
2. Expand a group to show individual expenses.
3. Select the expenses you want to export.
4. Click **Export to CSV**.

This is helpful for external reporting or sharing detailed data with finance teams.

---

## Grouping options used in Insights

Insights use grouping operators to summarize expenses. These include:

- **group-by:from** - Group by employee (who submitted)
- **group-by:category** - Group by expense category
- **group-by:merchant** - Group by merchant or vendor
- **group-by:tag** - Group by expense tags
- **group-by:month** - Group by calendar month
- **group-by:week** - Group by calendar week
- **group-by:quarter** - Group by fiscal quarter
- **group-by:year** - Group by calendar year

You can use these operators in custom searches to create your own insights and analyze spending from different perspectives.

[View all available search operators](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Using-search-operators)

---

# FAQ

## Can I export grouped totals from Insights in Expensify?

No. Grouped totals cannot be exported directly. You must expand each group and export the individual expenses as a CSV file.

---

## How often do Insights update in Expensify?

Insights update in realtime as expenses are created, edited, approved, or reimbursed.

---

## Can I change the time period in Insights?

Yes. Use date filters to adjust the time period.

Common filters include:

- `date:this-month`
- `date:last-month`
- `date:year-to-date`
- Custom date ranges
