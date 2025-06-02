---
title: check-expensify-card-limit.md
description: Learn how to view your available Expensify Card Smart Limit and understand what determines your Domain Limit.
keywords: [Expensify Card, Smart Limit, check card limit, Domain Limit, Wallet, virtual card, settlement account, available funds]
---

<div id="new-expensify" markdown="1">

Your Expensify Visa® Commercial Card comes with a **Smart Limit** that updates automatically after each purchase. This limit is set by your Domain Admin and is affected by your company's available funds.

Here’s how to check your card’s Smart Limit:

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Click your **profile image** in the bottom left menu.
2. Select **Wallet** from the left-hand menu.
3. Click your **Expensify Card** to view your Smart Limit.
{% include end-option.html %}

{% include option.html value="mobile" %}
1. Tap your **profile image** in the bottom menu.
2. Tap **Wallet**.
3. Tap your **Expensify Card** to view your Smart Limit.
{% include end-option.html %}

{% include end-selector.html %}

![View Wallet section on desktop]({{site.url}}/assets/images/wallet-01.png){:width="100%"}
![Select Expensify Card to view Smart Limit]({{site.url}}/assets/images/wallet-02.png){:width="100%"}

---

## How is the Domain Limit determined?

The **Domain Limit** is the maximum combined spending limit for all Expensify Cards in your domain. It’s calculated using:

- **Available balance** in the verified bank account set as your **settlement account**
- **Pending expenses** and **unsettled transactions**
- **Funds availability** tracked via **Plaid**
- **Settlement cycle timing**, which usually takes **three business days**

---

## What affects the Domain Limit?

- **Available funds:** A sudden drop in your linked bank account can reduce your Domain Limit.
- **Pending expenses:** Large, unprocessed purchases temporarily reduce your spending capacity.
- **Processing settlements:** Until the previous cycle settles, your limit adjusts dynamically.
  
**Note:** If your Domain Limit is $0, cardholders won’t be able to make purchases.

</div>
