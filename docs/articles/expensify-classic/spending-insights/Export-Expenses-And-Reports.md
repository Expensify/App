---
title: Export Expenses and Reports
description: How to export expenses and reports using custom reports, PDF files, CSVs, and more
keywords: [Expensify Classic, export expense reports]
---


Expensify offers multiple ways to export your expenses and reports:
- **Export as a PDF**
- **Export as a CSV or to an accounting integration**
- **Use a default or custom export template**

**Note:** You cannot export files using the Expensify mobile app.

---

# Export as a PDF

1. Click the **Reports** tab.
2. Open the report you want to export.
3. Click **Details** in the top-right corner.
4. Click the **Download** icon.

The PDF will include all expenses, attached receipts, and report notes.

---

# Export as a CSV or Apply a Template

1. Click either the **Expenses** or **Reports** tab.
2. Select the expenses or reports you want to export from the left-hand menu.
3. Click **Export to** in the top-right corner.
4. Choose an export format:
   - **All Data - Expense Level Export**: One row per expense, including all associated data.
   - **All Data - Report Level Export**: One row per report, summarizing report data.
   - **Basic Export**: A simplified expense-level export including essential details like date, amount, merchant, category, and receipt URL.
   - **Canadian Multiple Tax Export**: Includes tax details for each expense.
   - **Category Export**: Summarizes expenses by category.
   - **Per Diem Export**: Exports only per diem expenses.
   - **Tag Export**: Summarizes expenses by tag.

**Note:** Default templates and exports to accounting software are only available on the **Reports** page.

---

# Create a Custom Export Template

If your accounting system accepts CSV files, you can create a custom export template to format your data for easy upload. Templates can be created for either **workspace-wide** use or **personal use**.

## Create a Template for a Workspace

**Note:** You must be a Company Workspace Admin to do the following:

1. Go to **Settings > Workspaces** and select your workspace.
2. Click the **Export Formats** tab.
3. Click **New Export Format**.
4. Name your export format.
5. Select the format type (**CSV, XLS, or CSV without BOM**).
6. Add columns by entering a name and formula (see formulas below).
7. Adjust columns as needed:
   - Click **Add Column** to add more.
   - Drag and drop columns to reorder them.
   - Click the red **X** to remove a column.
8. Review the **Example Output** section.
9. Click **Save Export Format**.

## Create a Template for Personal Use

1. Go to **Settings > Account > Preferences**.
2. Under **CSV Export Formats**, click **New Export Format**.
3. Follow steps 4-9 from the workspace template instructions.

---

# Formulas

Enter any of the following formulas into the Formula field for each column. Be sure to also include both brackets around the formula as shown in the table below.

## Report level

| Formula | Description |
| -- | -- |
| Report title | The title of the report the expense is part of. |
| {report:title} | Would output "Expense Expenses to 2019-11-05" assuming that is the report's title.|
| Report ID |  Number is a unique number per report and can be used to identify specific reports.|
| {report:id} | Would output R00I7J3xs5fn assuming that is the report's ID.|
| Old Report ID | A unique number per report and can be used to identify specific reports as well. Every report has both an ID and an old ID - they're simply different ways of showing the same information in either base10 or base62. |
| {report:oldID} | Would output R3513250790654885 assuming that is the report's old ID.|
| Reimbursement ID | The unique number for a report that's been reimbursed via ACH in Expensify. The reimbursement ID is searchable on the Reports page and is found on your bank statement in the line-item detail for the reimbursed amount.|
| {report:reimbursementid} | Would output 123456789109876 assuming that is the ID on the line-item detail for the reimbursed amount in your business bank account.|
| Report Total | The total amount of the expense report.|
| {report:total} | Would output $325.34 assuming that is the report's total.|
| Type | Is the type of report (either Expense Report, Invoice or Bill)|
| {report:type} | Would output "Expense Report" assuming that is the report's type.|
| Reimbursable Total | Is the total amount that is reimbursable on the report.|
| {report:reimbursable} | Would output $143.43 assuming the report's reimbursable total was 143.43 US Dollars.|
| Currency | Is the currency to which all expenses on the report are being converted.|
| {report:currency}  | Would output USD  assuming that the report total was calculated in US dollars.|
|| Note - Currency accepts an optional three character currency code or NONE. If you want to do any math operations on the report total, you should use {report:total:nosymbol} to avoid an error. Please see Expense:Amount for more information on currencies.|
| Report Field | Formula will output the value for a given Report Field which is created in the workspace settings.|
| {field:Employee ID} | Would output 12456 , assuming "Employee ID" is the name of the Report Field and "123456" is the value of that field on the report.|
| Created date | The expense report was originally created by the user.|
| {report:created} | Would output 2010-09-15 12:00:00 assuming the expense report was created on September 15th, 2010 at noon.|
| {report:created:yyyy-MM-dd} | Would output 2010-09-15 assuming the expense report was created on September 15, 2010.|
| | Note -  All Date Formulas accept an optional format string. The default if one is not provided is yyyy-MM-dd hh:mm:ss.  For a full breakdown, check out the Date Formatting [here](https://help.expensify.com/articles/expensify-classic/spending-insights/Export-Expenses-And-Reports#date-formats).|
| StartDate | Is the date of the earliest expense on the report.|
| {report:startdate} | Would output 2010-09-15 assuming that is the date of the earliest expense on the report.|
| EndDate|  Is the date of the last expense on the report.|
| {report:enddate} | Would output 2010-09-26 assuming that is the date of the last expense on the report.|
| Scheduled Submit Dates | The start and end dates of the Scheduled Submit reporting cycle.|
| {report:autoReporting:start} | Would output 2010-09-15 assuming that is the start date of the automatic reporting cycle, when the automatic reporting frequency is not set to daily.|
| {report:autoReporting:end} | Would output 2010-09-26 assuming that is the end date of the automatic reporting cycle, when the automatic reporting frequency is not set to daily.|
| Submission Date | Is the date that the report was submitted.|
| {report:submit:date} | Would output 1986-09-15 12:00:00 assuming that the report was submitted on September 15, 1986, at noon.|
| {report:submit:date:yyyy-MM-dd} | Would output 1986-09-15 assuming that the report was submitted on September 15, 1986.|
| | Note -  All Date Formulas accept an optional format string. The default if one is not provided is yyyy-MM-dd hh:mm:ss.  For a full breakdown, check out the Date Formatting.|
| Approval Date | The date the report was approved. This formula can be used for export templates, but not for report titles.|
| {report:approve:date} | Would output 2011-09-25 12:00:00 assuming that the report was approved on September 25, 2011, at noon.|
| {report:approve:date:yyyy-MM-dd} | Would output 2011-09-25 assuming that the report was approved on September 25, 2011.|
| Reimbursement Date | The date an expense report was reimbursed. This formula can be used for export templates, but not for report titles.|
| {report:achreimburse} | Would output 2011-09-25 assuming that is the date the report was reimbursed via ACH Direct Deposit.|
| {report:manualreimburse} | Would output 2011-09-25 assuming that is the date the report was marked as reimbursed. |
| Export Date | Is the date when the report is exported. This formula can be used for export templates, but not for report titles.|
| {report:dateexported} | Would output 2013-09-15 12:00 assuming that the report was exported on September 15, 2013, at noon.|
| {report:dateexported:yyyy-MM-dd} | Would output 2013-09-15 assuming that the report was exported on September 15, 2013.|
| Expenses Count | Is the number of total expenses on the report of this specific expense.|
| {report:expensescount} | Would output 10 assuming that there were 10 expenses on the given report for this expense.|
| Workspace Name | Is the name of the workspace applied to the report.|
| {report:workspaceName} | Would output Sales assuming that the given report was under a workspace named Sales.|
| {report:policyName} | Same as the workspace name. Policy is an older term for workspace.|
| Status | Is the current state of the report when it was exported.|
| {report:status} | Outputs the current report status using the historical labels (Open, Processing, Approved, Reimbursed or Closed).|
| {report:displaystatus} | Outputs the current report status using the new labels (Draft, Outstanding, Approved, Paid, or Done). |
| Custom Fields | |
| {report:submit:from:customfield1} | Would output the custom field 1 entry associated with the user who submitted the report. If John Smith’s Custom Field 1 contains 100, then this formula would output 100.|
| {report:submit:from:customfield2} | Would output the custom field 2 entry associated with the user who submitted the report. If John Smith’s Custom Field 2 contains 1234, then this formula would output 1234. |
| To | Is the email address of the last person who the report was submitted to.|
| {report:submit:to} | Would output alice@email.com if they are the current approver.|
| Current user | To export the email of the currently logged in Expensify user.|
| {user:email} | Would output bob@example.com assuming that is the currently logged in Expensify user's email.|
| Submitter | "Sally Ride" with email "sride@email.com" is the submitter for the following examples.|
| {report:submit:from}| Would output Sally Ride. If the user's name is blank, then it will print the user's whole email.|
| {report:submit:from:firstname}| Sally|
| {report:submit:from:lastname}| Ride|
| {report:submit:from:fullname}| Sally Ride |
| {report:submit:from:email} | sride@email.com|

## Expense level

| Formula | Description |
| -- | -- |
| Merchant | Merchant of the expense |
| {expense:merchant} | Would output Sharons Coffee Shop and Grill assuming the expense is from Sharons Coffee Shop. |
| {expense:distance:count} | Would output the total miles/kilometers of the expense.|
| {expense:distance:rate} | Would output the monetary rate allowed per mile/kilometer. |
| {expense:distance:unit} | Would output either mi or km depending on which unit is applied in the workspace settings. |
| Date | Related to the date listed on the expense |
| {expense:created:yyyy-MM-dd} | Would output 2019-11-05 assuming the expense was created on November 5th, 2019. |
| {expense:posted:yyyy-MM-dd} | Would output 2023-07-24 assuming the expense was posted on July 24th, 2023. |
| Tax | The tax type and amount applied to the expense line item. |
| {expense:tax:field} | Would output VAT assuming this is the name of the tax field.|
| {expense:tax:ratename} | Would output the name of the tax rate that was used (ex: Standard). This will show custom if the chosen tax amount is manually entered and not chosen from the list of given options.|
| {expense:tax:amount} | Would output $2.00 assuming that is the amount of the tax on the expense.|
| {expense:tax:percentage} | Would output 20% assuming this is the amount of tax that was applied to the subtotal.|
| {expense:tax:net} | would output $18.66 assuming this is the amount of the expense before tax was applied.|
| {expense:tax:code} | would output the tax code that was set in the workspace settings.|
| Expense Amount | Related to the currency type and amount of the expense. |
| {expense:amount} | Would output $3.95 assuming the expense was for three dollars and ninety-five cents.|
| {expense:amount:isk} | Would output Íkr3.95 assuming the expense was for 3.95 Icelandic króna.|
| {expense:amount:nosymbol} | Would output 3.95. Notice that there is no currency symbol in front of the expense amount because we designated none.|
| {expense:exchrate} | Would output the currency conversion rate used to convert the expense amount|
| | Add an optional extra input that is either a three-letter currency code or nosymbol to denote the output's currency. The default if one isn't provided is USD.|
| {expense:amount:originalcurrency} | This gives the amount of the expense in the currency in which it occurred before currency conversion |
| {expense:amount:originalcurrency:nosymbol} | Will export the expense in its original currency without the currency symbol. |
| {expense:amount:negsign} | displays negative expenses with a minus sign in front rather wrapped in parenthesis. It would output -$3.95 assuming the expense was already a negative expense for three dollars and ninety-five cents. This formula does not convert a positive expense to a negative value.|
| {expense:amount:unformatted} | Displays expense amounts without commas. This removes commas from expenses that have an amount of more than 1000. It would output $10000 assuming the expense was for ten thousand dollars.|
| {expense:debitamount} | Displays the amount of the expense if the expense is positive. Nothing will be displayed in this column if the expense is negative. It would output $3.95 assuming the expense was for three dollars and ninety-five cents.|
| {expense:creditamount} | Displays the amount of the expense if the expense is negative. Nothing will be displayed in this column if the expense is positive. It would output -$3.95 assuming the expense was for negative three dollars and ninety-five cents.|
| For expenses imported via CDF/VCF feed only ||
| {expense:purchaseamount} | Is the amount of the original purchase in the currency it was purchased in. Control plan users only.|
| {expense:purchaseamount} | Would output Irk 3.95 assuming the expense was for 3.95 Icelandic krónur, no matter what currency your bank has translated it to.|
| {expense:purchasecurrency} | Would output Irk assuming the expense was incurred in Icelandic krónur (before your bank converted it back to your home currency).|
| Original Amount  | When import with a connected bank.|
| {expense:originalamount} | Is the amount of the expense imported from your bank or credit card feed. It would output $3.95 assuming the expense equated to $3.95 and you use US-based bank. You may add an optional extra input that is either a three-letter currency code or NONE to denote the output's currency.|
| Category | The category of the expense. |
| {expense:category} | Would output Employee Moral assuming that is the expenses' category.|
| {expense:category:glcode} | Would output the category gl code of the category selected.|
| {expense:category:payrollcode} | Outputs the payroll code information entered for the category that is applied to the expense. If the payroll code for the Mileage category was 39847, this would output simply 39847.|
| Attendees | Persons listed as attendees on the expense.|
| {expense:attendees} | Would output the name or email address entered in the Attendee field within the expense (ex. guest@domain.com). |
| {expense:attendees:count} | Would output the number of attendees that were added to the expense (ex. 2).8.&nbsp; Attendees - persons listed as attendees on the expense.|
| Tags | Tags of the expense - in this example the name of the tag is "Department." |
| {expense:tag} | Would output Henry at Example Co. assuming that is the expenses' tag. |
| Multiple Tags | Tags for companies that have multiple tags setup. |
| {expense:tag:ntag-1} | Outputs the first tag on the expense, if one is selected. |
| {expense:tag:ntag-3} | Outputs the third tag on the expense, if one is selected. |
| Description | The description on the expense. |
| {expense:comment} | Would output "office lunch" assuming that is the expenses' description.|
| Receipt | |
| {expense:receipt:type} | Would output eReceipt if the receipt is an Expensify Guaranteed eReceipt.|
| {expense:receipt:url} | Would output a link to the receipt image page that anyone with access to the receipt in Expensify could view.|
| {expense:receipt:url:direct} | Would show the direct receipt image url for download. |
| {expense:mcc} | Would output 3351 assuming that is the expenses' MCC (Merchant Category Code of the expense).|
| | Note, we only have the MCC for expenses that are automatically imported or imported from an OFX/QFX file. For those we don't have an MCC for the output would be (an empty string).|
| Card name/number expense type | |
| {expense:card} | Manual/Cash Expenses — would output Cash assuming the expense was manually entered using either the website or the mobile app.|
| {expense:card} | Bank Card Expenses — would output user@company.com – 1234 assuming the expense was imported from a credit card feed.|
| | Note - If you do not have access to the card that the expense was created on 'Unknown' will be displayed.  If cards are assigned to users under Domain, then you'll need to be a Domain Admin to export the card number.|
| Expense ID | |
| {expense:id} | Would output the unique number associated with each individual expense "4294967579".|
| Reimbursable state | |
| {expense:reimbursable} | Would output "yes" or "no" depending on whether the expense is reimbursable or not.|
| Billable state | |
| {expense:billable} | Would output "yes" or "no" depending on whether the expense is billable or not.
| Expense Number | Is the ordinal number of the expense on its expense report.|
| {report:expense:number} | Would output 2 assuming that the given expense was the second expense on its report.|
| GL codes | |
| {expense:category:glcode} | Would output the GL code associated with the category of the expense. If the GL code for Meals is 45256 this would output simply 45256.|
| {expense:tag:glcode} | Would output the GL code associated with the tag of the expense. If the GL code for Client X is 08294 this would output simply 08294.|
| {expense:tag:ntag-3:glcode} | Would output the GL code associated with the third tag the user chooses. This is only for companies that have multiple tags setup.|

## Date formats

| Formula | Description |
| -- | -- |
| M/dd/yyyy | 5/23/2019|
|MMMM dd, yyyy| May 23, 2019|
|dd MMM yyyy| 23 May 2019|
|yyyy/MM/dd| 2019/05/23|
|dd MMM yyyy| 23 May 2019|
|yyyy/MM/dd| 2019/05/23|
|MMMM, yyyy| May, 2019|
|yy/MM/dd| 19/05/23|
|dd/MM/yy| 23/05/19|
|yyyy| 2019|

## Math formulas

| Formula | Description |
| -- | -- |
| * |  Multiplication {math: 3 * 4} output 12|
| / |  Division {math: 3 / 4 }output 0.75|
| + |  Addition {math: 3 + 4 }output |
| - |  Subtraction {math: 3 - 4 }output -1|
| ^ |  Exponent {math: 3 ^ 4 } output 81|
| sqrt |  The square root of a number. {sqrt:64} output 8|
|| Note - You can also combine the value of any two numeric fields. For example, you can use {math: {expense:tag:glcode} + {expense:category:glcode}} to add the value of the Tag GL code with the Category GL code.|

## Functions
Functions can be applied to any formula using the `|` symbol and the function name. They can be chained together and are case insensitive.

| Function | Description
| -- | -- |
| frontpart | Get the front part of an email or the first word of the value|
| {report:submit:from:email\|frontPart} | would output alice if alice@email.com was the submitter|
| {report:submit:from:fullname\|frontpart} | would output Sally if the submitter's full name is Sally Ride|
| substr | Outputs a substring of the string (value) it operates on. It takes 1 or 2 parameters: offset and length. An offset of 0 starts at the first character of the value, 1 at the second, etc. The length is how many characters to return.|
| {expense:merchant\|substr:0:4} | would output "Star" for a merchant named Starbucks.|
| {expense:merchant\|substr:4:5} | would output "bucks" for a merchant named Starbucks.|
| {report:policyname\|substr:20} | would output "Sally's Expenses" for a report on a workspace named "Control Workspace - Sally's Expenses"|
| {report:policyname\|substr:20\|frontpart} | would output "Sally's"|
| domain | Get the domain name from an email address; the part after the `@` sign.|
| {report:submit:from:email\|domain} | email.com if alice@email.com was the submitter|

---

# FAQ

## Can I export one line per report?
No, custom templates export one line per **expense**, not per report.

## Can I export from the mobile app?
No, exports are only available on the **web app**.

## How do I print a report?
1. Click the **Reports** tab.
2. Open a report.
3. Click **Details** in the top right of the report.
4. Click the Print icon.

## Why isn’t my report exporting?
If your report has many expenses with high-resolution images, the PDF download may fail. Try splitting it into smaller reports. A report must have at least one expense to be exported or saved as a PDF.

## Can I download multiple PDFs at once?
No, you must download reports individually. Use **CSV export** if you need multiple reports in one file.

## The data exported to Excel is showing incorrectly. How can I fix this?
When you open a CSV file from Expensify in Excel, report and transaction IDs may appear in exponential format if they’re too long. To fix this, import the CSV instead of opening it directly:

1. Open Excel and click **File > Import**.
2. Select your CSV file and follow the prompts.
3. Set the report ID or transaction ID column to **Text format**.

## Why do the numbers in my exported file look incorrect?
If numbers are displayed in scientific notation (e.g., `1.79e+308`), switch your spreadsheet program to **Plain Text** or **Number** format.

## Why are leading zeros missing in my export?
Excel may automatically remove leading zeros. To prevent this:
1. Open Excel and click **File > Import**.
2. Select your CSV file.
3. In step 3, set relevant columns to **Text format**.

