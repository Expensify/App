---
title: certinia.md
description: Learn how to connect Expensify to Certinia (formerly FinancialForce) for seamless expense management integration.
keywords: [Certinia, FinancialForce, Expensify integration, expense management, Salesforce]
---
<div id="expensify-classic" markdown="1">

Certinia (formerly FinancialForce) is a cloud-based financial management solution built on the Salesforce platform. Expensify supports integrations with both Certinia PSA/SRP and FFA versions, allowing you to streamline expense reporting and approvals.

## Prerequisites for Connecting Expensify to Certinia

Before connecting Expensify to Certinia, complete the following setup steps:

1. **Install the Expensify bundle in Certinia**  
   - [PSA/SRP Installer](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t2M000002J0BHD%252Fpackaging%252FinstallPackage.apexp%253Fp0%253D04t2M000002J0BH)  
   - [FFA Installer](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t4p000001UQVj)  

2. **Verify Contact Details in Certinia**  
   - Ensure there is a user and contact in Certinia that matches your primary email in Expensify.  
   - Create contacts for all employees who will submit expense reports.  
   - Make sure each contact’s email matches their Expensify account email.

## How to Connect Expensify to Certinia

1. Navigate to **Settings > Workspaces > Groups > [Workspace Name] > Connections** in Expensify.  
2. Click **Create a New Certinia (FinancialForce) Connection**.  
3. Log in to your Certinia account.  
4. Follow the on-screen prompts to establish the connection.

## Additional Setup for PSA/SRP Users

If you are using Certinia PSA/SRP, complete the following additional steps before connecting to Expensify:

### 1. Configure Permission Controls  
- Go to **Permission Controls** and create a new permission control.  
- Set yourself (the exporter) as the user.  
- Select the resource (the report submitter).  
- Grant all available permissions.

### 2. Configure Project Permissions  
- Navigate to **Projects > Select a Project > Project Attributes**.  
- Enable **Allow Expenses Without Assignment**.  
- Click **Edit** and ensure this setting is checked under the Project Attributes section.

### 3. Set Up Expense Types (SRP Only)  
- Go to **Main Menu > + Symbol > Expense Type GLA Mappings**.  
- Click **New** to add and configure expense type mappings.

---

By following these steps, you’ll successfully integrate Expensify with Certinia, enabling seamless expense reporting and approval workflows.

</div>
