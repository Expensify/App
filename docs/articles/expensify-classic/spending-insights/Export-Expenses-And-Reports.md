---
title: Export Expenses and Reports
description: How to export expenses and reports using custom reports, PDF files, CSVs, and more 
---

There are several methods you can use to export your expenses and reports, including:
- Export as a PDF
- Export as a CSV or to an accounting integration
- Export using a default or custom export template

# Export PDF

1. Click the **Reports** tab.
2. Open a report.
3. Click **Details** in the top right of the report.
4. Click the download icon.

The PDF will be downloaded with all expenses, any attached receipts, and all report notes.

# Export CSV or apply a template

1. Click either the **Expenses** or **Reports** tab.
2. On the left hand side, select the expenses/reports you’d like to export.
3. Click **Export to** at the top right of the page.
4. Choose the desired export option. You can use one of the default templates below, or you can create your own template. *Note: The default templates and the option to export to a connected accounting package are only available on the Reports page.*
   - **All Data - Expense Level Export**: Prints a line for each expense with all of the data associated with the expenses. This is useful if you want to see all of the data stored in Expensify for each expense.
   - **All Data - Report Level Export**: Prints a line per report, giving a summary of the report data.
   - **Basic Export**: A simpler expense-level export of the data visible on the PDF report. Includes basics such as date, amount, merchant, category, tag, reimbursable state, description, receipt URL, and original expense currency and amount.
   - **Canadian Multiple Tax Export**: Exports a line per expense with all available information on the taxes applied to the expenses on your report(s). This is useful if you need to see the tax spend.
   - **Category Export**: Exports category names with the total amount attributed to each category on the report. While you can also access this information on the Insights page, it can be convenient to export to a CSV to run further analysis in your favorite spreadsheet program.
   - **Per Diem Export**: Exports basic expense details for only the per diem expenses on the report. Useful for reviewing employee Per Diem spend.
   - **Tag Export**: Exports tag names into columns with the total amount attributed to each tag on the report.

# Create custom export templates

If you don't have a direct connection to your accounting system, you can export your expense data to the system for upload as long as the system accepts a CSV file. You can then analyze the data in your favorite spreadsheet program. 

Custom export templates can be created and made available to all Workspace Admins for your workspace, or you can create a template that is just for your own use. 

## For a workspace

{% include info.html %}
Must be a Group Workspace Admin to complete this process. 
{% include end-info.html %}

1. Hover over **Settings** and click **Workspaces**.
2. Select the desired workspace.
3. Click the **Export Formats** tab on the left. 
4. Click **New Export Format**.
5. Enter a name for the export format.
6. Select the format type (e.g., CSV, XLS for Excel, or CSV without BOM for MS Access)
7. Enter a name and formula for each column (formulas provided below).
8. Scroll below all of the columns and, if needed:
   - Click **Add Column** to add a new column.
   - Drag and drop the columns into a different order.
   - Hover over a column and click the red X in the right corner to delete it.
9. Check the Example Output at the bottom and click **Save Export Format** when all the columns are complete.

## For personal use

1. Hover over **Settings** and click **Account**.
2. Click **Preferences**. 
3. Under CSV Export Formats, click **New Export Format**.
4. Enter a name for the export format.
5. Select the format type (e.g., CSV, XLS for Excel, or CSV without BOM for MS Access)
6. Enter a name and formula for each column (formulas provided below).
7. Scroll below all of the columns and, if needed:
   - Click **Add Column** to add a new column.
   - Drag and drop the columns into a different order.
   - Hover over a column and click the red X in the right corner to delete it.
8. Check the Example Output at the bottom and click **Save Export Format** when all the columns are complete. 

## Formulas

Enter any of the following formulas into the Formula field for each column. Be sure to also include both brackets around the formula as shown in the table below. 

### Report level

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
| {report:policyname} | Would output Sales assuming that the given report was under a workspace named Sales.| 
| Status | Is the current state of the report when it was exported.| 
| {report:status} | Would output Approved assuming that the report has been approved and not yet reimbursed.| 
| Custom Fields | | 
| {report:submit:from:customfield1} | Would output the custom field 1 entry associated with the user who submitted the report. If John Smith’s Custom Field 1 contains 100, then this formula would output 100.|
| {report:submit:from:customfield2} | Would output the custom field 2 entry associated with the user who submitted the report. If John Smith’s Custom Field 2 contains 1234, then this formula would output 1234. |
| To | Is the email address of the last person who the report was submitted to.| 
| {report:submit:to} | Would output alice@email.com if they are the current approver.| 
| {report:submit:to:email\|frontPart} | Would output alice.| 
| Current user | To export the email of the currently logged in Expensify user.| 
| {user:email} | Would output bob@example.com assuming that is the currently logged in Expensify user's email.| 
| Submitter | "Sally Ride" with email "sride@email.com" is the submitter for the following examples.|
| {report:submit:from:email}| sride@email.com| 
| {report:submit:from}| Sally Ride| 
| {report:submit:from:firstname}| Sally| 
| {report:submit:from:lastname}| Ride| 
| {report:submit:from:fullname}| Sally Ride | 
| | Note - If user's name is blank, then {report:submit:from} and {report:submit:from:email\|frontPart} will print the user's whole email.| 

`{report:submit:from:email|frontPart}` sride 

`{report:submit:from:email|domain}` email.com  

`{user:email|frontPart}` would output bob assuming that is the currently logged in Expensify user's email.

### Expense level

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

### Date formats 

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

### Math formulas

| Formula | Description |
| -- | -- |
| * |  Multiplication {math: 3 * 4} output 12| 
| / |  Division {math: 3 / 4 }output 0.75| 
| + |  Addition {math: 3 + 4 }output | 
| - |  Subtraction {math: 3 - 4 }output -1| 
| ^ |  Exponent {math: 3 ^ 4 } output 81| 
| sqrt |  The square root of a number. {sqrt:64} output 8| 
|| Note - You can also combine the value of any two numeric fields. For example, you can use {math: {expense:tag:glcode} + {expense:category:glcode}} to add the value of the Tag GL code with the Category GL code.|

### Substring formulas 

This formula will output a subset of the string in question. It is important to remember that the count starts at 0 not 1.

`{expense:merchant|substr:0:4}` would output "Star" for a merchant named Starbucks. This is because we are telling it to start at position 0 and be of 4 character length. 

`{expense:merchant|substr:4:5}` would output "bucks" for a merchant named Starbucks. This is because we are telling it to start at position 4 and be of 5 character length. 

{% include faq-begin.md %}

**Can I export one line per report?**

No, the custom template always exports one line per *expense*. At the moment, it is not possible to create a template that will export one line per report.

**How do I print a report?**

1. Click the **Reports** tab.
2. Open a report.
3. Click **Details** in the top right of the report.
4. Click the Print icon.

**Why isn’t my report exporting?**

Big reports with a lot of expenses may cause the PDF download to fail due to images with large resolutions. In that case, try breaking the report into multiple smaller reports. A report must have at least one expense to be exported or saved as a PDF.

**Can I download multiple PDFs at once?**

No, you can’t download multiple reports as PDFs at the same time. If you’d like to export multiple reports, an alternative to consider is the CSV export option.

**The data exported to Excel is showing incorrectly. How can I fix this?**

When opening a CSV file export from Expensify in Excel, it’ll automatically register report IDs and transaction IDs as numbers and assign the number format to the report ID column. If a number is greater than a certain length, Excel will contract the number and display it in exponential form. To prevent this, the number needs to be imported as text, which can be done by opening Excel and clicking File > Import > select your CSV file. Follow the prompts, then on step 3, set the report ID/transactionID column to import as Text.

**Why are my numbers exporting in a weird format?**

Do your numbers look something like this: 1.7976931348623157e+308? This means that your spreadsheet program is formatting long numbers in an exponential or scientific format. If that happens, you can correct it by changing the data to Plain Text or a Number in your spreadsheet program.

**Why are my leading zeros missing?**

Is the export showing “1” instead of “01”? This means that your spreadsheet program is cutting off the leading zero. This is a common issue with viewing exported data in Excel. Unfortunately, we don’t have a good solution for this. We recommend checking your spreadsheet program’s help documents for formatting suggestions.

{% include faq-end.md %}
