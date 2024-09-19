---
title: QuickBooks Desktop
description: Connect Expensify to QuickBooks Desktop
order: 1
---
# Overview
QuickBooks Desktop is an accounting package developed by Intuit. It is designed for small and medium-sized businesses to help them manage their financial and accounting tasks. You can connect Expensify to QuickBooks Desktop to make expense management seamless.

# Connect to QuickBooks Desktop

{% include info.html %}
To connect QuickBooks Desktop to Expensify, you must log into QuickBooks Desktop as an Admin, and the company file that you want to connect to Expensify must be the only one that is open. 
{% include end-info.html %}

1. In Expensify, hover over **Settings** and click on **Workspaces**.
2. Select the workspace you want to connect to QuickBooks Desktop.
3. Click the **Connections** tab. 
4. Click **Connect to QuickBooks Desktop**. 
5. Click Copy to copy the link, then paste the link into the computer where QuickBooks Desktop is running.

     ![QuickBooks Desktop Setup pop-up link, containing the URL to paste](https://help.expensify.com/assets/images/QBO_desktop_01.png){:width="100%"}

6. Select the version of QuickBooks Desktop that you currently have.

    ![The Web Connnector Pop-up to allow you to select the type of QuickBooks Desktop you have](https://help.expensify.com/assets/images/QBO_desktop_02.png){:width="100%"}

7. Download the Web Connector and go through the guided installation process.
8. Open the Web Connector. 
9. Click on **Add an Application**. 

    ![The Web Connnector Pop-up where you will need to click on Add an Application](https://help.expensify.com/assets/images/QBO_desktop_03.png){:width="100%"}

{% include info.html %}
For this step, it is key to ensure that the correct company file is open in QuickBooks Desktop and that it is the only one open.
{% include end-info.html %}

10. In QuickBooks Desktop, select **"Yes, always allow access, even when QuickBooks is not running"** and click **Continue**. 

    ![The QuickBooks Desktop pop-up, where you will need to select "Yes, always allow access, even when QuickBooks is not running"](https://help.expensify.com/assets/images/QBO_desktop_04.png){:width="100%"}

11. Click **OK**, then click **Yes**.

    ![The QuickBooks Desktop pop-up, where you will need to click "Ok" then select "Yes"](https://help.expensify.com/assets/images/QBO_desktop_05.png){:width="100%"}

12. Click **Copy** to copy the password.

    ![The Web Connector pop-up, where you will need to click "Copy"](https://help.expensify.com/assets/images/QBO_desktop_06.png){:width="100%"}

13. Paste the password into the Password field of the Web Connector and press **Enter**.

    ![The Web Connector pop-up, where you will need to paste the password into the password field](https://help.expensify.com/assets/images/QBO_desktop_08.png){:width="100%"}

14. Click **Yes** to save the password. The new connection now appears in the Web Connector.

    ![The Web Connector pop-up, where you will need to click "Yes"](https://help.expensify.com/assets/images/QBO_desktop_07.png){:width="100%"}

# FAQ

## What are the hardware and software requirements for the QuickBooks Desktop connector?

- Hardware requirements: You will need to ensure that the host machine meets [Intuit's recommended specifications](https://quickbooks.intuit.com/learn-support/en-us/help-article/install-products/system-requirements-quickbooks-desktop-2022/L9664spDA_US_en_US) for running QuickBooks Desktop.
- Software requirements: Windows 10 or Windows 11 with the latest service pack(s) installed. Users have successfully run the connector on older versions of Windows; however, we do not officially support this due to Microsoft's withdrawal of support for these operating systems. The web connector will not run on Mac OS.

## What versions of QuickBooks Desktop are supported?

Expensify’s QuickBooks Desktop integration follows [Intuit’s service discontinuation policy](https://quickbooks.intuit.com/learn-support/en-us/help-article/feature-preferences/quickbooks-desktop-service-discontinuation-policy/L17cXxlie_US_en_US) for QuickBooks Desktop and fully supports the following versions, version tiers, and special editions:

- The latest three versions of:

    - QuickBooks Desktop (US)
    - QuickBooks Desktop (Canada)

- Version tiers:

    - Accountant
    - Pro
    - Pro Plus
    - Premier
    - Premier Plus
    - Enterprise

- Special editions:

    - Contractor edition
    - Manufacturing and Wholesale edition
    - Accountant edition
    - Professional Services edition
    - Nonprofit edition

## Can multiple QuickBooks Desktop Connectors be installed on the same machine?

Yes. You must have one connector per company file, but you can install multiple QuickBooks Desktop Connectors to sync multiple company files to Expensify from the same computer. 

If syncing multiple companies, make sure you’re logged in to the correct QuickBooks company file when syncing between QuickBooks and Expensify.

## Can I export negative expenses?

Generally, yes. However, if you have Check selected as your export option, the report’s total cannot be negative. This also applies to non-reimbursable expenses exported as debit card transactions. Because QuickBooks Desktop does not have debit card functionality, the transactions export as a non-reimbursable check, which must have a positive total amount. 
