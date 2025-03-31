---
title: Approve Expenses
description: Approve, hold, and unapprove submitted expenses
---
<div id="new-expensify" markdown="1">

Expenses can be created through manual entry, tracking distance, or scanning a receipt. They can be submitted to an individual or a workspace. 

This [help article](https://help.expensify.com/articles/new-expensify/expenses-and-payments/Create-an-expense) has more details about creating and submitting an expense to an individual or a workspace. 

# Receiving an expense from an Individual

When an expense is submitted to an individual, it doesn’t need approval. It only needs to be paid. 

This [help article](https://help.expensify.com/articles/new-expensify/expenses-and-payments/Pay-an-expense) has the steps to pay the expense. 

# Receiving a workspace expense

When an expense is submitted to a workspace with an **approval workflow**, it must be approved before it can be paid.

A workspace admin can set an [approval workflow](https://help.expensify.com/articles/new-expensify/workspaces/Add-approvals) in the workspace settings. For each expense report, there will be an option to: 

- **Approve:** Click Approve if you’re satisfied with the expense details.
- **Hold the expense:** If you need to delay a payment or provide more information before approval, you can hold an expense.
- **Unapprove the expense:** You can return the expense to the submitter for revisions.

# Approve workspace expenses

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop or WebApp" %}
1. When an expense is submitted, the approver will receive an email and in-app notification with the details of the expense.
2. Click the expense in the email to be directed to New Expensify, where you can review it.
3. Click on the expense to view the receipt, amount, description, and additional details the submitter provides.
4. Click **Approve**.
5. When you are ready to pay the expense, follow the steps in this [help article](https://help.expensify.com/articles/new-expensify/expenses-and-payments/Pay-an-expense).
{% include end-option.html %}

{% include option.html value="mobile" %}
1. When an expense is submitted, you will receive a text message and in-app notification with its details.
2. Tap on the expense in the text or notification to be directed to New Expensify, where you can review it.
3. Tap on the expense to view the receipt, amount, description, and any additional details the submitter provides.
4. Tap **Approve**.
{% include end-option.html %}

{% include end-selector.html %}

{% include info.html %}
If the transaction is pending, common for recent Expensify Card transactions or SmartScanning expenses, you’ll need to wait until the transaction posts before approving it. 
{% include end-info.html %}


# Hold a workspace expense

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Locate the expense on the **Search** page.
2. Click **View**.
3. Click the drop-down arrow at the top of the expense.
4. Click the **Hold** button.
5. Enter a reason for the delay. The reason for the hold will be added to the expense report.

<p style="padding-bottom:0">&nbsp;</p>

When you’re ready to remove the hold,

1. Locate the expense on the Search page.
2. Click **View**.
3. Click the drop-down arrow at the top of the expense.
4. Select **Unhold**.
5. Complete the steps above to “Approve expenses.” Once the expense has been approved, you can pay it.
{% include end-option.html %}

{% include option.html value="mobile" %}
1. Locate the expense on the **Search** page.
2. Tap **View**.
3. Tap the drop-down arrow at the top of the expense.
4. Select the **Hold** button.
5. Enter a reason for the delay. The reason for the hold will be added to the expense report.

<p style="padding-bottom:0">&nbsp;</p>

When you’re ready to remove the hold,

1. Tap **Search** and select the expense.
2. Tap the drop-down arrow at the top of the expense.
3. Select **Unhold**.
4. Complete the steps above to “Approve expenses.” Once the expense has been approved, you can pay it. 
{% include end-option.html %}

{% include end-selector.html %}

![Use Search to find an expense]({{site.url}}/assets/images/search-hold-01.png){:width="100%"}
![Click on top of expense]({{site.url}}/assets/images/search-hold-02.png){:width="100%"}
![Click Hold]({{site.url}}/assets/images/search-hold-03.png){:width="100%"}
![Click Unhold]({{site.url}}/assets/images/search-hold-04.png){:width="100%"}
![Click Approve]({{site.url}}/assets/images/search-hold-05.png){:width="100%"}

{% include info.html %}
Held expenses will not be available for payment until they have been approved.
{% include end-info.html %}

# Unapprove a workspace expense

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Locate the expense on the **Search** page.
2. Click **View**.
3. Click the drop-down arrow at the top of the report
4. Click **Unapprove**.
5. The submitter will receive an email and in-app notification that the expense has been unapproved.
6. An unapproved expense can be deleted by clicking the drop-down arrow at the top of the expense. 
{% include end-option.html %}

{% include option.html value="mobile" %}
1. Locate the expense on the **Search** page.
2. Tap **View**.
3. Tap the drop-down arrow at the top of the expense.
4. Tap **Unapprove**.
5. The submitter will receive a text and in-app notification that the expense has been unapproved.
6. An unapproved expense can be deleted by clicking the drop-down arrow at the top of the expense.
{% include end-option.html %}

{% include end-selector.html %}

Reports that have been paid cannot be unapproved. 

If the approved expense has already been exported to an accounting package, you’ll see a warning that unapproving an expense can cause data discrepancies and Expensify Card reconciliation issues. Ideally, you’ll want to delete the data already exported to the accounting package before approving the expense again.

{% include faq-begin.md %}

**Why is an employee expense showing as pending?**

An Expensify Card expense will show as pending if the merchant hasn’t posted it. This is usually the case with hotel holds, or card rental holds. A hold will normally last no more than 7-10 business days unless it’s a hotel hold, which can last 31 days. 

**What are expense reports?**

In Expensify, expense reports group expenses in a batch to be paid or reconciled. When a draft report is open, all new expenses are added to it. 

Once a report is submitted, you can track the status from the **Search** section. Click the **View** button for a specific expense or expense report. The status is displayed at the top of the expense or report.
{% include faq-end.md %}

</div>
