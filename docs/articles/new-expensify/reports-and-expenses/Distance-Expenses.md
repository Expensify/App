---
title: Distance Expenses
description: Learn how to create a Distance expense using GPS tracking, map-based routes, or manual entry, and how the reimbursement rate is determined in New Expensify.
keywords: [New Expensify, distance expense, mileage reimbursement, create expense, distance rate, workspace rate, map route, reimbursement rate, manual mileage, manual distance, global create, track distance, GPS, GPS tracking, start GPS, track route, track mileage, mileage tracking, calculate mileage reimbursement, mileage rate]
internalScope: Audience is all members. Covers creating Distance expenses using GPS tracking, map-based routes, and manual entry, plus how reimbursement rates are applied. Does not cover configuring Workspace distance rates in detail or broader report submission workflows.
---

# Distance Expenses

Expensify offers three ways to create a Distance expense: **GPS tracking** on mobile, **map-based routes** using start and end locations, or **manual entry** by typing in the distance. This guide explains each method and how the reimbursement rate is determined.

---

## How to create a GPS Distance expense (Mobile only)

GPS tracking lets Expensify record your actual driving route in the background while you drive. When you stop, the app generates a receipt with a map of the route you took.

To create an expense using GPS tracking based on the distance traveled: 

1. Tap the **➕ Create** button.
2. Select **Track distance**.
3. Select **GPS** from the top row.
4. Tap **Start** and drive to your destination — tracking runs in the background.
5. Tap **Stop** when you arrive and confirm by selecting **Stop GPS tracking**.
6. Review the route summary showing your start and end addresses, then tap **Next**.
7. Review the expense details, then tap **Create expense**.

**Note:** GPS tracking is available on iOS and Android only. On Web, you'll see a prompt to download the mobile app when selecting the GPS option.

---

## How to create a map-based Distance expense (Web and Mobile)

To create an expense using distance between the starting and ending locations of your trip:

1. Select the **➕ Create** button and select **Track distance**.
2. Select **Map** from the top row.
3. Enter the **Start** and **Stop** locations.
   - To include additional stops, select **Add stop**.
4. Select **Next**.
5. On the confirmation screen, review and confirm:
   - Distance
   - Amount
   - Date
   - (Optional) Add a description, category, or tag. 
6. Select **Create expense**. 

---

## How to create a manual Distance expense (Web and Mobile)

To create an expense by inputting a distance manually:

1. Select the **➕ Create** button and select **Track distance**.
2. Select **Manual** from the top row.
3. Enter the number of miles or kilometers you need to be reimbursed for.
4. Select **Next**.
5. On the confirmation screen, review and confirm:
   - Distance
   - Amount
   - Date
   - (Optional) Add a description, category, tag or receipt.
6. Select **Create expense**.

Once a Distance expense is created, it can be submitted on a report. To learn how to add expenses to a report, see [Create and Submit Reports](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Create-and-Submit-Reports). 

---

## How reimbursement rates are set for Distance expenses

### Distance expenses created on a Workspace

If you are creating expenses on a Workspace: 

- Workspace Admins set and manage the reimbursement rates for the workspace's distance unit (miles or kilometers).
- When creating a Distance expense, the available reimbursement rates will show for selection.

[Learn how to manage distance rates as a Workspace Admin](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Managing-Distance-Rates)

### Distance expenses created for personal tracking

If you're creating expenses outside of a Workspace:

- Expensify sets a default rate based on your payment currency. 
   - Example: For USD, the rate is based on the current IRS reimbursement rate and uses miles.
   - Distance default rates are updated annually.

**Note:** Only Workspace Admins can set a custom distance rate. It's not possible to set a custom distance rate for personal expenses outside of a Workspace.

---

# FAQ

## Can I reuse recent locations?

Yes! When selecting the **Start** and **Stop** addresses, recently used locations will appear for quick selection.

## How do I create a round-trip expense?

To create a round-trip Distance expense, enter the same location for both the starting point and destination, and add one or more waypoints in between.

For example, if you're starting and ending in San Francisco but making a stop in Los Angeles, enter:
**San Francisco → Los Angeles → San Francisco**

## How are Distance expense amounts calculated?

The expense amount is automatically calculated by multiplying the distance by the Workspace’s distance rate. If no Workspace is assigned to the expense, a default rate is applied based on your default currency. Distance expenses are rounded to two decimal places.

## Can I edit a Distance expense after I’ve created it?

Yes! You can edit the expense before it is approved. To learn how to edit an expense, see [Managing Expenses in a Report](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Managing-Expenses-in-a-Report).

## Can I update the Distance expense unit or rate?

The distance unit and rate can only be updated by a Workspace Admin on the Workspace. It is not possible to adjust the distance rate or unit at the expense level. 

## What happens if a Distance expense is moved to a different Workspace?

When a Distance expense is moved to another Workspace, it keeps its original unit and rate.

If the rate isn’t valid in the new Workspace, the expense will show a “Rate not valid for this workspace” violation. Selecting a valid rate will update the expense.

## Do I need to keep the mobile app open during GPS tracking?

No. GPS tracking runs in the background on your mobile device. A notification confirms that tracking is active, so you can use other apps or lock your phone while driving.

## What does the GPS Distance expense receipt look like?

The GPS receipt shows a map of your actual route driven, along with the total distance and calculated reimbursement amount. It looks similar to a map-based distance receipt, but reflects the path you actually took rather than a suggested route.

## Can I use GPS tracking on web or desktop?

No. GPS tracking requires the iOS or Android mobile app because it uses your device's location services. On web or desktop, you'll see a prompt to download the mobile app when selecting GPS. You can still use map-based or manual distance entry on any platform.

