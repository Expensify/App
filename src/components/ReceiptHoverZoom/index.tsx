import type {ReactNode} from 'react';
import type {ReceiptHoverZoomProps} from './types';

function ReceiptHoverZoom({children}: ReceiptHoverZoomProps): ReactNode {
    return children;
}

ReceiptHoverZoom.displayName = 'ReceiptHoverZoom';

export default ReceiptHoverZoom;
