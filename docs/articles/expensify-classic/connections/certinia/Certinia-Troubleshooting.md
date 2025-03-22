---
title: Certinia-Troubleshooting.md
description: Troubleshoot common Certinia sync and export errors, including Salesforce expense export limitations.
keywords: [Certinia, Salesforce, expense export, sync errors, troubleshooting]
---

# Certinia Troubleshooting Guide  

If your reports fail to export or your connection does not sync, it may be due to discrepancies in settings, missing data, or configuration issues within Certinia, Expensify, or Salesforce.  

This guide helps you identify and resolve common sync and export errors for a seamless financial integration.

---

## Salesforce Expense Export Limitations  

If an expense report does not export to Certinia, check the **Salesforce project settings** to confirm that expenses can be entered and exported.  

### **Expenses can be exported when:**
- **Project Status** = Active/In Progress  
- **Assignment** = Closed, Active, or Completed *(Assignment status does not block expense entry.)*  
- **Closed for Expense Entry** = Unchecked  

### **Expenses cannot be exported when:**  
- **Project Status** = Closed, **or**  
- **Closed for Expense Entry** = Checked  

### **Troubleshooting Steps:**  
1. **Check the project status in Salesforce**  
   - If **Project Status** is **Closed**, expenses **cannot** be entered or exported.  
   - If **Active** or **In Progress**, proceed to step 2.  

2. **Verify the "Closed for Expense Entry" setting**  
   - If **checked**, uncheck it to allow expense exports.  

3. **Manually test expense entry**  
   - Try entering an expense manually in Salesforce. If successful, the Expensify-Certinia integration should also allow it.  

---

## ExpensiError FF0047: Ops Edit Permission Required  

### **Cause:**  
The connected user lacks the **Ops Edit** permission needed to edit approved records.  

### **Resolution:**  
1. In Certinia, go to **Permission Controls**.  
2. Select the relevant permission set.  
3. Ensure **Expense Ops Edit** is enabled.  

> **What is Ops Edit?**  
> This permission allows users to modify approved records, a requirement for exporting expenses in Certinia.  

---

## ExpensiError FF0061: Object Validation Failed (Credit Terms)  

### **Cause:**  
The credit terms for the selected account are incorrectly configured.  

### **Resolution:**  
1. Identify the account used for the report export:  
   - **PSA/SRP** users: Project account  
   - **FFA** users: Resource-linked account  
2. In Certinia, update the account settings:  
   - **Base Date 1** → Set to **Invoice**  
   - **Days Offset** → Enter **1 or more**  
   - Ensure a **currency** is selected  

> **What is Base Date 1?**  
> This field determines when payment terms begin (e.g., from the invoice date).  

---

## ExpensiError FF0074: Insufficient Permissions for Resource  

### **Cause:**  
The report creator/submitter lacks the necessary permission controls.  

### **Resolution:**  
1. Go to **Permission Controls** in Certinia.  
2. Click **New** to create a permission control.  
3. Enter the **User** and **Resource Fields**.  
4. Check all required permission fields.  

---

## ExpensiError FF0076: Employee Not Found in Certinia  

### **Resolution:**  
1. In Certinia, go to **Contacts** and add the report creator/submitter’s **Expensify email address** to their employee record.  
2. If a record already exists, search for the email to confirm it is not linked to multiple records.  

---

## ExpensiError FF0089: Assignment Required for Project  

### **Cause:**  
The project settings require an assignment for expenses.  

### **Resolution:**  
1. In Certinia, go to **Projects > [Project Name] > Project Attributes**.  
2. Enable **Allow Expense Without Assignment**.  

---

## ExpensiError FF0091: Invalid Field Name  

### **Cause:**  
The specified field is not accessible for the user profile in Certinia.  

### **Resolution:**  
1. In Certinia, go to **Setup > Build** and expand **Create > Object**.  
2. Navigate to **Payable Invoice > Custom Fields and Relationships**.  
3. Click **View Field Accessibility**.  
4. Locate the employee profile and select **Hidden**.  
5. Ensure both checkboxes for **Visible** are selected.  

### **Sync the Connection:**  
1. In Expensify, go to **Settings > Workspaces > Groups > [Workspace Name] > Connections**.  
2. Click **Sync Now**.  
3. Attempt to export the report again.  

---

## ExpensiError FF0132: Insufficient Access  

### **Cause:**  
The connected Certinia user lacks **Modify All Data** permission.  

### **Resolution:**  
1. Log into **Certinia**.  
2. Navigate to **Setup > Manage Users > Users**.  
3. Locate the user who established the connection.  
4. Click their **profile**.  
5. Go to **System > System Permissions**.  
6. Enable **Modify All Data** and save.  

> **What is Modify All Data?**  
> This permission allows full data access, ensuring reports sync properly.  

### **Sync the Connection:**  
1. In Expensify, go to **Settings > Workspaces > Groups > [Workspace Name] > Connections**.  
2. Click **Sync Now**.  
3. Attempt to export the report again.  

---

## Certinia PSA Error: Duplicate Value on Record  

### **Cause:**  
Multiple projects failed during an initial export, causing subsequent failures.  

### **Resolution:**  
1. Delete any existing expense reports associated with the **Expensify Report ID** in Certinia.  
2. **Sync the connection:**  
   - In Expensify, go to **Settings > Workspaces > Groups > [Workspace Name] > Connections**.  
   - Click **Sync Now**.  
3. Attempt to export the report again.  

---

# FAQ  

## Why do expenses fail to export when the project is closed?  
Salesforce enforces a rule where a **Closed** project status **always** prevents expense entry, regardless of other settings.  

## What should I do if an expense still doesn’t export?  
1. Check the project settings in Salesforce:  
   - Ensure **Project Status** is **Active** or **In Progress**.  
   - Verify **"Closed for Expense Entry"** is **unchecked**.  
2. Try manually entering an expense to confirm restrictions.  

## Does assignment status affect expense exports?  
No, **Assignment Status** (Closed, Active, or Completed) does not impact expense entry or export.  

---

By following these steps, you can resolve common Certinia sync and export issues, ensuring a smooth integration between Expensify, Certinia, and Salesforce.

