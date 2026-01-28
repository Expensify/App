---
title: Set Up and Manage Expensify Cards
description: Learn how Workspace Admins can enable, issue, and manage Expensify Cards for employees, including spending limits, bank connections, and virtual card setup.
keywords: [New Expensify, Expensify Card setup, manage virtual card, card limits, Expensify Visa, card settings, Workspace Admin]
---

Workspace Admins can enable and issue Expensify Visa® Commercial Cards to manage company spending with real-time controls and flexibility across employees and subscriptions.

**The Expensify Card offers powerful spend control tools, including:**

- Unlimited virtual cards
- Individual monthly or fixed spend limits
- Custom names for easier categorization
- Spend restrictions by employee and merchant
- Real-time visibility and cash back rewards

**Prerequisites:** You must be a workspace admin and have a U.S. business bank account connected to Expensify. See this guide on [connecting a business bank account](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Connect-a-Business-Bank-Account).

---

# Step 1: Enable the Expensify Card

To turn on Expensify Cards for your workspace:

1. From the left-hand menu, select **Settings > Workspaces > [Workspace Name] > More features**
2. Under **Spend**, toggle on **Expensify Card**

![Click the toggle next to Expensify Card]({{site.url}}/assets/images/ExpensifyHelp-WorkspaceFeeds_01.png){:width="100%"}

---

# Step 2: Select a Bank Account

Link a U.S. business bank account to pay the card balance:

1. From the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces > [Workspace Name] > Expensify Card**
2. Click **Issue new card**
3. Choose an existing account or [add a new bank account](https://help.expensify.com/articles/new-expensify/expenses-and-payments/Connect-a-Business-Bank-Account) as the settlement account.

![Click the issue card button]({{site.url}}/assets/images/ExpensifyHelp-WorkspaceFeeds_02.png){:width="100%"}

---

# Step 3: Issue Expensify Cards

You can issue virtual or physical cards to employees:

1. From the navigation tabs (on the left on web, and at the bottom on mobile), head to **Workspaces > [Workspace Name] > Expensify Cards**
2. Click **Issue new card**
3. Select the employee
4. Choose **Virtual** or **Physical**
5. Pick a limit type:
   - **Smart limit**: Spend up to a threshold before needing approval
   - **Monthly limit**: Capped monthly spend
   - **Fixed limit**: One-time cap, card closes when reached
6. Enter the spending limit
7. Name the card for easier tracking
8. Click **Issue card** to confirm

![Click issue card to confirm and issue the card]({{site.url}}/assets/images/ExpensifyHelp-WorkspaceFeeds_04.png){:width="100%"}

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

![Click Expensify Card in the left menu to see a list of cards]({{site.url}}/assets/images/ExpensifyHelp-WorkspaceFeeds_05.png){:width="100%"}

![Click the card row to view the card details and make settings adjustments]({{site.url}}/assets/images/ExpensifyHelp-WorkspaceFeeds_06.png){:width="100%"}

![Click Settings to adjust the settlement account or frequency]({{site.url}}/assets/images/ExpensifyHelp-WorkspaceFeeds_07.png){:width="100%"}

---

# Freeze or unfreeze Expensify Cards

As a Workspace Admin, you can freeze or unfreeze any card in your workspace - without needing to cancel or reissue it.

Freezing a card is helpful if:
- You suspect misuse or a policy violation
- You want to temporarily pause employee spending
- You're enforcing a department-wide budget freeze

### To freeze or unfreeze a card:

1. Go to **Settings > Workspaces > [Workspace Name] > Expensify Card**.
2. Click a card from the list to open its details pane.
3. Tap **Freeze card** or **Unfreeze card**.
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

Yes, but each workspace must have its **own settlement account**. For example, using the card in three workspaces requires three separate bank accounts.

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

