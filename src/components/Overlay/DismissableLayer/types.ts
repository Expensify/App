import type {ReactNode} from 'react';
import type {EscapeBehavior} from '@components/Overlay/libs/dismissableLayerStore';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';

type DismissableLayerProps = {
    /** Called when Escape is pressed while this layer is topmost; call `event.preventDefault()` to keep it open */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;

    /** Called when a pointer-down lands outside this layer; call `event.preventDefault()` to keep it open */
    onPointerDownOutside?: (event: PointerEvent) => void;

    /** Called when the layer is dismissed via Escape or an outside interaction */
    onDismiss?: () => void;

    /** Whether Escape dismisses the layer or is ignored (default: dismiss) */
    escapeBehavior?: EscapeBehavior;

    /** Extra elements treated as "inside" so interacting with them doesn't dismiss the layer */
    additionalAnchors?: ReadonlyArray<AnchorNode | null>;

    /** Predicate that vetoes outside-interaction dismissal; return `false` to keep the layer open for that target */
    shouldCloseOnInteractOutside?: (target: EventTarget | null) => boolean;

    /** Layer content */
    children: ReactNode;
};

export type {DismissableLayerProps, EscapeBehavior};
