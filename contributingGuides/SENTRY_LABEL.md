# The `data-sentry-label` schema

Every pressable component takes a `sentryLabel` prop. On web it is rendered as the `data-sentry-label` attribute. Label values live in `CONST.SENTRY_LABEL`, and the prop's `SentryLabel` type accepts nothing else, so type any prop or map that passes a label along as `SentryLabel` too, not `string`. Don't cast a string to it.

TypeScript requires the label, through the helper types in [`src/types/utils/SentryLabel.ts`](../src/types/utils/SentryLabel.ts). When you write a component that forwards `sentryLabel` to a pressable, give its props one of them:

- `WithRequiredSentryLabel`: every usage passes a label. Use it for components that always handle a press, such as a button that requires `onPress` or a menu that opens itself, and for menu, dropdown and tab items.
- `WithSentryLabelWhenPressable<'onPress' | ...>`: usages that pass one of the listed press handlers must pass a label too, and usages without one need none. Use it for components that can render read-only, such as `MenuItem` or `Button` without `onPress`. To derive another props type from one that uses it, use `DistributedOmit` or `DistributedPick` from type-fest. `Omit` and `Pick` merge the union and silently drop the requirement.
- `WithExplicitSentryLabel`: every usage writes the `sentryLabel` prop, but it may be `undefined`. Use it only for components that other wrappers forward an optional label to, such as the pressables themselves and `Checkbox`. Don't pass `undefined` in app code.

Inputs, such as `TextInput`, and components that fall back to a default label, such as `RadioButton` and `FormProvider`, keep an optional `sentryLabel` (`WithSentryLabel`). In tests and stories, pass `CONST.SENTRY_LABEL.TEST.LABEL`. Neither sends anything to Sentry, so they share one label instead of copying the production ones. Never use it in app code.

The attribute is used by:

- **Sentry**: it puts the label in the description of the INP span (`ui.interaction.*`) as a CSS selector, e.g. `[data-sentry-label="WorkspaceRules-NewRuleMenuItem-FlagForReview"]`. See [INP Improvement workflow](INP_IMPROVEMENT_WORKFLOW.md) for how these spans are analyzed.
- **FullStory**: element definitions in FullStory use the attribute as a CSS selector to identify the elements users interact with.

## Naming

Labels have two or three parts in PascalCase, joined by hyphens:

- `<Area>`: the component or feature that owns the element, e.g. `WorkspaceRules`, `Search`, `NavigationTabBar`.
- `<Action>`: the element within that area, e.g. `NewRuleMenuItem`, `ActionCellAction`, `Inbox`. Where the element is shown goes here too, e.g. `EmptyStateAddExpenseMenu`.
- `<Detail>` (optional): which variant of the element was pressed, e.g. `FlagForReview`, `Submit`.

### Two or three parts

A third part only adds the [`inp.category`](#inpcategory) aggregate: every label is its own series in Sentry either way. So use three parts only when that aggregate means something, which is when one fix would speed up every variant. Ask: if someone made this category's INP faster, would the fix help every item in it?

1. **One JSX element that always does the same thing: two parts.** Sibling buttons on one page are separate elements, even when their names share a prefix: `WorkspaceRules-MerchantRuleSave` and `WorkspaceRules-MerchantRuleDelete`, not `WorkspaceRules-MerchantRule-Save`. When one element switches its handler on a flag, give each handler its own label. When only its copy changes, keep one.
2. **One element rendered as variants picked from a list fixed in code, where the variants cause the same kind of work: three parts**, `<Area>-<Element>-<Variant>`. This covers tabs, option rows that each open a page, a payment method picker, a row action looked up by type (`Search-ActionCellAction-Submit`, `-Approve`, `-Pay`), and bulk actions that update the same list (`WorkspaceTags-BulkActions-Delete`, `-Disable`, `-Enable`). The handlers may differ, as long as the render work is alike.
3. **Menus whose items do unrelated things: two parts for each item**, `<Area>-<Menu><Item>`. This covers "More" and three-dots menus, and any menu that mixes navigation, downloads, modals and deletes: `WorkspaceTags-MoreMenuImportSpreadsheet`, `WorkspaceTags-MoreMenuDownloadCSV`, `WorkspaceList-ThreeDotMenuDuplicate`. An aggregate over them would mix unrelated costs. Keeping the menu in the name still lets you query the whole menu in Sentry with `*WorkspaceTags-MoreMenu*`.
4. **Rows rendered from runtime data (one per workspace, card, member or bank account): one label shared by all rows**, never one label per row. See [No IDs or user data](#no-ids-or-user-data).
5. **Menus that are an area of their own: two parts**, `<Menu>-<Item>`. These are menu components reused across many screens, like `MoreMenu`, `ContextMenu`, `FABMenu`, `NavigationTabBar` and `TabSelector`: `MoreMenu-Delete`, `NavigationTabBar-Inbox`. A page's own "More" menu or tab bar belongs to the page's area instead, and follows 2 or 3. A submenu inside an area menu is an element again: `MoreMenu-AddExpenseMenu-TrackDistance`.
6. **The button that opens a menu gets two parts** of its own, e.g. `WorkspaceTags-BulkActionsDropdown` next to its items `WorkspaceTags-BulkActions-Delete`.

Then check:

- A category needs at least two variants, so an element with one variant gets two parts (`WorkspaceAgents-BulkActionsDelete`). When a second variant is added, rename it to three parts and list the rename in the PR.
- For three-part labels, the variant goes in `<Detail>`, never at the end of `<Action>`: `Report-AttachmentPickerMenu-CreateExpense`, not `Report-AttachmentPickerMenuCreateExpense`. Rule 3 is the exception, because those items aren't variants of one interaction. For a single element, the whole name goes in `<Action>`: `SelectionList-ListHeaderSelectAll`, not `SelectionList-ListHeader-SelectAll`.
- `<Detail>` is the variant, not the place. When the same menu is shown in two places and a press does different work in each, each place gets its own `<Area>-<Action>` (see [step 2 of the INP workflow](INP_IMPROVEMENT_WORKFLOW.md#2-evaluate-whether-the-data-sentry-label-grouping-is-correct)). For example, `Report-EmptyStateAddExpenseMenu-CreateExpense` and `Report-ListFooterAddExpenseMenu-CreateExpense`. When it's the same component doing the same work, e.g. one hook that builds the Pay submenu for several screens, keep one set of labels: Sentry groups INP spans by `transaction` (the page) and FullStory by URL, so each place can still be told apart.

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

A few labels from before these rules don't follow them and are kept to preserve their history. For example, `Search-EmptyState-*` groups unrelated empty state buttons, but FullStory element definitions select it. Don't copy them for new labels.

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
