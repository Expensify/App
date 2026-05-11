# PopoverMenu (v2)

Compound popover-menu primitives — uncontrolled by design. Inspired by [Radix DropdownMenu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) — same anatomy, same composition rules — adapted for React Native and React Compiler.

## Goals

- **Uncontrolled by design.** Visibility lives inside `<Root>`. `<Trigger>` and `<SecondaryInteractionTrigger>` open it on press; item selection / item-handler `event.preventDefault()` / screen blur / modal-stack cover close it. Callers observe via `useIsPopoverVisible()` when they need to coordinate UI (e.g. keep video controls visible while menu is open).
- **Composition over configuration.** Behaviour is selected by which components you compose, not by boolean props on a monolithic component (`Content` vs `ScrollableContent`, `<Header>` instead of `headerText`, etc.).
- **Structural insulation from content-state re-renders.** Triggers don't re-render when content state (sub navigation, focus) changes. Achieved by splitting state into separate contexts (`RootState/Actions`, `ContentNavigation/Focus/Actions`, `Sub`). Root-visibility re-renders DO reach triggers (to drive `accessibilityState.expanded` / `accessibilityControls` on the underlying pressable) — that's a once-per-open/close cadence and worth the a11y win.
- **Always-on hierarchy assertions.** Misuse fails loud at render time with a descriptive error (`<PopoverMenu.Item> must be rendered inside <PopoverMenu.Content>`), in dev *and* staging. The throws are emitted by the existing context-consumer hooks (`useRootState`, `useContentActions`, `useSubContext`, …) — no separate assertion layer.
- **No manual memoization.** All files in this folder compile under React Compiler — no `useCallback` / `useMemo` / `React.memo`.
- **Trigger props flow via context, not `cloneElement`.** `<Trigger>` and `<SecondaryInteractionTrigger>` publish their props (`onPress`/`onSecondaryInteraction`/`ref`/`accessibilityState`/`nativeID`/`accessibilityControls`) into `PressResponderContext` (project-level primitive at `src/components/Pressable/PressResponder/`). Any descendant `<PressableWithFeedback>` (or `<PressableWithSecondaryInteraction>`) consumes the context automatically — works through arbitrary wrapper depth (Tooltip, IconButton, conditional renders) because the actual pressable reads from context rather than relying on its parent to forward injected props. Mirrors React Aria's `<PressResponder>` pattern.
- **Sub-level wrapper-plus-hook.** `<Sub.Trigger>` / `useSubTrigger` and `<Sub.BackButton>` / `useSubBackButton` ship in two layers — opinionated `MenuItem` wrapper for the canonical row, hook for non-`MenuItem` shapes. Same intent as React Aria's `useMenuTrigger` + `<MenuTrigger>`.

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

`<Trigger>` and `<SecondaryInteractionTrigger>` are context providers — they don't render their own pressable. They publish `onPress` / `onSecondaryInteraction` / `ref` / `accessibilityState` / `nativeID` / `accessibilityControls` into `PressResponderContext`; the consuming pressable reads the context and merges those props into itself. The pressable can be at any depth in the subtree.

- **`<PopoverMenu.Trigger>`** — primary trigger. Render any subtree containing a `<PressableWithFeedback>`. The pressable's `onPress` (if supplied) runs *before* the popover opens; consumers can call `event.preventDefault()` inside their `onPress` to gate the open (matches `<Item onSelect>`'s contract).
- **`<PopoverMenu.SecondaryInteractionTrigger>`** — long-press (native) / right-click (web) variant. Render any subtree containing a `<PressableWithSecondaryInteraction>`. Same gating contract via `event.preventDefault()`. Web right-click anchors at the cursor position (Radix `<ContextMenu>` parity); native long-press anchors at the pressable's bounding rect.
- **`<PopoverMenu.Sub.Trigger>` / `useSubTrigger({disabled?})`** — sub-level analogue. The wrapper renders an opinionated `MenuItem` drill-down row; the hook returns `{ref, onPress, onFocus, focused, isAtActiveLevel}` to compose any pressable as a sub trigger.
- **`<PopoverMenu.Sub.BackButton>` / `useSubBackButton()`** — sub-level back button. Render it as a child of `<Sub.Content>` (matches Radix / React Aria explicit-composition); the wrapper self-gates to the active level so siblings at ancestor levels stay mounted without rendering. Hook returns `{ref, onPress, onFocus, focused, isAtActiveLevel}` for non-`MenuItem` shapes.

#### Which pressables consume `PressResponderContext`

The context is published by the trigger and consumed by Pressable variants that call `usePressResponderProps` + `useResponderRef` internally:

| Pressable | Consumes | Use with |
|---|---|---|
| `<PressableWithFeedback>` | `onPress`, `ref`, `accessibilityState`, `nativeID`, `accessibilityControls` | `<Trigger>` |
| `<PressableWithSecondaryInteraction>` | `onSecondaryInteraction` (delegates remaining props to its inner `<PressableWithFeedback>`) | `<SecondaryInteractionTrigger>` |

Raw RN `<Pressable>`, `<TouchableOpacity>`, or any other pressable component will **not** pick up the responder's props. They must be wrapped in `<PressableWithFeedback>` / `<PressableWithSecondaryInteraction>` or call the responder hooks directly. `<Trigger>` dev-warns in development if it publishes a handler that no descendant consumes (e.g. `<SecondaryInteractionTrigger>` paired with `<PressableWithFeedback>` only). The warning fires once on mount; if your pressable mounts lazily after a state flip, you may see a one-time false-positive — matches Aria's `<PressResponder>` semantics.

### Row composition — `useSelectableRow({onSelect?, disabled?})`

Returns `{ref, onPress, onFocus, focused, isAtActiveLevel}` to compose any pressable as a selectable row inside `<Content>` / `<ScrollableContent>`. The menu closes after `onSelect` fires; call `event.preventDefault()` inside `onSelect` to keep it open. The opinionated `MenuItem` shapes ship as `<Item>` and `<CheckmarkItem>` for the canonical cases; reach for the hook when you need a non-`MenuItem` row (a `Button`-styled option, custom layout, etc.).

#### Conditional opening (gating via `preventDefault`)

The pressable's `onPress` runs first, then the trigger's open — unless the pressable called `event.preventDefault()`. Mirrors `<Item onSelect>`'s existing pattern.

> **`preventDefault()` must be called synchronously**, before any `await`. The composed handler checks `event.defaultPrevented` immediately after the consumer's `onPress` returns; a deferred call (after `await` or in a promise callback) lands too late and the popover will already be open. Same constraint as Radix's `composeEventHandlers`. For async pre-press validation, gate at the layer above the trigger.

```tsx
function MoreMenuTrigger({videoPlayerRef, url}) {
    const handlePress = (event) => {
        if (!videoPlayerRef.current) {
            event?.preventDefault();
            return;
        }
        updateSource(url);
    };
    // <IconButton> wraps <Tooltip><PressableWithFeedback /></Tooltip> internally — the popover's props
    // still reach the inner PressableWithFeedback because it reads them from PressResponderContext.
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

The pressable consuming the `<Trigger>` / `<SecondaryInteractionTrigger>` context is the anchor — there is no separate `<Anchor>` slot, no `anchorRef` prop, no `anchorPosition` prop. The trigger captures `getBoundingClientRect()` on press and publishes the rect to context. (`<SecondaryInteractionTrigger>` on web substitutes `MouseEvent.pageX`/`pageY` for a 1×1 cursor rect.) Multiple triggers in one `<Root>` are supported; the popover anchors to whichever was pressed last.

## Folder layout

Grouped by feature, not by file type. Each subfolder owns its components, contexts, and hooks, and re-exports its public surface through a barrel (`index.ts`); the top-level [`index.tsx`](./index.tsx) re-exports each barrel.

- **`root/`** — `<Root>` provider, the `<PressResponder>`-based trigger wrappers (`<Trigger>`, `<SecondaryInteractionTrigger>`), the visibility hook (`useIsPopoverVisible`), and the shared anchor-opener helper.
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
