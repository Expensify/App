---
title: Configure Quickbooks Desktop
description: Configure Quickbooks Desktop
---
# How to configure export settings for QuickBooks Desktop
To Configure Settings, go to **Settings** > **Policies** > **Group** > _[Policy Name]_ > **Connections** and click **Configure**. Click on the Export tab.

## Preferred Exporter
This person is used in QuickBooks Desktop as the export user. They will also receive notifications for errors.

## Date
Choose either the report's submitted date, the report's exported date, or the date of the last expense on the report when exporting reports to QuickBooks Desktop.

## Use unique reference numbers
Enable this to allow use of a unique reference number for each transaction. Disable this to use the same Report ID for all expenses from a certain report.

## Reimbursable expenses
* **Vendor Bill (recommended):** A single itemized vendor bill for each Expensify report. An A/P account is required to export to a vendor bill.  
* **Check:** A single itemized check for each Expensify report.
* **Journal Entry:** A single itemized journal entry for each Expensify report.
    * When exporting as journal entries to an Accounts Payable, this requires a vendor record, not an employee. The vendor record must have the email address of the report creator/submitter. 
    * If the report creator/submitter also has an employee record, you need to remove the email, because Expensify will try to export to the employee record first for journal entries.

**Note on negative expenses:** In general, you can export negative expenses successfully to QuickBooks Desktop regardless of which export option you choose. The one thing to keep in mind is that if you have Check selected as your export option, the total of the report can not be negative.

**Note on exporting to Employee Records:** If you want to export reports to your users' Employee Records instead of their Vendor Records, you will need to select Check or Journal Entry for your reimbursable export option. There isn't a way to export as a Vendor Bill to an Employee Record. If you are setting up Expensify users as employees, you will need to activate QuickBooks Desktop Payroll to view the Employee Profile tab where submitter's email addresses need to be entered.


## Non-reimbursable expenses
**Credit Card Expenses:**
* Each expense will appear as a separate credit card transaction.
* The posting date will match your credit card statement.
* To display the merchant name in the payee field in QuickBooks Desktop, ensure that a matching Vendor exists in QuickBooks. Expensify searches for an exact match during export. If no match is found, the payee is mapped to a **Credit Card Misc.** Vendor created by Expensify.
* If you're centrally managing company cards through Domain Control, you can export expenses from each card to a specific QuickBooks account (detailed instructions available).
  
**Debit Card Expenses:**
* Expenses export as individual itemized checks for each Expensify report.
* The check is written to the "vendor," which is the person who created or submitted the report in Expensify.

**Vendor Bill:**
* Each Expensify report results in a single itemized vendor bill.
* The bill is associated with the "vendor," which is the individual responsible for creating or submitting the report in Expensify.

# How to configure coding for QuickBooks Desktop
To Configure Settings, go to **Settings** > **Policies** > **Group** > _[Policy Name]_ > **Connections** and click **Configure**. Click on the Coding tab.

## Categories
Expensify's integration with QuickBooks brings in your Chart of Accounts as Categories in Expensify automatically. Here's how to manage them:
1. After connecting, go to **Settings** > **Policies** > **Group** > _[Policy Name]_ > **Categories** to view the accounts imported from QuickBooks Desktop.
2. You can use the enable/disable button to choose which Categories your employees can access. Additionally, you can set specific rules for each Category via the blue settings cog.
3. Expensify offers Auto-Categorization to automatically assign expenses to the appropriate expense categories.
4. If needed, you can edit the names of the imported Categories to simplify expense coding for your employees. Keep in mind that if you make changes to these accounts in QuickBooks Desktop, the category names in Expensify will update to match them during the next sync.
5. _**Important:**_ Each expense must have a category selected to export to QuickBooks Desktop. The selected category must be one imported from QuickBooks Desktop; you cannot manually create categories within Expensify policy settings.

## Classes
Classes can be imported from QuickBooks as either tags (line-item level) or report fields (header level).

## Customers/Projects
You can bring in Customers/Projects from QuickBooks into Expensify in two ways: as tags (at the line-item level) or as report fields (at the header level). If you're utilizing Billable Expenses in Expensify, here's what you need to know:
* Customers/Projects must be enabled if you're using Billable Expenses.
* Expenses marked as "Billable" need to be tagged with a Customer/Project to successfully export them to QuickBooks.

## Items 
Items can be imported from QuickBooks as categories alongside your expense accounts.

{% include faq-begin.md %}
## How do I sync my connection?
1. Ensure that both the Expensify Sync Manager and QuickBooks Desktop are running.
2. On the Expensify website, navigate to **Settings** > **Policies** > **Group** > _[Policy Name]_ > **Connections** > **QuickBooks Desktop**, and click **Sync now**.
3. Wait for the syncing process to finish. Typically, this takes about 2-5 minutes, but it might take longer, depending on when you last synced and the size of your QuickBooks company file. The page will refresh automatically once syncing is complete.

We recommend syncing at least once a week or whenever you make changes in QuickBooks Desktop that could impact how your reports export from Expensify. Changes could include adjustments to your Chart of Accounts, Vendors, Employees, Customers/Jobs, or Items. Remember, both the Sync Manager and QuickBooks Desktop need to be running for syncing or exporting to work.

## How do I export reports?
The Sync Manager and QuickBooks Desktop both need to be running in order to sync or export.
* **Exporting an Individual Report:** You can export reports to QuickBooks Desktop one at a time from within an individual report on the Expensify website by clicking the "Export to" button.
* **Exporting Reports in Bulk:** To export multiple reports at a time, select the reports that you'd like to export from the Reports page on the website and click the "Export to" button near the top of the page.

Once reports have been exported to QuickBooks Desktop successfully, you will see a green QuickBooks icon next to each report on the Reports page. You can check to see when a report was exported in the Comments section of the individual report.

## Can I export negative expenses?
Generally, you can export negative expenses to QuickBooks Desktop successfully, regardless of your option. However, please keep in mind that if you have *Check* selected as your export option, the report's total cannot be negative.

## How does multi-currency work with QuickBooks Desktop?
When using QuickBooks Desktop Multi-Currency, there are some limitations to consider based on your export options:
1. **Vendor Bills and Checks:** The currency of the vendor and the currency of the account must match, but they do not have to be in the home currency.
2. **Credit Card:** If an expense doesn't match an existing vendor in QuickBooks, it exports to the **Credit Card Misc.** vendor created by Expensify. When exporting a report in a currency other than your home currency, the transaction will be created under the vendor's currency with a 1:1 conversion. For example, a transaction in Expensify for $50 CAD will appear in QuickBooks as $50 USD.
3. **Journal Entries:** Multi-currency exports will fail because the account currency must match both the vendor currency and the home currency.
