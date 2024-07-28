---
title: Quickbooks Desktop Troubleshooting
description: Quickbooks Desktop Troubleshooting
---

# Sync and export errors
## Error: No Vendor Found For Email in QuickBooks
To address this issue, ensure that each submitter's email is saved as the **Main Email** in their Vendor record within QuickBooks Desktop. Here's how to resolve it:
1. Go to your Vendor section in QuickBooks.
2. Verify that the email mentioned in the error matches the **Main Email** field in the respective vendor's record. It's important to note that this comparison is case-sensitive, so ensure that capitalization matches as well.
3. If you prefer to export reports to your users' employee records instead of their vendor records, select either **Check** or **Journal Entry** as your reimbursable export option. If you are setting up Expensify users as employees, activate QuickBooks Desktop Payroll to access the Employee Profile tab where submitter email addresses need to be entered.
4. Once you've added the correct email to the vendor record, save this change, and then sync your policy before attempting to export the report again.

## Error: Do Not Have Permission to Access Company Data File
To resolve this error, follow these steps:
1. Log into QuickBooks Desktop as an Admin in single-user mode.
2. Go to **Edit** > **Preferences** > **Integrated Applications** > **Company Preferences**.
3. Select the Expensify Sync Manager and click on **Properties**.
4. Ensure that **Allow this application to login automatically** is checked, and then click **OK**. Close all windows within QuickBooks.
5. If you still encounter the error after following the above steps, go to **Edit** > **Preferences** > **Integrated Applications** > **Company Preferences**, and remove the Expensify Sync Manager from the list.
6. Next, attempt to sync your policy again in Expensify. You'll be prompted to re-authorize the connection in QuickBooks.
7. Click **Yes, always; allow access even if QuickBooks is not running.**
8. From the dropdown, select the Admin user, and then click **Continue**. Note that selecting **Admin** here doesn't mean you always have to be logged in as an admin to use the connection; it's just required for setting up the connection.
9. Click **Done** on the pop-up window and return to Expensify, where your policy should complete the syncing process.

## Error: The Wrong QuickBooks Company is Open.
This error suggests that the wrong company file is open in QuickBooks Desktop. To resolve this issue, follow these steps:
1. First, go through the general troubleshooting steps as outlined.
2. If you can confirm that the incorrect company file is open in QuickBooks, go to QuickBooks and select **File** > **Open or Restore Company** > _[Company Name]_ to open the correct company file. After doing this, try syncing your policy again.
3. If the correct company file is open, but you're still encountering the error, completely close QuickBooks Desktop, reopen the desired company file and then attempt to sync again.
4. If the error persists, log into QuickBooks as an admin in single-user mode. Then, go to **Edit** > **Preferences** > **Integrated Applications** > **Company Preferences** and remove the Expensify Sync Manager from the list.
5. Next, try syncing your policy again in Expensify. You'll be prompted to re-authorize the connection in QuickBooks, allowing you to sync successfully.
6. If the error continues even after trying the steps above, double-check that the token you see in the Sync Manager matches the token in your connection settings.

## Error: The Expensify Sync Manager Could Not Be Reached.
To resolve this error, follow these steps:
*Note: You must be in single-user mode to sync.*

1. Ensure that both the Sync Manager and QuickBooks Desktop are running.
2. Confirm that the Sync Manager is installed in the correct location. It should be in the same location as your QuickBooks application. If QuickBooks is on your local desktop, the Sync Manager should be there, too. If QuickBooks is on a remote server, install the Sync Manager there.
Verify that the Sync Manager's status is **Connected**.
3. If the Sync Manager status is already **Connected**, click **Edit** and then *Save* to refresh the connection. Afterwards, try syncing your policy again.
4. If the error persists, double-check that the token you see in the Sync Manager matches the token in your connection settings.

{% include faq-end.md %}
