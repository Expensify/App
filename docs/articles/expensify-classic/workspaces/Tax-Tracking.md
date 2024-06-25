---
title: Tax
description: How to track expense taxes
---
# Overview
Expensify’s tax tracking feature allows you to:
- Add tax names, rates, and codes whether you’re connected to an accounting system or not.
- Enable/disable taxes you’d like to make available to users.
- Set a default tax for Workspace currency expenses and, optionally, another default tax (including exempt) for foreign currency expenses which - will automatically apply to all new expenses.

# How to Enable Tax Tracking
Tax tracking can be enabled in the Tax section of the Workspace settings of any Workspace, whether group or individual. 
## If Connected to an Accounting Integration
If your group Workspace is connected to Xero, QuickBooks Online, Sage Intacct, or NetSuite, make sure to first enable tax via the connection configuration page (Settings > Policies > Group > [Workspace Name] > Connections > Configure) and then sync the connection. Your tax rates will be imported from the accounting system and indicated by its logo.
## Not Connected to an Accounting Integration
If your Workspace is not connected to an accounting system, go to Settings > Policies > Group > [Workspace Name] > Tax to enable tax.

# Tracking Tax by Expense Category
To set a different tax rate for a specific expense type in the Workspace currency, go to Settings > Workspaces > Group > [Workspace Name] > Categories page. Click "Edit Rules" next to the desired category and set the "Category default tax". This will be applied to new expenses, overriding the default Workspace currency tax rate.
