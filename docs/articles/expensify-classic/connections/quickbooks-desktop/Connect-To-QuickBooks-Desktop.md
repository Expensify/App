---
title: QuickBooks Desktop
description: How to connect Expensify to QuickBooks Desktop and troubleshoot issues.
order: 1
---
# Overview
QuickBooks Desktop is an accounting package developed by Intuit. It is designed for small and medium-sized businesses to help them manage their financial and accounting tasks. You can connect Expensify to QuickBooks Desktop to make expense management seamless.
To connect Expensify with QuickBooks Desktop, using Right Networks as your hosting platform is best. Right Networks is a cloud-based service we recommend for this integration. If you need a Right Networks account, complete [this form](https://info.rightnetworks.com/partner-expensify) and contact a Sales Consultant to start the process.

# How to connect to QuickBooks Desktop
Before you link your Expensify policy with QuickBooks Desktop, ensure you log in as an Admin in QuickBooks. Also, check that the company file you want to connect to is the only one open.

## Set up submitters in QuickBooks Desktop
For a seamless integration, here are the steps to follow:
* Make sure all report submitters are set up as Vendors in QuickBooks Desktop and their Expensify email is in the "Main Email" field of their Vendor record. You can do this in the vendor section of QuickBooks.
* If you want to export reports to your users' employee records instead of vendor records, select Check or Journal Entry as your reimbursable export option.
* To set up Expensify users as employees, activate QuickBooks Desktop Payroll. This module is necessary to access the Employee Profile tab, where you can enter the submitter's email addresses.
  
## Enable/install the Expensify Sync Manager
Navigate to **Settings** > **Policies** > **Group** > _[Policy Name]_ > **Connections**, select the Connect to QuickBooks Desktop radio button and click Connect to QuickBooks.

**Enable the Expensify Sync Manager in Right Networks (recommended)**
*Please note: Single-user mode in QuickBooks Desktop is required.* 
If you don't yet have an account with Right Networks, you must first contact Right Networks [here](https://info.rightnetworks.com/partner-expensify). You can enable the Expensify Sync Manager yourself from your Right Networks portal's **My Account** section or contact Right Networks for assistance. 

**OR, install the Expensify Sync Manager on Your Third-Party Remote Desktop.**
To download the Sync Manager to your desktop, you must contact your third-party remote desktop provider and request permission. They might have security restrictions, so it's best to communicate with them directly to avoid potential problems with the Sync Manager. Remember that the Sync Manager program file should be stored in the same location (i.e., the same drive) as your QuickBooks Desktop program.

## Complete the connection
1. Open QuickBooks and access your desired Company File using the QuickBooks Admin credentials. Admin credentials are necessary for creating the connection due to permission requirements, but you won't need to stay logged in as an admin for syncing or exporting.
2. Navigate to your Expensify policy settings by going to **Settings** > **Policies** > **Group** > _[Policy Name]_ > **Connections**. Copy the Token by selecting the copy icon.
3. While QuickBooks is still running, launch the Expensify Sync Manager. Paste your Token into the Sync Manager and click **Save**.
4. Once the Sync Manager status displays **Connected**, return to Expensify and click the *Continue* button.

## Allow access
1. Return to QuickBooks, and you'll encounter an **Application Certificate** screen. On the first page of the Certificate screen, click **Yes, always; allow access even if QuickBooks is not running** and then click **Continue**.
2. On the second page of the Certificate screen, choose the Admin user from the dropdown menu, and then click *Done* to complete this step. Note that selecting Admin here does not require you to be logged in as an admin to use this connection; it's simply selecting the appropriate permissions.
3. Head back to Expensify and patiently wait for the sync process to finish, then move on to the configuration.

Next Step: (Read)[https://296eb113.helpdot.pages.dev/articles/expensify-classic/connections/quickbooks-desktop/Configure-Quickbooks-Desktop] how to configure export settings and coding for QuickBooks Desktop 

{% include faq-begin.md %}

3. If the Sync Manager status is already **Connected**, click **Edit** and then *Save* to refresh the connection. Afterwards, try syncing your policy again.
4. If the error persists, double-check that the token you see in the Sync Manager matches the token in your connection settings.

{% include faq-end.md %}
