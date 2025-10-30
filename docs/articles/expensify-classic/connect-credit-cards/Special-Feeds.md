---
title: Special Feeds
description: Learn how to set up special bank feeds in Expensify, including supported formats, HR integrations for card auto-assignment, and specific instructions for ANZ and Brex feeds.
keywords: [Expensify Classic, special feeds, bank feeds, HR integration, card auto-assignment, ANZ Visa, Brex CDF, Citi feeds, HSBC feeds, Airplus, Diners Club, Stripe feed]
---
<div id="expensify-classic" markdown="1">

Expensify supports a range of standard card feeds, as well as special file formats that require additional setup. Some feeds can also integrate with HR data to simplify card assignment.

# Supported Special Feeds

Expensify supports the following feeds in addition to standard Visa, Mastercard, and Amex feeds:

- Airplus CDF  
- ANZ VCF  
- ANZ New Zealand FAV  
- AOC Solutions / Key Bank CDF - Key2Purchase  
- Key Bank - Key2Business  
- BMO CDF  
- Brex CDF  
- Citi (MasterCard) CDF  
- Citi (Visa) VCF  
- Citi CCF Feed  
- Citi CGI Feed  
- CSI Global VCard  
- Diners Club SDF  
- Diners Club DCF  
- HSBC (Visa) VCF  
- HSBC (MasterCard) CDF  
- SEB Kort EuroCard (CDF)  
- Stripe Feed  
- UBS VCF  
- UBT TSV  
- NBSA / INTECOMS VCF  
- WEX CDF  

Each feed may require coordination with your bank representative and setup from Expensify’s engineering team. Some feeds can take more than a month to enable, so plan this as a project with your Account Manager.

# HR Integrations and Card Auto-assignment

If you use an HR system integrated with Expensify via the [API](https://integrations.expensify.com/Integration-Server/doc/#introduction), and your bank feed supports Employee ID data, Expensify can help with automatic card assignment.

## How it works
1. Push your employee data into Expensify, including Employee ID, via the API.  
2. Expensify’s banking engineers set up a custom routine.  
3. Your bank includes Employee ID in the data file.  
4. When a new card is added, Expensify matches the Employee ID to the user and assigns the card.  

**Note:** This requires the Expensify API’s [Advanced Employee Updater](https://integrations.expensify.com/Integration-Server/doc/employeeUpdater/). It is not possible to set up a routine using manual CSV imports.

Talk to your Account Manager to set up card auto-assignment. This process requires coordination and testing, and is best handled as part of a broader HR integration project.

# ANZ Visa (New Zealand)

You can request a feed from your ANZ Internet Banking portal or ANZ Direct Online.

## Connect via ANZ Internet Banking
1. Log in to the ANZ Internet Banking portal.  
2. Go to **Your Settings > Manage bank feeds**.  
3. Select **Expensify**.  
4. Complete and submit the Internet Banking Data Authority form (or the ANZ Direct Online authority form).  

## Connect via ANZ Direct Online
1. Log in to ANZ Direct Online with your ANZ credentials.  
2. Complete the ANZ Direct Online authority form by creating a batch and submitting the Expensify Accounts Disclosure Authority secure mail template form.  

Once submitted, ANZ will set up the feed and send the details directly to Expensify. Expensify will then add the card feed to your Expensify account and notify you when it is active.

# Brex CDF

To enable a Brex feed, your Brex Customer Success Manager must arrange for data delivery to Expensify.

1. Ask your Expensify Account Manager for your **Expensify Domain ID**. Brex will use this ID in their file.  
2. Ask your Brex Customer Success Manager to send your **CDF3 (Common Data File)** to Expensify:  
   - Specify the earliest transaction date needed.  
   - Provide the Domain ID as a reference number.  
   - Brex will initiate delivery and confirm setup.  
3. Notify your Expensify Account Manager once Brex confirms setup. Your Expensify Account Manager will coordinate the final connection of the feed.  

</div>
