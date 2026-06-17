---
title: How to write agent rules
description: Learn how to write effective agent rules using natural-language instructions and examples.
keywords: [agent rules, RuleBot, prompt writing, ai rules, agent rule examples, agent rule best practices]
internalScope: Audience is Workspace Admins. Covers best practices for writing agent rules and examples of effective instructions. Does not cover creating agent rules or managing Custom Agents.
---

# How to write agent rules

Agent rules are written in natural language. Describe the behavior you want, and RuleBot evaluates reports against those instructions. Well-written agent rules help RuleBot make more consistent decisions and reduce unexpected behavior.

If you're unsure how to write a rule, you can chat with RuleBot and describe the outcome you want. RuleBot can ask clarifying questions, help draft a rule, and explain how an existing rule would behave in a specific situation.

---

## Who can write agent rules

Any Workspace Admin on a workspace with an agent rule configured can edit the rules. 

If you haven't created an agent rule yet, [learn how to create agent rules](/articles/new-expensify/ai-agents/Create-Agent-Rules).

---

## How to write clear agent rules

The best agent rules describe a specific outcome using clear, action-oriented language.

When writing agent rules:

 - Be specific and clear. Describe exactly what RuleBot should do and avoid vague instructions.
 - Provide context when necessary. Include relevant details about your workflow, approval process, or company policies.
 - Define the scope. Explain what RuleBot should handle and what it should ignore.
 - Use examples when possible. Example scenarios can help RuleBot understand your intent.
 - Start simple. Begin with a straightforward rule and refine it over time.
 - Keep rules focused. Create separate rules for separate concerns rather than combining many behaviors into one rule.
 - Use action-oriented language. Tell RuleBot what action to take when conditions are met.

---

## How to write agent rules for approvals 

Approval rules work best when they define clear approval criteria. 

Example:

> Approve reports under $100 that contain no violations. Forward all other reports to Alice for review.

More specific approval rules generally produce more predictable results than broad instructions such as:

> Approve reports that seem reasonable.

## How to write agent rules for routing

Routing rules can be used to send reports to different approvers based on report details.

Example:

> Forward reports over $500 to Alice and all other reports to Bob.

## How to write agent rules that request information

Agent rules can ask submitters for additional information when specific conditions are met.

Example:

> Ask the submitter to justify any meal expense over $75.

## How to write agent rules that modify expenses

Agent rules can automatically update expenses when conditions are met.

Example: 

> Add a 2% FX surcharge to all non-USD reimbursable expenses.

When writing rules that modify expenses, be explicit about which expenses should be updated and how they should be changed.

---

## How to use RuleBot to draft agent rules

If you're not sure how to write an agent rule, you can chat with RuleBot and describe the outcome you want.

For example:

> I want to set a rule to ask for more information on expenses that took place over the weekend. Can you help?

RuleBot may ask follow-up questions to clarify your requirements and then suggest a rule based on your answers.

You can also ask RuleBot questions about existing agent rules to better understand how they work.

To chat with RuleBot:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Your Workspace]**.
2. Click **Members**.
3. Select **RuleBot** from the list of workspace members.
4. Click **Profile**.
5. Click **Message**.

---

## What to do when an agent rule doesn't behave as expected

 - Rewrite the rule using more specific language.
 - Break large rules into multiple focused rules.
 - Add examples that demonstrate the intended behavior.
 - Remove unnecessary instructions that may create ambiguity.
 - Add examples that demonstrate the intended behavior.
 - Remove unnecessary instructions that may create ambiguity.

Small changes often produce more reliable results than completely rewriting a rule.

---

# FAQ

## Should I create one large rule or multiple smaller rules?

Multiple focused rules are generally easier to understand, maintain, and troubleshoot than a single rule that handles many different scenarios.

## How specific should agent rules be?

As a general rule, the more specific the instruction, the more predictable the result.

## Can agent rules make mistakes?

Yes. Agent rules are evaluated by an LLM and may occasionally behave unexpectedly. Review AI-generated actions and instructions carefully.
