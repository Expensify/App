# Modal (v2)

Compound modal primitives. Inspired by Radix Dialog, adapted for React Native.

## Contract

- **Six baked-in variants.** `AlertDialog`, `BottomDockedModal`, `CenteredModal`, `CenteredSmallModal`, `FullscreenModal`, `RightDockedModal` — each is the same compound with the `ModalKind` pre-bound at variant level, so callers can't pass the wrong discriminant. Animation defaults, per-kind layout, and Surface ARIA role follow the kind automatically.
- **Controlled or uncontrolled.** `<Root isOpen? defaultOpen? onOpenChange?>` — supply `isOpen` for controlled, omit for uncontrolled. Inside the modal, read context via `useModal()`. From anywhere else, read the topmost active modal via `useActiveModalKind()` / `useActiveModalEntry()`.
- **Unified accidental-dismiss channel.** Backdrop tap, Escape key, Android hardware back, and the `BottomDockedModal` small-screen top tap-area all gate on `escapeBehavior`. Set `escapeBehavior="ignore"` to disable every channel; pass `onBackdropPress` to provide a custom backdrop / tap-area policy while still disabling Escape and back.
- **Hierarchy enforced at render.** `<Trigger>`, `<Close>`, `<Title>`, `<Description>` throw synchronously if rendered outside the matching ancestor — not `__DEV__`-gated.
- **Confirm + Decision sub-compounds** ship at `Modal/v2/confirm/` and `Modal/v2/decision/`. Use them directly for in-tree dialogs, or consume them through [`@components/Dialog`](../../Dialog/README.md) for globally-mounted promise-returning dialogs.
- **Headless hooks** for custom hosts: `useDialogContent` (dialog ARIA bag), `useModalOverlay` (Escape + outside-press + scroll-lock + sibling-hiding composition). See the Hooks section.

## Usage

```tsx
import {CenteredModal} from '@components/Modal/v2';

<CenteredModal.Root>
    <CenteredModal.Trigger
        accessibilityLabel="Open modal"
        sentryLabel="MyTrigger"
    >
        <Icon />
    </CenteredModal.Trigger>

    <CenteredModal.Content>
        <CenteredModal.Title>Title</CenteredModal.Title>
        <CenteredModal.Description>Body text.</CenteredModal.Description>
        <CenteredModal.Close
            accessibilityLabel="Close"
            sentryLabel="MyClose"
        >
            <Text>Close</Text>
        </CenteredModal.Close>
    </CenteredModal.Content>
</CenteredModal.Root>
```

### Variants

Every variant exposes `Root`, `Trigger`, `Content`, `Title`, `Description`, `Close` plus the hooks `useModal` / `useActiveModalKind` / `useActiveModalEntry`. `Root` accepts the same `{isOpen?, defaultOpen?, onOpenChange?, children}` everywhere; only the variant-scoped `kind`, animation defaults, and surface role differ.

| Variant | Kind | Animation defaults | Surface role | Typical use |
|---|---|---|---|---|
| `CenteredModal` | `CENTERED` | `fadeIn` / `fadeOut` | `dialog` | Standard centered dialog |
| `CenteredSmallModal` | `CENTERED_SMALL` | `fadeIn` / `fadeOut` | `dialog` | Compact centered confirmation |
| `BottomDockedModal` | `BOTTOM_DOCKED` | `slideInUp` / `slideOutDown` | `dialog` | Bottom sheet; small-screen also gets an invisible top tap-area for dismissal |
| `RightDockedModal` | `RIGHT_DOCKED` | `slideInRight` / `slideOutRight` | `dialog` | Side panel; respects RTL |
| `FullscreenModal` | `FULLSCREEN` | `slideAndFadeInRight` / `slideAndFadeOutRight` | `dialog` | Full-viewport editor / settings page |
| `AlertDialog` | `CONFIRM` | `fadeIn` / `fadeOut` | **`alertdialog`** | Modal that requires an explicit user decision — AT announces accordingly. Matches WAI-ARIA APG + Radix naming. |

Override animations on a single instance with `<Variant.Content animationIn? animationOut? animationInTiming? animationOutTiming?>`.

### Root — `<Root isOpen? defaultOpen? onOpenChange?>`

Owns visibility state. Controlled callers pass `isOpen` + `onOpenChange`; uncontrolled callers pass `defaultOpen`. `kind` is provided by the variant wrapper — `Root` itself is kind-agnostic.

### Trigger — `<Trigger accessibilityLabel sentryLabel>{children}</Trigger>`

Opens the modal on press. Pass any subtree as `children` (`<Icon>`, `<Text>`, custom row). Publishes the WAI-ARIA disclosure pattern (`accessibilityRole="button"`, `accessibilityHasPopup="dialog"`, `accessibilityState={{expanded}}`, `accessibilityControls={contentID}`). `aria-haspopup` is always `"dialog"` (per WAI-ARIA 1.2 §6.6.5 — `alertdialog` is *not* a valid `aria-haspopup` value); the Surface itself declares `role="alertdialog"` for `AlertDialog` consumers.

For a non-canonical pressable (`IconButton`, custom `Button`), call `useModal('<MyTrigger>').actions.open` from inside `<Root>` and bind it to your own pressable, or use the headless `useOverlayTrigger({…})` hook from `@components/Overlay/hooks/useOverlayTrigger` for the full ARIA bag.

### Close — `<Close accessibilityLabel sentryLabel>{children}</Close>`

Closes the modal on press. Render anywhere inside `<Content>`.

### Content — `<Content escapeBehavior? onExitComplete? onBackdropPress? animationIn? animationOut? animationInTiming? animationOutTiming? role? style? innerStyle?>{children}</Content>`

The mounted-while-open subtree. Kind-aware containers + safe-area padding + `ColorSchemeWrapper` per variant. Surface role tracks the variant kind: `AlertDialog` → `alertdialog`, all others → `dialog` (override per-instance via `role`).

- **`escapeBehavior?: 'dismiss' | 'ignore'`** — defaults to `'dismiss'`. `'ignore'` disables backdrop tap, Escape key (web), Android hardware back, AND the small-screen `BottomDockedModal` top tap-area in one move.
- **`onBackdropPress?`** — overrides the default `close` on backdrop and small-screen `BottomDockedModal` tap-area. Pair with `escapeBehavior='ignore'` to keep Escape / Android back disabled while still exposing a custom backdrop policy.
- **`onExitComplete?`** — fires after the exit animation completes. Use for post-close work (focus restoration, deferred navigation).
- **`animationIn?` / `animationOut?` / `animationInTiming?` / `animationOutTiming?`** — override the variant's per-kind defaults.
- **`role?`** — override the default Surface role (`'dialog' | 'alertdialog'`).
- **`style?` / `innerStyle?`** — outer / inner container styles.

### Title — `<Title style? level?>{children}</Title>`

Renders the dialog heading. `level` defaults to `2`. Wired to Content's `accessibilityLabelledBy` so AT announces the dialog by its title.

### Description — `<Description style?>{children}</Description>`

Renders the dialog description. Wired to Content's `accessibilityDescribedBy`.

### Hooks

#### Compound hooks (read from variant context)

- **`useModal(consumerName)`** — returns `{state: {isOpen}, actions: {setOpen, open, close, toggle}, meta: {triggerID, contentID}}`. Throws outside `<Root>`. Pass a label like `'<MyComponent>'` as `consumerName` — it's interpolated into the error message.
- **`useActiveModalKind()`** — returns the kind of the variant wrapping the caller, or `null` outside any variant Root. Drives variant-aware UI inside `<Content>` (Backdrop, dismiss affordances, etc.). Reads from `ModalKindContext`, not from `useModal()`.
- **`useActiveModalEntry()`** — returns the *globally* topmost `ModalOverlayEntry` from `overlayStore`. Cross-tree query; works for any modal that registered an entry.

#### Headless hooks (no JSX dependency)

- **`useDialogContent({role?, modal?, contentID?, titleID?, descriptionID?, accessibilityLabel?})`** — returns `{dialogProps, titleProps, descriptionProps}`. The dialog ARIA bag for a custom host that bypasses `<Modal.Content>`. `modal` defaults to `true` and drives `aria-modal`; set `modal: false` for non-modal dialogs (no focus trap, no sibling hiding).
- **`useModalOverlay({isOpen, onClose?, isDismissable?, isKeyboardDismissDisabled?, onBackdropPress?, modal?, additionalAnchors?, shouldCloseOnInteractOutside?})`** — returns `{containerRef, modalProps, underlayProps}`. Composes Escape + pointer-down-outside + body scroll lock + aria-hide siblings for a standalone overlay. **Caveat:** doesn't participate in `dismissableLayerStore`'s top-of-stack gating — for stack-aware overlays nested under the v2 compounds, use `<DismissableLayer.Modal>` JSX so the layer entry registers.

## Architectural rules

| Component / Hook | Must be rendered / called inside |
|---|---|
| `Variant.Trigger`, `Variant.Close`, `Variant.Content`, `useModal` | `Variant.Root` |
| `Variant.Title`, `Variant.Description` | `Variant.Content` |
| `Confirm.*`, `Decision.*` | `Confirm.Root` / `Decision.Root` respectively |

Violations throw synchronously during render — not `__DEV__`-gated.
