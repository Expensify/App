import type {ReactNode} from 'react';

import {createPortal} from 'react-dom';

type ProductMarketingWindowPortalProps = {
    children: ReactNode;
};

function ProductMarketingWindowPortal({children}: ProductMarketingWindowPortalProps) {
    return createPortal(children, document.body);
}

export default ProductMarketingWindowPortal;
