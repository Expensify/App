---
title: Configure NetSuite
description: Configure the import, export, and advanced settings for Expensify's integration with NetSuite
order: 2
---

# Best practices using NetSuite

Using Expensify with NetSuite brings a seamless, efficient approach to managing expenses. With automatic syncing, expense reports flow directly into NetSuite, reducing manual entry and errors while giving real-time visibility into spending. This integration speeds up approvals, simplifies reimbursements, and provides clear insights for smarter budgeting and compliance. Together, Expensify and NetSuite make expense management faster, more accurate, and stress-free.

# Accessing the NetSuite configuration settings

NetSuite is connected at the workspace level, and each workspace can have a unique configuration that dictates how the connection functions. To access the connection settings:

1. Click **Settings** in the bottom left menu.
2. Scroll down and click **Workspaces** in the left menu.
3. Select the workspace you want to access settings for.
4. Click **Accounting** in the left menu.

# Step 1: Configure import settings

The following steps help you determine how data will be imported from NetSuite to Expensify.

1. From the Accounting tab of your workspace settings, click on **Import**.
2. In the right-hand menu, review each of the following import settings:
    - _Categories_: Your NetSuite Expense Categories are automatically imported into Expensify as categories. This is enabled by default and cannot be disabled.
    - _Department, Classes, and Locations_: The NetSuite connection allows you to import each independently and utilize tags, report fields, or employee defaults as the coding method.
        - Tags are applied at the expense level and apply to a single expense.
        - Report Fields are applied at the report header level and apply to all expenses on the report.
        - The employee default is applied when the expense is exported to NetSuite and comes from the default on the submitter’s employee record in NetSuite.
    - _Customers and Projects_: The NetSuite connection allows you to import customers and projects into Expensify as tags or report fields.
        - _Cross-subsidiary customers/projects_: Enable to import Customers and Projects across all NetSuite subsidiaries to a single Expensify workspace. This setting requires you to enable “Intercompany Time and Expense” in NetSuite. To enable that feature in NetSuite, go to **Setup > Company > Setup Tasks: Enable Features > Advanced Features**.
    - _Tax_: Enable to import NetSuite Tax Groups and configure further on the Taxes tab of your workspace settings menu.
    - _Custom Segments and Records_: Enable to import segments and records as tags or report fields.
        - If configuring Custom Records as Report Fields, use the Field ID on the Transactions tab (under **Custom Segments > Transactions**).
        - If configuring Custom Records as Tags, use the Field ID on the Transaction Columns tab (under **Custom Segments > Transaction Columns**).
        - Don’t use the “Filtered by” feature available for Custom Segments. Expensify can’t make these dependent on other fields. If you do have a filter selected, we suggest switching that filter in NetSuite to “Subsidiary” and enabling all subsidiaries to ensure you don’t receive any errors upon exporting reports.
    - _Custom Lists_: Enable to import lists as tags or report fields.
3. Sync the connection by closing the right-hand menu and clicking the three-dot icon > Sync Now option. Once the sync completes, you should see the values for any enabled tags or report fields in the corresponding Tag or Report Field tabs in the workspace settings menu.

{% include info.html %}
When you’re done configuring the settings, or anytime you make changes in the future, sync the NetSuite connection. This will ensure changes are saved and updated across both systems.
{% include end-info.html %}

# Step 2: Configure export settings

The following steps help you determine how data will be exported from Expensify to NetSuite.

1. From the Accounting tab of your workspace settings, click on **Export**.
2. In the right-hand menu, review each of the following export settings:
    - _Preferred exporter_
    - _Export date_
    - _Export out-of-pocket expenses as_
    - _Export company card expenses as_
    - _Export invoices to_
    - _Invoice item_
    - _Export foreign currency amount_
    - _Export to next open period_
3. Sync the connection by closing the right-hand menu and clicking the three-dot icon > Sync Now option.

# Step 3: Configure advanced settings

The following steps help you determine the advanced settings for your NetSuite connection.

1. From the Accounting tab of your workspace settings, click on **Advanced**.
2. In the right-hand menu, review each of the following advanced settings:
    - _Auto-sync_
    - _Sync reimbursed reports_
    - _Invite employees and set approvals_
    - _Auto create employees/vendors_
    - _Enable newly imported categories_
    - _Setting approval levels_
    - _Custom form ID_
3. Sync the connection by closing the right-hand menu and clicking the three-dot icon > Sync Now option.

{% include faq-begin.md %}

## I added tags in NetSuite (Departments, Classes, or Locations) how do I get them into my workspace?

New Departments, Classes, and Locations must be added in NetSuite first before they can be added as options to code to expenses in Expensify. After adding them in NetSuite, sync your connection to import the new options.

## Is it possible to automate inviting my employees and their approver from NetSuite into Expensify?

Yes, you can automatically import your employees and set their approval workflow with your connection between NetSuite and Expensify.

{% include faq-end.md %}
