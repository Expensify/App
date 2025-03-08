---
title: QuickBooks Desktop
description: Easily connect Expensify to QuickBooks Desktop for streamlined expense management and accounting.
order: 1
---

QuickBooks Desktop is accounting software developed by Intuit, designed for small and medium-sized businesses to manage financial tasks. Connecting Expensify to QuickBooks Desktop makes expense management seamless.

This guide walks you through connecting Expensify to QuickBooks Desktop, ensuring a smooth integration for managing your business expenses efficiently.

---

# Connect to QuickBooks Desktop

{% include info.html %}
To connect QuickBooks Desktop to Expensify, you must log into QuickBooks Desktop as an Admin. The company file you want to connect must be the only one open.
{% include end-info.html %}

1. In Expensify, click your profile image or icon in the bottom-left menu.
2. Scroll down and click **Workspaces** in the left menu.
3. Select the workspace to connect to QuickBooks Desktop.
4. Click **More features** in the left menu.
5. In the **Integrate** section, enable the **Accounting** toggle.
6. Click **Accounting** in the left menu.
7. Click **Set up** next to QuickBooks Desktop.
8. Click **Copy** to copy the link. Paste this link into the computer running QuickBooks Desktop.
9. Select your QuickBooks Desktop version.

    ![QuickBooks Desktop version selection](https://help.expensify.com/assets/images/QBO_desktop_02.png){:width="100%"}

10. Download the Web Connector and follow the installation instructions.
11. Open the Web Connector.
12. When prompted during setup, download the config file and open it using File Explorer. This will automatically load the application into the QuickBooks Web Connector.

{% include info.html %}
Ensure the correct company file is open in QuickBooks Desktop and is the only one open.
{% include end-info.html %}

13. In QuickBooks Desktop, select **Yes, always allow access, even when QuickBooks is not running**, then click **Continue**.

    ![QuickBooks Desktop access permission](https://help.expensify.com/assets/images/QBO_desktop_04.png){:width="100%"}

14. Click **OK**, then click **Yes**.

    ![QuickBooks Desktop confirmation](https://help.expensify.com/assets/images/QBO_desktop_05.png){:width="100%"}

15. Click **Copy** to copy the password.

    ![Copy Web Connector password](https://help.expensify.com/assets/images/QBO_desktop_06.png){:width="100%"}

16. Paste the password into the Password field of the Web Connector and press **Enter**.

    ![Paste password in Web Connector](https://help.expensify.com/assets/images/QBO_desktop_08.png){:width="100%"}

17. Click **Yes** to save the password. The new connection will appear in the Web Connector.

    ![Save Web Connector password](https://help.expensify.com/assets/images/QBO_desktop_07.png){:width="100%"}

{% include info.html %}
Securely save this password in a trusted password manager. You'll need it for future configuration updates or troubleshooting.
{% include end-info.html %}

---

# FAQ

## What are the hardware and software requirements for QuickBooks Desktop connector?

- **Hardware requirements**: Ensure the host machine meets [Intuit's recommended specifications](https://quickbooks.intuit.com/learn-support/en-us/help-article/install-products/system-requirements-quickbooks-desktop-2022/L9664spDA_US_en_US).
- **Software requirements**: Windows 10 or 11 with the latest service packs installed. Users have run the connector on older Windows versions, but we don't officially support them. The Web Connector doesn't run on Mac OS.

## What versions of QuickBooks Desktop are supported?

Expensify follows [Intuit’s service discontinuation policy](https://quickbooks.intuit.com/learn-support/en-us/help-article/feature-preferences/quickbooks-desktop-service-discontinuation-policy/L17cXxlie_US_en_US) and supports these versions:

- **Latest three versions** of QuickBooks Desktop (US, Canada)
- **Version tiers**: Accountant, Pro, Pro Plus, Premier, Premier Plus, Enterprise
- **Special editions**: Contractor, Manufacturing and Wholesale, Accountant, Professional Services, Nonprofit

## Can multiple QuickBooks Desktop Connectors be installed on the same machine?

Yes. Install one connector per company file. You can install multiple connectors to sync multiple company files to Expensify from one computer. Ensure you're logged into the correct QuickBooks company file when syncing.

## Can I export negative expenses?

Generally, yes. However, if you select **Check** as your export option, the report’s total cannot be negative. This also applies to non-reimbursable expenses exported as debit card transactions. Because QuickBooks Desktop doesn't support debit cards, transactions export as a non-reimbursable check, which must have a positive total amount.
