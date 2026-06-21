# Popover (v2)

Compound popover primitives. Inspired by Radix Popover, adapted for React Native.

## Contract

- **Controlled or uncontrolled.** `<Root isOpen? defaultOpen? onOpenChange?>` — supply `isOpen` for controlled, omit for uncontrolled. Inside the popover, read via `usePopover('<Consumer>')` which returns the `{state, actions, meta}` shape.
- **Two-slot anchor.** `<Trigger>` opens the popover and (when nothing else publishes) positions it. `<Anchor>` publishes a custom anchor: while `<Anchor>` is mounted, its node wins — Trigger writes go to a separate slot and are suppressed at the consumer level. Unmounting `<Anchor>` falls back to the Trigger's anchor on the next commit. Mirrors Radix's `hasCustomAnchor` pattern.
- **Content publishes its role.** `<Content role>` (default `'region'`) is published into state via `setContentRole`; `<Trigger>` reads it to emit the matching `accessibilityHasPopup` (`menu` → `menu`, else → `dialog`) per WAI-ARIA 1.2 §6.6.5.
- **Floating-only at the primitive layer.** `<Popover.Content>` does not fork to a bottom sheet on small screens — that responsibility lives at consumer altitude (PopoverMenu has it; raw Popover doesn't). Pair `<Popover>` with `<BottomDockedModal>` yourself if you need the mobile sheet pattern.
- **Hierarchy enforced at render.** `<Trigger>`, `<Anchor>`, `<Close>`, `<Content>`, `<Title>`, `<Description>`, `usePopover()` throw synchronously if rendered outside `<Root>` — not `__DEV__`-gated.
- **Headless hook.** `usePopoverContent` returns the ARIA + positioning prop bags for hosts that bypass `<Content>`.

## Usage

```tsx
import * as Popover from '@components/Popover/v2';

<Popover.Root>
    <Popover.Trigger
        accessibilityLabel="Show details"
        sentryLabel="MyTrigger"
    >
        <Icon />
    </Popover.Trigger>

    <Popover.Content placement="bottom-start">
        <Popover.Title>Details</Popover.Title>
        <Popover.Description>Anchors below the trigger by default; dismisses on outside click or Escape.</Popover.Description>
    </Popover.Content>
</Popover.Root>
```

### Root — `<Root isOpen? defaultOpen? onOpenChange?>`

Owns visibility state (via `useDisclosureState`), the resolved anchor (`anchor = customAnchor ?? triggerAnchor`), the `hasCustomAnchor` flag, and the measured `anchorRect`. Re-measures whenever `(isOpen, anchor)` changes — keeps positioning fresh across open/close cycles and controlled-mode flips. Generates `triggerID` and `contentID` (`useId()`) and publishes them so `<Trigger>` and `<Content>` cross-reference each other via shared IDs.

### Trigger — `<Trigger accessibilityLabel sentryLabel>{children}</Trigger>`

`PressableWithFeedback` wrapper that opens the popover on press and writes itself to the trigger slot. While `<Anchor>` is mounted, the trigger's write is suppressed and the custom anchor wins. Publishes the full ARIA disclosure pattern: `nativeID={triggerID}`, `accessibilityRole="button"`, `accessibilityState={{expanded: isOpen}}`, `accessibilityHasPopup` derived from `state.contentRole` (`menu` → `menu`; `tooltip` / `region` / `dialog` → `dialog`), `accessibilityControls={contentID}` (always-on so AT keeps the trigger↔content link across content unmount).

### Anchor — `<Anchor anchorRef>{children}</Anchor>`

Publishes the `View` pointed to by `anchorRef` as the popover's custom anchor — used for context-menu-style flows where the visible anchor differs from the interactive trigger (e.g. right-click on a list row opens a popover positioned at the row, while the `<Trigger>` is a menu button elsewhere). `children` is rendered as-is (no wrapper element). Sets `hasCustomAnchor=true` while mounted; unmounting clears the slot and the popover falls back to the Trigger's anchor.

### Close — `<Close accessibilityLabel sentryLabel>{children}</Close>`

`PressableWithFeedback` wrapper that closes the popover on press. Render anywhere inside `<Content>`.

### Content — `<Content placement? role? fadeDuration? onExitComplete? style?>{children}</Content>`

The mounted-while-open subtree. Positions via `useAnchoredPosition` against the resolved anchor, with an 8px gap. Publishes `role` to the Root's state so `<Trigger>` can emit the matching `accessibilityHasPopup`; clears on unmount.

- **`placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'`** — defaults to `'bottom-start'`. `top-*` renders above the anchor. Flips automatically when the requested side can't fit and the opposite has more room. RTL flips LEFT ↔ RIGHT (`-start` ↔ `-end`); CENTER stays symmetric.
- **`role?: 'menu' | 'tooltip' | 'region' | 'dialog'`** — defaults to `'region'`. Pick `'tooltip'` for non-essential hover hints, `'dialog'` when interactive content needs the dialog AT contract, `'menu'` when the popover holds menu items. `'dialog'` and `'menu'` enable focus containment (`FocusTrapForModal`).
- **`fadeDuration?: number`** — entry/exit fade timing in ms. Defaults to `150`.
- **`onExitComplete?: () => void`** — fires after the exit animation completes.
- **`style?`** — flows through to Surface.

### Title — `<Title style? level?>{children}</Title>`

Renders `<Text role="heading" aria-level={level} nativeID={titleID}>`. `level` defaults to `2`. The `titleID` is wired to Content's `accessibilityLabelledBy`.

### Description — `<Description style?>{children}</Description>`

Renders `<Text nativeID={descriptionID}>`. The `descriptionID` is wired to Content's `accessibilityDescribedBy`.

### Hooks

#### Compound hooks

- **`usePopover(consumerName)`** — returns `{state: {isOpen, anchor, anchorRect, hasCustomAnchor, contentRole}, actions: {setOpen, open, close, toggle, setTriggerAnchor, setCustomAnchor, setAnchorRect, setContentRole}, meta: {triggerID, contentID}}`. Throws outside `<Root>`. Use to drive trigger UI that depends on popover state (active-state icon, chevron rotation). `contentRole` reflects the currently-mounted `<Content>`'s role (or `null` when closed).
- **`useTrigger()`** — composes ref-capture + open. Returns `{ref, open}`. The `ref` is an `AnchorRefCallback` that writes the trigger node into the trigger anchor slot (suppressed automatically while `<Anchor>` is mounted); `open()` opens the popover if a node is captured. Wire `ref` to the custom pressable and call `open` from its `onPress`.
- **`useAnchor()`** — returns an `AnchorRefCallback` `(node) => void` that publishes the node as the *custom* anchor. Use to wire a non-`<Anchor>` element as the positioning anchor without wrapping it in JSX.

#### Headless hook (no JSX dependency)

- **`usePopoverContent({anchorRect, alignment?, placement?, offsetPx?, role?, contentID?, triggerID?, titleID?, descriptionID?, accessibilityLabel?})`** — returns `{contentProps, positionProps, isPositioned, available}`. The popover ARIA + positioning bag for a host that bypasses `<Content>`. Spread `positionProps` (`style`, `onLayout`) on the positioning wrapper, `contentProps` (role + nativeID + ARIA refs) on the surface itself.

## Folder layout

- **`root/`** — `<Root>`, `<Trigger>`, `<Anchor>`, `<Close>`, `useAnchor`, `useTrigger`, `usePopover`, `state`. Top-level shape that owns visibility + dual-slot anchor.
- **`content/`** — `<Content>`, `<Title>`, `<Description>` (in `Headings.tsx`, via `createHeadingSystem`), the internal `Surface` (handles the fade), and `usePopoverContent`.
- **`index.ts`** — top-level barrel.

## Architectural rules

| Component / Hook | Must be rendered / called inside |
|---|---|
| `Trigger`, `Anchor`, `Close`, `usePopover`, `useTrigger`, `useAnchor` | `Root` |
| `Content` | `Root` |
| `Title`, `Description` | `Content` |

Violations throw synchronously during render — not `__DEV__`-gated.

> **Runtime requirement.** Anchor measurement uses `getBoundingClientRect()` (web) or `measureInWindow` (native). Reanimated 4 drives the entry/exit fade.
