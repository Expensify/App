---
title: Agent Trigger Reference
description: Every event your Agent can react to, with ready-to-copy instruction phrases for your agent's prompt.
keywords: [Custom Agent, Agent, agent triggers, report_activity, agent instructions, expense report events, workspace automation, when to trigger agent, report submitted, report approved, Expensify automation]
internalScope: Audience is workspace admins configuring Agents. Covers all expose-level report_activity events. Does not cover chat message triggers or report-received triggers.
---

An Agent reacts to expense report events when its instructions match what happened. This reference lists every event your agent can respond to, along with example phrases you can paste directly into your prompt.

# Agent Trigger Reference

---
## How to write instructions for submission and approval events

**A user submitted an expense report to their approver for review.**

Example phrases for your agent's instructions:
- When an expense report is submitted
- When an expense report is submitted for approval
- When someone sends their expenses to their manager
- When a report enters the approval queue
- When someone submits a report for review

**A user submitted an expense report on a workspace where approvals are disabled, so the report was automatically marked as Done without manual review.**

Example phrases for your agent's instructions:
- When an expense report is submitted
- When someone submits expenses
- When an expense report is submitted and automatically marked as Done
- When a report is marked as Done immediately on submission
- When submission results in instant completion with no manual review

**An approver approved an expense report.**

Example phrases for your agent's instructions:
- When an expense report is approved
- When a manager approves someone's expenses
- When a report gets the green light from the approver
- When someone approves a report

**An approver or admin reversed a prior approval, returning the expense report to a submitted (pending review) state.**

Example phrases for your agent's instructions:
- When an approval is reversed
- When a previously approved report is sent back for re-review
- When someone undoes an approval
- When a report is unapproved

**In a multi-level approval chain, an approver sent the expense report back to the previous approver (not all the way back to the submitter). The report remains in a submitted state.**

Example phrases for your agent's instructions:
- When a report is rejected to the previous approver
- When a report is kicked back one step in the approval chain
- When an approver pushes a report back to the person who forwarded it to them

**An approver rejected the expense report all the way back to the original submitter, returning it to an open (draft) state so the submitter can revise and resubmit.**

Example phrases for your agent's instructions:
- When a report is rejected back to the submitter
- When an approver sends expenses back for the employee to fix
- When a report is denied and returned to the person who created it
- When someone's report is rejected

**The original submitter withdrew their own expense report after submission, returning it to an open (draft) state.**

Example phrases for your agent's instructions:
- When a submitter recalls or withdraws their report
- When someone takes back a report they submitted
- When an employee retracts their own expense report
- When someone unsubmits a report

**An individual expense on a report was placed on hold, flagging it for follow-up while allowing the rest of the report to move forward.**

Example phrases for your agent's instructions:
- When an expense is put on hold
- When a specific charge is flagged for review
- When someone holds an individual transaction

**A hold was removed from an individual expense, allowing it to proceed normally.**

Example phrases for your agent's instructions:
- When a hold is removed from an expense
- When a flagged transaction is cleared
- When an expense is taken off hold

---

## How to write instructions for report lifecycle events

**A new report was created — either an expense report, a chat room, or a direct-message thread.**

Example phrases for your agent's instructions:
- When a new expense report is created
- When a new workspace room is created
- When a new chat is started
- When someone opens a blank report

**A workspace room or expense report was renamed.**

Example phrases for your agent's instructions:
- When a workspace room is renamed
- When someone changes what a report is called
- When someone updates a report title

**An expense report was marked as done.**

Example phrases for your agent's instructions:
- When an expense report is marked as done
- When an invoice is closed
- When someone closes a report

**A previously closed or approved expense report was reopened, returning it to an open (draft/editable) state so the submitter can revise it.**

Example phrases for your agent's instructions:
- When a closed report is reopened
- When an approved report is sent back for editing
- When a report is moved back to draft state

**The current approver manually assigned the expense report to themselves, taking ownership of it from whoever it was previously assigned to.**

Example phrases for your agent's instructions:
- When an approver takes over a report
- When someone claims an expense report for themselves
- When an approver self-assigns a pending report

**A workspace admin changed the approval workflow, triggering an automatic bulk reassignment of all in-flight expense reports to the new approver.**

Example phrases for your agent's instructions:
- When a report is automatically reassigned due to a workflow change
- When an approval chain update causes reports to be moved to a new approver

**The current approver manually forwarded the expense report to a different approver.**

Example phrases for your agent's instructions:
- When a report is forwarded to a different approver
- When an approver reassigns a report to someone else
- When a report is rerouted to a new reviewer

**An expense report was moved from one expense chat to another — either from a personal chat into a workspace, or between two workspaces.**

Example phrases for your agent's instructions:
- When an expense report is moved from a personal chat into a workspace
- When an expense report is transferred between two workspaces
- When a report changes workspace ownership

**An expense report was moved from one workspace to another.**

Example phrases for your agent's instructions:
- When an expense report is reassigned to a different workspace
- When a report is moved from one company workspace to another
- When a workspace admin moves reports between workspaces

**A report was converted from one type to another — for example, a standard expense report converted to an invoice.**

Example phrases for your agent's instructions:
- When an expense report is converted to an invoice
- When a report type changes

**A report was randomly selected for manual audit during the auto-approval process. The workspace has auto-approval enabled with an audit rate configured, and this report was sampled out of auto-approval. A notice is posted by Concierge. The report will remain in the submitted state until a human approver reviews it.**

Example phrases for your agent's instructions:
- When a report is flagged for manual review instead of auto-approving
- When Concierge selects a report for random audit
- When auto-approval is bypassed for a specific report due to random audit sampling

---

## How to write instructions for reimbursement events

**A reimbursement was initiated but is waiting on the employee to take an action before money can move — for example, adding a deposit bank account or activating their Expensify Wallet.**

Example phrases for your agent's instructions:
- When reimbursement is pending employee action
- When an employee needs to add their bank account to receive reimbursement
- When a payment is queued and waiting on the recipient

**A queued reimbursement was cancelled before any money moved.**

Example phrases for your agent's instructions:
- When a reimbursement is cancelled
- When a queued payment is stopped before being sent
- When reimbursement is removed from the queue

**A reimbursement payment is taking longer than expected to process.**

Example phrases for your agent's instructions:
- When a reimbursement is delayed
- When a payment is held for review
- When reimbursement processing is paused

**An ACH reimbursement payment was returned (bounced) after it was sent. The reimbursement did not reach the employee. The report status returns to approved (awaiting re-payment).**

Example phrases for your agent's instructions:
- When a reimbursement payment bounces
- When an ACH transfer is returned
- When a bank rejects an incoming deposit

**A reimbursement or invoice payment was sent through Expensify.**

Example phrases for your agent's instructions:
- When an expense report is reimbursed
- When an employee receives their reimbursement
- When payment is sent for an expense report
- When an invoice is paid

**An admin marked an expense report as paid outside of Expensify. No money moved through the Expensify platform.**

Example phrases for your agent's instructions:
- When a report is marked as paid
- When a report is manually marked as reimbursed
- When an admin records an offline reimbursement
- When reimbursement happened outside Expensify and is being logged

**A third-party accounting integration (QuickBooks, Xero, NetSuite, etc.) recorded that the expense report was reimbursed through that external system.**

Example phrases for your agent's instructions:
- When an accounting integration marks a report as paid
- When a report is reimbursed through a synced accounting system
- When QuickBooks or Xero records reimbursement of an expense report

**A reimbursement attempt failed because the reimbursement bank account details have changed. The system notifies the submitter that they need to update their deposit account before reimbursement can proceed.**

Example phrases for your agent's instructions:
- When a reimbursement fails because the bank account changed
- When an employee needs to update their deposit account
- When reimbursement is blocked due to a bank account issue

**A payment was confirmed as received. This fires in two scenarios: (1) the creditor marks an invoice report as redeemed (payment received outside Expensify), or (2) the expense submitter confirms they received their reimbursement when the payer settled outside Expensify. The actor is the person confirming receipt of payment.**

Example phrases for your agent's instructions:
- When an invoice is confirmed as paid
- When the submitter confirms they received their reimbursement
- When a money request is marked as settled outside Expensify

---

## How to write instructions for expense and violation events

**An expense's fields were changed — amount, merchant, category, date, description, tax, attendees, or other metadata.**

Example phrases for your agent's instructions:
- When an expense is edited by the submitter or an approver
- When someone changes the amount, merchant, or category on an expense
- When an expense field is automatically updated by category rules
- When attendees are added or removed from an expense

**A workspace-defined custom field on the expense report itself was changed while the report was submitted or approved.**

Example phrases for your agent's instructions:
- When a custom report-level field is updated on a submitted report
- When a workspace tag or custom field on a report changes
- When a report's user-defined field value is modified after submission

**An expense was permanently deleted.**

Example phrases for your agent's instructions:
- When an expense is deleted
- When a transaction is permanently removed
- When someone deletes an expense from a report

**An expense was removed from all expense reports and returned to "Unreported" status.**

Example phrases for your agent's instructions:
- When an expense is removed from a report without being deleted
- When a transaction is sent back to unreported
- When someone takes an expense off their expense report

**An expense was moved from one expense report to another.**

Example phrases for your agent's instructions:
- When an expense is moved to a different report
- When a transaction is reassigned from one expense report to another

**A user manually resolved a duplicate transaction violation by merging two transactions. The kept transaction survives; the duplicate is removed.**

Example phrases for your agent's instructions:
- When someone resolves a duplicate expense
- When a duplicate transaction flag is cleared by the user
- When two identical transactions are merged into one by a user

**A user dismissed one of the two violations that can be dismissed in Expensify: either a card expense was marked as cash (bypassing card transaction matching), or a duplicate expense warning was dismissed without merging.**

Example phrases for your agent's instructions:
- When someone marks a card expense as cash
- When an employee dismisses a duplicate expense warning

**An edit to an expense resolved one or more workspace violations automatically.**

Example phrases for your agent's instructions:
- When a workspace violation on an expense is fixed
- When an expense edit resolves a compliance issue
- When a category change clears a violation warning on an expense

**A receipt was attached to an expense by someone other than the expense owner, or by the expense owner after the report has been submitted at least once.**

Example phrases for your agent's instructions:
- When a manager or admin adds a receipt to a submitted expense
- When a receipt is attached to an expense after the report has already been submitted
- When someone other than the report owner attaches a receipt

**A receipt was removed from an expense by someone other than the expense owner, or by the owner after the report has been submitted at least once.**

Example phrases for your agent's instructions:
- When a manager or admin removes a receipt from a submitted expense
- When a receipt is detached from an expense after the report has already been submitted

**SmartScan (receipt OCR) failed to extract one or more required fields from a receipt image. The expense will need manual data entry.**

Example phrases for your agent's instructions:
- When a receipt scan fails and the user needs to enter expense details manually
- When SmartScan cannot read a receipt
- When OCR extraction is incomplete or fails

---

## How to write instructions for comment and money request events

**A user posted a comment or message in a report. This is the primary communication action — every text message, @mention, and reply. Also fires when Concierge or other system accounts post automated messages.**

Example phrases for your agent's instructions:
- When someone leaves a comment or message in a report
- When a user asks a question or leaves a note in the conversation
- When someone @mentions an Agent in a report

**An approver at an intermediate step in a multi-level approval chain approved the expense report and forwarded it to the next approver.**

Example phrases for your agent's instructions:
- When a report is approved and passed to the next approver
- When an expense report moves to the next level of approval in a multi-step workflow

**A user shared a report with another person, granting them read/write access. The recipient may be a new or existing Expensify user.**

Example phrases for your agent's instructions:
- When a report is shared with a new person
- When someone grants another user access to an expense report

**A user removed another person's access to a report.**

Example phrases for your agent's instructions:
- When someone's access to a report is revoked
- When a report is unshared from a user

**Any money request or expense lifecycle event in a direct message or self-DM. Covers: creating a request, paying it, splitting it, cancelling it, declining it, deleting it, or tracking an out-of-pocket expense.**

Example phrases for your agent's instructions:
- When someone creates a new expense or money request in a conversation
- When a money request is paid
- When an expense is split among multiple people
- When a money request is cancelled
- When a money request is declined by the recipient
- When a money request or expense is deleted
- When someone tracks an out-of-pocket expense in their self-DM

---

## How to write instructions for Expensify Card events

**An admin assigned an existing company card from a bank feed to an employee.**

Example phrases for your agent's instructions:
- When a company card is assigned to an employee
- When an admin links a company card to a team member
- When a bank-imported card is connected to an employee account

**A physical Expensify Card was issued and is being shipped to an employee after they provided their mailing address.**

Example phrases for your agent's instructions:
- When an Expensify Card is shipped to an employee
- When a physical card is issued after an employee adds their address
- When a team member receives their Expensify Card

**An admin created a new virtual Expensify Card for an employee.**

Example phrases for your agent's instructions:
- When a virtual Expensify Card is issued to an employee
- When an admin creates a digital card for a team member

**An employee's physical Expensify Card was replaced with a new card.**

Example phrases for your agent's instructions:
- When an Expensify Card is replaced due to loss, theft, or damage
- When a physical card replacement is issued
- When an expiring Expensify Card is renewed

**An employee's virtual Expensify Card was replaced with a new virtual card.**

Example phrases for your agent's instructions:
- When a virtual Expensify Card is replaced
- When an admin issues a replacement for a digital card

**An admin issued a physical Expensify Card to an employee, but the card is waiting to be shipped because the employee has not yet provided a mailing address.**

Example phrases for your agent's instructions:
- When an employee needs to add their address to receive their Expensify Card
- When a card is pending shipment due to missing personal details

**An admin froze an employee's Expensify Card, causing new transactions to be declined until it is unfrozen.**

Example phrases for your agent's instructions:
- When an Expensify Card is frozen by an admin
- When a card is temporarily blocked from new transactions

**An admin unfroze an employee's Expensify Card, restoring it for use in new transactions.**

Example phrases for your agent's instructions:
- When an Expensify Card is unfrozen by an admin
- When a card is restored to active status after being frozen

**An employee's Expensify Card was permanently deactivated and cannot be used for new transactions.**

Example phrases for your agent's instructions:
- When an Expensify Card is permanently deactivated
- When a card is terminated and a new card must be issued to replace it

---

## How to write instructions for card transaction and alert events

**An approver rejected an individual expense from an expense report and sent it back to the submitter for correction.**

Example phrases for your agent's instructions:
- When an approver rejects a single expense (not the whole report)
- When a line item is sent back to the submitter for correction
- When an expense is declined by the manager before reimbursement

**An approver rejected an individual expense in new Expensify, posting a rejection notice on the expense thread so the submitter can correct and resubmit it.**

Example phrases for your agent's instructions:
- When an approver rejects a single expense in new Expensify
- When an expense thread shows a rejection the submitter needs to address
- When an individual expense is declined and the employee must fix it

**A previously rejected expense was automatically moved to a new open expense report after the approver declined it, and a notice was posted on the destination report.**

Example phrases for your agent's instructions:
- When a rejected expense reappears on a new report for correction
- When Expensify automatically reassigns a declined expense to an open report

**A workspace admin marked a previously rejected expense's rejection violation as resolved on the expense thread, clearing the violation badge.**

Example phrases for your agent's instructions:
- When an admin clears the rejection flag on a previously declined expense
- When the rejection violation on a transaction is dismissed by a workspace admin

**Expensify detected a possibly fraudulent transaction on an Expensify Card and posted an alert in the workspace expense chat, asking the cardholder to confirm or deny it.**

Example phrases for your agent's instructions:
- When an Expensify Card holder gets a fraud alert that needs a response
- When Expensify flags a suspicious card charge and the user must confirm it
- When an employee needs to verify whether a card transaction is legitimate

**An Expensify Card transaction required 3DS step-up authentication; a prompt was posted to the cardholder's Concierge DM asking them to approve or deny the charge before it expires.**

Example phrases for your agent's instructions:
- When a cardholder needs to verify a purchase with a second-factor approval
- When an Expensify Card transaction is pending 3DS authentication approval

**A user's free trial has ended and Expensify posted a prompt in their chat asking them to add a payment card to continue using all features.**

Example phrases for your agent's instructions:
- When a user's free trial expires and they need to add a payment method
- When Expensify prompts an account owner to enter billing information after their trial

**A company card bank feed failed to import transactions during a scheduled scrape; a notice was posted in the workspace #admins room so an admin can investigate and reconnect the feed.**

Example phrases for your agent's instructions:
- When a company card feed stops syncing and needs admin attention
- When the bank connection for a company card is broken and an admin must fix it
- When imported card transactions stop appearing due to a failed feed

**A personal card connected via Plaid failed to import transactions; a notice was posted in the cardholder's Concierge DM so they can reconnect the card.**

Example phrases for your agent's instructions:
- When a personal credit or bank card stops syncing and the user needs to reconnect it
- When Plaid loses access to a personal card and the user must reauthenticate

**Plaid failed to verify the workspace's connected bank balance needed for ACH settlement; a notice was posted in the workspace #admins room so an admin can investigate the bank connection.**

Example phrases for your agent's instructions:
- When the workspace bank account balance can't be verified for reimbursement settlement
- When Plaid loses access to the workspace settlement account and card limits may drop
- When the #admins room shows a bank balance verification failure

---

## How to write instructions for room and membership events

**A user explicitly invited one or more people to a workspace room or group chat.**

Example phrases for your agent's instructions:
- When someone is added to a room by another member
- When a new member is invited to a group chat
- When a user is added to a workspace channel

**An admin or room owner removed one or more members from a room or group chat.**

Example phrases for your agent's instructions:
- When a workspace admin removes someone from a room
- When a group chat admin removes a member
- When a user is kicked from a channel

**A user voluntarily left a room or group chat and was removed from it.**

Example phrases for your agent's instructions:
- When a member leaves a chat room
- When a user removes themselves from a group chat
- When someone opts out of a workspace channel

**A user requested to join a restricted workspace; an actionable message was posted in the workspace's #admins room so an admin can accept or decline the request.**

Example phrases for your agent's instructions:
- When someone requests access to a restricted workspace and an admin needs to approve or deny it
- When a pending workspace join request appears in the #admins room
- When a user tries to join a workspace and the request lands in #admins for review

**A workspace member updated the description of a chat room.**

Example phrases for your agent's instructions:
- When a room's description or purpose statement is changed
- When someone updates the channel topic or description

---

## How to write instructions for task events

**A user checked the checkbox on a task, marking it as done.**

Example phrases for your agent's instructions:
- When a task is checked off or completed
- When someone marks a to-do as done
- When a task is finished

**A user unchecked a completed task, marking it as incomplete again. Can only fire on tasks that were previously completed — cancelled tasks cannot be unchecked.**

Example phrases for your agent's instructions:
- When a completed task is marked as incomplete
- When someone unchecks a finished task
- When a task is reopened for more work

**A user deleted a task. The task shows as "Deleted task" in the app and can no longer be completed or reopened.**

Example phrases for your agent's instructions:
- When a task is deleted
- When someone removes a task
- When a task is cancelled and can no longer be completed

---

## How to write instructions for export events

**A report was successfully exported to a connected accounting or HR integration. Covers all modern integration exports — NetSuite, QuickBooks Online, QuickBooks Desktop, Xero, Sage Intacct, Intacct, FinancialForce, Zenefits, and others. Fires for both automatic exports (triggered by workspace auto-export rules) and manual "mark as exported" actions by an admin.**

Example phrases for your agent's instructions:
- When a report is exported to an accounting system
- When an expense report is sent to NetSuite / QuickBooks / Xero / Sage Intacct
- When Concierge automatically exports an approved report to our connected integration
- When an admin marks a report as exported
- When an expense report's accounting sync is complete

**A report was submitted to Bill.com for payment processing. Unlike accounting integration exports, this closes the report immediately — it is not just a data copy.**

Example phrases for your agent's instructions:
- When a report is sent to Bill.com for payment
- When an expense report is submitted to Bill.com
- When a report is closed via Bill.com export

**A report was exported to Concur expense management. Like Bill.com, this closes the report immediately as part of the export — it is not just a data copy.**

Example phrases for your agent's instructions:
- When a report is exported to Concur
- When an expense report is sent to the Concur travel and expense system
- When a report is closed via Concur export

**A report was exported to FreshBooks as a single consolidated invoice, not as individual expense line items.**

Example phrases for your agent's instructions:
- When a report is exported to FreshBooks as an invoice
- When expenses are sent to FreshBooks as a single bill

**A report was exported to FreshBooks as individual expense line items, not as a single consolidated invoice.**

Example phrases for your agent's instructions:
- When a report is exported to FreshBooks as individual expenses
- When expenses are sent to FreshBooks as separate expense items

---

## How to write instructions for system error and notification events

**An accounting integration (e.g., QuickBooks, NetSuite, Xero) failed to sync in the background. The notification appears in the workspace #admins room and is addressed to the workspace's configured exporter.**

Example phrases for your agent's instructions:
- When an accounting integration stops syncing
- When QuickBooks / NetSuite / Xero sync fails
- When the accounting connection breaks

**An accounting integration export failed for a specific report. This notification appears on the expense report itself, not in #admins.**

Example phrases for your agent's instructions:
- When an export to QuickBooks / NetSuite / Xero fails for a specific report
- When an expense report could not be exported to the accounting system

**A reimbursement was attempted but the workspace withdrawal bank account is overdue for an upgrade (the bank account verification or compliance requirement has expired). The reimbursement is blocked until the admin updates the bank account.**

Example phrases for your agent's instructions:
- When reimbursement is blocked because the bank account needs to be updated
- When the withdrawal bank account is outdated and requires re-verification

**The Expensify Card settlement bank account for a workspace has been locked (e.g., due to a returned payment or other banking exception). The message appears in the workspace #admins room and includes the masked account number. Card transactions may be suspended until the account is unlocked.**

Example phrases for your agent's instructions:
- When the Expensify Card settlement account is frozen or locked
- When card transactions are blocked because the settlement account was locked

**A report submission was blocked by a Dynamic External Workflow (DEW). The workspace has a custom external approval service configured that rejected or errored when the report was submitted. The error message from the external service is shown in the report chat. The report remains open (not submitted) until the issue is resolved.**

Example phrases for your agent's instructions:
- When a report cannot be submitted because an external workflow rejected it
- When DEW (Dynamic External Workflow) blocks submission
- When a custom approval service returns an error during report submission

**A report approval was blocked by a Dynamic External Workflow (DEW). The workspace has a custom external approval service configured that rejected or errored when the approver tried to approve. The report has already been submitted but approval is now blocked. The error from the external service is shown in the report chat.**

Example phrases for your agent's instructions:
- When a report approval is blocked by an external workflow
- When DEW (Dynamic External Workflow) blocks approval
- When a custom approval service returns an error during report approval

**An international payment setup requires a designated signer (typically a company director or authorized signatory) to provide additional compliance information. The notification is posted to the signer's workspace expense chat.**

Example phrases for your agent's instructions:
- When a company director needs to provide information for an international payment setup
- When international payment compliance information is required from a company signer
- When additional director information is required to activate international payments

---

## How to write instructions for travel events

**A travel booking was updated. One notice is created for each reservation (flight, hotel, car, etc.) whenever a booking is changed or cancelled. Always posted to the trip's dedicated chat room by Concierge.**

Example phrases for your agent's instructions:
- When a travel booking is changed or cancelled
- When a flight, hotel, or car reservation is updated
- When the trip details change after a booking is confirmed

---

## How to write instructions for workspace plan and billing events

**The workspace was upgraded to the Control plan.**

Example phrases for your agent's instructions:
- When the workspace is upgraded to the Control plan
- When a workspace unlocks advanced features

**The workspace was downgraded to the Collect plan.**

Example phrases for your agent's instructions:
- When the workspace is downgraded to the Collect plan
- When advanced features are removed from the workspace

---

## How to write instructions for workspace people and approval change events

**A new member joined the workspace. This fires in the new member's workspace chat — use this as the canonical member-added signal.**

Example phrases for your agent's instructions:
- When a new employee joins the workspace
- When a new member is added
- When someone joins the team
- When a new team member is onboarded

**A workspace admin removed a member from the workspace.**

Example phrases for your agent's instructions:
- When an employee is removed from the workspace
- When a member is deleted from the workspace

**A workspace admin updated a member's workspace settings — such as their role, approver, or custom fields.**

Example phrases for your agent's instructions:
- When an employee's workspace role or approver is changed
- When a member's settings are updated in the workspace

**A workspace admin changed whether users with matching email domains automatically join the workspace.**

Example phrases for your agent's instructions:
- When auto-join for the workspace is enabled or disabled
- When the automatic workspace membership setting changes

**A workspace member voluntarily left the workspace.**

Example phrases for your agent's instructions:
- When an employee leaves the workspace on their own
- When a member opts out of the workspace

**A workspace admin changed the default approver for the workspace.**

Example phrases for your agent's instructions:
- When the workspace default approver changes
- When the person who approves expense reports by default is updated

**A workspace admin updated which person a specific workspace member submits expense reports to.**

Example phrases for your agent's instructions:
- When a member's submit-to approver is changed
- When expense reports from a specific employee will now go to a different approver

**A workspace admin updated which person a specific workspace member's approved reports are forwarded to for final approval.**

Example phrases for your agent's instructions:
- When a member's final approver (forward-to) is changed
- When expense report forwarding is updated for an employee

**A workspace admin created a new conditional approval rule (e.g., expenses over a certain amount go to a specific approver).**

Example phrases for your agent's instructions:
- When a new approval rule is created
- When a conditional approver is added to the workspace

**A workspace admin deleted a conditional approval rule.**

Example phrases for your agent's instructions:
- When an approval rule is removed
- When a conditional approver rule is deleted from the workspace

**A workspace admin modified an existing conditional approval rule.**

Example phrases for your agent's instructions:
- When an approval rule is modified
- When an existing conditional approver rule is updated

**A workspace admin changed the expense amount threshold above which reports require manual approval.**

Example phrases for your agent's instructions:
- When the manual approval threshold is changed
- When the spending limit that triggers mandatory review is updated

**A workspace admin changed the percentage of approved reports that are randomly selected for additional audit review.**

Example phrases for your agent's instructions:
- When the random audit rate is updated
- When the percentage of reports selected for random audit changes

**A workspace admin enabled or disabled automatic payment of approved expense reports.**

Example phrases for your agent's instructions:
- When auto-pay for approved reports is turned on or off
- When automatic reimbursement of approved expenses is toggled

---

## How to write instructions for workspace reimbursement and banking change events

**A workspace admin changed the reimbursement method for the workspace (e.g., from indirect to direct reimbursement).**

Example phrases for your agent's instructions:
- When the reimbursement method for the workspace changes
- When the workspace switches between direct and indirect reimbursement

**A workspace admin enabled or disabled reimbursements for the workspace.**

Example phrases for your agent's instructions:
- When reimbursements are turned on or off for the workspace
- When the workspace reimbursement feature is toggled

**A workspace admin changed which person is responsible for sending reimbursements to employees.**

Example phrases for your agent's instructions:
- When the reimbursement payer is changed
- When a different person is designated to process employee reimbursements

**A workspace admin connected, changed, or removed the bank account used to reimburse employees.**

Example phrases for your agent's instructions:
- When the workspace reimbursement bank account is changed
- When a new ACH account is connected for payroll reimbursement

**A workspace admin changed the auto-reimbursement limit — the maximum expense amount reimbursed automatically without requiring approval.**

Example phrases for your agent's instructions:
- When the auto-reimbursement limit is changed
- When the threshold for automatic reimbursement is updated

---

## How to write instructions for workspace integration and card change events

**A workspace admin connected an accounting or HR integration (e.g., QuickBooks, Xero, NetSuite) to the workspace.**

Example phrases for your agent's instructions:
- When an accounting integration is connected
- When QuickBooks or another integration is set up for the workspace

**A workspace admin disconnected an accounting or HR integration from the workspace.**

Example phrases for your agent's instructions:
- When an accounting integration is disconnected
- When QuickBooks or another integration is removed from the workspace

**A workspace admin connected a new company card feed (bank/card provider integration) to the workspace.**

Example phrases for your agent's instructions:
- When a new company card feed is connected
- When a company card feed is added to the workspace

**A workspace admin disconnected a company card feed from the workspace.**

Example phrases for your agent's instructions:
- When a company card feed is disconnected
- When a company card feed is removed from the workspace

**A workspace admin removed a company card assignment from a workspace member.**

Example phrases for your agent's instructions:
- When a company card is unassigned from an employee
- When a member loses access to a connected company card

---

## How to write instructions for workspace budget change events

**A workspace admin created a new spending budget.**

Example phrases for your agent's instructions:
- When a workspace budget is created
- When a new spending limit is added to the workspace

**A workspace admin deleted a spending budget.**

Example phrases for your agent's instructions:
- When a workspace budget is removed
- When a spending limit is deleted

**A workspace admin modified an existing spending budget.**

Example phrases for your agent's instructions:
- When a workspace budget is modified
- When a spending limit is adjusted

**A workspace member's individual spending has reached a configured budget threshold.**

Example phrases for your agent's instructions:
- When an individual employee hits their spending budget
- When a budget alert fires for a specific person

**Spending across a group of employees has reached a configured shared budget threshold.**

Example phrases for your agent's instructions:
- When the team or department budget threshold is reached
- When a shared spending limit alert fires

---

*This reference covers all 116 events AI Agents can react to.*
