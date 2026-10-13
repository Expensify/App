# Task Articles

Task articles should describe things the user intentionally does. Outcomes, consequences, and eligibility rules belong inside those task articles or in related topic articles.

---
title: Clear Task-Based Title Using the Feature Name (title case)
description: A concise summary of the article for search results.
keywords: [primary search phrases]
internalScope: Audience is [who this article is for]. Covers [single workflow]. Does not cover [closely related workflows].
contentType: task
platform: [platform value]
---

<!--

This template follows the HelpDot authoring standards.

Before writing:

1. Why would someone search for this article?
2. What are they confused about?
3. What are the two or three questions they expect this article to answer?

Answer those questions before describing the interface.

Write from the customer's perspective, not the product's.

Remember:

- One workflow per article.
- Explain concepts before details.
- Prioritize clarity over completeness.
- Remove anything that doesn't help the customer succeed.
- Use title case for the title and sentence case for every ## heading.
- Follow docs/HELPSITE_NAMING_CONVENTIONS.md for UI references, navigation, and capitalization.

-->

# [Article title]

Briefly answer the customer's question.

Explain:

* what this workflow or feature is
* when someone would use it
* what they'll accomplish

Avoid marketing language, implementation details, and unnecessary UI narration.

---

## Who can use [feature name]

State only the information the reader needs:

* required role
* required plan (if applicable)
* required permissions
* important prerequisites

If another workflow must be completed first, link to it using a relative link.

If unavailable on a platform, name the platform where it is available:

This feature is only available on web. It isn't available on mobile.

---

## How to [complete primary task]

Keep the steps focused.

Describe only the actions necessary to complete the task.

Do not document every click if it doesn't help the reader.

Use **select** for UI interactions and **choose** only for decisions between options.

Start navigation in the navigation tabs with a bolded navigation path:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > [Section name]**.
2. Select **[Exact button name, matching the UI]**.

If web and mobile differ, separate the instructions under "On web:" and "On mobile:".

If they're identical, combine them.

<!-- SCREENSHOT:
Suggestion:
Location:
Purpose:
-->

---

<!--

Include this section only when the workflow changes behavior or has important consequences.

-->

## What happens after you [complete task]

Explain what changes after completing the workflow.

Focus on consequences the customer may not expect.

Examples:

* billing changes
* notifications
* approvals
* ownership changes
* synchronization
* downstream effects

Don't restate what the task already accomplished.

---

<!--

Include this section only when another workflow naturally follows from this one.

Limit to essential articles.

-->

## Related articles

* [Related workflow](/relative-link)
* [Related workflow](/relative-link)

---

<!--

Include an FAQ only if there are genuine follow-up questions that are not already answered naturally in the article.

Do not invent FAQs to fill out the template.

-->

# FAQ

## [Natural customer question]

Clear answer.

## [Another natural follow-up question]

Clear answer.
