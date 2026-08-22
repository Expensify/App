---
title: Accessibility at Expensify
description: Learn about Expensify's accessibility commitment, the standards we follow, how to report accessibility issues, and how we track progress publicly.
keywords: accessibility, a11y, WCAG, WCAG 2.2, VPAT, ACR, accessibility conformance report, Section 508, EN 301 549, screen reader, JAWS, NVDA, VoiceOver, TalkBack, keyboard navigation, assistive technology
internalScope: Audience is anyone evaluating or using Expensify with assistive technology, plus procurement and compliance teams. Covers Expensify's accessibility commitment, conformance standards, how to get the VPAT/ACR, how to report accessibility issues, and remediation targets. Does not cover how to use specific assistive technologies with Expensify.
---

# Accessibility at Expensify

Expensify's mission is to make expense management effortless for everyone, and *everyone* includes people who rely on screen readers, keyboard navigation, magnification, and other assistive technologies. We're committed to building a product that anyone can use to track expenses, chat, and manage money, regardless of ability.

## What accessibility standards Expensify follows

We design and evaluate Expensify against the following accessibility standards:

- **Web Content Accessibility Guidelines (WCAG) 2.2, Levels A and AA**
- **Revised Section 508** of the U.S. Rehabilitation Act
- **EN 301 549**, the European accessibility standard for ICT products and services

## How to get Expensify's Accessibility Conformance Report (VPAT/ACR)

An Accessibility Conformance Report (ACR), based on the Voluntary Product Accessibility Template (VPAT), documents how Expensify conforms to the standards above, criterion by criterion.

Our report was produced from an evaluation of Expensify using:

- Screen readers: JAWS, NVDA, VoiceOver, and TalkBack
- Keyboard-only navigation
- Browser zoom and text spacing checks
- Colour contrast analysis
- Automated tooling
- Chrome, Firefox, and Safari on desktop

To download the latest report, go to the [Expensify Trust Center resources page](https://trust.expensify.com/resources).

## How to report an accessibility issue

Expensify's app is open source, and accessibility issues are tracked publicly on [GitHub](https://github.com/Expensify/App/issues). If you hit an accessibility barrier in Expensify, [create a new issue using the Accessibility issue template](https://github.com/Expensify/App/issues/new?template=Accessibility.md).

When filling in the template, include:

- The steps you took and what happened versus what you expected
- The WCAG checkpoint that failed, if you know it
- The platform (web, iOS, Android) and the assistive technology you were using

## How quickly Expensify fixes accessibility issues

We hold ourselves to clear remediation targets for confirmed accessibility issues:

- **Critical issues**: fixed within **60 days**
- **High-severity issues**: fixed within **120 days**

## Where to track accessibility issues and progress

Every accessibility issue is labeled `Accessibility` and tracked in the open, so you can follow the [public accessibility backlog](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3AAccessibility) at any time.

# FAQ

## How do I get Expensify's VPAT or Accessibility Conformance Report?

Download it from the [Expensify Trust Center resources page](https://trust.expensify.com/resources). You may be asked to submit a short access request form.

## How do I report an accessibility issue without a GitHub account?

Email [compliance@expensify.com](mailto:compliance@expensify.com) with the details, and we'll file the issue for you.

## Who do I contact about accessibility compliance documentation?

For compliance questions about the report, contact [compliance@expensify.com](mailto:compliance@expensify.com). For SOC reports and other compliance documents, see the [Expensify Trust Center](https://trust.expensify.com/).
