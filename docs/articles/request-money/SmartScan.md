---
title: Smart Scan
description: SmartScan is the time-saving tool that every Expensify user needs. Using SmartScan, you can quickly upload receipts and walk away to take care of more important things.
---
<!-- The lines above are required by Jekyll to process the .md file -->
# About
SmartScan is the time-saving tool that every Expensify user needs. Using SmartScan, you can quickly upload receipts and walk away to take care of more important things. Behind the scenes, SmartScan will process the expense data from your receipt and create an expense or automatically attach the receipt to a matching imported credit card expense.

## What is SmartScan?

SmartScan is simple on the outside and complex on the inside. When you SmartScan a receipt, we’ll read the **Merchant**, **Date** and **Amount** of the transaction, create an expense, and add it to your Expensify account automatically. If you have a credit card connected and you upload a receipt that matches a card expense, the SmartScanned receipt will automatically merge with the imported expense instead!
- Expensify accounts come with 25 free SmartScans per month. If you’re an individual user and you need access to unlimited SmartScans, check out the [Monthly Subscription](https://community.expensify.com/discussion/5535/deep-dive-the-monthly-subscription-is-it-right-for-me)!
- If your organization is already using Expensify and you belong to a company policy, you’ll have access to unlimited SmartScans by default.

### How SmartScan Works:

While you're enjoying your coffee, thinking about what to pack or waiting for your package, we’ll scan the information from the receipt without any more input necessary from you.

1. First it uses **“optical character recognition” (OCR)** on receipt images to extract the text from the image.
2. Then it analyzes that text to determine what portions correspond to the **merchant name**, **amount**, **[currency](https://community.expensify.com/discussion/5743/deep-dive-currency-in-expensify-overview/)**, and **date** of the purchase. If it can't detect a specific currency symbol, it will default to the currency based on your current location. You can also write one in by hand if it's not noted!
3. Finally, SmartScan consults your list of existing expenses to see if the newly processed receipt image corresponds to a purchase that has already been imported via a credit card connection or CSV spreadsheet. We will then merge these transactions. **Different currencies?** No problem. We'll still match 'em.

If our OCR technology can't read the receipt, we will make sure it's flagged for human review by one of our secure technicians. At the end of the day, nothing beats the human eye for ultimate quality.

# How-to

## Use Smartscan to create expenses

You can SmartScan receipts from a variety of sources to quickly and easily create expenses.

### SmartScan physical receipts with the Expensify mobile app
- Open Expensify app and use the big green camera button to snap a photo. Use 3D touch to make it even faster!
- Tap "Add details" to add a description if you want to, or select a custom category or tag.
- Put your phone back in your pocket and forget about the receipt entirely.
- Toss your receipt in the trash... Or burn it! We’ll take over from here!

### SmartScan digital or emailed receipts by emailing them to receipts@expensify.com

### SmartScan a web receipt with the [Expensify Chrome Extension](https://community.expensify.com/discussion/4680/how-to-download-and-use-the-chrome-extension)

SmartScan runs in the background, so there’s no need to keep the app open. Most SmartScans complete within one hour, but it can take a bit longer—so don't worry! If we need more information from you, you’ll get a message from Concierge letting you know!

## Email Receipts to Expensify

All receipts in your email inbox, such as airline, rental car, hotel confirmations, online purchases, etc... can be added to your Expensify account simply by forwarding them to receipts@expensify.com. These email receipts will be SmartScanned and an expense will be created for you automatically in Expensify.

### How to create an expense from a receipt email in your Expensify account:

- Directly forward the email to receipts@expensify.com from the email address associated with your Expensify account.
- Expensify will immediately SmartScan the receipt email.
- You can then find the expense on the Expenses page, either listed under the date of the receipt (if the SmartScan has completed) or under the date that you forwarded the receipt (if the SmartScan has not completed extracting information from the receipt yet).

### How to create an expense in Expensify with a receipt email from an email address that is different from your Expensify login:

- You'll want to add this email address as a secondary login to your Expensify account. This way we associate any email receipts sent from this email to receipts@expensify.com and add them to the correct Expensify account.
- Once the email address has been added as a secondary login, simply follow the steps above and forward these receipt emails to receipts@expensify.com.

Pro tip: Expensify offer receipt integrations with popular apps such as Uber and Lyft where receipts are automatically imported into your account.

## How-to: Email Receipts as a Copilot

Because emailing receipts to receipts@expensify.com sends the receipts directly to the account tied to the senders email, there is an additional step you need to take when sending receipts as a copilot.

1. Click forward on the email and address it to receipts@expensify.com
2. Add the email address of the user whose account you want the receipts to go to in the subject line
3. Click Send

As long as you are a Copilot for this user, the receipts will be placed in their account and can be found on the Expenses page.

### Can the Copilot's Secondary Logins be used to forward receipts?
Yes! A Copilot can use any of the email addresses tied to their account to forward receipts into the account of the person they're assisting.

# FAQ

## How do I get unlimited SmartScans?

If you belong to your company’s policy, you have unlimited SmartScans automatically. However, if you’re an individual user, purchase the Monthly Subscription to gain access to limitless SmartScans.

## How can I SmartScan multiple receipts as quickly as possible?

You can enable Rapid Fire of receipts by tapping the camera icon in the bottom right-hand corner of the screen when taking a picture of your receipts. With Rapid Fire enabled, you can snap away without ever being taken out of the camera to code your receipts.

## SmartScanned receipts and credit card's currency are different. Will they still match?

Yep! As long as the currency is clear, SmartScan is smart enough to convert to the proper currency (indicated by your policy or your account settings) and merge with the incoming credit card transaction.

## Will an eReceipt merge with a SmartScan or emailed receipt?

Yes! SmartScanned receipts will still merge with and override their eReceipt counterparts.

## Will Duplicate Detection flag the same receipt even if I accidentally SmartScan it much later?

[Duplicate Detection](https://community.expensify.com/discussion/5644/deep-dive-duplicate-detection-what-is-it-and-how-it-works/p1?new=1) will look at all expenses in a single user’s Expensify account regardless of the date it is uploaded. As long as the date and amount match, then we will show a duplicate.

## Why did Concierge reach out about my SmartScan?

When Concierge reaches out it means that your receipt was most likely missing one or more of these: merchant name, purchase date, or total amount. SmartScan requires these three data points to be present because it’s the only way to ensure it’s a traceable, legitimate receipt.

Want to know more about Concierge? Meet our friendly AI bot [here](https://community.expensify.com/discussion/5515/deep-dive-meet-concierge/p1?new=1)!

## Can I disable SmartScan?

For users on Track, Submit and Collect policies, you can disable SmartScan in your account settings.

1. Disabling SmartScan
2. Log into your account using your preferred web browser,
3. Head to your Settings > Your Account > Preferences > SmartScanning page,
4. Click the green toggle to disable the feature.

Please note: SmartScan is enabled for all Control plan policies to facilitate the Concierge Receipt Audit feature. You cannot disable SmartScan when defaulted to a Control policy.
