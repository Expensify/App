---
title: The Xero Integration
description: Everything you need to know about Expensify's direct integration with Xero
order: 1
---

# About

The integration enables seamless import of expense accounts into Expensify and sends expense reports back to Xero as purchasing bills awaiting payment or "spend money" bank transactions.

# How-to Connect to Xero

## Prerequisites

You must be a Workspace Admin in Expensify using a Collect or Control Workspace to connect your Xero account to Expensify.

## Connect Expensify and Xero

1. Let's get started by heading over to your Settings. You can find it by following this path: *Settings > Workspaces > Groups > [Workspace Name] > Connections > Xero.*
2. To connect Expensify to Xero, click on the "Connect to Xero” button, then choose "Create a new Xero connection."
3. Next, enter your Xero login details. After that, you'll need to select the Xero organization you want to link with Expensify. Remember, you can connect one organization for each Workspace.

One important note: Starting in September 2021, there's a chance for Cashbook and Ledger-type organizations in Xero. Apps like Expensify won't be able to create invoices and bills for these accounts using the Xero API. So, if you're using a Cashbook or Ledger Xero account, please be aware that this might affect your Expensify integration.

# How to Configure Export Settings for Xero

When you integrate Expensify with Xero you gain control over several settings that determine how your reports will be displayed in Xero. To manage these settings simply follow this path: *Settings > Workspaces > Group > [Workspace Name] > Connections > Accounting Integrations > Xero > Configure > Export*. This is where you can fine-tune how your reports appear on the Xero side, making your expense management a breeze!

## Xero Organization 

When you have multiple organizations set up in Xero you can choose which one you'd like to connect. Here are some essential things to keep in mind:

1. Organization Selection: You'll see this option only if you have multiple organizations configured in Xero.
2. One Workspace, One Organization: Each Workspace can connect to just one organization at a time. It's a one-to-one connection.
3. Adding New Organizations: If you create a new organization in Xero after your initial connection, you'll need to disconnect and then reconnect it to Xero. Don't forget to take a screenshot of your current settings by clicking on "Configure" and checking the Export, Coding, and Advanced tabs. This way, you can easily set everything up again.

Now you can seamlessly manage your connections with Xero while staying in control of your configurations!

## Preferred Exporter

Any Workspace admin can export to Xero, but only the preferred exporter will see reports that are ready for export in their Home.
 
## Reimbursable Expenses

Export to Xero as bills awaiting payment with the following additional settings:

- Bill date — the bill is posted on the last day of the month in which expenses were incurred.

To view the bills in Xero, navigate to *Business > Purchase Overview > Awaiting Payments*. Bills will be payable to the individual who created and reported the expense. 

## Non-reimbursable Expenses

When you export non-reimbursable expenses, like company card transactions, to Xero they'll show up as bank transactions. Each expense is neatly listed as a separate line item in the bank account of your choice. Plus the transaction date matches the date on your bank statement for seamless tracking.

To check out these expenses in Xero please follow these steps:

1. Head over to your Dashboard.
2. Select your company card.
3. Locate the specific expense you're interested in.

If you're managing company cards centrally, you can export expenses from each card to a designated account in Xero using Domains. This way, you have complete control and clarity over your company's finances!

# How to Configure Coding for Xero

The Coding tab in Expensify is where you configure Xero information to ensure accurate expense coding by your employees. Here's how you can access these settings:

1. Navigate to Settings.
2. Go to Workspace within your specified group (Workspace Name).
3. Click on Connections, and then hit the Configure button.
4. Now, select the Coding tab.

## Categories

Xero expense accounts and those marked "Show In Expense Claims" will be automatically imported into Expensify as Categories.

To manage these categories, follow these steps:

1. After connecting, go to *Settings > Workspaces > Groups > [Workspace Name] > Categories*.
2. You can enable/disable categories using the checkbox.
3. For specific category rules (like default tax rate, maximum amount, receipts required, comments, and comment hints), click the settings cog.
4. Note that each expense must have a category selected for it to export to Xero, and these categories need to be imported from Xero; manual creation isn't an option within Workspace settings.

## Tracking Categories

1. If you use Tracking categories in Xero, you can import them into Expensify as Tags, Report Fields, or the Xero contact default.
- Tags apply a tracking category per expense.
- Report Field applies a tracking category to the entire report.
- Xero contact default applies the default tracking category set for the submitter in Xero.

## Tax

Looking to track tax in Expensify? Make sure that you have tax rates enabled in Xero and we will automatically grab those rates from Xero to allow your employees to categorize expenses with the appropriate tax rate. As an admin, you have the ability to set a default rate and also hide rates that are not applicable to the Workspace members.

Tax tracking allows you to apply a tax rate and tax amount to each expense.
1. To set this up, enable Tax tracking in your Xero configuration.
2. After connecting, go to *Settings > Workspaces > Groups > [Workspace Name] > Tax to manage imported taxes from Xero.*
3. You can enable/disable taxes and set default tax rates for both Workspace currency expenses and foreign currency expenses.

## Billable Expenses

If you bill expenses to your customers, you can track and invoice them using Expensify and Xero.

1. When enabled, Xero customer contacts are imported into Expensify as Tags for expense tracking.
- Note: In Xero, a Contact isn't a 'Customer' until they've had a bill raised against them. If you don't see your Customer imported as a tag, try raising a dummy invoice in Xero and then deleting/voiding it.
2. After exporting to Xero, tagged billable expenses can be included on a sales invoice to your customer.

Please ensure that you meet the following requirements for expenses to be placed on a sales invoice:
1. Billable Expenses must be enabled in the Xero configuration settings.
2. The expense must be marked as billable.
3. The expense must be tagged with a customer.

These steps should help you seamlessly manage your Xero integration within Expensify.

# How to Configure Xero’s Advanced Settings

If you've already set up your integration, but want to make adjustments, simply follow these steps:

1. Go to Settings.
2. Then, navigate to Workspaces within your designated group [Workspace Name].
3. Click on Connections, and next, hit the Configure button.

From there, you can dive into the "Advanced" tab to make any additional tweaks.

## Auto Sync

For non-reimbursable reports: Once a report has completed the approval workflow in Expensify, we'll automatically queue it for export to Xero.

But, if you've added a business bank account for ACH reimbursement, any reimbursable expenses will be sent to Xero automatically when the report is marked as reimbursed or enabled for reimbursement.

### Controlling Newly Imported Categories: 

You can decide how newly imported categories behave in Expensify:

1. Enabling or disabling this control determines the status of new categories imported from Xero to Expensify. Enabled categories are visible for employees when they categorize expenses, while disabled categories remain hidden.

These settings give you the flexibility to manage your expenses and Workspace in the way that best suits your needs!

## Sync Reimbursed Reports

This nifty setting lets you synchronize the status of your reports between Expensify and Xero. Utilizing this setting will make sure that there is no confusion or possibility that a reimbursable report is paid out twice by mistake or that a non-reimbursable report is double entered throwing off month-end reconciliation. Here's how it works:

1. When you reimburse a report via ACH direct deposit within Expensify, the purchase bill will automatically be marked as paid in Xero, and Expensify will note it as reimbursed.
2. Don't forget to pick the Xero account where the corresponding bill payment should be recorded.
3. It's a simple way to keep everything in sync, especially when you're awaiting payment.

# Deep Dive

## An Automatic Export Fails

Sometimes, reports may encounter issues during automatic export to Xero. Not to worry, though! Here's what happens:

1. The Technical Contact, your go-to person for technical matters, will receive an email explaining the problem.
2. You'll also find specific error messages at the bottom of the report.
3. To get things back on track, the report will be placed in the preferred exporter’s Home. They can review it and resolve any issues.

## Consider Enforcing Expense Workspace Workflows: 

For added control, you can adjust your Workspace settings to strictly enforce expense Workspace. This way, you guarantee that your Workspace’s workflow is always followed. By default this flow is in place, but employees can modify the person they submit their reports to if it's not strictly enforced.

## Customize Purchase Bill Status (Optional): 

You have the flexibility to set the status of your purchase bills just the way you want. Choose from the following options:

1. Draft: Keep bills in a draft state until you're ready to finalize them.
2. Awaiting Approval: If you need approval before processing bills, this option is here for you.

## Multi-Currency

### Handling Multi-Currency in Xero

When dealing with multi-currency transactions in Xero and exporting reimbursable expenses from Expensify here's what you need to know:

1. The bill created in Xero will adopt the output currency set in your Expensify Workspace, provided that it's enabled in Xero.
2. Your general ledger reports will automatically convert to your home currency in Xero, leveraging the currency exchange rates defined in your Xero settings. It ensures everything aligns seamlessly.

Now, for non-reimbursable expenses, things work slightly differently:

1. Bank transactions will use the currency specified in your bank account in Xero, regardless of the currency used in Expensify.
2. If these currencies don't match, no worries! We apply a 1:1 exchange rate to make things smooth. To ensure a hassle-free experience, just ensure that the output currency in Expensify matches the currency specified in your Xero bank account.

## Tax

### Enabling Tax Tracking for Seamless Integration:

To simplify tax tracking, enable it in your Xero configuration. This action will automatically bring all your Xero tax settings into Expensify, turning them into usable Taxes.

### After connecting your Xero account with Expensify:

1. Head to Settings.
2. Navigate to Workspaces within your specific group [Workspace Name].
3. Click on Tax to view the taxes that have been imported from Xero.

Now, here's where you can take control:

1. Use the enable/disable button to choose which taxes your employees can apply to their expenses. Customize it to fit your needs.
2. You can set a default tax rate for expenses in your Workspace currency. Additionally, if you deal with foreign currency expenses, you have the option to set another default tax (including exempt) that will automatically apply to all new expenses in foreign currencies.

This setup streamlines your tax management, making it effortless for your team to handle taxes on their expenses.

## Export Invoices to Xero

You can effortlessly export your invoices from Expensify to Xero and even attribute them to the right Customer. Plus, when you mark an invoice as paid in Expensify, the same status will smoothly transfer to Xero and vice versa, keeping your invoice tracking hassle-free. Let's dive in:

### Setting up Invoice Export to Xero:

1. Navigate to Settings.
2. Go to Workspaces within your designated group [Workspace Name].
3. Click on Connections, then select Configuration.
4. Now, click on the Advanced tab.

### Selecting Your Xero Invoice Collection Account:

1. Scroll down until you find "Xero invoice collection account." You'll see a dropdown list of your available Accounts Receivable accounts imported from Xero.
2. Simply choose the account where you'd like your invoices to be exported.

Pro Tip: If you don't see any accounts in the dropdown, try syncing your Xero connection. To do this, go back to the Connections page and hit "Sync Now."

### Exporting an Invoice to Xero:

Invoices will automatically make their way to Xero when they're in the Processing or Paid state. This ensures consistent tracking of unpaid and paid invoices. However, if you have Auto Sync disabled, you'll need to manually export your invoices along with your expense reports. Here's how:

1. Head to your Reports page.
2. Use the filters to locate the invoices you want to export.
3. Select the invoices you wish to export.
4. Click Export to > Xero on the top right-hand side.

### Matching Customers and Emails:

When exporting to Xero, we match the recipient's email address with a customer record in Xero. So, make sure each customer in Xero has their email listed in their profile.
If we can't find a match, we'll create a new customer record in Xero.

### Updating Invoice Status:

1. When you mark an invoice as Paid in Expensify, this status will automatically reflect in Xero.
2. Similarly, if you mark an invoice as Paid in Xero, it will update automatically in Expensify.
3. The payment will be recorded in the Collection account you've chosen in your Advanced Settings Configuration.

And that's it! You've successfully set up and managed your invoice exports to Xero, making your tracking smooth and efficient.

{% include faq-begin.md %}

## Will receipt images be exported to Xero?

Yes! The receipt images will be exported to Xero. To see them in Xero click the 'paper' icon in the upper right corner of the expense details and view a PDF of the Expensify report including the receipt image.

## How does Auto Sync work if your workspace was initially connected to Xero with Auto Sync disabled?

You can safely switch it on without affecting existing reports that haven't been exported.

## How does Auto Sync work if a report has already been exported to Xero and reimbursed through ACH or marked as reimbursed in Expensify?

It will be automatically marked as paid in Xero during the next sync. You may either manually update by clicking Sync Now in the Connections tab or Expensify does this on your behalf overnight every day!

## How does Auto Sync work if a report has been exported to Xero and marked as paid in Xero?

It will be automatically marked as reimbursed in Expensify during the next sync. If you need it updated immediately please go to the Connections tab and click Sync Now or if you can wait just let Expensify do it for you overnight.

## How does Auto Sync work if a report has been exported to Xero and marked as paid in Xero?

Reports that haven't been exported to Xero won't be sent automatically.


{% include faq-end.md %}
