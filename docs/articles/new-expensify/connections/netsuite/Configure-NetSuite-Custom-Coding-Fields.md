---
title: Configure NetSuite custom coding fields
description: Import NetSuite custom segments, custom records, and custom lists into Expensify so they can be used as Tags or Report fields.
keywords: NetSuite custom segment, NetSuite custom record, NetSuite custom list, Tags, Report fields, accounting import
internalScope: Workspace Admins configuring the NetSuite accounting integration. Covers importing custom segments, custom records, and custom lists. Does not cover configuring NetSuite exports.
---

# Configure NetSuite custom coding fields

Expensify lets you import NetSuite custom accounting fields so members can code expenses with additional accounting dimensions.

You can import:

- **Custom segments**
- **Custom records** (through their associated custom segment)
- **Custom lists**

Imported fields can be displayed as either:

- **Tags** (line-item level)
- **Report fields** (report level)

## Who can configure NetSuite custom segments, custom records, and custom lists

Workspace Admins who are connected to a NetSuite integration can configire custom coding. 

Click the navigation tabs (on the left on web, on the bottom on mobile), then select **Workspaces** > **[Workspace Name]** > **Accounting** > **Configure** > **Import**.

## How to configure a NetSuite custom segment or custom record

Although the setup wizard lets you choose **Custom segment** or **Custom record**, both options require the same NetSuite information because custom records are imported through their associated custom segment.

1. Under **Accounting** > **Configure** > **Import**, click **Add custom segment/record**.
2. Choose **Custom segment** or **Custom record**.
3. Enter the custom segment **Name**.
4. Enter the custom segment **Internal ID**.
5. Enter the custom segment **Script ID**.
6. Choose whether the field should appear as **Tags** or **Report fields**.
7. Complete the wizard.

<!-- SCREENSHOT:
Suggestion: Step 1 of the Add custom segment/record wizard showing the Custom segment and Custom record options.
Location: After step 2.
Purpose: Show where admins begin the workflow.
-->

## How to find the custom segment name in NetSuite

1. In NetSuite, go to **Customization** > **Lists, Records, & Fields** > **Custom Segments**.
2. Copy the custom segment **Name**.

<!-- SCREENSHOT:
Suggestion: NetSuite Custom Segments page showing the Name column.
Location: After the steps.
Purpose: Show where the custom segment name is located.
-->

## How to find the custom segment Internal ID in NetSuite

Before locating the Internal ID:

1. In NetSuite, go to **Home** > **Set Preferences**.
2. Enable **Show Internal IDs**.

Then:

1. Go to **Customization** > **Lists, Records, & Fields** > **Custom Segments**.
2. Open the custom segment.
3. Click the **Custom Record Type** link.
4. Copy the **Internal ID** from the table at the bottom of the page.

<!-- SCREENSHOT:
Suggestion: Custom Record Type page showing the Internal ID.
Location: After the steps.
Purpose: Show where the Internal ID is displayed.
-->

## How to find the custom segment Script ID in NetSuite

1. Go to **Customization** > **Lists, Records, & Fields** > **Custom Segments**.
2. Open the custom segment.
3. Select the **Application and Sourcing** tab.

Use the appropriate **Field ID** based on how you want the field to appear in Expensify:

| In Expensify | NetSuite Field ID |
| --- | --- |
| **Tags** | **Transaction Columns** > **Field ID** |
| **Report fields** | **Transactions** > **Field ID** |

<!-- SCREENSHOT:
Suggestion: Application and Sourcing tab showing the Transactions and Transaction Columns subtabs.
Location: After the table.
Purpose: Show which Field ID to use for Tags and Report fields.
-->

## How to configure a NetSuite custom list

Unlike custom segments and custom records, available custom lists are automatically populated in the setup wizard.

1. Under **Accounting** > **Configure** > **Import**, click **Add custom list**.
2. Select the custom list from the **Name** picker.
3. Choose whether it should appear as **Tags** or **Report fields**.
4. Enter the **Transaction Field ID**.
5. Complete the wizard.

<!-- SCREENSHOT:
Suggestion: Name picker showing the available custom lists.
Location: After step 2.
Purpose: Show how to select a custom list.
-->

## How to find the Transaction Field ID for a custom list

1. In NetSuite, enter **Transaction Line Fields** in Global Search.
2. Open the transaction line field associated with your custom list.
3. Copy the **Transaction Field ID** shown on the left side of the page.

<!-- SCREENSHOT:
Suggestion: Transaction Line Field page showing the Transaction Field ID.
Location: After the steps.
Purpose: Show where the Transaction Field ID is located.
-->

## What happens after you import a NetSuite custom accounting field

After the import completes:

- The field becomes available in your workspace.
- Members can select it when coding expenses.
- Depending on your configuration, the field appears as either **Tags** or **Report fields**.
- If you add or update values in NetSuite, you can re-import the field to synchronize the changes.

# FAQ

## Should I choose Custom segment or Custom record?

Choose the option that matches how the accounting field is configured in your NetSuite account. Both options require the same custom segment information during setup because custom records are imported through their associated custom segment.

## What's the difference between Tags and Report fields?

- **Tags** are applied at the line-item level.
- **Report fields** are applied at the report level.

## Why don't I have to enter the name of a custom list manually?

Unlike custom segments and custom records, Expensify retrieves the available custom lists from your NetSuite connection, so you simply select one from the **Name** picker during setup.
