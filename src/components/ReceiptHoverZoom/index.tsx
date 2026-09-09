import type ReceiptHoverZoomProps from './types';

function ReceiptHoverZoom({children}: ReceiptHoverZoomProps) {
    // Hover doesn't exist on native, so the shared hover state is always false.
    return typeof children === 'function' ? children({isHovering: false}) : children;
}

ReceiptHoverZoom.displayName = 'ReceiptHoverZoom';

export default ReceiptHoverZoom;
