---
title: Automatically submit employee reports
description: Use Expensify's Scheduled Submit feature to have your employees' expenses submitted automatically for them
---
<div id="expensify-classic" markdown="1">

Scheduled Submit automatically adds expenses to a report and sends them for approval so that your employees do not have to remember to manually submit their reports each week. This allows you to automatically collect employee expenses on a schedule of your choosing.

With Scheduled Submit, an employee's expenses are automatically gathered onto a report as soon as they create them. If there is not an existing report, a new one is created. The report is then automatically submitted at the cadence you choose—daily, weekly, monthly, twice per month, or by trip. 

{% include info.html %}
If an expense has a violation, Scheduled Submit will not automatically submit it until the violations are corrected. In the meantime, the expense will be removed from the report and added to an open report. 
{% include end-info.html %}

# Enable Scheduled Submit

1. Hover over Settings, then click **Workspaces**.
2. Click the **Group** tab on the left (or click the Individual tab to enable Scheduled Submit for your individual workspace).  
3. Click the desired workspace name. 
4. Click the **Reports** tab on the left. 
5. Click the Scheduled Submit toggle to enable it. 
6. Click the “How often expenses submit” dropdown and select the submission schedule:
   - **Daily**: Expenses are submitted every evening. Expenses with violations are submitted the day after the violations are corrected.
   - **Weekly**: Expenses are submitted once a week. Expenses with violations are submitted the following Sunday after the violations are corrected. 
   - **Twice a month**: Expenses are submitted on the 15th and the last day of each month. Expenses with violations are submitted at the next cycle (either on the 15th or the last day of the month, whichever is closest).
   - **Monthly**: Expenses are submitted once per month. If you select Monthly, you will also select which day of the month the reports will be submitted. Expenses with violations are submitted on the next monthly submission date. 
   - **By trip**: All expenses that occur in a similar time frame are grouped together. The trip report is created after no new expenses have been submitted for two calendar days. Then the report is submitted the second day, and any new expenses are added to a new trip report. 
   - **Manually**: Expenses are automatically added to an open report, but the report will require manual submission—it will not be submitted automatically. This is a great option for automatically gathering an employee’s expenses on a report while still requiring the employee to review and submit their report.

{% include info.html %}
- All submission times are in the evening PDT. 
- If you enable Scheduled Submit for your individual workspace and one of your group workspaces also has Scheduled Submit enabled, the group’s submission settings will override your individual workspace settings. 
{% include end-info.html %}

# FAQs

**I disabled Scheduled Submit. Why do I still get reports submitted by Concierge?**

Although an Admin can disable scheduled submit for a workspace, employees have the ability to activate schedule submit for their account. If you disable Scheduled Submit but still receive reports from Concierge, the employee has Schedule Submit activated for their individual workspace. 

</div>
