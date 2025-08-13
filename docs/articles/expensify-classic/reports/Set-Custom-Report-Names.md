---
title: Set Custom Report Names
description: Automatically apply and enforce report titles across your workspace.
keywords: [Expensify Classic, default report title, report naming, enforce report title, report template, automatic report name, customize report name]
---
<div id="expensify-classic" markdown="1">

Automatically generate standardized report titles across your workspace using formulas. Admins can pull in dynamic data like report type or member name, and even lock naming rules to prevent edits.

---

# Customize Report Titles Using Formulas

**Navigation:**
1. Head to **Settings > Workspace > [Workspace Name] > Rules**.
2. Scroll to **Custom Report Names**.
3. Configure the title formula using your preferred formulas (see below).
4. To prevent members from editing the title, enable the **Enforce Custom Report Names** toggle.

**Example formula:**  
`{report:type} - {report:submit:from:firstname} {report:startdate}`  
**Result:** `Expense Report - Alice 2025-05-15`

---

# How Dynamic Titles Work

- Custom report names update automatically when the value of the fields they reference is updated. For example:
    - {report:total} will update when new expenses are added to the report.
    - {report:workspaceName} will update when the workspace name changes.
- Report titles freeze once a report is **Approved** or **Reimbursed**.
- Fields related to report submission are snapshots of the data at the time the report was submitted. For example:
    - {report:submit:from:firstName} may capture the first name of Joanne and won't be updated if Joanne changes her first name to "Jo" in Expensify
    - The report title will need to be manually edited by an admin, or the report unapproved and submitted again

---

# Report Title Formula Reference

## Report-level data

| Formula | Example | Description |
| -- | -- | -- |
| `{report:id}` | R00I7J3xs5fn | Unique report ID in a base 62 representation |
| `{report:oldID}` | R3513250790654885 | unique report ID |
| `{report:total}` | $325.34 | Total amount on report |
| `{report:type}` | Expense Report | Report type (Expense Report, Invoice, Bill) |
| `{report:reimbursable}` | $143.43 | Reimbursable amount |
| `{report:currency}` | USD | Currency used |
| `{field:Employee ID}` | 123456 | Custom field from the report |
| `{report:created}` | 2024-09-15 12:00:00 | When report was created |
| `{report:created:yyyy-MM-dd}` | 2024-09-15 | Created date (custom format - see below for more formats) |
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
| M/dd/yyyy | 5/23/2024 |
| MMMM dd, yyyy | May 23, 2024 |
| dd MMM yyyy | 23 May 2024 |
| yyyy/MM/dd | 2024/05/23 |
| MMMM, yyyy | May, 2024 |
| yy/MM/dd | 24/05/23 |
| dd/MM/yy | 23/05/24 |
| yyyy | 2024 |

---

# Advanced Formula Functions

Add `|` functions to format results:

| Function | Example | Description |
| -- | -- | -- |
| `frontpart` | `{report:submit:from:email|frontpart}` → alice | Gets first word or string before `@` |
| `substr:x` | `{report:policyname|substr:20}` → Sales Expenses | Trims to first `x` characters |
| `substr:x:y` | `{report:policyname|substr:20|frontpart}` → Sales | Chains multiple functions |
| `domain` | `{report:submit:from:email|domain}` → email.com | Returns email domain |

</div>
