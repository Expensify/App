---
title: Set up a Commercial Card Feed Connection
description: Learn how to set up a Visa, Mastercard or Amex commercial card feed in Expensify
keywords: [New Expensify, commercial feed, Mastercard feed, Visa feed, Amex feed, company cards, corporate cards, CDF, VCF, GL1025, control account]
internalScope: Audience is Workspace Admins. Covers setting up a commercial card feed for Visa, Mastercard, or American Express. Does not cover assigning cards, managing cards, or troubleshooting feeds.
---

# Set up a Commercial Card Feed Connection

Commercial card feeds are file-based connections managed by your bank that import company card transactions into Expensify.

Before you begin, contact your bank to confirm that your card program is eligible for a commercial card feed.

If you're not eligible for a commercial card feed, you can [set up a direct company card feed connection instead](/articles/new-expensify/connect-credit-cards/Set-up-a-Direct-Company-Card-Feed-Connection). 

---

## Who can set up a commercial card feed connection

Any Workspace Admin can set up a commercial card feed connection. 

 - On the **Collect** plan, you can add one company card feed. 
 - On the **Control** plan, you can add unlimited company card feeds. 

[Learn about the different plan types available in Expensify.](/articles/new-expensify/billing-and-subscriptions/Plan-types-and-pricing)

---

## How to set up a new commercial card feed connection 

1. Click the navigation tabs (on the left on web, on the bottom on mobile) and select **Workspaces > [Workspace name]**
2. Choose **Company cards** to view your company’s card setup page.
 - If you don't see **Company cards**, enable the feature under **More features > Company cards**
3. Click **Add cards** to set up your first connection.
    -  If you don't see **Add cards**, click on your existing company card feed connection then **Add cards**
4. Select the country your bank is located in and select **Next**.
5. Choose your **Commercial feed** and select **Next**.
6. Choose your bank from the list and follow the instructions.

## How to enable a Mastercard commercial card feed (CDF)

To use a Mastercard commercial feed, your bank must send your transaction data from **Mastercard’s SmartData portal**.

1. Ask your bank to deliver your **CDF (Common Data File)** to Expensify via SmartData.
   - File type must be: **CDF v3 Release 11.01**
   - Specify the earliest transaction date needed.
2. Your bank will send you a **Distribution ID**.
3. In Expensify, go to **Workspaces > [Workspace Name] > Company Cards > Add Cards**.
4. Choose **Commercial Feed**, then select **Mastercard Commercial Cards**.
5. Enter the **Distribution ID** and submit.

Expensify will notify you when the feed is connected.

---

## How to enable a Visa commercial card feed (VCF)

Visa commercial feeds are configured through your bank using Visa’s **Subscription Management portal**.

1. Ask your bank’s relationship manager to enable your **VCF (Visa Commercial Format)** feed and send it to **Expensify**.
   - Mention: “You can check a box in Visa’s Subscription Management portal to enable feed delivery—no test file needed.”
2. Request the feed details:
   - **Processor ID**
   - **Bank (Financial Institution) ID**
   - **Company ID**
3. In Expensify, go to **Workspaces > [Workspace Name] > Company Cards > Add Cards**.
4. Choose **Commercial Feed**, then select **Visa Commercial Cards**.
5. Enter the required IDs and submit.

Expensify will notify you when the feed is connected.

---

## How to enable an American Express commercial card feed (GL1025)

To set up an Amex Corporate Feed, you’ll need to complete and email their required forms.

1. Download the forms:  
   [Amex Feed Setup Forms (Google Drive)](https://drive.google.com/file/d/1zqDA_MCk06jk_fWjzx2y0r4gOyAMqKJe/view?usp=sharing)
2. Complete the form as follows:
   - **Page 1:** Fill in legal company details, requestor name/email, feed start date, and **Control Account Number** (not a credit card number).
   - **Page 2:** Leave blank.
   - **Page 3:** Re-enter client name and Control Account.
   - **Page 4:** Add country, authorization name, title, and signature (DD/MM/YY format).
3. Email the completed forms to: **electronictransmissionsteam@aexp.com**
4. Wait for the **Production Letter** containing your feed’s file name.
5. In Expensify, go to **Workspaces > [Workspace Name] > Company Cards > Add Cards**.
6. Choose **Commercial Feed**, then select **American Express Corporate Cards**.

Expensify will notify you when the feed is connected.

---

## What happens after a commercial card feed is connected 

 - Cards with recent expenses will appear as a list and can be assigned to Workspace members.
 - After a card is assigned, posted transactions import into the assigned member's account automatically as expenses.

[Learn how to assign company cards](/articles/new-expensify/connect-credit-cards/Assign-Company-Cards).

---

# FAQ

## What can I do if my bank doesn't offer a commercial card feed? 

If you're not eligible for a commercial card feed,  connect company cards using a direct feed or through Plaid using your online banking credentials. [Learn how to set up a direct company card feed connection](/articles/new-expensify/connect-credit-cards/Set-up-a-Direct-Company-Card-Feed-Connection). 

## Can I connect the same commercial card feed connection across different workspaces? 

Yes, commercial card feeds can be shared across workspaces. [Learn how to add an existing company card feed to a workspace](/articles/new-expensify/connect-credit-cards/Share-a-Company-Card-Connection-Across-Workspaces). 

