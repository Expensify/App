---
title: Commercial Card Feeds
description: Learn how to set up and manage commercial card feeds (Visa, Mastercard, Amex) in Expensify.
keywords: [New Expensify, commercial feed, Mastercard feed, Visa feed, Amex feed, company cards, corporate cards, CDF, VCF, control account]
---
<div id="new-expensify" markdown="1">

Commercial feeds are the most reliable way to import company card expenses. These feeds are not affected by login credential changes or banking UI updates, making them ideal for growing teams and finance admins.

**Tip:** Contact your bank directly to check if your cards are eligible for a commercial feed.

---

# Prerequisites

Before setting up a commercial feed:

- Make sure you’ve created a workspace by going to **Workspaces > New Workspace**.
- On the **Collect plan**, you can add **one commercial or [direct feed](https://help.expensify.com/articles/new-expensify/connect-credit-cards/Direct-feeds)**.
- On the **Control plan**, you can add an **unlimited number of company cards**.

---

# Set Up a Mastercard Commercial Feed

To enable a Mastercard feed, your bank must send data from **Mastercard’s SmartData portal** to Expensify.

1. Ask your bank’s relationship manager to send your **CDF (Common Data File)** to **Expensify** via Mastercard’s SmartData portal.
   - File type: **CDF v3 Release 11.01**
   - Specify the earliest transaction date needed.
2. The bank will initiate delivery and email you a **Distribution ID**.
3. In Expensify, go to  **Workspaces > [Workspace Name] > Company Cards > Add Cards**.
4. Select your bank or choose **Other**, then select **Mastercard Commercial Cards**.
5. Submit your **Distribution ID**.
6. Expensify will activate the feed and notify you when setup is complete.

---


# Set Up a Visa Commercial Feed

Visa commercial feeds are configured through your bank using Visa’s **Subscription Management portal**.

1. Ask your bank’s relationship manager to enable your **VCF (Visa Commercial Format)** feed and send it to **Expensify**.
   - Mention: “You can check a box in Visa’s Subscription Management portal to enable feed delivery—no test file needed.”
2. Request the feed details:
   - **Processor ID**
   - **Bank (Financial Institution) ID**
   - **Company ID**
3. In Expensify, go to  
   **Settings > Workspaces > [Workspace Name] > Company Cards > Add Cards**.
4. Select your bank or **Other**, then choose **Visa Commercial Cards**.
5. Submit the required IDs and wait for confirmation from Expensify.

---

# Set Up an American Express Corporate Feed

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
5. In Expensify, go to **Workspaces > [Workspace Name] > Company Cards > Add Cards > American Express > American Express Corporate Cards**
6. Enter your delivery file name to submit.
7. You’ll be notified once the feed is live.

---

# Assign Company Cards

Once a commercial feed is connected:

1. Go to **Workspaces > [Workspace Name] > Company Cards**.
2. Click the **feed name** (top-left) to select the correct card feed if multiple are present.
3. Click **Assign Card** next to the unassigned card.
4. Select the employee from the list of workspace members.
5. Choose a **transaction start date**:
   - **From the beginning** (all available transactions)
   - **Custom date**
6. Click **Assign Card**.

**Transactions will begin importing immediately.**

![Click the feed name to view the feed selector]({{site.url}}/assets/images/commfeed/commfeed-01-updated.png){:width="100%"}
  
![Select your transaction start date]({{site.url}}/assets/images/commfeed/commfeed-05-updated.png){:width="100%"}

![Double check the selections and assign the card]({{site.url}}/assets/images/commfeed/commfeed-06-updated.png){:width="100%"}

---

# Manage Assigned Cards

You can update individual cards anytime under **Settings > Workspaces > [Workspace Name] > Company Cards**.

**Management Options:**

- **Rename the Card** – Customize for easier identification.
- **Assign Export Account** – Direct expenses to a specific accounting category (if integrated).
- **Update Transactions** – Pull the latest data manually.
- **Unassign the Card** – Removes the card and deletes unsubmitted draft expenses.

![Manage the card on the card details page]({{site.url}}/assets/images/commfeed/commfeed-07-updated.png){:width="100%"}

---

# FAQ

## My Feed Is Connected. Why Isn’t a Card Showing Up?

Cards only appear if they’re active and have at least one recent transaction. If the card is still missing, contact your account manager or message [concierge@expensify.com](mailto:concierge@expensify.com).

## Is There an Extra Cost for Commercial Feeds?

No. The **Collect plan** includes one commercial feed. To get multiple feeds, upgrade to the **Control plan**.

## What’s the Difference Between a Commercial Feed and a Direct Feed?

- **Direct Feed**: Quick setup using login credentials, but may require re-authentication.
- **Commercial Feed**: Set up with bank involvement but offers a **stable, uninterrupted** connection.

</div>
