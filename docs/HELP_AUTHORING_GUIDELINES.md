# Expensify HelpDot Authoring Spec 

## Purpose

This document defines mandatory structural, formatting, tone, terminology, and retrieval optimization rules for generating Expensify HelpDot articles.

All generated articles must comply.

---

# 1. Core Principles

Every article must:

- Solve one primary workflow only
- Match real user search intent
- Use exact UI terminology
- Follow strict heading rules
- Be optimized for semantic retrieval
- Be concise and actionable

If multiple workflows are detected → split into multiple articles.

---

# 2. Heading Rules (Strict)

## Forbidden

- Generic headings:
  - Overview
  - Introduction
  - Notes
  - Setup
  - Options
  - Step 1
- Noun-only or topic-only headings that describe a category rather than a task
- Platform-only labels used as headings (e.g., "iPhone", "Android", "Desktop", "Web")
- Any heading that does not describe an action the user takes or a question the user has

## Requirements

- All headings must be (except `# FAQ`, which is exempt from task-based rules):
  - Task-based — must describe what the user will do or learn. Start with an action verb or question word (How, What, Where, Who, Why, When)
  - Searchable
  - Explicit
  - Feature-specific

**Valid Examples**

# Who can connect a business bank account in Expensify
## Where to enable ACH reimbursements in a Workspace
## How to troubleshoot bank connection errors in Expensify
## How to enable Expensify Card notifications on iPhone

**Invalid → Corrected Examples**

- ❌ `## Transaction decline notifications` → ✅ `## How to understand why your Expensify Card transaction was declined`
- ❌ `## iPhone` → ✅ `## How to enable notifications on iPhone`
- ❌ `## Suspected fraud notifications` → ✅ `## What to do when you receive a fraud alert`
- ❌ `## Banking and settlement notifications` → ✅ `## How banking and settlement alerts work for admins`
- ❌ `## Card lifecycle notifications` → ✅ `## What card lifecycle notifications you'll receive`

---

# 3. Metadata Requirements (Mandatory)

Every article must begin with:

```yaml
---
title: Clear task-based title using feature name
description: 1–2 sentence summary of outcome
keywords: [primary task phrase, feature name, relevant roles]
internalScope: Audience is [target role(s), covers [included workflow], does not cover [explicit exclusions]
---
```

Metadata must reflect real search queries.

---

# 4. Required Structural Elements

Each article must include:
 - YAML metadata
 - Exactly one # heading (the article title). No other # headings are allowed except # FAQ
 - Task-based ## sections for all content below the title
 - Sequential numbered steps (if procedural)
 - An FAQ section (if needed)

Do not use multiple # headings to organize an article into major sections. If content feels like it needs its own # heading, either:
 - Demote it to ## under the single # title, or
 - Split it into a separate article (per Section 1: one workflow per article)

If including an FAQ section, it must comply with:
/docs/HELPSITE_NAMING_CONVENTIONS.md

---

# 5. Step Formatting Standard

Step instructions must be:
- Sequential
- Clear
- Action-oriented
- Aligned with actual UI flow

---

# 6. AI Retrieval Optimization Rules

Every article must:
 - Include at least one full "How to..." heading using feature name
 - Include realistic search phrases
 - Avoid vague wording
-  Avoid multi-feature coverage
 - Use UI-exact labels
 - Avoid internal language

Do not combine:
 - Setup + troubleshooting + workspace design
 - Admin + Member flows unless inseparable

---
 
# 7. Cross-Linking Standards

Cross-linking must reinforce the primary workflow, not expand scope or dilute retrieval precision.

Links should clarify dependencies or provide deeper context — not function as navigation hubs.

---

## When to Cross-Link

Only link in these cases:

- Prerequisite workflows required to complete the primary task
- Deep-dive explanations that expand on a concept mentioned briefly
- Explicitly excluded workflows listed in `internalScope`

Avoid linking to tangential, loosely related, or adjacent features.

If a workflow is important enough to link repeatedly, it likely requires its own dedicated article.

---

## Anchor Text Rules

Anchor text must describe the task or feature clearly.

Avoid vague anchors such as:
- Click here
- Read more
- This article

Use descriptive formats such as:

- Learn how to [complete task]
- Learn how to enable [Feature Name]
- Learn more about [Feature Name]

Anchor text should reflect real search phrasing.

---

## Link Formatting

- Use relative links only.
- Do not use full URLs.
- Do not place links inside numbered step instructions.
- Do not interrupt procedural flow with inline links.

Place links:
- After explanatory sentences
- In conditional dependency statements
- In explanatory paragraphs (not within step actions)

---

## Link Volume

Limit cross-links to preserve topical clarity.

Excessive linking:
- Dilutes the primary workflow
- Introduces unrelated entities
- Reduces retrieval precision

If multiple related workflows must be referenced, consider consolidating them into a dedicated supporting article instead of embedding many links.

---

## Related Articles Section (Optional)

A "Related articles" section may be used only when:

- Multiple prerequisite or deep-dive workflows are necessary
- Inline linking would clutter the main content

If used:

- Place it at the end of the article
- Use a `## Related articles` heading
- Limit to essential supporting workflows only

Do not use this section as a directory or feature hub.

---

# 8. Screenshot Guidelines

Only suggest screenshots when they meaningfully improve a member's understanding of the article. Screenshots are optional—not every article or workflow requires them.

## Screenshot Decision Criteria

Suggest a screenshot only if it accomplishes one or more of the following:

* Helps members orient themselves within the product (for example, confirming they are on the correct page)
* Clarifies a complex or highly visual workflow
* Highlights an important setting, filter, configuration option, or decision point
* Demonstrates a product capability that is easier to understand visually
* Shows a confirmation state or error message that members should recognize
* Addresses an area that is likely to generate member confusion or support questions

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

# 9. Pre-Publish Validation Checklist

Before outputting an article, confirm:
 - Exactly one # heading (the article title), plus optional # FAQ — no other # headings
 - Only ## used for all content sections (no ### or deeper)
 - Every ## heading starts with an action verb or question word (How, What, Where, Who, Why, When)
 - `# FAQ` is exempt from task-based heading rules
 - No noun-only, topic-only, or platform-only headings
 - No generic headings (Overview, Introduction, Notes, Setup, Options, Step 1)
 - Feature names match UI
 - Metadata aligns with search intent
 - Navigation included (if applicable)
 - Single workflow only
 - Includes at least one "How to" heading
 - Cross-links follow Cross-Linking Standards
 - Every suggested screenshot has a clear purpose that prevents or resolves a specific member confusion

If any condition fails → regenerate.
