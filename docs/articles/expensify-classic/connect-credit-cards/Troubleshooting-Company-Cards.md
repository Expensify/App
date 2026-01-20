---
title: Troubleshooting Company Cards
description: Learn how to troubleshoot company card issues in Expensify, including fixing connection errors, resolving missing transactions, and troubleshooting CSV imports.
keywords: [Expensify Classic, company card troubleshooting, card errors, reconciliation dashboard, bank connection issues, csv import, commercial card feed]
---

This guide provides solutions to common issues encountered when connecting, importing, and managing company credit cards in Expensify. It covers troubleshooting steps for failed connections, missing transactions, CSV import errors, and duplicate expenses, helping you resolve issues efficiently and ensure a seamless experience.

---
# Commercial Card Feeds

## Is there a fee for using Commercial Card Feeds?
No, Commercial Card Feeds are included in Corporate Workspace pricing.

## How do Commercial Card Feeds differ from direct bank connections?
- **Direct Bank Connection:** Uses login credentials to sync transactions. No bank or Expensify assistance is required.
- **Commercial Card Feed:** Your bank requests Visa, MasterCard, or Amex to send a daily transaction feed to Expensify. This requires setup from both your bank and Expensify but offers enhanced stability.

## Will changing my bank password affect my Commercial Card Feed?
No, Commercial Card Feeds remain active even if you update your bank login credentials.

## Why did my Commercial Card Feed stop working?
Feeds can break for a few reasons:
- Your bank may have paused or disabled the feed.
- A backend error may have disrupted the daily delivery.

**Fix it:**
1. Contact your bank to confirm the feed is still active and sending data.
2. Go to **Settings** > **Domains** > **Company Cards** > **Update All Cards** to refresh the feed.

---
# Direct Bank Connections

## Is there a fee for using Direct Bank Connections?
No, direct card connections are free.

## Why did my direct bank connection break?
This usually happens after changes on the bank’s side, like:
- A password update
- Changes to login credentials or card number
- Updated or new security questions

**Fix it:**
1. Go to **Settings** > **Domains**.
2. Select your domain.
3. Click **Fix** next to the company card.
4. Enter the updated login credentials.

---
# Why Card Feeds Disconnect

Company card feeds are designed to work seamlessly in the background — and they usually do. But on rare occasions, a feed might stop syncing due to one of the following reasons:

- **Your bank asks for extra verification**: This sometimes happens when your bank updates its security settings or asks you to re-confirm your login.
- **Your bank password changed**: If you recently updated your bank login, the connection may need to be refreshed in Expensify.
- **Temporary connection service issues**: Expensify relies on trusted providers to connect to banks. If they’re experiencing downtime or updates, the feed might pause temporarily.
- **Unexpected bank restrictions**: In rare cases, banks may block access from third-party apps, even if your credentials are correct.

**Tip:** Most feed issues can be resolved by refreshing the card in **Settings** > **Domains** > **Company Cards**. If you're still seeing missing transactions, reach out to Concierge with the cardholder’s email and the last 4 digits of the card.

**Tip:** If you're eligible, consider switching to a **Commercial Card Feed** or the **Expensify Visa® Commercial Card** for greater stability.

---
# Feed Health Monitoring Tips

Card feeds usually run quietly in the background. But taking a few quick steps on a regular basis can help catch small issues before they cause problems:

- **Check the [Reconciliation Dashboard](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Reconciliation)** once a week to make sure all expected transactions are appearing.
- If you close out reports monthly, set a calendar reminder to give your company cards a quick review before finalizing.
- Keep an eye out for missing days or duplicate expenses — these can be signs that something needs attention.

**Note:** There’s no need to check feeds every day. But a quick monthly review goes a long way toward keeping everything running smoothly.

---
# Missing Transactions

If recent card transactions aren’t appearing:
1. **Wait**: Most bank feeds sync within 24 hours.
2. **Refresh**: Go to **Settings** > **Domains** > **Company Cards**, then click **Update**.
3. **Reconcile**: Use the [Reconciliation Dashboard](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Reconciliation) to compare your card totals with Expensify.
4. **Contact Concierge**: If transactions are still missing, include:
   - Cardholder email
   - Last 4 digits of the card
   - Transaction date, amount, and merchant

---
# Troubleshooting Connection Errors

## Error: Too many attempts  
**What it means:** Your login was attempted too many times in a short period.  
**Fix:** Wait 24 hours before trying again.

## Error: Invalid credentials/Login failed  
**What it means:** Your bank login failed authentication.  
**Fix:**
- Log into your bank directly to confirm the credentials.
- Check for bank-side maintenance or password resets.

## Error: Account setup required  
**What it means:** Your bank may require an additional step before allowing connections.  
**Fix:** Complete any pending actions in your bank’s portal, then retry the connection.

## Error: Direct Connect not enabled  
**What it means:** Your bank requires Direct Connect to be activated for the feed.  
**Fix:** Log into your bank portal and enable Direct Connect (usually under security or download settings).

## Error: Account not found/Card number changed  
**What it means:** The card number changed or the account is no longer active.  
**Fix:**
- Remove the old card.
- Re-import the new card using the updated number.

## Error: General connection issue  
**What it means:** Your bank may be undergoing maintenance or temporary downtime.  
**Fix:** Wait and try again later. You can also check the [Expensify status page](https://status.expensify.com/).

## Bank-specific requirements
- **Chase:** Password must be 8–32 characters.
- **Wells Fargo:** Password must be under 14 characters.
- **SVB:** Enable **Direct Connect** and use a **Direct Connect PIN**, not your online banking password.

---
# CSV Import Issues

## Error: "Attribute value mapping is missing"  
**What it means:** Required fields (card number, date, merchant, amount, or currency) are missing from the spreadsheet.  
**Fix:**
1. Close the mapping window.
2. Add the missing data to the spreadsheet.
3. Upload again using **Manage Spreadsheet**.
4. Enter a **Company Card Layout Name**.
5. Click **Upload CSV**.

## Error: "We've detected an error while processing your spreadsheet feed"  
**What it means:** General processing error during the CSV import.  
**Fix:**
1. Go to **Settings** > **Domains** > Select your domain.
2. Click **Manage/Import CSV**.
3. Check if the layout appears under "Upload Company Card transactions for":
   - If listed, wait one hour and retry syncing.
   - If not, create a new layout and re-upload.

## Error: "An unexpected error occurred, and we could not retrieve the list of cards"  
**What it means:** Upload failed due to internal error.  
**Fix:** Follow the same steps as the previous error.

## CSV Import Shows No New Data  
**What it means:** A spreadsheet update was made, but the changes aren’t showing in Expensify.  
**Fix:**
1. Go to **Settings** > **Domains** > Select your domain.
2. Click **Manage/Import CSV**.
3. Select your saved layout and re-upload the spreadsheet.
4. Compare the **Output Preview** row count to your file:
   - If mismatched, follow [CSV formatting guidelines](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Importing-CSV-Transactions), save the file with a new layout name, and upload again.

---
# Avoiding Duplicate Transactions

Duplicate expenses can occur when:
- A card is removed and re-added with overlapping transaction start dates.
- A personal card is also imported as a company card.

**Fix it:**
- Delete the duplicate card (unsubmitted expenses from that card will be removed).
- Ensure cards are only assigned/imported once.

---
# Best Practices for Reliable Card Connections

If you're looking for the most reliable way to import company card expenses, consider these options:

- **Expensify Visa® Commercial Card**  
  Our most stable option, with real-time importing, built-in compliance tools, and cashback on eligible purchases.

- **Commercial Card Feed**  
  A strong choice for company-issued Visa, Mastercard, or American Express cards. These feeds are managed between your bank and Expensify for consistent daily imports.

- **Direct Bank Connection**  
  The most common connection method for company cards. These connections typically work well and support a wide range of banks. Occasionally, a bank’s login or security updates may require you to refresh the connection.

- **CSV Import**  
  A quick and flexible alternative when needed — just upload a spreadsheet of card transactions to keep your reports complete and up to date.

## For American Express Business accounts:
- Connect using the **Primary/Basic account holder** credentials.
- Assign cards during the connection session.
- If using multiple programs, connect **ALL programs at once**.

If you still experience issues with your company card connection, contact Expensify Concierge for additional support.

---
# FAQ

## What's the most reliable way to import company card transactions?
Commercial Card Feeds and the Expensify Visa® Commercial Card offer the most stable importing experience. Commercial Card feeds are not dependent on your bank login so they don’t require the same level of maintenance. 

## Can I still use CSV if my card feed breaks?
Yes! CSV import is always available as a backup to keep your reports up to date.

However, if the bank connection later re-establishes, you may see duplicate transactions. If the card connection appears broken and isn’t related to a login change or bank update, reach out to Concierge — we can help recommend the best solution for your setup.

## Should I check my feed daily?
No need to check your feed every day — a quick review every so often using the Reconciliation Dashboard is usually enough to confirm everything’s running smoothly.

## What if my card was reissued with a new number?
You should remove the old card, but only after all unsubmitted expenses have been submitted. Once that’s done, you can import the new card and assign it to the correct cardholder.

## Who should manage company cards?
Only Domain Admins should connect and manage company cards in Expensify.  
Cardholders should not import their own cards under their personal settings -- this can lead to duplicate expenses, broken connections, or mismatched reporting.

