---
title: Commercial Card Feeds
description: Learn how to set up and manage commercial card feeds (Visa, Mastercard, Amex) in Expensify.
keywords: [New Expensify, commercial feed, Mastercard feed, Visa feed, Amex feed, company cards, corporate cards, CDF, VCF, GL1025, control account]
---

Commercial feeds are the most reliable way to import company card expenses. These feeds are not affected by login credential changes or banking UI updates, making them ideal for growing teams and finance admins. 

---
# Commercial Card Feeds 

Commercial card feeds are file-based connections provided directly by your bank. Unlike direct feeds, which require you to log in with your bank credentials, commercial feeds are managed by your bank and typically used for large-scale corporate card programs. Contact your bank directly to check if your cards are eligible for a commercial feed.

## Who can use Commercial Card Feeds

- **Collect plan** members can add one commercial card feed.
- **Control plan** members can add an unlimited number of company card feeds.
- Workspace creation is required before connecting cards.

---

# Set up a Mastercard Commercial Feed

To use a Mastercard commercial feed, your bank must send your transaction data from **Mastercard’s SmartData portal**.

1. Ask your bank to deliver your **CDF (Common Data File)** to Expensify via SmartData.
   - File type must be: **CDF v3 Release 11.01**
   - Specify the earliest transaction date needed.
2. Your bank will send you a **Distribution ID**.
3. In Expensify, go to **Workspaces > [Workspace Name] > Company Cards > Add Cards**.
4. Choose **Commercial Feed**, then select **Mastercard Commercial Cards**.
5. Enter the **Distribution ID** and submit.

Expensify will notify you when the feed is live.

---


# Set up a Visa Commercial Feed

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

# Set up an American Express Corporate Card Feed

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
5. 3. In Expensify, go to **Workspaces > [Workspace Name] > Company Cards > Add Cards**.
4. Choose **Commercial Feed**, then select **American Express Corporate Cards**.
7. You’ll be notified once the feed is live.

---

## Manage commercial card settings

You can update individual cards under **Company Cards > [Card Name]**.

### Available actions:
- **Rename the card** for easier tracking.
- **Assign export account** for accounting integration.
- **Update transactions** to pull the latest expenses.
- **Unassign the card** to remove it from a user and delete unsubmitted drafts.

![Manage the card on the card details page]({{site.url}}/assets/images/commfeed/commfeed-07-updated.png){:width="100%"}

---

# FAQ

## What’s the difference between a commercial feed and a direct feed?

- **Direct feeds** connect using your bank login credentials. They’re quick to set up but may require periodic re-authentication.
- **Commercial feeds** are bank-managed file connections. They require setup through your bank but offer a **more stable and uninterrupted** connection.

## My feed is connected, but I don’t see my card. What now?

Cards will only appear if:
- They are active
- At least one transaction has posted

If a card still isn’t showing, contact your account manager or email [concierge@expensify.com](mailto:concierge@expensify.com).

## Is there an extra cost for commercial feeds?

No. Commercial feeds are included in the Collect and Control plans:
- **Collect** includes one commercial feed.
- **Control** supports unlimited feeds.
