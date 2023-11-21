---
title: Connect a Business Bank Account - US
description: How to connect a business bank account to Expensify (US) 
---
# Overview
Adding a verified business bank account unlocks a myriad of features and automation in Expensify. 
Once you connect your business bank account, you can:
- Reimburse expenses via direct bank transfer
- Pay bills
- Collect invoice payments
- Issue the Expensify Card

# How to add a verified business bank account
To connect a business bank account to Expensify, follow the below steps:
1. Go to **Settings > Workspaces > _Workspace Name_ > Bank account > Connect bank account**
2. Click **Connect online with Plaid**
3. Click **Continue** 
4. When you reach the **Plaid** screen, you'll be shown a list of compatible banks that offer direct online login access
5. Login to the business bank account:
- If the bank is not listed, click the X to go back to the connection type
- Here you’ll see the option to **Connect Manually**
- Enter your account and routing numbers
6. Enter your bank login credentials:
- If your bank requires additional security measures, you will be directed to obtain and enter a security code
- If you have more than one account available to choose from, you will be directed to choose the desired account

Next, to verify the bank account, you’ll enter some details about the business as well as some personal information. 

## Enter company information
This is where you’ll add the legal business name as well as several other company details. 

- **Company address**: The company address must be located in the US and a physical location (If you input a maildrop address, PO box, or UPS Store, the address will be flagged for review, and adding the bank account to Expensify will be delayed)
- **Tax Identification Number**: This is the identification number that was assigned to the business by the IRS
- **Company website**: A company website is required to use most of Expensify’s payment features. When adding the website of the business, format it as, https://www.domain.com
- **Industry Classification Code**: You can locate a list of Industry Classification Codes [here]([url](https://www.census.gov/naics/?input=software&year=2022))

## Enter personal information 
Whoever is connecting the bank account to Expensify, must enter their details under the Requestor Information section:
- The address must be a physical address
- The address must be located in the US
- The SSN must be US-issued

This does not need to be a signor on the bank account. If someone other than the Expensify account holder enters their personal information in this section, the details will be flagged for review, and adding the bank account to Expensify will be delayed. 

## Upload ID
After entering your personal details, you’ll be prompted to click a link or scan a QR code so that you can do the following:
1. Upload a photo of the front and back of your ID (this cannot be a photo of an existing image)
2. Use your device to take a selfie and record a short video of yourself 

**Your ID must be:**
- Issued in the US
- Current (ie: the expiration date must be in the future)

## Additional Information
Check the appropriate box under **Additional Information**, accept the agreement terms, and verify that all of the information is true and accurate:
- A Beneficial Owner refers to an **individual** who owns 25% or more of the business. 
- If you or another **individual** owns 25% or more of the business, please check the appropriate box
- If someone else owns 25% or more of the business, you will be prompted to provide their personal information

If no individual owns more than 25% of the company you do not need to list any beneficial owners. In that case, be sure to leave both boxes unchecked under the Beneficial Owner Additional Information section.

# How to validate the bank account

The account you set up can be found under **Settings > Workspaces > _Workspace Name_ > Bank account** in either the **Verifying** or **Pending** state.

If it is **Verifying**, then this means we sent you a message and need more information from you. Please review the automated message sent by Concierge. This should include a message with specific details about what's required to move forward. 

If it is **Pending**, then in 1-2 business days Expensify will administer 3 test transactions to your bank account. If after two business days you do not see these test transactions, reach out to Concierge for assistance.

After these transactions (2 withdrawals and 1 deposit) have been processed to your account, head to the **Bank accounts** section of your workspace settings. Here you'll see a prompt to input the transaction amounts.

Once you've finished these steps, your business bank account is ready to use in Expensify!

# How to delete a verified bank account
If you need to delete a bank account from Expensify, run through the following steps:
1. Go to **Settings > Workspaces > _Workspace Name_ > Bank account**
2. Click the red **Delete** button under the corresponding bank account

# Deep Dive

## Verified bank account requirements

To add a business bank account to issue reimbursements via ACH (US), to pay invoices (US), or to issue Expensify Cards:
- You must enter a physical address for yourself, any Beneficial Owner (if one exists), and the business associated with the bank account. We **cannot** accept a PO Box or MailDrop location.
- If you are adding the bank account to Expensify, you must add it from **your** Expensify account settings.
- If you are adding a bank account to Expensify, we are required by law to verify your identity. Part of this process requires you to verify a US-issued photo ID. For using features related to US ACH, your ID must be issued by the United States. You and any Beneficial Owner (if one exists), must also have a US address 
- You must have a valid website for your business to utilize the Expensify Card, or to pay invoices with Expensify. 

## Locked bank account
When you reimburse a report, you authorize Expensify to withdraw the funds from your account. If your bank rejects Expensify’s withdrawal request, your verified bank account is locked until the issue is resolved.

Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit.
If you need to enable direct debits from your verified bank account, your bank will require the following details:
- The ACH CompanyIDs (1270239450, 4270239450 and 2270239450) 
- The ACH Originator Name (Expensify)

To request to unlock the bank account, go to **Settings > Workspaces > _Workspace Name_ > Bank account** and click **Fix.** This sends a request to our support team to review why the bank account was locked, who will send you a message to confirm that.

Unlocking a bank account can take 4-5 business days to process, to allow for ACH processing time and clawback periods.

## Error adding an ID to Onfido

Expensify is required by both our sponsor bank and federal law to verify the identity of the individual who is initiating the movement of money. We use Onfido to confirm that the person adding a payment method is genuine and not impersonating someone else.

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

## What do I do if the Beneficial Owner section only asks for personal details, but my organization is owned by another company?

Please only indicate you have a Beneficial Owner, if it is an individual that owns 25% or more of the business. 

## Why can’t I input my address or upload my ID? 

Are you entering a US address? When adding a verified business bank account in Expensify, the individual adding the account, and any beneficial owner (if one exists) are required to have a US address, US photo ID, and a US SSN. If you do not meet these requirements, you’ll need to have another admin add the bank account, and then share access with you once verified. 

## Why am I asked for documents when adding my bank account? 

When a bank account is added to Expensify, we complete a series of checks to verify the information provided to us. We conduct these checks to comply with both our sponsor bank's requirements and federal government regulations, specifically the Bank Secrecy Act / Anti-Money Laundering (BSA / AML) laws. Expensify also has anti-fraud measures in place.
If automatic verification fails, we may request manual verification, which could involve documents such as address verification for your business, a letter from your bank confirming bank account ownership, etc. 

If you have any questions regarding the documentation request you received, please contact Concierge and they will be happy to assist. 

## I don’t see all three microtransactions I need to validate my bank account. What should I do? 

It's a good idea to wait till the end of that second business day. If you still don’t see them, please reach out to your bank and ask them to whitelist our ACH IDs **1270239450**, **4270239450**, and **2270239450**. Expensify’s ACH Originator Name is "Expensify".

Make sure to reach out to your Account Manager or Concierge once that's all set, and our team will be able to re-trigger those three test transactions!

