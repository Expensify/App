---
title: Certinia
description: Connect Expensify to Certinia
order: 1
---
[Certinia](https://use.expensify.com/financialforce) (formerly known as FinancialForce) is a cloud-based software solution that provides a range of financial management and accounting applications built on the Salesforce platform. There are two versions: PSA/SRP and FFA -- Expensify supports connections to both. 

**Before connecting to Certinia:**
Install the Expensify bundle in Certinia using the relevant installer:
- [PSA/SRP](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t2M000002J0BHD%252Fpackaging%252FinstallPackage.apexp%253Fp0%253D04t2M000002J0BH)
- [FFA](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t4p000001UQVj)
- **Check the contact details in Certinia:**
  - Confirm there's a user and contact in Certinia that matches your main email in Expensify
  - Then, create contacts for all employees who will be sending expense reports
  - Be sure that each contact's email matches the email address associated with their Expensify account

# Connect to Certinia
1. Go to **Settings > Workspaces > Groups > [Workspace Name] > Connections** in Expensify
2. Click **Create a New Certinia (FinancialForce) Connection**
3. Log into your Certinia account
4. Follow the prompts until the connection between Certinia and Expensify is established

### If you use PSA/SRP
- Each report approver needs both a User and a Contact
- The user does not need a SalesForce license

Then, run through the following steps before connecting to Expensify:
1. Set permission controls in Certinia for your user for each contact/resource
   - Go to Permission Controls
     - Create a new permission control
     - Set yourself (exporter) as the user
     - Select the resource (report submitter)
     - Grant all available permissions
2. Set permissions on any project you are exporting to
  - Go to **Projects** > _select a project_ > **Project Attributes** > **Allow Expenses Without Assignment**
  - Select the project > **Edit**
  - Under the Project Attributes section, check **Allow Expenses Without Assignment**
3. Set up Expense Types (categories in Expensify - _SRP only_)
  - Go to **Main Menu** > _+ symbol_ > **Expense Type GLA Mappings**
  - Click **New** to add new mappings
