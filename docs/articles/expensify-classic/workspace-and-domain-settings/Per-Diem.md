---
title: Expensify Per Diem Settings
description: Expensify Per Diems support simple, pre-determined, tax-free allowances set by your jurisdiction or company.
---
# Overview

Per Diems are a flat rate given based on a timed range traveled for business purposes regardless of actual expenses incurred. A Per Diem is only based on the time you travel for work: it starts when you leave your home and ends when you arrive home.

Per Diems themselves are created to alleviate much of the heavy lifting that expense reporting is well known for. Per Diem claims generally remove the hassle of saving multiple receipts and allow you to claim back a simple, pre-determined, tax-free allowance set by your jurisdiction or company.

# How to set up Per Diems in Expensify

Per Diem rates are set up in your company Group workspace from **Settings** > **Workspaces** > **Group** > [_Workspace Name_] > [**Per Diem**](https://expensify.com/policy?param={"policyID":"20AB6A03EB9CE54D"}#js_policyEditor_perDiem). From there, click the toggle to enable the Per Diem feature.

Next, you'll notice four headings:

- Destination
- Sub-rate
- Amount
- Currency 

## Configuring your Per Diem spreadsheet

These four headings are crucial to the setup. You'll want to configure a spreadsheet with your Destinations, filtering down to Subrates with different Amounts and Currencies for each.

Some example spreadsheets can be found below:

- 🇩🇪 [Here](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1596692482998-Germany+-+Per+Diem.csv) for an example of Germany multi-subrates
- 🇸🇪 [Here](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1604410653223-Swedish+Per+Diem+Rates.csv) for an example of Sweden multi-subrates
- 🇿🇦  [Here](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1596692413995-SA+Per+Diem+Rates.csv) for an example of South Africa single rates

When uploading this spreadsheet in Expensify, you'll be asked to map each heading to the relevant column.

Once uploaded, every rate is editable in-line. Updating a single Destination will update the name for all Destinations, as will the Currency. Updating the Amount and Subrate names will not update for all Destinations though, only the individual Destination. All Destinations will also be alphabetically paginated for easy navigation.

And that's it! You're done and ready to start approving your Per Diems!

# Deep dives

The real challenge of supporting Per Diem for everybody is that there are few standards between jurisdictions, which still rely heavily on these for employee expenses. There is no standard set of rates, deductions, or incidentals across countries.

Expensify supports multiple countries by allowing full customization via a blank slate of Destinations and Subrates. Each Destination can have a few, or as many Subrates as needed, and these Subrates each have a fully customizable Amount (positive or negative to handle deductions or additions) and Currency.

## What makes up a Per Diem rate?

When calculating the reimbursable total of a Per Diem expense, the total typically also depends on three things:

**Geography:** 

- The destination in which you're traveling and working.
- This is defined by the location of the trip.

**Time working away from home:**

- The total of which is broken down based on the Subrates configured (i.e. per 8 hours for Part Days, per 24 hours for Full Days etc).
- This is defined by the length of the trip.

**Additional Allowances:** 

- Any expenses that are covered by a Per Diem Subrate configured on the workspace (traditionally subsistence expenses: meals & lodging etc, but occasionally also sometimes transport, entertainment etc).
- This is defined by the employee on the trip.

From an accounting perspective, Per Diem expenses typically fall in a single Per Diem account regardless of which rates are used. Expensify allows you to set a Default Per Diem category, so employees never need to worry about this.

Most companies will also set a Description Hint, which allows admins to take the hassle out of understanding Per Diem rules from employees when creating their Per Diems.

## What are the pros and cons of Per Diems?

**Pros:**

- Per Diems allow for simple pre-set amounts for trips, reducing or removing the need for traveling employees to save purchase receipts. This allows for approval without documentation up to an amount the company is willing to reimburse which saves the admin time. The only approval is vetting the correct Per Diem use.
- It can encourage prudence as employees know their set limits per day and are unlikely to incur spend over-and-above this, as this could come at a personal cost, depending on the company workspace.
- Per Diems grant more predictability when budgeting for travel.
- Global tax-free rates are often set by a State or jurisdiction, alleviating the responsibility for admins to create "appropriate" reimbursable amounts.

**Cons:**

- Sometimes, jurisdiction-set amounts can be deemed incorrect or too low. In these cases, it can be challenging to establish a fair and realistic per diem for different costs in different locations. Additionally, allowing more than a tax-free amount adds undue labor for admin teams to split out taxable and tax-free expense reimbursements.
- Set Per Diems might restrict employee choices that could have benefitted the company, i.e., a sales team member not picking up a full dinner tab or pushing split bill reclamation back onto employees after an individual picks up the tab and each user submits their own Per Diem claims.
- It does not eliminate employee expense fraud, and reduced receipt requirements may make it easier.
- As a business, you can never be sure that your expenses bill matches what employees have had to spend. Because you're reimbursing pre-determined amounts, there may be substantial hidden savings you're not taking advantage of. 

## How to manage existing rates and avoid duplicates

When you _Export to CSV_, Expensify also assigns a Rate ID to each existing rate, allowing you to edit and overwrite existing rates when you upload a spreadsheet of rates, preventing duplicate rates from being uploaded. It is useful when holding multiple years' worth of rates within a workspace for a small period of overlapping claims.

Note: _This rate ID corresponds to the Destination+Subrate. You cannot overwrite Destinations, but you can overwrite the Subrate within a Destination by using this rate ID. Always use the “Clear Rate” option with a fresh upload when removing large numbers of rates rather than deleting them individually._

# FAQs

## How do I report on my team's Per Diem expenses?

Great question! We’ve added a Per Diem export for users to export Per Diem expenses, detailing start dates, end dates, and the number of days the trip took, amongst some standard fields to export. However, if your jurisdiction requires some extra data, reach out to Concierge or your account manager.

## What if I need help setting the exact rate amounts and currencies?

Right now, Expensify can't help determine what these should be. They vary widely based on your country of origin, the state within that jurisdiction, your company workspace, and the time (usually year) you traveled. There's a demonstration spreadsheet [here](https://s3-us-west-1.amazonaws.com/concierge-responses-expensify-com/uploads%2F1596692482998-Germany+-+Per+Diem.csv), but it shouldn't be used for actual claims unless verified by your internal finance team or accountants. 
