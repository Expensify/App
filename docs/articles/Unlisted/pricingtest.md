## Control Plan

💸 **Best way to save**  
- Combine an annual subscription with the Expensify Visa® Commercial Card  
- Price: $9 per active member/month  
- To qualify: Use the Expensify Card for 50% or more of your total settled US spending for the month

💰 **Cash back**  
- Earn 1%–2% cash back  
  - 1% for all US purchases  
  - 2% if monthly spend reaches $250,000+  
- Cash back is applied to your bill first, then to your bank account  
👉 Use the [savings calculator](https://use.expensify.com/savings-calculator) to estimate your monthly savings

---

## 🌍 Localized Pricing

**Select your billing currency:**

<select id="currency-selector">
  <option value="usd" selected>USD ($)</option>
  <option value="gbp">GBP (£)</option>
  <option value="nzd">NZD (NZ$)</option>
</select>

<br><br>

<!-- USD BLOCK -->
<div class="currency-block" data-currency="usd">

### 🇺🇸 USD Pricing

#### **Annual subscription only**
- Without card usage, pricing is $18 per active member/month  
- Add users anytime (extends your term)  
- You can only reduce users after your current term ends  
- Extra users above your committed quantity are billed at $36/month  

#### **Pay-per-use (no commitment)**
- Price: $36 per active member/month  
- This option allows flexibility without a long-term commitment  

#### **Who gets billed**
- Every active member (anyone who creates, submits, approves, reimburses, or exports reports during the month)  
- Includes Copilots and automated Concierge actions  

</div>

<!-- GBP BLOCK -->
<div class="currency-block" data-currency="gbp" style="display:none;">

### 🇬🇧 GBP Pricing

#### **Annual subscription only**
- Without card usage, pricing is £14 per active member/month  
- Add users anytime  
- You can reduce users only after your current term ends  
- Extra users above your committed quantity are billed at £28/month  

#### **Pay-per-use (no commitment)**
- Price: £28 per active member/month  

#### **Who gets billed**
- Every active member (creates, submits, approves, reimburses, or exports reports)  
- Includes Copilots and automated Concierge actions  

</div>

<!-- NZD BLOCK -->
<div class="currency-block" data-currency="nzd" style="display:none;">

### 🇳🇿 NZD Pricing

#### **Annual subscription only**
- Without card usage, pricing is NZ$X per active member/month  
- Add users anytime  
- You can reduce users only after your current term ends  
- Extra users above your committed quantity are billed at NZ$Y/month  

#### **Pay-per-use (no commitment)**
- Price: NZ$Y per active member/month  

#### **Who gets billed**
- Every active member (creates, submits, approves, reimburses, or exports reports)  
- Includes Copilots and automated Concierge actions  

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

💳 **Expensify Card access**  
- Required for discounted pricing  
- Cash back still applies even if the discounted rate isn’t reached

🧾 **Receipts**  
- View billing receipts at **Settings > Account > Subscription > Billing History**
