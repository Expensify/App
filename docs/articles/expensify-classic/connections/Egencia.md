---
title: Egencia
description: Learn how to integrate Egencia with Expensify to automatically import travel booking receipts and expenses.
keywords: [Egencia, travel booking, Expensify Classic]
internalScope: Audience is Workspace Admins and travelers on a Control Workspace. Covers enabling the Egencia receipt feed and routing receipts to a central purchasing account, does not cover booking travel in Egencia or other travel partner integrations.
---

# Connect Egencia to Expensify

[Egencia](https://www.egencia.com/en/) is a business travel booking platform. Integrating Egencia with Expensify allows travel bookings to be automatically imported as expenses, ensuring seamless expense tracking.

---

## What you need to use the Egencia integration
To use the Egencia integration, you must have:
- A **Control Workspace**
- A **verified Domain**

---

## How Egencia works with Expensify
When an employee books travel through Egencia:
- The receipt is automatically imported into the traveler’s Expensify account, eliminating the need for manual entry.
- If the traveler uses a company credit card, the Egencia receipt automatically merges with the corresponding credit card transaction.

---

## How to enable the Egencia integration
The integration allows Egencia to automatically send flight and fee data to Expensify.

To enable the integration:
1. Contact your Egencia account manager.
2. Request to enable the Expensify feed for your organization.

**Note:** Egencia controls the feed setup process.

---

## How to connect a central purchasing account
If your company uses a **central purchasing account**, you can forward all Egencia booking receipts to a single Expensify account.

1. **Open a chat with Concierge** in Expensify.
2. **Provide the central account email** and request activation. Example message:
   > "Please enable Central Purchasing Account for our Egencia feed. The account email is: `youraccount@yourdomain.com`."

---

## What happens after you connect a central purchasing account
- Booking receipts will be sent to **both** the traveler and the central account.
- The receipt in the traveler’s account is marked as a **reservation expense**, which:
  - Is **non-reimbursable**.
  - **Will not be exported** to an integrated accounting system.
