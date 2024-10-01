---
title: Configure Xero
description: Configure Xero
---

**Best Practices Using Xero**

A connection to Xero lets you combine the power of Expensify's expense management features with Xero's accounting capabilities. By following the recommended best practices below, your finances will be automatically categorized correctly and accounted for in the right place. 

- Configure your setup immediately after making the connection, and review each settings tab thoroughly.
- Keep Auto Sync enabled.
    - The daily auto sync will update Expensify with any changes to your chart of accounts, customers/projects, or bank accounts in Xero.
    - Finalized reports will be exported to Xero automatically, saving your admin team time with every report.
- Set your preferred exporter to a user who is both a workspace and domain admin. 
- Configure your coding settings and enforce them by requiring categories and tags on expenses. 

# Accessing the Xero Configuration Settings
Xero is connected at the workspace level, and each workspace can have a unique configuration that dictates how the connection functions. To access the configuration:

1. Click **Settings** near the bottom of the left-hand menu.
2. Navigate to Workspaces > Groups > [workspace Name] > Connections.
3. Scroll down to the Xero connection and click the **Configure** button to open the settings menu.

# Step 1: Configure Export Settings
The following steps help you determine how data will be exported from Expensify to Xero.

1. Click the **Configure** button under the Xero connection to open the settings menu.
2. Under the Export tab, review each of the following export settings:
    - **Preferred Exporter**: Choose a Workspace Admin to set as the Preferred Exporter. 
        - Concierge exports reports automatically on behalf of the preferred exporter.
        - Other Workspace Admins will still be able to export to Xero manually.
        - If you set different export bank accounts for individual company cards under your Domain > Company Cards, then your Preferred Exporter must be a Domain Admin in addition to Workspace Admin.
    - **Export reimbursable expenses and bills as**: Reimbursable expenses export as a Purchase Bill. This setting cannot be amended.
    - **Purchase Bill Date**: Choose whether to use the date of the last expense on the report, export date, or submitted date.
    - **Export invoices as**: All invoices exported to Xero will be as sales invoices. Sales invoices always display the date on which the invoice was sent. This setting cannot be amended.
    - **Export non-reimbursable expenses as**: Each exported expense posts as a bank transaction to the Xero bank account you select below, and transaction dates will match the dates on your bank statement.
    - **Xero Bank Account**: Select which bank account will be used to post bank transactions when non-reimbursable expenses are exported.

## Step 1B: Optional configuration when company cards are connected
1. Click **Settings** near the bottom of the left-hand menu.
2. Navigate to Domains > [domain name] > Company Cards.
3. If you have more than one company card connection, select the connection first. 
4. Locate the cardholder you want to configure in the list,
5. Click the **Edit Exports** button and assign the account the card expenses should export to in Xero.

# Step 2: Configure Coding settings
The following steps help you determine how data will be imported from Xero to Expensify.

1. Click the **Configure** button under the Xero connection to open the settings menu.
2. Under the Coding tab, review each of the following settings and configure the options to determine what information will be imported:
    - **Chart of Accounts**: Your Xero Chart of Accounts is imported into Expensify as expense categories. _This is enabled by default and cannot be disabled._
    - **Tax Rates**: When Enabled, your tax rates in Xero will be imported into your workspace. After being imported, you can find them on the [Tax](https://expensify.com/policy?param=%7B%22policyID%22:%22B936DE4542E9E78B%22%7D#tax) page of your workspace settings.
    - **Tracking Categories**: When Enabled, you can configure how Xero Cost Centres and Xero Regions import.
        - Xero contact default (applies the Xero contact default during export to Xero)
        - Tag (line-item level)
        - Report Field (header level)
    - **Billable Expenses**: When enabled, your Xero customer contacts will be imported as tags. Xero requires all billable expenses to have a customer tag to be able to be exported to Xero.

# Step 3: Configure advanced settings
The following steps help you determine the advanced settings for your connection, like auto-sync.

1. Click the **Configure** button under the Xero connection to open the settings menu.
2. Under the Advanced tab, review each of the following settings and configure the options you wish to use:
    - **Auto Sync**: When enabled, the connection will sync daily to ensure that the data shared between the two systems is up-to-date. 
        - New report approvals/reimbursements will be synced during the next auto-sync period. 
Reimbursable expenses will export after reimbursement occurs or the report is marked as reimbursed outside Expensify when using Direct or Indirect reimbursement.
        - Non-reimbursable expenses will export automatically after the report is final approved.
    - **Newly Imported Categories Should Be**: When a new account is created in the Xero chart of accounts, this setting controls whether the new category in Expensify is enabled or disabled by default. Disabled categories are not visible to employees when coding expenses.
    - **Set purchase bill status** (optional): Reimbursable expenses are exported as purchase bills with the status selected. The options available are:
        - Awaiting Payment (default)
        - Draft
        - Awaiting Approval
    - **Sync Reimbursed Reports**: When enabled, you can configure the Bill Payment and Invoice Collections accounts to be used when reimbursing reports and paying invoices. 
        - Anytime a report is reimbursed, or an invoice is paid through Expensify, the corresponding purchase bill or sales invoice in Xero will be marked as paid. 
        - Similarly, if a purchase bill or sales invoice is marked as paid in Xero, the related Expensify report or invoice will be automatically marked as reimbursed/paid.
    - **Xero Bill Payment Account**: Once the expense report is paid, your reimbursements will appear under this Xero Bill Payment account.
    - **Xero Invoice Collections Account**: If you are exporting invoices from Expensify, select the invoice collection account under which you want invoices to appear once they are marked as paid.

{% include faq-begin.md %}

## I have multiple organizations in Xero. Can I connect them all to Expensify?

Yes, you can connect each organization you have to Expensify. Here are some essential things to keep in mind:

- Organization Selection in the Workspace > Connections > Xero Configuration > Export settings tab: This option is available only if multiple organizations are configured in Xero.
- One Workspace, One Organization: Each Workspace can connect to just one organization at a time. It’s a one-to-one connection.
- Adding New Organizations: If you create a new organization in Xero after your initial connection, you’ll need to disconnect and then reconnect it to Xero. Don’t forget to take a screenshot of your current settings by clicking Configure and checking the Export, Coding, and Advanced tabs. This way, you can easily set everything up again.

## How can I view the purchase bills exported to Xero?

**To view the bills in Xero:**
1. Log into Xero.
2. Navigate to Business > Purchase Overview > Awaiting Payments. 
    - Bills will be payable to the individual who created and submitted the report in Expensify.

## How can I view the bank transactions in Xero?

**To view the transactions in Xero:**
1. Log into Xero.
2. Head over to your Dashboard.
3. Select your company card.
4. Locate the specific expense you’re interested in.

{% include faq-end.md %}
