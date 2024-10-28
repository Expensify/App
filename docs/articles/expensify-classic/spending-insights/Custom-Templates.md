---
title: Custom Templates
description: Custom Templates
---
# Overview

If you  don't have a direct connection to your accounting system, as long as the system accepts a CSV file, you can easily export your expense data for upload to the system. Custom templates are great if you want to analyze the data in your favorite spreadsheet program. 

# How to use custom templates
If you are a Group workspace admin you can create a custom template that will be available to all Workspace Admins on the workspace from **Settings > Workspaces > Group > _Workspace Name_ > Export Formats**.

If you are using a free account you can create a custom template from **Settings > Account > Preferences > CSV Export Formats**. 

You can use your custom templates from the **Reports** page. 
1. Select the checkbox next to the report you’d like to export
3. Click **Export to** at the top of the page
4. Select your template from the dropdown

# Formulas
## Report level

| Formula | Description |
| -- | -- |
| **Report title** | **the title of the report the expense is part of** | 
| {report:title} | would output "Expense Expenses to 2019-11-05" assuming that is the report's title.| 
| **Report ID** |  **number is a unique number per report and can be used to identify specific reports**|
| {report:id} | would output R00I7J3xs5fn assuming that is the report's ID.| 
| **Old Report ID** | **a unique number per report and can be used to identify specific reports as well. Every report has both an ID and an old ID - they're simply different ways of showing the same information in either [base10](https://community.expensify.com/home/leaving?allowTrusted=1&target=https%3A%2F%2Fwww.twinkl.co.uk%2Fteaching-wiki%2Fbase-10) or base62.** | 
| {report:oldID} | would output R3513250790654885 assuming that is the report's old ID.| 
| **Reimbursement ID** | **the unique number for a report that's been reimbursed via ACH in Expensify. The reimbursement ID is searchable on the Reports page and is found on your bank statement in the line-item detail for the reimbursed amount.**| 
| {report:reimbursementid} | would output 123456789109876 assuming that is the ID on the line-item detail for the reimbursed amount in your business bank account.| 
| **Report Total** | **the total amount of the expense report.**| 
| {report:total} | would output $325.34 assuming that is the report's total.| 
| **Type** | **is the type of report (either Expense Report, Invoice or Bill)**| 
| {report:type} | would output "Expense Report" assuming that is the report's type| 
| **Reimbursable Total** | **is the total amount that is reimbursable on the report.**| 
| {report:reimbursable} | would output $143.43 assuming the report's reimbursable total was 143.43 US Dollars.| 
| **Currency** | **is the currency to which all expenses on the report are being converted.**| 
| {report:currency}  | would output USD  assuming that the report total was calculated in US Dollars| 
|| Note - Currency accepts an optional three character currency code or NONE. If you want to do any math operations on the report total, you should use {report:total:nosymbol} to avoid an error. Please see Expense:Amount for more information on currencies.|
| **Report Field** | **formula will output the value for a given Report Field which is created in the workspace settings.**| 
| {field:Employee ID} | would output 12456 , assuming "Employee ID" is the name of the Report Field and "123456" is the value of that field on the report.| 
| **Created date** | **the expense report was originally created by the user.**| 
| {report:created} | would output 2010-09-15 12:00:00 assuming the expense report was created on September 15th, 2010 at noon.| 
| {report:created:yyyy-MM-dd} | would output 2010-09-15 assuming the expense report was created on September 15, 2010.| 
| | Note -  All Date Formulas accept an optional format string. The default if one is not provided is yyyy-MM-dd hh:mm:ss.  For a full breakdown, check out the Date Formatting [here](https://community.expensify.com/discussion/5799/deep-dive-date-formating-for-formulas/p1?new=1).| 
| **StartDate** | **is the date of the earliest expense on the report.**| 
| {report:startdate} | would output 2010-09-15 assuming that is the date of the earliest expense on the report.| 
| **EndDate**|  **is the date of the last expense on the report.**| 
| {report:enddate} | would output 2010-09-26 assuming that is the date of the last expense on the report.| 
| **Scheduled Submit Dates** | **the start and end dates of the Scheduled Submit reporting cycle.**| 
| {report:autoReporting:start} | would output 2010-09-15 assuming that is the start date of the automatic reporting cycle, when the automatic reporting frequency is not set to daily.| 
| {report:autoReporting:end} | would output 2010-09-26 assuming that is the end date of the automatic reporting cycle, when the automatic reporting frequency is not set to daily.| 
| **Submission Date** | **is the date that the report was submitted.**| 
| {report:submit:date} | would output 1986-09-15 12:00:00 assuming that the report was submitted on September 15, 1986, at noon.| 
| {report:submit:date:yyyy-MM-dd} | would output 1986-09-15 assuming that the report was submitted on September 15, 1986.| 
| | Note -  All Date Formulas accept an optional format string. The default if one is not provided is yyyy-MM-dd hh:mm:ss.  For a full breakdown, check out the Date Formatting | 
| **Approval Date** | **the date the report was approved. This formula can be used for export templates, but not for report titles.**| 
| {report:approve:date} | would output 2011-09-25 12:00:00 assuming that the report was approved on September 25, 2011, at noon.| 
| {report:approve:date:yyyy-MM-dd} | would output 2011-09-25 assuming that the report was approved on September 25, 2011.| 
| **Reimbursement Date** | **the date an expense report was reimbursed. This formula can be used for export templates, but not for report titles.**| 
| {report:achreimburse} | would output 2011-09-25 assuming that is the date the report was reimbursed via ACH Direct Deposit.| 
| {report:manualreimburse} | would output 2011-09-25 assuming that is the date the report was marked as reimbursed. | 
| **Export Date** | **is the date when the report is exported. This formula can be used for export templates, but not for report titles.**| 
| {report:dateexported} | would output 2013-09-15 12:00 assuming that the report was exported on September 15, 2013, at noon.| 
| {report:dateexported:yyyy-MM-dd} | would output 2013-09-15 assuming that the report was exported on September 15, 2013.| 
| **Expenses Count** | **is the number of total expenses on the report of this specific expense.**| 
| {report:expensescount} | would output 10 assuming that there were 10 expenses on the given report for this expense.| 
| **Workspace Name** | **is the name of the workspace applied to the report.**| 
| {report:policyname} | would output Sales assuming that the given report was under a workspace named Sales.| 
| **Status** | **is the current state of the report when it was exported**.| 
| {report:status} | would output Approved assuming that the report has been approved and not yet reimbursed.| 
| **Custom Fields** | | 
| {report:submit:from:customfield1} | would output the custom field 1 entry associated with the user who submitted the report. If John Smith’s Custom Field 1 contains 100, then this formula would output 100.|
| {report:submit:from:customfield2} | would output the custom field 2 entry associated with the user who submitted the report. If John Smith’s Custom Field 2 contains 1234, then this formula would output 1234. |
| **To** | **is the email address of the last person who the report was submitted to.**| 
| {report:submit:to} | would output alice@email.com if they are the current approver| 
| {report:submit:to:email\|frontPart} | would output alice.| 
| **Current user** | **To export the email of the currently logged in Expensify user**| 
| {user:email} | would output bob@example.com assuming that is the currently logged in Expensify user's email.| 
| **Submitter** | **"Sally Ride" with email "sride@email.com" is the submitter for the following examples**|
| {report:submit:from:email}| sride@email.com| 
| {report:submit:from}| Sally Ride| 
| {report:submit:from:firstname}| Sally| 
| {report:submit:from:lastname}| Ride| 
| {report:submit:from:fullname}| Sally Ride | 
| | Note - If user's name is blank, then {report:submit:from} and {report:submit:from:email\|frontPart} will print the user's whole email.| 

`{report:submit:from:email|frontPart}` sride 

`{report:submit:from:email|domain}` email.com  

`{user:email|frontPart}` would output bob assuming that is the currently logged in Expensify user's email.

## Expense level

| Formula | Description |
| -- | -- |
| **Merchant** | **Merchant of the expense** |
| {expense:merchant} | would output Sharons Coffee Shop and Grill assuming the expense is from Sharons Coffee Shop |
| {expense:distance:count} | would output the total miles/kilometers of the expense.|
| {expense:distance:rate} | would output the monetary rate allowed per mile/kilometer. |
| {expense:distance:unit} | would output either mi or km depending on which unit is applied in the workspace settings. |
| **Date** | **Related to the date listed on the expense** |
| {expense:created:yyyy-MM-dd} | would output 2019-11-05 assuming the expense was created on November 5th, 2019 |
| {expense:posted:yyyy-MM-dd} | would output 2023-07-24 assuming the expense was posted on July 24th, 2023 |
| **Tax** | **The tax type and amount applied to the expense line item** |
| {expense:tax:field} | would output VAT assuming this is the name of the tax field.| 
| {expense:tax:ratename} | would output the name of the tax rate that was used (ex: Standard). This will show custom if the chosen tax amount is manually entered and not chosen from the list of given options.| 
| {expense:tax:amount} | would output $2.00 assuming that is the amount of the tax on the expense.| 
| {expense:tax:percentage} | would output 20% assuming this is the amount of tax that was applied to the subtotal.| 
| {expense:tax:net} | would output $18.66 assuming this is the amount of the expense before tax was applied.| 
| {expense:tax:code} | would output the tax code that was set in the workspace settings.| 
| **Expense Amount** | **Related to the currency type and amount of the expense** |
| {expense:amount} | would output $3.95 assuming the expense was for three dollars and ninety-five cents| 
| {expense:amount:isk} | would output Íkr3.95 assuming the expense was for 3.95 Icelandic króna.| 
| {expense:amount:nosymbol} | would output 3.95. Notice that there is no currency symbol in front of the expense amount because we designated none.| 
| {expense:exchrate} | would output the currency conversion rate used to convert the expense amount| 
| | Add an optional extra input that is either a three-letter currency code or nosymbol to denote the output's currency. The default if one isn't provided is USD.|
| {expense:amount:originalcurrency} | This gives the amount of the expense in the currency in which it occurred before currency conversion | 
| {expense:amount:originalcurrency:nosymbol} | will export the expense in its original currency without the currency symbol. |
| {expense:amount:negsign} | displays negative expenses with a minus sign in front rather wrapped in parenthesis. It would output -$3.95 assuming the expense was already a negative expense for three dollars and ninety-five cents. This formula does not convert a positive expense to a negative value.| 
| {expense:amount:unformatted} | displays expense amounts without commas. This removes commas from expenses that have an amount of more than 1000. It would output $10000 assuming the expense was for ten thousand dollars.| 
| {expense:debitamount} | displays the amount of the expense if the expense is positive. Nothing will be displayed in this column if the expense is negative. It would output $3.95 assuming the expense was for three dollars and ninety-five cents.| 
| {expense:creditamount} | displays the amount of the expense if the expense is negative. Nothing will be displayed in this column if the expense is positive. It would output -$3.95 assuming the expense was for negative three dollars and ninety-five cents.| 
| **For expenses imported via CDF/VCF feed only** ||
| {expense:purchaseamount} | is the amount of the original purchase in the currency it was purchased in. Control plan users only.| 
| {expense:purchaseamount} | would output Irk 3.95 assuming the expense was for 3.95 Icelandic krónur, no matter what currency your bank has translated it to.| 
| {expense:purchasecurrency} | would output Irk assuming the expense was incurred in Icelandic krónur (before your bank converted it back to your home currency)| 
| **Original Amount**  | **when import with a connected bank**|
| {expense:originalamount} | is the amount of the expense imported from your bank or credit card feed. It would output $3.95 assuming the expense equated to $3.95 and you use US-based bank. You may add an optional extra input that is either a three-letter currency code or NONE to denote the output's currency.| 
| **Category** | **The category of the expense** |
| {expense:category} | would output Employee Moral assuming that is the expenses' category.| 
| {expense:category:glcode} | would output the category gl code of the category selected.| 
| {expense:category:payrollcode} | outputs the payroll code information entered for the category that is applied to the expense. If the payroll code for the Mileage category was 39847, this would output simply 39847.| 
| **Attendees** | **Persons listed as attendees on the expense**| 
| {expense:attendees} | would output the name or email address entered in the Attendee field within the expense (ex. guest@domain.com). | 
| {expense:attendees:count} | would output the number of attendees that were added to the expense (ex. 2).8.&nbsp; Attendees - persons listed as attendees on the expense.| 
| **Tags** | Tags of the expense - in this example the name of the tag is "Department" |
| {expense:tag} |  would output Henry at Example Co. assuming that is the expenses' tag. | 
| **Multiple Tags** | Tags for companies that have multiple tags setup. | 
| {expense:tag:ntag-1} | outputs the first tag on the expense, if one is selected | 
| {expense:tag:ntag-3} | outputs the third tag on the expense, if one is selected |  
| **Description** | The description on the expense | 
| {expense:comment} |would output "office lunch" assuming that is the expenses' description.|
| **Receipt** | | 
| {expense:receipt:type} | would output eReceipt if the receipt is an Expensify Guaranteed eReceipt.| 
| {expense:receipt:url} | would output a link to the receipt image page that anyone with access to the receipt in Expensify could view.| 
| {expense:receipt:url:direct} | would show the direct receipt image url for download. | 
| {expense:mcc} | would output 3351 assuming that is the expenses' MCC (Merchant Category Code of the expense).| 
| | Note, we only have the MCC for expenses that are automatically imported or imported from an OFX/QFX file. For those we don't have an MCC for the output would be (an empty string).| 
| **Card name/number expense type** | | 
| {expense:card} | Manual/Cash Expenses — would output Cash assuming the expense was manually entered using either the website or the mobile app.| 
| {expense:card} | Bank Card Expenses — would output user@company.com – 1234 assuming the expense was imported from a credit card feed.| 
| | Note - If you do not have access to the card that the expense was created on 'Unknown' will be displayed.  If cards are assigned to users under Domain, then you'll need to be a Domain Admin to export the card number.| 
| **Expense ID** | | 
| {expense:id} | would output the unique number associated with each individual expense "4294967579".| 
| **Reimbursable state** | | 
| {expense:reimbursable} | would output "yes" or "no" depending on whether the expense is reimbursable or not.| 
| **Billable state** | | 
| {expense:billable} | would output "yes" or "no" depending on whether the expense is billable or not.
| **Expense Number** | **is the ordinal number of the expense on its expense report.**| 
| {report:expense:number} | would output 2 assuming that the given expense was the second expense on its report.| 
| **GL codes** | | 
| {expense:category:glcode} | would output the GL code associated with the category of the expense. If the GL code for Meals is 45256 this would output simply 45256.| 
| {expense:tag:glcode} | would output the GL code associated with the tag of the expense. If the GL code for Client X is 08294 this would output simply 08294.| 
| {expense:tag:ntag-3:glcode} | would output the GL code associated with the third tag the user chooses. This is only for companies that have multiple tags setup.| 

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

## Substring formulas 
This formula will output a subset of the string in question. It is important to remember that the count starts at 0 not 1.

`{expense:merchant|substr:0:4}` would output "Star" for a merchant named Starbucks. This is because we are telling it to start at position 0 and be of 4 character length. 

`{expense:merchant|substr:4:5}` would output "bucks" for a merchant named Starbucks. This is because we are telling it to start at position 4 and be of 5 character length. 

# FAQs

**Can I export one line per report?**

No, the custom template always exports one line per expense. At the moment it is not possible to create a template that will export one line per report.
