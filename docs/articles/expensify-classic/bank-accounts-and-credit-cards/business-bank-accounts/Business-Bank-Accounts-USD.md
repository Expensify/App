---
title: Business Bank Accounts - USD
description: How to add/remove Business Bank Accounts (US) 
---
# Overview
Adding a verified business bank account unlocks a myriad of features and automation in Expensify. 
Once you connect your business bank account, you can:
- Pay employee expense reports via direct deposit (US)
- Settle company bills via direct transfer
- Accept invoice payments through direct transfer
- Access the Expensify Card

# How to add a verified business bank account
To connect a business bank account to Expensify, follow the below steps:
1. Go to **Settings > Account > Payments**
2. Click **Add Verified Bank Account**
3. Click **Log into your bank**
4. Click **Continue** 
5. When you hit the **Plaid** screen, you'll be shown a list of compatible banks that offer direct online login access
6. Login to the business bank account
- If the bank is not listed, click the X to go back to the connection type
- Here you’ll see the option to **Connect Manually**
- Enter your account and routing numbers
7. Enter your bank login credentials.
- If your bank requires additional security measures, you will be directed to obtain and enter a security code
- If you have more than one account available to choose from, you will be directed to choose the desired account
Next, to verify the bank account, you’ll enter some details about the business as well as some personal information. 

## Enter company information
This is where you’ll add the legal business name as well as several other company details. 

### Company address
The company address must: 
- Be located in the US
- Be a physical location
If you input a maildrop address (PO box, UPS Store, etc.), the address will likely be flagged for review and adding the bank account to Expensify will be delayed. 

### Tax Identification Number
This is the identification number that was assigned to the business by the IRS.
### Company website
A company website is required to use most of Expensify’s payment features. When adding the website of the business, format it as, https://www.domain.com. 
### Industry Classification Code
You can locate a list of Industry Classification Codes here.
## Enter personal information 
Whoever is connecting the bank account to Expensify, must enter their details under the Requestor Information section:
- The address must be a physical address
- The address must be located in the US
- The SSN must be US-issued 
This does not need to be a signor on the bank account. If someone other than the Expensify account holder enters their personal information in this section, the details will be flagged for review and adding the bank account to Expensify will be delayed. 

## Upload ID
After entering your personal details, you’ll be prompted to click a link or scan a QR code so that you can do the following:
1. Upload the front and back of your ID 
2. Use your device to take a selfie and record a short video of yourself 
It’s required that your ID is:
- Issued in the US
- Unexpired

## Additional Information
Check the appropriate box under **Additional Information**, accept the agreement terms, and verify that all of the information is true and accurate:
- A Beneficial Owner refers to an **individual** who owns 25% or more of the business. 
- If you or another **individual** owns 25% or more of the business, please check the appropriate box
- If someone else owns 25% or more of the business, you will be prompted to provide their personal information
If no individual owns more than 25% of the company you do not need to list any beneficial owners. In that case, be sure to leave both boxes unchecked under the Beneficial Owner Additional Information section.

# How to validate the bank account
The account you set up can be found under **Settings > Account > Payment > Bank Accounts** section in either **Verifying** or **Pending** status.
If it is **Verifying**, then this means we sent you a message and need more information from you. Please check your Concierge chat which should include a message with specific details about what we require to move forward. 
If it is **Pending**, then in 1-2 business days Expensify will administer 3 test transactions to your bank account. Please check your Concierge chat for further instructions. If you do not see these test transactions
After these transactions (2 withdrawals and 1 deposit) have been processed in your account, visit your Expensify Inbox, where you'll see a prompt to input the transaction amounts.
Once you've finished these steps, your business bank account is ready to use in Expensify!

# How to share a verified bank account 
Only admins with access to the verified bank account can reimburse employees or pay vendor bills. To grant another admin access to the bank account in Expensify, go to **Settings > Account > Payments > Bank Accounts** and click **"Share"**. Enter their email address, and they will receive instructions from us. Please note, they must be a policy admin on a policy you also have access to in order to share the bank account with them.
When a bank account is shared, it must be revalidated with three new microtransactions to ensure the shared admin has access. This process takes 1-2 business days. Once received, the shared admin can enter the transactions via their Expensify account's Inbox tab.

Note: A report is shared with all individuals with access to the same business bank account in Expensify for audit purposes.


# How to remove access to a verified bank account
This step is important when accountants and staff leave your business.
To remove an admin's access to a shared bank account, go to **Settings > Account > Payments > Shared Business Bank Accounts**. 
You'll find a list of individuals who have access to the bank account. Next to each user, you'll see the option to Unshare the bank account.

# How to delete a verified bank account
If you need to delete a bank account from Expensify, run through the following steps:
1. Head to  **Settings > Account > Payments**
2. Click the red **Delete** button under the corresponding bank account

Be cautious, as if it hasn't been shared with someone else, the next user will need to set it up from the beginning. 

If the bank account is set as the settlement account for your Expensify Cards, you’ll need to designate another bank account as your settlement account under **Settings > Domains > Company Cards > Settings** before this account can be deleted. 

# Deep Dive

## Verified bank account requirements

To add a business bank account to issue reimbursements via ACH (US), to pay invoices (US) or utilize the Expensify Card:
- You must enter a physical address for yourself, any Beneficial Owner (if one exists), and the business associated with the bank account. We **cannot** accept a PO Box or MailDrop location.
- If you are adding the bank account to Expensify, you must add it from **your** Expensify account settings.
- If you are adding a bank account to Expensify, we are required by law to verify your identity. Part of this process requires you to verify a US issued photo ID. For utilizing features related to US ACH, your idea must be issued by the United States. You and any Beneficial Owner (if one exists), must also have a US address 
- You must have a valid website for your business to utilize the Expensify Card, or to pay invoices with Expensify. 

## Locked bank account
When you reimburse a report, you authorize Expensify to withdraw the funds from your account. If your bank rejects Expensify’s withdrawal request, your verified bank account is locked until the issue is resolved.

Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit.
If you need to enable direct debits from your verified bank account, your bank will require the following details:
- The ACH CompanyIDs (1270239450 and 4270239450) 
- The ACH Originator Name (Expensify)
To request to unlock the bank account, click **Fix** on your bank account under **Settings > Account > Payments > Bank Accounts**. 
This sends a request to our support team to review exactly why the bank account was locked. 
Please note, unlocking a bank account can take 4-5 business days to process.

## Error adding ID to Onfido
Expensify is required by both our sponsor bank and federal law to verify the identity of the individual that is initiating the movement of money. We use Onfido to confirm that the person adding a payment method is genuine and not impersonating someone else.

If you get a generic error message that indicates, "Something's gone wrong", please go through the following steps:

1. Ensure you are using either Safari (on iPhone) or Chrome (on Android) as your web browser.
2. Check your browser's permissions to make sure that the camera and microphone settings are set to "Allow"
3. Clear your web cache for Safari (on iPhone) or Chrome (on Android).
4. If using a corporate Wi-Fi network, confirm that your corporate firewall isn't blocking the website.
5. Make sure no other apps are overlapping your screen, such as the Facebook Messenger bubble, while recording the video. 
6. On iPhone, if using iOS version 15 or later, disable the Hide IP address feature in Safari.
7. If possible, try these steps on another device
8. If you have another phone available, try to follow these steps on that device
If the issue persists, please contact your Account Manager or Concierge for further troubleshooting assistance.

# FAQ
## What is a Beneficial Owner?

A Beneficial Owner refers to an **individual** who owns 25% or more of the business. If no individual owns 25% or more of the business, the company does not have a Beneficial Owner.


## What do I do if the Beneficial Owner section only asks for personal details, but our business is owned by another company?


Please only indicate you have a Beneficial Owner, if it is an individual that owns 25% or more of the business. 

## Why can’t I input my address or upload my ID? 


Are you entering a US address? When adding a verified business bank account in Expensify, the individual adding the account, and any beneficial owner (if one exists) are required to have a US address, US photo ID, and a US SSN. If you do not meet these requirements, you’ll need to have another admin add the bank account, and then share access with you once verified. 


## Why am I being asked for documentation when adding my bank account? 
When a bank account is added to Expensify, we complete a series of checks to verify the information provided to us. We conduct these checks to comply with both our sponsor bank's requirements and federal government regulations, specifically the Bank Secrecy Act / Anti-Money Laundering (BSA / AML) laws. Expensify also has anti-fraud measures in place.
If automatic verification fails, we may request manual verification, which could involve documents such as address verification for your business, a letter from your bank confirming bank account ownership, etc. 

If you have any questions regarding the documentation request you received, please contact Concierge and they will be happy to assist. 


## I don’t see all three microtransactions I need to validate my bank account. What should I do? 

It's a good idea to wait till the end of that second business day. If you still don’t see them, please reach out to your bank and ask them to whitelist our ACH ID's **1270239450** and **4270239450**. Expensify’s ACH Originator Name is "Expensify".

Make sure to reach out to your Account Manager or to Concierge once you have done so and our team will be able to re-trigger those 3 transactions!

