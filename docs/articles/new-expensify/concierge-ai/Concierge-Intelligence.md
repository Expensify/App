---
title: Concierge Intelligence
description: Learn how Concierge uses context, AI, and automation to understand what you need and get it done fast.
keywords: Concierge Intelligence, how Concierge works, AI context, multi-modal agent, contextual chatbot, Expensify support AI, Concierge automation
order: 2
---
<div id="new-expensify" markdown="1">

Concierge isn’t just smart—it’s context-aware, multi-skilled, and built to help you get more done with less effort. This guide explains how Concierge works, what makes it intelligent, and how to get the most out of it.

# How Concierge Intelligence works

Concierge is a **hybrid AI agent** built with generative AI, automation tools, and a powerful rules engine. It figures out what you're trying to do, pulls in the right tools, and responds with answers—or takes action automatically.

If Concierge doesn’t know something, it escalates to a real person.

# What makes Concierge intelligent

Concierge uses a few smart capabilities to figure out how to help:

- **Context-aware** – Understands *where* you’re asking from to tailor the response.
- **Multi-modal** – Acts like multiple assistants (support agent, expense assistant, etc.) in one.
- **Hybrid support** – Combines AI and humans, switching seamlessly when needed.
- **Natural language understanding** – Responds to conversational input like a coworker would.

# Understanding Concierge's contextual behavior

Concierge adapts based on where and how you ask questions:

- If you chat inside a **report** → It answers about that report.  
- If you're in a **DM** → It considers your full expense history.  
- If you're in a **Workspace chat** → It focuses on that Workspace.  
- If you're on a specific **expense** → It assumes you're referring to that expense.

You don’t need to explain every detail—just speak naturally and Concierge will fill in the blanks.

# What is a multi-modal agent?

Instead of having different bots for different tasks, Concierge is all-in-one. That means:

- You can ask anything—no need to figure out who to ask.  
- You can combine requests in one message.  
  - Example: “Is this reimbursable? Can you add a $12 taxi expense too?”

# Can I ask multiple things at once?

Yes! Concierge can understand complex or multi-part requests, as long as it’s clear what you want.

Here’s what works well:
- “Create a $5 lunch expense and add it to my April report.”  
- “What does ‘non-reimbursable’ mean, and can you mark this expense as such?”

The more specific you are, the better Concierge can help.

# What if Concierge doesn’t know something?

If Concierge can’t answer a question, it will escalate to a real person—often without you needing to ask.

You can also type **“Talk to a human”** at any time to request an escalation.

# How Concierge is built

Concierge is powered by a mix of technology and human backup:

- A custom-trained GenAI model  
- A rules engine that handles logic and automation  
- Real-time access to your Expensify data (just enough to help)  
- Escalation paths to live support when needed

# How does Concierge protect my data?

Concierge is built with privacy at its core:
- Your data stays inside Expensify and is only accessed as needed.  
- AI systems never see more than what's required to respond to your message.  
- We have **zero-retention** agreements with AI providers, meaning your data is never stored or reused.

There’s no risk of another customer seeing your data—because they can’t.

# Why Concierge is different

- Understands where you’re chatting from and adjusts accordingly  
- Handles natural, multi-part questions with ease  
- Manages support, expenses, and reporting in one place  
- Escalates to a human when needed  
- No setup or training required—it just works  

# FAQ

## How does Concierge determine what I’m referring to?

Concierge uses the context of your message—like the chat location (report, Workspace, expense), prior messages, and the specific wording of your request. It pairs this with internal identifiers (like report IDs or expense metadata) to match your request to the right object, without you needing to specify it directly.

## How is context "understood" technically?

Context is inferred using a combination of:
- Chat metadata (where you're messaging from)
- Your role and permissions
- Previous conversation turns
- Structured data (like expense amounts, merchant names, and report statuses)

Concierge uses this context to understand your request and provide a relevant response.

## What’s the difference between the AI and the rules engine?

- The **AI (LLM)** interprets what you’re asking and generates a human-like response.
- The **rules engine** executes structured logic behind the scenes—for example, determining which reports are ready to submit, or applying Workspace rules to an expense.
- The two work together: AI figures out intent; the rules engine ensures valid outcomes.

## What does "multi-modal" mean in this context?

In Expensify, "multi-modal" means Concierge can handle multiple functions—support, expense management, and approvals—in a single thread. You don’t need to choose a specific agent or mode. Concierge identifies your intent based on the language used and responds accordingly, even if you blend requests.

## How does Concierge know when to escalate to a human?

If the model is unsure, detects missing context, or encounters something outside its capabilities (e.g., Workspace reconfiguration), it uses fallback logic to escalate. You can also manually escalate by saying “Talk to a human.”

## Is Concierge really reading my data?

Not exactly. The AI model doesn’t browse your data freely. It only receives the specific structured data relevant to your request—for example, the report name, amount, or receipt image you reference. This is passed securely via the system prompt, and the model can’t access or recall any other customer’s data.

## Is my data ever stored or used to train Concierge?

No. Concierge runs on AI models with **zero-retention agreements**. That means your data is not logged, stored, or used to train future versions of the model—by Expensify or by any third party.

## Can Concierge give different answers in different places?

Yes—and that’s by design. Because it’s context-aware, asking “Is this reimbursable?” in a report chat will return a different result than asking it in a DM. This makes responses faster and more relevant.

## Can I test how Concierge behaves in different modes?

Absolutely. Try sending the same question in different contexts (a report, a Workspace chat, a DM) and you’ll see how Concierge tailors its response to match.

</div>
