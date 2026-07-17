# Technical Debt Philosophy
This philosophy guides how we identify, prioritize, and remove technical debt so it's handled consistently.

#### Related Philosophies
- [Over-engineering Philosophy](/contributingGuides/philosophies/OVERENGINEERING.md)
- [Small Incremental Releases Philosophy](/contributingGuides/philosophies/INCREMENTAL-RELEASES.md)

#### Terminology
- **Technical debt** - Code, architecture, or process decisions - whether shortcuts taken to ship faster or necessary tradeoffs made to ship smoothly - that become stale or outdated and create extra cost (bugs, slower delivery, harder onboarding) if left unaddressed.

## Rules

### Technical debt MUST be reported as a GitHub issue, not a TODO comment
Do not leave `TODO` comments in the code as a way to track debt. Instead, open a GH issue describing the problem and its impact, and reference it from a code comment if useful context is needed at the call site. Note: our AI reviewer already flags some inline TODOs, but a tracked GH issue remains the source of truth for the work.

### Example
❌ BAD: `// TODO: refactor this once we have time`

✅ GOOD: A GH issue describing the work that needs to be done, linked from a short comment if needed

### Technical debt introduced to unblock a deploy or fire MUST be fixed promptly
If a shortcut is taken under time pressure (e.g. a deploy blocker fix), the follow-up GH issue MUST be filed immediately, assigned, and prioritized based on the urgency of the underlying issue, so it doesn't get forgotten and become a bad pattern that spreads to other parts of the codebase.

### Fixing technical debt SHOULD be scoped independently from feature work
Do not bundle a technical debt fix into an unrelated feature PR. Bundling makes the PR harder to review and harder to revert, and it obscures the cost/benefit of the cleanup itself. Work on the fix as its own PR.

### Example
❌ BAD: Refactoring a shared component while implementing a new, unrelated feature in the same PR

✅ GOOD: Refactoring the technical debt in one PR and then shipping the feature on a follow-up PR.
