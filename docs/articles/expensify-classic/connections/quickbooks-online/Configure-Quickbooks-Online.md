---
title: Configure QuickBooks Online
description: Configure QuickBooks Online
---

# Best Practices Using QuickBooks Online

A connection to QuickBooks Online lets you combine the power of Expensify's expense management features with QuickBooks’s accounting capabilities. By following the recommended best practices below, your finances will be automatically categorized correctly and accounted for in the right place. 

- Configure your setup immediately after making the connection, and review each settings tab thoroughly.
- Keep Auto Sync enabled.
    - The daily sync will update Expensify with any changes to your chart of accounts, customers/projects, or bank accounts in QuickBooks Online.
    - Finalized reports will be exported to QuickBooks Online automatically, saving your admin team time with every report.
- Set your preferred exporter to a user who is both a workspace and domain admin. 
- Configure your coding settings and enforce them by requiring categories and tags on expenses. 

# Accessing the QuickBooks Configuration Settings

QuickBooks Online is connected at the workspace level, and each workspace can have a unique configuration that dictates how the connection functions. To access the configuration:

1. Click **Settings** near the bottom of the left-hand menu.
2. Navigate to Workspaces > Groups > [workspace Name] > Connections.
3. Scroll down to the QuickBooks Online connection and click the **Configure** button to open the settings menu.

# Step 1: Configure Export Settings

The following steps help you determine how data will be exported from Expensify to QuickBooks Online.

1. Click the **Configure** button under the QuickBooks Online connection to open the settings menu.
2. Under the Export tab, review each of the following export settings:
    - _Preferred Exporter_: Choose a Workspace Admin to set as the Preferred Exporter. 
        - Concierge exports reports automatically on behalf of the preferred exporter.
        - Other Workspace Admins will still be able to export to QuickBooks Online manually.
        - If you set different export bank accounts for individual company cards under Settings > Domain > Company Cards, your Preferred Exporter must be a Domain Admin in addition to a Workspace Admin.
    - _Date_: When exporting reports to QuickBooks Online, you can choose the report’s submitted date, the report’s exported date, or the date of the last expense on the report.
        - If you choose a Credit Card or Debit Card for non-reimbursable expenses, we’ll use the transaction date on each expense during export.
    - _Reimbursable expenses_: Reimbursable expenses export to QuickBooks Online as:
        - Vendor Bills (recommended): This is a single itemized vendor bill for each Expensify report.
        - Checks - This is a single itemized check for each Expensify report. You can mark a check to be printed later in QuickBooks Online.
        - Journal Entries - This is a single itemized journal entry for each Expensify report.
    - _Non-reimbursable expenses_: Non-reimbursable expenses export to QuickBooks Online as:
        - Credit Card expenses - Each expense will be exported as a bank transaction with its transaction date.
        - Debit Card Expenses - Each expense will be exported as a bank transaction with its transaction date.
        - Vendor Bills - A single detailed vendor bill is generated for each Expensify report. 
            - If the accounting period is closed, the vendor bill will be posted on the first day of the next open period. If you choose to export non-reimbursable expenses as Vendor Bills, you can assign a default vendor to the bill.
            - The export will use your default vendor if you have Default Vendor enabled. If the Default Vendor is disabled, the report’s submitter will be set as the Vendor in QuickBooks.
    - _Billable Expenses_: In Expensify, you can designate expenses as billable. These will be exported to QuickBooks Online with the billable flag. 
        - This feature applies only to expenses exported as Vendor Bills or Checks. To maximize this functionality, ensure that any billable expense is associated with a Customer/Job.
    - _Export Invoices_: If you are creating Invoices in Expensify and exporting these to QuickBooks Online, this is the account the invoice will appear against.

## Step 1B: Optional Configuration When Company Cards Are Connected
1. Click **Settings** near the bottom of the left-hand menu.
2. Navigate to Domains > [domain name] > Company Cards.
3. If you have more than one company card connection, select the connection first. 
4. Locate the cardholder you want to configure in the list,
5. Click the **Edit Exports** button and assign the account the card expenses should export to in QuickBooks Online.

# Step 2: Configure Coding Settings

The following steps help you determine how data will be imported from QuickBooks Online to Expensify.

1. Click the **Configure** button under the QuickBooks Online connection to open the settings menu.
2. Under the Coding tab, review each of the following settings and configure the options to determine what information will be imported:
    - _Categories_: QuickBooks Online Chart of Accounts are imported into Expensify as categories. This is enabled by default and cannot be disabled.
        - Equity-type accounts will also be imported as categories.
        - Other Current Liabilities can only be exported as Journal Entries if the submitter is set up as an Employee in QuickBooks.
    - _Classes and Customers/Projects_: If you use Classes or Customers/Projects in QuickBooks Online, you can import those into Expensify as Tags or Report Fields:
        - Tags let you apply a Class and/or Customer/Project to each expense.
        - Report Fields enables you to apply a Class and/or Customer/Project to all expenses on a report.
            - Note: Although Projects can be imported into Expensify and coded to expenses, due to the limitations of the QuickBooks API, expenses cannot be created within the Projects module in QuickBooks.
    - _Locations_: When enabled will import into Expensify as a Report Field or, if you export reimbursable expenses as Journal Entries and non-reimbursable expenses as Credit/Debit Card, you can import Locations as Tags.
    - _Items_: If you use Items in QuickBooks Online, you can import Items defined with Purchasing Information (with or without Sales Information) into Expensify as Categories.
    - _Tax_: Once enabled, QuickBooks Online tax rates can be further configured on the Settings > Workspaces > Groups > [Workspace Name] > [Tax](https://expensify.com/policy?param=%7B%22policyID%22:%22B936DE4542E9E78B%22%7D#tax) page.
        - Note: Tax cannot be exported to Journal Entries in QuickBooks Online.

# Step 3: Configure Advanced Settings

The following steps help you determine the advanced settings for your connection, like auto-sync.

1. Click the **Configure** button under the QuickBooks Online connection to open the settings menu.
2. Under the Advanced tab, review each of the following settings and configure the options you wish to use:
    - _Auto Sync_: When enabled, the connection will sync daily to ensure that the data shared between the two systems is up-to-date. 
        - New report approvals/reimbursements will be synced during the next auto-sync period. 
        - Reimbursable expenses will export after reimbursement occurs or the report is marked as reimbursed outside Expensify when using Direct or Indirect reimbursement.
        - Non-reimbursable expenses will export automatically after the report is final approved. 
    - _Newly Imported Categories Should Be_: When a new account is created in the QuickBooks Online chart of accounts, this setting controls whether the new category in Expensify is enabled or disabled by default. Disabled categories are not visible to employees when coding expenses.
    - _Invite Employees_: When enabled, Auto Sync imports QuickBooks Online employee records and invites them to the workspace.
    - _Automatically Create Entities_: If you export reimbursable expenses as Vendor Bills or Journal Entries, Expensify will automatically create a vendor in QuickBooks (If one does not already exist). Expensify will also automatically create a customer when exporting Invoices.
    - _Sync Reimbursed Reports_: Enabling will mark the Vendor Bill as paid in QuickBooks Online if you reimburse a report via ACH direct deposit in Expensify. If you reimburse outside of Expensify, then marking the Vendor Bill as paid in QuickBooks Online will automatically mark the report as reimbursed in Expensify.
        - _QuickBooks Account_: Select the bank account your reimbursements are coming out of, and we'll create the payment in QuickBooks.
        - _Collection Account_: When exporting invoices from Expensify to QuickBooks Online, the invoice will appear against the Collection Account once marked as Paid.

{% include faq-begin.md %}

## Why am I seeing duplicate credit card expenses in QuickBooks Online?

When importing a banking feed directly into QuickBooks Online while also importing transactions from Expensify, it’s possible to encounter duplicate entries in QuickBooks. To prevent this, follow these steps:

- Step 1: Complete the Approval Process in Expensify
Before exporting any expenses to QuickBooks Online, ensure they are added to a report and the report receives approval. Depending on your Workspace setup, reports may require approval from one or more individuals. The approval process concludes when the last user who views the report selects “Final Approve.”
- Step 2: Exporting Reports to QuickBooks Online
To ensure expenses exported from Expensify match seamlessly in the QuickBooks Banking platform, make sure these expenses are marked as non-reimbursable within Expensify and that “Credit Card” is selected as the non-reimbursable export option for your expenses.
- Step 3: Importing Your Credit Card Transactions into QuickBooks Online
After completing Steps 1 and 2, you can import your credit card transactions into QuickBooks Online. These imported banking transactions will align with the ones brought in from Expensify. QuickBooks Online will guide you through the process of matching these transactions, similar to the example below:

## What happens if the report can’t be exported to QuickBooks Online automatically?

If a report encounters an issue during automatic export to QuickBooks Online, you’ll receive an email with details about the problem, including any specific error messages. These messages will also be recorded in the report’s history section.

The report will be placed in your Home for your attention. You can address the issues there. If you need further assistance, refer to our QuickBooks Online Export Errors page or export the report manually.

## What happens to existing approved and reimbursed reports if I enable Auto Sync?

- If Auto Sync was disabled when your Workspace was linked to QuickBooks Online, enabling it won’t impact existing reports that haven’t been exported.
- If a report has been exported and reimbursed via ACH, it will be automatically marked as paid in QuickBooks Online during the next sync.
- If a report has been exported and marked as paid in QuickBooks Online, it will be automatically marked as reimbursed in Expensify during the next sync.
- Reports that have yet to be exported to QuickBooks Online won’t be automatically exported.

## Does splitting a non-reimbursable expense affect how it exports to QuickBooks Online?

When exporting non-reimbursable expenses as Credit Card or Debit Card expenses, split expenses will be consolidated it into a single credit card transaction in QuickBooks with multiple line items posted to the corresponding General Ledger accounts.

Pro-Tip: To ensure the payee field in QuickBooks Online reflects the merchant name for Credit Card expenses, ensure there’s a matching Vendor in QuickBooks Online. Expensify checks for an exact match during export. If none are found, the payee will be mapped to a vendor we create and labeled as Credit Card Misc. or Debit Card Misc.

## I’m using multi-currency in QuickBooks Online, how do I control the currency conversion rate?

When working with QuickBooks Online Multi-Currency, there are some things to remember when exporting Vendor Bills and Check! Make sure the vendor’s currency and the Accounts Payable (A/P) bank account match.

In QuickBooks Online, the currency conversion rates are not applied when exporting. All transactions will be exported with a 1:1 conversion rate, so for example, if a vendor’s currency is CAD (Canadian Dollar) and the home currency is USD (US Dollar), the export will show these currencies without applying conversion rates.

To correct this, you must manually update the conversion rate after the report has been exported to QuickBooks Online.

**Specifically for Vendor Bills**:

- If multi-currency is enabled and the Vendor’s currency is different from the Workspace currency, OR if QuickBooks Online home currency is foreign from the Workspace currency, then:
- We create the Vendor Bill in the Vendor’s currency (this is a QuickBooks Online requirement - we don’t have a choice)
- We set the exchange rate between the home currency and the Vendor’s currency
- We convert line item amounts to the vendor’s currency

## How will my Expensify Card transactions export to QuickBooks Online?

The Expensify Card transactions will always export as Credit Card charges in QuickBooks Online, even if the non-reimbursable setting is configured differently, such as a Vendor Bill.

{% include faq-end.md %}
