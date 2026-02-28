import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {AnchorDimensions, AnchorPosition} from '@src/styles';
import type {AnchorOrigin} from './actions/EmojiPickerAction';

/**
 * Gets the x,y position of the passed in component for the purpose of anchoring another component to it.
 */
export default function calculateAnchorPosition(anchorComponent: ContextMenuAnchor, anchorOrigin?: Partial<AnchorOrigin>): Promise<AnchorPosition & AnchorDimensions> {
    return new Promise((resolve) => {
        if (!anchorComponent || !('measureInWindow' in anchorComponent)) {
            resolve({horizontal: 0, vertical: 0, width: 0, height: 0});
            return;
        }
        anchorComponent.measureInWindow((x, y, width, height) => {
            if (anchorOrigin?.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP && anchorOrigin?.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT) {
                resolve({horizontal: x, vertical: y + height + (anchorOrigin?.shiftVertical ?? 0), width, height});
                return;
            }
            resolve({horizontal: x + width, vertical: y + (anchorOrigin?.shiftVertical ?? 0), width, height});
        });
    });
}
