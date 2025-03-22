---
title: Invite members and assign roles
description: Invite new members to your workspace and assign them a role
keywords: [Expensify Classic, invite members, member roles]
---
<div id="expensify-classic" markdown="1">

**Workspace Admins can invite new members to a workspace by:**
- Enabling automatic access for members who sign up for Expensify using their domain email address (e.g., yourname@yourcompany.com)
- Sending a link (you can copy the link and send it in Slack, Teams, etc.)
- Sending an invitation email
- Importing a list of new members 

Each option is outlined below in more detail. 

---

# Automatic Workspace Access with Company Email

Enabling pre-approvals allows members to automatically join your workspace when they create an Expensify account using their domain email address (e.g., yourname@yourcompany.com). 

Follow these steps to enable automatic access to your workspace:
1. Hover over **Settings**, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name. 
4. Click the **Members** tab on the left. 
5. Below your Workspace Joining Link, enable **Pre-approve join requests from validated users at {domain name}**.

---

# Create an Invitation Link

You can copy your workspace’s unique link and share it with someone you want to invite to your workspace. 

To find your workspace’s unique link:
1. Hover over **Settings**, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name. 
4. Click the **Members** tab on the left.
5. Copy your Workspace Joining Link and send it via Slack, Teams, or any other communication method. 

---

# Invite via Email

To send an email invitation to your workspace:

1. Hover over **Settings**, then click **Workspaces**. 
2. Click the **Group** tab on the left. 
3. Click the desired workspace name. 
4. Click the **Members** tab on the left.
5. Click **Invite**. 
6. Enter the phone number or email address of the person you’re inviting. 
7. Select a role for the new member (see table below).
8. If your workspace uses Advanced Approvals, select **Approves to**. This determines who the member’s reports must be approved by, if applicable. If no one is selected, then if the member submits a report, anyone with the **Auditor** or **Workspace Admin** role can approve their reports. 
9. Add a personal message, if desired. This message will appear in the invitation email or message.
10. Click **Invite**. 

**Note:** If you’re inviting multiple people who will be assigned the same role, you can enter multiple email addresses or phone numbers by separating them with a comma.

## Member Roles

The following table shows the permissions available for each role:

| Employee                                  | Auditor                                    | Workspace Admin                           |
| ----------------------------------------- | ------------------------------------------ | ----------------------------------------- |
| &#10004; Submit their own reports         | &#10004; Submit their own reports          | &#10004; Submit their own reports         |
| &#10004; Approve reports submitted to them| &#10004; Approve reports submitted to them | &#10004; Approve reports submitted to them|
|                                           | &#10004; View all workspace reports        | &#10004; View all workspace reports       |
|                                           |                                            | &#10004; Approve all workspace reports    |
|                                           |                                            | &#10004; Edit workspace settings          |

---

# Import a Group of Members

You can add multiple members to your workspace at once by importing a `.csv`, `.txt`, `.xls`, or `.xlsx` list.

To add members in bulk:
1. Create a spreadsheet with **Email** and **Role** as column headers and fill in the information for all of the members you want to add to your workspace. You can also include any of the following columns:
   - **Submits To**
   - **Approves To**
   - **Approval Limit**
   - **Over Limit Forward To**
2. Hover over **Settings**, then click **Workspaces**. 
3. Click the **Group** tab on the left. 
4. Click the desired workspace name. 
5. Click the **Members** tab on the left.
6. Click **Import from spreadsheet**.  
7. Match the columns in your spreadsheet with the Expensify data they correspond to. 
8. Click **Import**. 

**Note:** If you are utilizing the **Advanced Approval** feature, you can specify to who each member should submit their expense reports and who an approver should send approved reports for the next step in the approval process. If someone is the final

</div>
