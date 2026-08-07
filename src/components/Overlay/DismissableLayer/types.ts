import type {EscapeBehavior} from '@components/Overlay/libs/dismissableLayerStore';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';

import type {ReactNode} from 'react';

type DismissableLayerProps = {
    /** **Web only** (native has no keydown analog). Called when Escape is pressed while this layer is topmost; call `event.preventDefault()` to keep it open. */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;

    /** **Web only** (native has no document pointer-outside analog). Called when a pointer-down lands outside this layer; call `event.preventDefault()` to keep it open. */
    onPointerDownOutside?: (event: PointerEvent) => void;

    /** Called when the layer is dismissed via Escape (web), an outside interaction (web), or hardware back (native). */
    onDismiss?: () => void;

    /** Whether Escape (web) / hardware back (native) dismisses the layer or is ignored (default: dismiss). Cross-platform. */
    escapeBehavior?: EscapeBehavior;

    /** **Web only** (paired with the document outside-pointer listener). Extra elements treated as "inside" so interacting with them doesn't dismiss the layer. */
    additionalAnchors?: ReadonlyArray<AnchorNode | null>;

    /** Predicate that vetoes outside-interaction dismissal; return `false` to keep the layer open. The argument is the real `EventTarget` on web; on native it is only consulted for the `.Floating` backdrop press and is called with `null`. */
    shouldCloseOnInteractOutside?: (target: EventTarget | null) => boolean;

    /** Layer content */
    children: ReactNode;
};

export type {DismissableLayerProps, EscapeBehavior};
