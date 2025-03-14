---
title: Troubleshooting Company Cards
description: Learn how to troubleshoot company card issues in Expensify, including fixing connection errors, resolving missing transactions, and troubleshooting CSV imports.
keywords: [Expensify Classic, company card troubleshooting, card errors]
---
<div id="expensify-classic" markdown="1">

This guide provides solutions to common issues encountered when connecting, importing, and managing company credit cards in Expensify. It covers troubleshooting steps for failed connections, missing transactions, CSV import errors, and duplicate expenses, helping you resolve issues efficiently and ensure a seamless experience.

---
# Commercial Card Feeds

## Is there a fee for using Commercial Card Feeds?
No, Commercial Card Feeds are included in Corporate Workspace pricing.

## How do Commercial Card Feeds differ from direct bank connections?
- **Direct Bank Connection:** Uses login credentials to sync transactions. No bank or Expensify assistance is required.
- **Commercial Card Feed:** Your bank requests Visa, MasterCard, or Amex to send a daily transaction feed to Expensify. This requires bank and Expensify support to set up but offers enhanced stability.

## Will changing my bank password affect my Commercial Card Feed?
No, Commercial Card Feeds remain active even if you update your bank login credentials.

## Why did my Commercial Card Feed stop working?
If transactions are not appearing, contact your bank to confirm that the feed is still active and is successfully sending data to Expensify. You may also need to refresh your feed in **Settings** > **Domains** > **Company Cards** > **Update All Cards**.

---
# Direct Bank Connections

## Is there a fee for using Direct Bank Connections?
No, direct card connections are free.

## Why did my direct bank connection break?
Check for recent changes:
- Bank password update?
- Banking username or card number changed?
- Security questions edited?

If any of these apply, update your details in Expensify:
1. Go to **Settings** > **Domains**.
2. Select the domain.
3. Click **Fix** next to the company card.
4. Enter updated credentials.

---
# Missing Transactions
Try these troubleshooting steps:
1. **Wait**: Bank transactions may take up to 24 hours to appear.
2. **Update Company Cards**: Go to **Settings** > **Domains** > **Company Cards**, then click **Update**.
3. **Reconcile Cards**: Use the [Reconciliation Dashboard](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Reconciliation).
4. **Contact Expensify Support**: Provide transaction details if issues persist.

---
# Troubleshooting Connection Errors

## Error: Too many attempts
Wait 24 hours before retrying.

## Error: Invalid credentials/Login failed
- Confirm login works on your bank’s website.
- Check for bank outages.

## Bank-Specific Requirements:
- **Chase**: Password must be 8-32 characters.
- **Wells Fargo**: Password must be under 14 characters.
- **SVB**: Enable **Direct Connect** and use Direct Connect PIN.

## Error: Account Setup
Check for pending actions in your bank’s online portal before reconnecting.

## Error: Direct Connect Not Enabled
Enable Direct Connect via your bank before attempting to import the card.

## Error: Account Not Found/Card Number Changed
If issued a new card, remove the old card and re-import using the new number.

## Error: General Connection Issue
The bank may be under maintenance. Check the [Expensify status page](https://status.expensify.com/).

---
# CSV Import Issues

## Error: "Attribute value mapping is missing"
**Cause:** The spreadsheet may be missing key details such as card number, date, merchant, amount, or currency.

**Fix:**
1. Close the mapping window.
2. Check for missing details.
3. Add the missing information to the spreadsheet.
4. Upload the revised spreadsheet via **Manage Spreadsheet**.
5. Enter a **Company Card Layout Name**.
6. Click **Upload CSV**.

## Error: "We've detected an error while processing your spreadsheet feed"
**Cause:** General upload issue.

**Fix:**
1. Go to **Settings** > **Domains** > Select your domain.
2. Click **Manage/Import CSV**.
3. Check if the layout name exists in the "Upload Company Card transactions for" dropdown:
   - If listed, wait an hour and sync the cards.
   - If not, create a new layout and re-upload the spreadsheet.

## Error: "An unexpected error occurred, and we could not retrieve the list of cards"
**Cause:** Upload failure.

**Fix:** Follow the same steps as the previous error.

## CSV Import Shows No New Data
If a new parameter was added to the spreadsheet but doesn't appear in Expensify:
1. Navigate to **Settings** > **Domains** > Select your domain.
2. Click **Manage/Import CSV**.
3. Select the saved layout and upload the revised spreadsheet.
4. Compare the **Output Preview** row count with the revised spreadsheet.
   - If they don’t match, follow CSV formatting guidelines, save with a new layout name, and re-upload.

---
# Avoiding Duplicate Transactions
Duplicate expenses can occur if:
- A card was unassigned/reassigned with an overlapping start date.
- A personal credit card was also imported as a company card.

**To fix this:**
- Delete the duplicate card (unsubmitted expenses from that card will be removed).
- Ensure expenses are assigned only once.

---
# Best Practices for Reliable Connections
For the most stable connection, consider:
- **Expensify Visa® Commercial Card** for real-time compliance and cashback.
- **Commercial Card Feeds** for bank-managed stability.
- **Direct Bank Connection** if supported by Expensify.

## For American Express Business accounts:
- Use **Primary/Basic account holder** credentials.
- Assign cards during the connection session.
- If using multiple programs, connect **ALL programs** at once.

If you still experience issues with your company card connection, contact Expensify Concierge for additional support.

</div>
