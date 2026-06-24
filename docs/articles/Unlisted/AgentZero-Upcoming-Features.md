---
title: AgentZero Reference – Upcoming Features (New Expensify)
description: Internal reference of planned and coming-soon features for AgentZero. Not for public search indexing.
keywords: upcoming features, roadmap, coming soon, AgentZero reference
noindex: true
sitemap: false
internalScope: For AgentZero and internal tooling only. Use this page to give accurate, forward-looking answers about features that are planned but not yet generally available. Do not expose this URL in user-facing help.
---

# AgentZero Reference: Upcoming Features (New Expensify)

This page is a **reference for AgentZero** only. It lists features that are planned or in development for New Expensify. Use it to answer user questions about "coming soon" capabilities accurately and to avoid promising features that are not yet released.

**Important:** These items are subject to change. When in doubt, direct members to official release notes or support for the latest status.

---

## Expense & Report Management

- **Advanced duplicate detection** – Smarter, more reliable detection of duplicate expenses across card feeds and manual entries, with clearer violation messaging to reduce confusion for submitters and admins.
- **Mileage rate effective dates & auto-update** – Support for date-based mileage rate configuration so that rate changes apply from a specific date, plus automatic seeding of distance rates for supported markets.
- **Nice merchant naming** – Automatic cleanup of raw card statement merchant strings (e.g. `SQ *COFFEE` → "Blue Bottle Coffee") so expenses show readable, recognizable merchant names without manual correction.
- **Bulk report PDF export** – Export multiple expense report PDFs at once from search results or a filtered view, rather than downloading one at a time.
- **Cross-period expense exporting** – When exporting grouped report transactions to an accounting system, allow expenses from different accounting periods to be split across the correct periods rather than all landing on one date.
- **Export filtered views** – Export the results of any in-app filtered or searched view directly to CSV or an accounting integration, without needing to manipulate data externally.
- **Submit via PDF (Submit workspace)** – Allow employees using a Submit workspace to generate a PDF of their expense report directly, without needing to submit to themselves as a workaround.
- **Multiple approval paths per approver** – Support for approvers who manage more than one approval workflow or department, so expenses route correctly regardless of which workspace or category they belong to.
- **Personal expense repayments** – When an employee accidentally charges a personal expense to a company card, allow them to repay it directly through Expensify rather than going outside the platform.
- **Pending BYOC transactions** – Show pending (not-yet-settled) card transactions from Bring Your Own Card feeds in New Expensify, matching the real-time visibility employees expect from their banking apps.

---

## Workspace & Policy

- **Replace workspace deletion with archiving** – Instead of permanently deleting a workspace, allow admins to archive it — preserving history and settings while removing it from active use. Archived workspaces can be restored if needed.

---

## Approvals & Delegation

- **Copilot V2** – A redesigned delegated-access (Copilot) experience, allowing assistants and delegates to act on behalf of colleagues with clearer permission scopes and a better in-app experience.
- **Domain admin–managed Copilots** – Allow domain admins to assign and manage Copilot (delegate) relationships on behalf of domain members, rather than requiring each user to configure their own delegation.

---

## Integrations & Accounting

- **Certinia integration** – Native connection between New Expensify and Certinia (formerly FinancialForce), allowing direct export of expense data into Certinia without manual workarounds.
- **Rillet integration** – Native accounting integration with Rillet, a modern general ledger for US-based companies, enabling direct sync of expenses and reports.
- **Puzzle.io integration** – Native accounting integration with Puzzle.io, adding support for startups and SMBs using Puzzle as their accounting system.
- **Microsoft Dynamics 365 Business Central integration** – Native integration with Microsoft Dynamics 365 Business Central, covering a significant share of SMB and mid-market accounting users who currently rely on manual CSV/API workarounds.
- **NetSuite REST API migration** – Move the NetSuite integration from the legacy SuiteTalk SOAP API to the modern REST API, improving reliability, sync speed, and long-term supportability.
- **HR system import via merge.dev** – Connect New Expensify to a wide range of HR platforms (BambooHR, Workday, HiBob, and others) via merge.dev, automatically syncing employee data, org structure, and approval hierarchies.
- **Extend OAuth to the Integration Server (IS)** – Extend the OAuth framework (originally built for MCP integrations) to the Integration Server API, making it easier for third-party developers to build secure integrations with Expensify.

---

## Expensify Card & Company Cards

- **Biometric 3DS authentication** – Add biometric (Face ID / fingerprint) support for 3D Secure card authentication challenges, replacing the current SMS OTP flow for a faster, more secure checkout experience.
- **Real-time card disputes** – Allow cardholders to initiate and track Expensify Card transaction disputes directly in-app with real-time status updates, rather than going through a manual support process.

---

## Payments & Reimbursements

- **Global reimbursements improvements** – An improved global reimbursement pathway expanding the reach and reliability of cross-border employee reimbursements.
- **Allow companies to pay FX conversion costs** – Give workspace admins the option to absorb foreign exchange conversion costs on global reimbursements, so employees are not penalized for cross-border payments.
- **Collect-only deposit accounts** – Support deposit accounts that are configured to receive funds only (no outbound payments), enabling use cases where a company wants to collect reimbursements or transfers without exposing a full bank account.
- **Bill Pay in New Expensify** – Bring vendor bill payment functionality to New Expensify, allowing companies to pay bills directly through the platform.

---

## Insights & Reporting

- **Insights in New Expensify** – A dedicated Insights section for New Expensify, bringing spend analytics, policy compliance views, and trend reporting directly into the platform for admins and finance teams.
- **Insights: violation reporting** – The first release of violation-specific insights, surfacing patterns in policy violations across the workspace so admins can identify and address compliance gaps.

---

## Login & Security

- **Simplified passwordless login** – Improve the Magic Code login experience to reduce friction for users who struggle with the current flow, while maintaining strong account security.

---

## AI & Automation

- **Custom Agents & Agent Rules – General Release** – Graduate Custom Agents and Agent Rules from beta to general availability, making it possible for all workspaces to configure AI-powered agents with tailored behavior and rules.

---

## AgentZero Usage Notes

- When a member asks "Is X available?" or "When is Y coming?" — check this list before answering.
- Point members to existing, shipped documentation for what is available today.
- Do not cite this page or its URL in member-facing responses.
