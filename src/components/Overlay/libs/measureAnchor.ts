import type {PressableRefElement} from '@components/Pressable/GenericPressable/types';
import asHostElement from './asHostElement';

type AnchorRect = {top: number; bottom: number; left: number; right: number; width: number; height: number};

type AnchorNode = PressableRefElement;

function toRectOrNull(x: number, y: number, width: number, height: number): AnchorRect | null {
    // An unlaid-out or display:none anchor measures 0×0 at the origin; anchoring there would misplace the surface.
    if (width <= 0 || height <= 0) {
        return null;
    }
    return {top: y, bottom: y + height, left: x, right: x + width, width, height};
}

function measureAnchor(node: AnchorNode | null): Promise<AnchorRect | null> {
    if (!node) {
        return Promise.resolve(null);
    }
    const host = asHostElement(node);
    if (host) {
        const r = host.getBoundingClientRect();
        return Promise.resolve(toRectOrNull(r.left, r.top, r.width, r.height));
    }
    // Guard: PressableRefElement admits HTMLDivElement, which has no measureInWindow.
    if ('measureInWindow' in node && typeof node.measureInWindow === 'function') {
        return new Promise((resolve) => {
            node.measureInWindow((x, y, width, height) => {
                resolve(toRectOrNull(x, y, width, height));
            });
        });
    }
    return Promise.resolve(null);
}

export default measureAnchor;
export type {AnchorRect, AnchorNode};
