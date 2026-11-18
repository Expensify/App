---
title: Sync Workspace Coding to Expensify Travel
description: Learn how workspace admins can sync categories, tags, and report fields to Expensify Travel so travelers code their trips when they book.
keywords: [Expensify Travel, Sync coding to Expensify Travel, booking questions, code travel expenses, categories at booking, tags at booking, report fields at booking, travel expense coding, workspace admin]
internalScope: Audience is workspace admins. Covers enabling Sync coding to Expensify Travel, which workspace coding becomes booking questions, and how the answers apply to travel expenses. Does not cover enabling Expensify Travel, travel policy rules, or creating categories, tags, or report fields.
retrievalIntent: How do I make travelers choose a category, tag, or report field when they book travel
contentType: task
platform: new
---

# Sync Workspace Coding to Expensify Travel

When you enable **Sync coding to Expensify Travel**, travelers answer your workspace's category, tag, and report field questions when they book a trip. Expensify adds the answers to the travel expense, so the expense arrives already coded.

## Who can sync coding to Expensify Travel

Only workspace admins can enable **Sync coding to Expensify Travel**. Expensify Travel must be set up on the workspace first. Learn how to [enable Expensify Travel on a workspace](/articles/travel/company-setup/Enable-Travel-on-a-Workspace).

## How to sync coding to Expensify Travel

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Travel**.
2. Enable **Sync coding to Expensify Travel**.

Expensify sends your coding to Expensify Travel within a few minutes. When you change your categories, tags, or report fields later, Expensify sends the changes automatically.

## What travelers see when they book a trip

At checkout, Expensify Travel asks these questions:

- **Category**: Lists the workspace's enabled categories. The question is required if the workspace requires a category.
- **Tags**: One question for each tag level, with its enabled tags. The question is required if the workspace requires that tag.
- **Report fields**: One question for each list or text report field. These questions are always required.
- **Expense description**: A text field the traveler can fill in or skip.

## What happens after a traveler books a trip

Expensify adds the category, tags, and description to the travel expense. Report field answers go on the expense report. If the expense report already has a value for a report field, Expensify keeps that value.

## What workspace coding doesn't sync to Expensify Travel

- **Dependent tags**: If the options of one tag level depend on another level, no tag questions sync.
- **Date and formula report fields**: These report fields don't sync. The report title doesn't sync either.
- **Disabled options**: Disabled categories, tags, and report field values don't appear.
- **Disabled features**: If categories, tags, or report fields are disabled on the workspace, their questions don't sync.

# FAQ

## Why don't travelers see the booking questions?

Travelers see the booking questions for their default workspace. If a traveler's default workspace is a different workspace, they don't see this workspace's questions. To change the default workspace, in the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**, select **More (⋮)** next to the workspace, then select **Set as default workspace**.

Changes to your coding can take a few minutes to reach Expensify Travel.

## What happens if I disable Sync coding to Expensify Travel?

Expensify removes the booking questions from Expensify Travel. Travel expenses that are already coded keep their values.
