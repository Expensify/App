---
title: Search Functionality in New Expensify
description: Learn how to effectively use the powerful search feature in New Expensify to find and filter your financial data quickly and efficiently.
---
<div id="expensify-classic" markdown="1">

The Search functionality in New Expensify provides a powerful way to locate and filter financial data. 
With advanced autocomplete suggestions and predefined filters, you can quickly find specific expenses, reports, 
invoices, and more across the platform.

## Main Uses

- **Locate specific transactions** - Quickly find expenses, invoices, or other financial data using keywords or filters.
- **Filter by status** - Easily view items based on their current state (Drafts, Outstanding, Approved, etc.).
- **Save frequent searches** - Store commonly used search parameters for quick access in the future.

## Search Components
The search functionality in Expensify consists of several key components:

- **Search input** - Located at the top of the Reports view for entering search terms.
- **Left-hand navigation (LHN)** - Allows switching between different data types and saved searches.
- **Predefined filters** - Quick-access filters at the top of each list view.
- **Autocomplete modal** - Suggestions that appear as you type in the search input.
- **Results list** - The formatted list of search results displayed below the filters, showing matching items based on 
your search criteria and selected filters.

# How Search Works
## Basic Navigation
1. When you select a data type from the LHN (Expenses, Expense Reports, Chats, Invoices, or Trips), the system calls the `/Search` endpoint to display results.
2. Selecting a predefined filter (All, Drafts, Outstanding, etc.) also triggers the `/Search` endpoint with the appropriate parameters.

## Using Predefined Filters
Each data type offers specific predefined filters for quick access:

1. Navigate to the desired data type view (e.g., Expenses) via the LHN.
2. At the top of the list, select one of the predefined filters:
    - **All** - Shows all items (default selection)
    - **Drafts** - Items not yet submitted
    - **Outstanding** - Items awaiting action
    - **Approved** - Items that have received approval
    - **Done** - Completed items
    - **Paid** - Items that have been reimbursed or paid

Note: Available filters may vary depending on the data type selected.

## Using the Search Input
The search input provides powerful functionality:
1. Click in the search field at the top of the Reports view.
2. Begin typing your search term.
3. The autocomplete modal appears with suggestions:
    - The first option always shows your exact search text with a magnifying glass icon
    - Additional suggestions based on your input from `/SearchForReports` and Onyx data
4. Select first suggestion (magnifying glass icon with search text) or press Enter to execute the search (`/Search` endpoint call).
5. Clicking on any other suggestion (retrieved from either `/SearchForReports` or Onyx data) directly opens the selected report by calling the `/OpenReport` endpoint.
