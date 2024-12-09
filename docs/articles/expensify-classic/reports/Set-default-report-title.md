---
title: Set default report title
description: Set an automatic title for all reports
---
<div id="expensify-classic" markdown="1">

Workspace Admins can set a default report title for all reports created under a specific workspace. If desired, these titles can also be enforced to prevent employees from changing them.

1. Hover over Settings and select **Workspaces**.
2. Select the desired workspace.
3. Click the **Reports** tab on the left.
4. Scroll down to the Default Report Title section. 
5. Configure the formula. You can use the example provided on the page as a guide or choose from more [report formula options](https://help.expensify.com/articles/expensify-classic/spending-insights/Custom-Templates).
   - Some formulas will automatically update the report title as changes are made to the report. For example, any formula related to dates, total amounts, and workspace name would adjust the title before the report is submitted for approval. Note that changes to Report Field values reflected in the Report Title (i.e., `{field:Customer}`) will not be reflected in the title of Open reports until submission. Between submission and approval, changes will update the title immediately. Changes will **not** retroactively update report titles for reports that have been Approved or Reimbursed.
6. If desired, enable the Enforce Default Report Title toggle. This will prevent employees from editing the default title.  

</div>
