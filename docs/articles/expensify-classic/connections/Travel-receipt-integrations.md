---
title: Travel Receipt Integrations
description: How to use pre-built or custom integrations to track travel expenses
---

Expensify’s receipt integrations allow a merchant to upload receipts directly to a user’s Expensify account. A merchant just has to email a receipt to an Expensify user and Cc receipts@expensify.com. This automatically creates a transaction in the Expensify account for the user whose email address is in the To field.

You can set up a receipt integration by using one of our existing pre-built integrations, or by building your own receipt integration.

## Use a pre-built travel integration

You can use our pre-built integrations to automatically import travel receipts from Bolt Work, Spot Hero, Grab, and Kayak for Business.

### Bolt Work

1. In the Bolt app, tap the menu icon in the top left and tap **Work trips**.
2. Tap **Create profile**.
3. Enter the email address that you use for Expensify, then tap **Next**.
4. Enter your company details, then tap **Next**.
5. Choose a payment method. If you don’t want to use the existing payment methods, you can create a new one by tapping **Add Payment Method**. Then tap **Next**.
6. Tap **Done**. 
7. Tap Add expense provider, then tap **Expensify**. 
8. Tap **Verify**.
9. Tap the menu icon on the top left and tap **Work trips** once more.
10. Tap **Add expense provider** and select **Expensify** again. 

When booking a trip with Bolt Work, select your work trip profile as the payment method before booking. Then the receipt details will be automatically sent to Expensify. 

### SpotHero

1. In the SpotHero app, tap the menu icon in the top left and tap **Account Settings**.
2. Tap **Set up Business Profile**.
3. Tap **Create Business Profile**. 
4. Enter the email address you use for Expensify and tap **Next**.  
5. Tap **Add a Payment Method** and enter your payment account details. Then tap **Next**.
6. Tap **Expensify**.

When reserving parking with SpotHero, select your business profile in the Payment Details section. Then the receipt will be automatically sent to Expensify. In your SpotHero Business Profile settings, you can also set a weekly or monthly cadence for SpotHero to send a batch of expenses to Expensify.

### Grab

1. In the Grab app, tap your profile picture in the top left.
2. Tap your user icon again at the top of the settings menu.
3. Tap **Add a business profile**.
4. Tap Next twice, then tap **Let’s Get Started**. 
5. Enter the email address you use for Expensify and tap the next arrow in the bottom right.  
6. Check your email and copy the verification code you receive from Grab. 
7. Tap **Manage My Business Profile**.
8. Under Preferences, tap **Expense Solution**.
9. Tap **Expensify**, then tap **Save**. 

When booking a trip with Grab, tap **personal** and select **business** to ensure your business profile is selected. Then the receipt will be automatically sent to Expensify. 

### KAYAK for Business

**Admin Setup**

This process must be completed by a KAYAK for Business admin.

1. On your KAYAK for Business homepage, click **Company Settings**. 
2. Click **Connect to Expensify**.

KAYAK for Business will now forward bookings made by each employee into Expensify.

**Traveler Setup**

1. On your KAYAK for Business homepage, click **Profile Account Settings**. 
2. Enable the Expensify toggle to have your expenses automatically sent to Expensify. You also have the option to send them manually. 

## Build your own receipt integration

1. Email receiptintegration@expensify.com and include:
   - **Subject**: Use “Receipt Integration Request" as the subject line
   - **Body**: List all email addresses the merchant sends email receipts from
2. Once you receive your email confirmation (within approximately 2 weeks) that the email addresses have been whitelisted, you’ll then be able to Cc receipts@expensify.com on receipt emails to users, and transactions will be created in the users’ Expensify account.
3. Test the integration by sending a receipt email to the email address you used to create your Expensify account and Cc receipts@expensify.com. Wait for the receipt to be SmartScanned. Then you will see the merchant, date, and amount added to the transaction. 

### Using the integration

When sending an emailed receipt:

- Attachments on an email (that are not an .ics file) will be SmartScanned. We recommend including the receipt as the only attachment.
- You can only include one email address in the To field. In the Cc field, include only receipts@expensify.com. 
- Reservations for hotels and car rentals cannot be sent to Expensify as an expense because they are paid at the end of usage. You can only send transaction data for purchases that have already been made. 
- Use standardized three-letter currency codes (ISO 4217) where applicable.

{% include faq-begin.md %}

**In Trainline, what if I don’t have the option for Send to Expensify?**

This can happen if the native iOS Mail app is not installed on an Apple device. However, you can still use the native iOS Share to Expensify function for Trainline receipts.

**Why does it take 2 weeks to set up a custom integration?**

Receipt integrations require our engineers to manually set them up on the backend. For that reason, it can take up to 2 weeks to set it up.

**Is there a way to connect via API?**

No, at this time there are no API receipt integrations. All receipt integrations are managed via receipt emails.

**What is your Open API?**

Our Open API is a self-serve tool meant to pull information out of Expensify. Typically, this tool is used to build integrations with accounting solutions that we don’t directly integrate with. If you wish to push data into Expensify, the only way to integrate is via the receipt integration options listed above in this article.

**Are you able to split one email into separate receipts?**

The receipt integration is unable to automatically split one email into separate receipts. However, once the receipt is SmartScanned, users can [split the expense](https://help.expensify.com/articles/expensify-classic/expenses/Split-an-expense) in their Expensify account.

**Can we set up a (co-marketing) partnership?**

We currently do not offer any co-marketing partnerships.

**Can we announce or advertise our custom integration with Expensify?**

Absolutely! You can promote the integration across your social media channels (tag @expensify and use the #expensify hashtag) and you can even create your own dedicated landing page on your website for your integration. At a minimum, we recommend including a brief overview of how the integration works, the benefits of using it, an integration setup guide, and guidance for how someone can contact you for support or integration setup if necessary.

**How can I get help?**

You can contact Concierge for ongoing support any time by clicking the green chat icon in the mobile or web app, or by emailing concierge@expensify.com. Concierge is a global team of highly trained product specialists focused on making our product as easy to use as possible and answering all your questions. 

{% include faq-end.md %}
