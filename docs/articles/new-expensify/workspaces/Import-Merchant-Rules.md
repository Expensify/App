---
title: Import Merchant Rules using a spreadsheet
description: Learn how to bulk-create Merchant Rules by importing a spreadsheet, how Tag values are interpreted for single-level and multi-level tags, and how Updated vendor cells are matched to your vendor list.
keywords: [New Expensify, import merchant rules, merchant rules spreadsheet, bulk merchant rules, import rules CSV, workspace rules, multi-level tags import, updated vendor column, vendor skipped import]
internalScope: Audience is Workspace Admins on the Control plan with Rules enabled. Covers bulk-creating Merchant Rules by importing a spreadsheet, how Tag cells are interpreted for single-level and multi-level tags, and how Updated vendor cells are matched to the workspace vendor list. Does not cover creating Merchant Rules manually, personal expense rules, importing tags themselves, or setting up vendor matching for an accounting connection.
---

# Import Merchant Rules using a spreadsheet

Importing a spreadsheet lets Workspace Admins create many Merchant Rules at once instead of adding them one at a time. Map each column in your file to a merchant rule field, and Expensify creates a rule for every row so matching expenses are automatically coded.

---

## Who can import Merchant Rules

To import Merchant Rules, you must be:

- A Workspace Admin.
- On a workspace with **Rules** enabled (available on the Control plan).

If **Rules** is not enabled, [learn how to enable Workspace Rules](/articles/new-expensify/workspaces/Workspace-Rules#how-to-enable-workspace-rules).

The **Updated vendor** field is offered only on a workspace where vendor matching is active, which requires an accounting connection that assigns vendors to company card expenses. Learn more about [vendor matching for QuickBooks Online](/articles/new-expensify/connections/quickbooks-online/Manage-Vendor-Matching-for-QuickBooks-Online).

---

## How to import Merchant Rules using a spreadsheet

Prepare a spreadsheet where each row is one rule. Include a column for the merchant to match and a column for each field you want the rule to update (for example, Tag).

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Workspaces > [workspace name]**.
2. Click **Rules**.
3. Open the **Expense defaults** tab.
4. Click **More**, then select **Import merchant rules**.
5. Upload your spreadsheet file.
6. Map each column to a merchant rule field. Map the merchant column to **Merchant is** or **Merchant contains**, and map at least one field to update, such as **Updated merchant**, **Updated category**, **Updated tag**, **Updated description**, or **Updated vendor**.
7. Click **Import**.

<!-- SCREENSHOT:
Suggestion: The column-mapping screen with a spreadsheet column mapped to Merchant is and another mapped to Updated tag.
Location: After step 6.
Purpose: Confirms admins are on the correct mapping screen and shows how to pair a spreadsheet column with a specific merchant rule field, which is the step most likely to cause confusion.
-->

You must map at least one **Merchant is** or **Merchant contains** column plus at least one field to update, or the import can't complete.

---

## How Tag values are interpreted when importing Merchant Rules

How a colon in a Tag cell is read depends on how your workspace tags are set up **at the time of import**, so set up your tags before importing. Learn more about [expense tags](/articles/new-expensify/workspaces/Create-and-manage-expense-tags).

- **Workspace with multi-level tags:** A colon separates tag levels. A Tag cell of `Parent: Child` is imported as a multi-level tag with the first level set to `Parent` and the second level set to `Child`. Any spaces around the colon are trimmed.
- **Workspace with a single-level tag list:** A colon is part of the tag name. A Tag cell of `ab:cd` is imported as one tag named `ab:cd`.

---

## How Updated vendor values are matched when importing Merchant Rules

An **Updated vendor** cell holds the vendor's name, and Expensify matches that name against the vendor list imported from your accounting connection.

- Matching ignores capitalization and trims spaces around the name, so a cell of `starbucks ` matches a vendor named `Starbucks`.
- A vendor cell is skipped when no vendor in the workspace has that name, or when more than one vendor shares that name. The row's other updates still import.
- If **Updated vendor** was the only field the row updated, the whole row is skipped and no rule is created for it.

Sync your accounting connection before importing so the vendor list Expensify matches against is current.

---

## What happens after you import Merchant Rules

- A confirmation message shows how many Merchant Rules were added.
- Rules that duplicate an existing rule are skipped.
- If any **Updated vendor** cells didn't match a vendor, the confirmation message also reports how many vendors were skipped.
- Each new rule appears on the **Expense defaults** tab of the **Rules** page and is applied to matching expenses going forward.

---

# FAQ

## Why did some rows not import as Merchant Rules?

A row is skipped when it duplicates an existing rule, when the required columns aren't mapped, or when the only field it updated was an **Updated vendor** value that didn't match a vendor in the workspace. Make sure you mapped a **Merchant is** or **Merchant contains** column plus at least one field to update.

## Why was the vendor skipped on some imported Merchant Rules?

A vendor is skipped when the name in the **Updated vendor** cell doesn't match any vendor in your workspace, or when two or more vendors share that name, so Expensify can't tell which one you meant. The rule still imports with its other updates.

Check the spelling against your vendor list, then sync your accounting connection and import the remaining rows again.

## Why did my imported Tag value display differently than expected?

Tag cells are interpreted based on your workspace tag setup at the time of import. On a workspace with multi-level tags, a colon splits the value into tag levels; on a workspace with a single-level tag list, the colon stays part of the tag name. Set up your tags before importing so the values are read the way you intend.

## Can I name my spreadsheet column Updated supplier instead of Updated vendor?

Yes. A column headed either `Updated vendor` or `Updated supplier` is detected automatically when you upload the file. The field you map it to is called **Updated vendor** on every workspace, including a workspace connected to Xero, where the rule itself shows the value as **Supplier**.

## Can I import Merchant Rules on mobile?

Yes. You can import Merchant Rules on both web and mobile from the **Rules** page. On a smaller screen you choose the file rather than drag and drop it.
