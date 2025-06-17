---
title: Customize and Enforce Report Titles
description: Learn how to set dynamic report titles using custom formulas and enforce naming consistency across your workspace.
keywords: [New Expensify, default report title, report naming, enforce report title, report formula, dynamic report name, workspace report titles]
---
<div id="new-expensify" markdown="1">

Automatically generate standardized report titles across your workspace using formulas. Admins can pull in dynamic data like report type or member name—and even lock naming rules to prevent edits.

---

# Customize Report Titles Using Formulas

**Navigation:**  
**Settings > Workspaces > [Workspace Name] > Reports**

1. Scroll to the **Report title** section.
2. Click to open the formula editor.
3. Use the formula list below to build your title.
4. (Optional) Enable **Prevent members from changing custom report names** to lock naming rules.

**Example formula:**  
`{report:type} - {report:submit:from:firstname} {report:startdate}`  
**Result:** `Expense Report - Alice 2025-05-15`

---

# How Dynamic Titles Work

- Some fields update automatically (e.g., `{report:startdate}`, `{report:total}`).
- Custom fields like `{field:Customer}` populate after submission.
- Report titles freeze once a report is **Approved** or **Reimbursed**.

---

# Report Title Formula Reference

Use curly brackets `{}` to reference dynamic data:

## Report-level data

| Formula | Example | Description |
| -- | -- | -- |
| `{report:id}` | R00I7J3xs5fn | Unique report ID |
| `{report:oldID}` | R3513250790654885 | Legacy report ID |
| `{report:total}` | $325.34 | Total amount on report |
| `{report:type}` | Expense Report | Report type (Expense Report, Invoice, Bill) |
| `{report:reimbursable}` | $143.43 | Reimbursable amount |
| `{report:currency}` | USD | Currency used |
| `{field:Employee ID}` | 123456 | Custom field from the report |
| `{report:created}` | 2024-09-15 12:00:00 | When report was created |
| `{report:created:yyyy-MM-dd}` | 2024-09-15 | Created date (custom format) |
| `{report:startdate}` | 2024-09-15 | Earliest expense date |
| `{report:enddate}` | 2024-09-26 | Latest expense date |
| `{report:submit:date}` | 2023-09-15 12:00:00 | Submission time |
| `{report:submit:date:yyyy-MM-dd}` | 2023-09-15 | Submission date (formatted) |
| `{report:approve:date}` | 2011-09-25 12:00:00 | Approval timestamp |
| `{report:approve:date:yyyy-MM-dd}` | 2011-09-25 | Approval date (formatted) |
| `{report:expensescount}` | 10 | Number of expenses |
| `{report:workspaceName}` | Sales | Name of the workspace |
| `{report:status}` | Approved | Current report status |
| `{report:submit:to}` | alice@email.com | Approver’s email |
| `{report:submit:from}` | Sally Ride | Submitter full name |
| `{report:submit:from:firstname}` | Sally | Submitter’s first name |
| `{report:submit:from:lastname}` | Ride | Submitter’s last name |
| `{report:submit:from:fullname}` | Sally Ride | Submitter full name |
| `{report:submit:from:email}` | sride@email.com | Submitter email |
| `{report:submit:from:customfield1}` | 100 | Submitter custom field 1 |
| `{report:submit:from:customfield2}` | 1234 | Submitter custom field 2 |

---

# Date Format Options

Customize date appearance with these formats:

| Format | Example |
| -- | -- |
| M/dd/yyyy | 5/23/2019 |
| MMMM dd, yyyy | May 23, 2019 |
| dd MMM yyyy | 23 May 2019 |
| yyyy/MM/dd | 2019/05/23 |
| MMMM, yyyy | May, 2019 |
| yy/MM/dd | 19/05/23 |
| dd/MM/yy | 23/05/19 |
| yyyy | 2019 |

---

# Advanced Formula Functions

Add `|` functions to format results:

- `frontpart` e.g. `{report:submit:from:email|frontpart}` = alice - Gets first word or string before `@`.
- `substr:x` e.g. `{report:policyname|substr:20}` = Sales Expenses - Trims to first `x` characters.
- `substr:x:y` e.g. `{report:policyname|substr:20|frontpart}` = Sales - Chains multiple functions.
- `domain` e.g. `{report:submit:from:email|domain}` = email.com - Returns email domain.

</div>
