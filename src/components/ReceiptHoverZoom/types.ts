import type {ReactNode, RefObject} from 'react';
import type {View} from 'react-native';

type ReceiptHoverZoomProps = {
    /** Children to render inside the zoom container */
    children: ReactNode;

    /** When false the wrapper is a pass-through with no DOM/listener overhead */
    isEnabled?: boolean;

    /** Maximum scale applied on hover. Defaults to 2.5 */
    scale?: number;

    /** Outer element the listeners should attach to. Lets the zoom stay engaged while the cursor crosses overlay buttons. Falls back to the wrapper element. */
    hoverContainerRef?: RefObject<View | null>;
};

export default ReceiptHoverZoomProps;
