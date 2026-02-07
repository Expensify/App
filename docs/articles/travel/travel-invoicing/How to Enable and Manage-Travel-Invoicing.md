---
title: How to Enable and Manage Travel Invoicing
description: Learn how to enable Travel Invoicing, configure accounting settings, and understand how limits and settlements work in New Expensify.
keywords: [New Expensify, travel invoicing, enable travel billing, travel limit, travel invoice, travel settlement, workspace travel settings, travel cvv, spotnana integration]
---

<div id="new-expensify" markdown="1">

Admins can use Travel Invoicing to centrally bill all company travel without issuing individual cards to each employee. This guide walks through enabling the feature, setting up a settlement account, understanding credit limits, and how monthly invoices and exports work.

# Travel Invoicing Setup

## Enable Travel Invoicing

To enable Travel Invoicing for a workspace:

1. From the left-hand menu, select **Workspaces > [Workspace Name] > Travel**.
2. Toggle on **Travel Invoicing**.
3. If you haven't yet added a verified business bank account (VBBA), you'll be prompted to do so. Follow the steps to connect a settlement account.
4. Once connected, your workspace will display a summary of:
   - **Current Travel Spend**
   - **Travel Limit**
   - **Settlement Account**
   - **Settlement Frequency**

> **Note:** Travel Invoicing is currently available only to U.S.-based workspaces.

## Understand Travel Limits

Travel Invoicing shares backend infrastructure with Expensify Cards but uses a separate **PROGRAM_TRAVEL_US** feed. Here's how limits work:

- If the same bank account is used for both Expensify Card and Travel Invoicing, the limit will mirror your card program’s limit.
- This effectively **doubles your available credit** across both programs. Future releases will support dynamic or custom allocation.

> **Example:** If your Expensify Card limit is $100,000 and you enable Travel Invoicing using the same bank account, your Travel limit will also be $100,000.

## Manage Your Travel Invoicing Settings

Once Travel Invoicing is enabled:

- **Change settlement account:** Tap the **Settlement account** row and select or connect a new bank account.
- **Change settlement frequency:** Tap the **Settlement frequency** row and choose between **Monthly** or **Daily**.
- **Pay balance early:** If you need to clear your outstanding balance before your next auto-debit, select **Pay balance**.

> You can't disable Travel Invoicing while a balance is outstanding. You'll be prompted to pay down the balance first.

# Accounting and Exports

## Exporting Travel Expenses

You can configure how travel invoice data is exported in your accounting integration:

1. From the left-hand menu, select **Workspaces > [Workspace Name] > Accounting**.
2. Choose your accounting platform (e.g., QuickBooks, NetSuite).
3. Under **Travel Invoicing**, configure:
   - **Travel vendor**: The vendor under which Travel invoices will be recorded.
   - **Payable account**: The account used for recording the liability.

> Travel invoices are exported as **vendor bills** or **accounts payable** entries depending on your integration setup.

## Export Travel Invoice Statements

To view or download past travel activity:

1. Go to **Workspaces > [Workspace Name] > Travel**.
2. Click the **Export** button (upper-right corner of the Travel Invoicing section).
3. Choose to export your statement as a **CSV** or **PDF**.

Statements include:
- Trip names
- Traveler details
- Booking types (flight, hotel, car rental)
- Amounts and booking dates

# How Settlement Works

- Settlements occur based on your chosen frequency (**monthly** or **daily**).
- Travel charges are billed in one consolidated invoice.
- Expensify automatically debits the connected settlement account.
- No cashback is provided on Travel Invoicing spend (Expensify retains the interchange).

## Failed Settlements

If a settlement fails:
- Travel access is suspended.
- Cards are locked.
- A notification is sent with a prompt to resolve the issue via **Settings > Account > Wallet**.

> Once resolved, access and cards are automatically reinstated.

# Classic Expensify Users

If you're using **Expensify Classic**, you'll need to temporarily switch to New Expensify to enable Travel Invoicing:

1. From **Settings > Domains > [Domain Name] > Travel Invoicing**, click **Go to New Expensify**.
2. Complete setup, then switch back to Classic if needed.

# FAQ

## What happens if we reach our Travel limit?

You won’t be able to make additional bookings until your balance is paid down. Use the **Pay balance** option to make an early payment if needed.

## Can we use a different bank account for Travel Invoicing?

Yes! During setup, you can link a **different** verified business bank account than the one used for Expensify Cards.

## Is there a penalty for disabling Travel Invoicing?

No penalty, but you must first settle any outstanding balance. Also note: hotel or car rental bookings may be rebooked with alternate cards to avoid service issues if Travel Invoicing is turned off.

</div>
