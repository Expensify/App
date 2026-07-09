# Tech Debt Philosophy
This philosophy guides how we identify, prioritize, and pay down tech debt so it's handled consistently across teams and PRs.

#### Related Philosophies
- [Over-engineering Philosophy](/contributingGuides/philosophies/OVERENGINEERING.md)
- [Small Incremental Releases Philosophy](/contributingGuides/philosophies/INCREMENTAL-RELEASES.md)

#### Terminology
- **Tech debt** - Code, architecture, or process shortcuts taken to ship faster that create extra cost (bugs, slower delivery, harder onboarding) if left unaddressed.

## Rules

### Tech debt MUST be reported as a GitHub issue, not a TODO comment
Do not leave `TODO` comments in the code as a way to track debt. Instead, open a GH issue describing the problem and its impact, and reference it from a code comment if useful context is needed at the call site.

### Example
❌ BAD: `// TODO: refactor this once we have time`
✅ GOOD: A GH issue describing the debt, linked from a short comment if needed

### Tech debt MUST be weighed by impact, not age
Prioritize debt based on how much it's currently costing the team (bug rate, dev velocity, onboarding friction), not on how long it's existed. Old debt that isn't causing pain today is lower priority than newer debt that is.

### Debt introduced to unblock a deploy or fire MUST be paid down promptly
If a shortcut is taken under time pressure (e.g. a deploy blocker fix), the follow-up GH issue MUST be filed immediately and prioritized so it doesn't get forgotten.

### Paying down debt SHOULD be scoped independently from feature work
Do not bundle a debt payoff into an unrelated feature PR. Bundling makes the PR harder to review and harder to revert, and it obscures the cost/benefit of the cleanup itself. File and land the payoff as its own PR.

### Example
❌ BAD: Refactoring a shared component while implementing a new, unrelated feature in the same PR
✅ GOOD: Shipping the feature as-is, then filing a follow-up GH issue and PR for the refactor

### Not all debt SHOULD be paid down
Some debt isn't worth the cost of fixing — e.g. code in a part of the app that's being deprecated, or a shortcut with negligible ongoing impact. Use judgment: paying down debt is itself a cost, and it should only be paid when the return justifies it.

### Debt payoff proposals MUST clarify scope before expanding
If paying down debt reveals a need for larger architectural change, treat that as new work: clarify requirements and get alignment (e.g. via a design doc or Slack discussion) before expanding scope, per the [Over-engineering Philosophy](/contributingGuides/philosophies/OVERENGINEERING.md).
