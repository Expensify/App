---
title: Billing and Subscriptions
description: Learn how Collect and Control plans are billed in different currencies, how card usage affects pricing, and which members are charged.
keywords: [localized billing, pricing, Collect, Control, subscription, billing currency, seat count, Expensify Card, workspace eligibility]
internalScope: Audience is Workspace Admins. Covers pricing for Collect and Control plans across multiple currencies, eligibility rules, and how billing is calculated. Does not cover ownership transfer or billing issue resolution.
---

Expensify offers two subscription plans — **Collect** and **Control** — designed to scale with your team's needs. This article explains how each plan is billed, pricing by currency, and how to manage your billing setup.

---

# How Collect and Control pricing works by currency

<p><strong>Select your billing currency:</strong></p>

<select id="currency-selector">
  <option value="usd" selected>USD ($)</option>
  <option value="gbp">GBP (£)</option>
  <option value="eur">EUR (€)</option>
  <option value="aud">AUD (AU$)</option>
  <option value="nzd">NZD (NZ$)</option>
</select>

<br><br>

<div class="currency-block" data-currency="usd">
  <h2> USD subscription pricing</h2>
  <strong>Collect</strong>
  <ul>
    <li>$5 per unique member/month</li>
    <li>Month-to-month — no annual contract</li>
    <li>1% cash back with the Expensify Card</li>
  </ul>
  <strong>Control</strong>
  <ul>
    <li>$9 per active member/month with Annual Subscription + Card usage (50%+ US spend)</li>
    <li>$18 per active member/month without Card</li>
    <li>$36 per active member/month for pay-per-use (no commitment)</li>
    <li>Earn up to 2% cash back (applied to your bill or bank account)</li>
  </ul>
</div>

<div class="currency-block" data-currency="gbp" style="display:none;">
  <h2>💵 GBP subscription pricing</h2>
  <strong>Collect</strong>
  <ul>
    <li>£5 per unique member/month</li>
    <li>Fully flexible — add/remove members anytime</li>
  </ul>
  <strong>Control</strong>
  <ul>
    <li>£14 per active member/month with Annual Subscription</li>
    <li>£28 pay-per-use</li>
  </ul>
</div>

<div class="currency-block" data-currency="eur" style="display:none;">
  <h2> EUR subscription pricing</h2>
  <strong>Collect</strong>
  <ul>
    <li>€5 per unique member/month</li>
    <li>Month-to-month — no contract</li>
  </ul>
  <strong>Control</strong>
  <ul>
    <li>€16 per active member/month with Annual Subscription</li>
    <li>€32 pay-per-use</li>
  </ul>
</div>

<div class="currency-block" data-currency="aud" style="display:none;">
  <h2> AUD subscription pricing</h2>
  <strong>Collect</strong>
  <ul>
    <li>AU$8 per unique member/month</li>
    <li>Month-to-month, no annual contract required</li>
  </ul>
  <strong>Control</strong>
  <ul>
    <li>AU$30 per active member/month with Annual Subscription</li>
    <li>AU$60 pay-per-use</li>
  </ul>
</div>

<div class="currency-block" data-currency="nzd" style="display:none;">
  <h2> NZD subscription pricing</h2>
  <strong>Collect</strong>
  <ul>
    <li>NZ$9 per unique member/month</li>
    <li>Fully month-to-month</li>
  </ul>
  <strong>Control</strong>
  <ul>
    <li>NZ$32 per active member/month with Annual Subscription</li>
    <li>NZ$64 pay-per-use</li>
  </ul>
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

# Who gets billed under Collect and Control plans

## Collect plan

- Every **unique member** added to a workspace, regardless of activity
- Charges adjust monthly as members are added or removed

## Control plan

- Every **active member** who creates, submits, approves, reimburses, or exports reports
- Includes Copilots and automated Concierge actions
- Add users anytime (extends your subscription term)
- Remove users only after the term ends

**Note:** Billing details and actions are controlled by the workspace’s **billing owner**.

---

# Billing eligibility and how pricing is calculated

## Expensify Card usage (US Only)

- **Collect:** Card is optional — but earns 1% cash back on US spend
- **Control:** Card is required for discounted pricing and cash back

## Collect plan eligibility

- Applies to customers whose **first workspace** was created on or after **April 1, 2025**

## Annual Subscription details

Annual plans lock the minimum seat count for a 12-month term. You can add members anytime, but you cannot remove them until the term ends.

## Localized billing

- Pricing is available in **USD, GBP, EUR, AUD, and NZD**
- All pricing auto-adjusts based on your currency selection

# How to view your billing receipts

- **Web:** Go to `Account > Settings > Subscription`
- **Mobile:** Tap the **Settings** tab, then select **Subscription**

**ADD A SCREENSHOT HERE.** Suggestion: Account > Settings > Subscription screen showing billing receipt history.

---

# FAQ

## Why am I being charged more than the current Collect pricing?

If your first workspace was created **before April 1, 2025**, you're on a legacy pricing structure. Reach out to **Concierge** or your **Account Manager** if you have questions about your billing.

## Is the Expensify Card required to use Collect or Control?

- **Collect:** No, the card is optional.
- **Control:** No, but card usage unlocks discounted pricing and up to 2% cash back.

## Can I switch between plans?

Yes! To change your plan:
- Go to **Settings > Workspaces > [Workspace Name] > Settings**
- Choose between **Collect** and **Control** based on your team's needs

**Note:** For step-by-step instructions, see [how to switch between Collect and Control plans](#).


## What if I need to change the billing owner?

See [How to transfer billing ownership](#) for step-by-step instructions on how another Workspace Admin can take over billing responsibilities.



