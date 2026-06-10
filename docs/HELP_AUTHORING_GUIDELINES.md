# Expensify HelpDot Task Article Guidelines

## Purpose

Task articles explain how to complete a specific workflow in Expensify.

Task articles answer questions such as:

* How do I submit an expense?
* How do I change my Workspace plan?
* How do I connect NetSuite?
* Why can't I complete a specific action?

The goal of a task article is task completion.

---

# 1. Core Principles

Every task article must:

* Solve one primary workflow only
* Match a specific user goal
* Use exact UI terminology
* Follow the official naming conventions
* Be optimized for semantic retrieval
* Be concise and actionable

If multiple workflows are required, create multiple articles.

---

# 2. Scope Rules

Task articles must:

* Focus on a single workflow
* Explain how to complete that workflow
* Include prerequisites when necessary
* Explain the expected outcome

Task articles may:

* Include lightweight troubleshooting
* Include related workflow links when required

Task articles must not:

* Explain broad product areas
* Serve as feature overviews
* Cover multiple unrelated workflows
* Act as navigation hubs
* Contain extensive conceptual background

If the primary purpose is understanding rather than action, create a Concept article instead.

---

# 3. Metadata Requirements

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

# 4. Heading Requirements

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

# 5. Workflow Requirements

Procedural sections must:

* Use numbered steps
* Follow the actual UI flow
* Use exact UI labels
* Present actions in sequence

Instructions should be:

* Specific
* Action-oriented
* Easy to follow

---

# 6. Retrieval Optimization

Task articles should:

* Target a specific user question
* Include realistic customer search phrases
* Use exact feature names
* Include common troubleshooting language when relevant

Task articles should not:

* Cover multiple features
* Mix unrelated workflows
* Include excessive conceptual explanation

The article should clearly answer:

"What action is the user trying to complete?"

---

# 7. Cross-Linking

Cross-links should be used only for:

* Required prerequisites
* Related troubleshooting
* Explicitly excluded workflows

Avoid excessive linking.

If many links are required, the scope is likely too broad.

---

# 8. Validation Checklist

Before publishing, confirm:

* contentType is task
* One primary workflow is covered
* Headings are task-based
* UI terminology matches the product
* Navigation instructions are accurate
* Steps follow the actual workflow
* Metadata reflects search intent
* Cross-links are minimal and purposeful
* The article helps the reader complete a specific task

