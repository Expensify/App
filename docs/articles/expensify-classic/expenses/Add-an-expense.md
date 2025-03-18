---
title: Add an expense
description: Create a new expense in Expensify
---

You can add an expense automatically with SmartScan or enter the expense details manually.

# SmartScan a receipt

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}

You can upload pictures of your receipts to Expensify and SmartScan will automatically capture the receipt details including the merchant, date, total, and currency.

1. Click the **Expenses** tab. 
2. Click the + icon in the top right and select **Scan receipt**. 
3. Upload a saved image of a receipt. 

{% include end-option.html %}

{% include option.html value="mobile" %}

You can use the Expensify mobile app to take a picture of your receipts and SmartScan will automatically capture the receipt details including the merchant, date, total, and currency.

1. Open the mobile app and tap the camera icon in the bottom right corner.
2. Upload or take a photo of your receipt. 
   - **To upload a photo** of a receipt you have saved on your phone, tap the photo icon in the left corner. 
   - **To take a photo**, tap the camera icon in the right corner to select the mode, make sure all of the transaction details are clearly visible,and then take the photo. 
      - Normal Mode: Upload one receipt. 
      - Rapid Fire Mode: Upload multiple receipts at once. 

You can open any receipt and click **Fill out details myself** to add or edit the merchant, date, current, total, description, category, or add attendees for group expenses. You can also add the expense to a report, determine if it is a reimbursable expense, or split the expense if multiple expense categories are included on one receipt. 

{% include info.html %}
**For iPhones**: You can also hard press the Expensify app icon on your phone to open a shortcut that automatically opens the camera to SmartScan a receipt. 
{% include end-info.html %}

{% include end-option.html %}

{% include end-selector.html %}

You can also email receipts to SmartScan by sending them to receipts@expensify.com from an email address tied to your Expensify account (either a primary or secondary email). SmartScan will automatically pull all of the details from the receipt, fill them in for you, and add the receipt to the Expenses tab on your account. 

{% include info.html %}
**For copilots**: To ensure a receipt is routed to the Expensify account you are copiloting instead of your own account, email the receipt to receipts@expensify.com with the email address of the account you are copiloting as the subject line of the email. 
{% include end-info.html %}

# Add a per diem expense

A per diem (also called “per diem allowance” or “daily allowance”) is a fixed daily payment provided by an employer to cover expenses during business or work-related travel. These allowances simplify travel expense tracking and reimbursement for meals, lodging, and incidental expenses. 

{% include info.html %}
Before you can add a per diem expense, a Workspace Admin must [enable per diem expenses](https://help.expensify.com/articles/expensify-classic/workspaces/Enable-per-diem-expenses) for the workspace and add the per diem rates. If you do not see an option for per diem rates, it is currently unavailable for your workspace, and you’ll need to reach out to one of your Workspace Admins for guidance.
{% include end-info.html %}

To add a per diem expense,

1. Click the **Expenses** tab.
2. Click **New Expense** and choose **Per Diem**.
3. Select your travel destination. 
   - If your trip involves multiple stops, create a separate per diem expense for each destination. 
4. Select the start date, end date, start time, and end time for the trip. 
5. Select a sub-rate. The available sub-rates are dependent on the trip duration. 
   - You can include meal deductions or overnight lodging costs if allowed by your workspace.
6. Enter any other required coding information, such as the category, description, or report, and click **Save**.

# Add a mileage expense

You can track your mileage-related expenses by logging your trips in Expensify. You have a couple of different options for logging distance:

- Web app: 
   - **Manually create**: Manually enter the number of miles for the trip 
   - **Create from map**: Automatically determine the trip distance based on the start and end location.
- Mobile app: 
   - **Manually create**: Manually enter the miles for the trip and your mileage rate
   - **Odometer**: Enter your odometer reading before and after the trip
   - **Start GPS**: Currently under development and unavailable for use. 

{% include info.html %}
When adding a distance expense, the rates available are determined by the rates set in your [workspace rate settings](https://help.expensify.com/articles/expensify-classic/workspaces/Set-time-and-distance-rates). To update these rates or add a new rate, you must be a Workspace Admin. 
{% include end-info.html %}

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}

1. Click the **Expenses** tab. 
2. Click **New Expense**. 
3. Select the expense type. 
   - **Manually create**:
      - Enter the number of miles for the trip.
      - Select your rate. 
      - If desired, select the category, add a description, or select a report to add the expense to.  
      - Click **Save**.
   - **Create from map**:
      - Add your start location as point A. 
      - Add your end location as point B. 
      - If applicable, click **Add Destination** to add additional stops.
      - To generate a map receipt, leave the Create Receipt checkbox selected.
      - Click **Save**.
      - Select your rate.
      - If desired, select the category, add a description, or select a report to add the expense to. 
      - Click **Save**.

{% include end-option.html %}

{% include option.html value="mobile" %}

1. Click the + icon in the top right corner.
2. Under the Distance section, select the expense type. 
   - **Manually create**: 
      - Enter your mileage.
      - Select your rate.
      - If desired, click **More Options** to select the category, add a description, or select a report to add the expense to. 
      - Click **Save**.
   - **Odometer**: 
      - Enter your vehicle’s odometer reading before the trip.  
      - Enter your vehicle’s odometer reading after the trip. 
      - Select your rate.
      - If desired, click **More Options** to select the category, add a description, or select a report to add the expense to. 
      - Click **Save**.
{% include end-option.html %}

{% include end-selector.html %}

# Add a group expense

Capture group and event expenses with Attendee Tracking by documenting who attended and the cost per attendee. The amount is always divided evenly between all attendees—different amounts cannot be allocated to specific attendees. To divide the amounts differently, you’ll first have to split the expense. 

{% include info.html %}
Attendees added to an expense will not be notified that they were added to an expense, nor will they share in the expense or be requested to pay for any portion of the expense. 
{% include end-info.html %}

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Click the **Expenses** tab. 
2. Click the expense you want to add attendees to.
3. Click the attendees field and enter the name or email address of the attendee.
   - If the attendee is a member of your workspace, you can select their name from the list. 
   - If the attendee is not a member of your workspace, enter their full name or email address and press Enter on your keyboard to add them as a new attendee. 
4. Click **Save**.

Once added, you’ll also see the list of attendees in the expense overview on the Expenses tab. To see the cost per employee, hover over the receipt total. These details are also available on any report that you add the expense to.
{% include end-option.html %}

{% include option.html value="mobile" %}
1. Tap the **Expenses** tab. 
2. Tap the expense you want to add attendees to.
3. Scroll down to the bottom and tap **More Options**.
4. Tap the attendees field and enter the name or email address of the attendee. 
   - If the attendee is a member of your workspace, you can select their name from the list. 
   - If the attendee is not a member of your workspace, enter their full name or email address and press Enter on your keyboard to add them as a new attendee. 
5. Tap **Save**.

Attendees will also be listed on any report that you add the expense to. 
 
{% include end-option.html %}

{% include end-selector.html %}

# Add expenses in bulk

You can upload bulk receipt images or add receipt details in bulk.

## SmartScan receipt images in bulk

{% include selector.html values="desktop, mobile" %}

{% include option.html value="desktop" %}
1. Click the **Expenses** tab.
2. Drag and drop up to 10 images or PDF receipts at once from your computer’s files. You can drop them anywhere on the Expense page where you see a green plus icon next to your mouse cursor. 
{% include end-option.html %}

{% include option.html value="mobile" %}
1. Open the mobile app and tap the camera icon in the bottom right corner.
2. Tap the camera icon in the right corner to select the Rapid Fire mode. 
3. Take a clear photo of each receipt. 
4. When all receipts are captured, tap the X in the left corner to close the camera. 
{% include end-option.html %}

{% include end-selector.html %}

## Manually add receipt details in bulk

*Note: This process is currently not available from the mobile app and must be completed from the Expensify website.*

1. Click the **Expenses** tab.
2. Click **New Expense** and select **Create Multiple**.
3. Enter the expense details for up to 10 expenses and click **Save**. 

## Upload personal expenses via CSV, XLS, etc.

*Note: This process is currently not available from the mobile app and must be completed from the Expensify website.*

1. Hover over Settings, then click **Account**. 
2. Click the **Credit Card Import** tab. 
3. Under Personal Cards, click **Import Transactions from File**. 
4. Click **Upload** and select a .csv, .xls, .ofx, or a .qfx file.

{% include faq-begin.md %}

**What’s the difference between a reimbursable and non-reimbursable expense?**

- **Reimbursable expenses**: Expenses that the company has agreed to pay you back for. This may include: 
    - Cash & personal card: Expenses paid for by the employee on behalf of the business.
    - Per diem: Expenses for a daily or partial daily rate [configured in your Workspace](https://help.expensify.com/articles/expensify-classic/workspaces/Enable-per-diem-expenses).
    - Time: An hourly rate for your employees or jobs as [set for your workspace](https://help.expensify.com/articles/expensify-classic/workspaces/Set-time-and-distance-rates). This expense type is usually used by contractors or small businesses billing the customer via [Expensify Invoicing](https://help.expensify.com/articles/expensify-classic/workspaces/Set-Up-Invoicing).
    - Distance: Expenses related to business travel.
- **Non-reimbursable expenses**: Expenses are things you pay for with company money that need to be documented for accounting purposes (like a lunch paid for with a company card).
- **Billable expenses**: Business or employee expenses that must be billed to a specific client or vendor. This option is for tracking expenses for invoicing to customers, clients, or other departments. Any kind of expense can be billable, in _addition_ to being either reimbursable or non-reimbursable.

You can also see a breakdown of these expense types on your report and can even organize the report by them.

{% include info.html %}
If you are an employee under a company workspace, your expenses may automatically be configured as reimbursable or non-reimbursable depending on the details that are entered. If an expense is incorrectly labeled, you must reach out to an admin to have it corrected.
{% include end-info.html %}

**Why don't I see the option for one of these types of expenses?**

If you are an employee under a company workspace, you may not see all of the different expense type options depending on your company’s workspace settings.

**How do I edit my per diem expenses?**

Per diem expenses cannot be amended. To make changes, you must delete the expense and recreate it.

{% include faq-end.md %}
