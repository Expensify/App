---
title: INT122 Sync Error: Authentication Error During Sync With Sage Intacct
description: Learn why the INT122 sync error occurs and how to update Sage Intacct web services credentials to restore the connection.
keywords: INT122, Sage Intacct authentication error, xmlgateway_expensify credentials, Sage Intacct web services authorization, Sender ID expensify, sync authentication failure
internalScope: Audience is Workspace Admins managing the Sage Intacct integration. Covers the INT122 sync error related to authentication and web services credentials. Does not cover export data validation errors.
---

# INT122 Sync Error: Authentication Error During Sync With Sage Intacct

If you see the error message:

**“INT122 Sync Error: Authentication error during sync. Please reenter Sage Intacct admin credentials and attempt sync again.”**

It means the connection between Expensify and Sage Intacct cannot be authenticated.

This typically occurs when credentials or web services settings in Sage Intacct are incorrect or incomplete.

---

## Why the INT122 Sync Error Happens

The INT122 sync error occurs when:

- The credentials for the **xmlgateway_expensify** web services user are incorrect, or  
- The required web services authorization (Sender ID) is missing in Sage Intacct  

If Sage Intacct cannot authenticate the integration user, the sync will fail.

---

# How to Fix the INT122 Sync Error

Follow the steps below to verify credentials and restore the connection.

---

## Step 1: Confirm xmlgateway_expensify Credentials

1. Log in to Sage Intacct.  
2. Verify the credentials for the **xmlgateway_expensify** web services user.  
3. Confirm the username, password, and permissions are correct and active.  

Update credentials if needed and save your changes.

---

## Step 2: Confirm Web Services Authorization Settings

1. In Sage Intacct, go to **Company > Setup > Company > Security > Edit**.  
2. Scroll to **Web Services Authorizations**.  
3. Add **expensify** (all lowercase) as a **Sender ID**.  
4. Click **Save**.  

If **expensify** is already listed and the error persists:

- Remove it from the list  
- Add it again as **expensify** (all lowercase)  
- Click **Save**  

---

## Step 3: Retry the Connection

1. Go to **Workspace > [Workspace Name] > Accounting**.  
2. Retry the connection or run sync again.  

If credentials and web services settings are configured correctly, the sync should complete successfully.

---

# FAQ

## Does the Sender ID have to be lowercase?

Yes. The Sender ID must be entered as **expensify** in all lowercase.

## Do I need Sage Intacct admin permissions to fix this?

Yes. Updating web services authorizations and credentials typically requires administrative access in Sage Intacct.

## Does this error affect exports?

Yes. If sync fails due to authentication, exports and other integration features may not function until the connection is restored.
