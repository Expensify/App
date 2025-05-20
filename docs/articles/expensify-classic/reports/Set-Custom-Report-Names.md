---
title: Set Custom Report Names
description: Automatically apply and enforce report titles across your workspace.
keywords: [Expensify Classic, default report title, report naming, enforce report title, report template, automatic report name, customize report name]
---
<div id="expensify-classic" markdown="1">

Workspace Admins can automatically apply a custom report title to all reports created within a specific workspace. You can also enforce this setting so members can't update it.

---

# Set a Default Report Title

1. Head to **Settings > Workspace > [Workspace Name] > Rules**.
2. Scroll to **Custom Report Names**.
3. Configure the title formula:
   - Use the example on the **Rules Settings page**, or refer to more [report formula options](https://help.expensify.com/articles/expensify-classic/spending-insights/Custom-Templates).
   - Some formulas automatically update the report title as changes are made. For example, the title will update before submission if the formula includes the report date, total amount, or workspace name.
   - Changes to Report Field values (e.g., `{field:Customer}`) won't update the title until the report is submitted. After submission and before approval, updates will apply automatically. Once a report is Approved or Reimbursed, the title will not update retroactively.
4. To prevent members from editing the title, enable the **Enforce Custom Report Names** toggle.

---

# FAQ

## Can I stop team members from changing the report name?
Yes! Just turn on the **Enforce Default Report Title** option, and the title will be locked in based on the formula you set.

## What if my formula doesn't show the correct title immediately?
Some formula fields, like `{field:Customer}`, only update after submission. Others, like dates and amounts, update in realtime before submitting the report.

</div>
