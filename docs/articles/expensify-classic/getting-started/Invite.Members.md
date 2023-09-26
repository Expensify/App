---
title: Invite Members
description: Invite Members
---
# Overview

To invite your employees in Expensify, simply add them as members to your policy.

# How to Invite Employees to Expensify

## Inviting Members Manually

Navigate to **Settings > Policies > Group > *Policy Name* > People** - then click Invite and enter the invitee's email address.

Indicate whether you want them to be an Employee, Admin, or Auditor on the policy

If you are utilizing the Advanced Approval feature, you can specify who employees should submit their expense reports to and who an approver should send approved reports to for the next step in the approval process. If someone is the final approver, you can leave this field blank.

## Inviting Members to a Policy in Bulk 

Navigate to **Settings > Policies > Group > *Policy Name* > People** - then click Invite and enter all of the email addresses separated by comma. Indicate whether you want them to be an Employee, Admin, or Auditor on the policy.

If you are utilizing the Advanced Approval feature, you can specify who employees should submit their expense reports to and who an approver should send approved reports to for the next step in the approval process. If someone is the final approver, you can leave this field blank.

Another convenient method is to employ the spreadsheet bulk upload option for inviting users to a policy. This proves particularly helpful when initially configuring your system or when dealing with numerous user updates. Simply click the "Import from Spreadsheet" button and upload a file in formats such as .csv, .txt, .xls, or .xlsx to streamline the process.

After uploading the spreadsheet, we'll display a window where you can choose which columns to import and what they correspond to. These are the fields: 
- Email
- Role
- Custom Field 1
- Custom Field 2
- Submits To
- Approves To
- Approval Limit
- Over Limit Forward To
  
Click the Import button and you're done. We will import the new users with the optional settings and update any already existing ones.

## Inviting Members with a Shareable Policy Joining Link

You have the ability to invite your colleagues to join your Expensify policy by sharing a unique Policy Joining Link. You can use this link as many times as necessary to invite multiple users through various communication methods such as internal emails, chats, text messages, and more.

To find your unique link, simply go to **Settings > Policies > Group > *Policy Name* > People**. It's easily accessible from there.

## Allowing Members to Automatically Join Your Policy

You can streamline the process of inviting colleagues to your policy by enabling the Pre-approve switch located below your Policy Joining Link. This allows teammates to automatically become part of your policy as soon as they create an Expensify account using their work email address.

Here's how it works: If a colleague signs up with a work email address that matches the email domain of a company policy owner (e.g., if the policy owner's email is admin@expensify.com and the colleague signs up with employee@expensify.com), they will be able to join your policy seamlessly without requiring a manual invitation. When new users join the policy, they will be set up to submit their expense reports to the policy owner by default.

To enable this feature, go to **Settings > Policies > Group > *Policy Name* > People**.


# FAQ
## Who can invite users to Expensify
Any Policy Admin can add users to a Group policy using any of the above methods.

## How can I customize an invite message? 
Under **Settings > Policies > Group > *Policy Name* > People > Invite** you can enter a custom message you'd like users to receive in their invitation email.

## How can I invite employees via the API? 
If you would like to integrate an open API HR software, you can use our [Advanced Employee Updater API](https://integrations.expensify.com/Integration-Server/doc/employeeUpdater/) to invite employees to your policies. 
