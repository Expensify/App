---
title: Configure Quickbooks Desktop
description: Configure Quickbooks Desktop
---
Our new QuickBooks Desktop integration allows you to automate the import and export process with Expensify.

# Step 1: Configure export settings
The following steps will determine how data will be exported from Expensify to QuickBooks Desktop.

![Expensify export settings page for the QuickBooks Desktop integration](https://help.expensify.com/assets/images/quickbooks-desktop-export-settings.png
){:width="100%"}

1. In Expensify, hover over **Settings** and click **Workspaces**.
2. Select the Workspace you want to connect to QuickBooks Desktop.
3. Click the **Connections** tab. 
4. Click **Export** under the QuickBooks Desktop connection.
5. Review each of the following export settings:
- **Preferred Exporter**: This person is used in QuickBooks Desktop as the export user. They will receive notifications for errors, as well as prompts to export reports via the Home page of their Expensify account.
- **Date**: You can choose either the report’s submitted date, the report’s exported date, or the date of the last expense on the report when exporting reports to QuickBooks Desktop.
- **Unique reference numbers**: Enable this to allow the use of a unique reference number for each transaction. Disable this to use the same Report ID for all expenses from a certain report.
- **Reimbursable expenses**: Reimbursable options include:
        - **Vendor Bill (recommended)**: A single itemized vendor bill for each Expensify report. An A/P account is required to export to a vendor bill.
        - **Check**: A single itemized check for each Expensify report.
        - **Journal Entry**: A single itemized journal entry for each Expensify report.
- **Non-reimbursable expenses**: Non-reimbursable options include:
        - **Vendor Bill**: Each Expensify report results in a single itemized vendor bill. The bill is associated with the “vendor,” which is the individual responsible for creating or submitting the report in Expensify.
        - **Credit Card expenses**: Each expense appears as a separate credit card transaction with a post date that matches your credit card statement. If you centrally manage company cards through your domain, you can export expenses from each card to a specific QuickBooks account by clicking Edit Exports next to each user’s card. To display the merchant name in the payee field in QuickBooks Desktop, ensure that a matching Vendor exists in QuickBooks. Expensify searches for an exact match during export. If no match is found, the payee is mapped to a Credit Card Misc. Vendor created by Expensify.
        - **Debit Card expenses**: Expenses are exported as individual itemized checks for each Expensify report. The check is written to the “vendor,” which is the person who created or submitted the report in Expensify.

# Step 2: Configure coding/import settings

The following steps help you determine how data will be imported from QuickBooks Online to Expensify:

![Expensify coding settings page for the QuickBooks Desktop integration](https://help.expensify.com/assets/images/quickbooks-desktop-coding-settings.png
){:width="100%"}

1. Click Import under the QuickBooks Online connection.
2. Review each of the following import settings:
- **Chart of Accounts**: The Chart of Accounts is automatically imported from QuickBooks Desktop as categories. This cannot be amended.
- **Classes**: Choose whether to import classes, which will be shown in Expensify as tags for expense-level coding.
- **Customers/Projects**: Choose whether to import customers/projects, which will be shown in Expensify as tags for expense-level coding.
- **Locations**: Choose whether to import locations, which will be shown in Expensify as tags for expense-level coding.

# Step 3: Configure advanced settings

The following steps help you determine the advanced settings for your connection, like auto-sync and employee invitation settings.

![Expensify advanced settings page for the QuickBooks Desktop integration](https://help.expensify.com/assets/images/quickbooks-desktop-advanced-settings.png
){:width="100%"}

1. Click **Advanced** under the QuickBooks Desktop connection.
2. **Enable or disable Auto-Sync**: If enabled, QuickBooks Desktop automatically communicates changes with Expensify to ensure that the data shared between the two systems is up to date. New report approvals/reimbursements will be synced during the next auto-sync period.

{% include info.html %}
Please note that Auto-Sync will queue information to be added to your QuickBooks Company File the next time both your QuickBooks Company File and QuickBooks Web Connector are open.
{% include end-info.html %}

# FAQ

## **How do I manually sync my QuickBooks Desktop if I have Auto-Sync disabled?**

To manually sync your connection: 

1. In Expensify, hover over **Settings** and select **Workspaces**. 
2. Click the Workspace name that is connected to QuickBooks Desktop.
3. Click the **Connections** tab on the left. 
4. Click **Sync Now** under QuickBooks Desktop.

{% include info.html %}
For manual syncing, we recommend completing this process at least once a week and/or after making changes in QuickBooks Desktop that could impact how reports export from Expensify. Changes may include adjustments to your chart of accounts, vendors, employees, customers/jobs, or items. Remember: Both the Web Connector and QuickBooks Desktop need to be running for syncing or exporting to work.
{% include end-info.html %}

## **Can I sync Expensify and QuickBooks Desktop (QBD) and use the platforms at the same time?**

When syncing Expensify to QuickBooks Desktop, we recommend waiting until the sync finishes to access either Expensify and/or QuickBooks Desktop, as performance may vary during this process. You cannot open an instance of QuickBooks Desktop while a program is syncing - this may cause QuickBooks Desktop to behave unexpectedly.

## **What are the different types of accounts that can be imported from Quickbooks Desktop?**

Here is the list of accounts from QuickBooks Desktop and how they are pulled into Expensify:

| QBD account type  | How it imports to Expensify |
| ------------- | ------------- |
| Accounts payable  | Vendor bill or journal entry export options  |
| Accounts receivable  | Do not import  |
| Accumulated adjustment  | Do not import  |
| Bank  | Debit card or check export options  |
| Credit card  | Credit card export options  |
| Equity  | Do not import  |
| Fixed assets  | Categories  |
| Income  | Do not import  |
| Long-term liabilities  | Do not import  |
| Other assets  | Do not import  |
| Other current assets  | Categories or journal entry export options  |
| Other current liabilities  | Journal Entry export options if the report creator is set up as an Employee within QuickBooks  |
| Other expense  | All detail types except Exchange Gain or Loss import as categories; Exchange Gain or Loss does not import  |
| Other income  | Do not import  |

## **Why are exports showing as “Credit Card Misc.”?**

When exporting as credit or debit card expenses, Expensify checks for an exact vendor match. If none are found, the payee will be mapped to a vendor that Expensify will automatically create and label as Credit Card Misc. or Debit Card Misc. 

If you centrally manage your company cards through domains, you can export expenses from each card to a specific account in QuickBooks:

1. In Expensify, hover over Settings and click Domains.
2. Select the desired domain.
3. Click the **Company Cards** tab. 
4. Click **Export**.

## **How does multi-currency work with QuickBooks Desktop?**

When using QuickBooks Desktop Multi-Currency, there are some limitations to consider based on your export options:

- **Vendor Bills and Checks**: The currency of the vendor and the currency of the account must match, but they do not have to be in the home currency.
- **Credit Card**: If an expense doesn’t match an existing vendor in QuickBooks, it exports to the Credit Card Misc. vendor created by Expensify. When exporting a report in a currency other than your home currency, the transaction will be created under the vendor’s currency with a 1:1 conversion. For example, a transaction in Expensify for $50 CAD will appear in QuickBooks as $50 USD.
- **Journal Entries**: Multi-currency exports will fail because the account currency must match both the vendor currency and the home currency.
