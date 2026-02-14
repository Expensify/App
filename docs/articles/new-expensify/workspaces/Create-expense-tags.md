---
title: Create Expense Tags
description: Add tags to use for coding expenses.
keywords: [New Expensify, expense tags, class tracking, cost center, import tags, coding expenses, tag GL code]
internalScope: Audience is Workspace Admins. Covers enabling, creating, importing, activating, and managing expense tags, including multi-level tags and tag GL codes. Does not cover personal expense rules or accounting system configuration.
---

In Expensify, **tags** represent attributes like classes, projects, cost centers, locations, customers, or jobs. They help code expenses for accounting and reporting.

Workspace Admins can create tags manually, import them from a spreadsheet, or sync them from an accounting system like QuickBooks Online, Intacct, Xero, or NetSuite. Once created, tags can be enabled or disabled as needed. Over time, Expensify also learns your tag preferences and applies them automatically.

The Tags table displays the tag **Name**, **GL Code** (if assigned), and whether it's **Required** for expenses.

![The Tags tab]({{site.url}}/assets/images/NewExpensify_ManageTags_3.png){:width="100%"}

---

# How to enable expense tags 

Before you can manage tags, you need to enable the **Tags** feature for your workspace.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Select your **workspace name**.
3. Select **More Features**. 
4. In the **Organize** section, toggle **Tags** on. 

---

# How to add expense Tags 

## Manually Add A Single Tag

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Click **Add Tag** at the top of the page.
3. Enter a name and click **Save**.

## Import A Single Level Of Tags From A Spreadsheet

1. Go to **Workspaces > [Workspace Name] > Tags**.
2. Click **More > Import spreadsheet** (or if you haven't added any tags yet, just click **Import** from the main Tags settings page).
3. Click **Single level of tags**.
4. Click **Choose File** and select the file to import.
5. Toggle the "File contains column headers" on or off accordingly, then select which spreadsheet column should be mapped to which tag field. We require columns Name and Enabled, and you can optionally include a column for Tag GL Code. GL codes will be visible to Workspace Admins in the Tags table.
6. Click **Import** to finish importing the tags.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Select your **workspace name**.
3. Select **Tags**.
4. Click **Add Tag**.
5. Enter a name and click **Save**.

## How to import a single level of expense tags using a spreadsheet

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Select your **workspace name**.
3. Select **Tags**.
4. Click **More > Import spreadsheet**
   - If no tags exist yet, select Import from the Tags page.
5. Select **Single level of tags**.
6. Click **Choose File** and upload your spreadsheet.
7. Map the required columns:
   - Name
   - Enabled
   - (Optional) Tag GL Code
8. Select **Import**.

## How to import multi-level expense tags using a spreadsheet

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Select your **workspace name**.
3. Select **Tags**.
4. Click **More > Import spreadsheet**
   - If no tags exist yet, select Import from the Tags page.
5. Select **Multi-level tags**.
6. Click **Choose File** and upload your spreadsheet.
7. Configure the import options:
   - Whether the first row contains tag level names
   - Whether tag levels are dependent or independent
   - Whether each level includes a GL code column
8. Select **Import**.

You can use one of these template files to build your tags list:

- [Dependent tags with GL codes](https://help.expensify.com/assets/Files/Dependent+with+GL+codes+format.csv)
- [Dependent tags without GL codes](https://help.expensify.com/assets/Files/Dependent+without+GL+codes+format.csv)
- [Independent tags with GL codes](https://help.expensify.com/assets/Files/Independent+with+GL+codes+format.csv)
- [Independent tags without GL codes](https://help.expensify.com/assets/Files/Independent+without+GL+codes+format.csv)

**Notes:**
 - Only CSV and TSV files are supported for multi-level tag imports.
 - A single file can include up to 50,000 tags.
 - Each import replaces the existing tag list. Update and re-upload the original file to preserve tags.

## How to delete expense tags

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Select your **workspace name**.
3. Select **Tags**.
4. Select one or more tags. 
5. Click **Selected** in the top right corner. 
6. Click **Delete Tag**.

**Note:** For multi-level tags, individual tags can’t be deleted manually. To remove them, upload a new spreadsheet without the tags you no longer need. For single-level tags, individual tags can be deleted manually

---

## How to enable or disable expense tags 

Workspace Admins can turn tags on or off at any time to control which options are available to members.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Select your **workspace name**.
3. Select **Tags**.
4. Use the toggle to enable or disable the tag.

**Note:** Tags imported from an accounting system are added as **inactive** by default and must be enabled on manually.

---

## How to add or edit a tag GL code

Workspaces on the Control plan can assign a GL code to each tag for exporting purposes. Tag GL codes are not visible to members.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Select your **workspace name**.
3. Select **Tags**.
4. Click a tag to open its detail panel.
5. Click the **GL Code** field, enter or update the code, then click **Save**.

---

# How to apply expense tags automatically

Expensify provides two ways to apply tags automatically based on merchant behavior.

## Learned Tag Suggestions

Expensify learns how tags are applied over time and suggests them automatically.

- Manual corrections are remembered over time to improve future suggestions. 
- Tags that were manually applied to expenses aren’t overwritten automatically.
- These suggestions are based on patterns and may vary by user.

## Workspace Merchant Rules for tags

Workspace Admins can create explicit [**Workspace Merchant Rules**](https://help.expensify.com/articles/new-expensify/workspaces/Workspace-Merchant-Rules) to apply consistent tags based on merchant name across all workspace expenses. 

- Rules apply to all expenses across the entire workspace.
- Rules take precedence over learned suggestions
- Tags that were manually applied to expenses aren’t overwritten automatically.

---

# FAQ

## Can I edit expense tags on a submitted expense report?

Yes. You can edit tags until the expense is approved or reimbursed.

Approvers can also edit tags, even post-approval, by taking control of the report.

## Can I see an audit trail of tag changes?

Yes. When a tag is manually changed, the update is logged in the associated expense chat.

## What happens if a tag is disabled in my accounting system?

It will be removed from the workspace’s tag list. However, it will still appear on any expenses or reports where it was already applied.

## Why can’t I enable multi-level tags?

If you are connected to an accounting integration, you will not see this feature. You will need to add those tags in your accounting system first, then sync the connection.

## How can my Employees see the GL Codes?

GL codes are visible to Workspace Admins in the Tags table but are not visible to workspace members. If you need members to see GL codes, consider including the GL code in the tag
name itself.

