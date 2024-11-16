---
title: Assign Company Cards
description: How to assign company cards to employees in Expensify once they have been connected or imported
---

After connecting or importing your company cards to Expensify, you can assign each card to its respective cardholder. 

# Assign new cards 

If you're assigning cards via CSV upload for the first time,

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain.
3. Click the card dropdown menu and select the desired feed from the list.
![Click the dropdown located right below the Imported Cards title near the top of the page. Then select a card from the list.](https://help.expensify.com/assets/images/csv-03.png){:width="100%"}
{:start="4"}

4. Click **Assign New Cards**. 

![Under the Company Cards tab on the left, you'll use the dropdown menu to select a card and beneath that, you'll click Assign New Cards]({{site.url}}/assets/images/CompanyCards_Assign.png){:width="100%"}
{:start="5"}

5. Enter the employee's email address and/or select it from the dropdown list. *Note: Employees must have an email address under this domain in order to assign a card to them.*
![Below the Assign a Card header, enter or select the employee's email address]({{site.url}}/assets/images/CompanyCards_EmailAssign.png){:width="100%"}
{:start="6"}

6. Enter the last four digits of the card number and/or select it from the dropdown list.
   - If no transactions have been posted on the card, the card number will not appear in the list and you'll need to enter the full card number into the field. Then press ENTER on your keyboard. The field may clear itself after you press ENTER, but you can disregard this and continue to the next step.
7. (Optional) Set the transaction start date. Any transactions that were posted before this date will not be imported into Expensify. If you do not make a selection, it will default to the earliest available transactions from the card. *Note: Expensify can only import data for the time period released by the bank. Most banks only provide a certain amount of historical data, averaging 30-90 days into the past. It's not possible to override the start date the bank has provided via this tool.*
8. Click **Assign**.

Once assigned, you will see each cardholder associated with their card and the start date listed. The transactions will now be imported to the cardholder's account, where they can add receipts, code the expenses, and submit them for review and approval.

![Expensify domain assigned cards](https://help.expensify.com/assets/images/ExpensifyHelp_AssignedCard.png){:width="100%"}

# Upload new expenses for existing assigned cards

To add new expenses to an existing uploaded and assigned card,

1. Hover over **Settings** and click **Domains**. 
2. Select the desired domain name.
3. Click **Manage/Import CSV**.
![Click Manage/Import CSV located in the top right between the Issue Virtual Card button and the Import Card button.](https://help.expensify.com/assets/images/csv-02.png){:width="100%"}
{:start="4"}
4. Select the saved layout from the drop-down list.
5. Click **Upload CSV**.
6. Click **Update All Cards** to retrieve the new expenses for the assigned cards.

# Unassign company cards

{% include info.html %}
Unassigning a company card will delete any unsubmitted (Open or Unreported) expenses in the cardholder's account.
{% include end-info.html %}

To unassign a specific card, click the Actions button to the right of the card and click **Unassign**.

![Click the Actions button to the right of the card and select Unassign.]({{site.url}}/assets/images/CompanyCards_Unassign.png){:width="100%"}

To completely remove the card connection, unassign every card from the list and then refresh the page.

*Note: If expenses are Processing and then rejected, they will also be deleted when they're returned to an Open state, as the card they're linked to no longer exists.*

{% include faq-begin.md %}

**My Commercial Card Feed is set up. Why is a specific card not coming up when I try to assign it to an employee?**

Cards will appear in the dropdown when they are activated and have at least one posted transaction. If the card is activated and has been used for a while and you're still not seeing it, reach out to your Account Manager or message concierge@expensify.com for further assistance.

{% include faq-end.md %}
