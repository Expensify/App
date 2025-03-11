---
title: Egencia-Integration.md
description: Learn how to integrate Egencia with Expensify to automatically import travel booking receipts and expenses.
keywords: [Egencia, travel booking, Expensify integration, expense management, automated receipts]
---

# Egencia Integration with Expensify

## Overview
[Egencia](https://www.egencia.com/en/) is a business travel booking platform. Integrating Egencia with Expensify allows travel bookings to be automatically imported as expenses, ensuring seamless expense tracking.

## Requirements
To use the Egencia integration, you must have:
- A **Control Workspace**
- A **verified Domain**

---

## How Egencia Works with Expensify
When an employee books travel through Egencia:
- The receipt and itinerary are automatically imported into the traveler’s Expensify account, eliminating the need for manual entry.
- If the traveler uses a company credit card, the Egencia receipt automatically merges with the corresponding credit card transaction.
- Travel details are also accessible in the **Trips** section of the Expensify mobile app.

---

## Enabling the Egencia Feed
A file feed is an automated data transfer from Egencia to Expensify.

To enable the feed:
1. **Contact your Egencia account manager**.
2. **Request to enable the Expensify feed** for your organization.

> **Note:** Egencia controls the feed setup process.

---

## Connecting a Central Purchasing Account
If your company uses a **central purchasing account**, you can forward all Egencia booking receipts to a single Expensify account.

### Steps to Enable a Central Purchasing Account
1. **Open a chat with Concierge** in Expensify.
2. **Provide the central account email** and request activation. Example message:
   > "Please enable Central Purchasing Account for our Egencia feed. The account email is: `youraccount@yourdomain.com`."

### How It Works
- Booking receipts will be sent to **both** the traveler and the central account.
- The receipt in the traveler’s account is marked as a **reservation expense**, which:
  - Is **non-reimbursable**.
  - **Will not be exported** to an integrated accounting system.

