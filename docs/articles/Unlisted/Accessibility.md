---
title: Accessibility at Expensify
description: Learn about Expensify's accessibility commitment, the standards we follow, how to report accessibility issues, and how we track progress publicly.
keywords: accessibility, a11y, WCAG, WCAG 2.2, VPAT, ACR, accessibility conformance report, Section 508, EN 301 549, screen reader, JAWS, NVDA, VoiceOver, keyboard navigation, assistive technology
internalScope: Audience is anyone evaluating or using Expensify with assistive technology, plus procurement and compliance teams. Covers Expensify's accessibility commitment, conformance standards, how to get the VPAT/ACR, how to report accessibility issues, and remediation targets. Does not cover how to use specific assistive technologies with Expensify.
---

Expensify's mission is to make expense management effortless for everyone — and *everyone* includes people who rely on screen readers, keyboard navigation, magnification, and other assistive technologies. We're committed to building a product that anyone can use to track expenses, chat, and manage money, regardless of ability.

---

# Standards we follow

We design and evaluate Expensify against the following accessibility standards:

- **Web Content Accessibility Guidelines (WCAG) 2.2, Levels A and AA** — our target standard, including the criteria carried over from WCAG 2.0 and 2.1
- **Revised Section 508** of the U.S. Rehabilitation Act
- **EN 301 549** — the European accessibility standard for ICT products and services

---

# Our Accessibility Conformance Report (VPAT/ACR)

An Accessibility Conformance Report (ACR), based on the Voluntary Product Accessibility Template (VPAT), documents how Expensify conforms to the standards above, criterion by criterion.

Our report was produced from an evaluation of Expensify's core flows — including sign-in, chat, expense creation, reports, workspaces, travel, and wallet — using:

- Screen readers: JAWS, NVDA, and VoiceOver
- Keyboard-only navigation
- Browser zoom and text spacing checks
- Colour contrast analysis
- Automated tooling, including axe DevTools
- Chrome, Firefox, and Safari on desktop

To download the latest report, go to the Expensify Trust Center resources page at [https://trust.expensify.com/resources](https://trust.expensify.com/resources).

---

# How to report an accessibility issue

Expensify's app is open source, and accessibility issues are tracked publicly on GitHub.

If you hit an accessibility barrier in Expensify:

1. Go to [https://github.com/Expensify/App/issues](https://github.com/Expensify/App/issues)
2. Click **New issue**
3. Choose the **Accessibility issue template**, or use this direct link: [Create an accessibility issue](https://github.com/Expensify/App/issues/new?template=Accessibility.md)
4. Fill in the template, including:
   - The steps you took and what happened versus what you expected
   - The WCAG checkpoint that failed, if you know it
   - The platform (web, iOS, Android) and the assistive technology you were using

---

# Holding ourselves accountable

We hold ourselves to clear remediation targets for confirmed accessibility issues:

- **Critical issues** — fixed within **60 days**
- **High-severity issues** — fixed within **120 days**

---

# Being transparent

Every accessibility issue is labeled `Accessibility` and tracked in the open, so you can follow our backlog and progress at any time:

[View the public accessibility backlog](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3AAccessibility)

---

# FAQ

## How do I get Expensify's VPAT or Accessibility Conformance Report?

Download it from the Expensify Trust Center resources page at [https://trust.expensify.com/resources](https://trust.expensify.com/resources). You may be asked to submit a short access request form.

## How do I report an accessibility issue without a GitHub account?

Message Concierge from the app or email [concierge@expensify.com](mailto:concierge@expensify.com) with the details, and we'll file the issue for you.

## Who do I contact about accessibility compliance documentation?

For compliance questions about the report, contact [compliance@expensify.com](mailto:compliance@expensify.com). For SOC reports and other compliance documents, see the Trust Center at [https://trust.expensify.com/](https://trust.expensify.com/).
