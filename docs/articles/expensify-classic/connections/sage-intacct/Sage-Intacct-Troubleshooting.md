---
title: Sage Intacct Troubleshooting
description: Sage Intacct Troubleshooting
---

# Overview of Sage Intacct Troubleshooting
Synchronizing and exporting data between Expensify and Sage Intacct can streamline your financial processes, but occasionally, users may encounter errors that prevent a smooth integration. These errors often arise from discrepancies in settings, missing data, or configuration issues within Sage Intacct or Expensify.

This troubleshooting guide aims to help you identify and resolve common sync and export errors, ensuring a seamless connection between your financial management systems. By following the step-by-step solutions provided for each specific error, you can quickly address issues and maintain accurate and efficient expense reporting and data management.

## Sage Intacct experienced the following error trying to synchronize your workspace: Authentication error

**Why does this happen?**

This error occurs because the connection could not be authorized using the credentials supplied to Expensify.

**How to Fix It**

To resolve this issue, follow these steps:

1. **Check Credentials:** Ensure you are using the correct credentials for your xmlgateway\_expensify web services user when attempting to connect your workspace to Intacct.
2. **Add Expensify to Web Services Authorizations:**
3. In Sage Intacct, click the Applications menu and hover over **Company**.
4. Click the **Setup** tab at the top of the menu list, then select **Company**.
5. Click the **Security** tab at the top, then click **Edit** in the top right.
6. Scroll down to Web Services Authorizations and add “expensify” (all lower case) as a Sender ID.
7. Click **Save**.

3. **Retry Connection:** After making these changes, try syncing or connecting your workspace again.

**Additional Steps if Error Persists**

Try removing and re-adding Expensify from the Web Services authorizations list entirely. This can help clear the error.

## Company Card Expenses Exporting to the Wrong Account

Behavior: Company card transactions are exporting to the wrong place in your accounting system.

**Why Does This Happen?**

Several factors can cause this issue, including incorrect account mapping, improper export settings, or user permissions.

**How to Fix It**

**Check how the Expense was imported**

* **Imported from Company Card**: Only expenses shown with the locked card icon can use the export mapping settings configured through Domain Control.
* **Other Imports**: Expenses imported from cards linked at the individual account level, SmartScanned receipts, and manually created cash expenses will export to the default account set in your connection’s configuration settings.

**1. Confirm Card Mapping**

Ensure that the company cards have been correctly mapped to the appropriate accounts through Domain Control.

**2. Merge SmartScanned Receipts**

If SmartScanned receipt expenses should have been merged with imported Company Card expenses, follow these troubleshooting steps:

• Verify if the expenses did not merge automatically.

• Manually merge them if necessary.

**3. Verify Export Options in Sync Settings**

Even with correct card-to-account mapping in Domain Control, you need to select the correct export option:

• Go to Settings &gt; Workspaces &gt; Group &gt; [Workspace Name] &gt; Connections &gt; Configure.

• Choose “Credit Card” as your non-reimbursable export option if you’ve mapped to specific Credit Card accounts.

**4. Ensure Domain Admin Permissions**

The user exporting the report must be a Domain Admin:

• Check the Report Comments section at the bottom of an individual report to see who exported it.

• For automatic exports by Concierge, ensure the Preferred Exporter under Settings &gt; Workspaces &gt; Group &gt; [Workspace Name] &gt; Connections &gt; Configure is a Domain Admin.

If the exporter is not a Domain Admin, all company card expenses will export to the default account specified in the Non-Reimbursable section of your Export configuration settings.

**5. Correct Workspace Mapping**

For multiple workspaces connected to the same accounting system:

• Ensure you choose an account listed under the same workspace as the report you are exporting.

• Otherwise, expenses will export to the default account.

## Credit Card Configuration is Missing

**Sage Intacct: Credit Card Configuration is Missing / You haven't yet set up credit cards in Sage Intacct**

When attempting to export non-reimbursable (company card) expenses to Sage Intacct, you may encounter an error stating “Credit Card Configuration is Missing” or “Charge Card Configuration is Missing.” This occurs because Sage Intacct requires a credit card account to be set up in order to export these expenses as credit card transactions.

**Why Does This Happen?**

This error arises because non-reimbursable expenses need to be exported as credit card transactions in Sage Intacct. Without a properly configured credit card account, Sage Intacct cannot process these transactions.

**How to Fix It**

**Step-by-Step Guide to Setting Up Credit Card Accounts in Sage Intacct:**

1. **Navigate to Charge Card Accounts Setup:** Go to **Cash Management** &gt; **Setup** &gt; **+ Charge Card Accounts**.
2. **Fill in the Mandatory Fields:**
* **ID:** This is the name that will appear in the dropdown in Expensify. Choose a name that is easily recognizable.
* **Type**
* **Payment Method:** Select “Credit.”
* **Expiration:** This field must be filled out, but the specific date is not crucial if you have a single roll-up card account.
* **Credit-card offset account:** This is the account credited when the expense posts.
* **Default location:** Choose the location where you want transactions to be associated.
* **Vendor ID:** Likely the bank or card vendor that you will be paying.
3. **Link the Account in Expensify:**
* Go to **Expensify** &gt; **Settings** &gt; **Workspaces** &gt; **Group** &gt; [Workspace Name] &gt; **Connections** &gt; **Configure** &gt; **Export**.
* Select the credit card account you set up in Sage Intacct.
* Click “Save.”

**Note:** If you have multiple credit card accounts, follow the specific instructions provided by Expensify for configuring these accounts, as the process may differ slightly. By ensuring you have the correct credit card accounts set up in Sage Intacct and linked in Expensify, you can successfully export non-reimbursable expenses without encountering the configuration error.

## Expensify Not Displaying Customers/Projects

**Behavior:** Expensify is not displaying customers or projects from Sage Intacct.

**Why Does This Happen?**

This issue is most likely due to insufficient permissions. The web services user (the user that “owns” the Sage Intacct connection in Expensify) needs to have specific permissions to access the necessary data.

**How to Fix It:**

1. **Verify Permissions**:
* Ensure the web services user has “Read-Only” permissions for the Accounts Receivable (AR) module in Sage Intacct.
* Navigate to: Company &gt; Users &gt; Subscriptions (for the web services user) &gt; Permissions (for AR).
* Select the “Read Only” radio button option.
* Click “Save”.
2. Sync the Connection:
* Go to: Expensify &gt; Settings &gt; Workspaces &gt; Group &gt; [Workspace Name] &gt; Connections &gt; Sync Now.

By following these steps, the web services user will have the necessary permissions, and you should be able to see customers and projects from Sage Intacct in Expensify.
![image.png](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdjlQYu9m1qhyn5mY6I8BXH9Fqg1LWJaJIHYEK57FaqE0R9gmAjAgrCKwcbqRZjG6SZ_qH_fEeW0mPU0WGFThj_z-KA3Lyk8ycpqWXxZKE-66scTlXM3mci5_XnIVH-8pgRfhjFw2ofqYa73Dup6b4Y5ms?key=x7ojFwv9R6uhOdjeG2XNKQ)[![image.png](https://lh7-rt.googleusercontent.com/docsz/AD_4nXemSU0jy3Ilc8NHWN2QdcJYU8DZPx4TN-9f7DP3bgex5v5YyVgOxNQBrk-B12rQ6BUTDzriHgXTO5HW4wSr463Vg5RClK5JnQv_tMuK8xTWuPJ5byYktMUsTk57g4rnQh5DyEQ7D3d-29Z-yX_w1BW6o1sd?key=x7ojFwv9R6uhOdjeG2XNKQ)](https://community.expensify.com/home/leaving?allowTrusted=1&amp;target=https%3A%2F%2Fus.v-cdn.net%2F6030147%2Fuploads%2F949%2FO4MBRASZ0QAR.png)
## ExpensiError INT009: The Employee Manager Does Not Have a User Associated

Error Message:

If you encounter the error message “ExpensiError INT009” when attempting to export your report, follow the steps below to resolve it.

**Why Does This Happen?**

This error occurs if the manager set for a particular employee record in Sage Intacct does not have a user account in Sage Intacct. This situation typically arises when using Sage Intacct’s approval settings.

**How to Fix It**

If You Are Not Using Sage Intacct Approvals:
1. Disable Expense Report Approval in Sage Intacct:
1. Navigate to **Sage Intacct**
2. Go to **Time & Expenses** &gt; **Configure Time & Expenses**.
3. Uncheck **Enable expense report approval**.
2. Sync Expensify:
1. Open **Expensify**.
2. Go to **Settings** &gt; **Workspaces** &gt; **[Workspace Name]** &gt; **Connections**.
3. Click **Sync Now**.

If You Are Using Sage Intacct Approvals:
1. Set the First Approver in Sage Intacct:
1. Navigate to **Sage Intacct**.
2. Go to **Time & Expenses** &gt; **Configure Time & Expenses**.
3. Under **Expense Report approval settings**, set the **First approver** to a user who is an admin in Sage Intacct.

Following these steps should resolve the error and allow you to export your report successfully.

## ExpensiError INT012: "Reason for expense" note is invalid

**Why Does This Happen?**

This error occurs because Sage Intacct has a setting enabled that requires a “Reason for expense” note. When this setting is enabled, it can interfere with the export of expense reports, leading to the “ExpensiError INT012.”

**How to Fix It**

To resolve this issue, follow these steps to disable the “Reason for expense” requirement in Sage Intacct:
1. **Log in to Sage Intacct.**
2. **Navigate to Time & Expenses:** Go to the main menu and select **Time & Expenses**.
3. **Access Configuration Settings:** Under Time & Expenses, select **Configure Time & Expense**.
4. **Adjust Expense Report Requirements:**
1. Find the section labeled **Expense report requirements**.
2. Uncheck the box next to **Reason for expense**.
![image.png](https://lh7-rt.googleusercontent.com/docsz/AD_4nXc6kXptM7sekVPz7DD9a_BRVTscd0MDZIuwlKl_HOaJrWrvVkmy-QR-ZzVZCMdIQwtkl3of3_LJqcIgjscY45D3gYiOZ-N-oE8dnQmVQJ0ViZGlX-Qvga2N42B0oEMsgdtFNWO9PmUG6NCBl8zUwgDjOPSx?key=x7ojFwv9R6uhOdjeG2XNKQ)

## ExpensiError INT028: Use of an empty location is invalid

**Why Does This Happen?**

This error occurs when Locations are mapped to the Sage Intacct employee default setting in the Expensify integration sync options menu, and your Sage Intacct configuration requires Locations to be specified. If a Location is not specified for an employee, the export will fail.

**How to Fix It**

1. **Specify a Location for the Employee in Sage Intacct:**
1. Go to your Sage Intacct account.
2. Find the employee who needs a Location specified.
3. Update their profile to include a Location.
2. **Sync the Sage Intacct Connection in Expensify:**
1. Open Expensify and go to **Settings**.
2. Select **Workspaces** and then **Groups**.
3. Choose the relevant **Workspace Name**.
4. Click on **Connections** and then **Sync Now**.
3. **Re-export the Report:**
1. Locate the report that triggered the error.
2. Attempt to export it again. The error should be resolved if the Location is correctly specified and synced.
![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdwWeKllyWIbCKk-hVd2BFJ23ckHXTPSsCYzOD-unnoeDOT8looVe_M8C3y8rK19hLaAKWbsztg2KJwsT5Im9a9hMZgDK_cZjNk6aZZMf-IRxlSM562AupahtvKc1N3MVa-lKa-iXpN3UKIsIN6iFNmFPef?key=x7ojFwv9R6uhOdjeG2XNKQ)

## ExpensiError INT043: Not Authorized to Execute This Function

**Why Does This Happen?**

This error occurs when the xml\_gateway user lacks the necessary permissions to execute specific functions in Sage Intacct. Permissions can be set either based on individual users or roles within the system.

**How to Fix It**

To resolve this error, follow these steps to enable the required permissions for the xml\_gateway user.
1. **Determine Permission Type:**
* **User-Based Permissions:** Navigate to: Company &gt; Users &gt; Subscriptions
* **Role-Based Permissions:** Navigate to: Company &gt; Roles &gt; Subscriptions
2. **Set Permissions:**Ensure the following permissions are enabled for all relevant modules in your Sage Intacct account:
* **Administration:** All
* **Company:** Read-only
* **Cash Management:** All
* **Time and Expense:** All
* **General Ledger:** All
* **Projects:** Read-only
* **Accounts Payable:** All
3. **Sync Connection in Expensify:**
* Go to: Settings &gt; Workspaces &gt; [Workspace Name] &gt; Connections
* Click on Sync Now
4. **Retry Export:** Attempt to export again in Expensify.

## ExpensiError INT054: No Sage Intacct employee found for X

**Why Does This Happen?**

This error occurs when Expensify cannot find a corresponding employee record in Sage Intacct for the specified email address. This can happen due to:
1. The employee not being set up in Sage Intacct.
2. A mismatch in email addresses between Expensify and Sage Intacct.
3. Duplicate employee records with the same email address in Sage Intacct.

**How to Fix It**

1. **Employee Not Set Up or Email Address Mismatch**:
1. **Step 1**: Go to Sage Intacct.
2. **Step 2**: Navigate to **Time & Expenses &gt; + Employee**.
3. **Step 3**: Create the employee if they are not already set up.
4. **Step 4**: Ensure the email address in Sage Intacct matches the one in Expensify.
5. **Step 5**: Sync the Sage Intacct connection in Expensify. **Path**: Settings &gt; Workspaces &gt; Group &gt; [Workspace Name] &gt; Connections &gt; Sync Now.
2. **Duplicate Employee Records**:
1. **Step 1**: Go to Sage Intacct.
2. **Step 2**: Identify and delete any duplicate employee records with the same email address.
3. **Step 3**: Sync the Sage Intacct connection in Expensify. **Path**: Settings &gt; Workspaces &gt; Group &gt; [Workspace Name] &gt; Connections &gt; Sync Now.
