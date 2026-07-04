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

* Summarize related workflows.
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

Suggest screenshots only when they meaningfully improve a member's understanding of the concept.

Good screenshot candidates include:

* Illustrating the location of a feature or product area
* Helping members orient themselves within the product
* Highlighting important settings or configuration areas discussed in the article
* Demonstrating concepts that are easier to understand visually
* Showing confirmation states or error messages when they support the explanation

Do not suggest screenshots that:

* Replace the written explanation
* Document procedural steps
* Duplicate the surrounding text
* Show simple or obvious UI
* Add maintenance burden without improving comprehension

Before suggesting a screenshot, ask:

> **What specific confusion would this screenshot prevent or resolve?**

If there is no clear answer, do not suggest one.

Suggested screenshots must use the standard HTML comment format:

```html
<!-- SCREENSHOT:
Suggestion: [Describe the exact UI state to capture]
Location: [Where it belongs in the article]
Purpose: [What specific confusion this screenshot prevents or resolves]
-->
```

Place the comment immediately after the section it supports.

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
