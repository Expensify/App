---
title: Understand Expensify Pricing
description: Learn the current pricing for Collect and Control workspaces, including subscription rates, Expensify Card discounts, and legacy Collect pricing.
keywords: [billing, pricing, Collect, Control, subscription, currency, seat count, Expensify Card, workspace eligibility, NZD billing, GBP billing, EUR billing, AUD billing]
internalScope: Covers current pricing for Collect and Control Workspaces, Annual and Pay-per-use subscriptions, localized pricing, Expensify Card discounts, and legacy Collect pricing. Does not explain how subscription charges are calculated or how to manage subscriptions.
retrievalIntent: How much does Expensify cost
contentType: topic
platform: new
order: 3
---

# Understand Expensify Pricing

Expensify pricing depends on your Workspace plan, subscription type, billing currency, and for eligible subscriptions, qualifying Expensify Card usage. This article provides an overview of the current pricing model. For the latest pricing details and feature comparison, visit [Expensify Pricing](https://www.expensify.com/pricing).

## Find your subscription pricing

Select your billing currency to view the subscription prices.

<p><strong>Select your billing currency:</strong></p>

<select id="currency-selector">
  <option value="usd" selected>USD ($)</option>
  <option value="gbp">GBP (£)</option>
  <option value="eur">EUR (€)</option>
  <option value="aud">AUD (AU$)</option>
  <option value="nzd">NZD (NZ$)</option>
</select>

<br><br>

<div class="currency-block" data-currency="usd" markdown="1">

| Workspace plan | Subscription | Standard price | With Expensify Card |
| -------------- | ------------ | -------------: | -------------------: |
| **Collect** | Pay-per-use | **$5** per unique member/month | — |
| **Control** | Annual | **$18** per member included in your subscription size/month, plus **$36** per active member above your subscription size/month | **As low as $9** per member included in your subscription size/month |
| **Control** | Pay-per-use | **$36** per active member/month | — |

</div>

<div class="currency-block" data-currency="gbp" style="display:none;" markdown="1">

| Workspace plan | Subscription | Standard price | With Expensify Card |
| -------------- | ------------ | -------------: | -------------------: |
| **Collect** | Pay-per-use | **£5** per unique member/month | — |
| **Control** | Annual | **£14** per member included in your subscription size/month, plus **£28** per active member above your subscription size/month | **As low as £7** per member included in your subscription size/month |
| **Control** | Pay-per-use | **£28** per active member/month | — |

</div>

<div class="currency-block" data-currency="eur" style="display:none;" markdown="1">

| Workspace plan | Subscription | Standard price | With Expensify Card |
| -------------- | ------------ | -------------: | -------------------: |
| **Collect** | Pay-per-use | **€5** per unique member/month | — |
| **Control** | Annual | **€16** per member included in your subscription size/month, plus **€32** per active member above your subscription size/month | **As low as €8** per member included in your subscription size/month |
| **Control** | Pay-per-use | **€32** per active member/month | — |

</div>

<div class="currency-block" data-currency="aud" style="display:none;" markdown="1">

| Workspace plan | Subscription | Standard price | With Expensify Card |
| -------------- | ------------ | -------------: | -------------------: |
| **Collect** | Pay-per-use | **AU$8** per unique member/month | — |
| **Control** | Annual | **AU$30** per member included in your subscription size/month, plus **AU$60** per active member above your subscription size/month | **As low as AU$15** per member included in your subscription size/month |
| **Control** | Pay-per-use | **AU$60** per active member/month | — |

</div>

<div class="currency-block" data-currency="nzd" style="display:none;" markdown="1">

| Workspace plan | Subscription | Standard price | With Expensify Card |
| -------------- | ------------ | -------------: | -------------------: |
| **Collect** | Pay-per-use | **NZ$9** per unique member/month | — |
| **Control** | Annual | **NZ$32** per member included in your subscription size/month, plus **NZ$64** per active member above your subscription size/month | **As low as NZ$16** per member included in your subscription size/month |
| **Control** | Pay-per-use | **NZ$64** per active member/month | — |

</div>

<script>
  (function () {
    var selector = document.getElementById('currency-selector');
    var blocks = document.querySelectorAll('.currency-block');

    function updateCurrency() {
      var value = selector.value;
      blocks.forEach(function (block) {
        block.style.display =
          block.getAttribute('data-currency') === value ? 'block' : 'none';
      });
    }

    selector.addEventListener('change', updateCurrency);
    updateCurrency();
  })();
</script>

---

## How Annual subscription pricing works

An Annual subscription is a 12-month commitment to a subscription size that you choose when you start the subscription.

Each month, you're billed for every member included in your subscription size, regardless of activity. If the number of active members exceeds your subscription size, each additional active member is billed at the Pay-per-use rate.

During your subscription term:

 - You can increase your subscription size at any time.
 - You can't decrease your subscription size until your subscription renews.

For more information about managing an Annual subscription, see [Manage Annual Subscription Settings](/articles/new-expensify/billing-and-subscriptions/manage-your-subscription-and-billing/manage-subscription/Manage-Annual-Subscription-Settings).

---

## How the Expensify Card discount works

Control Workspaces with an Annual subscription can receive up to a 50% discount on their subscription pricing based on Expensify Card usage.

Your discount is calculated based on the percentage of all approved USD expenses in your Workspace during the billing month that were incurred on the Expensify Card. As that percentage increases, your subscription discount increases proportionally, up to a maximum of 50%.

With the full discount, subscription prices are reduced by 50%. For example, on USD billing, the price for members included in your subscription size is reduced from $18 to $9 per member/month, and the price for active members above your subscription size is reduced from $36 to $18 per member/month.

---
   
## How legacy Collect pricing works

The current Collect pricing applies only if your organization's first workspace was created on or after April 1, 2025.

If your organization's first Workspace was created before April 1, 2025, your Workspace remains on legacy Collect pricing.

Legacy Collect pricing is:

| Subscription |                 Price (USD) |
| ------------ | --------------------------: |
| Annual       |  $5 per active member/month |
| Pay-per-use  | $10 per active member/month |

Legacy Collect subscriptions use active members for billing instead of unique members.

To learn about the difference between active members and unique members, see [Learn About Billing Terms and Definitions](/articles/new-expensify/billing-and-subscriptions/Learn-About-Billing-Terms-and-Definitions#what-member-terms-mean).

---

# FAQ

## Are localized prices converted from USD?

No. Expensify uses fixed regional pricing rather than converting prices based on daily exchange rates.

## Are taxes included in the prices shown?

No. Applicable taxes are calculated separately based on your billing location and tax status.

## Which Workspaces can use an Annual subscription?

Only Control Workspaces can use an Annual subscription. Collect Workspaces are available only with a Pay-per-use subscription.

## Can my subscription price change during an Annual term?

Yes. If you increase your subscription size or exceed it during an Annual subscription, additional members are billed at the Pay-per-use rate.

## Which currencies does Expensify support for localized pricing?

Expensify offers localized pricing for USD, GBP, EUR, AUD, and NZD billing.



