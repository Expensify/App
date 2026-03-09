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

## Requirements

- All headings must be:
  - Task-based
  - Searchable
  - Explicit
  - Feature-specific

**Valid Examples**

# Who can connect a business bank account in Expensify
## Where to enable ACH reimbursements in a Workspace
## How to troubleshoot bank connection errors in Expensify

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
 - One primary # heading
 - Task-based ## sections
 - Sequential numbered steps (if procedural)
 - An FAQ section (if needed)

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

# 7. Screenshot Placeholder Format (Non-Rendered)

Screenshot suggestions must use HTML comments so they are invisible in the rendered HelpDot article.

Use this exact structure:

<!-- SCREENSHOT:
Suggestion: [Clear description of UI state]
Location: [Where it appears in article]
Purpose: [Why this screenshot helps]
-->

Rules:
 - Must begin with <!-- SCREENSHOT:
 - Must end with -->
 - Must not appear inline in a sentence
 - Place immediately after the section or step it supports
 - Keep description specific and UI-based

Prioritize screenshots for:
 - Navigation flows
 - Settings pages
 - Filters
 - Confirmation states
 - Error messages

---

# 8. Pre-Publish Validation Checklist

Before outputting an article, confirm:
 - Only # and ## used
 - No generic headings
 - Feature names match UI
 - Metadata aligns with search intent
 - Navigation included (if applicable)
 - Single workflow only
 - Includes at least one "How to" heading

If any condition fails → regenerate.
