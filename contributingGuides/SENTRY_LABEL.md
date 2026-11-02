# The `data-sentry-label` schema

Every pressable component takes a `sentryLabel` prop. On web it is rendered as the `data-sentry-label` attribute. Label values live in `CONST.SENTRY_LABEL`.

The attribute is used by:

- **Sentry**: it puts the label in the description of the INP span (`ui.interaction.*`) as a CSS selector, e.g. `[data-sentry-label="WorkspaceRules-NewRuleMenuItem-FlagForReview"]`. See [INP Improvement workflow](INP_IMPROVEMENT_WORKFLOW.md) for how these spans are analyzed.
- **FullStory**: element definitions in FullStory use the attribute as a CSS selector to identify the elements users interact with.

## Naming

Labels follow the `<Area>-<Action>-<Detail>` schema, with each part in PascalCase:

- `<Area>`: the component or feature that owns the element, e.g. `WorkspaceRules`, `SelectionList`, `NavigationTabBar`.
- `<Action>`: the element or kind of interaction within that area, e.g. `NewRuleMenuItem`, `ListHeader`.
- `<Detail>`: the concrete variant of the action, e.g. `RestrictCardSpend`, `FlagForReview`, `SelectAll`.

Use the `<Detail>` part whenever one element triggers fundamentally different work depending on its variant (see [step 2 of the INP workflow](INP_IMPROVEMENT_WORKFLOW.md#2-evaluate-whether-the-data-sentry-label-grouping-is-correct)). For example, the items of the new rule menu in workspace rules are labeled `WorkspaceRules-NewRuleMenuItem-RestrictCardSpend`, `WorkspaceRules-NewRuleMenuItem-FlagForReview` and so on, rather than a single `WorkspaceRules-NewRuleMenuItem`. Elements with a single kind of interaction can keep a two-part `<Area>-<Action>` label, e.g. `NavigationTabBar-Inbox`.

Renaming a label starts a new series in Sentry and loses its history, and it breaks the FullStory element definitions that select it. List renamed labels in the PR description.

## `inp.category`

For labels with exactly three parts, the [`attachInpCategory`](https://github.com/Expensify/App/blob/main/src/libs/telemetry/middlewares/attachInpCategory.ts) middleware stamps `<Area>-<Action>` as the `inp.category` attribute on the INP span. For example, `WorkspaceRules-NewRuleMenuItem-FlagForReview` gets the `WorkspaceRules-NewRuleMenuItem` category. The Sentry INP dashboard groups spans by `inp.category` to show the aggregated INP of all variants of an interaction. Labels with any other number of parts get no category.

Keep the `<Area>-<Action>` prefix the same for all variants of one interaction, so they land in the same category.

## No IDs or user data

Labels must be built only from constants, never from runtime values. Never build a label from IDs (report, transaction, policy, account), names, emails, amounts or any other user data. Labels are sent to Sentry and FullStory, and dynamic values would both leak user data and split one interaction into a separate series per value.

Usually the label is a single `CONST.SENTRY_LABEL` value. A component that renders an inner pressable may derive that pressable's label from the label it received by appending a fixed PascalCase suffix to the last part, e.g. `${sentryLabel}ClearButton`. Don't append it as a new part (`${sentryLabel}-ClearButton`): the derived label then has a different number of parts than the original, so it gets a category the original doesn't have, or loses the one it has.
