import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type AnchorAlignment = {
    /** The horizontal anchor alignment of the popover */
    horizontal: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;

    /** The vertical anchor alignment of the popover */
    vertical: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_VERTICAL>;
};

export default AnchorAlignment;
