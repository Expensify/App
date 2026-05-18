import type {ReactNode, RefObject} from 'react';
import type {View} from 'react-native';

type ReceiptHoverZoomProps = {
    /** Content to apply the zoom effect to. Typically the receipt image. */
    children: ReactNode;

    /** Disables the zoom effect when false. Used to opt out non-photo content (EReceipts, placeholders). */
    isEnabled?: boolean;

    /** Multiplier applied to the underlying image while hovered. Defaults to 2.5. */
    scale?: number;

    /**
     * Optional element to bind hover/move listeners to. When provided, the zoom engages while the cursor
     * is anywhere inside this element — including absolutely-positioned siblings like action buttons —
     * rather than only over the scaled image itself.
     */
    hoverContainerRef?: RefObject<View | null>;
};

// eslint-disable-next-line import/prefer-default-export
export type {ReceiptHoverZoomProps};
