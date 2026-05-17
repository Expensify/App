---
title: QuickBooks Desktop FAQ
description: Learn how to troubleshoot common QuickBooks Desktop export issues, including failed exports, manual export restrictions, company card mapping, disconnecting the integration, and QBWC1039 errors.
keywords: QuickBooks Desktop export FAQ, report not exporting QuickBooks Desktop, manually export report, company card exporting to wrong account, disconnect QuickBooks Desktop, negative expense export, QBWC1039, Unique OwnerID FileID pair value required, CP3 tool, Rightworks hosted QuickBooks, Web Connector error, Expensify QuickBooks Desktop troubleshooting, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers common export and configuration questions and Web Connector errors. Does not cover specific QuickBooks Online errors.
---

# QuickBooks Desktop FAQ

## Why Is My Report Not Exporting to QuickBooks Desktop?

An error is preventing the report from exporting.

You can find the error in several places:

- The preferred exporter (as set in Workspace accounting settings) receives an email with error details.
- The error appears in the report’s comment section.
- Automatic exports are paused until the issue is resolved.

### How to Resolve Export Errors

1. Open the report in Expensify.
2. Review the error message in the comments.
3. Make the required corrections.
4. Once resolved, a Workspace Admin can manually export the report.

Automatic exports will resume after errors are cleared.

---

## Why Am I Unable to Manually Export a Report to QuickBooks Desktop?

Only reports in one of the following statuses can be exported:

- Approved
- Done
- Paid

If the report is in Draft status, the export button may load an empty screen.

### How to Resolve Manual Export Issues

1. Submit the report if it is in Draft status.
2. Have an approver approve the report if it is Outstanding.
3. Once the report is Approved, Done, or Paid, a Workspace Admin can manually export it.

---

## Why Are Company Card Expenses Exporting to the Wrong Account?

This usually means the company card export account is not configured correctly.

### How to Confirm the Company Card Export Account

1. Go to **Settings**.
2. Select **Domains**.
3. Click **Company Cards**.
4. Click **Edit export** for the affected card.
5. Confirm the correct QuickBooks Desktop account is selected.
6. Click **Save**.

Also confirm:

- Expenses display the **Card + Lock** icon.
- The preferred exporter is a **Domain Admin**.

If the preferred exporter is not a Domain Admin, exports may default to the fallback company card account.

To check the exporter role:

1. Go to **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Export** tab.

---

## How Do I Disconnect the QuickBooks Desktop Connection?

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click the gray **Disconnect** button under the connection.
6. Confirm to disconnect.

Note: Disconnecting clears all imported options from Expensify.

---

## Can I Export Negative Expenses to QuickBooks Desktop?

Yes. QuickBooks Desktop accepts negative expenses across all export types.

---

## Why Am I Seeing the QBWC1039 Error?

If you see:

> QBWC1039: Unique OwnerID/FileID pair value required

This means the Expensify application is already registered in QuickBooks Web Connector and a second registration is being attempted. QuickBooks requires each application to have a unique OwnerID/FileID pair. If one already exists, the new registration is rejected.

## How to fix the QBWC1039 error

## How to remove the existing Owner ID using the CP3 tool

You'll need the [CP3 tool from Intuit](https://http-download.intuit.com/http.intuit/CP3Tool/QBWC_CP3Tool.exe) to remove the existing Owner ID stamp.

1. Open **QuickBooks Desktop**.
2. Download and open the CP3 tool.
3. Select **Select the file**, then search for your QWC configuration file.
4. Select **Open**, then click **Remove Stamp**.
5. On the **QuickBooks Application Certificate** window, select **Yes**, then **Continue**.
6. On the **Access Confirmation** window, select **Done**.
7. Follow the remaining instructions, then select **OK**.
8. You should see a confirmation that the Owner ID was removed. Select **OK**.
9. Exit and reopen both **QuickBooks Desktop** and **Web Connector**.

## How to re-add the Expensify application in Web Connector

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now** to re-initiate the connection.

QuickBooks Desktop will prompt you to approve the Application Certificate.

1. Select **Yes, always; allow access even if QuickBooks is not running**.
2. Choose the **Admin** user from the dropdown.
3. Click **Continue**.
4. **Important:** Proceed to the password screen and save the password when prompted. This step must not be skipped.
5. Click **Done** in the confirmation window.

Return to Expensify and allow the Workspace to finish syncing.

## How to fix the QBWC1039 error when QuickBooks Desktop is hosted (e.g., Rightworks)

If your QuickBooks Desktop is hosted in a remote/cloud environment (such as Rightworks or another hosting provider), you will likely **not** be able to run the CP3 tool yourself. In this case:

1. Contact your hosting provider's support team and request that they remove the existing Owner ID stamp using the CP3 tool. For example, Rightworks support is available at **(888) 417-4448, option 2** (available 24/7). They can perform a screenshare via phone and set up a three-way call if needed.
2. Your hosting provider may need to close your remote desktop session to make the changes.
3. **Important:** After the hosting provider completes their changes, you must use the **same QWC configuration file** you originally saved. Do not generate a new one.
4. Reconnect the Expensify application following the steps in **How to re-add the Expensify application in Web Connector** above.
