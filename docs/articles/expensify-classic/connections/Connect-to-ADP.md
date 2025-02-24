---
title: How to Use the ADP Integration
description: Expensify’s ADP integration allows you to pay out expense reports outside of Expensify. It creates a Custom Export Format that can be directly uploaded to ADP.
---

Expensify’s ADP integration enables you to process expense report payouts outside of Expensify. It generates a **Custom Export Format** that can be uploaded to ADP.

- You must be on the **Control Plan** to create a Custom Export Format.
- You can import your ADP employee list into Expensify as a **CSV file** via the **People table**. This helps sync employee expense reports with ADP and is available on all plans.

---

# Setting Up the ADP Integration

## Step 1: Prepare the ADP Import File
Your ADP import file should contain the following **five columns**:

1. **Company Code** - Found in **Edit Company** in ADP.
2. **Batch ID** - Found in **Edit Company** in ADP.
3. **File #** - The employee number in ADP (located under **RUN Powered by ADP > Reports > Tax Reports > Wage > Tax Register**).
4. **Earnings 3 Code** - Found in **Edit Profit Center Group** in ADP.
5. **Earnings 3 Amount** - Found in **Edit Profit Center Group** in ADP.

In **Expensify**:
- The **File #** is entered in **Custom Field 1 or 2** in the **Members table**.
- The **Earnings 3 Code** corresponds to a payroll account tracked in Expensify.
- The **Earnings 3 Amount** is the total expense amount sent to payroll.
- To enter the **Earnings 3 Code**, go to **Settings > Workspaces > [Group Workspace Name] > Categories > [Category Name] > Edit Rules > Add under Payroll Code**.

---

## Step 2: Create Your ADP Export Format
1. Go to **Settings > Workspaces > [Group Workspace Name] > Export Formats**.
2. Add the following column headings and formulas:

| Column Name            | Formula                                 |
|------------------------|----------------------------------------|
| Company Code          | Hardcoded from Step 1                 |
| Batch ID             | Hardcoded from Step 1                 |
| File #              | `{report:submit.from:customfield1}`     |
| Earnings 3 Code     | `{expense:category:payrollcode}`       |
| Earnings 3 Amount   | `{expense:amount}`                     |

The **Company Code** and **Batch ID** should be hardcoded with the values used in ADP.

---

## Step 3: Export Your File
To generate and download the ADP file:

1. Go to the **Reports** page in Expensify.
2. Select the reports you want to export.
3. Click **Export to...** and choose your custom ADP format.
4. The file will download in **CSV or XLS format**.

---

## Step 4: Upload to ADP
Once exported, you can **upload the file directly to ADP** without modifications.

---

# Additional Features

## Bulk Updating Custom Fields and Payroll Codes
You can update **Custom Fields** and **Payroll Codes** in bulk using a CSV upload in Expensify’s settings.

## Customizing Your ADP Export
If you need **additional columns, headings, or datasets**, contact your **Expensify Account Manager** via the Chat option in Expensify for assistance.

---

# FAQ

## Do I need to adjust my ADP employee list before uploading it to Expensify?
Yes. Convert your ADP employee data to match the column headings used in Expensify’s **Members table CSV export**.

## Can I add custom fields to my ADP Payroll Export?
Yes! Your Expensify Account Manager can help customize your ADP Payroll export to fit your needs. 

