---
title: Manage Company Credit Cards in Expensify
description: Learn how to assign, manage, and unassign company cards in Expensify to streamline expense tracking and maintain accurate transaction records.
keywords: [Expensify Classic, company cards, direct bank feeds, commercial card feeds]
---

Assigning company cards in Expensify ensures employees can seamlessly track business expenses, while administrators maintain accurate transaction records. This guide explains how to assign, manage, and unassign company cards to keep your expense management streamlined

## Main Uses
- **Streamlined Expense Tracking**: Automatically import credit card transactions to ensure accurate reporting and reconciliation.
- **Flexible Connection Options**: Connect cards via direct bank connections, commercial feeds, or CSV uploads.
- **Centralized Management**: Simplify administration of company cards and individual expenses within Expensify.

## Core Users
- **Domain Admins**: Manage credit card connections and assignments across the organization.
- **Employees**: Track and manage their assigned card transactions.
- **Finance Teams**: Ensure accurate reporting and reconciliation of expenses.

## Advantages
- **Automation**: Reduce manual entry with automatic imports for supported card programs.
- **Compatibility**: Support for major banks and custom CSV uploads for unsupported cards.
- **Control**: Assign, manage, and configure credit cards in one central place.

---
# Key Concepts

## Direct Bank Connections
A direct bank connection links Expensify to your bank for automatic transaction imports.

- **Supported Banks**: Includes major institutions like Chase, Amex, Citibank, Wells Fargo, and others.
- **Credentials**: Requires master administrative login credentials.
- **Import History**: Banks typically provide 30-90 days of historical transactions.
- **Troubleshooting**: If your connection fails, ensure your bank login credentials are correct and security questions are up to date. Disable two-factor authentication temporarily if necessary, as Expensify cannot bypass it. Use the "Fix Card" option in **Settings > Domains > [Domain Name] > Company Cards** to resolve issues.

## Commercial Card Feed
A commercial card feed is a direct connection between Expensify and your bank for reliable daily transaction imports.

- **Supported Networks**: Visa, Mastercard, and American Express.
- **Setup**: Initiated by your bank and configured in Expensify.
- **Advantages**: More stable and not affected by changes to login credentials.
- **Deep Dive**: For Mastercard, use the Common Data File (CDF) format; for Visa, enable the Variant Call Format (VCF). American Express requires specific forms. Ensure you provide accurate distribution IDs and start dates during setup to avoid data gaps.

## CSV Upload
A CSV upload is a manual method for importing credit card transactions into Expensify.

- **File Formats**: Accepts CSV, OFX, QFX, or XLS files.
- **Minimum Required Fields**: Includes card number, date, merchant, amount, and currency.
- **Use Case**: Ideal for unsupported banks or importing older transactions.
- **Common Issues**: If you encounter errors such as "Attribute value mapping is missing," ensure all required fields are included and formatted correctly. Use Expensify’s [CSV template](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1594908368712-Best+Example+CSV+for+Domains.csv) as a guide.

---
# Direct Connection: How do I connect credit cards via direct bank connection?
1. Go to **Settings > Domains > [Domain Name] > Company Cards**.
2. Click **Import Card**.
3. Select your card issuer and enter the master administrative login credentials.
4. Assign accounts to cardholders.
5. Set a start date to determine which transactions will appear.

---
# Commercial Card Feed: How do I set up a commercial card feed?

## Mastercard
1. Contact your bank and request a Common Data File (CDF) feed for Expensify.
2. Provide the desired start date for transaction imports.
3. Submit the distribution ID to Expensify via the [submission form](https://expensify.typeform.com/to/cGlCAz).
4. Expensify will notify you once the feed is enabled.

## Visa
1. Request a Variant Call Format (VCF) feed for Expensify from your bank.
2. Obtain the feed file name or raw file information.
3. Submit the file details via the [submission form](https://expensify.typeform.com/to/cGlCAz).

## American Express
1. Complete the required [Amex forms](https://drive.google.com/file/d/1zqDA_MCk06jk_fWjzx2y0r4gOyAMqKJe/view?usp=sharing).
2. Email the forms to American Express.
3. Submit the provided production file information to Expensify.

---
# CSV Upload: How do I import credit card transactions using a CSV?
1. Download your card transactions from your bank in CSV, OFX, QFX, or XLS format.
2. Format the CSV for upload using [this template](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1594908368712-Best+Example+CSV+for+Domains.csv) as a guide -- be sure to include the card number, date, merchant, amount, and currency.
     - You can also add mapping for Categories and Tags, but those parameters are optional.
       
![Your CSV template should include, at a minimum, a column for the card number, posted date, merchant, posted amount, and posted currency.](https://help.expensify.com/assets/images/csv-01.png){:width="100%"}

3. Go to **Settings > Domains > [Domain Name] > Company Cards > Manage/Import CSV**.
4. Upload the file and map the fields to Expensify’s requirements.
5. Review the Output Preview for errors and submit the file.


![Click Manage/Import CSV located in the top right between the Issue Virtual Card button and the Import Card button.](https://help.expensify.com/assets/images/csv-02.png){:width="100%"}

---
# Assign Cards: How do I assign cards to employees?
1. Go to **Settings > Domains > [Domain Name] > Company Cards**.
2. Select the card feed from the dropdown list.
3. Click **Assign New Cards** and select the employee’s email and card number.
4. (Optional) Set a transaction start date.
5. Click **Assign** to complete the process.

![Click the dropdown located right below the Imported Cards title near the top of the page. Then select a card from the list.](https://help.expensify.com/assets/images/csv-03.png){:width="100%"}

![Under the Company Cards tab on the left, you'll use the dropdown menu to select a card and beneath that, you'll click Assign New Cards]({{site.url}}/assets/images/CompanyCards_Assign.png){:width="100%"}

---
# Unassign Cards: How do I unassign cards?
1. Go to **Settings > Domains > [Domain Name] > Company Cards**.
2. Locate the card and click **Actions > Unassign**.
3. (Optional) To remove the card feed, unassign all associated cards and refresh the page.

_**Note: Unassigning a card deletes all open or unreported expenses linked to it.**_

![Click the Actions button to the right of the card and select Unassign.]({{site.url}}/assets/images/CompanyCards_Unassign.png){:width="100%"}

---
# Configure Company Card Settings
1. Go to **Settings > Domains > [Domain Name] > Company Cards > Settings**.
2. Adjust preferences for:
   - **Preferred Workspace**: Ensures transactions are reported to a specific workspace.
   - **Reimbursable Preference**: Controls whether expenses are flagged as reimbursable or non-reimbursable.
   - **Liability Type**: Set the corporate or personal liability settings for company card expenses. Corporate liability prevents users from deleting company card expenses, while personal liability allows users to manage and delete their company card expenses.
3. Save the settings to apply changes.

![Near the top right, click the Settings tab that is located between the Card List and Reconciliation tabs.](https://help.expensify.com/assets/images/compcard-01.png){:width="100%"} 

## Export Company Card Expenses to a Connected Accounting Integration: Centralized General Ledger Account

For businesses using accounting integrations like QuickBooks or NetSuite, connect the cards to export expenses to specific general ledger (GL) accounts via the "Edit Exports" option.

![Find the desired card in the table. In that same row, click Edit Exports.](https://help.expensify.com/assets/images/cardfeeds-02.png){:width="100%"} 

**To export credit card expenses to a pooled GL account:**
1. Navigate to **Settings > Workspaces**.  
2. Select the appropriate **Workspace**.  
3. Open the **Connections** tab.  
4. Under **Accounting Integrations**, click **Configure** next to the relevant integration.  
5. In the **Non-reimbursable Export** section, select **Credit Card / Charge Card / Bank Transaction**.  
6. Review the **Export Settings** page to ensure proper expense report export to NetSuite.  
7. Choose the **Vendor/Liability Account** for exporting all non-reimbursable expenses.  

## Exporting to Individual General Ledger Accounts 

1. Navigate to **Settings > Domains**.  
2. Select the appropriate **Domain**.  
3. Click **Edit Exports** next to the relevant card.  
4. Select the **General Ledger (GL) Account** for expense exports.  

---

# FAQ

## Missing Transactions: Why aren’t all transactions appearing?
Transactions may take up to 24 hours to post. Update the card feed or check the Reconciliation Dashboard to review transaction data.

- **Reconciliation Dashboard**: Navigate to **Settings > Domains > [Domain Name] > Company Cards > Reconciliation** to identify missing or unapproved expenses within a specific timeframe.
- **Common Issues**: Ensure the transaction date range is correct. If gaps persist, contact Concierge to request a historical data update.

## Direct vs. Commercial Feeds: Which option is better?
Commercial feeds are more stable and reliable but require setup by your bank. Direct connections are easier to set up but may experience occasional disruptions.

## CSV Upload Errors: What should I do if my upload fails?
Ensure the file includes the required fields and matches the formatting guidelines. Use Expensify’s [CSV template](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1594908368712-Best+Example+CSV+for+Domains.csv) for reference.

## Unassigning Cards: What happens when I unassign a card?
Unassigning a card deletes all draft or unreported expenses linked to it. Submitted or processed expenses remain unaffected.

## Connection Issues: Why is my card connection broken?
Check for changes to bank credentials, security questions, or login details. Update the information in Expensify and re-establish the connection via **Fix Card**.

## Historical Data: How far back can I import transactions?
Most banks provide 30-90 days of historical data. Older transactions can be imported using the CSV upload method.

