---
title: QuickBooks Desktop
description: Connect Expensify to QuickBooks Desktop
order: 1
---
# Overview
To connect Expensify to QuickBooks Desktop, use Right Networks as the hosting platform if possible. Right Networks is a cloud-based service that was built specifically for this integration. If you need a Right Networks account, complete [this form](https://info.rightnetworks.com/partner-expensify) to start the process.

**A couple of notes before connecting QuickBooks Desktop to Expensify:**
- Make sure you're logged into QuickBooks Desktop as an admin
- Check that the company file you want to connect Expensify to is the only one open


# Connect to QuickBooks Desktop

## Step 1: Set up submitters in QuickBooks Desktop
- Make sure all report submitters are set up as Vendors in QuickBooks Desktop and their Expensify email is in the "Main Email" field of their Vendor record. You can do this in the vendor section of QuickBooks.
- If you want to export reports to your users' employee records instead of vendor records, select Check or Journal Entry as your reimbursable export option.
- To set up Expensify users as employees, activate QuickBooks Desktop Payroll. This module is necessary to access the Employee Profile tab, where you can enter the submitter's email addresses.
  
## Step 2: Enable/install the Expensify Sync Manager
1. Navigate to **Settings > Workspaces > Group > [Workspace Name] > Connections**
2. Click **Connect to QuickBooks Desktop** to initiate the connection

**Option 1: Enable the Expensify Sync Manager in Right Networks (recommended)**
- For this option, **single-user mode** in QuickBooks Desktop is required.
- If you don't have an account with Right Networks, you can contact Right Networks [here](https://info.rightnetworks.com/partner-expensify)
- Once set up, you can enable the Expensify Sync Manager from the **My Account** section in Right Networks' portal

**Option 2: Install the Expensify Sync Manager on Your Third-Party Remote Desktop.**
To download the Sync Manager to your desktop, you must contact your third-party remote desktop provider and request permission. They might have security restrictions, so it's best to communicate with them directly to avoid potential problems with the Sync Manager. Remember that the Sync Manager program file should be stored in the same location (i.e., the same drive) as your QuickBooks Desktop program.

## Step 3: Complete the connection
1. Open QuickBooks and access the desired Company File using the QuickBooks Admin credentials (admin credentials are necessary for creating the connection)
2. Navigate to **Settings > Workspaces > Group > [Workspace Name] > Connections**
3. Copy the Token by selecting the copy icon
4. While QuickBooks is still running, launch the Expensify Sync Manager by pasting the Token into the Sync Manager
5. Click **Save**
6. Once the Sync Manager status displays **Connected**, return to Expensify and click **Continue**

## Step 4: Allow access
1. Return to QuickBooks where you'll see an **Application Certificate** screen
   - On the first page of the Certificate screen, click **Yes, always; allow access even if QuickBooks is not running**
3. Click **Continue**
4. On the second page of the Certificate screen, choose the Admin user from the dropdown menu
5. Click **Done**
7. Return to Expensify and wait for the sync to complete

{% include faq-begin.md %}

## After connecting, how do I sync QuickBooks and Expensify?
1. Confirm that both the Expensify Sync Manager and QuickBooks Desktop are running
2. On the Expensify website, navigate to **Settings > Workspaces > Group > [Workspace Name] > Connections**, and click **Sync now**
3. Wait for the sync to complete

Typically, this takes about 2-5 minutes, but it might take longer, depending on when you last synced and the size of your QuickBooks company file. The page will refresh automatically once syncing is complete.

We recommend syncing at least once a week or whenever you make changes in QuickBooks Desktop that could impact how your reports export from Expensify. Changes could include adjustments to your Chart of Accounts, Vendors, Employees, Customers/Jobs, or Items. 

Remember, both the Sync Manager and QuickBooks Desktop need to be running for syncing or exporting to work.

{% include faq-end.md %}
