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

## Labels on wrappers that are not pressable

On web, Sentry builds the selector from the nearest element with a `data-sentry-label`. When that element is the pressable that handled the interaction, the selector is the label alone, e.g. `[data-sentry-label="SaveButton"]`. When the label is on a wrapper that is not a pressable, such as a `View` around a composer, Sentry keeps the CSS path to the inner element that was hit, so clicks on the same wrapper end up under different selectors.

To report such a wrapper with its label alone, set `sentryLabelExact: true` next to the label in its `dataSet`, which renders `data-sentry-label-exact="true"`:

```tsx
<View dataSet={{sentryLabel: CONST.SENTRY_LABEL.CONCIERGE_PROMPT_BOX.INPUT, sentryLabelExact: true}}>
```

The flag is read by our patch of `@sentry/browser-utils`, see [patches/sentry-browser-utils/details.md](../patches/sentry-browser-utils/details.md).

## No IDs or user data

Labels must be built only from constants, never from runtime values. Never build a label from IDs (report, transaction, policy, account), names, emails, amounts or any other user data. Labels are sent to Sentry and FullStory, and dynamic values would both leak user data and split one interaction into a separate series per value.

Every label is a single `CONST.SENTRY_LABEL` value, written out in full. Don't derive a label from another one, e.g. by appending a suffix to the label a component received: the result can't be found by searching the code for what Sentry shows, and with a three-part label the derived one lands in the original's category even though it is a different interaction. When a component renders an inner pressable, give that pressable a label of its own. For example, a text input's clear button is labeled `TextInput-ClearButton` by default. When callers need to tell one apart, add a separate prop for its label rather than deriving it, like `clearButtonSentryLabel`, which `DatePicker` sets to `DatePicker-ClearButton`.

On native, [`touchEventBoundaryProps.ts`](https://github.com/Expensify/App/blob/main/src/libs/telemetry/touchEventBoundaryProps.ts) drops any label that is not a `CONST.SENTRY_LABEL` value, so a label built at runtime is never reported there.
