---
title: Pay Bills
description: How to receive and pay company bills in Expensify 
---
<!-- The lines above are required by Jekyll to process the .md file -->

# Overview
Simplify your back office by receiving bills from vendors and suppliers in Expensify. Anyone with or without an Expensify account can send you a bill, and Expensify will file it as a Bill and help you issue the payment.

# How to Receive Vendor or Supplier Bills in Expensify 

There are three ways to get a vendor or supplier bill into Expensify: 

**Option 1:** Have vendors send bills to Expensify directly: Ask your vendors to email all bills to your Expensify billing intake email. 

**Option 2:** Forward bills to Expensify: If your bills are emailed to you, you can forward those bills to your Expensify billing intake email yourself. 

**Option 3:** Manually upload bills to Expensify: If you receive physical bills, you can manually create a Bill in Expensify on the web from the Reports page: 
1. Click **New Report** and choose **Bill**
2. Add the expense details and vendor's email address to the pop-up window
3. Upload a pdf/image of the bill
4. Click **Submit**

# How to Pay Bills 

There are multiple ways to pay Bills in Expensify. Let’s go over each method below: 

## ACH bank-to-bank transfer

To use this payment method, you must have a business bank account connected to your Expensify account. 

To pay with an ACH bank-to-bank transfer: 

1. Sign in to your Expensify account on the web at www.expensify.com.
2. Go to the Inbox or Reports page and locate the Bill that needs to be paid. 
3. Click the **Pay** button to be redirected to the Bill. 
4. Choose the ACH option from the drop-down list.
5. Follow the prompts to connect your business bank account to Expensify.

**Fees:** None

## Pay using a credit or debit card

This option is available to all US and International customers receiving an bill from a US vendor with a US business bank account. 

To pay with a credit or debit card: 
1. Sign-in to your Expensify account on the web app at www.expensify.com.
2, Click on the Bill you’d like to pay to see the details.
3, Click the **Pay** button.
4. You’ll be prompted to enter your credit card or debit card details. 

**Fees:** Includes 2.9% credit card payment fee

## Venmo

If both you and the vendor have Venmo setup in their Expensify account, you can opt to pay the bill through Venmo.

**Fees:** Venmo charges a 3% sender’s fee

## Pay Outside of Expensify 

If you are not able to pay using one of the above methods, then you can mark the Bill  as paid manually in Expensify to update its status and indicate that you have made payment outside Expensify. 

To mark a Bill as paid outside of Expensify: 

1. Sign-in to your Expensify account on the web app at www.expensify.com.
2. Click on the Bill you’d like to pay to see the details.
3. Click on the **Reimburse** button. 
4. Choose **I’ll do it manually**

**Fees:** None

# FAQ

## What is my company's billing intake email? 
Your billing intake email is [yourdomain.com]@expensify.cash. Example, if your domain is `company.io` your billing email is `company.io@expensify.cash`. 

## When a vendor or supplier bill is sent to Expensify, who receives it? 

Bills are received by the Primary Contact for the domain. This is the email address listed at **Settings > Domains > Domain Admins**.

## Who can view a Bill in Expensify? 

Only the primary contact of the domain can view a Bill. 

## Who can pay a Bill?

Only the primary domain contact (owner of the bill) will be able to pay the Mill.

## How can you share access to Bills?

To give others the ability to view a Bill, the primary contact can manually “share” the Bill under the Details section of the report via the Sharing Options button. 
To give someone else the ability to pay Bills,  the primary domain contact will need to grant those individuals Copilot access to the primary domain contact's account. 

## Is Bill Pay supported internationally? 

Payments are currently only supported for users paying in United States Dollars (USD). 

## What’s the difference between a Bill and an Invoice in Expensify? 

A Bill is a payable which represents an amount owed to a payee (usually a vendor or supplier), and is usually created from a vendor invoice. An Invoice is a receivable, and indicates an amount owed to you by someone else. 

# Deep Dive: How company bills and vendor invoices are processed in Expensify 

Here is how a vendor or supplier bill goes from received to paid in Expensify: 

1. When a vendor or supplier bill is received in Expensify via, the document is SmartScanned automatically and a Bill is created. The Bill is owned by the primary domain contact, who will see the Bill on the Reports page on their default group policy. 
2. When the Bill is ready for processing, it is submitted and follows the primary domain contact’s approval workflow. Each time the Bill is approved, it is visible in the next approver's Inbox. 
3. The final approver pays the Bill from their Expensify account on the web via one of the methods.
4. The Bill is coded with the relevant imported GL codes from a connected accounting software. After it has finished going through the approval workflow the Bill can be exported back to the accounting package connected to the policy.
