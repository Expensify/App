import type {ReactNode} from 'react';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';
import type {EscapeBehavior} from '@components/Overlay/libs/overlayStore';

type DismissableLayerProps = {
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    onDismiss?: () => void;
    escapeBehavior?: EscapeBehavior;
    additionalAnchors?: ReadonlyArray<AnchorNode | null>;
    shouldCloseOnInteractOutside?: (target: EventTarget | null) => boolean;
    children: ReactNode;
};

export type {DismissableLayerProps, EscapeBehavior};
