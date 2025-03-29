---
title: Create categories
description: Use categories to classify and organize expenses
keywords: [Expensify Classic, categories, categorize expenses]
---
<div id="expensify-classic" markdown="1">

Categories help you classify expenses by type. Expensify automatically provides default categories like fees, office supplies, travel, and more.

You can enable, turn off, edit, or delete the default categories. You can also add or import your own custom categories and create subcategories under existing ones.

---

# Manually Add Categories

1. Head to **Settings > Workspace > Group > [Workspace Name] > Categories**
2. Scroll to the bottom of the Categories section.
3. Enter the category name in the **Add a Category** field and click **Add**.

---

# Automatically Import Categories via Accounting Integration

When integrating with an accounting system, Expensify automatically imports general ledger accounts as categories (e.g., QuickBooks Online, QuickBooks Desktop, Sage Intacct, Xero, or NetSuite).

To update categories that are imported from an accounting integration:
1. In your accounting system, update the category details.
2. In Expensify, head to **Settings > Workspace > Group > [Workspace Name] > Connections**.
3. Click **Sync Now**.

You can learn about accounting integration category settings by selecting your accounting integration [here](https://help.expensify.com/expensify-classic/hubs/connections/) and reviewing the corresponding configuration resource. 

---

# Import Custom Categories

You can import a list of categories using a **.csv, .txt, .xls, or .xlsx** file.

1. Create a spreadsheet with at least one column for the **Category Name**. You can also include:
   - GL Code
   - Payroll Code
   - Enabled (TRUE/FALSE)
   - Max Expense Amount
   - Receipt Required
   - Comments (Required/Not Required)
   - Comment Hint
   - Expense Limit Type
2. In Expensify, head to **Settings > Workspace > Group > [Workspace Name] > Categories**
3. Click **Import from Spreadsheet**.
4. Review the guidelines, select the checkbox if your file has headers in the first row, and click **Upload File**.

⚠️ **Important:** Each new import **overwrites** the existing category list. To avoid losing data, update your current spreadsheet before re-importing.

---

# Add Subcategories

You can create subcategories under a main category. For example, "Flight" and "Lodging" can be subcategories under "Travel."

1. Head to **Settings > Workspace > Group > [Workspace Name] > Categories**
2. Scroll to the **Add a Category** field.
3. Enter the main category name, followed by a colon, then the subcategory name (e.g., `Travel: Flight`).
4. Click **Add**. Repeat for additional subcategories.

When an expense is created, the new subcategories will appear as a dropdown list under the category. The text before the colon will show as the category header (which will not be selectable). The member will have to select an item from the subcategories to add it to the expense.

---

# Manage Default Categories

Once you manually add categories or import them from a connected accounting system, you can control their visibility and settings:
1. Head to **Settings > Workspace > Group > [Workspace Name] > Categories**
2. Manage categories as needed:
   - **Enable/disable**: Click the toggle next to a category. Use the toggle at the top to turn all categories on/off at once.
   - **Edit**: Click the category name and enter a new name.
   - **Delete**: Click the **X** next to a category.

⚠️ **Note:** Importing GL and payroll codes from your accounting system is only available on the Control plan.

</div>
