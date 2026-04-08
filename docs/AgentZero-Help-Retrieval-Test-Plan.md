# AgentZero Consolidated Help Site Retrieval Test Plan

## Overview

This test plan validates retrieval correctness and version integrity for AgentZero when querying the consolidated help structure (single hub replacing New Expensify and Expensify Classic). Article types:

| Type | Frontmatter | Behavior |
|------|-------------|----------|
| **Specific** | `platform: Expensify_Classic` or `platform: New_Expensify` | Applies to one platform only; must be filtered by platform. |
| **Universal** | No platform | Applies fully to both; no internal version distinctions. |
| **Semi-Universal** | No platform | Applies to both; contains version-specific sections or links (New vs Classic). |

### Frontmatter fields used by the pipeline

The indexing pipeline (e.g. Web-Expensify) parses these frontmatter fields for each article and passes them to the retrieval index:

- **description** — Article summary; used for indexing/ranking.
- **platform** — Scoping for Specific articles. Values such as `Expensify_Classic` or `New_Expensify` indicate the article applies to that platform only; retrieval should filter (or weight) by this when the user or context specifies a version.
- **keywords** — Terms for matching; used for indexing/ranking.
- **internalScope** — Audience and scope note; used for indexing/ranking and retrieval scoping.

For Specific articles, **platform** is the field that drives version/platform filtering. Universal and semi-universal articles omit **platform** (or have no platform value) and are eligible for both.

**Intelligent default when version is not stated:**  
When the user query does not mention a version, the system should **not** assume New or Classic. Expected behavior: retrieve **Universal** and **Semi-Universal** articles that match the query, and optionally surface **both** version-specific articles when the intent could apply to either (e.g. "how do I cancel my subscription?" → show both New and Classic how-to articles, or the semi-universal overview that links to both). Specific articles for only one version must **not** be favored over the other unless the user or context (e.g. app context) provides a version signal.

---

## 1. Version Filtering

### 1.1 Explicit "New Expensify"

**Test Query:** How do I manage my subscription in New Expensify?

**Expected Article:** How to manage subscriptions and billing in New Expensify (or How to configure your subscription in New Expensify)

**Article Type:** Specific (New_Expensify)

**Should Retrieve:** New-Expensify–scoped subscription management articles; universal/semi-universal billing overview if relevant.

**Should Not Retrieve:** How to configure your subscription in Expensify Classic; How to Manage Billing & Subscriptions in Expensify Classic; Personal and Corporate Karma (Classic only); Tax Exempt (Classic-only).

**Failure Mode to Watch For:** Classic-only procedural articles appearing in top results; Personal and Corporate Karma or Tax Exempt ranked above New Expensify subscription articles.

**Why This Test Matters:** Ensures platform filter (frontmatter `platform`) is applied so Classic-only content is excluded when the user explicitly asks for New Expensify.

---

**Test Query:** Where do I update my payment method in New Expensify?

**Expected Article:** How to manage subscriptions and billing in New Expensify (or New Expensify subscription configuration)

**Article Type:** Specific (New_Expensify)

**Should Retrieve:** New Expensify billing/subscription articles that describe payment method updates.

**Should Not Retrieve:** Expensify Classic subscription or billing articles; Personal and Corporate Karma; Tax Exempt.

**Failure Mode to Watch For:** Classic "Settings > Account > Subscription" or "Settings > Workspaces" instructions returned for a New Expensify query.

**Why This Test Matters:** Same-version integrity for procedural steps; wrong version leads to wrong UI paths.

---

### 1.2 Explicit "Expensify Classic"

**Test Query:** How do I enable Personal Karma donations in Expensify Classic?

**Expected Article:** Personal and Corporate Karma

**Article Type:** Specific (Expensify_Classic)

**Should Retrieve:** Personal and Corporate Karma (Classic-only); optionally Expensify Classic billing/workspace articles if they reference Karma.

**Should Not Retrieve:** New-Expensify–only subscription or billing articles; universal plan-comparison articles that don’t mention Karma.

**Failure Mode to Watch For:** A New Expensify article outranking or replacing the Classic Karma article; Karma article missing because "Karma" is rare and ranking is diluted.

**Why This Test Matters:** Validates that Classic-specific features (Karma exists only in Classic) are correctly scoped to Classic.

---

**Test Query:** How do I request tax-exempt status in Expensify Classic?

**Expected Article:** Tax Exempt (Classic)

**Article Type:** Specific (Expensify_Classic)

**Should Retrieve:** Tax Exempt article (Classic-only); optionally Classic subscription/settings articles that mention tax.

**Should Not Retrieve:** New Expensify–only billing or subscription articles.

**Failure Mode to Watch For:** New Expensify billing article returned instead of or above the Classic Tax Exempt article; universal billing overview dominating and pushing Classic Tax Exempt below cutoff.

**Why This Test Matters:** Tax-exempt flow is Classic-specific (e.g. Settings > Account > Subscription); wrong version gives wrong steps.

---

### 1.3 No version stated but intent implies version

**Test Query:** Where is the Request Tax-Exempt Status button?

**Expected Article:** Tax Exempt (Classic) — because the current UI path described (Settings > Account > Subscription, Request Tax-Exempt Status) exists only in Classic.

**Article Type:** Specific (Expensify_Classic)

**Should Retrieve:** Tax Exempt; optionally semi-universal billing receipt or subscription overview if they mention tax.

**Should Not Retrieve:** New-Expensify–only subscription articles as the primary answer (they don’t have this button in the same place).

**Failure Mode to Watch For:** System assumes New Expensify and returns only New Expensify subscription content; or returns both versions without clarifying which UI the user is in.

**Why This Test Matters:** Query doesn’t say "Classic" but the feature is Classic-only; retrieval should still surface the correct article. Defines expectation: when a feature is version-specific, that article should be retrievable even without the version keyword.

---

**Test Query:** How do I donate to Expensify.org from my expenses?

**Expected Article:** Personal and Corporate Karma (Classic)

**Article Type:** Specific (Expensify_Classic)

**Should Retrieve:** Personal and Corporate Karma; no New-Expensify–only article about Karma (none exists).

**Should Not Retrieve:** New Expensify subscription or billing articles as the main answer; universal plan comparison.

**Failure Mode to Watch For:** Generic billing or donation-related New Expensify article returned because "donate" or "expenses" match; Karma article missed due to dilution or low similarity.

**Why This Test Matters:** Karma is Classic-only; query implies donation from expenses, which maps to one specific article. Ensures no wrong-version substitution.

---

### 1.4 Queries that could wrongly pull the other version

**Test Query:** Cancel my subscription

**Expected Article (version-agnostic):** Semi-universal (e.g. Expensify Subscription Overview) and/or both version-specific articles (How to manage/cancel in New Expensify + How to manage/cancel in Expensify Classic).

**Article Type:** Semi-Universal + Specific (both versions)

**Should Retrieve:** Expensify Subscription Overview; How to manage subscriptions and billing in New Expensify; How to Manage Billing & Subscriptions in Expensify Classic (or equivalent cancel steps). Universal plan articles only if they discuss cancellation.

**Should Not Retrieve:** Personal and Corporate Karma; Tax Exempt as the primary answer (they are not about canceling subscription).

**Failure Mode to Watch For:** Only one version’s cancel article returned when the user didn’t specify version; or a Classic-only non-cancel article (e.g. Karma) ranking above cancel articles.

**Why This Test Matters:** Without a version signal, the system must not assume one version; both procedural articles (or the overview that links to both) should be available.

---

## 2. Cross-Version Leakage Tests

### 2.1 New-phrased query that could trigger Classic-only

**Test Query:** In New Expensify, how do I set up Karma donations for my workspace?

**Expected Article:** No Classic-only article should be the primary result. Ideally: a short answer that Karma is only in Expensify Classic, or no result that implies Karma exists in New Expensify.

**Article Type:** N/A (feature doesn’t exist in New)

**Should Retrieve:** Either no Karma article, or a universal/New article that clarifies Karma is not in New Expensify. If any Karma article is retrieved, it must be clearly labeled as Expensify Classic only.

**Should Not Retrieve:** Personal and Corporate Karma as the top result without a clear "Expensify Classic only" signal, so the user isn’t led to follow Classic steps in New Expensify.

**Failure Mode to Watch For:** Personal and Corporate Karma ranked #1 and presented as if it applies to New Expensify; embedding similarity on "Karma" and "donations" overriding platform filter.

**Why This Test Matters:** Adversarial check: user says "New Expensify" but asks about a Classic-only feature; retrieval must not silently return Classic-only content as the main answer without version clarity.

---

**Test Query:** Where do I find Request Tax-Exempt Status in New Expensify?

**Expected Article:** No Classic-only Tax Exempt article as the primary answer; or an answer that tax-exempt request is in Expensify Classic / different in New Expensify.

**Article Type:** N/A for Classic-only article as main result

**Should Retrieve:** New Expensify subscription/billing articles; if Tax Exempt is retrieved, it must be clearly scoped to Expensify Classic.

**Should Not Retrieve:** Tax Exempt (Classic) as the top result without version labeling, implying the same UI exists in New Expensify.

**Failure Mode to Watch For:** Tax Exempt article returned as the main answer and user follows Classic path (Settings > Account > Subscription) in New Expensify where it doesn’t match.

**Why This Test Matters:** Prevents cross-version leakage when the user explicitly says "New Expensify."

---

### 2.2 Classic-phrased query that could trigger New-only

**Test Query:** In Expensify Classic, how do I manage my subscription from the Account menu?

**Expected Article:** How to configure your subscription in Expensify Classic (or How to Manage Billing & Subscriptions in Expensify Classic).

**Article Type:** Specific (Expensify_Classic)

**Should Retrieve:** Classic subscription/billing articles that reference Account or Settings > Account.

**Should Not Retrieve:** How to manage subscriptions and billing in New Expensify; New-Expensify–only subscription articles as the primary result.

**Failure Mode to Watch For:** New Expensify subscription article ranked above Classic article because of high semantic similarity; user gets "Account > Subscription" (New) instead of "Settings > Account > Subscription" (Classic).

**Why This Test Matters:** Adversarial check: user says "Expensify Classic" and "Account menu"; retrieval must prefer Classic-specific articles over New-only.

---

**Test Query:** Expensify Classic: update payment method for my workspace.

**Expected Article:** How to configure your subscription in Expensify Classic / How to Manage Billing & Subscriptions in Expensify Classic.

**Article Type:** Specific (Expensify_Classic)

**Should Retrieve:** Classic billing/subscription articles.

**Should Not Retrieve:** How to manage subscriptions and billing in New Expensify; How to configure your subscription in New Expensify as the primary result.

**Failure Mode to Watch For:** New Expensify article winning on "update payment method" similarity despite "Expensify Classic" in the query.

**Why This Test Matters:** Ensures version keyword is weighted so Classic is not overridden by New-only content.

---

### 2.3 One version should appear, not both

**Test Query:** Step-by-step to enable Corporate Karma in Expensify Classic.

**Expected Article:** Personal and Corporate Karma (Classic only).

**Article Type:** Specific (Expensify_Classic)

**Should Retrieve:** Personal and Corporate Karma; optionally other Classic workspace/billing articles.

**Should Not Retrieve:** Any New-Expensify–only subscription or billing article in the top results (no New Expensify Karma article exists; including a New article would be wrong).

**Failure Mode to Watch For:** A New Expensify subscription or workspace article appearing in top-k because of "workspace" or "enable" or "subscription," diluting the single correct article.

**Why This Test Matters:** When only one version has the feature, only that version’s article(s) should be in the result set.

---

## 3. Semi-Universal Stress Tests

### 3.1 Version-specific nuance inside one article

**Test Query:** Where do I find my billing receipt in New Expensify?

**Expected Article:** How to read your Expensify billing receipt (semi-universal).

**Article Type:** Semi-Universal

**Should Retrieve:** How to read your Expensify billing receipt; the **correct internal section** ("Where to find your billing receipt in New Expensify" / Account > Subscription > View payment history) should be surfaced or emphasized.

**Should Not Retrieve:** Only the Expensify Classic section of the same article; a Classic-only article as the primary answer.

**Failure Mode to Watch For:** Retrieval returns the article but the cited snippet or section is the Classic one (Settings > Account > Subscription); or the answer uses Classic path for a New Expensify user.

**Why This Test Matters:** Semi-universal articles have version-specific sections; AgentZero must surface the section that matches the user’s version (when stated) or present both sections when version is unknown.

---

**Test Query:** Where do I find my billing receipt in Expensify Classic?

**Expected Article:** How to read your Expensify billing receipt (semi-universal).

**Article Type:** Semi-Universal

**Should Retrieve:** Same article with the **Classic section** ("Where to find your billing receipt in Expensify Classic" / Settings > Account > Subscription) surfaced.

**Should Not Retrieve:** Only the New Expensify section; a New-Expensify–only article as the primary answer.

**Failure Mode to Watch For:** New Expensify path (Account > Subscription > View payment history) returned when the user asked for Classic.

**Why This Test Matters:** Symmetric to 3.1; validates that internal version distinction is respected for both versions.

---

### 3.2 Semi-universal with version-specific links

**Test Query:** How do I configure my subscription? (no version)

**Expected Article:** Expensify Subscription Overview (semi-universal) and/or both version-specific how-to articles.

**Article Type:** Semi-Universal (+ Specific for each version if desired)

**Should Retrieve:** Expensify Subscription Overview; ideally the "Managing your Expensify subscription" section with **both** links (New Expensify and Expensify Classic) so the user can choose. Alternatively, both How to configure in New Expensify and How to configure in Expensify Classic.

**Should Not Retrieve:** Only one version’s how-to article without the other or without the overview that links to both.

**Failure Mode to Watch For:** Only one version’s procedural article returned; or overview returned but the answer only quotes one link and hides the other version’s link.

**Why This Test Matters:** Semi-universal overview exists to route users to the right version; retrieval and answer composition must not collapse to a single version when the query is neutral.

---

**Test Query:** How do I transfer billing ownership?

**Expected Article:** What Billing Ownership Means in Expensify (or equivalent) and/or articles that link to both "How to transfer billing ownership in New Expensify" and "How to take over billing in Expensify Classic."

**Article Type:** Semi-Universal or Universal

**Should Retrieve:** Articles that cover both versions’ procedures or link to both; no single-version article as the only result when the query is version-agnostic.

**Should Not Retrieve:** Only the New Expensify transfer article; only the Expensify Classic take-over article.

**Failure Mode to Watch For:** Only one version’s transfer/take-over steps returned; user in the other version gets wrong instructions.

**Why This Test Matters:** Transfer billing is critical and differs by version; semi-universal or dual-version coverage must be surfaced.

---

### 3.3 Correct internal section by version

**Test Query:** Do I need a subscription in Expensify Classic?

**Expected Article:** Expensify Subscription Overview (semi-universal), FAQ section.

**Article Type:** Semi-Universal

**Should Retrieve:** Expensify Subscription Overview with the FAQ item "Do I need a subscription to use Expensify?" — and the **correct clause** surfaced: "Individual workspaces in Expensify Classic can use the free Track plan. Group workspaces and all New Expensify workspaces require a paid subscription."

**Should Not Retrieve:** A snippet that only says "all New Expensify workspaces require a paid subscription" without the Classic exception; a New-Expensify–only article.

**Failure Mode to Watch For:** Answer implies everyone needs a paid subscription, or omits the Classic free Track option; wrong nuance for a Classic user.

**Why This Test Matters:** Semi-universal FAQ has version-specific nuance; retrieval must not drop the Classic-specific exception.

---

## 4. Ranking and Dilution Tests

### 4.1 Broad article, rare term deep in body

**Test Query:** Chat-only members on my billing receipt

**Expected Article:** How to read your Expensify billing receipt (and/or articles that explain member activity types).

**Article Type:** Semi-Universal / Universal

**Should Retrieve:** Billing receipt article where "Chat-only members" is defined (e.g. in the "Billing breakdown section" or member activity types).

**Should Not Retrieve:** Generic subscription overview without receipt breakdown; unrelated articles that mention "chat" or "members" but not "Chat-only" in a billing context.

**Failure Mode to Watch For:** "Chat-only" is a rare, specific term; if the receipt article is long and covers many topics, its embedding may be diluted and rank below cutoff or below broader subscription articles.

**Why This Test Matters:** Validates that niche terms deep in an article still retrieve that article and the right section.

---

**Test Query:** Pay-per-use Control members pricing

**Expected Article:** How to read your Expensify billing receipt; possibly Control Plan pricing articles.

**Article Type:** Semi-Universal / Specific or Universal

**Should Retrieve:** Receipt article (pay-per-use Control members @ $36.00); Control plan pricing articles if they discuss pay-per-use.

**Should Not Retrieve:** Only Collect plan or generic "Control" articles that don’t explain pay-per-use member billing.

**Failure Mode to Watch For:** Phrase "pay-per-use Control" is specific; long receipt article may rank lower than shorter, broader articles; wrong article or wrong section surfaced.

**Why This Test Matters:** Rare billing terminology must still map to the correct article and section.

---

### 4.2 Article covering many topics (dilution)

**Test Query:** Can I switch between monthly and annual billing?

**Expected Article:** Expensify Subscription Overview (FAQ: "Can I switch between monthly and annual billing?").

**Article Type:** Semi-Universal

**Should Retrieve:** Expensify Subscription Overview; the FAQ section or "Managing your Expensify subscription" where monthly vs annual is mentioned.

**Should Not Retrieve:** Unrelated articles that mention "annual" or "monthly" in passing; Classic-only or New-only procedural article that doesn’t answer the yes/no question.

**Failure Mode to Watch For:** Overview article is long (subscription basics, billing models, pricing, FAQ, links to both versions); embedding may be diluted so a shorter article that only briefly mentions "annual" ranks higher; FAQ answer missed.

**Why This Test Matters:** Broad articles are at risk of dilution; retrieval and ranking must still surface the right section for focused questions.

---

**Test Query:** What happens if my payment fails?

**Expected Article:** Expensify Subscription Overview (FAQ: "What happens if my payment fails?") and/or version-specific articles that describe out-of-date billing and retry.

**Article Type:** Semi-Universal + possibly Specific

**Should Retrieve:** Overview FAQ; Understanding Out-of-Date Billing; version-specific "retry billing" or payment failure steps if present.

**Should Not Retrieve:** Only an article that mentions "payment" or "fails" in a different context (e.g. reimbursement) and doesn’t address subscription payment failure.

**Failure Mode to Watch For:** Overview FAQ is one of many sections; ranking drops it below cutoff; user gets a less relevant article.

**Why This Test Matters:** Critical support question; the correct FAQ or procedural article must not be lost due to dilution.

---

### 4.3 Rare term, deep in article

**Test Query:** MCC Merchant Category Code Expensify.org fund

**Expected Article:** Personal and Corporate Karma (Classic).

**Article Type:** Specific (Expensify_Classic)

**Should Retrieve:** Personal and Corporate Karma, where MCC is used to determine which Expensify.org fund receives the donation.

**Should Not Retrieve:** Generic billing or donation articles that don’t explain MCC and Expensify.org funds.

**Failure Mode to Watch For:** "MCC" and "Expensify.org fund" appear deep in the Karma article; if chunking or embedding dilutes this, the article may not rank for this query; or a different article that mentions "fund" or "donation" ranks higher.

**Why This Test Matters:** Ensures long-tail, precise terms still retrieve the correct Classic-only article.

---

## 5. Ambiguity Handling

### 5.1 How does billing work?

**Test Query:** How does billing work?

**Expected Article:** Expensify Subscription Overview and/or universal/semi-universal billing articles that explain billing models, who gets billed, and how charges are applied.

**Article Type:** Universal / Semi-Universal

**Should Retrieve:** Expensify Subscription Overview ("How Expensify billing works," billing models, billing owner); Choosing Between Collect and Control (billing model comparison); How to read your Expensify billing receipt (what’s on the bill). May include both version-specific procedural articles if the answer should cover "how to manage" as well as "how it works."

**Should Not Retrieve:** Only one version’s how-to (e.g. only Classic or only New) as if it were the only answer; Personal and Corporate Karma or Tax Exempt as the primary answer (they are narrow topics, not general "how billing works").

**Failure Mode to Watch For:** System assumes a version and returns only New or only Classic procedural article; or returns a narrow topic (Karma, tax exempt) instead of the general billing overview.

**Why This Test Matters:** Highly ambiguous query; expected behavior is conceptual/overview content (universal/semi-universal) that applies to both platforms, not a single-version procedure.

---

### 5.2 Can I change my plan?

**Test Query:** Can I change my plan?

**Expected Article:** Expensify Subscription Overview ("Managing your Expensify subscription" — upgrade or downgrade plans); version-specific subscription management articles (both New and Classic) for steps.

**Article Type:** Semi-Universal + Specific (both versions)

**Should Retrieve:** Overview that says yes and points to subscription settings; How to manage/configure subscription in New Expensify; How to manage/configure in Expensify Classic (or links to both from overview). Universal plan comparison only if it discusses changing plans.

**Should Not Retrieve:** Only one version’s how-to; Choosing Between Collect and Control as the *only* result (that’s "which plan," not "can I change"); Karma or Tax Exempt.

**Failure Mode to Watch For:** Only New or only Classic steps returned; or only "which plan to choose" content without "yes, you can change and here’s where."

**Why This Test Matters:** Ambiguous between "which plan" and "how to change"; retrieval should favor "how to change" (overview + both version procedures) and not assume version.

---

### 5.3 Why am I being charged?

**Test Query:** Why am I being charged?

**Expected Article:** How to read your Expensify billing receipt (what’s on the bill, member types, breakdown); Expensify Subscription Overview (how billing works, who gets billed); optionally version-specific subscription/billing articles.

**Article Type:** Semi-Universal / Universal + optionally Specific

**Should Retrieve:** Billing receipt article (understand your charges); Subscription Overview (billing model, billing owner); version-neutral or both-version procedural articles for viewing subscription and payment history.

**Should Not Retrieve:** Only one version’s "view your subscription" article; Personal and Corporate Karma or Tax Exempt as the primary answer unless the user context clearly points to Karma or tax.

**Failure Mode to Watch For:** Single-version article returned; or an article about a specific charge type (e.g. Karma) dominating when the user may be asking about general subscription charges.

**Why This Test Matters:** Very ambiguous; expected behavior is "here’s how to understand your charges" (receipt + overview) with path to both versions for details, not a version assumption or a narrow edge case.

---

### 5.4 Where do I manage my subscription? (no version)

**Test Query:** Where do I manage my subscription?

**Expected Article:** Expensify Subscription Overview (managing subscription, with links to both versions) and/or both "How to configure/manage subscription in New Expensify" and "How to configure/manage in Expensify Classic."

**Article Type:** Semi-Universal + Specific (both)

**Should Retrieve:** Overview that links to both version-specific how-to articles; or both version-specific articles so the user can pick. Universal/semi-universal content preferred over returning only one version.

**Should Not Retrieve:** Only How to configure in New Expensify; only How to configure in Expensify Classic.

**Failure Mode to Watch For:** Only one version’s article returned; user in the other version gets wrong navigation (e.g. Account > Subscription vs Settings > Account > Subscription).

**Why This Test Matters:** Defines expected behavior for version-agnostic procedural queries: surface both versions or the overview that routes to both, not a single-version default.

---

## Summary: Intelligent Default When Version Is Not Stated

- **Do not assume** New Expensify or Expensify Classic from the query alone.
- Prefer **Universal** and **Semi-Universal** articles for conceptual and overview questions.
- For **procedural** questions ("how do I…", "where do I…"):
  - Surface **both** version-specific articles when the task exists in both, or
  - Surface the **semi-universal** article that links to both version-specific articles.
- **Specific** (platform-scoped) articles (frontmatter `platform: Expensify_Classic` or `New_Expensify`):
  - Must be included only when the query explicitly mentions that version, or when the feature exists only in that version (e.g. Karma, Classic Tax Exempt) and the query clearly targets that feature.
- **Semi-universal** articles: when the user *does* state a version, the **internal section or link** for that version must be the one surfaced (e.g. "Where to find your billing receipt in New Expensify" vs "in Expensify Classic").

---

## Test Execution Notes

- Run queries against the Pinecone index (or staging retrieval pipeline) after the consolidated help content is indexed with correct **platform** (and optionally description, keywords, internalScope) metadata for Specific articles.
- For each test: record top-k retrieved article IDs/titles, snippet or section cited, and whether platform filter was applied (if applicable).
- Flag: any test where **Should Not Retrieve** appears in top-k, or where **Expected Article** is missing from top-k, or where a semi-universal article is returned but the wrong internal section is cited for a version-specific query.

---

## Alignment with indexing pipeline

The pipeline that prepares help content for AgentZero (e.g. in Web-Expensify) parses frontmatter and extracts:

- **description** — Article description (indexed for retrieval/ranking).
- **platform** — Platform scope for Specific articles (`Expensify_Classic` or `New_Expensify`). Used to filter or weight results when the user or context specifies a version.
- **keywords** — Keyword list (indexed for retrieval/ranking).
- **internalScope** — Internal scope/audience note (indexed for retrieval/ranking).

Articles with no `platform` in frontmatter are treated as Universal or Semi-Universal and are eligible for retrieval regardless of user-specified version. The test plan’s “version filtering” and “cross-version leakage” tests assume retrieval uses **platform** (or equivalent metadata derived from it) to exclude or down-rank platform-specific articles when the user asks for the other platform.
