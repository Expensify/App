---
title: QuickBooks Desktop
description: Connect Expensify to QuickBooks Desktop
order: 1
---

QuickBooks Desktop is an accounting software developed by Intuit, designed to support small and medium-sized businesses in managing financial and accounting tasks. Integrating Expensify with QuickBooks Desktop streamlines expense management for your organization.

---

## Step-by-Step: Connecting QuickBooks Desktop to Expensify

> **Important:**  
> To successfully connect, you must be logged into QuickBooks Desktop as an **Admin**, and the desired company file must be the **only open file**.

### 1. Set Up the Connection in Expensify
1. Log into Expensify and go to **Settings > Workspaces**.
2. Select the **workspace** you want to integrate with QuickBooks Desktop.
3. Navigate to the **Connections** tab and click **Connect to QuickBooks Desktop**.
4. Copy the provided link and paste it into the computer where QuickBooks Desktop is installed.  
   ![QuickBooks Desktop Setup Pop-Up Link](https://help.expensify.com/assets/images/QBO_desktop_01.png)

5. Choose your version of QuickBooks Desktop when prompted.  
   ![Version Selection Pop-Up](https://help.expensify.com/assets/images/QBO_desktop_02.png)

---

### 2. Install and Configure the Web Connector
1. Download and install the **QuickBooks Web Connector** following the on-screen instructions.
2. Open the Web Connector after installation.
3. Download the **configuration file** when prompted and open it in File Explorer. This will load the integration into the Web Connector automatically.

> **Tip:**  
> Ensure the correct company file is open in QuickBooks Desktop, and it is the **only open file** during setup.

---

### 3. Authorize Access and Finalize Setup
1. In QuickBooks Desktop, select **Yes, always allow access, even when QuickBooks is not running**, and click **Continue**.  
   ![Authorize Access in QuickBooks](https://help.expensify.com/assets/images/QBO_desktop_04.png)

2. Click **OK**, then select **Yes** to confirm.  
    ![Confirmation Pop-Up](https://help.expensify.com/assets/images/QBO_desktop_05.png)

3. In the Web Connector, click **Copy** to copy the password.  
    ![Password Copy in Web Connector](https://help.expensify.com/assets/images/QBO_desktop_06.png)

4. Paste the password into the Web Connector’s **Password** field and press **Enter**.  
    ![Enter Password in Web Connector](https://help.expensify.com/assets/images/QBO_desktop_08.png)

5. Click **Yes** to save the password. Your new connection will appear in the Web Connector.  
    ![Save Password in Web Connector](https://help.expensify.com/assets/images/QBO_desktop_07.png)

> **Pro Tip:**  
> Store the password securely in a trusted password manager for easy access during troubleshooting or updates.

---

# FAQs

**What are the requirements for using QuickBooks Desktop with Expensify?**
- **Hardware**: Refer to [Intuit’s recommended specifications](https://quickbooks.intuit.com/learn-support/en-us/help-article/install-products/system-requirements-quickbooks-desktop-2022/L9664spDA_US_en_US).
- **Software**: Windows 10 or 11 (latest service pack). Older versions of Windows may work but are unsupported. **Mac OS is not supported.**

---

**Which versions of QuickBooks Desktop are supported?**
Expensify supports the latest three versions of QuickBooks Desktop (US and Canada), adhering to [Intuit’s discontinuation policy](https://quickbooks.intuit.com/learn-support/en-us/help-article/feature-preferences/quickbooks-desktop-service-discontinuation-policy/L17cXxlie_US_en_US). Supported versions include:
- **Accountant**, **Pro**, **Pro Plus**, **Premier**, **Premier Plus**, and **Enterprise**.
- **Special editions**, such as:
  - Contractor
  - Manufacturing & Wholesale
  - Accountant
  - Professional Services
  - Nonprofit

---

**Can I install multiple QuickBooks Desktop connectors on one machine?**
Yes. Each connector corresponds to one company file, but multiple connectors can sync multiple company files from the same computer. Ensure you are logged into the correct company file during syncing.

---

**Can negative expenses be exported?**
- **Yes**, unless:
  - The export type is **Check**, as the report’s total must be positive.
  - Non-reimbursable expenses are exported as debit card transactions (QuickBooks exports them as non-reimbursable checks, which cannot have negative amounts).

---

This guide simplifies the integration process while ensuring it’s easily interpretable by both users and AI tools. Let me know if you’d like further adjustments!
