---
title: How to Use the ADP Integration
description: Learn how to set up and use Expensify’s ADP integration to export and process expense report payouts seamlessly with ADP.
keywords: [Expensify, ADP integration, payroll export, custom export format, expense reports, bulk update]
---

Expensify’s ADP integration enables you to process expense report payouts outside of Expensify by generating a **Custom Export Format** that can be uploaded to ADP.

- The **Control Plan** is required to create a Custom Export Format.
- You can import your ADP employee list into Expensify as a **CSV file** via the **People table** to sync employee expense reports with ADP. This feature is available on all plans.

---

# Setting Up the ADP Integration

## Step 1: Prepare the ADP Import File
Your ADP import file must include the following **five columns**:

1. **Company Code** – Located under **Edit Company** in ADP.
2. **Batch ID** – Found in **Edit Company** in ADP.
3. **File #** – The employee number in ADP (**RUN Powered by ADP > Reports > Tax Reports > Wage > Tax Register**).
4. **Earnings 3 Code** – Located under **Edit Profit Center Group** in ADP.
5. **Earnings 3 Amount** – Also found in **Edit Profit Center Group** in ADP.

### In Expensify:
- The **File #** is stored in **Custom Field 1 or 2** under the **Members table**.
- The **Earnings 3 Code** links to a payroll account tracked in Expensify.
- The **Earnings 3 Amount** is the total expense amount sent to payroll.
- To enter the **Earnings 3 Code**, navigate to:
  **Settings > Workspaces > [Group Workspace Name] > Categories > [Category Name] > Edit Rules > Add under Payroll Code**.

---

## Step 2: Create Your ADP Export Format
1. Navigate to **Settings > Workspaces > [Group Workspace Name] > Export Formats**.
2. Add the following column headings and formulas:

| Column Name         | Formula                                   |
|---------------------|------------------------------------------|
| Company Code       | Hardcoded from Step 1                    |
| Batch ID          | Hardcoded from Step 1                    |
| File #           | `{report:submit.from:customfield1}`       |
| Earnings 3 Code  | `{expense:category:payrollcode}`         |
| Earnings 3 Amount| `{expense:amount}`                       |

> The **Company Code** and **Batch ID** should be hardcoded with values from ADP.

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

