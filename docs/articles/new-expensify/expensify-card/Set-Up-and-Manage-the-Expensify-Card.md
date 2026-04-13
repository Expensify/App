---
title: Set Up and Manage Expensify Cards
description: Learn how Workspace Admins can enable, issue, and manage Expensify Cards for employees, including spending limits, bank connections, and virtual card setup.
keywords: [New Expensify, Expensify Card setup, manage virtual card, card limits, Expensify Visa, card settings, Workspace Admin]
internalScope: Applies to Workspace Admins. Covers Expensify Card setup and management. Does not cover troubleshooting or third-party feeds.
---

Workspace Admins can enable and issue Expensify Visa® Commercial Cards to manage company spending with real-time controls and flexibility across employees and subscriptions.

**The Expensify Card offers powerful spend control tools, including:**

- Unlimited virtual cards
- Individual Smart, Monthly, Fixed, or Single-use spend limits
- Optional expiration dates for time-bound spending
- Custom names for easier categorization
- Spend restrictions by employee and merchant
- Real-time visibility and cash back rewards

**Prerequisites:** You must be a workspace admin and have a U.S. business bank account connected to Expensify. See this guide on [connecting a business bank account](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Connect-a-Business-Bank-Account).

---

# Step 1: Enable the Expensify Card

To turn on Expensify Cards for your workspace:

1. From the left-hand menu, select **Settings > Workspaces > [Workspace Name] > More features**
2. Under **Spend**, toggle on **Expensify Card**

![Click the toggle next to Expensify Card]({{site.url}}/assets/images/ExpensifyHelp-ExpensifyCard_01.png){:width="100%"}

---

# Step 2: Select a Bank Account

Link a U.S. business bank account to pay the card balance:

1. From the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces > [Workspace Name] > Expensify Card**
2. Click **Issue new card**
3. Choose an existing account or [add a new bank account](https://help.expensify.com/articles/new-expensify/expenses-and-payments/Connect-a-Business-Bank-Account) as the settlement account.

If you already have an Expensify Card feed on another workspace, you can select that existing feed instead of connecting a new bank account. This links the same card feed to the current workspace, so you can manage cards across multiple workspaces with a single settlement account.

![Click the issue card button]({{site.url}}/assets/images/ExpensifyHelp-ExpensifyCard_02.png){:width="100%"}

---

# Step 3: Issue Expensify Cards

You can issue virtual or physical cards to employees:

1. From the navigation tabs (on the left on web, and at the bottom on mobile), head to **Workspaces > [Workspace Name] > Expensify Cards**
2. Click **Issue new card**
3. Select the employee
4. Choose **Virtual** or **Physical**
5. Choose a limit type:
   - **Smart limit**: Spend up to a threshold before needing approval
   - **Monthly limit**: Limit renews monthly
   - **Fixed limit**: Spend until the limit is reached
   - **Single-use (virtual only)**: Expires after one transaction
6. Enter the spending limit
7. (Optional for virtual cards) Toggle **Set expiration date** to define:
   - **Start date**
   - **End date**
   - **When enabled:** Both dates are required. The card activates at 12:00 AM local time on the Start date and expires at 11:59 PM local time on the End date.
   - **When disabled:** The card does not expire automatically.
8. Name the card for easier tracking
9. Click **Issue card** to confirm

![Choose a Smart limit type]({{site.url}}/assets/images/ExpensifyHelp-ExpensifyCard_03.png){:width="100%"}

![Click issue card to confirm and issue the card]({{site.url}}/assets/images/ExpensifyHelp-ExpensifyCard_04.png){:width="100%"}

---

# Monitor and Manage Cards

**After issuing cards, you can view, adjust, or deactivate them:**

1. From the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces > [Workspace Name] > Expensify Card**
2. See a list of all issued cards
3. Click a card to view details or adjust:
   - Spending limit
   - Limit type
   - Card name
   - Deactivation
4. To change the linked bank account or update settlement frequency, click **Settings**.

![Click Expensify Card in the left menu to see a list of cards]({{site.url}}/assets/images/ExpensifyHelp-ExpensifyCard_05.png){:width="100%"}

![Click the card row to view the card details and make settings adjustments]({{site.url}}/assets/images/ExpensifyHelp-ExpensifyCard_06.png){:width="100%"}

![Click Settings to adjust the settlement account or frequency]({{site.url}}/assets/images/ExpensifyHelp-ExpensifyCard_08.png){:width="100%"}

If a Single-use card completes its first successful transaction, it automatically deactivates.
If a card reaches its expiration date, it automatically deactivates and declines new transactions.

---

# How to freeze or unfreeze an Expensify Card

As a Workspace Admin, you can freeze or unfreeze any card in your workspace without needing to cancel or reissue it.

Freezing a card is helpful if:
- You suspect misuse or a policy violation
- You want to temporarily pause employee spending
- You're enforcing a department-wide budget freeze

To freeze or unfreeze a card:

1. Go to **Settings > Workspaces > [Workspace Name] > Expensify Card**.
2. Click a card from the list to open its details pane.
3. Click **Freeze card** or **Unfreeze card**.
4. Confirm the action in the popup modal.

Once frozen:
- The card immediately stops working for purchases
- You'll see a note below the card indicating who froze the card and when
- The employee sees the same message and cannot unfreeze the card themselves

All freeze/unfreeze actions are automatically posted to the workspace chat.

---

# FAQ

## What kind of bank account is required?

You’ll need a U.S. business bank account registered to a U.S.-incorporated business.

## Can I use Expensify Cards across multiple workspaces?

Yes. You can link a single Expensify Card feed to multiple workspaces using the same settlement account. When issuing cards on a new workspace, select an existing feed that is already connected to another workspace. Each workspace shows only its own members in the card list, but all workspaces share the same card feed and settlement account.

## Can an employee have multiple cards?

- **Yes**: Employees can have unlimited **virtual cards** (e.g. for trips or subscriptions).
- **Yes**: Employees can be issued multiple physical cards with different limit types.

## How is the Expensify Card limit determined?

The limit is the maximum combined spending limit for all Expensify Cards in your domain. It’s calculated using:

- **Available balance** in the verified bank account set as your **settlement account**
- **Pending expenses** and **unsettled transactions**
- **Funds availability** tracked via **Plaid**
- **Settlement cycle timing**, which usually takes **three business days**

## What affects the Expensify Card limit?

- **Available funds:** A sudden drop in your linked bank account can reduce your Domain Limit.
- **Pending expenses:** Large, unprocessed purchases temporarily reduce your spending capacity.
- **Processing settlements:** Until the previous cycle settles, your limit adjusts dynamically.

## What is a Single-use Expensify Card?

A Single-use virtual card automatically deactivates after its first successful authorization. It's ideal for one-time purchases like flights, vendor payments, or event registration.

## What happens when a card reaches its expiration date?

The card automatically deactivates at 11:59 PM local time on the selected End date and declines new transactions.

