# PopoverMenu (v2)

Compound popover-menu primitives. Inspired by Radix DropdownMenu, adapted for React Native.

## Contract

- **Uncontrolled.** Visibility lives inside `<Root>`; seed the initial state with `<Root defaultOpen?>`. Triggers open it; item selection (unless its handler calls `event.preventDefault()`), screen blur, or modal-stack cover close it. Observe via `useIsPopoverVisible()`.
- **Hierarchy enforced at render.** Misuse throws synchronously in dev *and* staging — e.g. `<PopoverMenu.Item> must be rendered inside <PopoverMenu.Content>`.
- **Triggers publish via context, not `cloneElement`.** `<Trigger>` and `<SecondaryInteractionTrigger>` publish their handler plus shared accessibility metadata into `PressResponderContext` (a project-level primitive at `src/components/Pressable/PressResponder/`) — see the [pressable consumption table](#pressables-that-consume-pressrespondercontext).
- **Sub-level: wrapper + hook.** `<Sub.Trigger>` / `useSubTrigger` and `<Sub.BackButton>` / `useSubBackButton` ship both layers — opinionated `MenuItem` for the canonical row, hook for non-`MenuItem` shapes.

## Usage

```tsx
import * as PopoverMenu from '@components/PopoverMenu/v2';

<PopoverMenu.Root>
    <PopoverMenu.Trigger>
        <PressableWithFeedback
            onPress={() => {}}
            accessibilityLabel="Open menu"
            sentryLabel="MyTrigger"
        >
            <Icon />
        </PressableWithFeedback>
    </PopoverMenu.Trigger>

    <PopoverMenu.Content>
        <PopoverMenu.Header>Menu title</PopoverMenu.Header>
        <PopoverMenu.Item text="Edit" onSelect={...} />
        <PopoverMenu.Separator />

        <PopoverMenu.Sub id="more">
            <PopoverMenu.Sub.Trigger text="More" />
            <PopoverMenu.Sub.Content>
                <PopoverMenu.Sub.BackButton />
                <PopoverMenu.Item text="Archive" onSelect={...} />
            </PopoverMenu.Sub.Content>
        </PopoverMenu.Sub>
    </PopoverMenu.Content>
</PopoverMenu.Root>
```

### Root — `<Root defaultOpen?: boolean>`

Owns visibility state. `defaultOpen` seeds the initial open state; there is no `open` / `onOpenChange` (uncontrolled-only).

### Triggers

- **`<Trigger>`** — primary trigger. Render any subtree containing a `<PressableWithFeedback>`. The pressable's `onPress` (if supplied) runs *before* the popover opens; call `event.preventDefault()` synchronously inside `onPress` to gate the open.
- **`<SecondaryInteractionTrigger>`** — long-press (native) / right-click (web). Always opens; the framework reserves `event.preventDefault()` for OS-level long-press / context-menu suppression so it cannot double as a consumer gate. Conditional opening means conditionally rendering the trigger or doing the work inside the consumer's `onSecondaryInteraction`. Web anchors at a 1×1 rect at the cursor; native at the pressable's bounding rect.
- **`<Sub.Trigger>` / `useSubTrigger({disabled?, text?})`** — drill-down row inside `<Sub>`. The hook returns `{ref, onPress, onFocus, focused, isAtActiveLevel}` for non-`MenuItem` shapes.
- **`<Sub.BackButton text?>` / `useSubBackButton()`** — back row inside `<Sub.Content>`. The wrapper's `text` prop defaults to a localized "Go back" and drives the rendered row label. Self-gates to the active sub-level. The hook takes no params (back buttons stay out of typeahead so a "g" keypress doesn't focus the back button on every drilled-in level) and returns the same shape as `useSubTrigger`.

#### Pressables that consume `PressResponderContext`

| Pressable | Consumes |
|---|---|
| `<PressableWithFeedback>` | `onPress`, `ref`, `accessibilityState`, `accessibilityHasPopup`, `nativeID`, `accessibilityControls` |
| `<PressableWithSecondaryInteraction>` | `onSecondaryInteraction` (its inner `<PressableWithFeedback>` independently consumes the remaining props from the same context) |

Raw RN `<Pressable>` / `<TouchableOpacity>` do **not** consume the responder — wrap them in one of the above or call `usePressResponderProps` / `useResponderRef` directly in a custom pressable. Without a consumer, the trigger renders but pressing does nothing (the published `onPress` reaches no descendant).

### Rows

All rows except `<Group>` auto-hide outside the active sub-level.

- **`<Item text onSelect? disabled?>`** — selectable row. Closes the menu after `onSelect`; consumer's `event.preventDefault()` synchronously inside `onSelect` keeps it open. `onSelect` receives an `ItemSelectEvent` (custom event exposing `preventDefault()` / `isDefaultPrevented()` — synchronous-only).
- **`<RadioItem text isSelected? onSelect? disabled? rightIcon?>`** — single-select row with a radio indicator. Pass `rightIcon` to replace the indicator.
- **`<Header>children</Header>`** — heading-role title (`accessibilityRole="heading"`, level 3). To title a sub, render inside `<Sub.Content>`.
- **`<Label text>`** — non-interactive labelled row.
- **`<Separator />`** — horizontal divider.
- **`<Group>children</Group>`** — ARIA `role="group"` wrapper (web-only — react-native-web maps the `role` prop to the DOM attribute; iOS / Android RN don't expose ARIA grouping). Stays mounted across sub-navigation so nested `<Sub>` descendants don't unmount when the user drills in or out.

### Sub-menus

`<Sub>` declares one nested sub-menu level and provides its identity context. Each `<Sub>` accepts:

- **`<Sub.Trigger>`** — the row that drills into the sub.
- **`<Sub.Content>`** — wraps the sub's content. Stays mounted at ancestor levels so deeper subs survive when a shallower sub is the currently-active level (back-button pops one level instead of collapsing to root). Render `<Sub.BackButton>` as the first child here — the visual idiom places back rows at the top of the active sub panel.
- **`<Sub.BackButton>`** — back row that pops one level.

Subs nest arbitrarily — render a `<Sub>` inside another `<Sub.Content>` to declare a deeper level. `<Sub.BackButton>` always pops one level (to the parent sub, or to root from the outermost).

**`<Sub id>`** — required stable identifier. Pass a stable string (literal or memoized) — sub-navigation state is keyed by it, and `useId()` would rotate on each fresh mount.

### Row composition — `useSelectableRow({onSelect?, disabled?, text?})`

Returns `{ref, onPress, onFocus, focused, isAtActiveLevel}` for composing any pressable as a selectable row inside `<Content>`. The menu closes after `onSelect` fires; call `event.preventDefault()` synchronously inside `onSelect` to keep it open. `text` is stored on the registered focusable item (for the focus registry's label). `<Item>` and `<RadioItem>` ship the canonical `MenuItem` shapes.

### Custom non-row content — `useIsAtActiveLevel()`

Hook for self-gating custom (non-row) content rendered directly inside `<Content>` or `<Sub.Content>`. Returns `true` when the enclosing `<Sub>`'s id is the current sub-level (or when the consumer is at the top level and no sub is active). Custom content should render `null` when this is `false` so siblings at other levels don't show through. Requires `<Content>`; `<Sub>` is optional (top-level use returns `true` when no sub is active).

### Visibility observation — `useIsPopoverVisible()`

Reads `Root`'s `isVisible`. Throws outside `<Root>`. Use to drive trigger UI that depends on menu state (active-state icon color, controls staying visible while open).

### Programmatic close — `useClosePopover()`

Returns `() => void` for descendants that need to close from custom logic (async work completion, deep-link change). Throws outside `<Content>`. Item selection already routes through close; only reach for this hook when no item triggered the close.

### Keyboard (web)

When `<Content>` is open, ArrowUp / ArrowDown move focus among registered rows in DOM order, skipping disabled rows; Enter activates the focused row. Native platforms rely on OS focus traversal — these key handlers are no-ops.

### Lifecycle closes

- **Screen blur** — via `navigation.addListener('blur', …)`.
- **Modal-stack cover** — when a non-popover alert modal becomes visible over the popover (`willAlertModalBecomeVisible && !isPopover`).

Both fire inside `<Content>` (the layer where the atomic `close()` is in scope), so adding a `<Content>` automatically opts into them.

### Content variants

- **`<Content>`** — for menus that fit the viewport.
- **`<ScrollableContent>`** — wraps children in a `<ScrollView>` capped at window height; use when the row count is bounded but may exceed the viewport.

### Anchor

The pressable consuming the `<Trigger>` / `<SecondaryInteractionTrigger>` context is the anchor — no separate `<Anchor>` slot, no `anchorRef` prop. The trigger captures `getBoundingClientRect()` on press; `<SecondaryInteractionTrigger>` on web captures a 1×1 rect at `MouseEvent.pageX/pageY` instead. Multiple triggers in one `<Root>` are supported; the popover anchors to whichever was pressed last.

> **Runtime requirement.** Uses `View.getBoundingClientRect()` and `View.compareDocumentPosition()` — exposed by `ReadOnlyElement` on Fabric. Old Architecture is not supported.

## Folder layout

Grouped by feature. Each subfolder re-exports its public surface through a barrel (`index.ts`); the top-level [`index.tsx`](./index.tsx) re-exports each barrel.

- **`root/`** — `<Root>`, the trigger wrappers (`<Trigger>`, `<SecondaryInteractionTrigger>`), `useIsPopoverVisible`, and `useAnchorOpener` (internal).
- **`content/`** — `<Content>`, `<ScrollableContent>`, `useClosePopover`, `<BaseContent>` (internal), `useContentController` (internal), and the close-lifecycle hooks (internal).
- **`rows/`** — leaf rows (`<Item>`, `<RadioItem>`, `<Label>`, `<Header>`, `<Separator>`, `<Group>`), `useSelectableRow`, and `useFocusableRow` (internal).
- **`sub/`** — `<Sub>` and its compound members `<Sub.Trigger>` / `<Sub.Content>` / `<Sub.BackButton>`, plus `useSubTrigger` / `useSubBackButton` and `useIsAtActiveLevel`.

Each file carries a header comment describing its role — treat that as the source of truth, not this README.

## Architectural rules

| Component / Hook | Must be rendered / called inside |
|---|---|
| `Trigger`, `SecondaryInteractionTrigger`, `useIsPopoverVisible` | `Root` |
| `Content`, `ScrollableContent` | `Root` |
| `Item`, `RadioItem`, `Label`, `Header`, `Separator`, `Group`, `Sub`, `useSelectableRow`, `useClosePopover`, `useIsAtActiveLevel` | `Content` (anywhere inside it, including within `<Sub.Content>`) |
| `Sub.Trigger`, `Sub.Content`, `Sub.BackButton`, `useSubTrigger`, `useSubBackButton` | `Sub` (which itself must be inside `Content`) |

Violations throw synchronously during render — not `__DEV__`-gated.
