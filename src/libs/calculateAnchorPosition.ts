/* eslint-disable no-restricted-imports */
import type {ValueOf} from 'type-fest';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';

type AnchorOrigin = {
    horizontal: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;
    vertical: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_VERTICAL>;
    shiftVertical?: number;
};

/**
 * Gets the x,y position of the passed in component for the purpose of anchoring another component to it.
 */
export default function calculateAnchorPosition(anchorComponent: ContextMenuAnchor, anchorOrigin?: AnchorOrigin): Promise<AnchorPosition> {
    return new Promise((resolve) => {
        if (!anchorComponent || !('measureInWindow' in anchorComponent)) {
            resolve({horizontal: 0, vertical: 0});
            return;
        }
        anchorComponent.measureInWindow((x, y, width, height) => {
            if (anchorOrigin?.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP && anchorOrigin?.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT) {
                resolve({horizontal: x, vertical: y + height + (anchorOrigin?.shiftVertical ?? 0)});
                return;
            }
            resolve({horizontal: x + width, vertical: y + (anchorOrigin?.shiftVertical ?? 0)});
        });
    });
}
