---
title: Describe Your Search on the Spend Page
description: Learn how to use Describe your search in New Expensify to turn a plain-English description, such as meals over $50 last month, into filters on the Spend page.
keywords: [New Expensify, Describe your search, describe search, natural language search, plain English search, Spend page, advanced filters, filter expenses, search without operators, AI search]
internalScope: Audience is all New Expensify members who use the Spend page. Covers describing a search in plain English to generate Spend page filters. Does not cover selecting filters manually, search operator syntax, or saved searches.
---

# Describe Your Search on the Spend Page

**Describe your search** lets you type what you are looking for in plain English, such as `meals over $50 last month`, and Expensify turns it into filters on the **Spend** page. Use it when you know what you want to see but do not want to set each filter by hand.

Your description is turned into the same filters you could select yourself, so you can adjust, remove, or save them afterward like any other search. Describing a search requires an internet connection.

---

## Who can use Describe your search

Any New Expensify member can use **Describe your search** on the **Spend** page. No Workspace Admin role or plan upgrade is required.

**Describe your search** is available on both web and mobile, but it opens differently on each: on web it appears inside the filters popup, and on mobile it opens as its own screen.

---

## How to describe your search on the Spend page

Web:

1. In the navigation tabs on the left, click **Spend**.
2. Click **Filters**.
3. Hover over **Describe your search** at the top of the left column. The right side of the popup switches to a **Your search** field.
4. In **Your search**, type a description of what you want to see, such as `card expenses last 30 days`.
5. Click **Apply**.

The popup closes and the **Spend** page reloads with the matching filters applied.

Mobile:

1. In the navigation tabs on the bottom, tap **Spend**.
2. Tap the **Filters** icon next to the search box.
3. Tap **Describe your search** at the top of the filter list.
4. In **Your search**, type a description of what you want to see, such as `card expenses last 30 days`.
5. Tap **Apply**.

The **Spend** page loads with the matching filters applied. To leave without searching, press Back to return to the filter list.

<!-- SCREENSHOT:
Suggestion: The Filters popup on web with Describe your search hovered at the top of the left column, showing the Your search field and the Apply button in the right panel.
Location: Immediately after the Web steps above.
Purpose: Members expect a new page to open when they select Describe your search on web, and may not realize the input appears in the right half of the same popup on hover.
-->

---

## How Describe your search turns your description into filters

Expensify reads your description and applies the filters that match it, including dates, amounts, categories, expense types, and keywords. For example, `meals over $50 last month` applies a category filter, an amount filter, and a last-month date range at the same time.

Category names are matched against the categories that exist in your workspace. A description that mentions meals matches a **Meals and Entertainment** category if your workspace has one.

When nothing in your description matches a workspace category, the words are searched as a keyword instead. For example, `coffee over $20` searches for the keyword coffee rather than looking for a category named coffee.

The result is an ordinary **Spend** page search. The filters appear on the page just as they would if you had selected them yourself, so you can change any of them, clear them, or keep refining your results.

Descriptions work best when they name concrete things, such as a time period, an amount, a merchant, a category, or a payment type. Compare these examples:

- `card expenses last 30 days`
- `unreported expenses over $100`
- `travel expenses from Q2`

For operator-based searches such as `amount>5000 status:approved`, [learn how to use search operators to filter and analyze](/articles/new-expensify/reports-and-expenses/Use-Search-Operators-to-Filter-and-Analyze).

---

## What to do when Describe your search shows an error

**Describe your search** finds expenses that match a description. It does not answer questions about your data, so a request such as `what are my biggest expense categories` returns an error instead of results.

When an error appears, the field stays open with your text in it. Rewrite the description as something you want to see, such as `expenses grouped by category`, and select **Apply** again.

You also see an error if you are offline when you select **Apply**, because your description has to be sent to Expensify to be interpreted. Reconnect and select **Apply** again.

---

# FAQ

## Can I change the filters after describing my search?

Yes. The filters are applied to the **Spend** page exactly as if you had selected them yourself, so you can edit them, remove them, or keep narrowing your results.

## Why did my search use a keyword instead of a category?

Because nothing in your description matched a category in your workspace. If you expected a category match, check the exact category name on the workspace and use wording closer to it.

## Does Describe your search work offline?

No. Your description is interpreted by Expensify, so an internet connection is required. Selecting **Apply** while offline shows an error, and the button returns to its normal state so you can try again once you reconnect.

## Why do I get an error instead of results?

The most common reason is that the description asks a question rather than describing expenses to show. Rephrase it as the results you want to see, then select **Apply** again.
