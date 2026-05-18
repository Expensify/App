---
title: Manage Logged-in Devices
description: View signed-in devices and revoke device access for your Expensify account.
keywords: [manage devices, revoke device access. log out remotely, revoke logged-in device, signed in devices, account security, New Expensify]
internalScope: Audience is all Expensify members. Covers viewing and revoking signed-in device sessions in New Expensify. Does not cover two-factor authentication, account lock, or SAML/SSO configuration.
---

# Manage Logged-in Devices

You can view all devices currently signed in to your Expensify account and revoke access for devices you no longer trust. This is useful if you lose a device, notice suspicious account activity, or want to remove old login sessions.


---

## Who can manage devices

All Expensify members can view and revoke device access on web or mobile for their own account sessions.

---

## How to view and revoke logged-in devices in Device management

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Account**.
2. Click **Security**.
3. Click **Device management**.
4. Review the list of devices that have access to your account. Each entry shows the device name, operating system, and when it was last active.
5. To remove a device, click **Revoke** next to it.

Each listed device represents an active login session on your account. Devices may appear multiple times if you signed in using different browsers, apps, or devices.

---

<!-- SCREENSHOT:
Account > Security > Device Management with a list of devices 
Design request:https://github.com/Expensify/Expensify/issues/637256
-->

---

## What happens after you revoke device access

The selected device is immediately signed out of your Expensify account. Anyone using that device must sign in again to restore access.

Revoking a device does not:
- Reset your password
- Sign out other active devices
- Enable two-factor authentication
- Remove access from devices that were not revoked

---

# FAQ

## Can I revoke access to a lost or stolen device?

Yes. Open **Device management**, find the device you want to remove, and click **Revoke** to sign that device out remotely.

## Why do I see multiple devices listed?

Each browser, mobile app, or device creates a separate login session. You may see multiple entries if you signed in from different locations or browsers.

## Can I revoke all devices at once?

No, devices must be revoked individually.

## What information can I see for each device?

The device list shows the device name, operating system or browser, and the last time the device accessed your account.
