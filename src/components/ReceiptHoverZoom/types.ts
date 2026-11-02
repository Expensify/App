import type {ReactNode, RefObject} from 'react';
import type {View} from 'react-native';

/** Shared hover state passed to children so overlays (e.g. the distance e-receipt flip) stay in sync with the zoom. */
type ReceiptHoverZoomRenderState = {
    /** True while the pointer is actively over the receipt (set on the first pointer move after load, cleared on leave). */
    isHovering: boolean;
};

type ReceiptHoverZoomProps = {
    /** Children to render inside the zoom container. May be a render function that receives the shared hover state. */
    children: ReactNode | ((state: ReceiptHoverZoomRenderState) => ReactNode);

    /** When false the wrapper is a pass-through with no DOM/listener overhead */
    isEnabled?: boolean;

    /** Maximum scale applied on hover. Defaults to 2.5 */
    scale?: number;

    /** Outer element the listeners should attach to. Lets the zoom stay engaged while the cursor crosses overlay buttons. Falls back to the wrapper element. */
    hoverContainerRef?: RefObject<View | null>;
};

export default ReceiptHoverZoomProps;
