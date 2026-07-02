---
title: Agent Capability Reference
description: Every action your Agent can take, with ready-to-copy instruction phrases and disambiguation notes to avoid common mis-routings.
keywords: [Custom Agent, Agent, agent capabilities, agent actions, submit report, approve report, reject report, add comment, analyze expenses, agent instructions, workspace automation, Expensify automation]
internalScope: Audience is workspace admins configuring Agents. Covers all supported ManageReport sub-actions, AddComment, and AnalyzeExpenses. Does not cover read-only report context or NoResponse behavior.
---

An Agent acts on expense reports using the actions described below. This reference helps you phrase your instructions so your agent reliably does what you intend — and doesn't accidentally take the wrong action.

# Agent Capability Reference

---
## How to write instructions that submit expense reports

Sends an open (draft) expense report forward to the approver for review.

Example phrases for your agent's instructions:
- Submit expense reports for approval
- Send reports to my manager when they're ready
- Forward expense reports to the approval queue
- Submit reports that have no violations
- Submit reports that are under $500 total
- Submit all open reports at the end of the month

---

## How to write instructions that approve expense reports

Marks a submitted expense report as approved, moving it to the reimbursement queue.

Example phrases for your agent's instructions:
- Approve expense reports that meet my workspace rules
- Approve reports with no violations
- Approve reports under $1,000
- Approve reports when all receipts are attached
- Automatically approve reports from trusted submitters
- Approve reports that have already been reviewed by a first-level approver

---

## How to write instructions that reject expense reports

Sends a submitted expense report back to the submitter with a user-facing rejection comment explaining why.

Example phrases for your agent's instructions:
- Reject reports that have violations
- Reject reports over my spending limit
- Send reports back to the submitter when receipts are missing
- Reject reports that contain duplicate expenses
- Reject reports from submitters who have outstanding compliance issues
- Reject and explain why the report was returned

---

## How to write instructions that un-submit expense reports

Un-submits a submitted expense report, returning it to draft so the submitter can edit it.

Example phrases for your agent's instructions:
- Retract my submitted report so I can edit it
- Un-submit a report before it's approved
- Pull back a report that was submitted by mistake
- Return a report to draft status

---

## How to write instructions that take over a report as approver

Reassigns the agent as the current approver on a report that was routed to someone else, giving the agent the authority to approve or reject it. Requires workspace-admin role.

Example phrases for your agent's instructions:
- Take over reports over $10,000 regardless of who they were submitted to
- Seize reports with violations and reject them
- Take control of reports submitted to out-of-office approvers and approve them
- Intervene on any report that has a violation

---

## How to write instructions that route reports to a specific approver

Routes a submitted report to a specific approver by email, replacing the current approver in the workflow. Requires workspace-admin role.

Example phrases for your agent's instructions:
- Route reports over $5,000 to the finance manager
- Forward reports with international expenses to compliance@example.com
- Send reports from the engineering team to their designated approver
- Reroute reports that exceed the department budget to the CFO

---

## How to write instructions that create new expense reports

Creates a new expense report with a specified name, independent of any currently open report.

Example phrases for your agent's instructions:
- Create a new expense report for my Q2 travel
- Start a new report called Monthly Subscriptions
- Open a new report for the offsite trip
- Create a report named after the project

---

## How to write instructions that edit expenses

Edits, deletes, or restores individual expenses on the current report — field-level changes such as amount, category, merchant, reimbursable status, tags, or tax.

Example phrases for your agent's instructions:
- Set the category to Travel for all flight expenses
- Mark expenses over $500 as non-reimbursable
- Remove the tax code from all expenses on this report
- Change the merchant name to match the receipt
- Delete expenses that have no receipt attached
- Tag all meals expenses with the client project code

---

## How to write instructions that post comments on reports

Posts a message to the expense report thread, visible to all participants.

Example phrases for your agent's instructions:
- Leave a note explaining the approval decision
- Notify the submitter that their report was approved
- Post a comment asking the submitter to add missing receipts
- Acknowledge receipt of the report with a message
- Post a summary of the analysis performed before approving
- Leave a reminder for the submitter about next steps

---

## How to write instructions that look up expense data

Runs a read-only lookup across expense history to retrieve spend totals, rankings, period comparisons, or per-submitter figures the rule needs to make a decision.

Example phrases for your agent's instructions:
- Check the submitter's total spend this month before deciding
- Look up how many reports the submitter has had rejected in the past 90 days
- Find the submitter's total spend on travel in the last quarter
- Retrieve the workspace's total spend in the current period for comparison
- Check whether the submitter has any outstanding approved but unreimbursed reports

---

## How to write instructions that manage workspace settings and members

Inspects workspace configuration, answers membership questions, and — for workspace admins — adds or removes members and modifies workspace settings such as categories and approval rules.

Example phrases for your agent's instructions:
- Add new employees to the workspace when they join
- Remove members from the workspace when they leave the company
- Add a new expense category when requested
- Show me who is on this workspace
- What is the current approval mode for this workspace?
- Copy the category list from one workspace to another

---

*This reference covers all 11 Custom Agent capabilities.*
