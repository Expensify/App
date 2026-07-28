# Expensify Help Site Capitalization Guide

## Purpose

This document defines capitalization rules for Expensify HelpDot articles. It supplements — but does not replace — the UI referencing rules in [HELPSITE_NAMING_CONVENTIONS.md](./HELPSITE_NAMING_CONVENTIONS.md) and the structural rules in [HELP_AUTHORING_GUIDELINES.md](./HELP_AUTHORING_GUIDELINES.md).

**Source of truth for product copy:** `src/languages/en.ts` (the app's English translation file). When in doubt, match the label shown in New Expensify or Expensify Classic.

---

## Golden rule

**Match the product UI exactly.**

For buttons, tabs, toggles, section headers, and navigation paths, copy the label character-for-character from the app. Do not paraphrase, shorten, or re-capitalize UI text.

For body copy and headings, use **sentence case** unless a term is a proper noun, product name, or defined role listed below.

---

## Default: sentence case

Use sentence case for most help prose, section headings (`##`), step instructions, and descriptions.

| Context | Rule | Example |
| --- | --- | --- |
| Buttons | First word capitalized only | **Save changes**, **Mark as done**, **Go back** |
| Tabs | Match UI | **Settings**, **Workspaces**, **Reports** |
| Field labels | Sentence case | **Report name**, **Phone number**, **First name** |
| Section headings | Sentence case; capitalize proper nouns | `## How to add a payment card` |
| Body text | Sentence case | "Add a bank account to reimburse expenses…" |

The app follows this pattern for UI labels: **only the first word is capitalized**, unless the label includes a proper noun, product name, or acronym.

---

## Always capitalize: brand and product names

These are proper nouns. Capitalize them everywhere — titles, sentences, UI references, and metadata.

| Term | Notes |
| --- | --- |
| **Expensify** | Company and product |
| **New Expensify** | Current app |
| **Expensify Classic** | Legacy app and website |
| **Expensify Card** | Always both words |
| **Expensify Wallet** | Product feature |
| **Expensify Travel Card** | Product name |
| **Expensify Travel** | Feature / section title |
| **Expensify ACH** | Payment method |
| **Expensify Terms of Service** | Legal document name |
| **ExpensifyApproved!** | Program name |
| **Expensify.org** / **ExpensifyHelp** | Branded properties |
| **Concierge** | AI support — always capitalized |

**App references:** lowercase "app" and "web app" after the brand:

- Expensify app
- Expensify web app
- New Expensify app

---

## Capitalize: named features and programs

Treat these as product features, not generic nouns:

| Term | Example in app |
| --- | --- |
| **Bill Pay** | Marketing / footer feature name |
| **Consolidated Travel Billing** | Workspace setting |
| **Expense Report** / **Expense Reports** | Report type (when used as a label) |
| **Expense Management** / **Spend Management** | Marketing feature names |
| **Continuous Reconciliation** | Integration feature |
| **Advanced Approvals** | Feature title |
| **Smart Limit** | Card control type |
| **Travel Card** | Display name at checkout |
| **Personal Karma** / **Corporate Karma** | Donation programs |
| **#focus mode** | Includes the `#` prefix |

---

## Capitalize: integrations and third-party products

Use each vendor's official casing:

| Integration | Example |
| --- | --- |
| **QuickBooks Desktop** / **QuickBooks Online** | Full name always |
| **Sage Intacct** | Not "Sage intacct" |
| **NetSuite** | |
| **Xero** | |
| **Microsoft Dynamics** | |
| **Plaid** | "connect via Plaid" |
| **Stripe Cards** | |
| **Workday** / **BambooHR** | HR integrations |
| **App Store** / **Google Play Store** | Store names |

In sentences, these stay capitalized: "Configure how Expensify data exports to **QuickBooks Online**."

---

## Capitalize: legal, security, and tech terms

| Term | Usage |
| --- | --- |
| **Privacy Policy** | Legal document |
| **Terms of Service** | Legal document (generic "terms and conditions" stays lowercase) |
| **Two-factor authentication** | Feature name; **2FA** after first use is fine |
| **Two-factor code** | UI label |
| **Magic code** | UI label (lowercase "magic code" is also used in running sentences) |
| **ACH** | Acronym — "direct deposit (ACH)" |
| **WebGL** | Technology name — do not lowercase |
| **Beta** | Label: "Expensify Wallet (Beta)" |
| **3D Secure** | Payment authentication |

---

## Capitalize: people and admin roles (when they are titles)

| Title / UI label | Generic use in a sentence |
| --- | --- |
| **Account Manager** | "reach out to your account manager" |
| **Account Executive** | |
| **Partner Manager** | |
| **Domain Admin** | "If you're a domain admin…" |
| **Workspace Admin** / **Workspace Admins** | "workspace admin" in body copy |
| **Domain Settings** | Settings section name |

The app capitalizes role names in UI labels and section titles, but often lowercases them in flowing prose. Help articles may capitalize **Workspace owner** as a defined billing role (see below).

---

## Lowercase: generic domain terms in sentences

These are lowercase in body text even when the related nav item is capitalized:

| Lowercase in prose | Capitalized in UI |
| --- | --- |
| workspace | **Workspaces** (tab) |
| report / reports | **Reports** (tab) |
| expense / expenses | **Expenses** |
| invoice / invoices | **Invoices** (nav label) |
| company card / company cards | **Company cards** (section) |
| per diem / per diem rates | **Per diem** (feature label) |
| workspace rules | |
| workspace owner | **Workspace owner** (defined role — see below) |
| approval workflow | |
| subscription / plan (generic) | **Collect**, **Control**, **Annual**, **Pay-per-use** (types) |

**Examples from app copy:**

- "You can't export an empty **report**."
- "If you leave this **workspace**…"
- "Set how **company card** purchases export…"
- "The **workspace owner** can add and manage the payment card."

### Defined role: Workspace owner

In billing documentation, **Workspace owner** may be capitalized as a defined role (consistent with [Learn About Billing Permissions](./articles/new-expensify/billing-and-subscriptions/Learn-About-Billing-Permissions.md)). Use **Workspace owner** when referring to the role; use lowercase **workspace** when referring to the entity itself.

- ✅ "Only the **Workspace owner** can manage the payment card."
- ✅ "Each **workspace** has one **Workspace owner**."
- ❌ "Only the Workspace Owner can…" (don't title-case "Owner" alone)
- ❌ "Every **Workspace** uses the Collect plan." (generic noun)

---

## Navigation paths

Use `>` between levels. Capitalize each segment as it appears in the UI:

- **Account > Subscription**
- **Workspaces > Make or track payments**
- **Settings > New Expensify**
- **Settings > Workspaces**
- **Settings > Domains > Company Cards**
- **Settings > Profile > Contact methods**

Platform references in navigation instructions: lowercase **web** and **mobile**.

- ✅ "In the navigation tabs (on the left on web, on the bottom on mobile)…"

---

## UI element quick reference

| Element | Rule | Example |
| --- | --- | --- |
| **Buttons** | Sentence case, bold, no quotes | Select **Save changes**. |
| **Tabs** | Exact UI text, bold | Select **Workspaces**. |
| **Toggles** | Exact label, bold | Enable **Reimbursements**. |
| **Three dots menu** | Per [HELPSITE_NAMING_CONVENTIONS.md](./HELPSITE_NAMING_CONVENTIONS.md) | Select the three dots **(⋮)**. |
| **Status labels** | Match UI | **Submitted**, **Approved**, **Draft**, **Marked as done** |
| **Field names** | Sentence case | **Report name**, **Merchant**, **Category** |

### Common UI labels (from `en.ts`)

| UI label | Do not write |
| --- | --- |
| **Add payment card** | Add Payment Card, **ADD PAYMENT CARD** |
| **Change payment card** | Change Payment Card |
| **Retry payment** | Retry Payment |
| **Transfer owner** | Transfer Owner |
| **Cancel subscription** | Cancel Subscription |
| **Plan type** | Plan Type |
| **Subscription settings** | Subscription Settings |
| **Subscription size** | Subscription Size |
| **Auto-renew** | Auto-Renew, Autorenew |
| **Auto-increase annual seats** | Auto-Increase Annual Seats |
| **Save the world** | Save the World |
| **Enable Personal Karma** | Enable personal karma |
| **View payment history** | View Payment History |
| **Learn more** | Learn More (in-app button; marketing footer may differ) |

---

## Special cases

### Per diem

- Feature label: **Per diem**, **Import per diem rates**
- Running text: "Set **per diem** rates to control daily employee spend."

### Plan and subscription types

Capitalize as product terms when naming the type:

- **Collect**, **Control**
- **Annual**, **Pay-per-use**

Lowercase when used generically: "your workspace plan," "an annual subscription."

### Compound field labels

- **Non-billable** (hyphenated)
- **Date of birth**, **Phone number**, **Zip code**

### Acronyms in labels

Keep standard casing: **Report ID**, **MCC**, **TBD**, **N/A**, **OK**

### Marketing vs. in-app copy

Footer and marketing strings sometimes use Title Case (**Expense Management**, **Get Started**, **Learn More**) that differs from in-app buttons (**Learn more**). **For HelpDot articles, prefer in-app UI labels** over marketing site copy.

### Status label exception

The status label `archived` is intentionally lowercase in the app. Match the UI if you reference it.

---

## Article headings

Follow [HELP_AUTHORING_GUIDELINES.md](./HELP_AUTHORING_GUIDELINES.md): headings must be task-based and searchable.

Capitalization pattern:

- **Article title (`#`):** sentence case with proper nouns capitalized  
  - ✅ `# How to connect QuickBooks Online to a workspace`
- **Section headings (`##`):** sentence case; capitalize proper nouns and product names  
  - ✅ `## How to issue Expensify Cards to employees`
  - ❌ `## How To Issue Expensify Cards To Employees`

---

## Decision tree

```
Are you quoting text shown in the UI?
  └─ Yes → Copy it exactly from the product (see en.ts or the live app)
  └─ No → Is it a brand, product, integration, or legal name?
           └─ Yes → Capitalize per the tables above
           └─ No → Is it a generic noun (report, workspace, expense)?
                    └─ Yes → Lowercase in sentences; capitalize only in nav/tab labels
                    └─ No → Default to sentence case (capitalize the first word only)
```

---

## Common mistakes

| ❌ Wrong | ✅ Right |
| --- | --- |
| expensify card | Expensify Card |
| new expensify | New Expensify |
| concierge | Concierge |
| Quickbooks Online | QuickBooks Online |
| Workspace Admin *(in a sentence)* | workspace admin |
| expense report *(generic noun)* | expense report |
| **SAVE** / Title Case buttons | **Save** |
| "Save" *(with quotes)* | **Save** *(bold, no quotes)* |
| **Save the World** | **Save the world** |
| Company Cards *(when UI says Company cards)* | Match the UI exactly |
| Web / Mobile *(in navigation instructions)* | web / mobile |

---

## Related documents

| Document | Scope |
| --- | --- |
| [HELPSITE_NAMING_CONVENTIONS.md](./HELPSITE_NAMING_CONVENTIONS.md) | UI referencing, buttons, tabs, navigation phrasing |
| [HELP_AUTHORING_GUIDELINES.md](./HELP_AUTHORING_GUIDELINES.md) | Article structure, headings, metadata |
| [TEMPLATE.md](./TEMPLATE.md) | Article template and frontmatter |
| `src/languages/en.ts` | Authoritative app copy for capitalization and UI labels |

When this guide and the live UI disagree, **the live UI wins**. File an issue or update this guide when product copy changes.

---

## Maintenance

Update this guide when:

- New product names or features launch (e.g., new integrations, cards, programs)
- UI labels change in `src/languages/en.ts`
- Marketing introduces new capitalized program names used in help content

Do not auto-generate rules from all of `en.ts` — the file contains sentences, error messages, and marketing copy with different rules than UI labels. Curate changes intentionally.
