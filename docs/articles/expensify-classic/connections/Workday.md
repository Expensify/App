---
title: Workday-Integration.md
description: Learn how to integrate Workday with Expensify to automatically sync employees and manage user provisioning.
keywords: [Workday, Expensify, integration, employee sync, API, HR integrations]
---

<div id="new-expensify" markdown="1">

Expensify’s integration with Workday allows businesses to automatically sync employees, update approval workflows, and manage user provisioning. This guide walks you through setting up an Advanced Custom Report in Workday and enabling the integration with Expensify.

---

# Workday Integration with Expensify

By using Expensify's [Employee Updater API](https://integrations.expensify.com/Integration-Server/doc/employeeUpdater/), you can create a seamless integration between Workday and Expensify. This integration enables:

- **Automatic Employee Provisioning:** New employees are invited to the correct Expensify workspace based on their start date.
- **Real-Time Updates:** Changes to employee email addresses and managers sync automatically.
- **Deprovisioning Employees:** Employees can be removed from Expensify upon termination.

**Note:** The Expensify API is a self-serve tool. While your Account Manager can provide guidance, configuration is managed on your end.

---

# Setting Up an Advanced Custom Report in Workday

To integrate Workday with Expensify, you need to create an **Advanced Custom Report** in Workday. This report:

- Maps Workday column data to an Expensify workspace.
- Imports employee names, email addresses, and manager emails.
- Sets the employee’s **Submits To** field in Expensify.
- Configures **Custom Fields 1 & 2**, typically used for Employee ID, Cost Center, or Legal Entity.
- Adds employees to specific **Domain Groups**.
- Auto-assigns **Expensify Cards**.

**Prerequisite:** You need a Workday System Administrator to create an **Integration System User** and **Integration System Security Group**.

## Step 1: Create an Integration System User

1. Search **Create User** and select **Create Integration System User**.
2. Set a password and configure the following:
   - Uncheck **Require New Password at Next Sign In**.
   - Set **Session Timeout Minutes** to `0`.
   - Check **Do Not Allow UI Sessions**.
3. Click **OK**.

## Step 2: Create a Security Group

1. Search **Create Security Group** and select **Create Security Group**.
2. Choose **Constrained** as the security group type.
3. Specify the **Organizations** that will sync data.
4. Add the **Integration System User** to the **Security Group**.
5. Search **Security Group Membership and Access**, then:
   - Locate the security group you just created.
   - Click the ellipsis, then select **Security Group > Maintain Domain Permissions for Security Group**.
   - Under **Integration Permissions**, grant **Get access** for:
     - **External Account Provisioning**
     - **Worker Data: Workers**
   - Click **OK**, then **Done**.
6. Search **Activate Pending Security Workspace Changes**, then:
   - Confirm the activation.
   - Add a comment (if required).
   - Check the **Confirmed** box.

## Step 3: Create the Advanced Custom Report

To create an **Advanced Custom Report** in Workday:

1. Search **Create Custom Report** and select **Create Custom Report**.
2. Enter the report details:
   - **Name**: Assign a descriptive name.
   - **Report Type**: Select **Advanced**.
   - **Enable As Web Service**: Check this box.
   - **Optimized for Performance**: Uncheck this box.
   - **Data Source**: Select **All Active and Terminated Employees**.
3. Click **OK**.
4. Select the **Column Data** to sync with Expensify. Required fields are marked with `*`:
   - **First Name**
   - **Last Name**
   - **Primary Work Email** `*`
   - **Employee ID** `*`
   - **Expensify Workspace ID** `*`
   - **Worker’s Manager [Primary Work Email]** `*`
   - **Domain Group ID** *(if applicable)*
   - **Cost Center**
   - **Entity ID** *(Legal Entity)*
   - **Active/Inactive**
   - **Termination Date**

   **Note:** If you need additional fields, contact your Expensify Account Manager.

5. Rename columns to match Expensify's API key names:
   - `employeeID`
   - `customField1`
   - `customField2`
   - `firstName`
   - `lastName`
   - `employeeEmail`
   - `managerEmail`
   - `workspaceID`
   - `domainGroupID`
   - `approvesTo`

6. Go to the **Share** tab and share the report with your **Integration System User** and **Security Group**.

---

# Enabling Report as a Service (RAAS) in Workday

To enable the report for API access:

1. Search **View Custom Report** and open **My Reports**.
2. Select the report and click **OK**.
3. Click **Actions > Web Service > View URLs**, then **OK**.
4. Scroll to the **JSON** section.
5. Right-click **JSON** and select **Copy URL**.

---

# Activating the Workday Integration

To automate the sync, follow Expensify’s API reference [here](https://integrations.expensify.com/Integration-Server/doc/employeeUpdater/#api-principles).

Alternatively, Expensify can perform the sync on your behalf:

## Step 1: Generate Expensify API Credentials

1. Log into Expensify with an account that has **Workspace Admin** and **Domain Admin** access.
2. Go to [Expensify Integrations](https://www.expensify.com/tools/integrations/) to find your `partnerUserID` and `partnerUserSecret`.

## Step 2: Connect Expensify to Workday

1. Navigate to **Settings > Workspaces > Group > [Workspace Name] > Connections > HR Integrations**.
2. Click **Connect to Workday**.
3. Fill out the form with the following details:
   - `partnerUserID`
   - `partnerUserSecret`
   - **Workday ISU Username** (e.g., `ISU_Expensify`)
   - **Workday Password**
   - **Workday REST Web Services URL**
   - **Preferred go-live date** *(YYYY/MM/DD or leave blank)*
   - **Expensify Card Auto-Assignment?** (Y/N)
     - **Note:** Auto-assignment applies when a Smart Limit is enabled for a Group.
   - **Deprovision Users?** (Y/N)

## Step 3: Submit and Finalize Integration

Once submitted, your Expensify Account Manager will configure a recurring sync using the Workday Web Services URL and the mappings specified.

If additional information is required, Expensify will reach out via direct message.

---

</div>
