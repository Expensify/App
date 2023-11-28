---
title: Report Fields & Titles
description: This article is about managing Report Fields and Report Titles in Expensify
---
# Overview

In this article, we'll go over how to use Report Titles and Report Fields.

## How to use Report Titles

Default report titles enable group workspace admins or individual workspace users to establish a standardized title format for reports associated with a specific workspace. Additionally, admins have the choice to enforce these report titles, preventing employees from altering them. This ensures uniformity in report naming conventions during the review process, eliminating the need for employees to manually input titles for each report they generate.

- Group workspace admins can set the Default Report Title from **Settings > Workspaces > Group > *[Workspace Name]* > Reports**.
- Individual users can set the Default Report Title from **Settings > Workspaces > Individual > *[Workspace Name]* > Reports**.
  
You can configure the title by using the formulas that we provide to populate the Report Title. Take a look at the help article on Custom Formulas to find all eligible formulas for your Report Titles.

## Deep Dive on Report Titles

Some formulas will automatically update the report title as changes are made to the report. For example, any formula related to dates, total amounts, workspace name, would adjust the title before the report is submitted for approval. Changes will not retroactively update report titles for reports which have been Approved or Reimbursed.

To prevent report title editing by employees, simply enable "Enforce Default Report Title."

## How to use Report Fields

Report fields let you specify header-level details, distinct from tags which pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more. Customize them according to your workspace's requirements.

To set up Report Fields, follow these steps:
- Workspace Admins can create report fields for group workspaces from **Settings > Workspaces > Group > *[Workspace Name]* > Reports > Report and Invoice Fields**. For individual workspaces, follow **Settings > Workspaces > Individual > *[Workspace Name]* > Reports > Report and Invoice Fields**.
- Under "Add New Field," enter the desired field name in the "Field Title" to describe the type of information to be selected.
- Choose the appropriate input method under "Type":
  - Text: Provides users with a free-text box to enter the requested information.
  - Dropdown: Creates a selection of options for users to choose from.
  - Date: Displays a clickable box that opens a calendar for users to select a date.
    
## Deep Dive on Report Fields

You cannot create these report fields directly in Expensify if you are connected to an accounting integration (QuickBooks Online, QuickBooks Desktop, Intacct, Xero, or NetSuite). Please refer to the relevant article for instructions on creating fields within that system.

When report fields are configured on a workspace, they become mandatory information for associated reports. Leaving a report field empty or unselected will trigger a report violation, potentially blocking report submission or export.

Report fields are "sticky," which means that any changes made by an employee will persist and be reflected in subsequent reports they create.

