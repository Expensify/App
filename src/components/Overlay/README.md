# Overlay

Low-level primitives for anchored and modal overlays positioning, dismissal, portals, animation, and accessible naming.

## Usage

### Anchored popover — `FloatingHost`

Measure the trigger with `useAnchoredOpener`, then hand the rect to `FloatingHost`:

```tsx
import {useId, useState} from 'react';
import FloatingHost from '@components/Overlay/FloatingHost';
import useAnchoredOpener from '@components/Overlay/hooks/useAnchoredOpener';
import type {AnchorNode, AnchorRect} from '@components/Overlay/libs/measureAnchor';
import {PressableWithFeedback} from '@components/Pressable';
import CONST from '@src/CONST';

function InfoPopover() {
    const [popover, setPopover] = useState<{anchor: AnchorNode; rect: AnchorRect} | null>(null);
    const {ref, open} = useAnchoredOpener({onOpen: (anchor, rect) => setPopover({anchor, rect})});
    const stackId = useId();

    return (
        <>
            <PressableWithFeedback ref={ref} onPress={open} accessibilityLabel="Info" sentryLabel="Info">
                <Icon />
            </PressableWithFeedback>
            <FloatingHost
                isOpen={popover !== null}
                anchor={popover?.anchor ?? null}
                anchorRect={popover?.rect ?? null}
                alignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                onDismiss={() => setPopover(null)}
                stackId={stackId}
                surfaceStyle={popoverChrome}
            >
                {content}
            </FloatingHost>
        </>
    );
}
```

`vertical: TOP` puts content below the anchor, `BOTTOM` above. Both flip when there's no room.

### Build your own overlay

`FloatingHost` is just one arrangement of the primitives. For anything else, stack them yourself — `Presence` → `Portal` → `DismissableLayer` → `AnimatedSurface`:

```tsx
import type {ReactNode} from 'react';
import AnimatedSurface, {FADE_ONLY_ENTER_SPEC, FADE_ONLY_EXIT_SPEC} from '@components/Overlay/AnimatedSurface';
import DismissableLayer from '@components/Overlay/DismissableLayer';
import Portal from '@components/Overlay/Portal';
import Presence from '@components/Overlay/Presence';

function CustomModal({isOpen, onClose, children}: {isOpen: boolean; onClose: () => void; children: ReactNode}) {
    return (
        <Presence present={isOpen}>
            <Portal>
                <DismissableLayer.Modal onDismiss={onClose}>
                    <AnimatedSurface
                        enterSpec={FADE_ONLY_ENTER_SPEC}
                        exitSpec={FADE_ONLY_EXIT_SPEC}
                        enterTiming={150}
                        exitTiming={150}
                        style={cardChrome}
                    >
                        {children}
                    </AnimatedSurface>
                </DismissableLayer.Modal>
            </Portal>
        </Presence>
    );
}
```

`DismissableLayer.Modal` handles Escape/back and locks body scroll. The scrim, centering, and chrome are yours.

### Accessible dialog naming — `createHeadingSystem`

A provider supplies `useHeadingState()` through the returned `StateContext`. `<Title>` / `<Description>` register themselves, and the container reads the ids for `aria-labelledby` / `aria-describedby`:

```tsx
import {View} from 'react-native';
import type {ReactNode} from 'react';
import createHeadingSystem from '@components/Overlay/createHeadingSystem';
import useHeadingState from '@components/Overlay/hooks/useHeadingState';

const Dialog = createHeadingSystem('Dialog');

function DialogBody({children}: {children: ReactNode}) {
    const heading = useHeadingState();
    return (
        <Dialog.StateContext value={heading}>
            <View
                role="dialog"
                aria-labelledby={heading.hasTitle ? heading.titleId : undefined}
                aria-describedby={heading.hasDescription ? heading.descriptionId : undefined}
            >
                {children}
            </View>
        </Dialog.StateContext>
    );
}

// Consumer:
<DialogBody>
    <Dialog.Title>Delete report?</Dialog.Title>
    <Dialog.Description>This can't be undone.</Dialog.Description>
</DialogBody>;
```

## Primitives

### `<FloatingHost>`

Anchored content host — composes `Portal`, `Presence`, `DismissableLayer.Floating`, `AnimatedSurface`, and positioning.

| Prop | |
| --- | --- |
| `isOpen` | Toggle. Stays mounted through the exit animation. |
| `anchor`, `anchorRect` | The measured trigger and its rect, from `useAnchoredOpener`. |
| `alignment` | `{horizontal, vertical}` anchor origins (`CONST.MODAL.ANCHOR_ORIGIN_*`). |
| `offsetPx` | Gap from the anchor. |
| `onDismiss` | Fires on Escape / outside-click / backdrop / back — flip `isOpen` yourself. |
| `surfaceStyle` | Styles the surface, which is otherwise bare. Add your chrome here. |
| `stackId` | Stable id for the overlay entry (`useId()`). |
| `containFocus` | Focus-trap the content (needs a focusable child). |
| `fadeDuration`, `onExitComplete` | Override fade timing / observe the exit finishing. |

### `<DismissableLayer>` (`.Modal`, `.Floating`)

Escape (web) / hardware-back (native) / outside-click, with topmost-layer gating. Props: `onDismiss`, `escapeBehavior` (`'dismiss' | 'ignore'`), `onEscapeKeyDown`, `onPointerDownOutside`, `additionalAnchors`, `shouldCloseOnInteractOutside`.

| Variant | Dismisses on | Also |
| --- | --- | --- |
| default | Escape + outside-click, when topmost | — |
| `.Modal` | Escape only | locks body scroll + aria-hides siblings (web) |
| `.Floating` | Escape (off while a modal covers it) + outside-click | native adds a backdrop for tap-outside |

`onPointerDownOutside` / `onEscapeKeyDown` / `additionalAnchors` are web-only (they need DOM events / node-containment). Native honors `onDismiss`, `escapeBehavior`, and `shouldCloseOnInteractOutside`.

### Other primitives

- **`<Presence>`** — keeps children mounted through their exit animation (`mounted` → `unmountSuspended` → `unmounted`). `onExitComplete` fires when it's gone, and a custom (non-`AnimatedSurface`) child reads the phase with `usePresence()`.
- **`<AnimatedSurface>`** — Reanimated enter/exit, inside a `<Presence>` parent. `FADE_ONLY_ENTER_SPEC` / `FADE_ONLY_EXIT_SPEC` cover the fade case.
- **`<Portal>`** — renders into `document.body` (web) / an `RNModal` (native).
- **`createHeadingSystem(name)`** — dialog naming, wired as in the example above. `useRegisteredTitle` / `useRegisteredDescription` let a custom node own the id instead of `<Title>` / `<Description>`.

## Hooks

| Hook | |
| --- | --- |
| `useAnchoredOpener({onOpen})` | `{ref, open}` — `ref` goes on the trigger, `open()` measures it and calls `onOpen(node, rect)`. |
| `useAnchoredPosition({anchorRect, alignment, offsetPx?})` | Anchored position, flip, and the `available` width/height caps. |
| `useOverlayEntry(entry)` | Registers an overlay for modal-cover detection while it's open. |
| `useOverlayTrigger({isOpen, triggerID, contentID, popupRole})` | The trigger's a11y props (`expanded`, `haspopup`, `controls`). |
| `useOverlaySelectors` | `useTopModal()`, plus `useIsModalCovering()` / `useIsAnyModalActive()`. |
| `useHeadingState()` | The state a `createHeadingSystem` provider passes to its `StateContext`. |

`DismissableLayer` and `FloatingHost` build on a few internals you rarely call directly: `useEscapeKeydown`, `usePointerDownOutside`, `useDismissOnAnchorMove`, `useAriaHideSiblings`, `useBodyScrollLock`.
