import {useCallback} from 'react';
import type {View} from 'react-native';
import type {AnchorDimensions, AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import useResponsiveLayout from './useResponsiveLayout';

const defaultAnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

function usePopoverPosition() {
    // Popovers are not used on small screen widths, but can be present in RHP
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const calculatePopoverPosition = useCallback(
        (anchorRef: React.RefObject<View | null>, anchorAlignment: AnchorAlignment = defaultAnchorAlignment) => {
            if (isSmallScreenWidth || !anchorRef.current || !('measureInWindow' in anchorRef.current)) {
                return Promise.resolve({horizontal: 0, vertical: 0, width: 0, height: 0});
            }
            return new Promise<AnchorPosition & AnchorDimensions>((resolve) => {
                anchorRef.current?.measureInWindow((x, y, width, height) => {
                    let horizontal = x + width;
                    if (anchorAlignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT) {
                        horizontal = x;
                    } else if (anchorAlignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER) {
                        horizontal = x + width / 2;
                    }
                    const vertical =
                        anchorAlignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP
                            ? y + height + CONST.MODAL.POPOVER_MENU_PADDING // if vertical anchorAlignment is TOP, menu will open below the button and we need to add the height of button and padding
                            : y - CONST.MODAL.POPOVER_MENU_PADDING; // if it is BOTTOM, menu will open above the button so NO need to add height but DO subtract padding
                    resolve({
                        horizontal,
                        vertical,
                        width,
                        height,
                    });
                });
            });
        },
        [isSmallScreenWidth],
    );

    return {calculatePopoverPosition};
}

export default usePopoverPosition;
