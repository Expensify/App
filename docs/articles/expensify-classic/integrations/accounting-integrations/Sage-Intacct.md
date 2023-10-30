---
title: Sage Intacct
description: Connect your Expensify workspace with Sage Intacct
---
# Overview
Expensify’s seamless integration with Sage Intacct allows you to connect using either Role-based permissions or User-based permissions. 

Once connected to Intacct you’re able to automate report exports, customize your coding preferences, and utilize Sage Intacct’s advanced features. When you’ve configured these settings in Expensify correctly, you can use the integration's settings to automate many tasks, streamlining your workflow for increased efficiency.

# How to connect to Sage Intacct
We support setting up Sage Intacct with both User-based permissions and Role-based permissions for Expense Reports and Vendor Bills.
- User-based Permissions - Expense Reports
- User-based Permissions - Vendor Bills
- Role-based Permissions - Expense Reports
- Role-based Permissions - Vendor Bills


## User-based Permissions - Expense Reports

Please follow these steps if exporting as Expense Reports with **user-based permissions**.


### Checklist of items to complete:
1. Create a web services user and set up permissions.
2. Enable the Time & Expenses module **(Required if exporting as Expense Reports)**.
3. Set up Employees in Sage Intacct **(Required if exporting as Expense Reports)**.
4. Set up Expense Types in Sage Intacct **(Required if exporting as Expense Reports)**.
5. Enable Customization Services (only applicable if you don't already use Platform Services).
6. Create a test workspace and download the [Expensify Package](https://community.expensify.com/home/leaving?allowTrusted=1&target=https%3A%2F%2Fwww.expensify.com%2Ftools%2Fintegrations%2FdownloadPackage).
7. Upload the Package in Sage Intacct.
8. Add web services authorization.
9. Enter credentials and connect Expensify and Sage Intacct.
10. Configure integration sync options.
11. Export a test report.
12. Connect Sage Intacct to the production workspace.


### Step 1: Create a web services user with user-based permissions

_Note: If the steps in this section look different in your Sage Intacct instance, you likely use role-based permissions. If that's the case, see the steps below on creating a web services user for role-based permissions._
To connect to Sage Intacct, you'll need to create a special web services user. This user is essential for tracking actions in Sage Intacct, such as exporting expense reports and credit card charges from Expensify. It also helps ensure smooth operations when new members join or leave your accounting team. The good news is that setting up this web services user won't cost you anything. Just follow these steps:
Go to **Company > Web Services Users > New**
Setup the user using these configurations:
   - **User ID:** "xmlgateway_expensify"
   - **Last Name and First Name:** "Expensify"
   - **Email Address:** Your shared accounting team email
   - **User Type:** "Business"
   - **Admin Privileges:** "Full"
   - **Status:** "Active"
Once you've created the user, you'll need to set the correct permissions. To set those, go to the **subscription** link for this user in the user list, **click on the checkbox** next to the Application/Module and then click on the **Permissions** link to modify those. 

These are the permissions required for a user to export reimbursable expenses as Expense Reports:
- **Administration (All)**
- **Company (Read-only)**
- **Cash Management (All)**
- **General Ledger (All)**
- **Time & Expense (All)**
- **Projects (Read-only)** (only needed if using Projects and Customers)
- **Accounts Payable (All)** (only needed for exporting non-reimbursable expenses as vendor bills)

**Note:** you can set permissions for each Application/Module by selecting the radio button next to the desired Permission and clicking **Save**.


### Step 2: Enable the Time & Expenses Module (Only required if exporting reimbursable expenses as Expense Reports)
The Time & Expenses (T&E) module is often included in your Sage Intacct instance, but if it wasn't part of your initial Sage Intacct setup, you may need to enable it. **Enabling the T&E module is a paid subscription through Sage Intacct. For information on the costs of enabling this module, please contact your Sage Intacct account manager**. It's necessary for our integration and only takes a few minutes to configure.
1. In Sage Intacct, go to the **Company menu > Subscriptions > Time & Expenses** and toggle the switch to subscribe.
2. After enabling T&E, configure it as follows:
   - Ensure that **Expense types** is checked:
   - Under **Auto-numbering sequences** set the following:
       - **Expense Report:** EXP
       - **Employee:** EMP
       - **Duplicate Numbers:** Select “Do not allow creation”
 
     - To create the EXP sequence, **click on the down arrow on the expense report line and select **Add**:
       - **Sequence ID:** EXP
       - **Print Title:** EXPENSE REPORT
       - **Starting Number:** 1
       - **Next Number:** 2
3. Select **Advanced Settings** and configure the following:
- **Fixed Number Length:** 4
- **Fixed Prefix:** EXP
4. Click **Save**
5. Under Expense Report approval settings, ensure that **Enable expense report approval** is unchecked
6. Click **Save** to confirm your configurations.


### Step 3: Set up Employees in Sage Intacct (Only required if exporting reimbursable expenses as Expense Reports)
To set up Employees in Sage Intacct, follow these steps:
1. Navigate to **Time & Expenses** and click the plus button next to **Employees**.
   - If you don't see the Time & Expense option in the top ribbon, you may need to adjust your settings. Go to **Company > Roles > Time & Expenses** and enable all permissions.
2. To create an employee, you'll need to provide the following information:
   - **Employee ID**
   - **Primary contact name**
   - **Email address**
     - In the **Primary contact name** field, click the dropdown arrow.
     - Select the employee if they've already been created. 
     - Otherwise, click **+ Add** to create a new employee.
     - Fill in their **Primary Email Address** along with any other required information.


### Step 4: Set up Expense Types in Sage Intacct (Only required if exporting reimbursable expenses as Expense Reports)

Expense Types provide a user-friendly way to display the names of your expense accounts to your employees. They are essential for our integration. To set up Expense Types, follow these steps:
1. **Setup Your Chart of Accounts:** Before configuring Expense Types, ensure your Chart of Accounts is set up. You can set up accounts in bulk by going to **Company > Open Setup > Company Setup Checklist > click Import**.
2. **Set up Expense Types:**
   - Go to **Time & Expense**.
   - Open Setup and click the plus button next to **Expense Types**.
3. For each Expense Type, provide the following information:
   - **Expense Type**
   - **Description**
   - **Account Number** (from your General Ledger)
This step is necessary if you are exporting reimbursable expenses as Expense Reports.


### Step 5: Enable Customization Services
To enable Customization Services go to **Company > Subscriptions > Customization Services**.
   - If you already have Platform Services enabled, you can skip this step.


### Step 6: Create a Test Workspace in Expensify and Download the [Expensify Package](https://community.expensify.com/home/leaving?allowTrusted=1&target=https%3A%2F%2Fwww.expensify.com%2Ftools%2Fintegrations%2FdownloadPackage)
Creating a test workspace in Expensify allows you to have a sandbox environment for testing before implementing the integration live. If you are already using Expensify, creating a test workspace ensures that your existing group workspace rules and approval workflows remain intact. Here's how to set it up:
1. Go to **expensify.com > Settings > Workspaces > New Workspace**.
2. Name the workspace something like "Sage Intacct Test Workspace."
3. Go to **Connections > Sage Intacct > Connect to Sage Intacct**.
4. Select **Download Package** (You only need to download the file; we'll upload it from your Downloads folder later).


### Step 7: Upload Package in Sage Intacct


If you use **Customization Services**:
1. Go to **Customization Services > Custom Packages > New Package**.
2. Click on **Choose File** and select the Package file from your downloads folder.
3. Click **Import**.


If you use **Platform Services**:
1. Go to **Platform Services > Custom Packages > New Package**.
2. Click on **Choose File** and select the Package file from your downloads folder.
3. Click **Import**.


### Step 8: Add Web Services Authorization
1. Go to **Company > Company Info > Security** in Intacct and click **Edit**.
2. Scroll down to **Web Services Authorizations** and add "expensify" (all lower case) as a Sender ID.


### Step 9: Enter Credentials and Connect Expensify and Sage Intacct


1. Go back to **Settings > Workspaces > Group > [Workspace Name] > Connections > Configure**.
2. Click **Connect to Sage Intacct** and enter the credentials you've set for your web services user.
3. Click **Send** once you're done.

Next, you’ll configure the Export, Coding, and Advanced tabs of the connection configuration in Expensify.


## User-based Permissions - Vendor Bills
In this setup guide, we'll take you through the steps to establish your connection for Vendor Bills with user-based permissions. Please follow this checklist of items to complete:
1. Create a web services user and set up permissions.
2. Enable Customization Services (only required if you don't already use Platform Services).
3. Create a test workspace in Expensify and download the [Expensify Package](https://community.expensify.com/home/leaving?allowTrusted=1&target=https%3A%2F%2Fwww.expensify.com%2Ftools%2Fintegrations%2FdownloadPackage)
4. Upload the Package in Sage Intacct.
5. Add web services authorization.
6. Enter credentials and connect Expensify and Sage Intacct.
7. Configure integration sync options.


### Step 1: Create a web services user with user-based permissions
**Note:** If the steps in this section look different in your Sage Intacct instance, you likely use role-based permissions. If that's the case, see the steps below on creating a web services user for role-based permissions.
To connect to Sage Intacct, it's necessary to set up a web services user. This user simplifies tracking activity within Sage Intacct, such as exporting expense reports and credit card charges from Expensify. It also ensures a seamless transition when someone joins or leaves your accounting department. Setting up the web services user is free of charge. Please follow these steps:
1. Go to **Company > Web Services Users > New**.
2. Configure the user as shown in the screenshot below, making sure to follow these guidelines:
   - **User ID:** "xmlgateway_expensify"
   - **Last Name and First Name:** "Expensify"
   - **Email Address:** Your shared accounting team email
   - **User Type:** "Business"
   - **Admin Privileges:** "Full"
   - **Status:** "Active"


Once you've created the user, you'll need to set the correct permissions. To do this, follow these steps:
1. Go to the subscription link for this user in the user list.
2. Click on the checkbox next to the Application/Module you want to modify permissions for.
3. Click on the **Permissions** link to make modifications.

These are the permissions the user needs to have if exporting reimbursable expenses as Vendor Bills:
- **Administration (All)**
- **Company (Read-only)**
- **Cash Management (All)**
- **General Ledger (All)**
- **Accounts Payable (All)**
- **Projects (Read-only)** (required if you're going to be using Projects and Customers)

**Note:** that selecting the radio button next to the Permission you want and clicking **Save** will set the permission for that particular Application/Module.


### Step 2: Enable Customization Services (only applicable if you don't already use Platform Services)
To enable Customization Services go to **Company > Subscriptions > Customization Services**.
   - If you already have Platform Services enabled, you can skip this step.

### Step 3: Create a Test Workspace in Expensify and Download [Expensify Package](https://community.expensify.com/home/leaving?allowTrusted=1&target=https%3A%2F%2Fwww.expensify.com%2Ftools%2Fintegrations%2FdownloadPackage)
Creating a test workspace in Expensify allows you to establish a sandbox environment for testing before implementing the integration in a live environment. If you're already using Expensify, creating a test workspace ensures that your existing company workspace rules and approval workflows remain intact. Here's how to set it up:
1. Go to **expensify.com > Settings > Workspaces > Groups > New Workspace**.
2. Name the workspace something like "Sage Intacct Test Workspace."
3. Go to **Connections > Sage Intacct > Connect to Sage Intacct**.
4. Select "I've completed these" if you've downloaded the  [Expensify Package](https://community.expensify.com/home/leaving?allowTrusted=1&target=https%3A%2F%2Fwww.expensify.com%2Ftools%2Fintegrations%2FdownloadPackage) and completed the previous steps in Sage Intacct.
5. Select **Download Package** (You only need to download the file; we'll upload it from your Downloads folder later).

### Step 4: Upload the Package in Sage Intacct
If you use **Customization Services**:

1. Go to **Customization Services > Custom Packages > New Package**.
2. Click on **Choose File** and select the Package file from your downloads folder.
3. Click **Import**.


If you use **Platform Services**:

1. Go to **Platform Services > Custom Packages > New Package**.
2. Click on **Choose File** and select the Package file from your downloads folder.
3. Click **Import**.

### Step 5: Add Web Services Authorization
1. Go to **Company > Company Info > Security** in Intacct and click **Edit**.
2. Scroll down to **Web Services Authorizations** and add "expensify" (all lowercase) as a Sender ID.

### Step 6: Enter Credentials and Connect Expensify with Sage Intacct
1. Go back to **Settings > Workspaces > Groups > [Workspace Name] > Connections > Configure**.
2. Click on **Connect to Sage Intacct**.
3. Enter the credentials that you've previously set for your web services user.
4. Click **Send** once you've finished entering the credentials.

Next, you’ll configure the Export, Coding, and Advanced tabs of the connection configuration in Expensify.



## Role-based Permissions - Expense Reports

For this setup guide, we're going to walk you through how to get your connection up and running as Expense Reports with role-based permissions.

### Checklist of items to complete:

1. Create web services user and set up permissions
2. Enable Time & Expenses module
3. Set up Employees in Sage Intacct
4. Set up Expense Types in Sage Intacct
5. Enable Customization Services (only applicable if you don't already use Platform Services)
6. Create a test workspace and download the [Expensify Package](https://community.expensify.com/home/leaving?allowTrusted=1&target=https%3A%2F%2Fwww.expensify.com%2Ftools%2Fintegrations%2FdownloadPackage)
7. Upload the Package in Sage Intacct
8. Add web services authorization
9. Enter credentials and connect Expensify and Sage Intacct
10. Configure integration sync options


### Step 1: Create a web services user with role-based permissions

In Sage Intacct, click **Company**, then click on the **+** button next to **Roles**.

Name the role, then click **Save**.

Go to **Roles > Subscriptions** for the "Expensify" role you just created.

Set the permissions for this role by clicking the checkbox and then clicking on the **Permissions** hyperlink.

These are the permissions required for a user to export reimbursable expenses as Expense Reports:
- **Administration (All)**
- **Company (Read-only)**
- **Cash Management (All)**
- **General Ledger (All)**
- **Time & Expense (All)**
- **Projects (Read-only)** (only needed if using Projects and Customers)
- **Accounts Payable (All)** (only needed for exporting non-reimbursable expenses as vendor bills)

Now, you'll need to create a web services user and assign this role to that user.

- **Company > Web Services Users > New**
- Set up the user like the screenshot below, making sure to do the following:
  - User ID: “xmlgateway_expensify"
  - Last name and First name: "Expensify"
  - Email address: your shared accounting team email
  - User type: "Business"
  - Admin privileges: "Full"
  - Status: "Active"

To assign the role, go to **Roles Information**:

- Click the **+** button, then find the "Expensify" role and click **Save**.

### Step 2: Enable the Time & Expenses module (Only required if exporting reimbursable expenses as Expense Reports)

The T&E module often comes standard on your Sage Intacct instance, but you may need to enable it if it was not a part of your initial Sage Intacct implementation. Enabling the T&E module is a paid subscription through Sage Intacct. Please reach out to your Sage Intacct account manager with any questions on the costs of enabling this module. It's required for our integration and takes just a few minutes to configure.

In Sage Intacct, click on the **Company** menu > **Subscriptions** > **Time & Expenses** and click the toggle to subscribe.

Once you've enabled T&E, you'll need to configure it properly:
- Ensure that **Expense types** is checked.
- Under Auto-numbering sequences, please set the following:
  - To create the EXP sequence, click on the down arrow on the expense report line > **Add**
  - Sequence ID: EXP
  - Print Title: EXPENSE REPORT
  - Starting Number: 1
  - Next Number: 2
  - Once you've done this, select **Advanced Settings**
  - Fixed Number Length: 4
  - Fixed Prefix: EXP
  - Once you've done this, hit **Save**
- Under Expense Report approval settings, make sure the "Enable expense report approval" is unchecked.
- Click **Save**!

### Step 3: Set up Employees in Sage Intacct (Only required if exporting reimbursable expenses as Expense Reports)

In order to set up Employees, go to **Time & Expenses** > click the plus button next to **Employees**. If you don't see Time & Expense in the top ribbon, you may need to adjust your settings by going to **Company > Roles > Time & Expenses > Enable all permissions**. To create an employee, you'll need to insert the following information:
- Employee ID
- Primary contact name
- Email address (click the dropdown arrow in the Primary contact name field) > select the employee if they've already been created. Otherwise click **+ Add** > fill in their Primary Email Address along with any other information you require.

### Step 4: Set up Expense Types in Sage Intacct (only required if exporting reimbursable expenses as Expense Reports)

Expense Types are a user-friendly way of displaying the names of your expense accounts to your employees. They are required for our integration. In order to set up Expense Types, you'll first need to setup your Chart of Accounts (these can be set up in bulk by going to **Company > Open Setup > Company Setup Checklist > click Import**).

Once you've setup your Chart of Accounts, to set Expense Types, go to **Time & Expense** > **Open Setup** > click the plus button next to **Expense Types**. For each Expense Type, you'll need to include the following information:
- Expense Type
- Description
- Account Number (from your GL)

### Step 5: Enable Customization Services

To enable, go **Company > Subscriptions > Customization Services** (if you already have Platform Services enabled, you will skip this step).

### Step 6: Create a test workspace in Expensify and download  [Expensify Package](https://community.expensify.com/home/leaving?allowTrusted=1&target=https%3A%2F%2Fwww.expensify.com%2Ftools%2Fintegrations%2FdownloadPackage)

The test workspace will be used as a sandbox environment where we can test before going live with the integration. If you're already using Expensify, creating a test workspace will ensure that your existing group workspace rules, approval workflow, etc remain intact. In order to set this up:

- Go to **expensify.com > Settings > Workspaces > New Workspace**
- Name the workspace something like "Sage Intacct Test Workspace"
- Go to **Connections > Sage Intacct > Connect to Sage Intacct**
- Select **Download Package** (All you need to do is download the file. We'll upload it from your Downloads folder later).

### Step 7: Upload Package in Sage Intacct

If you use Customization Services:

- **Customization Services > Custom Packages > New Package > Choose File >** select the Package file from your downloads folder > Import

If you use Platform Services:

- **Platform Services > Custom Packages > New Package > Choose File >** select the Package file from your downloads folder > Import

### Step 8: Add web services authorization

- Go to **Company > Company Info > Security** in Intacct and click Edit. Next, scroll down to Web Services authorizations and add "expensify" (this must be all lower case) as a Sender ID.

### Step 9: Enter credentials and connect Expensify and Sage Intacct

- Now, go back to **Settings > Workspaces > Group > [Workspace Name] > Connections > Configure > Connect to Sage Intacct** and enter the credentials that you've set for your web services user. Click Send once you're done.

Next, follow the links in the related articles section below to complete the configuration for the Export, Coding, and Advanced tabs of the connection settings.

## Role-based Permissions - Vendor Bills

Follow the steps below to set up Sage Intacct with role-based permissions and export Vendor Bills:

### Checklist of items to complete:

1. Create a web services user and configure permissions.
2. Enable Customization Services (if not using Platform Services).
3. Create a test workspace in Expensify and download the [Expensify Package](https://community.expensify.com/home/leaving?allowTrusted=1&target=https%3A%2F%2Fwww.expensify.com%2Ftools%2Fintegrations%2FdownloadPackage).
4. Upload the Package in Sage Intacct.
5. Add web services authorization.
6. Enter credentials and connect Expensify and Sage Intacct.
7. Configure integration sync options.


### Step 1: Create a web services user with role-based permissions

In Sage Intacct:
- Navigate to "Company" and click the **+** button next to "Roles."
- Name the role and click **Save**.
- Go to "Roles" > "Subscriptions" for the "Expensify" role you created.
- Set the permissions for this role by clicking the checkbox and then clicking on the Permissions hyperlink


These are the permissions required for a user to export reimbursable expenses as Vendor Bills:
- **Administration (All)**
- **Company (Read-only)**
- **Cash Management (All)**
- **General Ledger (All)**
- **Time & Expense (All)**
- **Projects (Read-only)** (only needed if using Projects and Customers)
- **Accounts Payable (All)** (only needed for exporting non-reimbursable expenses as vendor bills)


- Create a web services user:
  - Go to **Company > Web Services Users > New**
  - Configure the user as follows:
    - User ID: "xmlgateway_expensify"
    - Last Name and First Name: "Expensify"
    - Email Address: Your shared accounting team email
    - User Type: "Business"
    - Admin Privileges: "Full"
    - Status: "Active"
  - To assign the role, go to "Roles Information", click the **+** button, find the "Expensify" role, and click **Save**

### Step 2: Enable Customization Services

Only required if you don't already use Platform Services:
- To enable, go to **Company > Subscriptions > Customization Services**

### Step 3: Create a test workspace in Expensify and download the  [Expensify Package](https://community.expensify.com/home/leaving?allowTrusted=1&target=https%3A%2F%2Fwww.expensify.com%2Ftools%2Fintegrations%2FdownloadPackage)

Create a test workspace in Expensify:
- Go to **Settings > Workspaces** and click **New Workspace** on the Expensify website.
- Name the workspace something like "Sage Intacct Test Workspace."
- Once created, navigate to **Settings > Workspaces > [Group Workspace Name] > Connections > Accounting Integrations > Connect to Sage Intacct**
- Select **Create a new Sage Intacct connection/Connect to Sage Intacct**
- Select **Download Package** (We'll upload it from your Downloads folder later.)

### Step 4: Upload Package in Sage Intacct

If you use **Customization Services**:
- Go to **Customization Services > Custom Packages > New Package > Choose File > select the Package file from your downloads folder > Import**.

If you use **Platform Services**:
- Go to **Platform Services > Custom Packages > New Package > Choose File > select the Package file from your downloads folder > Import**.

### Step 5: Add web services authorization

- Go to **Company > Company Info > Security** in Intacct and click **Edit**
- Scroll down to **Web Services Authorizations** and add **expensify** (all lowercase) as a Sender ID.

### Step 6: Enter credentials and connect Expensify and Sage Intacct

Now, go back to **Settings > Workspaces > [Group Workspace Name] > Connections > Accounting Integrations > Configure > Connect to Sage Intacct** and enter the credentials you set for your web services user. Click **Send** when finished.

### Step 7: Configure your connection

Once the initial sync completes, you may receive the error "No Expense Types Found" if you're not using the Time and Expenses module. Close the error dialogue, and your configuration options will appear. Switch the reimbursable export option to **Vendor Bills** and click **Save** before completing your configuration.

Next, refer to the related articles section below to finish configuring the Export, Coding, and Advanced tabs of the connection configuration.

# How to configure export settings

When you connect Intacct with Expensify, you can configure how information appears once exported. To do this, Admins who are connected to Intacct can go to **Settings > Workspaces > Group > [Workspace Name] > Connections**, and then click on **Configure** under Intacct. This is where you can set things up the way you want.


## Preferred Exporter

Any workspace admin can export to Sage Intacct, but only the preferred exporter will see reports that are ready for export in their Inbox.



## Date

Choose which date you would like your Expense Reports or Vendor Bills to use when exported.

- **Date of last expense:** Uses the date on the most recent expense added to the report.
- **Exported date:** Is the date you export the report to Sage Intacct.
- **Submitted date:** Is the date the report creator originally submitted the report.

All export options except credit cards use the date in the drop-down. Credit card transactions use the transaction date.

## Reimbursable Expenses

Depending on your initial setup, your **reimbursable expenses** will be exported as either **Expense Reports** or **Vendor Bills** to Sage Intacct.

## Non-Reimbursable Expenses

**Non-reimbursable expenses** will export separately from reimbursable expenses, either as **Vendor Bills**, or as **credit card charges** to the account you select. It is not an option to export non-reimbursable expenses as **Journal** entries. 


If you are centrally managing your company cards through Domain Control, you can export expenses from each individual card to a specific account in Intacct.
Please note, Credit Card Transactions cannot be exported to Sage Intacct at the top-level if you have **Multi-Currency** enabled, so you will need to select an entity in the configuration of your Expensify Workspace by going to **Settings > Workspaces > Groups > [Workspace Name]  > Connections > Configure**.

## Exporting Negative Expenses

You can export negative expenses successfully to Intacct regardless of which Export Option you choose. The one thing to keep in mind is that if you have Expense Reports selected as your export option, the **total** of the report can not be negative.

# How to configure coding settings

The appearance of your expense data in Sage Intacct depends on how you've configured it in Expensify. It's important to understand each available option to achieve the desired results.

## Expense Types

Categories are always enabled and are the primary means of matching expenses to the correct accounts in Sage Intact. The Categories in Expensify depend on your **Reimbursable** export options:
- If your Reimbursable export option is set to **Expense Reports** (the default), your Categories will be your **Expense Types**.
- If your Reimbursable export option is set to **Vendor Bills**, your Categories will be your **Chart of Accounts** (also known as GL Codes or Account Codes).

You can disable unnecessary categories from your **Settings > Workspaces > Group > [Workspace Name] > Categories** page if your list is too extensive. Note that every expense must be coded with a Category, or it will not export. Also, when you first set up the integration, your existing categories will be overwritten.

## Billable Expenses

Enabling Billable expenses allows you to map your expense types or accounts to items in Sage Intacct. To do this, you'll need to enable the correct permissions on your Sage Intacct user or role. This may vary based on the modules you use in Sage Intacct, so you should enable read-only permissions for relevant modules such as Projects, Purchasing, Inventory Control, and Order Entry.

Once permissions are set, you can map your categories (expense types or accounts, depending on your export settings) to specific items, which will then export to Sage Intacct. When an expense is marked as Billable in Expensify, users must select the correct billable Category (Item), or there will be an error during export.

## Dimensions - Departments, Classes, and Locations

If you enable these dimensions, you can choose from three data options:
- Not pulled into Expensify: Employee default (available when the reimbursable export option is set to Expense Reports)
- Pulled into Expensify and selectable on reports/expenses: Tags (useful for cross-charging between Departments or Locations)
- Report Fields (applies at the header level, useful when an employee's Location varies from one report to another)

Please note that the term "tag" may appear instead of "Department" on your reports, so ensure that "Projects" is not disabled in your Tags configuration within your workspace settings. Make sure it's enabled within your coding settings of the Intacct configuration settings. When multiple options are available, the term will default to Tags.

## Customers and Projects

These settings are particularly relevant to billable expenses and can be configured as Tags or Report Fields.

## Tax

As of September 2023, our Sage Intacct integration supports native VAT and GST tax. To enable this feature, open the Sage Intacct configuration settings in your workspace, go to the Coding tab, and enable Tax. For existing Sage Intacct connectings, simply resync your workspace and the tax toggle will appear. For new Sage Intacct connections, the tax toggle will be available when you complete the integration steps. 
Having this option enabled will then import your native tax rates from Sage Intacct into Expensify. From there, you can select default rates for each category.

## User-Defined Dimensions

You can add User-Defined Dimensions (UDD) to your workspace by locating the "Integration Name" in Sage Intacct. Please note that you must be logged in as an administrator in Sage Intacct to find the required fields.

To find the Integration Name in Sage Intacct:
1. Go to **Platform Services > Objects > List**
2. Set "filter by application" to "user-defined dimensions."

Now, in Expensify, navigate to **Settings > Workspaces > Group > [Workspace Name] > Connections**, and click **Configure** under Sage Intacct. On the Coding tab, enable the toggle next to User Defined Dimensions. Enter the "Integration name" and choose whether to import it into Expensify as an expense-level Tag or as a Report Field, then click **Save**.

You'll now see the values for your custom segment available under Tags settings or Report Fields settings in Expensify.



# How to configure advanced settings
In multi-entity environments, you'll find a dropdown at the top of the sync options menu, where you can choose to sync with the top-level or a specific entity in your Sage Intacct instance. If you sync at the top level, we pull in employees and dimensions shared at the top level and export transactions to the top level. Otherwise, we sync information with the selected entity.
## Auto Sync
When a non-reimbursable report is finally approved, it will be automatically exported to Sage Intacct. Typically, non-reimbursable expenses will sync to the next open period in Sage Intacct by default. If your company uses Expensify's ACH reimbursement, reimbursable expenses will be held back and exported to Sage when the report is reimbursed.
## Inviting Employees
Enabling **Invite Employees** allows the integration to automatically add your employees to your workspace and create an Expensify account for them if they don't have one. 
If you have your domain verified on your account, ensure that the Expensify account connected to Sage Intacct is an admin on your domain.
When you toggle on "Invite Employees" on the Advanced tab, all employees in Sage Intacct who haven't been invited to the Expensify group workspace you're connecting will receive an email invitation to join the group workspace. Approval workflow will default to Manager Approval and can be further configured on the People settings page.
## Import Sage Intacct Approvals
When the "Import Sage Intacct Approvals" setting is enabled, Expensify will automatically set each user's manager listed in Sage Intacct as their first approver in Expensify. If no manager exists in Sage Intacct, the approver can be set in the Expensify People table. You can also add a second level of approval to your Sage Intacct integration by setting a final approver in Expensify.
Please note that if you need to add or edit an optional final approver, you will need to select the **Manager Approval** option in the workflow. Here is how each option works:
- **Basic Approval:** All users submit to one user.
- **Manager Approval:** Each user submits to the manager (imported from Sage Intacct). Each manager forwards to one final approver (optional).
- **Configure Manually:** Import employees only, configure workflow in Expensify.


## Sync Reimbursed Reports
When using Expensify ACH, reimbursable reports exported to Intacct are exported:
- As Vendor Bills to the default Accounts Payable account set in your Intacct Accounts Payable module configuration, OR
- As Expense Reports to the Employee Liabilities account in your Time & Expenses module configuration.
When ACH reimbursement is enabled, the "Sync Reimbursed Reports" feature will additionally export a Bill Payment to the selected Cash and Cash Equivalents account listed. If **Auto Sync** is enabled, the payment will be created when the report is reimbursed; otherwise, it will be created the next time you manually sync the workspace.
Intacct requires that the target account for the Bill Payment be a Cash and Cash Equivalents account type. If you aren't seeing the account you want in that list, please first confirm that the category on the account is Cash and Cash Equivalents.


# FAQ
## What if my report isn't automatically exported to Sage Intacct?
There are a number of factors that can cause automatic export to fail. If this happens, the preferred exporter will receive an email and an Inbox task outlining the issue and any associated error messages.
The same information will be populated in the comments section of the report.
The fastest way to find a resolution for a specific error is to search the Community, and if you get stuck, give us a shout!
Once you've resolved any errors, you can manually export the report to Sage Intacct.
## How can I make sure that I final approve reports before they're exported to Sage Intacct?
Make sure your approval workflow is configured correctly so that all reports are reviewed by the appropriate people within Expensify before exporting to Sage Intacct.
Also, if you have verified your domain, consider strictly enforcing expense workspace workflows. You can set this up via Settings > Domains > [Domain Name] > Groups.


## If I enable Auto Sync, what happens to existing approved and reimbursed reports?
If your workspace has been connected to Intacct with Auto Sync disabled, you can safely turn on Auto Sync without affecting existing reports which have not been exported.
If a report has been exported to Intacct and reimbursed via ACH in Expensify, we'll automatically mark it as paid in Intacct during the next sync.
If a report has been exported to Intacct and marked as paid in Intacct, we'll automatically mark it as reimbursed in Expensify during the next sync.
If a report has not been exported to Intacct, it will not be exported to Intacct automatically.
