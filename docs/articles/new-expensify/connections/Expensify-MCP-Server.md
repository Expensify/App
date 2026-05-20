---
title: Expensify MCP Server
description: Connect your AI assistant (Claude, Cursor, ChatGPT, and more) to your live Expensify data using the Model Context Protocol.
keywords: [New Expensify, MCP, Model Context Protocol, Claude, Cursor, ChatGPT, AI, integration, OAuth, expenses, search]
---

The Expensify MCP server lets your AI assistant read your live Expensify data — expenses, reports, receipts, trips, chats, and tasks — without you having to copy and paste anything. Once connected, you can ask your AI questions like "what did I spend on travel last month?" and it will search Expensify and answer from your real data.

**Note:** The Expensify MCP server is actively being developed. Right now it is read-only — your AI can search and retrieve your data but cannot create, edit, or delete anything. More capabilities will be added over time.

Connection is handled through a standard OAuth login. You authorize Expensify once, and your AI client takes care of the rest.

---

# What you can do

Once connected, your AI assistant can:

- Search your expenses, reports, receipts, trips, and tasks
- Look up spending by category, date range, merchant, or amount
- Find submitted and reimbursed reports
- Answer questions about your workspace spending

---

# What the connection can access

When you authorize the connection, you grant the `mcp:tools` scope. This gives the AI read access to the same data you can see when you're logged in to Expensify — your own expenses, plus any workspace data your role allows you to see (approver, admin, auditor).

The connection does not share your Expensify password or session credentials with the AI client. Access is controlled by an OAuth token that you can revoke at any time.

---

# Set up on Claude Desktop

**Requirements:** Claude Desktop version that supports remote MCP servers. Download from [claude.ai/download](https://claude.ai/download).

1. Open Claude Desktop.
2. Go to **Settings** (⌘, on Mac, or File → Settings on Windows).
3. Select the **Developer** tab.
4. Click **Edit Config** to open the configuration file in a text editor.
5. Add the Expensify server to the `mcpServers` object:

   ```json
   {
     "mcpServers": {
       "expensify": {
         "url": "https://www.expensify.com/mcp/"
       }
     }
   }
   ```

6. Save the file and restart Claude Desktop.
7. The first time you ask a question that requires Expensify data, Claude will open your browser to complete the sign-in and authorization. Sign in with your Expensify account and click **Approve**.

After that, Claude Desktop will automatically use your Expensify data when it's relevant to your question.

---

# Set up on Cursor

**Requirements:** Cursor 0.46 or later.

1. Open Cursor.
2. Go to **Cursor Settings** (⌘, on Mac, or File → Preferences → Cursor Settings on Windows).
3. Navigate to **Tools & MCPs****.
4. Click **New MCP server**.
5. Add the Expensify server to the `mcpServers` object:

   ```json
   {
     "mcpServers": {
       "expensify": {
         "url": "https://www.expensify.com/mcp/"
       }
     }
   }
   ```

6. Click **Save**.
7. The first time Cursor uses an Expensify tool, your browser will open to complete sign-in and authorization. Sign in with your Expensify account and click **Approve**.

After that, Cursor will automatically search your Expensify data when it's relevant to your requests.

---

# Set up on Claude.ai (web)

**Requirements:** Pro, Max, Team, or Enterprise plan.

### Pro or Max plan

1. Log in to [claude.ai](https://claude.ai).
2. Go to **Customize** → **Connectors**.
3. Click **+** then **Add custom connector**.
4. Enter `https://www.expensify.com/mcp/` as the server URL and click **Add**.
5. A sign-in window will open. Sign in with your Expensify account and click **Approve**.

### Team or Enterprise plan

An Owner must add the connector to the organization first:

1. Go to **Organization settings** → **Connectors**.
2. Click **Add** → hover over **Custom** → select **Web**.
3. Enter `https://www.expensify.com/mcp/` and click **Add**.

Then each member connects individually:

1. Go to **Customize** → **Connectors**.
2. Find the Expensify connector in the list and click **Connect**.
3. Sign in with your Expensify account and click **Approve**.

### Enable per conversation

Once configured, enable the connector in any conversation by clicking the **+** button at the bottom left of the chat, selecting **Connectors**, and toggling Expensify on.

---

# Set up on ChatGPT

Expensify is not yet available as a built-in ChatGPT connector. You can connect now using ChatGPT's developer mode, which is available on all plans including Business, Enterprise, and Education.

### Enable developer mode

1. Log in to [chatgpt.com](https://chatgpt.com).
2. Go to **Settings** → **Apps & Connectors** → scroll to **Advanced settings** at the bottom of the page.
3. Toggle on **Developer mode**.

### Create the connector

1. Go to **Settings** → **Connectors** → **Create**.
2. Fill in the connector details:
   - **Connector name:** Expensify
   - **Description:** Search your Expensify expenses, reports, receipts, trips, and tasks.
   - **Connector URL:** `https://www.expensify.com/mcp/`
3. Click **Create**. ChatGPT will connect to the server and display the available tools.
4. A sign-in window will open. Sign in with your Expensify account and click **Approve**.

### Use it in a conversation

1. Open a new chat.
2. Click the **+** button near the message composer and click **More**.
3. Select the Expensify connector to add it to the conversation.
4. Ask about your expenses and ChatGPT will use the Expensify Search tool to look up your data.

---

# What to ask

Your AI will use the Expensify Search tool to look up answers from your real data. Here are some questions to try, organized by role.

### For individuals

- "What did I spend on travel this month?"
- "Do I have any expenses that haven't been submitted yet?"
- "Show me all my expenses over $100 that are missing receipts."
- "What were my top five expenses last month?"
- "Find receipts from Marriott in the last 90 days."

### For managers

- "Which of my team's expense reports are waiting for my approval? Give me a one-line summary of each."
- "Summarize my team's spending by category for the last quarter."
- "Are there any reports from my team that have been sitting unsubmitted for more than a week?"
- "Find all unreported expenses across my team and tell me who has the most outstanding and how old they are."

### For accountants

- "Pull all expenses for [client name] from last quarter, broken down by category."
- "Which of my clients have outstanding expense reports that haven't been submitted?"
- "Summarize this month's spending for [client name] compared to last month and flag anything unusual."
- "Are there any expense reports stuck in the approval queue for more than a week across any of my clients?"

### For finance teams

- "What's our total outstanding reimbursable amount right now?"
- "Find all expenses this quarter that are missing receipts and are over $75."
- "Show me all outstanding invoices sorted by age."
- "Summarize total company spend for Q1, broken down by category, and flag any categories where spending increased more than 20% compared to Q4."
- "Which merchants are we spending the most with this year? Are there any we should consolidate or renegotiate with?"

---

# Combining Expensify with other tools

When your AI assistant has access to multiple MCP servers at once, it can pull data from several sources in a single response. Here are some useful combinations.

### Expensify + Google Calendar

Ask your AI to cross-reference expense history with your schedule:

- "I have a client meeting with Acme tomorrow. Pull all expenses tagged to their project from the last 30 days so I can be prepared."
- "Show me all business dinners I expensed in April and match them to calendar events so I can add the correct attendees."

### Expensify + Gmail or Outlook

Let your AI draft financial communications using real data from your account:

- "Draft an email to my manager summarizing my three oldest outstanding expense reports and what I'm waiting on for each."
- "Write a follow-up email to the finance team listing all approved reports from last month that haven't been reimbursed yet."

### Expensify + Google Sheets or Excel

Pull expense data directly into a spreadsheet:

- "Export last quarter's expenses by category into a spreadsheet, one row per expense, so I can send it to my accountant."
- "Create a monthly spending summary table comparing Q1 and Q2 by category."

### Expensify + Notion or Confluence

Incorporate live financial data into your team's documentation:

- "Add a spend summary for this month to our monthly finance review page in Notion."
- "Update our department's budget tracker in Confluence with last quarter's actuals from Expensify."

### Expensify + Slack

Combine expense context with conversations happening in Slack:

- "In our #expenses Slack channel, someone asked about the Q2 travel budget. Pull the actual Q2 travel spend from Expensify and draft a reply."
- "Summarize my team's pending approvals and post a message I can send to our #finance channel."

### Expensify + a CRM (HubSpot, Salesforce)

Connect client spend data to your sales or account management context:

- "Look up all expenses tagged to Acme Corp in Expensify and cross-reference with their deal value in HubSpot to estimate our cost-to-serve."
- "Summarize what we spent entertaining this client last quarter — I need it for their account review in Salesforce."

---

# Disconnect or revoke access

To permanently cut off an AI client's access to your Expensify data, revoke the token directly from your Expensify account. This is the most reliable method — it works regardless of which AI client you used and does not require the client's cooperation.

1. Log in to [expensify.com](https://expensify.com).
2. Go to **Account** → **Security** → **Device Management**.
3. Find the connection for your AI client (for example, "Claude" or "Cursor") and click **Revoke**.

After revoking, the token is immediately invalidated. Any future requests from that client will be rejected until you authorize again.

**Note:** Removing the server from your AI client's settings alone is not enough — the token remains valid until it expires or is explicitly revoked. Always use the Device Management page if you want to be sure access has been cut off.

---

# FAQ

## Is this connection secure?

Yes. The connection uses OAuth 2.1 with PKCE, which is the same standard used by major services like Google and GitHub. Your Expensify password is never shared with the AI client. You authorize through Expensify's own sign-in page, and the AI client only receives a limited-scope access token.

## Does the AI store my Expensify data?

That depends on the AI client's privacy policy. The Expensify MCP server only returns data in response to explicit search requests — it does not push or sync data proactively. Check your AI client's documentation for details on how it handles data returned from tool calls.

## Can the AI edit or delete my expenses?

Not yet. The MCP server is currently read-only — the AI can search and read your data but cannot create, modify, or delete anything in Expensify. This may change as the integration develops.

## Why does the AI say it can't find my data?

Make sure you completed the authorization step. If you see a prompt to sign in or authorize in your browser, complete that first. If you already authorized and are still having trouble, try revoking and reconnecting the integration.

## Can I connect multiple Expensify accounts?

Each AI client session can be connected to one Expensify account at a time. To connect a different account, revoke the existing token and authorize again with the other account.

## Does this work on mobile?

The MCP server is a web-based connection. Whether it works on mobile depends on the AI client. Claude Desktop and Cursor are desktop apps; Claude.ai and ChatGPT work in a mobile browser but MCP tool support may vary.
