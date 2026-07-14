# Tech Debt Philosophy
This philosophy guides how we identify, prioritize, and remove tech debt so it's handled consistently.

#### Related Philosophies
- [Over-engineering Philosophy](/contributingGuides/philosophies/OVERENGINEERING.md)
- [Small Incremental Releases Philosophy](/contributingGuides/philosophies/INCREMENTAL-RELEASES.md)

#### Terminology
- **Tech debt** - Code, architecture, or process shortcuts taken to ship faster or stale and outdated code that create extra cost (bugs, slower delivery, harder onboarding) if left unaddressed.

## Rules

### Tech debt MUST be reported as a GitHub issue, not a TODO comment
Do not leave `TODO` comments in the code as a way to track debt. Instead, open a GH issue describing the problem and its impact, and reference it from a code comment if useful context is needed at the call site.

### Example
❌ BAD: `// TODO: refactor this once we have time`
✅ GOOD: A GH issue describing the work that needs to be done, linked from a short comment if needed

### Tech debt introduced to unblock a deploy or fire MUST be fixed promptly
If a shortcut is taken under time pressure (e.g. a deploy blocker fix), the follow-up GH issue MUST be filed immediately and prioritized so it doesn't get forgotten and becomes a bad pattern to be followed.

### Fixing tech debt SHOULD be scoped independently from feature work
Do not bundle a tech debt fix into an unrelated feature PR. Bundling makes the PR harder to review and harder to revert, and it obscures the cost/benefit of the cleanup itself. Work on the fix as its own PR.

### Example
❌ BAD: Refactoring a shared component while implementing a new, unrelated feature in the same PR
✅ GOOD: Refactoring the tech debt in one PR and then shipping the feature on a follow-up PR.
