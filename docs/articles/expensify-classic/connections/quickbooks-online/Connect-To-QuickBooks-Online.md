---
title: QuickBooks Online
description: Everything you need to know about using Expensify's direct integration with QuickBooks Online.
order: 1
---
# Overview

The Expensify integration with QuickBooks Online brings in your expense accounts and other data and even exports reports directly to QuickBooks for easy reconciliation. Plus, with advanced features in QuickBooks Online, you can fine-tune coding settings in Expensify for automated data export to optimize your accounting workflow.

## Before connecting

It's crucial to understand the requirements based on your specific QuickBooks subscription:

- While all the features are available in Expensify, their accessibility may vary depending on your QuickBooks Online subscription.
- An error will occur if you try to export to QuickBooks with a feature enabled that isn't part of your subscription.
- Please be aware that Expensify does not support the Self-Employed subscription in QuickBooks Online.

![QuickBooks Online - Subscription types]({{site.url}}/assets/images/QBO1.png){:width="100%"}

# How to connect to QuickBooks Online

## Step 1: Setup employees in QuickBooks Online

Employees must be set up as either Vendors or Employees in QuickBooks Online. Make sure to include the submitter's email in their record.

If you use vendor records, you can export as Vendor Bills, Checks, or Journal Entries. If you use employee records, you can export as Checks or Journal Entries (if exporting against a liability account).

Additional Options for Streamlined Setup:

- Automatic Vendor Creation: Enable “Automatically Create Entities” in your connection settings to automatically generate Vendor or Employee records upon export for submitters that don't already exist in QBO.
- Employee Setup Considerations: If setting up submitters as Employees, ensure you activate QuickBooks Online Payroll. This will grant access to the Employee Profile tab to input employee email addresses.

## Step 2: Connect Expensify and QuickBooks Online

- Navigate to Settings > Workspaces > Group > [Workspace Name] > Connections > QuickBooks Online. Click Connect to QuickBooks.
- Enter your QuickBooks Online Administrator’s login information and choose the QuickBooks Online Company File you want to connect to Expensify (you can connect one Company File per Workspace). Then click Authorize.
- Enter your QuickBooks Online Administrator’s login information and choose the QuickBooks Online Company File you want to connect to Expensify (you can connect one Company File per Workspace):

## Exporting historical Reports to QuickBooks Online:

After connecting QuickBooks Online to Expensify, you may receive a prompt to export all historical reports from Expensify. To export multiple reports at once, follow these steps:

- Go to the Reports page on the web.
- Tick the checkbox next to the reports you want to export.
- Click 'Export To' and select 'QuickBooks Online' from the drop-down list.

If you don't want to export specific reports, click “Mark as manually entered” on the report.

# How to configure export settings for QuickBooks Online

Our QuickBooks Online integration offers a range of features. This section will focus on Export Settings and how to set them up.

## Preferred Exporter

Any Workspace admin can export to your accounting integration, but the Preferred Exporter can be chosen to automate specific steps. You can set this role from Settings > Workspaces > Group > [Workspace Name] > Connections > Configure > Export > Preferred Exporter.

The Preferred Exporter:

- Is the user whose Concierge performs all automated exports on behalf of.
- Is the only user who will see reports awaiting export in their **Home.**
- Must be a **Domain Admin** if you have set individual GL accounts for Company Card export.
- Must be a **Domain Admin** if this is the Preferred Workspace for any Expensify Card domain using Automatic Reconciliation.

## Date

When exporting reports to QuickBooks Online, you can choose the report's **submitted date**, the report's **exported date**, or the **date of the last expense on the report.**

Most export options (Check, Journal Entry, and Vendor Bill) will create a single itemized entry with one date. 
Please note that if you choose a Credit Card or Debit Card for non-reimbursable expenses, we'll use the transaction date on each expense during export. 

# Reimbursable expenses 

Reimbursable expenses export to QuickBooks Online as:

- Vendor Bills
- Checks
- Journal Entries

## Vendor bill (recommended)

This is a single itemized vendor bill for each Expensify report. If the accounting period is closed, we will post the vendor bill on the first day of the next open period. If you export as Vendor Bills, you can also choose to Sync reimbursed reports (set on the Advanced tab). **An A/P account is required to export to a vendor bill.**

The submitter will be listed as the vendor in the vendor bill.

![Vendor Bill]({{site.url}}/assets/images/QBO2-Bill.png){:width="100%"}

## Check

This is a single itemized check for each Expensify report. You can mark a check to be printed later in QuickBooks Online.

![Check to print]({{site.url}}/assets/images/QBO3-Checktoprint.png){:width="100%"}

## Journal entry

This is a single itemized journal entry for each Expensify report.

![Journal Entry]({{site.url}}/assets/images/QBO4-JournalEntry.png){:width="100%"}

# Non-reimbursable expenses

Non-reimbursable expenses export to QuickBooks Online as:

- Credit Card expenses
- Debit Card Expenses
- Vendor Bills

## Credit/debit card

Using Credit/Debit Card Transactions:

- Each expense will be exported as a bank transaction with its transaction date.
- If you split an expense in Expensify, we'll consolidate it into a single credit card transaction in QuickBooks with multiple line items posted to the corresponding General Ledger accounts.

Pro-Tip: To ensure the payee field in QuickBooks Online reflects the merchant name for Credit Card expenses, ensure there's a matching Vendor in QuickBooks Online. Expensify checks for an exact match during export. If none are found, the payee will be mapped to a vendor we create and labeled as Credit Card Misc. or Debit Card Misc.

![Expense]({{site.url}}/assets/images/QBO5-Expense.png){:width="100%"}

If you centrally manage your company cards through Domains, you can export expenses from each card to a specific account in QuickBooks.

## Vendor Bill

- A single detailed vendor bill is generated for each Expensify report. If the accounting period is closed, the vendor bill will be posted on the first day of the next open period. If you choose to export non-reimbursable expenses as Vendor Bills, you can assign a default vendor to the bill.
- The export will use your default vendor if you have Default Vendor enabled. If the Default Vendor is disabled, the report's submitter will be set as the Vendor in QuickBooks.

## Billable Expenses

- In Expensify, you can designate expenses as billable. These will be exported to QuickBooks Online with the billable flag. This feature applies only to expenses exported as Vendor Bills or Checks. To maximize this functionality, ensure that any billable expense is associated with a Customer/Job.

## Export Invoices

If you are creating Invoices in Expensify and exporting these to QuickBooks Online, this is the account the invoice will appear against.

# Configure coding for QuickBooks Online

The coding tab is where your information is configured for Expensify; this will allow employees to code expenses and reports accurately.

- Categories
- Classes and/or Customers/Projects
- Locations
- Items
- Tax 

## Categories

QuickBooks Online expense accounts will be automatically imported into Expensify as Categories.

## Account Import

Equity type accounts will also be imported as categories.

Important notes:

- Other Current Liabilities can only be exported as Journal Entries if the submitter is set up as an Employee in QuickBooks.
- Exchange Gain or Loss detail type does not import.
  
Recommended steps to take after importing the expense accounts from QuickBooks to Expensify:

- Go to Settings > Workspaces > Groups > [Workspace Name] > Categories to see the accounts imported from QuickBooks Online.
- Use the enable/disable button to choose which Categories to make available to your employees, and set Category specific rules via the blue settings cog.
- If necessary, edit the names of imported Categories to make expense coding easier for your employees. (Please Note: If you make any changes to these accounts in QuickBooks Online, the category names on Expensify's side will revert to match the name of the account in QuickBooks Online the next time you sync). 
- If you use Items in QuickBooks Online, you can import them into Expensify as Categories.

Please note that each expense has to have a category selected to export to QuickBooks Online. The chosen category has to be imported from QuickBooks Online and cannot be manually created within the Workspace settings. 

## Classes and Customers/Projects

If you use Classes or Customers/Projects in QuickBooks Online, you can import those into Expensify as Tags or Report Fields:

- Tags let you apply a Class and/or Customer/Project to each expense.
- Report Fields enables you to apply a Class and/or Customer/Project to all expenses on a report.

Note: Although Projects can be imported into Expensify and coded to expenses, due to the limitations of the QuickBooks API, expenses cannot be created within the Projects module in QuickBooks. 

## Locations

Locations can be imported into Expensify as a Report Field or, if you export reimbursable expenses as Journal Entries and non-reimbursable expenses as Credit/Debit Card, you can import Locations as Tags.

## Items

If you use Items in QuickBooks Online, you can import Items defined with Purchasing Information (with or without Sales Information) into Expensify as Categories.

## Tax

- Using our tax tracking feature, you can assign a tax rate and amount to each expense.
- To activate tax tracking, go to connection configuration and enable it. This will automatically import purchasing taxes from QuickBooks Online into Expensify.
- After the connection is set, navigate to Settings > Workspaces > Groups > [Workspace Name] > Tax. Here, you can view the taxes imported from QuickBooks Online.
- Use the enable/disable button to choose which taxes are accessible to your employees.
- Set a default tax for the Company Workspace, which will automatically apply to all new expenses.
- Please note that, at present, tax cannot be exported to Journal Entries in QuickBooks Online.
- Expensify performs a daily sync to ensure your information is up-to-date. This minimizes errors from outdated QuickBooks Online data and saves you time on syncing.

# How to configure advanced settings for QuickBooks Online

The advanced settings are where functionality for automating and customizing the QuickBooks Online integration can be enabled.
Navigate to this section of your Workspace by following Settings > Workspaces > Group > [Workspace Name] > Connections > Configure button > Advanced tab.

## Auto Sync
With QuickBooks Online auto-sync, once a non-reimbursable report is final approved in Expensify, it's automatically queued for export to QuickBooks Online. For expenses eligible for reimbursement with a linked business bank account, they'll sync when marked as reimbursed.

## Newly Imported Categories

This setting determines the default status of newly imported categories from QuickBooks Online to Expensify, either enabled or disabled.

## Invite Employees

Enabling this automatically invites all Employees from QuickBooks Online to the connected Expensify Company Workspace. If not, you can manually invite or import them using a CSV file.

## Automatically Create Entities

When exporting reimbursable expenses as Vendor Bills or Journal Entries, Expensify will automatically create a vendor in QuickBooks if one doesn't exist. It will also generate a customer when exporting Invoices.

## Sync Reimbursed Reports

Enabling this marks the Vendor Bill as paid in QuickBooks Online when you reimburse a report via ACH direct deposit in Expensify. If reimbursing outside Expensify, marking the Vendor Bill as paid will automatically in QuickBooks Online update the report as reimbursed in Expensify. Note: After enabling this feature, select your QuickBooks Account in the drop-down, indicating the bank account for reimbursements.

## Collection Account

If you are exporting Invoices from Expensify to Quickbooks Online, this is the account the Invoice will appear against once marked as Paid.

# Deep Dive

## Preventing Duplicate Transactions in QuickBooks

When importing a banking feed directly into QuickBooks Online while also importing transactions from Expensify, it's possible to encounter duplicate entries in QuickBooks. To prevent this, follow these steps:

Step 1: Complete the Approval Process in Expensify

- Before exporting any expenses to QuickBooks Online, ensure they are added to a report and the report receives approval. Depending on your Workspace setup, reports may require approval from one or more individuals. The approval process concludes when the last user who views the report selects "Final Approve."

Step 2: Exporting Reports to QuickBooks Online

- To ensure expenses exported from Expensify match seamlessly in the QuickBooks Banking platform, make sure these expenses are marked as non-reimbursable within Expensify and that “Credit Card” is selected as the non-reimbursable export option for your expenses.

Step 3: Importing Your Credit Card Transactions into QuickBooks Online

- After completing Steps 1 and 2, you can import your credit card transactions into QuickBooks Online. These imported banking transactions will align with the ones brought in from Expensify. QuickBooks Online will guide you through the process of matching these transactions, similar to the example below:

![Transactions]({{site.url}}/assets/images/QBO7-Transactions.png){:width="100%"}

## Tax in QuickBooks Online

If your country applies taxes on sales (like GST, HST, or VAT), you can utilize Expensify's Tax Tracking along with your QuickBooks Online tax rates. Please note: Tax Tracking is not available for Workspaces linked to the US version of QuickBooks Online. If you need assistance applying taxes after reports are exported, contact QuickBooks.

To get started:

- Go to Settings > Workspaces > Group > [Workspace Name] > Connections, and click Configure.
- Navigate to the Coding tab.
- Turn on **Tax**.
- Click Save. This imports the Tax Name and rate from QuickBooks Online.
- Visit Settings > Workspaces > Group > [Workspace Name] > Tax to view the imported taxes.
- Use the enable/disable button in the Tax tab to choose which taxes your employees can use.

Remember, you can also set a default tax rate for the entire Workspace. This will be automatically applied to all new expenses. The user can still choose a different tax rate for each expense.

Tax information can't be sent to Journal Entries in QuickBooks Online. Also, when dealing with multiple tax rates, where one receipt has different tax rates (like in the EU, UK, and Canada), users should split the expense into the respective parts and set the appropriate tax rate for each part.

## Multi-currency

When working with QuickBooks Online Multi-Currency, there are some things to remember when exporting Vendor Bills and Check! Make sure the vendor's currency and the Accounts Payable (A/P) bank account match.

In QuickBooks Online, the currency conversion rates are not applied when exporting. All transactions will be exported with a 1:1 conversion rate, so for example, if a vendor's currency is CAD (Canadian Dollar) and the home currency is USD (US Dollar), the export will show these currencies without applying conversion rates.

![Check]({{site.url}}/assets/images/QBO6-Check.png){:width="100%"}

To correct this, you must manually update the conversion rate after the report has been exported to QuickBooks Online. 

Specifically for Vendor Bills:

If multi-currency is enabled and the Vendor's currency is different from the Workspace currency, OR if QuickBooks Online home currency is foreign from the Workspace currency, then:

- We create the Vendor Bill in the Vendor's currency (this is a QuickBooks Online requirement - we don't have a choice)
- We set the exchange rate between the home currency and the Vendor's currency
- We convert line item amounts to the vendor's currency

Let's consider this example:

- QuickBooks Online home currency is USD
- Vendor's currency is VND
- Workspace (report) currency is JPY

Upon export, we:

1. Specified the bill is in VND
2. Set the exchange rate between VND and USD (home currency), computed at the time of export.
3. Converted line items from JPY (currency in Expensify) to VND
4. QuickBooks Online automatically computed the USD amount (home currency) based on the exchange rate we specified
5. Journal Entries, Credit Card, and Debit Card:

Multi-currency exports will fail as the account currency must match both the vendor and home currencies. 

## Report Fields

Report fields are a handy way to collect specific information for a report tailored to your organization's needs. They can specify a project, business trip, client, location, and more!

When integrating Expensify with Your Accounting Software, you can create your report fields in your accounting software so the next time you sync your Workspace, these fields will be imported into Expensify.

To select how a specific field imports to Expensify, head to Settings > Workspaces > Group > 
[Workspace Name] > Connections > Accounting Integrations > QuickBooks Online > Configure > Coding.

Here are the QuickBooks Online fields that can be mapped as a report field within Expensify:

- Classes
- Customers/Projects
- Locations

{% include faq-begin.md %}

## What happens if the report can't be exported to QuickBooks Online automatically?

If a report encounters an issue during automatic export to QuickBooks Online, you'll receive an email with details about the problem, including any specific error messages. These messages will also be recorded in the report's history section. 

The report will be placed in your Home for your attention. You can address the issues there. If you need further assistance, refer to our QuickBooks Online Export Errors page or export the report manually.

## How can I ensure that I final approve reports before they're exported to QuickBooks Online?

To ensure reports are reviewed before export, set up your Workspaces with the appropriate workflow in Expensify. Additionally, consider changing your Workspace settings to enforce expense Workspace workflows strictly. This guarantees that your Workspace's workflow is consistently followed.

## What happens to existing approved and reimbursed reports if I enable Auto Sync?

- If Auto Sync was disabled when your Workspace was linked to QuickBooks Online, enabling it won't impact existing reports that haven't been exported.
- If a report has been exported and reimbursed via ACH, it will be automatically marked as paid in QuickBooks Online during the next sync.
- If a report has been exported and marked as paid in QuickBooks Online, it will be automatically marked as reimbursed in Expensify during the next sync.
- Reports that have yet to be exported to QuickBooks Online won't be automatically exported.

{% include faq-end.md %}
