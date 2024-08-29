---
title: Admin offboarding checklist
description: What to alter when your main Expensify person leaves the business
---
Many Expensify customers have one person who handles all the main roles in Expensify Classic: the Billing Owner, Workspace Admin, Domain Admin, Technical Contact, and Bank Account Owner. That means that if this person leaves the company or needs to be offboarded from their current position, you’ll need to assign these roles to another employee.

{% include info.html %}
Your current admin and the person who will be your new admin should complete the following checklist _before_ your admin leaves the company.
{% include end-info.html %}

## Checklist for the current admin
### 1. Assign a new admin 
{% include info.html %} 
The current admin must add the new admin to all company workspaces they own, even if they are not in use. When someone takes over ownership of all workspaces, they also take over ownership of the existing Annual Subscription. If the new admin does not take ownership of all company workspaces, the previous owner will continue to be charged for the other workspaces they still own, along with their existing annual subscription, which can result in multiple subscriptions.
{% include end-info.html %}

1. [Add the new admin](https://help.expensify.com/articles/expensify-classic/workspaces/Invite-members-and-assign-roles) to the workspace.
2. [Assign the Admin role](https://help.expensify.com/articles/expensify-classic/workspaces/Change-member-workspace-roles) to the new admin.
3. If your company uses company card feeds, Expensify Cards, domain groups, or SAML, invite the new admin to be a [Domain Admin](https://help.expensify.com/articles/expensify-classic/domains/Add-Domain-Members-and-Admins). 

### 2. Share access to company bank account
If you are the only admin with access to the company bank account in Expensify, [share the bank account](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/Business-Bank-Accounts-USD#how-to-share-a-verified-bank-account) with the new admin or another workspace admin. 

## Checklist for the new admin
### 1. Take over billing and add payment account
The new admin must [take over ownership and billing](https://help.expensify.com/articles/expensify-classic/workspaces/Assign-billing-owner-and-payment-account) for the workspace. 

### 2. Reverify the company bank account
1-2 business days after sharing, Expensify will administer 3 test transactions to your bank account. After these transactions (2 withdrawals and 1 deposit) have been processed in your account, visit your Expensify Inbox or Payments page, where you’ll see a prompt to input the transaction amounts.

### 3. Unshare company bank accounts
Once the previous admin has left the company, the new admin (or any admin with access to the bank account) should [unshare the company bank account](https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/Business-Bank-Accounts-USD#how-to-remove-access-to-a-verified-bank-account) with the previous admin.

### 4. Update settlement account assignments
1. Hover over Settings, then click Domains.
2. Click the desired domain name.
3. On the Company Cards tab, click the dropdown under the Imported Cards section to select the desired Expensify Card.
4. To the right of the dropdown, click the Settings tab.
5. If the bank account set as the Expensify Card settlement account matches the company bank account, use the green chat icon to send a message to Concierge or your Account Manager. We will link the settlement account to the bank account once it has been reverified by the new settlement owner. 

{% include info.html %} 
The settlement owner must also be a Domain Admin.
{% include end-info.html %}

### 5. Update default reimburser assignment
1. Hover over Settings, then click Workspaces.
2. Click the desired workspace name.
3. Click the Reimbursement tab.
4. Ensure that the reverified bank account is set as the reimbursement account. 
5. Ensure that the previous admin is not set as the Default Reimburser. If they are, select a new reimburser. 

### 6. Reconnect integrations & set technical contact
1. If your workspace is connected to an [accounting integration](https://help.expensify.com/expensify-classic/hubs/connections/) that is tied to the previous admin’s account, reconnect it.
2. [Assign a new Technical Contact] if the email listed is for the previous admin. 

### 7. Remove the previous Admin
1. Once all of the above steps have been completed, you can either downgrade the previous admin’s [role](https://help.expensify.com/articles/expensify-classic/workspaces/Change-member-workspace-roles) to Employee if they are still within the company, or if they have left the company:
[Remove the previous admin](https://help.expensify.com/articles/expensify-classic/workspaces/Remove-Members) from the workspace. 
2. Close the member’s company Expensify account.
    a. Hover over Settings, then click Domains.
    b. Click the desired domain name.
    c. Click the Domain Members tab.
    d. Select the checkbox to the left of the employee, then click Close Accounts. 
    e. Click Close to confirm.
