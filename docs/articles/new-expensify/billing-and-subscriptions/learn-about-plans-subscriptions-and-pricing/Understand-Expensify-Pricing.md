---
title: Understand Expensify Pricing
description: Learn the current pricing for Collect and Control Workspaces, including subscription rates, Annual pricing, Expensify Card discounts, localized pricing, and legacy Collect pricing.
keywords: [billing, pricing, Collect, Control, subscription, currency, seat count, Expensify Card, workspace eligibility, NZD billing, GBP billing, EUR billing, AUD billing]
internalScope: Covers current pricing for Collect and Control Workspaces, Annual and Pay-per-use subscriptions, localized pricing, Expensify Card discounts, and legacy Collect pricing. Does not explain how subscription charges are calculated or how to manage subscriptions.
retrievalIntent: Current subscription pricing, Annual pricing, Expensify Card discounts, legacy Collect pricing, localized pricing.
contentType: topic
platform: new
---

# Understand Expensify Pricing

Expensify pricing depends on your Workspace plan, subscription type, billing currency, and, for some subscriptions, qualifying Expensify Card usage. This article lists the current subscription rates and pricing rules.

For an explanation of how subscription charges are calculated, see How Your Plan and Subscription Determine Your Bill.

## Find your subscription price

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

| Workspace plan | Subscription | Price |
| -------------- | ------------ | ----- |
| **Collect** | Pay-per-use | **$5** per unique member/month |
| **Control** | Annual | **$18** per member included in your subscription size/month, plus **$36** per active member above your subscription size/month |
| **Control** | Pay-per-use | **$36** per active member/month |

<p><small>*Annual Control subscriptions may qualify for an Expensify Card discount.</small></p>

</div>

<div class="currency-block" data-currency="gbp" style="display:none;" markdown="1">

| Workspace plan | Subscription | Price |
| -------------- | ------------ | ----- |
| **Collect** | Pay-per-use | **£5** per unique member/month |
| **Control** | Annual | **£14** per member included in your subscription size/month, plus **£28** per active member above your subscription size/month |
| **Control** | Pay-per-use | **£28** per active member/month |

</div>

<div class="currency-block" data-currency="eur" style="display:none;" markdown="1">

| Workspace plan | Subscription | Price |
| -------------- | ------------ | ----- |
| **Collect** | Pay-per-use | **€5** per unique member/month |
| **Control** | Annual | **€16** per member included in your subscription size/month, plus **€32** per active member above your subscription size/month |
| **Control** | Pay-per-use | **€32** per active member/month |

</div>

<div class="currency-block" data-currency="aud" style="display:none;" markdown="1">

| Workspace plan | Subscription | Price |
| -------------- | ------------ | ----- |
| **Collect** | Pay-per-use | **AU$8** per unique member/month |
| **Control** | Annual | **AU$30** per member included in your subscription size/month, plus **AU$60** per active member above your subscription size/month |
| **Control** | Pay-per-use | **AU$60** per active member/month |

</div>

<div class="currency-block" data-currency="nzd" style="display:none;" markdown="1">

| Workspace plan | Subscription | Price |
| -------------- | ------------ | ----- |
| **Collect** | Pay-per-use | **NZ$9** per unique member/month |
| **Control** | Annual | **NZ$32** per member included in your subscription size/month, plus **NZ$64** per active member above your subscription size/month |
| **Control** | Pay-per-use | **NZ$64** per active member/month |

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

For more information about managing an Annual subscription, see Manage Annual Subscription Settings.

---

## How the Expensify Card discount works

Control Workspaces with an Annual subscription can receive up to 50% off their subscription price.

If at least 25% of workspace spend is incurred on the Expensify Card, your subscription discount matches that percentage, up to a maximum discount of 50%. If less than 25% of workspace spend is incurred on the Expensify Card, no discount is applied.

For example, on USD billing:
 - If 50% of your qualifying spend is on the Expensify Card, you receive a 50% discount and your price is $9 per member in your subscription size.
 - If 35% of your qualifying spend is on the Expensify Card, you receive a 35% discount and your subscription price is $11.70 per member in your subscription size. 

To qualify for the discount, Expensify Card spend must be incurred in USD and approved during the billing month.

## Understand legacy Collect pricing 

The current Collect pricing applies only if your organization's first workspace was created on or after April 1, 2025.

If your organization's first Workspace was created before April 1, 2025, your Workspace remains on legacy Collect pricing.

Legacy Collect pricing is:

| Subscription |                 Price (USD) |
| ------------ | --------------------------: |
| Annual       |  $5 per active member/month |
| Pay-per-use  | $10 per active member/month |

Legacy Collect subscriptions use active members for billing instead of unique members.

To learn about the difference between active members and unique members, see [Understand Billing Terms and Definitions](/articles/new-expensify/billing-and-subscriptions/Understand-Billing-Terms-and-Definitions#what-member-terms-mean).

---

# FAQ

## Does every customer qualify for the current Collect price?

No. The current Collect price applies only if your organization's first Workspace was created on or after April 1, 2025.

## Are localized prices converted from USD?

No. Expensify uses fixed regional pricing rather than converting prices based on daily exchange rates.

## Are taxes included in the prices shown?

No. Applicable taxes are calculated separately based on your billing location and tax status.
