import isHTMLElement from '@libs/isHTMLElement';

import type {AnchorNode} from './measureAnchor';

function asHostElement(node: AnchorNode | null): HTMLElement | null {
    return isHTMLElement(node) ? node : null;
}

export default asHostElement;
