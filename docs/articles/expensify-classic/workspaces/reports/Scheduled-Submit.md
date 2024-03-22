---
title: Scheduled Submit
description: How to use the Scheduled Submit feature
---
# Overview

Scheduled Submit reduces the delay between the time an employee creates an expense to when it is submitted to the admin. This gives admins significantly faster visibility into employee spend. Without Scheduled Submit enabled, expenses can be left Unreported giving workspace admins no visibility into employee spend.

The biggest delay in expense management is the time it takes for an employee to actually submit the expense after it is incurred. Scheduled Submit allows you to automatically collect employee expenses on a schedule of your choosing without delaying the process while you wait for employees to submit them. 

It works like this: Employee expenses are automatically gathered onto a report. If there is not an existing report, a new one will be created. This report is submitted automatically at the cadence you choose (daily, weekly, monthly, twice month, by trip).

# How to enable Scheduled Submit

**For workspace admins**: To enable Scheduled Submit on your group workspace, follow **Settings > Workspaces > Group > *[Workspace Name]* > Reports > Scheduled Submit**. From there, toggle Scheduled Submit to Enabled. Then, choose your desired frequency from the dropdown menu. 
For individuals or employees: To enable Scheduled Submit on your individual workspace, follow **Settings > Workspaces > Individual > *[Workspace Name]* > Reports > Scheduled Submit**. From there, toggle Scheduled Submit to Enabled. Then, choose your desired frequency from the dropdown menu.

## Scheduled Submit frequency options

**Daily**: Each night, expenses without violations will be submitted. Expenses with violations will remain on an open report until the violations are corrected, after which they will be submitted in the evening (PDT).

**Weekly**: Expenses that are free of violations will be submitted on a weekly basis. However, expenses with violations will be held in a new open report and combined with any new expenses. They will then be submitted at the end of the following weekly cycle, specifically on Sunday evening (PDT).

**Twice a month**: Expenses that are violation-free will be submitted on both the 15th and the last day of each month, in the evening (PDT). Expenses with violations will not be submitted, but moved on to a new open report so the employee can resolve the violations and then will be submitted at the conclusion of the next cycle.

**Monthly**: Expenses that are free from violations will be submitted on a monthly basis. Expenses with violations will be held back and moved to a new Open report so the violations can be resolved, and they will be submitted on the evening (PDT) of the specified date.

**By trip**: Expenses are grouped by trip. This is calculated by grouping all expenses together that occur in a similar time frame. If two full days pass without any new expenses being created, the trip report will be submitted on the evening of the second day. Any expenses generated after this submission will initiate a new trip report. Please note that the "2-day" period refers to a date-based interval, not a 48-hour time frame.

**Manually**: An open report will be created, and expenses will be added to it automatically. However, it's important to note that the report will not be submitted automatically; manual submission of reports will be required.This is a great option for automatically gathering all an employee’s expenses on a report for the employee’s convenience, but they will still need to review and submit the report.

# Deep Dive

## Schedule Submit Override
If Scheduled Submit is disabled at the group workspace level or configured the frequency as "Manually," the individual workspace settings of a user will take precedence and be applied. This means an employee can still set up Scheduled Submit for themselves even if the admin has not enabled it. We highly recommend Scheduled Submit as it helps put your expenses on auto-pilot!

## Personal Card Transactions
Personal card transactions are handled differently compared to other expenses. If a user has added a card through Settings > Account > Credit Card Import, they need to make sure it is set as non-reimbursable and transactions must be automatically merged with a SmartScanned receipt. If transactions are set to come in as reimbursable or they aren’t merged with a SmartScanned receipt, Scheduled Submit settings will not apply.
