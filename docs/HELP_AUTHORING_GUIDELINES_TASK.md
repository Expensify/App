# Expensify HelpDot Task Article Guidelines

## Purpose

Task articles explain how to complete a specific workflow in Expensify.

Task articles answer questions such as:

* How do I submit an expense?
* How do I change my Workspace plan?
* How do I connect NetSuite?
* Why can't I complete a specific action?

The goal of a task article is successful task completion.

---

# 1. Core Principles

Every task article must:

* Solve one primary workflow only
* Match a specific customer goal
* Use exact UI terminology
* Follow the official naming conventions
* Be optimized for semantic retrieval
* Be concise, actionable, and easy to scan

If multiple workflows are required, create multiple articles.

---

# 2. Scope Rules

Task articles must:

* Focus on a single workflow
* Explain how to complete that workflow
* Include prerequisites when necessary
* Explain the expected outcome
* Explain only the concepts needed to understand or complete the workflow

Task articles may:

* Include lightweight troubleshooting
* Include related workflow links when appropriate

Task articles must not:

* Explain broad product areas
* Serve as feature overviews
* Cover multiple unrelated workflows
* Act as navigation hubs

If the primary purpose is understanding rather than action, create a Concept article instead.

---

# 3. Editorial Principles

Good task articles help customers complete a task—not document every detail of the interface.

When writing:

* Start by answering the customer's question.
* Explain concepts before describing the UI.
* Focus on the decisions the customer needs to make.
* Prioritize the common workflow before edge cases.
* Combine obvious UI interactions into logical steps.
* Include only the details that help the customer succeed.
* Use screenshots only when they meaningfully improve understanding.

Avoid:

* describing every click
* documenting temporary interface states
* explaining obvious confirmation messages
* narrating page layout or visual design
* giving uncommon scenarios the same prominence as the primary workflow
* using screenshots that simply duplicate the written instructions

If a sentence doesn't help the customer understand or complete the task, remove it.

---

# 4. Metadata Requirements

Every task article must include:

```yaml
---
title: Clear task-based title using the feature name
description: Short summary of the workflow and outcome
keywords: [primary task phrase, feature name, related search terms]
internalScope: Audience is [target role]. Covers [workflow]. Does not cover [excluded workflows].
contentType: task
platform: [platform value]
---
```

Metadata should reflect realistic customer search behavior.

---

# 5. Heading Requirements

Task article headings must:

* Be task-based
* Be searchable
* Be explicit
* Describe what the reader will do or learn

Use headings that begin with:

* How
* What
* Where
* Who
* Why
* When

Examples:

* How to change your Workspace plan
* Where to find billing receipts
* Why you can't submit an expense report
* What happens after you approve an expense

Do not use:

* Overview
* Introduction
* Notes
* Setup
* Options
* Noun-only headings

---

# 6. Workflow Requirements

Procedural sections must:

* Use numbered steps
* Follow the actual UI flow
* Use exact UI labels
* Present actions in sequence

Instructions should:

* Focus on the decisions the customer needs to make.
* Combine obvious UI interactions into a single logical step.
* Include only the interface details required to complete the workflow.
* Briefly explain why a decision matters when it helps prevent mistakes.

Assume readers can follow straightforward navigation.

The goal is successful task completion, not exhaustive documentation.

---

# 7. Screenshot Guidelines

Suggest a screenshot only if it accomplishes one or more of the following:

* Helps members orient themselves within an interface by confirming they are on the correct page or screen
* Clarifies a complex or highly visual workflow
* Highlights an important setting, filter, configuration option, decision point, or UI element
* Demonstrates a feature or capability that is easier to understand visually
* Shows a confirmation state or error message that members should recognize
* Shows a critical step that cannot be adequately described through text alone, particularly when members must locate a specific page, setting, or control
* Addresses an area that is likely to generate member confusion or support questions
* Guides members through a workflow in a connected third-party platform, where a screenshot can help them locate the correct page, setting, or control. 

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

Task articles should:

* Target a specific customer question
* Include realistic customer search phrases
* Use exact feature names
* Include common troubleshooting language when relevant

Task articles should not:

* Cover multiple features
* Mix unrelated workflows
* Expand into broad conceptual documentation

The article should clearly answer:

> What action is the customer trying to complete?

The answer should be clear within the first two paragraphs.

---

# 9. Cross-Linking

Cross-links should be used only for:

* Required prerequisites
* Related troubleshooting
* Explicitly excluded workflows
* Natural next steps

Avoid excessive linking.

If many links are required, the scope is likely too broad.

Prefer a short **Related articles** section over embedding numerous inline links.

---

# 10. Validation Checklist

Before publishing, confirm:

* `contentType` is `task`
* One primary workflow is covered
* Headings are task-based
* UI terminology matches the product
* Navigation instructions are accurate
* Steps follow the actual workflow
* Metadata reflects search intent
* Cross-links are minimal and purposeful
* The introduction answers the customer's likely question
* The article explains concepts, not just interface elements
* The common workflow receives the most attention
* Every suggested screenshot has a clear purpose that prevents or resolves a specific member confusion
* Every section adds value
* Unnecessary details have been removed
* The article helps the reader complete a specific task
* The finished article reads like it was written by an experienced Expensify support agent
