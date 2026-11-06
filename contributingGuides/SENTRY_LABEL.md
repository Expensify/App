# The `data-sentry-label` schema

Every pressable component takes a `sentryLabel` prop. On web it is rendered as the `data-sentry-label` attribute. Label values live in `CONST.SENTRY_LABEL`, and the prop's `SentryLabel` type accepts nothing else, so type any prop or map that passes a label along as `SentryLabel` too, not `string`. Don't cast a string to it.

Lint (`no-restricted-syntax`) requires the label on every pressable. It also requires it on `Button`, `MenuItem` and the other wrappers that forward it to a pressable whenever they get a press handler, and always on wrappers that handle their own press, like `ThreeDotsMenu`. The lists of wrappers are in `oxlint.config.mts`. When you write a component that forwards `sentryLabel` to a pressable, add it there. Inputs and wrappers that fall back to a default label aren't checked yet. Usages that had no label when the rule was added are grandfathered in the [seatbelt baseline](LINTING.md#seatbelt). Add a label when you touch one.

The attribute is used by:

- **Sentry**: it puts the label in the description of the INP span (`ui.interaction.*`) as a CSS selector, e.g. `[data-sentry-label="WorkspaceRules-NewRuleMenuItem-FlagForReview"]`. See [INP Improvement workflow](INP_IMPROVEMENT_WORKFLOW.md) for how these spans are analyzed.
- **FullStory**: element definitions in FullStory use the attribute as a CSS selector to identify the elements users interact with.

## Naming

Labels have two or three parts in PascalCase, joined by hyphens:

- `<Area>`: the component or feature that owns the element, e.g. `WorkspaceRules`, `Search`, `NavigationTabBar`.
- `<Action>`: the element within that area, e.g. `NewRuleMenuItem`, `ActionCellAction`, `Inbox`. Where the element is shown goes here too, e.g. `EmptyStateAddExpenseMenu`.
- `<Detail>` (optional): which variant of the element was pressed, e.g. `FlagForReview`, `Submit`.

### Two or three parts

Decide by how the element is rendered:

- **Three parts** when one element is rendered as several variants and data decides which one: the items of a menu or dropdown inside an area, rows mapped from a list of options, or a button whose action comes from a lookup (e.g. by action type). Each variant does different work, and their shared `<Area>-<Action>` becomes their [`inp.category`](#inpcategory). Examples: `WorkspaceRules-NewRuleMenuItem-FlagForReview`, `Search-ActionCellAction-Submit`, `Search-CreateMenu-TrackDistance`.
- **Two parts** when the element has its own JSX usage and always does the same thing. Sibling buttons on one page are separate elements, not variants, even when their names share a prefix: `WorkspaceRules-MerchantRuleSave` and `WorkspaceRules-MerchantRuleDelete`, not `WorkspaceRules-MerchantRule-Save`.
- **Two parts** also for the items of a menu that is an area of its own, like `MoreMenu`, `ContextMenu`, `FABMenu` or `NavigationTabBar`: the menu is the `<Area>` and the item is the `<Action>`, e.g. `MoreMenu-Delete`, `NavigationTabBar-Inbox`. A submenu inside it is an element again, so its items get three parts: `MoreMenu-AddExpenseMenu-TrackDistance`.

Then check:

- A category needs at least two variants. An element with one variant gets two parts.
- The variant goes in `<Detail>`, never at the end of `<Action>`: `Report-AttachmentPickerMenu-CreateExpense`, not `Report-AttachmentPickerMenuCreateExpense`. For a single element, the whole name goes in `<Action>`: `SelectionList-ListHeaderSelectAll`, not `SelectionList-ListHeader-SelectAll`.
- `<Detail>` is the variant, not the place. When the same menu is shown in two places, each place gets its own `<Area>-<Action>`, because the same press does different work in each (see [step 2 of the INP workflow](INP_IMPROVEMENT_WORKFLOW.md#2-evaluate-whether-the-data-sentry-label-grouping-is-correct)). For example, `Report-EmptyStateAddExpenseMenu-CreateExpense` and `Report-ListFooterAddExpenseMenu-CreateExpense`.

In `CONST.SENTRY_LABEL`, put the variants of one element in a nested object keyed by variant, and keep single elements as flat keys:

```ts
SEARCH: {
    ACTION_CELL_VIEW: 'Search-ActionCellView',
    ACTION_CELL_ACTION: {
        SUBMIT: 'Search-ActionCellAction-Submit',
        APPROVE: 'Search-ActionCellAction-Approve',
    },
},
```

`tests/unit/SentryLabelSchemaTest.ts` fails when a label doesn't have two or three PascalCase parts, or when a category has only one variant.

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
