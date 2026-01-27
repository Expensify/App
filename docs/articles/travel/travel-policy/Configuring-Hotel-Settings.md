---
title: Configuring Hotel Settings
description: Learn how to manage hotel booking settings within a Spotnana travel policy.
keywords: [hotel policy, hotel settings, spotnana travel, booking rules, hotel restrictions]
---

Customize hotel booking policies to guide travelers toward compliant, cost-effective stays. These controls help enforce standards while allowing flexibility where it makes sense.

---

## Where to find Expensify Travel

Tap the green ➕ **Create** button at the bottom of your screen, then choose **Book travel**.

If you don’t see **Book travel**, ask a Workspace Admin to [enable Expensify Travel](https://help.expensify.com/articles/travel/company-setup/Enable-Travel-on-a-Workspace) on the workspace. 

---

# Configuring Hotel settings

To configure your hotel booking policy:
1. Open Expensify Travel.
2. Go to **Program > Policies**.
3. Select an existing policy or click **Add new** to create one.
4. Expand the **Hotel** tab.

Note: Any setting with a chain link icon (🔗) that is not crossed out is inherited from a parent policy. To customize it, click the icon and unlock it from the parent.

---

## Restrict bookings by

Set specific keywords that will restrict hotel bookings if matched in the rate description.
- Useful for excluding specific phrases like "non-refundable" or "prepaid."

---

## Hotel rate conditions not allowed to be booked

Block specific rate types from being available to travelers.
- Options include:
  - Non-refundable
  - Prepaid
  - Requires deposit
  - Pay at property

You can also add a custom message explaining the restriction to travelers during the booking process.

---

## Add Property type

Configure hotel restrictions by property type.

When setting this up, customers will set:

- **Property types to restrict** – Properties matching these types will be marked out-of-policy.  
  *Note: This is a dropdown with options like Apartment, Castle, Health Spa, and Boatel.*

- **Restricted properties can have their own Out of Policy action** – Choose how to handle bookings that violate this restriction.  
  *Note: Use this to require special approval for specific property types.*

- **Tier exception** – Allow preferred properties to bypass type restrictions.  
  *Note: Preferred hotels are set under* Program > Company > Supplier > Supplier Management.

---

## Only consider cheapest rate as in-policy

Flags the lowest-priced rate at each hotel as **in policy**.
- All other rates for that property will be **out of policy**.

---

## Maximum price

Set a global nightly price cap for hotel stays.
- Customize rates further by city or country/region.
- Choose whether the limit includes taxes and fees.

---

## Booking window

Define how many days before check-in a booking becomes out of policy.
    - Example: If set to 5 days, any booking made less than 5 days in advance is flagged as out of policy.

---

## Cancellation policy

Determine what refund options you want travelers to book:
  - Any (allow all)
  - Fully refundable rooms only
  - Partially or fully refundable rooms only

---

## Experience

Set minimum and maximum star ratings to define acceptable hotel experiences.
- Helps maintain booking quality while controlling costs.

---

## Nightly median rate

Configure parameters to calculate the median hotel rate based on the traveler's search results. The median rate represents the midpoint price where half the hotels cost more and half cost less. 

To configure:
- **Search radius** – The radius (in miles) around a traveler’s search location used to calculate the median.
- **Rating range (number of stars)** – Minimum and maximum star ratings considered when calculating the median.

**Note:** This feature is informational only. It does not determine in-policy or out-of-policy status, but helps travelers understand the context of their options.

---

## Out of policy reason codes

Enable travelers to create or select a reason when selecting an out-of-policy hotel.
- Click **Manage Reason Codes** to create, edit, or delete available reason options.

---

# FAQ

**Does the “cheapest rate” rule consider taxes and fees?**  
It depends on your configuration under the **Maximum price** setting — you can choose whether to include taxes and fees when evaluating the cheapest rate.

**Can we use reason codes to track exceptions?**  
Yes. Reason codes help you understand booking behaviors and justify policy exceptions for reporting or compliance purposes. When viewing policy violations in the **Analytics** > **Company reports** < **Compliance** section, you can see data on reason usage as well.

