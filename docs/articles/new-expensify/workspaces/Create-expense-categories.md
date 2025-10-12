---
title: Create Expense Categories
description: Add categories to use for coding expenses.
keywords: [New Expensify, expense categories, GL codes, payroll codes, chart of accounts, import categories, expense coding]
---


In Expensify, categories represent your **chart of accounts, GL accounts, expense accounts**, or other financial coding used for reporting and accounting.

Admins can manually create categories for a workspace, or they can be imported automatically when connected to an accounting platform like QuickBooks, Xero, NetSuite, or Intacct. Once imported, categories can be enabled or disabled as needed. Over time, Expensify also learns how you apply categories to specific merchants and suggests them automatically.

![The Categories tab]({{site.url}}/assets/images/ExpensifyHelp_R3_Categories_1.png){:width="100%"}

---

# Manually Add or Delete Categories

## On Web

To add a category:

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **Categories**.
4. Click **Add Category** in the top-right corner.
5. Enter a name and click **Save**.

To delete a category:

1. Click the category from the list.
2. Click the **three-dot menu** in the top-right.
3. Select **Delete category**.

## On Mobile

To add a category:

1. Tap your **profile image or icon** in the bottom-left.
2. Tap **Workspaces** and select a workspace.
3. Tap **Categories**.
4. Tap **Add Category**, enter a name, and tap **Save**.

To delete a category:

1. Tap the category in the list.
2. Tap the **three-dot menu** in the top-right.
3. Tap **Delete category**.

---

# Upload Categories via CSV

## On Web

1. Go to **Workspaces > [Workspace Name] > Categories**.
2. Click the **three-dot menu** and select **Import Spreadsheet**.
3. Format your spreadsheet with all required columns.
4. To download a template, click the **three-dot menu** again and select **Download CSV**.
5. Upload your file and follow the prompts to complete the import.

## On Mobile

1. Tap **Workspaces**, then tap your workspace name.
2. Tap **Categories**.
3. Tap the **three-dot menu** and select **Import Spreadsheet**.
4. Download the example file if needed.
5. Upload your prepared CSV to import categories.

---

# Enable or Disable Categories

Once categories are added (manually or via import), they can be toggled on or off.

## On Web

1. Go to **Workspaces > [Workspace Name] > Categories**.
2. Click any category to open the detail panel.
3. Use the toggle to enable or disable it.

You can also bulk enable, disable, or delete categories:
- Use the checkboxes beside the categories.
- Click the **Selected** dropdown menu in the top-right to choose an action.

## On Mobile

1. Tap **Workspaces**, then your workspace name.
2. Tap **Categories**.
3. Tap a category and use the toggle to enable or disable it.

Bulk actions are also available using the checkboxes and **Selected** dropdown.

**Note:** GL and payroll code import is available on the **Control** plan only.

---

# Add or Edit GL Codes or Payroll Codes

Workspaces on the **Control** plan can assign optional **GL codes** and **payroll codes** to each category. These codes are not visible to members but can be exported for accounting purposes.

To edit these fields:

1. Go to **Workspaces > [Workspace Name] > Categories**.
2. Click a category.
3. To edit a GL code, click the **GL Code** field, update it, and click **Save**.
4. To edit a payroll code, do the same in the **Payroll Code** field.

![In the Workspace > Categories setting, the right-hand panel is open and the GL and Payroll code setting is highlighted.]({{site.url}}/assets/images/workspace_gl_payroll_codes.png){:width="100%"}

---

# Apply Categories Automatically

Expensify will learn your category preferences over time and apply them automatically based on the merchant.

- If you manually change a category, Expensify remembers the update.
- Existing category assignments are not retroactively changed.
- Workspace-level expense rules override automatic category assignments.
- If a category is already set manually, Expensify won’t override it.

---

# FAQ

## Can I Edit Categories on a Submitted Expense Report?

Yes, until an expense is approved or reimbursed. Approvers can also edit categories—even post-approval—by taking control of the report.

## Can I See an Audit Trail of Category Changes?

Yes. When a category is manually edited, the change is logged in the related expense chat.

## What Happens if a Category Is Disabled in My Accounting System?

It will be removed from the workspace’s category list. However, it will remain visible on previously submitted or drafted reports where it was already applied.

## How Can My Employees See the GL Codes?

GL codes are not visible to employees by default. If visibility is required, consider including the GL code in the category name itself.

