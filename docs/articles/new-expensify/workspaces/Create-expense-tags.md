---
title: Create Expense Tags
description: Add tags to use for coding expenses.
keywords: [New Expensify, expense tags, class tracking, cost center, import tags, coding expenses, tag GL code]
---

In Expensify, **tags** represent attributes like classes, projects, cost centers, locations, customers, or jobs. They help code expenses for accounting and reporting.

Admins can manually create one level of tags or multiple levels of tags for a workspace, or they can be imported automatically if your workspace is connected to an accounting system like QuickBooks Online, Intacct, Xero, or NetSuite. Once added, tags can be enabled or disabled. Expensify also learns your tag preferences for merchants and applies them automatically.

![The Tags tab]({{site.url}}/assets/images/ExpensifyHelp_R4_Tags_2.png){:width="100%"}

---

# Enable Tags

Before you can manage tags, you need to enable the **Tags** feature for your workspace.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your **workspace name**.
3. Click **More Features** in the left menu.
4. In the **Organize** section, toggle on **Tags**.

![The toggle to enable Tags]({{site.url}}/assets/images/ExpensifyHelp_R4_Tags_1.png){:width="100%"}

---

# Add Tags

## Manually Add A Single Tag

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Click **Add Tag** at the top of the page.
3. Enter a name and click **Save**.

## Import A Single Level Of Tags From A Spreadsheet

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Click **More > Import spreadsheet** (or if you haven't added any tags yet, just click **Import** from the main Tags settings page).
3. Click **Single level of tags**.
4. Click **Choose File** and select the file to import.
5. Toggle the "File contains column headers" on or off accordingly, then select which spreadsheet column should be mapped to which tag field. We require columns Name and Enabled, and you can optionally include a column for Tag GL Code.
6. Click **Import** to finish importing the tags.


## Import Multi-Level Tags From A Spreadsheet

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Click **More > Import spreadsheet** (or if you haven't added any tags yet, just click **Import** from the main Tags settings page).
3. Click **Multi-level tags**.
4. Click **Choose File** and select the file to import.
5. Use the toggles to indicate whether the first row contains the title for each tag level, whether these are independent or dependent tags, and whether each level of tags has a GL Code in the adjacent column. More details on dependent vs independent tags below.
6. Click **Import**.

You can use one of the following template files to build your tags list:

- [Dependent tags with GL codes](https://help.expensify.com/assets/Files/Dependent+with+GL+codes+format.csv)
- [Dependent tags without GL codes](https://help.expensify.com/assets/Files/Dependent+without+GL+codes+format.csv)
- [Independent tags with GL codes](https://help.expensify.com/assets/Files/Independent+with+GL+codes+format.csv)
- [Independent tags without GL codes](https://help.expensify.com/assets/Files/Independent+without+GL+codes+format.csv)

**Notes:**
- We currently only support uploading CSV and TSV files for multi-level tag files.
- We currently only support up to 50,000 tags in a single file.
- Each time you upload a list of tags, it will override your previous list. To avoid losing tags, update the original spreadsheet and re-import it into Expensify.

# Delete Tags

To remove individual tags from a multi-level tag setup, you will need to upload a new file. If you have a single level of tags in your workspace, then you can manually delete individual tags.

## On Web

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Select the tag or tags you would like to delete.
3. Click "# selected" at the top-right of the page.
4. Click **Delete tag**.

## On Mobile

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Tap into the tag you would like to delete.
3. Tap **Delete**.
4. Confirm the action by tapping "Delete".

---

# Activate or Deactivate Tags

Once tags are created manually or imported from an accounting system, you can enable or disable individual tags according to your team's needs.

## On Web

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Click a tag to open its settings.
3. Use the toggle to make the tag active or inactive.

To manage tags in bulk:
- Use the checkboxes to select tags.
- Click the **Selected** dropdown to apply actions like activate, deactivate, or delete.

## On Mobile

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Select a tag.
3. Use the toggle to make the tag active or inactive.

**Note:** Tags imported from an accounting system are added as **inactive** by default and must be turned on manually.

---

# Add or Edit a GL Code

If you're on the **Control** plan, you can assign a GL code to each tag for exporting purposes. These GL codes are not visible to workspace members.

To add or edit a GL code:

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Click a tag to open its detail panel.
3. Click the **GL Code** field, enter or update the code, then click **Save**.

---

# Apply Tags to Expenses Automatically

Expensify will learn how you use tags and apply them automatically for recurring merchants or patterns.

- Manual corrections are remembered over time.
- Existing tags on an expense will not be overwritten automatically.
- Workspace-level Expense Rules take priority over automated tag suggestions.

---

# FAQ

## Can I Edit Tags on a Submitted Expense Report?

Yes. You can edit tags until the expense is approved or reimbursed.

Approvers can also edit tags, even post-approval, by taking control of the report.

## Can I See an Audit Trail of Tag Changes?

Yes. When a tag is manually changed, the update is logged in the associated expense chat.

## What Happens if a Tag Is Disabled in My Accounting System?

It will be removed from the workspace’s tag list. However, it will still appear on any expenses or reports where it was already applied.

## Why can’t I see a multi-level tags option on my workspace?

If you are connected to an accounting integration, you will not see this feature. You will need to add those tags in your accounting system first, then sync the connection.

