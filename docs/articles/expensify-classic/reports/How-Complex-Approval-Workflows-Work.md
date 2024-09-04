---
title: How Complex Approval Workflows Work
description: Examples of how Advanced Approval Workflows apply in real life
---
Approval workflows can get complex. Let’s look at the lifecycle of an expense report from submission to final approval.

## 1. Submission
The approval workflow for all reports starts as soon as the report is submitted. Reports can be submitted manually or set to [submit automatically](https://help.expensify.com/articles/expensify-classic/reports/Automatically-submit-employee-reports) by Concierge. 

If you change part of your workflow after a report has been submitted, the workflow for that report will not change unless it is retracted and resubmitted. 

## 2. Category & tag approvers
If you have [special approvers for categories or tags](https://help.expensify.com/articles/expensify-classic/reports/Assign-tag-and-category-approvers) that are added to a report, the report will go to these people for approval first. They will be notified about the report via email or an in-app notification.

## 3. Approval mode
The report will now travel through the approval workflow for the workspace:
- Submit & Close: If you use a [Submit & Close](https://help.expensify.com/articles/expensify-classic/reports/Create-a-report-approval-workflow) workflow, the report will now close and notify the set person. 
- Submit & Approve: If you use a [Submit & Approve](https://help.expensify.com/articles/expensify-classic/reports/Create-a-report-approval-workflow) workflow, the report will now go to the set person for their approval. 
- Advanced Approval: If you use an [Advanced Approval](https://help.expensify.com/articles/expensify-classic/reports/Create-a-report-approval-workflow) workflow, the report will now go to the person in the submitter’s “Submits to” column of the Workspace Members table. Once that person approves the report, 
    - The report then goes to the person in the approver’s Approves To column.
    - If the approver has an [approval value limit](https://help.expensify.com/articles/expensify-classic/reports/Require-review-for-over-limit-expenses) (i.e. they have approval restrictions based on the total amount of the report), the report will go to the set person.
    - The report continues through the approval workflow until it reaches someone who does not have anyone in their Approves To column. This person is the final approver.

Once the report receives final approval, it may be exported to a [connected accounting software](https://help.expensify.com/expensify-classic/hubs/connections/) and/or reimbursed.

## 4. Concierge approval 
If you’ve chosen to [require manual approval for expenses that exceed a set limit](https://help.expensify.com/articles/expensify-classic/reports/Require-review-for-over-limit-expenses), any report that doesn’t contain a single expense over this amount will be approved by Concierge.

## Workflow examples
Here are some scenarios to demonstrate the different approval workflows.

### Submit & Close
Two business partners named Terry and Dana run a small business together. They don’t need approvals for their expenses, so they use the Submit & Close workflow and have Terry set as the person to submit to. Once submitted, their reports are closed.

*Outcome: All submitted reports go to the main approver and are then closed automatically. No action is required for approval.*

### Submit & Approve with category approvers
Pat does the accounting for a small engineering firm. Everyone submits their reports to Pat for approval. However, all plant and equipment purchases must be seen by Dale. They created a category called “3005 Plant and Equipment” and assigned Dale as the category approver. This way, when a report is coded with this category, it will go to Dale once it is submitted. Then Pat will receive the report for final approval, reimbursement, and to export it to their accounting software connection. 

*Outcome: All submitted reports go to the main approver unless they contain expenses coded with a category that requires review by another approver first.*

### Submit & Approve with Scheduled Submit and Concierge approval
Sandra’s company has a manual approval threshold of $100 and has Scheduled Submit set to weekly. That means that as long as each expense is under $100, reports will be automatically submitted once a week. 

Her sales rep David regularly hosts client meetings, which results in a report filled with coffee, lunch, and parking expenses paid for on his company card. David has dutifully SmartScanned his receipts and coding them after each purchase. None of the individual expenses are over $100, so his report submits itself on Sunday evening. The report is instantly final approved within moments of submission, and the report history notes that Concierge both submitted and final approved the report.

*Outcome: Report submission and approval are automated unless there are large expenses.*

### Advanced Approval - Example 1
Amal is a photojournalist for a major magazine, and they have been traveling for a week. The last report they submitted contains meals, accommodations, and emergency camera equipment. 
1. Their report first goes to Tony, head of photography, who is the category approver for the “6050 Cameras and AV” category that was added to Amal’s report.
2. The report then goes to Jamie, who is Amal’s manager and “submits to.” 
3. Jamie approves and forwards the report to her “approves to” person, which is her manager Ali. 
4. Ali approves and forwards the report to his “approves to” person, which is the finance team. 
5. The finance team is the final approver for the report. They check the coding, approve the report, export it to the accounting system, and reimburse Amal.

*Outcome: Reports go through category-specific approvers first, then through the multiple levels of approval.*

### Advanced Approval - Example 2
Amal had another travel week, but this time to Hong Kong. Their report total includes a $1,200 flight as well as $950 for accommodations and food. 

The report goes to Jamie for approval, but Jamie has an “If Report Total is Over $2000 then Approves To” rule that requires large expenses to be approved by Lee. That means once Jamie approves the report, Lee must approve the expense next. Once Lee approves, the report goes to the finance team who completes the final approval. 

*Outcome: Reports with multiple levels of approval go through each approver whose approval limit is not great enough until it reaches the approver with the required approval limit.*
