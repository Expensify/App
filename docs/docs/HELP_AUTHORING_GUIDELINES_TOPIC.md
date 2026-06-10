# Expensify HelpDot Topic Article Guidelines

## Purpose

Topic articles introduce a broad area of Expensify and help readers understand the major concepts within that area.

Topic articles answer questions such as:

* How does billing work in Expensify?
* What payment options are available?
* How do reimbursements fit into Expensify?
* What does this section of Expensify cover?

The goal of a Topic article is orientation and navigation.

Topic articles sit at the top of the content hierarchy:

```text
Topic Article
    ↓
Concept Article
    ↓
Task Article
```

---

# 1. Core Principles

Every Topic article must:

* Introduce a single product area
* Explain the major concepts within that area
* Help readers identify the correct next article
* Use exact product terminology
* Be optimized for semantic retrieval
* Remain concise and easy to navigate

A Topic article should help readers understand where they are before deciding where to go next.

---

# 2. Scope Rules

Topic articles must:

* Cover a broad functional area
* Introduce multiple related concepts
* Explain how those concepts relate to one another
* Link to deeper Concept and Task articles

Topic articles may:

* Compare major options at a high level
* Explain how different concepts fit together
* Summarize related workflows

Topic articles must not:

* Include step-by-step instructions
* Include UI navigation guidance
* Include detailed configuration instructions
* Become the authoritative source for a specific concept
* Replace Concept articles

If a section requires substantial detail, create a dedicated Concept article instead.

---

# 3. Metadata Requirements

Every Topic article must include:

```yaml
---
title: Clear topic title using the product area name
description: High-level summary of the topic area
keywords: [topic area, major concepts, common customer terminology]
internalScope: Audience is [target audience]. Covers [topic area] and introduces [major concepts]. Does not cover detailed workflows, setup instructions, or deep dives into individual concepts.
contentType: topic
platform: [platform value]
---
```

Metadata should reflect broad customer search intent.

---

# 4. Heading Requirements

Topic article headings should:

* Orient the reader
* Introduce major concepts
* Answer broad customer questions
* Use common customer terminology

Examples:

* How billing works in Expensify
* What concepts are included in billing and subscriptions
* How payment methods differ
* Which reimbursement option is right for your team

Avoid:

* Step-by-step headings
* UI navigation headings
* Excessively generic headings
* Deep-dive conceptual explanations

---

# 5. Content Requirements

Topic articles should move from broad understanding to deeper exploration.

Recommended structure:

1. Introduce the topic area
2. Explain how the area works at a high level
3. Introduce major concepts
4. Compare options where relevant
5. Answer common high-level questions
6. Link to Concept and Task articles

Each concept summary should:

* Define the concept
* Explain when customers encounter it
* Explain why it matters
* Link to a dedicated article for deeper information

Concept summaries should be informative but not exhaustive.

---

# 6. Retrieval Optimization

Topic articles should be optimized for broad discovery.

Include:

* Common customer terminology
* Synonyms customers may search for
* High-level explanations
* Relationships between concepts

Topic articles should answer questions such as:

* What does this area of Expensify do?
* What options are available?
* Which concept applies to my situation?
* Where should I learn more?

Each major concept should contain enough information to be useful if retrieved independently.

---

# 7. Cross-Linking

Cross-linking is expected and encouraged.

Topic articles should link to:

* Relevant Concept articles
* Common Task articles

Links should help readers move deeper into the content hierarchy.

Unlike Task articles, Topic articles may contain multiple related links because navigation is one of their primary purposes.

---

# 8. Validation Checklist

Before publishing, confirm:

* contentType is topic
* The article covers a single product area
* Multiple related concepts are introduced
* No procedural instructions are included
* No UI navigation guidance is included
* Concept summaries explain what, when, and why
* Links guide readers toward deeper articles
* Metadata reflects broad search intent
* The article helps readers understand where to go next
