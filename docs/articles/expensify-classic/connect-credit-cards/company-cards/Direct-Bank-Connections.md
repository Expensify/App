---
title: Set Up Direct Bank Connections
description: Connect your company cards in Expensify to bring all team member card expenses into their Expensify accounts and manage card transactions and out-of-pocket expenses in one place.
---

{% include info.html %}
This process must be completed by a Domain Admin. 
{% include end-info.html %}

If your company uses a card program with one of our Approved! Banking Partners, you can easily connect the card feed to Expensify via login credentials. Connecting company cards is a great way to bring all team members’ card expenses into their accounts and conveniently manage card transactions and out-of-pocket expenses in one place. Keeping things organized has never been easier!

# Connect company cards using a direct bank connection

1. Hover over **Settings** and click **Domains**.
2. Select the desired domain.
3. Click **Import Card**. 

![Expensify domain cards](https://help.expensify.com/assets/images/ExpensifyHelp_DomainCards.png){:width="100%"}
{:start="4"}

4. Select your card issuer and enter the mster administrative login credentials.
5. Set a start date from which expenses will appear in the cardholers' accounts.

You can now assign company cards.

# Assign company cards

To assign each company card to its respective cardholder,

1. Hover over **Settings** and click **Domains**.
2. Select the desired domain.
3. If you have more than one card feed, select the correct feed in the dropdown list. 

![Expensify domain card list](https://help.expensify.com/assets/images/ExpensifyHelp_DomainCardsList.png){:width="100%"}
{:start="4"}

4. Click **Assign New Cards**.

![Expensify assign cards](https://help.expensify.com/assets/images/ExpensifyHelp_AssignCardBtn.png){:width="100%"}
{:start="5"}

5. Enter the employee's email address and/or select it from the dropdown list. 

![Expensify domain assign card form](https://help.expensify.com/assets/images/ExpensifyHelp_AssignCardForm.png){:width="100%"}
{:start="6"}

6. Enter the last four digits of the card number and/or select it from the dropdown list.
   - If no transactions have been posted on the card, the card number will not appear in the list and you'll need to enter the full card number into the field. Then press ENTER on your keyboard. The field may clear itself after you press ENTER. 

7. (Optional) Set the transaction start date. Any transactions that were posted before this date will not be imported into Expensify. If you do not make a selection, it will default to the earliest available transactions from the card. *Note: Expensify can only import data for the time period released by the bank. Most banks only provide a certain amount of historical data, averaging 30-90 days into the past. It's not possible to override the start date the bank has provided via this tool.*

8. Click **Assign**.

Once assigned, you will see each cardholder associated with their card and the start date listed.

![Expensify domain assigned cards](https://help.expensify.com/assets/images/ExpensifyHelp_AssignedCard.png){:width="100%"}

## Unassign company cards

{% include faq-begin.md %}
Unassigning a company card will delete any Open or Unreported expenses in the cardholder's account. To avoid this, users should submit these expenses before their cards are unassigned.
{% include faq-end.md %}

To unassign a card, click the **Actions** button to the right of the card and select **Unassign**.

![Expensify domain unassign cards](https://help.expensify.com/assets/images/ExpensifyHelp_UnassignCard.png){:width="100%"}

To completely remove the card connection, unassign every card from the list and then refresh the page.

*Note: If expenses are Processing and then rejected, they will also be deleted when they're returned to an Open state, as the card they're linked to no longer exists.*
 
# Configure card settings

If you're using a connected accounting system such as NetSuite, Xero, Sage Intacct, Quickbooks Desktop, or QuickBooks Online, you can set the card to export to a specific credit card general ledger (GL) account.

1. Hover over **Settings** and click **Domains**.
2. Select the desired domain.
3. Click **Edit Exports** near the to right and select the GL account you want to export expenses to. Exported expenses will now be mapped to the specific account selected when exported by a Domain Admin.

![Expensify domain cards settings](https://help.expensify.com/assets/images/ExpensifyHelp_UnassignCard-1.png){:width="100%"}
{:start="4"}

4. To see additional settings, click the **Settings** tab at the top of the section.

{% include faq-begin.md %}

**When I connect multiple card programs to the same domain, the previously connected card gets disconnected.**

If you need to connect a separate card program from the same bank (that's accessed via a different set of login credentials), when you try to import it by clicking **Import Card/Bank**, the connection to your previous card will be disconnected. 

To fix this, you must contact your bank and request to combine all of your cards under a single login. This allows you to connect all of your cards from that bank to Expensify using a single login. 

**How can I connect and manage my company’s cards centrally if I’m not a domain admin?**

If you can't access Domains, you must request Domain Admin access from an existing Domain Admin (usually the Workspace Owner).
 
**Are direct bank connections the best option for connecting credit cards to Expensify?**

Yes, if Expensify offers a connection with your bank. However, if you want enhanced stability and additional functionality, a commercial card feed directly from your bank is a good option, or you can get the Expensify Card.

**My card feed is set up. Why is a specific card not coming up when I try to assign it to an employee?**

Cards will appear in the dropdown once they're activated and have at least one posted transaction. If the card is activated and has been used for a while and you're still not seeing it, contact your Account Manager or message Concierge for further assistance.

**Is there a fee for utilizing direct card connections?**

No, direct card connections come at no extra cost.

**What is the difference between commercial card feeds and direct bank connections?**

- The direct bank connection is a connection set up with your login credentials for that account. This can be done without the assistance of your bank or Expensify.
- The Commercial Card feed is set up by your bank requesting that Visa/MasterCard/Amex send a daily transaction feed to Expensify. This option may be more stable and reliable. 

**What if my bank uses a card program that isn't with one of Expensify's Approved! Banking partners?**

The Approved! Banking Partners include: 
- Bank of America
- Citibank
- Capital One
- Chase
- Wells Fargo 
- Amex
- Stripe
- Brex

If your company uses a Commercial Card program that isn’t with one of our Approved! Banking Partners (which supports connecting the feed via login credentials), the best way to import your company cards is by setting up a direct Commercial Card feed between Expensify and your bank. 

**Why do direct bank connections break?**

Banks often make changes to safeguard your confidential information. And when they do, we have to update the connection between Expensify and the bank. We have a team of engineers who work closely with banks to monitor this and update our software accordingly. 

**How do I resolve errors while trying to import my card?**

You'll want to ensure that you're importing your card in the correct location in Expensify and selecting the proper bank connection. For company cards, 

1. Hover over **Settings** and click **Domains**.
2. Select the desired domain.
3. Click **Import Card**.
4. Use the master administrative credentials to import your set of cards.

**Why is my card connection broken after it was working just fine?**

Check for any changes to your bank information. 
- Have you recently changed your banking password without updating it in Expensify?
- Has your banking username or card number been updated?
- Did you edit your security questions for your bank?
- Additionally, if your security questions have changed or their answers aren't saved in Expensify. In that case, we won't be able to access your account list.

If you've answered "yes" to any of these questions, you'll need to update this information in Expensify and manually re-establish the connection. Expensify cannot automatically update this information for you.

A Domain Admin can fix the connection by completing the following steps:
1. Hover over **Settings** and click **Domains**.
2. Select the desired domain.
3. To the right of the company card, click **Fix**.
4. Enter the new credentials/updated information.

This should reestablish the connection. If you are still experiencing issues with the card connection, search for company card troubleshooting or contact Expensify Support for help.

{% include faq-end.md %}
