# Technical Debt Philosophy
This philosophy guides how we identify, prioritize, and remove technical debt so it's handled consistently.

#### Related Philosophies
- [Over-Engineering Philosophy](/contributingGuides/philosophies/OVERENGINEERING.md)
- [Small Incremental Releases Philosophy](/contributingGuides/philosophies/INCREMENTAL-RELEASES.md)

#### Terminology
- **Technical debt** - Code, architecture, or process decisions - whether shortcuts taken to ship faster or necessary tradeoffs made to ship smoothly - that become stale or outdated and create extra cost (bugs, slower delivery, harder onboarding) if left unaddressed.

## Rules

### Technical debt MUST be reported as a GitHub issue, not a TODO comment
Do not leave `TODO` comments in the code as a way to track debt. Instead, open a GH issue describing the problem and its impact, and reference it from a code comment if useful context is needed at the call site.

### Example
❌ BAD: `// TODO: refactor this once we have time`

✅ GOOD: A GH issue describing the work that needs to be done, linked from a short comment if needed

### Technical debt introduced to unblock a deploy or fire MUST be fixed promptly
If a shortcut is taken under time pressure (e.g., a deploy blocker fix), the follow-up GH issue MUST be filed immediately, assigned, and labeled Daily and Fire-Cleanup so it's addressed with urgency.

### How to prioritize it
Match the priority label to the risk the technical debt introduces, not just how inconvenient it is to fix:
- `Daily`/`Weekly` - the debt touches high-traffic or fragile code, or could mask a regression.
- `Monthly` - the debt is low-risk (e.g. a naming inconsistency or an isolated one-off).

### Consequences of not prioritizing it
- The technical debt is forgotten and becomes permanent.
- Other engineers/agents copy it elsewhere, treating it as an accepted pattern.
- The original context is lost over time, making the eventual fix more expensive and riskier than fixing it promptly would have been.
- The code becomes harder to read and reason about.

### Fixing technical debt SHOULD be scoped independently from feature work
Do not bundle a technical debt fix into an unrelated feature PR. Bundling makes the PR harder to review and harder to revert, and it's easier to miss subtle or unintentional business logic changes. Work on the fix as its own PR.

### Example
❌ BAD: Refactoring a shared component while implementing a new, unrelated feature in the same PR

✅ GOOD: Refactoring the technical debt in one PR and then shipping the feature on a follow-up PR.
