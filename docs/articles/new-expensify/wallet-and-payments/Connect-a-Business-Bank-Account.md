---
title: Connect a US Business Bank Account
description: Learn how to connect and verify a US business bank account in Expensify for reimbursements, Expensify Card payments, and invoice payouts.
keywords: [New Expensify, business bank account, connect bank account, verified business bank account, reimbursement, Expensify Card, Plaid, Wallet, workspace payments, link bank account, ACH]
internalScope: Audience is Workspace Admins. Covers connecting a new US business bank account from a workspace or Wallet, and linking an existing one to a workspace for reimbursements. Does not cover validating test transactions, sharing, unsharing, or unlocking a business bank account.
---

# Connect a US Business Bank Account

You can connect a US business bank account from **Wallet**, or from a Workspace if you are a Workspace Admin. Once connected, you can use the bank account for reimbursements, Expensify Card payments, and invoice payouts.

This article covers connecting US bank accounts only. If your business bank account is based outside the United States, [learn how to connect an international business bank account](/articles/new-expensify/wallet-and-payments/Enable-Global-Reimbursement). 

---

## Who can connect a US business bank account

- Any member can connect a US business bank account in **Wallet**. 
- Workspace Admins can connect a business bank account to a Workspace.
- The member who sets up the account and all beneficial owners must have a physical US address, a US photo ID, and a US SSN.

To connect a business bank account, the Workspace must have Workflows enabled. [Learn how to enable Workflows](/articles/new-expensify/workspaces/Workspace-Workflows#enable-workflows).

---

## How to add a new US business bank account in Wallet

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account > Wallet**. 
2. Click **Add bank account**.
3. Select **Make payments**.
4. Choose the country where your bank is located.
5. Select **Log into your bank** (preferred) or **Connect manually**.
6. Complete the identity verification, company details, and Beneficial Owner steps described below.

<!-- SCREENSHOT:
Suggestion: Wallet page showing Add bank account button and the Make payments option
Location: After step 3
Purpose: Shows the new Wallet entry point for business bank accounts
-->

---

## How to connect a new US business bank account in a Workspace

1. In the navigation tabs (on the left on web, on the bottom on mobile)**,** click **Workspace > [Workspace name]**.
2. Select **Workflows**.
3. Enable **Payments**.
4. In the **Payments** section, select **Add bank account**.
5. Select **Log into your bank** (preferred) or **Connect manually**.
6. Enter your bank details.
7. Complete the identity verification, company details, and Beneficial Owner steps described below.

If your business bank account already exists in Expensify, an admin with access can share it with you instead. Learn how to [share a business bank account](/articles/new-expensify/wallet-and-payments/Share-a-Business-Bank-Account).

<!-- SCREENSHOT:
Suggestion: Update current screenshots
-->

![Workflows screen with Connect Bank Account button]({{site.url}}/assets/images/Help-ConnectBusinessBankAccount-2.png){:width="100%"}

---

## How to link an existing business bank account to a workspace

If you already have a verified business bank account, you can share it to another workspace without needing to add it again. [Learn how to share a business bank account](/articles/new-expensify/wallet-and-payments/Share-a-Business-Bank-Account). 

---

## How to verify your identity with a US-issued photo ID

After entering your personal details, complete identity verification:

1. Upload a photo of the **front and back** of your ID. The photo cannot be a photo of an existing image.
2. Take a **selfie** and record a **short video** of yourself.

Your ID must be issued in the US with an expiration date in the future.

---

## How to add company details for bank account verification

Provide the following company information:

1. **Company address** — Must be a physical US address. PO Boxes or mail drop addresses will be flagged for review and may delay verification.
2. **Tax Identification Number (TIN)** — Assigned by the IRS.
3. **Company website** — Required to access most Expensify payment features.
4. **Industry Classification Code** — Find the list of codes at [census.gov/naics](https://www.census.gov/naics/?input=software&year=2022).

---

## How to add Beneficial Owner details

1. Check the appropriate box under **Beneficial Owner**. A Beneficial Owner is an individual who owns 25% or more of the business. If no individual owns 25% or more, leave both boxes unchecked.
2. Accept the agreement terms and verify that all details are true and accurate.

---

## What to expect after submitting your bank account details

After you submit your details:

1. **Documentation review** — In some cases, Concierge may request additional documents such as business address verification or a bank letter. Concierge will follow up directly if needed.
2. **Test transactions** — Once your account is nearly ready, you'll see the message **"Your bank account is almost set up!"** This means Expensify has sent three test transactions, which usually arrive within 1–2 business days.
3. **Validation** — Enter the three exact amounts to complete setup. Learn how to [validate a business bank account](/articles/new-expensify/wallet-and-payments/Validate-a-Business-Bank-Account).

---

## How business bank accounts appear in Wallet

Once connected, your business bank account appears in **Account > Wallet**. If you have both personal and business bank accounts, Wallet separates them into **Personal bank accounts** and **Business bank accounts** sections.

Partially set-up accounts display an **Action required** badge. Click the account row to resume setup from where you left off.

<!-- SCREENSHOT:
Suggestion: Wallet page showing separate Personal and Business bank account sections, with an Action required badge on a partially set-up account
Location: After the paragraph
Purpose: Shows the new Wallet layout with separated sections and status badges
-->

---

# FAQ

## What are the general requirements for adding a US business bank account?

To add a business bank account for ACH reimbursements or the Expensify Card, enter a physical address for yourself, any Beneficial Owner (if applicable), and the business. A US photo ID, US address, and US SSN are required for all individuals associated with the account.

## Which industries does Expensify not support for direct payments?

Expensify cannot process direct payments for businesses in the following industries:

- Security Brokers & Dealers
- Dating & Escort Services
- Massage Parlors
- Casinos & Gambling/Betting Services
- Non-FI, Money Orders
- Wires, Money Orders
- Government-Owned Lotteries
- Government-Licensed Online Casinos (Online Gambling)
- Government-Licensed Horse/Dog Racing
- Crypto-currency businesses
- Internet gambling
- Marijuana-related businesses
- Firearm-related businesses (manufacturing and selling)
- NFT (non-fungible token) services

## What is a Beneficial Owner?

A Beneficial Owner is an individual who owns 25% or more of the business. If no individual meets this threshold, you do not need to list a Beneficial Owner.

## What if my business is owned by another company?

Only check the Beneficial Owner box if an individual owns 25% or more of the business.

## Why can't I input my address or upload my ID?

All individuals associated with the account must have a US address, US photo ID, and a US SSN. If you do not meet these requirements, an admin who qualifies should add the bank account instead.

## Why am I asked for documents when adding my bank account?

Expensify follows federal regulations (BSA/AML laws) and anti-fraud measures. If automatic verification fails, Expensify may request manual verification such as address verification or a bank ownership letter. Contact Concierge for assistance.

## What should I do if I don't see all three test transactions?

Wait two business days. If the transactions still haven't arrived, contact your bank and ask them to whitelist the following ACH IDs:

- **1270239450**
- **4270239450**
- **2270239450**

ACH Originator Name: **Expensify**

Once completed, contact Concierge to re-trigger the test transactions.

## How does Expensify protect my data?

Expensify uses bank-level security measures. Learn more about [Expensify's security policies](/articles/new-expensify/settings/Encryption-and-Data-Security).
