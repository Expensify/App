# PopoverMenu (v2)

Compound popover-menu primitives — uncontrolled by design. Inspired by [Radix DropdownMenu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) — same anatomy, same composition rules — adapted for React Native and React Compiler.

## Goals

- **Uncontrolled by design.** Visibility lives inside `<Root>`. The `<Trigger>` and `<SecondaryInteractionTrigger>` slot wrappers open it on press; item selection / item-handler `event.preventDefault()` / screen blur / modal-stack cover close it. Callers observe via `useIsPopoverVisible()` when they need to coordinate UI (e.g. keep video controls visible while menu is open).
- **Composition over configuration.** Behaviour is selected by which components you compose, not by boolean props on a monolithic component (`Content` vs `ScrollableContent`, `<Header>` instead of `headerText`, etc.).
- **Structural insulation from re-renders.** Triggers don't re-render when content state (sub navigation, focus) changes. Achieved by splitting state into separate contexts (`RootState/Actions`, `ContentNavigation/Focus/Actions`, `Sub`).
- **Always-on hierarchy assertions.** Misuse fails loud at render time with a descriptive error (`<PopoverMenu.Item> must be rendered inside <PopoverMenu.Content>`), in dev *and* staging. The throws are emitted by the existing context-consumer hooks (`useRootState`, `useContentActions`, `useSubContext`, …) — no separate assertion layer.
- **No manual memoization.** All files in this folder compile under React Compiler — no `useCallback` / `useMemo` / `React.memo`.
- **Trigger slot via `cloneElement`.** `<Trigger>` and `<SecondaryInteractionTrigger>` clone their single pressable child and merge a ref + an `onPress` (or `onSecondaryInteraction`) wrapper that opens the popover. The wrapper does not render its own element. Verified to compile under React Compiler.
- **Sub-level wrapper-plus-hook.** `<Sub.Trigger>` / `useSubTrigger` and `<Sub.BackButton>` / `useSubBackButton` ship in two layers — opinionated `MenuItem` wrapper for the canonical row, hook for non-`MenuItem` shapes. Same intent as React Aria's `useMenuTrigger` + `<MenuTrigger>`. The Root-level triggers don't carry sibling hooks because their canonical visual is just "any pressable", which the slot wrapper already accepts directly.

## Public API

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

        <PopoverMenu.Sub>
            <PopoverMenu.Sub.Trigger text="More" />
            <PopoverMenu.Sub.Content>
                <PopoverMenu.Sub.BackButton text="Back" />
                <PopoverMenu.Item text="Archive" onSelect={...} />
            </PopoverMenu.Sub.Content>
        </PopoverMenu.Sub>
    </PopoverMenu.Content>
</PopoverMenu.Root>
```

### Triggers

`<Trigger>` and `<SecondaryInteractionTrigger>` are slot wrappers — they don't render their own pressable; they `cloneElement` their single child and merge a ref + an `onPress` (or `onSecondaryInteraction`) handler that opens the popover. The child supplies its own pressable shape, accessibility metadata, and styling.

- **`<PopoverMenu.Trigger>`** — primary trigger. Child must be a single React element with `onPress: (event?) => void`. The slotted child's `onPress` runs *before* the popover opens; consumers can call `event.preventDefault()` inside their `onPress` to gate the open (matches `<Item onSelect>`'s contract).
- **`<PopoverMenu.SecondaryInteractionTrigger>`** — long-press (native) / right-click (web) variant. Child must supply `onSecondaryInteraction: (event) => void`. Same gating contract via `event.preventDefault()`.
- **`<PopoverMenu.Sub.Trigger>` / `useSubTrigger({disabled?})`** — sub-level analogue. The wrapper renders an opinionated `MenuItem` drill-down row; the hook returns `{ref, onPress, onFocus, focused, isAtActiveLevel}` to compose any pressable as a sub trigger.
- **`<PopoverMenu.Sub.BackButton>` / `useSubBackButton()`** — sub-level back button. Render it as a child of `<Sub.Content>` (matches Radix / React Aria explicit-composition); the wrapper self-gates to the active level so siblings at ancestor levels stay mounted without rendering. Hook returns `{ref, onPress, onFocus, focused, isAtActiveLevel}` for non-`MenuItem` shapes.

### Row composition — `useSelectableRow({onSelect?, disabled?})`

Returns `{ref, onPress, onFocus, focused, isAtActiveLevel}` to compose any pressable as a selectable row inside `<Content>` / `<ScrollableContent>`. The menu closes after `onSelect` fires; call `event.preventDefault()` inside `onSelect` to keep it open. The opinionated `MenuItem` shapes ship as `<Item>` and `<CheckmarkItem>` for the canonical cases; reach for the hook when you need a non-`MenuItem` row (a `Button`-styled option, custom layout, etc.).

#### Conditional opening (gating via `preventDefault`)

The slot wrapper calls the consumer's `onPress` first, then opens — unless the consumer called `event.preventDefault()`. Mirrors `<Item onSelect>`'s existing pattern.

```tsx
function MoreMenuTrigger({videoPlayerRef, url}) {
    const handlePress = (event) => {
        if (!videoPlayerRef.current) {
            event?.preventDefault();
            return;
        }
        updateSource(url);
    };
    return (
        <PopoverMenu.Trigger>
            <IconButton onPress={handlePress} src={ThreeDots} tooltipText="..." />
        </PopoverMenu.Trigger>
    );
}
```

### Visibility observation — `useIsPopoverVisible()`

Reads `Root`'s `isVisible` for descendants that want to render trigger UI based on popover state (active-state icon color, video controls staying visible while menu is open, etc.). Throws if called outside `<Root>`.

### Programmatic close — `useClosePopover()`

Returns `() => void` for descendants that need to close the popover from custom logic (async work completion, deep-link change, app entering background, etc.). Throws if called outside `<Content>`. Item selection's built-in close already routes through this — only reach for the hook when no item-press triggered the close.

### Lifecycle closes (built into `<Root>`)

- **Screen blur** — subscribes via `navigation.addListener('blur', …)` (per [react-navigation guidance](https://reactnavigation.org/docs/use-focus-effect/)) so navigating away never leaves a stranded menu.
- **Modal-stack cover** — when a non-popover alert modal is about to cover the popover (`willAlertModalBecomeVisible && !isPopover`), `<Root>` closes via render-phase auto-correction.

No `shouldOverlay` opt-out: item selection closes the popover synchronously in the event handler, so no v1-style timing race exists.

### Content variants

Two variants cover the bounded-N regime:

- **`<Content>`** — fits content; default. Use when the menu has bounded rows that comfortably fit (≤ ~20 typical).
- **`<ScrollableContent>`** — wraps children in a `<ScrollView>` capped at window height. Use when N is bounded but might exceed viewport.

### Anchor

The pressable cloned by `<Trigger>` (or `<SecondaryInteractionTrigger>`) IS the anchor — there is no separate `<Anchor>` slot, no `anchorRef` prop, no `anchorPosition` prop. The trigger captures `getBoundingClientRect()` on press and publishes the rect to context. Multiple triggers in one `<Root>` are supported; the popover anchors to whichever was pressed last.

## Folder layout

Grouped by feature, not by file type. Each subfolder owns its components, contexts, and hooks, and re-exports its public surface through a barrel (`index.ts`); the top-level [`index.tsx`](./index.tsx) re-exports each barrel.

- **`root/`** — `<Root>` provider, the trigger slot wrappers (`<Trigger>`, `<SecondaryInteractionTrigger>`), the visibility hook (`useIsPopoverVisible`), and the shared anchor-opener helper.
- **`content/`** — public surface variants (`<Content>`, `<ScrollableContent>`) plus the internal scaffolding they share.
- **`rows/`** — leaf rows rendered inside content (`<Item>`, `<CheckmarkItem>`, `<Label>`, `<Header>`, `<Separator>`, `<Group>`).
- **`sub/`** — `<Sub>` plus its compound members `<Sub.Trigger>` and `<Sub.Content>`.

Each file carries a high-level header comment describing its role; treat that as the source of truth, not this README.

### Conventions

- **Public vs private boundary is a barrel.** Anything not re-exported from a folder's `index.ts` is implementation detail. External consumers should only deep-import in tests, and only after a deliberate review.
- **Hooks live next to the data they touch.** `useFocusableRow` lives in `rows/` because it's the registration API rows use; `useOrderedIDs` lives in `content/` because the registry it sorts is owned by `Content`.
- **Dependency direction (file-level, no cycles).** `root/` imports nothing else in v2; `content/` imports from `root/`; `sub/` and `rows/` import from `content/` and `root/`, plus a narrow cross-edge: `rows/useSelectableRow` reads `sub/SubContext`, and `sub/SubTrigger` + `sub/SubBackButton` read `rows/useFocusableRow`.

## Architectural rules

These are enforced at runtime — not just by convention.

| Component / Hook | Must be rendered / called inside |
|---|---|
| `Trigger`, `SecondaryInteractionTrigger`, `useIsPopoverVisible` | `Root` |
| `Content`, `ScrollableContent` | `Root` |
| `Item`, `CheckmarkItem`, `Label`, `Header`, `Separator`, `Group`, `Sub`, `useSelectableRow`, `useClosePopover` | `Content` or `ScrollableContent` (transitively, including inside `<Sub.Content>`) |
| `Sub.Trigger`, `Sub.Content`, `Sub.BackButton`, `useSubTrigger`, `useSubBackButton` | `Sub` |

Violating any of these throws synchronously during render. The exception isn't `__DEV__`-gated, so a slip past local dev fails loudly on staging instead of silently corrupting layout.
