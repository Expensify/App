# Expensify HelpDot Topic Article Guidelines

## Purpose

Topic articles explain how an area of Expensify works.

They help customers understand concepts before they perform related tasks.

Topic articles answer questions such as:

* How does billing work?
* What is a Workspace?
* How do approvals work?
* How do reimbursements work?
* How do subscription plans work?

The goal of a Topic article is customer understanding.

---

# 1. Core Principles

Every Topic article must:

* Explain one product concept or product area.
* Match a specific customer question.
* Use exact product terminology.
* Follow the official naming conventions.
* Be optimized for semantic retrieval.
* Be concise, organized, and easy to scan.

If multiple unrelated concepts are required, create multiple articles.

---

# 2. Scope Rules

Topic articles must:

* Explain how a product area works.
* Build understanding before explaining workflows.
* Focus on the concepts customers need most.
* Explain common scenarios before exceptions.
* Define important terminology when helpful.

Topic articles may:

* Summarize related workflows to provide context.
* Briefly explain high-level behavior.
* Link to Task articles for procedural instructions.

Topic articles must not:

* Become step-by-step instructions.
* Explain every setting or configuration option.
* Attempt to document every edge case.
* Become a navigation hub.
* Cover multiple unrelated concepts.

If the primary goal is completing a workflow, create a Task article instead.

---

# 3. Editorial Principles

Good Topic articles help customers understand the product—not document every implementation detail.

When writing:

* Start by answering the customer's question.
* Explain the concept before discussing the interface.
* Build understanding from foundational ideas to supporting details.
* Focus on customer-facing behavior rather than implementation.
* Prioritize common situations before exceptions.
* Remove unnecessary detail.
* Use screenshots only when they meaningfully improve understanding of the concept.

Avoid:

* step-by-step procedures
* exhaustive UI descriptions
* documenting every configuration option
* implementation details customers don't need
* lengthy discussions of rare edge cases
* using screenshots that simply duplicate the written explanation

If a sentence doesn't improve customer understanding, remove it.

---

# 4. Metadata Requirements

Every Topic article must include:

```yaml
---
title: Clear concept-based title using the feature name
description: Short summary of the concept
keywords: [primary concept, feature name, related search terms]
internalScope: Audience is [target role]. Covers [concept]. Does not cover [excluded workflows or concepts].
contentType: topic
platform: [platform value]
---
```

Metadata should reflect realistic customer search behavior.

---

# 5. Heading Requirements

Topic headings should answer customer questions about the concept.

Prefer headings beginning with:

* How
* What
* Who
* When
* Why

Examples:

* How billing works
* What determines your subscription cost
* Who manages subscription billing
* When you're charged
* Why billing problems occur

Avoid:

* Overview
* Introduction
* Notes
* Setup
* Procedure-based headings
* Generic noun-only headings

Each heading should communicate one distinct idea.

---

# 6. Organization Requirements

Organize information from foundational concepts to supporting details.

A typical progression is:

1. Explain the overall concept.
2. Describe the major components.
3. Explain how they relate.
4. Explain common customer scenarios.
5. Explain important exceptions only when they affect customer understanding.

Don't force every article into this structure if another organization is clearer.

Good organization is more important than rigid consistency.

---

# 7. Screenshot Guidelines

Only suggest screenshots when they meaningfully improve a member's understanding of the article. Screenshots are optional—not every article or workflow requires them.

## Screenshot Decision Criteria

Suggest a screenshot only if it accomplishes one or more of the following:

* Helps members orient themselves within an interface by confirming they are on the correct page or screen
* Clarifies a complex concept, relationship, or high-level workflow
* Highlights an important setting, filter, configuration option, decision point, or UI element
* Demonstrates a feature or capability that is easier to understand visually
* Shows a confirmation state or error message members should recognize
* Shows a key interface state that is difficult to describe through text alone
* Addresses an area likely to generate member confusion or support questions
* Helps members locate the correct page, setting, or control in a connected third-party platform when that context is essential

The interface may be Expensify or a connected third-party platform.

Do **not** suggest a screenshot if it would:

* Replace written instructions instead of supporting them
* Document every step of a workflow
* Simply mirror or duplicate the surrounding text
* Show a simple, obvious interface that members can easily identify from the instructions alone
* Add maintenance overhead without significantly improving comprehension

Before suggesting a screenshot, ask:

> **What specific confusion would this screenshot prevent or resolve?**

If there is no clear answer, do not suggest a screenshot.

## Screenshot Placeholder Format (Non-Rendered)

Screenshot suggestions must use HTML comments so they remain invisible in the rendered HelpDot article.

Use this exact structure:

```html
<!-- SCREENSHOT:
Suggestion: [Describe the exact UI state to capture]
Location: [Where it should appear in the article]
Purpose: [What specific confusion this screenshot prevents or resolves]
-->
```

Rules:

* Must begin with `<!-- SCREENSHOT:`
* Must end with `-->`
* Must not appear inline within a sentence
* Place immediately after the section or step it supports
* Describe the exact UI state to capture rather than the general page
* The **Purpose** must explain the unique value of the screenshot. Do not use generic statements such as "Provides a visual reference."

---

# 8. Retrieval Optimization

Topic articles should:

* Target one customer understanding question.
* Include realistic customer search phrases.
* Use exact feature names.
* Reinforce important terminology naturally throughout the article.

Topic articles should not:

* Cover multiple product areas.
* Mix unrelated concepts.
* Expand into procedural documentation.

The article should clearly answer:

> "How does this work?"

within the first two paragraphs.

---

# 9. Cross-Linking

Cross-links should primarily point to:

* Task articles
* Closely related Topic articles
* Required prerequisite concepts

Avoid excessive linking.

If numerous links seem necessary, the article scope is probably too broad.

Prefer a short **Related articles** section instead of frequent inline links.

---

# 10. Validation Checklist

Before publishing, confirm:

* `contentType` is `topic`.
* One primary concept is covered.
* The introduction immediately explains the concept.
* Headings answer meaningful customer questions.
* Concepts are explained before interface details.
* Common scenarios receive the most attention.
* Important terminology is used consistently.
* UI terminology matches the product.
* Metadata reflects customer search intent.
* Cross-links are minimal and purposeful.
* Every suggested screenshot has a clear purpose that prevents or resolves a specific member confusion.
* Every paragraph teaches something useful.
* Unnecessary implementation details have been removed.
* The article improves customer understanding.
* The finished article reads like it was written by an experienced Expensify support agent.
