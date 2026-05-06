# PopoverMenu (v2)

Compound popover-menu primitives — uncontrolled by design. Inspired by [Radix DropdownMenu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) — same anatomy, same composition rules — adapted for React Native and React Compiler.

## Goals

- **Uncontrolled by design.** Visibility lives inside `<Root>`. Triggers open it via the `usePopoverTrigger()` hook; item selection / item-handler `event.preventDefault()` / screen blur / modal-stack cover close it. Callers observe via `useIsPopoverVisible()` when they need to coordinate UI (e.g. keep video controls visible while menu is open).
- **Composition over configuration.** Behaviour is selected by which components you compose, not by boolean props on a monolithic component (`Content` vs `ScrollableContent`, `<Header>` instead of `headerText`, etc.).
- **Structural insulation from re-renders.** Triggers don't re-render when content state (sub navigation, focus) changes. Achieved by splitting state into separate contexts (`RootState/Actions`, `ContentNavigation/Focus/Actions`, `Sub`).
- **Always-on hierarchy assertions.** Misuse fails loud at render time with a descriptive error (`<PopoverMenu.Item> must be rendered inside <PopoverMenu.Content>`), in dev *and* staging. The throws are emitted by the existing context-consumer hooks (`useRootState`, `useContentActions`, `useSubContext`, …) — no separate assertion layer.
- **No manual memoization.** All files in this folder compile under React Compiler — no `useCallback` / `useMemo` / `React.memo`.
- **No `<Trigger>` slot via `cloneElement`.** Trigger composition is hook-based (`usePopoverTrigger` returns `{ref, onPress}`) because React Compiler rejects refs passed through `cloneElement`. JSX `ref={ref}` attachment is the only compiler-clean path; it also keeps the consumer's pressable as the trigger element with no wrapper introduced.

## Public API

```tsx
import * as PopoverMenu from '@components/PopoverMenu/v2';

function MyTrigger() {
    const {ref, onPress} = PopoverMenu.usePopoverTrigger();
    return (
        <PressableWithFeedback ref={ref} onPress={onPress} accessibilityLabel="Open menu" sentryLabel="MyTrigger">
            <Icon />
        </PressableWithFeedback>
    );
}

<PopoverMenu.Root>
    <MyTrigger />

    <PopoverMenu.Content>
        <PopoverMenu.Header>Menu title</PopoverMenu.Header>
        <PopoverMenu.Item text="Edit" onSelect={...} />
        <PopoverMenu.Separator />

        <PopoverMenu.Sub>
            <PopoverMenu.Sub.Trigger text="More" />
            <PopoverMenu.Sub.Content>
                <PopoverMenu.Item text="Archive" onSelect={...} />
            </PopoverMenu.Sub.Content>
        </PopoverMenu.Sub>
    </PopoverMenu.Content>
</PopoverMenu.Root>
```

### Trigger hooks

- **`usePopoverTrigger()`** — primary trigger. Returns `{ref, onPress}` to attach to any pressable (`PressableWithFeedback`, `Button`, `MenuItem`, custom). Captures the pressable's bounding rect on press and opens the popover.
- **`useSecondaryInteractionTrigger()`** — same shape with `onSecondaryInteraction` instead of `onPress`. For long-press (native) / right-click (web), e.g. saved-search row navigates on tap, opens overflow on long-press.

If the consumer's pressable already has its own handler, compose explicitly:
```tsx
const trigger = PopoverMenu.usePopoverTrigger();
const handlePress = (e) => { myWork(e); trigger.onPress(); };
<PressableWithFeedback ref={trigger.ref} onPress={handlePress} ... />
```

### Visibility observation — `useIsPopoverVisible()`

Reads `Root`'s `isVisible` for descendants that want to render trigger affordances (active-state icon color, video controls staying visible while menu is open, etc.). Throws if called outside `<Root>`.

### Lifecycle closes (built into `<Root>`)

- **Screen blur** — subscribes via `navigation.addListener('blur', …)` (per [react-navigation guidance](https://reactnavigation.org/docs/use-focus-effect/)) so navigating away never leaves a stranded menu.
- **Modal-stack cover** — when a non-popover alert modal is about to cover the popover (`willAlertModalBecomeVisible && !isPopover`), `<Root>` closes via render-phase auto-correction.

No `shouldOverlay` opt-out: item selection closes the popover synchronously in the event handler, so no v1-style timing race exists.

### Content variants

Three variants cover the full N regime:

- **`<Content>`** — fits content; default. Use when the menu has bounded rows that comfortably fit (≤ ~20 typical).
- **`<ScrollableContent>`** — wraps children in a `<ScrollView>` capped at window height. Use when N is bounded but might exceed viewport.
- **`<VirtualizedContent>`** — FlashList-backed; takes `data` + `keyExtractor` + `renderItem` instead of children. Use when N is genuinely unbounded (hundreds+). Constraints: only `<Item>`/`<CheckmarkItem>` rows allowed (no `<Sub>`); arrow-key nav is limited to currently-visible rows.

### Anchor

The pressable attached to a trigger hook's `ref` IS the anchor — there is no separate `<Anchor>` slot, no `anchorRef` prop, no `anchorPosition` prop. The trigger captures `getBoundingClientRect()` on press and publishes the rect to context. Multiple triggers in one `<Root>` are supported; the popover anchors to whichever was pressed last.

## Folder layout

Grouped by feature, not by file type. Each subfolder owns its components, contexts, and hooks, and re-exports its public surface through a barrel (`index.ts`); the top-level [`index.tsx`](./index.tsx) re-exports each barrel.

- **`root/`** — `<Root>` provider, the trigger hooks (`usePopoverTrigger`, `useSecondaryInteractionTrigger`), the visibility hook (`useIsPopoverVisible`), and the shared anchor-opener helper.
- **`content/`** — public surface variants (`<Content>`, `<ScrollableContent>`, `<VirtualizedContent>`) plus the internal scaffolding they share.
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
| `usePopoverTrigger`, `useSecondaryInteractionTrigger`, `useIsPopoverVisible` | `Root` |
| `Content`, `ScrollableContent`, `VirtualizedContent` | `Root` |
| `Item`, `CheckmarkItem`, `Label`, `Header`, `Separator`, `Group`, `Sub` | `Content` or `ScrollableContent` (transitively, including inside `<Sub.Content>`). `<VirtualizedContent>` only allows `Item` / `CheckmarkItem` |
| `Sub.Trigger`, `Sub.Content` | `Sub` |

Violating any of these throws synchronously during render. The exception isn't `__DEV__`-gated, so a slip past local dev fails loudly on staging instead of silently corrupting layout.
