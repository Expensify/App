---
title: QuickBooks Desktop
description: Easily connect Expensify to QuickBooks Desktop for streamlined expense management and accounting.
keywords: [New Expensify, QuickBooks Desktop, Web Connector, accounting integration, expense management]
order: 1
---


QuickBooks Desktop is accounting software designed for small and medium-sized businesses. Connecting Expensify to QuickBooks Desktop streamlines your expense management and accounting workflows.

To connect QuickBooks Desktop to Expensify, you must log in as an Admin in QuickBooks Desktop. Make sure **the company file you want to connect to is the only one open**.

---

# Step 1: Start the Setup in Expensify

1. From the navigation tabs (on the left on web, and at the bottom on mobile), select **Workspaces**
2. Choose the workspace you want to connect to
3. Click **More features** in the left-hand menu
4. In the **Integrate** section, toggle on **Accounting**
5. Click **Accounting** in the left-hand menu
6. Click **Set up** next to QuickBooks Desktop
7. Click **Copy** to copy the link, then paste the link into the computer that runs QuickBooks Desktop
8. Select your QuickBooks Desktop version

![QuickBooks Desktop version selection](https://help.expensify.com/assets/images/QBO_desktop_02.png){:width="100%"}

---

# Step 2: Install and Launch the Web Connector

1. Download the Web Connector and follow the installation instructions
2. Open the Web Connector
3. When prompted, download the config file and open it using File Explorer. This will automatically load the application into the Web Connector

**Note:** Make sure the correct company file is open in QuickBooks Desktop and that it’s the only one open.

---

# Step 3: Authorize and Finalize the Connection

1. In QuickBooks Desktop, select **Yes, always allow access, even when QuickBooks is not running**, then click **Continue**
2. Click **OK**, then click **Yes**
3. Click **Copy** to copy the password
4. Paste the password into the **Password** field in the Web Connector and press **Enter**
5. Click **Yes** to save the password. The new connection will appear in the Web Connector. Save this password in a secure password manager. You'll need it for future configuration updates or troubleshooting.

![Save Web Connector password](https://help.expensify.com/assets/images/QBO_desktop_07.png){:width="100%"}

---

# FAQ

## What are the hardware and software requirements?

- **Hardware**: Refer to [Intuit’s system requirements](https://quickbooks.intuit.com/learn-support/en-us/help-article/install-products/system-requirements-quickbooks-desktop-2022/L9664spDA_US_en_US)
- **Software**: Windows 10 or 11 with the latest service packs. While some users report success with older versions, these are not officially supported. The Web Connector does not run on Mac OS.

## Which QuickBooks Desktop versions are supported?

Expensify supports:

- The **latest three versions** of QuickBooks Desktop (US, Canada)
- **Version tiers**: Accountant, Pro, Pro Plus, Premier, Premier Plus, Enterprise
- **Special editions**: Contractor, Manufacturing and Wholesale, Accountant, Professional Services, Nonprofit

Expensify follows [Intuit’s service discontinuation policy](https://quickbooks.intuit.com/learn-support/en-us/help-article/feature-preferences/quickbooks-desktop-service-discontinuation-policy/L17cXxlie_US_en_US)

## Can I install multiple QuickBooks Desktop connectors?

Yes. You can install one connector per company file. Multiple connectors can run from the same computer. Just ensure you're logged into the correct company file before syncing.

## Can I export negative expenses?

Yes, in general. However:

- If you select **Check** as your export option, the total report amount cannot be negative
- This also applies to debit card exports (QuickBooks Desktop treats these as non-reimbursable checks)
- Non-reimbursable checks must have a **positive** amount

