# Expensify HelpDot Authoring Spec (Bot Reference Version)

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

## Allowed

- `#` (exactly one per article)
- `##` (unlimited)

## Forbidden

- `###` or deeper
- Generic headings:
  - Overview
  - Introduction
  - Notes
  - Setup
  - Options
  - Step 1
  - FAQs

## Requirements

- All headings must be:
  - Task-based
  - Searchable
  - Explicit
  - Feature-specific

### Valid Examples

# Connect a business bank account in Expensify
## Enable ACH reimbursements in a Workspace
## Troubleshoot bank connection errors in Expensify

---

# 3. Metadata Requirements (Mandatory)

Every article must begin with:

```yaml
title: Clear task-based title using feature name
description: 1–2 sentence summary of outcome
keywords:
  - primary task phrase
  - feature name
  - relevant roles
internalScope:
  audience: Target role(s)
  covers: Included workflow
  doesNotCover: Explicit exclusions

```

Metadata must reflect real search queries.

---

# 4. Required Structural Elements

Each article must include:
 - YAML metadata
 - One primary # heading
 - Task-based ## sections
 - Sequential numbered steps (if procedural)
 - # FAQ section (if needed)

FAQ rules:
 - Heading must be exactly: # FAQ
 - Questions must use ##
 - Answers must be plain text
 - FAQ is not collapsible

---

# 5. Formatting Rules

## Text
 - Plain text under headings
 -  No bold paragraphs
 - No decorative formatting
 - No emojis

## Lists
 - Numbered list → sequential steps
 - Bullets → unordered information

## If bullet is:
 - Full sentence → add period.
 - Phrase → no period

## Numbers
 - Nine and below → spelled out
 - 10 and above → numeric

---

# 6. Step Formatting Standard

Use:

To complete X:
1. Go to Y.
2. Select Z.
3. Click Save.

Sub-steps:
1. Complete the form.
  - Enter routing number
  - Enter account number
2. Click Confirm.

---

# 7. AI Retrieval Optimization Rules

Every article must:
 - Include at least one full "How to.." heading using feature name
 - Include realistic search phrases
 - Avoid vague wording
 - Avoid multi-feature coverage
 - Use Ul-exact labels
 - Avoid internal language

Do not combine:
 - Setup + troubleshooting + policy design
 - Admin + Member flows unless inseparable

---

# 8. Screenshot Placeholder Format (Non-Rendered)

Screenshot suggestions must use HTML comments so they are invisible in the rendered HelpDot article.

Use this exact structure:

‹!-- SCREENSHOT: Suggestion: [Clear description of Ul state] Location: [Where it appears in article]
Purpose: [Why this screenshot helps] -->

Rules:
 - Must begin with <! - SCREENSHOT:
 - Must end with -->
 - Must not appear inline in a sentence
 - Place immediately after the section or step it supports
 - Keep description specific and Ul-based

Prioritize screenshots for:
 - Navigation flows
 - Settings pages
 - Filters
 - Confirmation states
 - Error messages

---

# 9. Pre-Publish Validation Checklist

Before outputting an article, confirm:
 - Only # and ## used
 - No generic headings
 - Feature names match Ul
 - Metadata aligns with search intent
 - Navigation included (if applicable)
 - Single workflow only
 - Includes at least one "How to" heading
 - Number formatting correct
 - Terminology compliant

If any condition fails → regenerate.
