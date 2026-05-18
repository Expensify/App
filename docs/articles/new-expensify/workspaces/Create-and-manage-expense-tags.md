---
title: Create and Manage Expense Tags
description: Add tags to use for coding expenses.
keywords: [New Expensify, expense tags, class tracking, cost center, import tags, coding expenses, tag GL code]
internalScope: Audience is Workspace Admins. Covers enabling, creating, importing, activating, and managing expense tags, including multi-level tags and tag GL codes. Does not cover personal expense rules or accounting system configuration.
---

# Create and Manage Expense Tags

Tags help you code expenses for accounting and reporting (for example: cost centers, classes, projects, locations, customers, or jobs).

Workspace Admins can:
- Create tags manually.
- Import tags using a spreadsheet.
- Sync tags from an accounting integration (for example: QuickBooks Online, Xero, NetSuite, Sage Intacct).

Over time, Expensify also learns your tag preferences and applies them automatically.

![The Tags tab]({{site.url}}/assets/images/NewExpensify_ManageTags_3.png){:width="100%"}

---

## How to enable Tags on a workspace

Before you can manage tags, you need to enable the **Tags** feature for your workspace.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**.
2. Select **More Features**. 
3. In the **Organize** section, enable **Tags**. 

---

## How to create a tag manually

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**
2. Select **Tags**.
3. Choose **Add tag**
4. Enter a tag name and select **Save**.

---

## How to import single-level Tags using a spreadsheet

Use this option when you want one flat list of tags (for example: Marketing, Sales, IT).

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**
2. Select **Tags**.
3. Select **More** > **Import spreadsheet**
   - If no tags exist yet, select **Import** from the Tags page.
4. Choose **Single level of tags**.
5. Select **Choose file** then upload your spreadsheet. 
6. Map the required columns:
      - Name
      - Enabled
      - Tag GL Code (Optional)
7. Select **Import**. 

**Note:** Importing a new file will replace your existing tag list.

---

## How to import multi-level Tags using a spreadsheet

Use this option when you want multiple tag levels (for example: Department and Location). Multi-level tags are available on Control workspaces only. 

1. In the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**.
2. Select **Tags**.
3. Select **More** > **Import spreadsheet**.
   - If no tags exist yet, select **Import** from the Tags page.
4. Choose **Multi-level tags**.
5. Select **Choose file** then upload your file. 
6. Confirm the import settings:
      - The first row is the title for each tag list
      - These are independent tags
      - There is a GL code in the adjacent column (if applicable)
7. Select **Import**. 

The linked templates can be used to import multi-level tags: 
- [Dependent tags with GL codes](https://help.expensify.com/assets/Files/Dependent+with+GL+codes+format.csv)
- [Dependent tags without GL codes](https://help.expensify.com/assets/Files/Dependent+without+GL+codes+format.csv)
- [Independent tags with GL codes](https://help.expensify.com/assets/Files/Independent+with+GL+codes+format.csv)
- [Independent tags without GL codes](https://help.expensify.com/assets/Files/Independent+without+GL+codes+format.csv)

**Notes:**
 - Only CSV and TSV files are supported for multi-level tag imports. A single file can include up to 50,000 tags.

---

## How single-level Tags and multi-level Tags affect tag fields on expenses

Single-level Tags and multi-level Tags determine how many tag fields appear on each expense. This directly controls how many “layers” of coding members must complete when submitting expenses.

**Single-level tags:**
- Members see one Tag field on expenses. 
- They select one value from a single list (for example: Marketing, Sales, IT).
- Best when you only need one layer of coding.

Example: If you use single-level Tags for Department, members will see one field labeled **Tag** and choose one department.

**Multi-level tags**

- Members see **multiple Tag fields** (one for each level you configure).
- Each level appears as its own field on the expense. 
- Best when you need multiple layers of coding (for example: Department and Location).

**Note:**
- With single-level Tags, you can edit or delete individual tags directly in the workspace.
- With multi-level Tags, you must update and re-import your spreadsheet to make changes.

---

## How dependent and independent multi-level Tags work

When using multi-level Tags, you must choose whether the tag levels are **dependent** or **independent**. This determines whether selecting one tag filters the available options in the next level.

**Dependent Tags**

- Lower-level tag options depend on the selection made in the level above.
- When a member selects a value in Level 1, the options in Level 2 (and Level 3, etc.) are filtered to only the valid combinations from your spreadsheet.
- Best when only specific tag combinations are allowed.

Example:

If Level 1 is **State** and Level 2 is **City**, selecting `California` in Level 1 would limit Level 2 options to:
- San Francisco  
- San Diego  
- Los Angeles  

Members would not see cities that don’t belong to California.

**Independent Tags**

- Each tag level is its own separate list.
- Selecting a tag in one level does not filter the available options in other levels.
- Best when all combinations across levels are allowed.

Example:

If Level 1 is **Department** and Level 2 is **Location**, members can choose any department with any location.

When importing multi-level Tags, enable **These are independent tags** to import the levels as independent. If this option is disabled, the Tags will be imported as dependent.

---

## How to delete expense tags

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**.
2. Select **Tags**.
3. Select one or more tags. 
4. Choose **Selected** in the top right. 
5. Select **Delete tag**.

**Note:** For multi-level tags, individual tags can’t be deleted manually. Upload a new spreadsheet without the tags you want removed.

---

## How to add or edit a tag GL code

Workspaces on the Control plan can assign a GL code to each tag for exporting purposes. Tag GL codes are not visible to members.

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), select **Workspaces** > **[workspace name]**.
2. Select **Tags**.
3. Select a tag to open its detail panel.
4. Select the **GL Code** field, enter or update the code, then select **Save**.

---

## How Expensify suggests Tags automatically

Expensify may suggest Tags based on how similar expenses were coded previously.

**Note:** Manually applied tags are not overwritten automatically. Suggestions may vary by member and by merchant.

---

# FAQ

## Can I edit expense tags on a submitted expense report?

Yes. You can edit tags until the expense is approved or reimbursed.

Approvers can also edit tags after approval by taking control of the report.

## Can I see an audit trail of tag changes?

Yes. When a tag is changed manually, the update appears in the expense chat.

## What happens if a tag is disabled in my accounting system?

It will be removed from the workspace’s tag list. However, it will still appear on expenses or reports where it was previously applied.

## Why can’t I enable multi-level tags?

Multi-level tags are available on Control workspaces only. If your Control workspace is connected to an accounting integration, you will need to manage tags in your accounting system and sync them into Expensify.

## Can members see Tag GL codes?

No. Tag GL codes are visible only to Workspace Admins. If members need that information, include the GL code in the tag name (for example: `1001 - Marketing`).
