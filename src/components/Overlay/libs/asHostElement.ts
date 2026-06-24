import type {AnchorNode} from './measureAnchor';

function asHostElement(node: AnchorNode | null): HTMLElement | null {
    if (node === null) {
        return null;
    }
    if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) {
        return node;
    }
    return null;
}

export default asHostElement;
