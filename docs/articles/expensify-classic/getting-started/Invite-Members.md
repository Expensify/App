---
title: Invite Members
description: Learn how add your employees to submit expenses in Expensify
---
# Overview

To invite your employees to Expensify, simply add them as members to your Workspace.

# How to Invite members to Expensify

## Inviting Members Manually

Navigate to **Settings > Workspace > Group > *Workspace Name* > People** - then click **Invite** and enter the invitee's email address.

Indicate whether you want them to be an Employee, Admin, or Auditor on the Workspace.

If you are utilizing the Advanced Approval feature and the invitee is an approver, you can use the "Approves to" field to specify to whom they approve and forward reports for additional approval.

## Inviting Members to a Workspace in Bulk 

Navigate to **Settings > Workspaces > Group > *Workspace Name* > People** - then click Invite and enter all of the email addresses separated by comma. Indicate whether you want them to be an Employee, Admin, or Auditor on the Workspace.

If you are utilizing the Advanced Approval feature, you can specify who each member should submit their expense reports to and who an approver should send approved reports to for the next step in the approval process. If someone is the final approver, you can leave this field blank.

Another convenient method is to employ the spreadsheet bulk upload option for inviting members to a Workspace. This proves particularly helpful when initially configuring your system or when dealing with numerous member updates. Simply click the "Import from Spreadsheet" button and upload a file in formats such as .csv, .txt, .xls, or .xlsx to streamline the process.

After uploading the spreadsheet, we'll display a window where you can choose which columns to import and what they correspond to. These are the fields: 
- Email
- Role
- Custom Field 1
- Custom Field 2
- Submits To
- Approves To
- Approval Limit
- Over Limit Forward To
  
Click the **Import** button and you're done. We will import the new members with the optional settings and update any already existing ones.

## Inviting Members with a Shareable Workspace Joining Link

You have the ability to invite your colleagues to join your Expensify Workspace by sharing a unique Workspace Joining Link. You can use this link as many times as necessary to invite multiple members through various communication methods such as internal emails, chats, text messages, and more.

To find your unique link, simply go to **Settings > Workspace > Group > *Workspace Name* > People**. 

## Allowing Members to Automatically Join Your Workspace

You can streamline the process of inviting colleagues to your Workspace by enabling the Pre-approve switch located below your Workspace Joining Link. This allows teammates to automatically become part of your Workspace as soon as they create an Expensify account using their work email address.

Here's how it works: If a colleague signs up with a work email address that matches the email domain of a company Workspace owner (e.g., if the Workspace owner's email is admin@expensify.com and the colleague signs up with employee@expensify.com), they will be able to join your Workspace seamlessly without requiring a manual invitation. When new members join the Workspace, they will be set up to submit their expense reports to the Workspace owner by default.

To enable this feature, go to **Settings > Workspace > Group > *Workspace Name* > People**.


# FAQ
## Who can invite members to Expensify
Any Workspace Admin can add members to a Group Workspace using any of the above methods.

## How can I customize an invite message? 
Under **Settings > Workspace > Group > *Workspace Name* > People > Invite** you can enter a custom message you'd like members to receive in their invitation email.

## How can I invite members via the API? 
If you would like to integrate an open API HR software, you can use our [Advanced Employee Updater API](https://integrations.expensify.com/Integration-Server/doc/employeeUpdater/) to invite members to your Workspace. 
