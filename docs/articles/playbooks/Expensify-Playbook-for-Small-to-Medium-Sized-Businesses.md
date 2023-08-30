---
title: Expensify Playbook for Small to Medium-Sized Businesses
description: Best practices for how to deploy Expensify for your business
---
## Overview
This guide provides practical tips and recommendations for small businesses with 100 to 250 employees to effectively use Expensify to improve spend visibility, facilitate employee reimbursements, and reduce the risk of fraudulent expenses.

- See our [US-based VC-Backed Startups](https://help.expensify.com/articles/playbooks/Expensify-Playbook-for-US-based-VC-Backed-Startups) if you are more concerned with top-line revenue growth

## Who you are
As a small to medium-sized business owner, your main aim is to achieve success and grow your business. To achieve your goals, it is crucial that you make worthwhile investments in both your workforce and your business processes. This means providing your employees with the resources they need to generate revenue effectively, while also adopting measures to guarantee that expenses are compliant.

## Step-by-step instructions for setting up Expensify
This playbook is built on best practices we’ve developed after processing expenses for tens of thousands of companies around the world. As such, use this playbook as your starting point, knowing that you can customize Expensify to suit your business needs. Every company is different, and your dedicated Setup Specialist is always one chat away with any questions you may have.

### Step 1: Create your Expensify account
If you don't already have one, go to *[new.expensify.com](https://new.expensify.com)* and sign up for an account with your work email address. The account is free so don’t worry about the cost at this stage.

> _Employees really appreciate how easy it is to use, and the fact that the reimbursement drops right into their bank account. Since most employees are submitting expenses from their phones, the ease of use of the app is critical_
>
> **Robyn Gresham**  
> Senior Accounting Systems Manager at SunCommon

### Step 2: Create a Control Policy
There are three policy types, but for your small business needs we recommend the *Control Plan* for the following reasons:

- *The Control Plan* is designed for organizations with a high volume of employee expense submissions, who also rely on compliance controls
- The ease of use and mobile-first design of the Control plan can increase employee adoption and participation, leading to better expense tracking and management.
- The plan integrates with a variety of tools, including accounting software and payroll systems, providing a seamless and integrated experience
- Accounting integrations include QuickBooks Online, Xero, NetSuite, and Sage Intacct, with indirect support from Microsoft Dynamics and any other accounting solution you work with

We recommend creating one single policy for your US entity. This allows you to centrally manage all employees in one “group” while enforcing compliance controls and syncing with your accounting package accordingly.

To create your Control Policy:

1. Go to *Settings > Policies*
2. Select *Group* and click the button that says *New Policy*
3. Click *Select* under Control

The Control Plan also gives you access to a dedicated Setup Specialist. You can find yours by looking at your policy's *#admins* room in *[new.expensify.com](https://new.expensify.com)*, and in your company’s policy settings in the *Overview* tab, where you can chat with them and schedule an onboarding call to walk through any setup questions. The Control Plan bundled with the Expensify Card is only *$9 per user per month* (not taking into account cash back your earn) when you commit annually. That’s a 75% discount off the unbundled price point if you choose to use a different Corporate Card (or no) provider.

### Step 3: Connect your accounting system
As a small to medium-sized business, it's important to maintain proper spend management to ensure the success and stability of your organization. This requires paying close attention to your expenses, streamlining your financial processes, and making sure that your financial information is accurate, compliant, and transparent. Include best practices such as:

- Every purchase is categorized into the correct account in your chart of accounts
- Receipts are sent to the accounting package to ensure visibility across the organization and to auditors
- Every expense is accounted for and added to your accounting system on time for your monthly accounts reconciliation.

You do this by synchronizing Expensify and your accounting package as follows:

1. Click *Settings > Policies*
2. Navigate to the *Connections* tab
3. Select your accounting system
4. Follow the prompts to connect your accounting package

Check out the links below for more information on how to connect to your accounting solution:
- *[QuickBooks Online](https://community.expensify.com/discussion/4833/how-to-connect-your-policy-to-quickbooks-online)*
- *[Xero](https://community.expensify.com/discussion/5282/how-to-connect-your-policy-to-xero)*
- *[NetSuite](https://community.expensify.com/discussion/5212/how-to-connect-your-policy-to-netsuite-token-based-authentication)*
- *[Sage Intacct](https://community.expensify.com/discussion/4777/how-to-connect-to-sage-intacct-user-based-permissions-expense-reports)*
- *[Other Accounting System](https://community.expensify.com/discussion/5271/how-to-set-up-an-indirect-accounting-integration)


*“Employees really appreciate how easy it is to use, and the fact that the reimbursement drops right into their bank account. Since most employees are submitting expenses from their phones, the ease of use of the app is critical.”*
- Robyn Gresham, Senior Accounting Systems Manager at SunCommon

### Step 4: Set category-specific compliance controls
Head over to the *Categories* tab to set compliance controls on your newly imported list of categories. More specifically, we recommend the following:

1. First, enable *People Must Categorize Expenses*. Employees must select a category for each expense, otherwise, in most cases, it’s more work on you and our accounting connections will simply reject any attempt to export.
2. For more high-risk, travel-related categories, we recommend setting more strict compliance controls. For example, “Meals & Entertainment” should be set with the following:
      - Receipts Required
      - Descriptions Required, with Description Hints set
            - Travel: “What is the business purpose of this expense?”
            - Meals: “Could you share the business purpose, and tag attendees?”
            - Entertainment: “Could you share the business purpose, and tag attendees?”  
3. Disable any irrelevant expense categories that aren’t associated with employee spend
4. Configure *auto-categorization*, located just below your category list in the same tab. The section is titled *Default Categories*. Just find the right category, and match it with the presented category groups to allow for MCC (merchant category code) automated category selection with every imported connected card transaction.  

### Step 5: Make sure tags are required, or defaults are set
Tags in Expensify often relate to departments, projects/customers, classes, and so on. And in some cases they are *required* to be selected on every transactions. And in others, something like *departments* is a static field, meaning we could set it as an employee default and not enforce the tag selection with each expense.

*Make Tags Required*
In the tags tab in your policy settings, you’ll notice the option to enable the “Required” field. This makes it so any time an employee doesn’t assign a tag to an expense, we’ll flag a violation on it and notify both the employee and the approver. 

- *Note:* In general, we take prior selection into account, so anytime you select a tag in Expensify, we’ll pre-populate that same field for any subsequent expense. It’s completely interchangeable, and there for convenience.

*Set Tags as an Employee Default*
Separately, if your policy is connected to NetSuite or Sage Intacct, you can set departments, for example, as an employee default. All that means is we’ll apply the department (for example) that’s assigned to the employee record in your accounting package and apply that to every exported transaction, eliminating the need for the employee to have to manually select a department for each expense. 

### Step 6: Set rules for all expenses regardless of categorization
In the Expenses tab in your group Control policy, you’ll notice a *Violations* section designed to enforce top-level compliance controls that apply to every expense, for every employee in your policy. We recommend the following confiuration: 

*Max Expense Age: 90 days (or leave it blank)*
This will enable Expensify to catch employee reimbursement requests that are far too outdated for reimbursement, and present them as a violations. If you’d prefer a different time window, you can edit it accordingly

*Max Expense Amount: $2,000 (or leave it blank)*
This is essentially like setting a daily or individual expense limitation on any employee, regardless of whether the transaction is reimbursable or non-reimbursable.This rule will enables Expensify to present larger expenses with a violation to notify both the submitter and approvers.

*Receipt Required Amount: $75*
Receipts are important, and in most cases you prefer an itemized receipt. However, Expensify will generate an IRS-compliant electronic receipt (not itemized) for every expense not tied to hotels expense. For this reason, it’s important to enforce a rule where anytime an employee is on the road, and making business-related purchases at hotel (which happens a lot!), they are required to attach a physical receipt. 

![Expense Basics](https://help.expensify.com/assets/images/playbook-expense-basics.png){:width="100%"}

At this point, you’ve set enough compliance controls around categorical spend and general expenses for all employees, such that you can put trust in our solution to audit all expenses up front so you don’t have to. Next, let’s dive into how we can comfortably take on more automation, while relying on compliance controls to capture bad behavior (or better yet, instill best practices in our employees).

### Step 7: Set up scheduled submit
For an efficient company, we recommend setting up [Scheduled Submit](https://community.expensify.com/discussion/4476/how-to-enable-scheduled-submit-for-a-group-policy) on a *Daily* frequency:

- Click *Settings > Policies*
- From here, select your group collect policy
- Within your policy settings, select the *Reports* tab
- You’ll notice *Scheduled Submit* is located directly under *Report Basics*
- Choose *Daily*

Between Expensify's SmartScan technology, automatic categorization, and [DoubleCheck](https://community.expensify.com/discussion/5738/deep-dive-how-does-concierge-receipt-audit-work) features, your employees shouldn't need to do anything more than swipe their Expensify Card or take a photo of  their receipt.

Expenses with violations will stay behind for the employee to fix, while expenses that are “in-policy” will move into an approver’s queue to mitigate any potential for delays. Scheduled Submit will ensure all expenses are submitted automatically for approval.

![Scheduled submit](https://help.expensify.com/assets/images/playbook-scheduled-submit.png){:width="100%"}

> _We spent twice as much time and effort on expenses without getting nearly as accurate of results as with Expensify._
> 
> Kevin Valuska  
> AP/AR at Road Trippers

### Step 8: Connect your business bank account (US only)
If you’re located in the US, you can utilize Expensify’s payment processing and reimbursement features. 

*Note:* Before you begin, you’ll need the following to validate your business bank account:

1. Your bank account credentials
2. A form of ID (a driver’s license or passport)
3. Your business tax ID number, your business’ address and your website URL

Let’s walk through the process of linking your business bank account:

1. Go to *Settings > Account*, and select the *Payments* tab
2. Select *Add Verified Bank Account*
3. From here, we’ll ask you to use your online banking credentials to connect to your bank (Note that this must be the account owner or admin credentials)
- Alternatively, you can go the more manual route by selecting “Connect Manually”
4. Once that’s done, we’ll collect all of the necessary information on your business, such as your legal business name and address
5. We’ll then collect your personal information, and a photo ID to confirm your identity

You only need to do this once: you are fully set up for not only reimbursing expense reports, but issuing Expensify Cards, collecting customer invoice payments online (if applicable), as well as paying supplier bills online.

### Step 9: Invite employees and set an approval workflow
*Select an Approval Mode*
We recommend you select *Advanced Approval* as your Approval Mode to set up a middle-management layer of a approval. If you have a single layer of approval, we recommend selecting [Submit & Approve](https://community.expensify.com/discussion/5643/deep-dive-submit-and-approve). But if *Advanced Approval* if your jam, keep reading! 

*Import your employees in bulk via CSV*
Given the amount of employees you have, it’s best you import employees in bulk via CSV. You can learn more about using a CSV file to bulk upload employees with *Advanced Approval [here](https://community.expensify.com/discussion/5735/deep-dive-the-ins-and-outs-of-advanced-approval)*

![Bulk import your employees](https://help.expensify.com/assets/images/playbook-impoort-employees.png){:width="100%"}

*Manually Approve All Reports*
In most cases, at this stage, approvers prefer to review all expenses for a few reasons. 1) We want to make sure expense coding is accurate, and 2) We want to make sure there are no bad actors before we export transactions to our accounting system. 

In this case we recommend setting *Manually approve all expenses over: $0*

### Step 10: Configure Auto-Approval
Knowing you have all the control you need to review reports, we recommend configuring auto-approval for *all reports*. Why? Because you’ve already put reports through an entire approval workflow, and manually triggering reimbursement is an unnecessary action at this stage. 

1. Navigate to *Settings > Policies > Group > [Policy Name] > Reimbursement*
2. Set your *Manual Reimbursement threshold to $20,0000*

### Step 11: Enable Domains and set up your corporate card feed for employees
Expensify is optimized to work with corporate cards from all banks – or even better, use our own perfectly integrated *[Expensify Card](https://use.expensify.com/company-credit-card)*. The first step for connecting to any bank you use for corporate cards, and the Expensify Card is to validate your company’s domain in Domain settings. 

To do this:

- Click *Settings* 
- Then select *Domains*

#### If you have an existing corporate card
Expensify supports direct card feeds from most financial institutions. Setting up a corporate card feed will pull in the transactions from the connected cards on a daily basis. To set this up, do the following: 

1. Go to *Company Cards >* Select your bank 
      - If you don’t see your financial institution in the list of banks we support, you can review an alternative solution in the Feature Deep Dives section below
2. Next, enter your bank account login credentials.
      - To successfully connect to your bank, we’ll need the *master admin (primary) account* login credentials. 
3. Next, assign the corporate cards to your employees by selecting the employee’s email address and the corresponding card number from the two drop-down menus under the *Assign a Card* section
4. Set a transaction start date (this is really important to avoid pulling in multiple outdated historical expenses that you don’t want employees to submit)

![If you have existing corporate cards](https://help.expensify.com/assets/images/playbook-existing-corporate-card.png){:width="100%"}

As mentioned above, we’ll be able to pull in transactions as they post (daily) and handle receipt matching for you and your employees. One benefit of the Expensify Card for your company is being able to see transactions at the point of purchase which provides you with real-time compliance. We even send users push notifications to SmartScan their receipt when it’s required and generate IRS-compliant e-receipts as a backup wherever applicable. 

#### If you don't have a corporate card, use the Expensify Card (US only)
Expensify provides a corporate card with the following features:

- Up to 2% cash back (up to 4% in your first 3 months!)
- [SmartLimits](https://community.expensify.com/discussion/4851/deep-dive-what-are-unapproved-expense-limits#latest) to control what each individual cardholder can spend
- A stable, unbreakable real-time connection (third-party bank feeds can run into connectivity issues)
- Receipt compliance - informing notifications (eg. add a receipt!) for users *as soon as the card is swiped*
- A 50% discount on the price of all Expensify plans
- Multiple discounts and savings on a host of partner tech suppliers 
- Good Karma - 10% of all card interchange we earn goes directly to the Expensify.org Social Justice Community funds

The Expensify Card is recommended as the most efficient way to manage your company's spending. 

Here’s how to enable it:

1. There are *two ways* you can [apply for the Expensify Card](https://community.expensify.com/discussion/4874/how-to-apply-for-the-expensify-card)
      - *Via your Inbox* 
      - *Via Domain Settings* - Go to Settings > Domain > Company Cards > Enable Expensify Card
2. Assign the cards to your employees
3. Set *SmartLimits*:
      - *Employees* - We recommend a low limit for most employees, roughly double the size of the maximum daily spend – such as $1000.  
      - *Execs* - We recommend a higher limit for executives, roughly 10x the limit of a non-executive employee (eg, $10,000).

Once the Expensify Cards have been assigned, each employee will be prompted to enter their mailing address so they can receive their physical card. In the meantime, a digital card will be ready to use immediately.

If you have an accounting system we directly integrate with, check out how we take automation a step further with [Continuous Reconciliation](https://community.expensify.com/discussion/7335/faq-what-is-the-expensify-card-auto-reconciliation-process). We’ll create an Expensify Card clearing and liability account for you. Each time settlement occurs, we’ll take the total amount of your purchases and create a journal entry that credits the settlement account and debits the liability account - saving you hours of manual reconciliation work at the end of your statement period. 

### Step 12: Set up Bill Pay and Invoicing
As a small business, managing bills and invoices can be a complex and time-consuming task. Whether you receive bills from vendors or need to invoice clients, it's important to have a solution that makes the process simple, efficient, and cost-effective.

Here are some of the key benefits of using Expensify for bill payments and invoicing:
- Flexible payment options: Expensify allows you to pay your bills via ACH, credit card, or check, so you can choose the option that works best for you (US businesses only).
- Free, No Fees: The bill pay and invoicing features come included with every policy and workspace, so you won't need to pay any additional fees.
- Integration with your business bank account: With your business bank account verified, you can easily link your finances to receive payment from customers when invoices are paid.

Let’s first chat through how Bill Pay works

1. Have your vendors send their invoices to yourdomain.com@expensify.cash.
- This email address comes with every account, so no need to activate it anywhere.
2. Once the invoicehas been received, we’ll create a bill to pay for your review directly in Expensify
3. At the top of the bill, you’ll notice a Pay button. Once you click that, you’ll see options including ACH, credit/debit card, along with mailing a physical check.

Similarly, you can send bills directly from Expensify as well. 

1. From the *Reports* tab, select the down arrow next to *New Report* and select *Bill*
2. Next, enter the Supplier’s email address, the Merchant name, the total amount, and the date
3. At this point, you can also upload an attachment to further validate the bill if necessary
4. Click *Submit*, we’ll forward the newly created bill directly to your Supplier.

![Send bills directly from Expensify](https://help.expensify.com/assets/images/playbook-new-bill.png){:width="100%"}

Reports, invoices, and bills are largely the same, in theory, just with different rules. As such, creating a customer invoice is just like creating an expense report and even a bill.

1. From the *Reports* tab, select the down arrow next to *New Report* and select *Invoice*.
2. Add all of the expenses/transactions tied to the Invoice
3. Enter the recipient’s email address, a memo if needed, and a due date for when it needs to get paid, and click *Send*

You’ll notice it’s a slightly different flow from creating a Bill. Here, you are adding the transactions tied to the Invoice, and establishing a due date for when it needs to get paid. If you need to apply any markups, you can do so from your policy settings under the Invoices tab. Your customers can pay their invoice in Expensify via ACH, or Check, or Credit Card. 

### Step 13: Run monthly, quarterly and annual reporting
At this stage, reporting is important and given that Expensify is the primary point of entry for all employee spend, we make reporting visually appealing and wildly customizable.

1. Head to the *Expenses* tab on the far left of your left-hand navigation
2. Select the pie chart icon on the right top right corner
3. Configure the filters to your preference

We recommend reporting:

- *Monthly* - for spend analysis on your GLs, active projects and department spend
- *Quarterly* - for budget comparison reporting. Pull up your BI tool and compare your active budgets with your spend reporting here in Expensify
- *Annually* - Run annual spend trend reports with month-over-month spend analysis, and prepare yourself for the upcoming fiscal year.

![Expenses!](https://help.expensify.com/assets/images/playbook-expenses.png){:width="100%"}

### Step 14: Set your Subscription Size and Add a Payment card
Our pricing model is unique in the sense that you are in full control of your billing. Meaning, you have the ability to set a minimum number of employees you know will be active each month and you can choose which level of commitment fits best. We recommend setting your subscription to *Annual* to get an additional 50% off on your monthly Expensify bill. In the end, you've spent enough time getting your company fully set up with Expensify, and you've seen how well it supports you and your employees. Committing annually just makes sense. 

To set your subscription, head to:

1. Settings > Policies
2. Select *Group*
3. Scroll down to *Subscription*
4. Select *Annual Subscription*
5. Enter the number of employees you know will be active each month
6. Enable *Auto-Renew* and *Auto-Increase Subscription Size*

Now that we’ve gone through all of the steps for setting up your account, let’s make it official so there are no interruptions in service as your employees begin using Expensify. We handle payments for our service via a paymentcard, and to add one:

1. Go to *Account > Settings > Payments*
2. Select *Add Payment Card*
3. Enter your name, card number, postal code, expiration and CVV
4. Click *Accept Terms*

## You’re all set!
Congrats, you are all set up! If you need any assistance with anything mentioned above or would like to understand other features available in Expensify, reach out to your Setup Specialist directly in *[new.expensify.com](https://new.expensify.com)*. Don’t have one yet? Create a Control Policy, and we’ll automatically assign a dedicated Setup Specialist to you. 
