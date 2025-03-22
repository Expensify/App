---
title: Expensify Workspace Expense Settings
description: Customize and manage expense settings at the workspace level, including violations, reimbursable preferences, billable expenses, and mileage rates.
keywords: [Expensify Classic, expenses, violations, reimbursable, billable, mileage, eReceipts, tax, Concierge Receipt Audit]
---
<div id="expensify-classic" markdown="1">

Expensify offers multiple ways to customize how expenses are created and managed at the workspace level. Whether you’re using an individual workspace or managing expenses in a group workspace, there are various settings you can configure to suit your needs.

You can manage expense settings under **Settings** > **Workspaces** > **Individual** or **Group** > [_Workspace Name_] > **Expenses**. From here, you can customize the following expense-level settings:

- **Violations**: Flags employee expenses that fall outside of workspace preferences.
- **Preferences**: Configure reimbursable and billable settings for submitted expenses.
- **Distance**: Set reimbursable mileage rates for yourself or employees.
- **Time**: Define an hourly billable rate for time-based expenses.

---

# Expense Violations

A **Workspace Admin** can customize the following parameters at the expense level:
- **Max Expense Age (Days)**
- **Max Expense Amount**
- **Receipt Required Amount**

If an expense is submitted outside these parameters, Expensify automatically flags it as a violation and alerts both the expense creator and reviewer for correction.

More details on violations can be found [here](https://help.expensify.com/articles/expensify-classic/workspaces/Enable-and-set-up-expense-violations).

---

# Expense Preferences

A **cash expense** refers to any manually created expense or a receipt uploaded for SmartScan—it does not indicate payment with physical cash. The most common alternative is **credit card expenses**, which are imported from a connected card or bank.

## Reimbursable Expenses

There are four options for cash expenses:
- **Reimbursable by default** – Cash expenses are reimbursable but can be marked as non-reimbursable.
- **Non-reimbursable by default** – Cash expenses are non-reimbursable but can be marked as reimbursable.
- **Forced always reimbursable** – All cash expenses are reimbursable without the option to change.
- **Forced always non-reimbursable** – All cash expenses are non-reimbursable without the option to change.

## Billable Expenses

Billable expenses refer to costs that must be re-billed to a client or vendor. To configure billable expense settings:
1. Go to **Settings** > **Workspaces** > **Individual** or **Group** > [_Workspace Name_] > **Expenses**
2. Choose the best setting:
- **Disabled** – Expenses cannot be marked as billable.
- **Default to billable** – Expenses are billable by default but can be marked as non-billable.
- **Default to non-billable** – Expenses are non-billable by default but can be marked as billable.

If your **Group Workspace** integrates with Xero, QuickBooks Online, NetSuite, or Sage Intacct, you can export billable expenses for invoicing. Configure this under the **Coding** tab in the connection settings.

## eReceipts

Expensify generates **eReceipts**, which are digital replacements for receipts of **$75 or less** for credit card transactions.

- **Enabled** – Expensify will generate eReceipts for all US-based card transactions up to $75.
- **Disabled** – No eReceipts will be generated.

**Note:** Expensify does not generate eReceipts for lodging expenses.

## Secure Receipt Images

You can control receipt visibility under **Public Receipt Visibility**:

- **Enabled** – Receipts are publicly viewable via URL, even by non-Expensify users.
- **Disabled** – Only logged-in Expensify users with access can view receipts.

---

# Distance Expenses
To configure distance-based expenses:

1. Select whether you want to track **miles** or **kilometers**.
2. Set the default category for distance expenses.
3. Click **Add a Mileage Rate** to define custom rates.
4. Set the reimbursable amount per mile or kilometer.

**Note:** If a mileage rate is toggled off, users cannot select it when creating new distance expenses. If only one rate is available, it remains active by default.

---

# Track Tax on Mileage Expenses
If tracking tax in Expensify, you can enable tax tracking for distance expenses under **Settings** > **Workspaces** > **Individual** or **Group** > [_Workspace Name_] > **Tax**.

Once tax is enabled, you will see a **Track Tax** toggle in the Distance section. When enabled, you must enter:

- **Tax Reclaimable On** (what portion of the expense is taxable)
- **Tax Rate** (percentage of tax applied)

**Note:** Expensify does not automatically track cumulative mileage. To track per-employee mileage, consider creating a mileage report using custom export formulas.

---

# Time Expenses
Track time-based expenses for billing clients or processing employee stipends. To enable time tracking:

1. Navigate to the **Time** section in the workspace settings.
2. Click the toggle to enable time-based expenses.
3. Set a default hourly rate.

Users can then log time-based expenses via the [Expenses](https://expensify.com/expenses) page.

---

# Concierge Receipt Audit
Concierge Receipt Audit provides **real-time compliance checks** on receipts submitted by employees. It detects potential issues before expense reports are submitted for approval, ensuring accuracy and reducing manual oversight.

## Benefits of Concierge Receipt Audit:
- Flags risky expenses automatically, reducing manual review time.
- Provides detailed audit notes on every report.
- Included **at no extra cost** with the [Control Plan](https://www.expensify.com/pricing).
- Offers a structured review process with clear next steps.

**Note:** Reports with audit alerts require a **Review & Accept** action before approval.

---

# FAQ

## Why do I see eReceipts for expenses greater than $75?

Expensify generates eReceipts for **Expensify Card purchases** of any amount in the following categories:
- Airlines
- Commuter expenses
- Gas
- Groceries
- Mail
- Meals
- Car rental
- Taxis
- Utilities

## Why didn’t my mileage rate update to the latest IRS rate?

Expensify does not automatically update mileage rates based on IRS guidance. A **Workspace Admin** must manually update or create a new rate to reflect changes. This allows global customers to control rate adjustments and communicate changes internally.

</div>
