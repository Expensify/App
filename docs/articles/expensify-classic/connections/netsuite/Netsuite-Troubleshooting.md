---
title: Netsuite Troubleshooting.md
description: Troubleshoot common NetSuite sync and export errors.
keywords: [NetSuite, sync, export, troubleshooting, errors, Expensify integration]
---

Synchronizing and exporting data between **Expensify** and **NetSuite** helps streamline your financial workflows. However, you might encounter errors due to discrepancies in settings, missing data, or configuration issues in either **NetSuite** or **Expensify**. 

This troubleshooting guide helps you identify and resolve common sync and export issues, ensuring seamless integration and efficient expense reporting.

---

# ExpensiError NS0005: Please Enter Value(s) for Department, Location, or Class

This error occurs when **NetSuite** requires classifications (like **Department**, **Location**, or **Class**) at the header level in your transaction form.

## Vendor Bills:
For **vendor bills**, **Expensify** pulls information from the **vendor record**, not the employee record, so employee defaults don’t apply.

**Fix for Vendor Bills**:
1. Go to **Customization > Forms > Transaction Forms**.
2. Click **Edit** on the relevant vendor bill form.
3. Go to **Screen Fields > Main**.
4. Uncheck **Show** and **Mandatory** for the listed fields.
5. Sync the workspace in Expensify (**Settings > Workspaces > Workspace Name > Connections > Sync**).
6. Retry the export.

## Journal Entries and Expense Reports:
If this error occurs when exporting a **Journal Entry** or **Expense Report**, it likely means the report submitter lacks default **Department**, **Class**, or **Location** settings.

**Fix for Journal Entries and Expense Reports**:
1. Go to **Lists > Employees** in **NetSuite**.
2. Edit the employee's record.
3. Set default **Department**, **Class**, and **Location**.
4. Save and sync the connection in Expensify.

---

# ExpensiError NS0012: Currency Does Not Exist in NetSuite

This error occurs when a foreign currency is not recognized in your **NetSuite** subsidiary.

## Scenario One:
If **Expensify** sends a currency that isn't listed in **NetSuite**, you’ll see this error.

**Fix**:
1. Ensure the currency in **Expensify** matches your **NetSuite** subsidiary.
2. Re-sync your connection in Expensify and retry.

## Scenario Two:
This error can occur if you’re using a non-OneWorld **NetSuite** instance and exporting a currency other than **EUR**, **GBP**, **USD**, or **CAD**.

**Fix**:
1. In **NetSuite**, go to **Setup > Enable Features**.
2. Check **Multiple Currencies**.
3. Add the required currency in the global search.

---

# ExpensiError NS0021: Invalid Tax Code Reference Key

This error typically indicates an issue with **NetSuite's Tax Group settings**.

## Fix:
Ensure that **Tax Codes** are correctly mapped to the appropriate **Tax Group**. For **Australian Taxes**:
- **GST 10%** should map to **NCT-AU**, not **TS-AU**.
- **No GST 0%** should map to **NCF-AU**, not **TFS-AU**.

---

# ExpensiError NS0023: Employee Does Not Exist in NetSuite (Invalid Employee)

This happens if the **employee’s subsidiary** in **NetSuite** doesn’t match what's listed in **Expensify**.

## Fix:
1. Check the employee's subsidiary in **NetSuite** and ensure it matches **Expensify's workspace settings**.
2. Ensure that the employee's email in **NetSuite** matches the one in **Expensify**.
3. Sync the **NetSuite** connection in **Expensify**.

---

# ExpensiError NS0024: Invalid Customer or Project Tag

This error happens if an employee isn't listed as a resource on the **customer/project** in **NetSuite**.

## Fix:
1. Go to **Lists > Relationships > Customer/Projects** in **NetSuite**.
2. Edit the relevant **Customer/Project** and add the employee as a resource.
3. Sync with **Expensify** and retry the export.

---

# ExpensiError NS0034: This Record Already Exists

This error occurs if the report has already been exported to **NetSuite**.

## Fix:
1. In **NetSuite**, search for the **Report ID**.
2. Delete the existing report and re-export it from **Expensify**.

---

# ExpensiError NS0046: Billable Expenses Not Coded with a NetSuite Customer or Billable Project

This error occurs when **billable expenses** are not tagged with a valid **Customer** or **Billable Project**.

## Fix:
1. In **Expensify**, ensure **billable expenses** have a valid **Customer** or **Project** tag.
2. Re-export the report.

---

# ExpensiError NS0059: No Credit Card Account Selected for Corporate Card Expenses

This error arises when no **corporate card account** is selected for the report.

## Fix:
1. In **NetSuite**, go to **Subsidiaries** and set the **Default Account for Corporate Card Expenses**.
2. Sync with **Expensify** and retry the export.

---

# ExpensiError NS0085: Expense Does Not Have Appropriate Permissions for Setting an Exchange Rate in NetSuite

This error occurs when exchange rate settings in **NetSuite** aren't correctly configured.

## Fix:
1. In **NetSuite**, ensure the **Exchange Rate** field is shown for the relevant form.
2. Sync the **Expensify** connection and retry.

---

# ExpensiError NS0079: The Transaction Date is Not Within the Date Range of Your Accounting Period

This error happens when the transaction date is outside the allowed period.

## Fix:
1. In **NetSuite**, go to **Accounting Preferences** and ensure the field **Allow Transaction Date Outside of the Posting Period** is set to **Warn**.
2. In **Expensify**, enable **Export to Next Open Period** and sync.

---

# ExpensiError NS0055: Vendor Doesn't Have Access to the Currency

This error occurs when a **vendor** does not have access to a **currency** on the report.

## Fix:
1. In **NetSuite**, add the necessary currencies to the vendor's **Financial tab**.
2. Sync the **Expensify** connection and retry.

---

# ExpensiError NS0068: You Do Not Have Permission to Set a Value for Element - “Created From”

This error occurs if **NetSuite** restricts access to the **"Created From"** field.

## Fix:
1. In **NetSuite**, ensure the **Created From** field is visible for the relevant forms.
2. Sync with **Expensify** and retry.

---

# ExpensiError NS0037: You Do Not Have Permission to Set a Value for Element - “Receipt URL”

This error occurs when **NetSuite** restricts access to the **Receipt URL** field.

## Fix:
1. In **NetSuite**, ensure the **Receipt URL** field is visible for the relevant forms.
2. Sync with **Expensify** and retry.

---

# ExpensiError NS0042: Error Creating Vendor - This Entity Already Exists

This error happens when **Expensify** cannot find an existing **vendor** in **NetSuite**.

## Fix:
1. Ensure the **email** and **subsidiary** of the **vendor** match the details in **Expensify**.
2. Sync the **Expensify** connection and retry.

---

# ExpensiError NS0109: Failed to Login to NetSuite, Please Verify Your Credentials

This error indicates an issue with the **NetSuite** credentials.

## Fix:
1. Review the [Connect to NetSuite](https://help.expensify.com/articles/expensify-classic/integrations/accounting-integrations/NetSuite) guide to ensure correct credentials.
2. If needed, create a new token for the connection.

---

# ExpensiError NS0123: Login Error: Please Make Sure That the Expensify Integration is Enabled

This error occurs when the **Expensify integration** is not enabled in **NetSuite**.

## Fix:
1. In **NetSuite**, go to **Setup > Integrations > Manage Integrations**.
2. Ensure the **Expensify Integration** is enabled.

---

# ExpensiError NS0045: Expenses Not Categorized with a NetSuite Account

This error happens when an **expense category** is missing or incorrectly configured.

## Fix:
1. In **NetSuite**, ensure the **expense category** is active and correctly named.
2. Sync with **Expensify** and retry.

---

# FAQ

## Why are Reports Exporting as `Accounting Approved` Instead of `Paid in Full`?

This can occur due to missing **Location**, **Class**, or **Department** settings or incorrect **Expensify Workspace Configuration**.

**Fix**:
1. Update the **Bill Payment Form** in **NetSuite**.
2. Verify **Expensify's workspace connection settings** for proper configuration.

---
