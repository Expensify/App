---
title: Setting Approval Types and Adding Members
description: Learn how to configure approval types and assign members to a travel policy in Expensify Travel.
keywords: [travel policy, approval type, soft approval, hard approval, pre-booking approval, add policy members, default approver, travel policy members]
internalScope: Audience is travel admins. Covers configuring approval types and adding members to a travel policy. Does not cover approving or denying individual travel requests.
---


Expensify Travel policies give admins powerful tools to control booking behavior, define approval workflows, and group travelers under shared rules to simplify company-wide travel management.

---

## How to access Expensify Travel

- **In New Expensify:** Click the **+** button in the bottom-left corner of your screen, then select **Book travel**.
- **In Classic Expensify:** Click **Travel** in the left-hand menu, then select **Book or manage travel**.

Note: Only Travel Admins can create or manage travel policies in Expensify Travel.

**Need to enable travel still?** Reach out to your Account Manager or Concierge to schedule a travel demo and get it enabled for your account.

---

## How to set approval types and add members

1. Open **Expensify Travel**.
2. Go to **Program** > **Policies**.
3. Select an existing policy or click **Add New** to create a new one.

---

## How to configure General tab settings

- **Parent Policy**: Select a parent policy to inherit approval and restriction settings.
- **Policy Name**: Choose a clear, easily identifiable name.
- **Policy group actions** (for Air, Hotel, Car, Rail): Choose a separate approval action for in-policy and out-of-policy bookings.
  - **No action**: Bookings proceed with no approval.
  - **Passive approval**: No approval required, but the approver receives an email.
  - **Soft approval** (Recommended): Booking proceeds unless declined.
  - **Hard approval**: Booking is canceled unless explicitly approved.
  - **Pre-Booking Approval**: Approval must be obtained before the booking can proceed. Available for Air, Hotel, and Car only.
  - **Block booking**: Booking is blocked and members have no way to request an exception.
- **Approver Type**:
  - **Manager Approval**: Uses the manager from the member's Expensify workflow.
  - **Designated Approver**: Sends bookings to a pre-defined approver.
- **Default Approvers**: Add up to three backups to handle approval volume, especially when using Hard Approval or Pre-Booking Approval.

## How Pre-Booking Approval works

When Pre-Booking Approval is enabled for a booking type, the traveler must receive approval before the booking is finalized. No payment is charged and no receipt is generated until the booking is approved and confirmed.

Here is how the process works:

1. The traveler selects a flight, hotel, or car that requires pre-booking approval.
2. During checkout, a notice appears indicating that pre-booking approval is required. The traveler can click **your approvers** to see who is eligible to approve.
3. On the final checkout page, the traveler clicks **Request approval** instead of the usual **Book** button.
4. The confirmation page shows that the booking is awaiting approval.
5. Both the traveler and the approver receive an email notification.
6. The approver has 24 hours to approve or reject the request. If the request is not approved within 24 hours, it expires and no booking is made.
7. If approved, the traveler and the approver each receive another email notification. The traveler then has 24 hours to return to the trip in Expensify Travel and finalize the booking by completing the checkout process again.

Pre-Booking Approval includes a price buffer for approved bookings to account for minor fare changes between approval and final booking.

## How to add members using the Edit Members tab

Admins assign those who are subject to the policy's booking rules. Add members by group:

- **Individual users** - Enter a specific member by name or email to the policy.
- **Departments** - Add all members with the same department in their travel profile.
- **Legal Entities** - Select an Expensify workspace to add all members of the workspace to the travel policy.
- **Offices** - Add all members with the same office location in their travel profile.

You can add multiple groups to a travel policy and apply conditions to each group as needed.

Click the green **Create Policy** button at the bottom to save and activate the travel policy.

---

# FAQ

## Can I use the same travel policy across multiple teams?

Yes. Use groups like Departments or Offices to apply the same policy to multiple member sets.

## What is the benefit of a parent policy?

We recommend configuring the system-provided **Default** policy with your baseline settings. Use this as a parent policy when creating new ones to speed up setup.

## What happens if no approvers are added to a Hard Approval or Pre-Booking Approval policy?

For Hard Approval, travel bookings will be automatically canceled if no approver is assigned. For Pre-Booking Approval, the approval request cannot proceed without an assigned approver.

## Is Pre-Booking Approval available for all booking types?

Pre-Booking Approval is available for Air, Hotel, and Car bookings. It is not available for Rail bookings.

## What happens if the traveler does not finalize the booking after Pre-Booking Approval?

If the traveler does not complete the booking within 24 hours of receiving approval, the approval expires and no booking is made. The traveler would need to submit a new approval request.

## What happens if the fare changes between approval and final booking?

Pre-Booking Approval includes a price buffer to account for minor fare changes. If the fare increases beyond the buffer, the traveler may need to request a new approval.
