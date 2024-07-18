---
title: Google Apps SSO
description: Expensify integrates with Google Apps SSO to easily invite users to your workspace.  
---
Google Apps SSO Integration
# Overview
Expensify offers a Single Sign-on (SSO) integration with [Google Apps](https://cloud.google.com/architecture/identity/single-sign-on) for one-click Workspace invites. 

To set this up for users, you must:

- Be an admin for a **Group Workspace** using a Collect or Control Workspace.
- Have Administrator access to the Google Apps Admin console.

Google Apps SSO differs from using Google as your Identity Provider for SAML SSO, which limits domain access. To complete the Google SAML setup, follow the Google guide to [Set up SSO via SAML for Expensify](https://support.google.com/a/answer/7371682). You can enable both at the same time.
# How to Enable the Expensify App on Google Apps
To enable Expensify for your Google Apps domain and add an “Expenses” link to your universal navigation bar, please run through the following:
1. Sign in to your Google Apps Admin console as an administrator.
2. Navigate to the [Expensify App Listing on Google Apps](https://workspace.google.com/marketplace/app/expensify/452047858523).
3. Click **Admin Install** to start installing the app.
4. Click **Continue**.
5. Ensure the correct domain is selected if you have access to multiple.
6. Click **Finish**. You can configure access for specific Organizational Units later if needed.
7. All account holders on your domain can now access Expensify from the Google Apps directory by clicking **More** and choosing **Expensify**.
8. Now, follow the steps below to sync your users with Expensify automatically.

# How to Sync Users from Google Apps to Expensify
To sync your Google Apps users to your Expensify Workspace, follow these steps:
1. Follow the above steps to install Expensify in your Google Apps directory.
2. Log in to [Expensify](https://www.expensify.com/).
3. Click [Settings>Workspaces>Group](https://www.expensify.com/admin_policies?param={"section":"group"}).
4. Select the Workspace you wish to invite users to.
5. Select **People** from the admin menu.
6. Click **Sync G Suite Now** to identify anyone on your domain not yet on the Workspace and add them to it. 

The connection does not automatically refresh, you will need to click **Sync G Suite Now** whenever you’re ready to add new users.
