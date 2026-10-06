---
title: How to Write Agent Instructions
description: Learn how to write clear, effective natural-language instructions for both personal Agents and workspace Agent rules.
keywords: [agent instructions, AI prompts, Agent rules, custom agents, prompt writing, RuleBot, AI instruction examples, agent rule examples, agent rule best practices]
internalScope: Audience is members and Workspace Admins. Covers best practices, examples, and techniques for writing effective instructions for personal Agents and Agent rules, including using RuleBot to draft Agent rules. Does not cover creating Agents, creating Agent rules, or managing AI features.
retrievalIntent: How do I write effective instructions for an AI Agent?
contentType: topic
---

# How to Write Agent Instructions

Agents use natural-language instructions to determine how they should behave. Well-written instructions help Agents make more consistent decisions and reduce unexpected behavior.

For personal Agents, instructions describe how the Agent should help manage your work. For Agent rules, instructions tell RuleBot how to handle expenses and reports in a workspace.

To learn about how agents use instructions, see [How do Agents and Agent rules use instructions](/articles/new-expensify/ai-agents/Learn-About-Agents#how-do-agents-and-agent-rules-use-instructions).

---

## Who can write Agent instructions

Members can write and edit instructions for the personal Agents they create.

Any Workspace Admin on a workspace with an Agent rule configured can write and edit the workspace's Agent rules.

To learn how to create a personal Agent, see [Create and Use Agents](/articles/new-expensify/ai-agents/Create-and-Use-Agents).

To learn how to create Agent rules, see [Automate Workflows with Agent Rules](/articles/new-expensify/ai-agents/Automate-Workflows-with-Agent-Rules).

---

## How to write clear agent instructions

The best Agent instructions describe a specific outcome using clear, action-oriented language.

When writing Agent instructions:

 - Be specific and clear. Describe exactly what the agent should do and avoid vague instructions.
 - Provide context when necessary. Include relevant details about your workflow, approval process, or company policies.
 - Define the scope. Explain what the agent should handle and what it should ignore.
 - Use examples when possible. Example scenarios can help the agent understand your intent.
 - Start simple. Begin with straightforward instructions and refine them over time.
 - Keep instructions focused. Create separate instructions for separate concerns rather than combining many behaviors.
 - Use action-oriented language. Tell the agent what action to take when conditions are met.

---

## How to write Agent instructions for approvals

Approval instructions work best when they define clear approval criteria. 

Example:

> Approve reports under $100 that contain no violations. Forward all other reports to Alice for review.

More specific approval instructions generally produce more predictable results than broad instructions such as:

> Approve reports that seem reasonable.

---

## How to write Agent instructions for approval routing

Approval routing instructions can send reports to different approvers based on report details.

Example:

> Forward reports over $500 to Alice and all other reports to Bob.

---

## How to write Agent instructions that request information

Agent instructions can ask for additional information when specific conditions are met.

Example:

> Ask the submitter to justify any meal expense over $75.

---

## How to write Agent instructions that modify expenses

Agent instructions can automatically update expenses when specific conditions are met.

Example: 

> Add a 2% FX surcharge to all non-USD reimbursable expenses.

When writing instructions that modify expenses, be explicit about which expenses should be updated and how they should be changed.

---

## How to use RuleBot to draft Agent rules

If you're not sure how to write an Agent rule, you can chat with RuleBot and describe the outcome you want.

For example:

> I want to set a rule to ask for more information on expenses that took place over the weekend. Can you help?

RuleBot may ask follow-up questions to clarify your requirements and then suggest a rule based on your answers.

You can also ask RuleBot questions about existing Agent rules to better understand how they work.

To chat with RuleBot:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [Your Workspace]**.
2. Click **Members**.
3. Select **RuleBot** from the list of workspace members.
4. Click **Profile**.
5. Click **Message**.

---

## What to do when an Agent doesn't behave as expected

 - Rewrite the instructions using more specific language.
 - Break large instructions into multiple focused instructions.
 - Add examples that demonstrate the intended behavior.
 - Remove unnecessary instructions that may create ambiguity.

Small changes often produce more reliable results than completely rewriting the instructions.

---

# FAQ

## Should I write one large instruction or multiple smaller instructions?

Multiple focused instructions are generally easier to understand, maintain, and troubleshoot than one set of instructions that handles many unrelated scenarios.

## Are there pre-written agent instructions I can use?

Yes. [Agent templates](/articles/new-expensify/ai-agents/Use-Agent-Templates) are prebuilt personal Agents with pre-written instructions for common tasks. [Suggested Agent rules](/articles/new-expensify/ai-agents/Use-Suggested-Agent-Rules) are pre-written workspace Agent rules that you can use as a starting point for common workflows. You can review and customize the instructions before saving.

## How specific should Agent instructions be?

As a general rule, the more specific the instructions are, the more predictable the result.

## Can Agents make mistakes?

Yes. Agents use AI to interpret natural-language instructions and may occasionally behave unexpectedly. Review AI-generated actions and instructions carefully.

---

## Related articles

When writing Agent instructions, these references help you match your instructions to what your Agent can actually do:

 - [Agent Capability Reference](/articles/new-expensify/ai-agents/AI-Agent-Capabilities) — every action your Agent can take, with ready-to-copy instruction phrases.
 - [Agent Trigger Reference](/articles/new-expensify/ai-agents/AI-Agent-Triggers) — every event your Agent can react to, with ready-to-copy instruction phrases.
