---
title: Configuring Flight Settings
description: Learn how to configure flight booking rules and cabin class restrictions in your Spotnana travel policy.
keywords: [flight policy, cabin class, travel approval, air booking rules, lowest logical fare, booking restrictions, expensify travel]
---


Set clear, customizable flight rules to control how travelers book airfare in Expensify travel. These settings help your team stay compliant while giving flexibility where needed.

---

## Where to find Expensify Travel

Tap the green ➕ **Create** button at the bottom of your screen, then choose **Book travel**.

If you don’t see **Book travel**, ask a Workspace Admin to [enable Expensify Travel](https://help.expensify.com/articles/travel/company-setup/Enable-Travel-on-a-Workspace) on the workspace. 

---

# Configuring flight settings

To configure your flight rules:
1. Open Expensify travel
2. Go to **Program > Policies**
3. Select a policy or click **Add new** to create one
4. Click the **Flight** tab

**Note:** Any setting with a chain link icon (🔗) that is not crossed out is inherited from a parent policy. To customize it, click the icon and unlock it from the parent.

---

## Flights not allowed to be booked

Admins can decide whether to allow the booking of basic economy fares for domestic and/or international flights and set the cabin classes that are not allowed for domestic and/or international flights (e.g., Business, Premium economy). 

Use this section to block specific fares and cabin classes:
- Basic economy fares - Domestic - Select whether to allow or not allow.
- Basic economy fares - International - Select whether to allow or not allow.
- Cabin class not allowed - Domestic - Select the fare types to restrict for domestic air travel: Economy, Premium Economy, Business, and First.
- Cabin class not allowed - International - Select the fare types to restrict for international air travel: Economy, Premium Economy, Business, and First.

_Note: These rules override all other policy settings._

---

## Restrict by fare name

Define specific keywords by airline to block flight fares containing those keywords in their fare names.

Click **+ Add Restriction**, select the airlines the restriction applies to, then enter comma-separated keywords that should be restricted in the fare name.

**Note:** Keywords are matched against fare names using complete word matching. Matching is:
- Case-insensitive
- Airline-specific
- Evaluated independently

For example:
- The keyword **Basic** will match **Basic Economy** and **Basic Plus**
- The keyword **Bas** will not match **Basic Economy**

---

## Highest cabin class - Domestic flights

Set a cabin class for domestic travel:
- **Default cabin class**: Set a global default or add conditions for longer flights that allow for more flexible options.
- **Allow personal upgrade**: Let travelers pay the difference for upgrades. 
- **Out of policy action**: Choose what happens when the rule is violated:
  - Default to group policy action
  - No action
  - Passive approval
  - Hard approval
  - Block booking

---

## Highest cabin class - International flights

Set a cabin class for international travel:
- **Default cabin class**: Set a global default or add conditions for longer flights that allow for more flexible options.
- **Allow personal upgrade**: Let travelers pay the difference for upgrades. 
- **Out of policy action**: Choose what happens when the rule is violated:
  - Default to group policy action
  - No action
  - Passive approval
  - Hard approval
  - Block booking

---

## Highest cabin class - Overnight flights

Define what it means to have an overnight flight and manage settings for overnight flights including:
- **Cabin class**: Pick a higher allowed class.
- **Nighttime hours**: Define what hours count as overnight.
- **Required nighttime travel time**: Set the minimum hours needed for the policy to apply.
- **Include layover time**: Toggle on/off to include layover time when calculating whether a flight is overnight or not.

---

## Allow cabin upgrades - Domestic

Let travelers book higher cabin classes when conditions are met:
- **Upgrade conditions**:
  - Allow if cheaper than lowest in-policy fare
  - Allow if in-policy fare is unavailable
- **Allow upgrades up to**:
  - Economy
  - Premium Economy
  - Business
  - First

---

## Allow cabin upgrades - International

Let travelers book higher cabin classes when conditions are met:
- **Upgrade conditions**:
  - Allow if cheaper than lowest in-policy fare
  - Allow if in-policy fare is unavailable
- **Allow upgrades up to**:
  - Economy
  - Premium Economy
  - Business
  - First
 
---

## Add Block fares with airport transfers

Block travelers from booking flights that require changing airports during layovers.

To enable this restriction, customers can click the toggle.
   
---

## Budgets

Create dynamic flight budgets for domestic and international flights.

Set budgets in two ways:
- **Maximum price per booking** for all flights booked under the policy
  - Further customization is possible, setting a maximum price based on the flight duration, allowing higher budgets for longer flights.
- Dynmaic **Amount or % over** the maximum price per booking, which includes the following options:
  - None
  - More than lowest fare
  - More than median fare
  - Less than median fare
  - More than lowest logical fare


---

## Lowest logical fare

The settings described here offer travel admins the ability to control both how the lowest logical fare value is calculated for any given fare search and how in-policy ranges around that fare value are applied. It may take some time for you to find the lowest logical fare settings that work best for your company. 

Some possible suggestions when first using this feature are:

- Set the More than lowest logical fare field to a value that allows your travelers some flexibility to select the flight that is best for them. This setting is found under both the Dynamic Flight Budget – Domestic and Dynamic Flight Budget – International fields (under Budget).
- Set the No. of stops field to Fewest.
- Set the Airport connection changes field to Don’t allow.
- Consider setting the Carrier field to Exclude and selecting budget airlines to exclude from the lowest logical fare calculation.

Configure the following setting for more flexible control and traveler ease of use. 
- **Layover duration** (Domestic and International) - Set the maximum layover time (per stop) to be considered when generating the lowest logical fare. If the route a user selects has a minimum layover duration time higher than this setting, the shortest layover time will be used to generate the lowest logical fare value.
- **Number of stops** - Set the number of stops to be used when generating the lowest logical fare. Options include:
    - Any - Consider all flights regardless of the number of stops.
    - One stop or less – Consider all flights with one stop or less. If selected, and route selected by user only offers non-stop, lowest logical fare would use non-stop. If route selected by the user had one-stop options, lowest logical fare would use one-stop.
    - Two stops or less – Consider all flights with two stops or less. If selected, and route selected by user only offers non-stop, lowest logical fare would use non-stop. If route selected by the user had one-stop options, lowest logical fare would use one-stop. If route selected by the user had two-stop options, lowest logical fare would use two-stops.
    - Fewest – If selected, and route selected by user had non-stop and one-stop options, lowest logical fare would use non-stop. If route selected by the user had only one-stop and two-stop options, lowest logical fare would use one-stop.
- **Flight time window** (Domestic and International) - Set the number of hours before and after a flight's departure time to be used to generate the lowest logical fare value. For example, if you select +/- 2 hours, for a 10am flight, any departure between 8am-12pm would be considered.
- **Airport connection changes** - Set whether flights that require airport changes are to be included or excluded when generating the lowest logical fare value. An example of an airport change could be a connecting flight in New York City, NY that requires the traveler to arrive at JFK but depart from LGA. 
- **Carrier** inclusion/exclusion - Designates the carriers that should be included or excluded when generating the lowest logical fare value. Options include:
    - Any (allow all carriers)
    - Include – Search for and select the carriers to include when generating the lowest logical fare value.
     - Exclude – Search for and select the carriers to exclude when generating the lowest logical fare value.
- **Mixed cabin itineraries** - Allow the lowest logical fare to include fares containing mixed cabin classes (for flights with more than one leg). Only cabin classes at or below the maximum allowed by policy will be considered.

---

## Add-ons

Admins can allow travelers to book extras for increased flexibility and comfort. Set options to:
- Allow all
- Disallow all
- Allow select options:
  - Additional baggage
  - Early check-in
  - Seat add-ons

---

## Booking window - Domestic

Set a pre-departure day threshold for when bookings become out-of-policy.

---

## Booking window - International

Set a pre-departure day threshold for when bookings become out-of-policy.

---

## Refundable tickets

Determine whether refundable tickets are considered in policy. If you select "Don't allow", all refundable tickets will be out of policy (except when the cost of the refundable fare is lower than the non-refundable one on the same flight). Options include:
- Any (allow all)
- Fully refundable only
- Partially refundable only
- Non-refundable fares allowed

---

## Changeable tickets

Set the changeable status of tickets that are considered in policy:
- Any (allow all)
- Fully changeable only
- Partially changeable only
- Non-changeable fares allowed

---

## Maximum CO2 per passenger kilometer

For companies tracking carbon emissions, travel admins can set a carbon emissions threshold. Flights exceeding the threshold are out of policy.

---

## Out of policy reason codes

Use these settings to require reasons from employees when booking out-of-policy flights and create new out-of-policy codes for travelers to use.
- Enable the toggle to **Capture out-of-policy reason codes for flights**.
- Click on **Manage Reason codes** to create new codes and manage tracked ones.

---

# FAQ

## What happens if a traveler books a restricted fare type?

Depending on the action you select in your settings, the booking will be flagged as out of policy or blocked.

## What’s the difference between a budget and the lowest logical fare?

Budgets set fixed or dynamic limits within a dollar or percentage threshold. The lowest logical fare (LLF) is even more dynamic and offers travelers extra flexibility. It uses search criteria like duration and stops to define a “logical” range.

## Can I allow upgrades only when certain conditions are met?

Yes. You can allow cabin upgrades if they’re cheaper than the in-policy fare or if an in-policy fare isn’t available.

## Are refundable or changeable fares always in policy?

Not necessarily. You must configure which types of refundable and changeable fares qualify as in-policy in the Refundable and Changeable ticket settings.

## What happens if a traveler exceeds the CO2 threshold?

The flight will be marked out of policy. Travelers can still book it if allowed, but the policy settings you configure will determine the approval action.

