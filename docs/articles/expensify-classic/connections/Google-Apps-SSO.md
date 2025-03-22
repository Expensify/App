---
title: Google Apps SSO
description: Learn how to integrate Expensify with Google Apps SSO for seamless user management and one-click Workspace invites.
keywords: [Google Apps SSO, Expensify integration, Workspace invites, Google Admin, Sync Users]
---

# Google Apps SSO Integration

## Overview
Expensify offers **Single Sign-On (SSO)** integration with [Google Apps](https://cloud.google.com/architecture/identity/single-sign-on), allowing **one-click Workspace invites** for easier user management.

### Requirements:
- You must be an **admin** of a **Group Workspace** with a **Collect or Control** subscription.
- You must have **Administrator access** to the Google Apps Admin console.

> **Note:** Google Apps SSO is different from using Google as an Identity Provider for **SAML SSO**, which restricts domain access. If you need **Google SAML SSO**, follow [Google’s guide](https://support.google.com/a/answer/7371682). You can enable both simultaneously.

---

## How to Enable Expensify on Google Apps

To integrate Expensify with your Google Apps domain and add an **Expenses** shortcut to your Google navigation bar:

1. **Sign in** to your **Google Apps Admin console** as an administrator.
2. Open the [Expensify App Listing on Google Workspace](https://workspace.google.com/marketplace/app/expensify/452047858523).
3. Click **Admin Install** to begin installation.
4. Click **Continue**.
5. If you manage multiple domains, select the correct one.
6. Click **Finish**. *(You can later configure access for specific Organizational Units if needed.)*
7. Users can now find Expensify under **More** in their Google Apps directory.

Now, follow the steps below to **sync users from Google Apps to Expensify**.

---

## How to Sync Google Apps Users to Expensify

To automatically add your Google Apps users to an Expensify Workspace:

1. **Complete the Google Apps installation steps** above.
2. Log in to [Expensify](https://www.expensify.com/).
3. Go to **Settings > Workspaces > Group** or [click here](https://www.expensify.com/admin_policies?param={"section":"group"}).
4. Select the Workspace you want to sync users with.
5. Navigate to **People** in the admin menu.
6. Click **Sync G Suite Now**. Expensify will detect users in your domain who are not yet in the Workspace and add them.

> **Important:** The connection does **not** auto-refresh. You must manually click **Sync G Suite Now** whenever you want to update users.
