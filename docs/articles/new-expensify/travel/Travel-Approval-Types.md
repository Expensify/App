---
title: travel-approval-types.md
description: Learn about the different approval types in Expensify Travel powered by Spotnana, and how they impact booking workflows and policy compliance.
keywords: Expensify Travel, approval types, soft approval, hard approval, passive approval, Spotnana, travel policies
---

<div id="new-expensify" markdown="1">

Expensify Travel uses a tiered approval system to help organizations balance booking efficiency with policy oversight. Here's how each approval type works, and when to use them.

# Expensify Travel approval types

Expensify Travel (powered by Spotnana) supports **three types of booking approvals**: **Soft**, **Hard**, and **Passive**. These are set by your workspace's travel policy and determine the level of oversight required before a travel booking is finalized.

---

## How approval types are determined

Each booking (air, hotel, car, etc.) is evaluated **independently** based on the travel policy configured in your workspace.

Admins can define:
- Which bookings require approval
- What type of approval is used for different scenarios
- Who needs to approve based on traveler role or booking type

---

## Booking process overview

No matter the approval type, every booking follows this core process:

1. The system tickets the booking immediately to lock in the fare.
2. The travel policy engine checks the booking against your workspace's rules.
3. If required, the system triggers the appropriate approval workflow.

---

## Soft approval (Opportunity to Deny)

A booking can proceed **unless it's explicitly denied** by the approver within the void window.

### Process:
- The approver gets notified.
- If they **do nothing**, the booking is confirmed.
- If they **deny** within the void window, the ticket is voided.

### Key characteristics:
- No action is required to approve.
- Approver sees language like: *"To approve this request, no action is required."*
- The approval window is tied to the supplier's void window.
- Low-friction process ideal for common bookings.

### Best used for:
- Everyday bookings where delays would risk fare increases.
- Teams with strong, well-followed travel policies.
- Use cases where notification is enough for visibility.

---

## Hard approval

The approver **must take action** for the booking to go through.

### Process:
- Approver must explicitly approve within the void window.
- If denied, the ticket is voided.
- If no action is taken by the deadline, the ticket is automatically voided.

### Key characteristics:
- Action required to proceed.
- Auto-void occurs if approval isn't given in time.
- Approval window is the shorter of:
  - 48 hours, or
  - The supplier's full-refund void window
- If travel begins within 48 hours, that becomes the approval deadline.

### Downgrade scenarios:
Hard approvals automatically downgrade to **Soft** when:
- The supplier has a 0-hour void window.
- The ticket is non-refundable.
- The booking is made via manual form.

### Best used for:
- High-cost or international bookings.
- Strict policy environments.
- Scenarios where cost control is more important than fare locking.

---

## Passive approval (FYI only)

Used purely for visibility—no action can be taken.

### Process:
- Approver is notified, but cannot approve or deny.
- Booking continues automatically.

### Key characteristics:
- No action options.
- Provides awareness, not oversight.

### Downgrade scenarios:
Both **Soft** and **Hard** approvals downgrade to **Passive** when:
- The booking is made via manual form.

### Best used for:
- Informing managers about team travel.
- Audit trail requirements.
- Reducing booking friction while maintaining transparency.

---

# FAQ

## Can a trip include multiple approval types?
Yes. Air, hotel, and car bookings are evaluated independently and may each follow different approval rules.

## What is a "void window"?
The time frame in which a ticket can be canceled for a full refund—set by the travel supplier.

## What happens if an approver misses the hard approval window?
The booking is **auto-voided** to prevent unapproved charges.

## Can admins customize who receives approval notifications?
Yes. Workspace travel policies can define approvers based on roles, cost, destination, or booking type.

</div> 