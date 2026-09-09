---
title: Reimbursement payment methods 
description: Learn how Workspace Admins reimburse approved expense reports using ACH, global reimbursement or Pay elsewhere, including timelines and supported currencies.
keywords: [New Expensify, Workspace Admin reimburse, ACH reimbursement, global reimbursement, reimbursement timeline, Pay elsewhere, Mark as paid, Rapid Reimbursement, reimburse employees, supported currencies, direct reimbursement, pay reports in bulk, pay multiple reports, select all matching reports]
internalScope: Audience is Workspace Admins. Covers how Workspace Admins reimburse approved expense reports using ACH, global reimbursement, or Mark as paid, including single-report payments, bulk payments, paying every report matching a Reports search, timelines, and supported currencies. Does not cover bank account setup steps, reimbursement failure troubleshooting, member-level bank account setup, or Expensify Card transactions.
---

Workspace Admins can reimburse approved reports using ACH reimbursement, global reimbursement, or Pay elsewhere. This article explains how each method works, supported currencies, and typical timelines.

---

# How to choose a reimbursement method for approved reports

Workspace Admins can choose between two reimbursement methods when paying an approved report in Expensify:

- **Direct reimbursement** — Expensify sends payment from a connected Workspace business bank account to a member’s connected personal bank account. This includes US ACH reimbursement and Global Reimbursement.
- **Pay elsewhere** — The Workspace Admin marks the report as paid in Expensify and issues payment outside the platform. Expensify records the report as paid but does not process the transfer.

The payment method is selected when the Workspace Admin clicks **Pay** on an approved report.

**Note:** For reports containing only non-reimbursable expenses (e.g. company card expenses), direct reimbursement is not available. The only payment option is **Pay elsewhere**.

[Learn about report statuses and actions](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Understanding-Report-Statuses-and-Actions).

---

## What reimbursement payment types are available

Available payment types depend on the location of the Workspace’s business bank account.

The steps to send reimbursement are the same for ACH reimbursement, global reimbursement, and Pay elsewhere. The only difference is the payment method selected when clicking **Pay**.

- **US-based business bank account:**  
  ACH reimbursement is used for payments in USD from a US business bank account to a US personal deposit account. [Learn how to set up ACH reimbursement](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Connect-a-Business-Bank-Account). 

- **International business bank account:**  
  Global reimbursement is available for business bank accounts located in:
  - United States (USD)
  - Canada (CAD)
  - United Kingdom (GBP)
  - European Union (EUR)
  - Australia (AUD)

  Global reimbursement can be used to reimburse members in 190+ countries, depending on supported banking rails. [Learn how to set up Global Reimbursement on a Workspace](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Enable-Global-Reimbursement). 

- **All Workspaces:**  
  **Pay elsewhere** does not require a connected business bank account and is available to all Workspace Admins.

---

## How Workspace Admins pay a single report

To pay one report:

1. From the navigation tabs (on the left on web, and at the bottom on mobile) choose **Spend > Reports**.
2. Under **To-do**, select **Pay**.
3. On the report you wish to reimburse, select **Pay**.
4. Choose a payment method:
   - Select a connected Workspace business bank account to send direct reimbursement.
   - Select **Pay elsewhere** to mark the report as paid outside Expensify.
5. Select **Confirm**.

**Note:** Only bank accounts that match the report's currency are shown. For example, if the report is in EUR, only EUR bank accounts appear as payment options.

Once confirmed, the report status updates to **Paid**.

---

## How Workspace Admins pay multiple reports in bulk

Workspace Admins can also pay multiple reports at the same time.

To pay reports in bulk:

1. From the navigation tabs (on the left on web, and at the bottom on mobile) choose **Spend > Reports**.
2. Under **To-do**, select **Pay**.
3. Select the checkbox next to each Approved report you want to pay.
4. Select the **[number] selected** button that appears in the header.
5. Choose **Pay**.
6. Choose a payment method:
   - Select a connected Workspace business bank account to send direct reimbursement.
   - Select **Mark as paid** to record the reports as paid outside Expensify. This is the Pay elsewhere method.
7. Confirm the payment.

**Note:** Only bank accounts that match the report's currency are shown. For example, if the reports are in EUR, only EUR bank accounts appear as payment options. If the selected reports contain more than one currency, direct reimbursement is not available — select **Mark as paid** to record the payments, or pay same-currency reports in separate batches.

Once confirmed, Expensify processes the transfers and the report statuses update to **Paid**.

**Note:** Each selected report is processed as a separate transaction. If the selected reports have different currencies, only **Mark as paid** is available. To use a connected business bank account for direct reimbursement, select reports that share the same currency.

---

## How to pay every report matching a search in bulk

Instead of selecting each report individually, Workspace Admins can pay every report that matches the current **Reports** view, including matching reports on pages that have not loaded yet.

1. From the navigation tabs (on the left on web, and at the bottom on mobile) choose **Spend > Reports**.
2. Under **To-do**, select **Pay**, then apply any other filters that narrow the list to the reports you want to pay.
3. Select the checkbox in the report list header. When more matching reports exist than the page shows, a menu opens — choose **Select all**. To pay only the reports currently listed, choose **Select all on this page** instead.
4. Select the **[number] selected** button that appears in the header.
5. Choose **Pay**, then select **Mark as paid**.
6. Confirm the payment.

Expensify works through every matching report and updates each report status to **Paid**. Large selections are processed in the background, so the report statuses update as each payment is recorded rather than all at once.

**Note:** When **Select all** is used, **Mark as paid** is the only payment option. Direct reimbursement from a business bank account is not offered, because the full set of matching reports can span multiple Workspaces, currencies, and bank accounts. To send direct reimbursement, choose **Select all on this page** or select individual reports that share the same currency.

<!-- SCREENSHOT:
Suggestion: The Reports view with the report list header checkbox clicked, showing the open menu with the two options "Select all on this page" and "Select all".
Location: Immediately after step 3 of "How to pay every report matching a search in bulk".
Purpose: Workspace Admins cannot tell from the header checkbox alone that two different selection scopes exist, and paying "Select all" instead of "Select all on this page" pays reports they never saw on screen.
-->

---

## What happens when some selected reports cannot be paid

A selection can include reports that are not ready to pay — for example, reports that are still open, awaiting approval, or already paid.

**Pay** remains available as long as at least one selected report can be paid. Expensify pays only the reports that are ready and leaves the rest untouched, so the payment total and the confirmation reflect the payable reports alone.

An expense on hold blocks **Pay** only when that expense belongs to one of the reports being paid. A held expense on a report that is skipped does not hide the **Pay** option.

**Note:** All payable reports in the selection must be the same report type. If the selection mixes report types, **Pay** is not offered — select reports of a single type instead.

---

## ACH reimbursement timelines 
- **Rapid Reimbursement:** Eligible payments are typically received by the member in one business day. Applies to payments under $100 when total withdrawals are under $10,000 in the past 24 hours.
- **Standard ACH reimbursement:** All other ACH payments are typically received by the member in four to five business days.

Rapid Reimbursement is applied automatically when eligibility requirements are met.

## Global Reimbursement timelines 

Global reimbursement timelines vary by country. However, most reimbursements are processed in two to three business days. 

---

## Supported Currencies for Global Reimbursement

Workspace business bank accounts can be connected in:

- [USD](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Global-Reimbursement-United-States) (United States)
- [CAD](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Global-Reimbursement-Canada) (Canada)
- [GBP](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Global-Reimbursement-United-Kingdom) (United Kingdom)
- [EUR](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Global-Reimbursement-Europe) (European Union)
- [AUD](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Global-Reimbursement-Australia) (Australia)
- [SGD](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Global-Reimbursement-Singapore) (Singapore)

Members can receive funds in 190+ countries after adding a supported personal bank account.

**Note:** Foreign exchange (FX) fees or receiving bank fees may affect the final deposited amount.

---

# FAQ

## What is direct reimbursement?

Direct reimbursement means Expensify sends payment from the Workspace’s connected business bank account to a member’s connected personal bank account after the Workspace Admin clicks **Pay**.

## Can Workspace Admins send reimbursement by check?

Expensify does not issue checks. Workspace Admins can select **Pay elsewhere** and issue a check outside Expensify.

## What is the difference between ACH reimbursement and global reimbursement?

ACH reimbursement applies to US-based USD payments. Global reimbursement supports international payments and multiple currencies.

## Why is direct reimbursement not available for some reports?

If a report contains only non-reimbursable expenses (e.g. company card expenses), direct reimbursement (ACH or global reimbursement) is not offered. Only **Pay elsewhere** is available, because non-reimbursable expenses are paid by the company directly and do not require reimbursement to the employee.

## When is Pay elsewhere used?

Common scenarios for using Pay elsewhere include:

- Reimbursing through payroll  
- Issuing a company check  
- Sending a bank wire  
- Using another internal payment system  

Workspace business bank accounts can be connected in USD, CAD, GBP, EUR, AUD, or SGD. Global reimbursement supports member bank accounts in 190+ countries.
