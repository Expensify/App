---
title: Customize and Enforce Report Titles
description: Learn how to set dynamic report titles using custom formulas and enforce naming consistency across your workspace.
keywords: [New Expensify, default report title, report naming, enforce report title, report formula, dynamic report name, workspace report titles]
---
<div id="new-expensify" markdown="1">

Automatically generate standardized report titles across your workspace using formulas. Admins can pull in dynamic data like report type or member name, and even lock naming rules to prevent edits.

---

# Customize Report Titles Using Formulas

**Navigation:**  
**Workspaces > [Workspace Name] > Reports**

1. Scroll to the **Report title** section.
2. Click to open the formula editor.
3. Use the formula list below to build your title.
4. (Optional) Enable **Prevent members from changing custom report names** to lock naming rules.

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

Use curly brackets `{}` to reference dynamic data.

Here are some commonly used fields for report titles. For a full list of all formulas available in Expensify, see this [page](https://help.expensify.com/articles/expensify-classic/spending-insights/Export-Expenses-And-Reports#Formulas).

| Formula | Example | Description |
| -- | -- | -- |
| `{report:id}` | R00I7J3xs5fn | Unique report ID in a base 62 representation |
| `{report:oldID}` | 3513250790654885 | unique report ID |
| `{report:total}` | $325.34 | Total amount on report |
| `{report:reimbursable}` | $143.43 | Reimbursable amount |
| `{report:currency}` | USD | Currency used |
| `{report:startdate}` | 2024-09-15 | Earliest expense date |
| `{report:enddate}` | 2024-09-26 | Latest expense date |
| `{report:workspaceName}` | Sales | Name of the workspace |
| `{report:submit:from}` | Sally Ride | Submitter full name |
| `{report:submit:from:firstname}` | Sally | Submitter’s first name |
| `{report:submit:from:lastname}` | Ride | Submitter’s last name |
| `{report:submit:from:fullname}` | Sally Ride | Submitter full name |
| `{report:submit:from:email}` | sride@email.com | Submitter email |

</div>
