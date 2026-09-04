---
title: Create Expense Categories
description: Add categories to use for coding expenses.
keywords: [New Expensify, expense categories, GL codes, payroll codes, chart of accounts, import categories, expense coding, add category from expense, create category inline, receipt requirements, require receipts over, require itemized receipts over, CSV import categories]
internalScope: Audience is Workspace Admins. Covers creating, importing, enabling, and managing expense categories, including GL and payroll codes, receipt requirement columns in CSV import, and inline category creation from the expense flow. Does not cover personal expense rules or accounting integration setup.
---

# Create Expense Categories

In Expensify, categories represent your **chart of accounts, GL accounts, expense accounts**, or other financial coding used for reporting and accounting.

Workspace Admins can create categories manually, or import them automatically when connecting an accounting system such as QuickBooks, Xero, NetSuite, or Sage Intacct. Once categories are available, they can be enabled or disabled as needed. Over time, Expensify also learns how categories are applied to specific merchants and suggests them automatically.

The Categories table displays the category **Name**, **GL Code** (if assigned), the assigned **Approver** (on the Control plan), and whether it's **Enabled** for workspace members to use.

![The Categories tab]({{site.url}}/assets/images/NewExpensify_ManageCategories_1.png){:width="100%"}

---

## How to add or delete categories manually

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Categories**.
3. Select **Add Category** in the top-right corner.
4. Enter a category name and select **Save**.

To delete a category:
1. Click the category from the list.
2. Click the **three-dot menu** in the top-right corner.
3. Select **Delete category**.

---

## How to add a category while creating or editing an expense

Workspace Admins can also create a new category directly when creating or editing an expense, without navigating to workspace settings first. This option is available when no accounting integration is connected to the workspace.

1. While creating or editing an expense, tap the **Category** field.
2. Tap the **+** icon in the top-right corner.
3. Enter a category name.
4. Tap **Save**.

The new category is immediately applied to the expense and added to the workspace's category list.

---

## How to upload categories using a CSV file

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Categories**.
3. Click the **three-dot menu**, then select **Import Spreadsheet**.
4. Format your spreadsheet using the supported columns listed below.
5. Download the template using **Download CSV** if needed.
6. Upload your completed file and follow the prompts to map each column.

The following columns are supported:

| Column | Required | Plan |
|---|---|---|
| **Name** | Yes | All |
| **Enabled** | No | All |
| **GL Code** | No | Control |
| **Require receipts over** | No | Control |
| **Require itemized receipts over** | No | Control |

For the **Require receipts over** and **Require itemized receipts over** columns, use one of the following values:

- `default` — Keep the existing workspace or category setting (no change).
- `required` — Always require a receipt (or itemized receipt), regardless of amount.
- `not_required` — Never require a receipt (or itemized receipt).
- A number (e.g., `2500`) — Require a receipt (or itemized receipt) for expenses over that amount in cents.

---

## How to enable or disable categories

Once categories are added (manually or via import), they can be toggled on or off.

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Categories**.
3. Click a category.
4. Use the toggle to enable or disable it.

Bulk actions are available using the checkboxes and **Selected** menu.

**Note:** GL and payroll code import is available on the Control plan only.

---

## How to add or edit GL codes or payroll codes

Workspaces on the Control plan can assign optional GL codes and payroll codes to each category. Payroll codes are not visible to members. GL codes are hidden from members by default but can be shown by enabling **Show GL codes when categorizing expenses**. Both codes can be exported for accounting purposes.

To add a GL code or payroll code to a category:

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Categories**.
3. Select a category to open it's detail panel.
4. Input a number in the **GL Code** or **Payroll Code** field.
5. Select **Save**.

![In the Workspace > Categories setting, the right-hand panel is open and the GL and Payroll code setting is highlighted.]({{site.url}}/assets/images/NewExpensify_ManageCategories_2.png){:width="100%"}

---

## How to show GL codes to members when categorizing expenses

Workspaces on the Control plan that have GL codes assigned to categories can display those GL codes to members when categorizing expenses.

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Categories**.
3. Select **More**.
4. Select **Settings**.
5. Enable **Show GL codes when categorizing expenses**.

Once enabled, the GL code appears next to each category name when categorizing expenses. This setting is only available when categories are enabled and at least one category has a GL code assigned.

---

## How to configure Category Rules

Category Rules let you control how specific categories behave. You can require additional information, assign approvers, or set spending thresholds for individual categories.

To manage Category Rules:

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Categories**.
3. Select a category to open its settings panel.

Available Category Rule options include:

- **Approver** – Assign a specific approver for expenses in this category.
- **Default tax rate** – Set a default tax percentage ([Taxes](https://help.expensify.com/articles/new-expensify/workspaces/Track-Taxes) must be enabled on the workspace).
- **Flag amounts over** - Set a spending cap for this category.
- **Require receipts over** – Set a threshold for when receipts are required.
- **Require itemized receipts over** – Require itemized receipts for expenses over a specific amount.
- **Require fields** - Require specific fields be completed for this category. The options are:
   - **Require description** - Force members to enter a reason when using the category.
   - **Require attendees** - Force members to add additional attendees when using the category.

Category Rules apply to all members who use that category. If both a Category Rule and a Workspace Rule apply to the same expense, the Category Rule takes priority.

---

## How to apply categories automatically

Expensify offers two ways to automatically apply categories based on merchant:

## How learned categorization works

Expensify learns your category preferences over time and suggests them automatically based on the merchant.

- If you manually change a category, Expensify remembers the update.
- Existing expenses are not updated retroactively.
- These suggestions are based on patterns and may vary by user.

## How to set default categories by MCC code

Expensify can automatically assign a default category based on the merchant's MCC (Merchant Category Code). For example, you can set all airline expenses to default to a "Flights" category.

To manage MCC default categories:

1. In the navigation tabs (on the left on web, at the bottom on mobile), select **Workspaces > [workspace name]**.
2. Select **Categories**.
3.  Click **More**
4. Click **Settings**. 
5. Update the default category for any MCC group (e.g., Airlines, Gas, Groceries).

## Workspace Merchant Rules

Workspace Admins can configure [**Workspace Merchant Rules**](https://help.expensify.com/articles/new-expensify/workspaces/Workspace-Merchant-Rules) to apply consistent categories based on merchant name across all workspace members.

- Rules apply across all expenses on the workspace.
- Rules take precedence over learned suggestions.
- If a category is already set manually, Expensify won't override it.

---

# FAQ

## Can I edit categories on a submitted expense report?

Yes, until an expense is approved or reimbursed. Approvers can also edit categories—even post-approval—by taking control of the report.

## Can I see an audit trail of category changes?

Yes. When a category is manually edited, the change is logged in the related expense chat.

## What happens if a category is disabled in my accounting system?

It will be removed from the workspace’s category list. However, it will remain visible on previously submitted or drafted reports where it was already applied.

## What happens to an expense if its category is disabled on the workspace?

If categories are disabled on the workspace while an expense still has a category applied, the **Category** field stays on the expense with a **Category no longer valid** violation.

To resolve the violation, select the **Category** field on the expense. A **Category disabled** alert appears with options for managing the disabled category.

Alternatively, you can enable tags on the workspace to edit the category directly.

## How can members see GL codes?

GL codes are hidden from members by default. On the Control plan, a Workspace Admin can make them visible by going to **Workspaces > [Workspace name] > Categories > More > Settings** and enabling **Show GL codes when categorizing expenses**. Once enabled, the GL code appears next to each category name when categorizing expenses.

