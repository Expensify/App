import {useCallback} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type {Dimensions} from '@src/types/utils/Layout';
import useResponsiveLayout from './useResponsiveLayout';

const defaultAnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

/**
 * Popover anchor ref. Typed as `View` for the contract; the hook accepts any element with `measureInWindow`
 * at runtime — web Pressables resolve to `HTMLDivElement`, and some callers use `as`-casts to bypass typing.
 * Non-measurable elements fall back to zero dimensions.
 */
type MeasurableRef = RefObject<View | null>;

type Rect = {x: number; y: number} & Dimensions;

/** Sync popover-position math, shared by the async measure-and-resolve hook and any caller that already has a measured rect (e.g. from `getBoundingClientRect()`). */
function computeAnchorPosition(rect: Rect, alignment: AnchorAlignment): AnchorPosition {
    const {x, y, width, height} = rect;
    let horizontal = x + width;
    if (alignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT) {
        horizontal = x;
    } else if (alignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER) {
        horizontal = x + width / 2;
    }
    const vertical =
        alignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP
            ? y + height + CONST.MODAL.POPOVER_MENU_PADDING // TOP: menu opens below the anchor — add height + padding
            : y - CONST.MODAL.POPOVER_MENU_PADDING; // BOTTOM: menu opens above the anchor — subtract padding
    return {horizontal, vertical};
}

/**
 * Hook for calculating the position of a popover relative to an anchor element.
 *
 * Popovers are only used on larger screen widths. On small screens, the position will
 * default to `{horizontal: 0, vertical: 0, width: 0, height: 0}`.
 *
 * @returns An object containing a function to calculate the popover's position.
 *
 * @example
 * const { calculatePopoverPosition } = usePopoverPosition();
 *
 * // Later in a component
 * const position = await calculatePopoverPosition(anchorRef, {
 *   horizontal: 'center',
 *   vertical: 'top',
 * });
 * console.log(position);
 * // { horizontal: 120, vertical: 300, width: 50, height: 30 }
 */
function usePopoverPosition() {
    // Popovers are not used on small screen widths, but can be present in RHP
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const calculatePopoverPosition = useCallback(
        (anchorRef: MeasurableRef, anchorAlignment: AnchorAlignment = defaultAnchorAlignment) => {
            const element = anchorRef.current;
            if (isSmallScreenWidth || element === null || typeof element.measureInWindow !== 'function') {
                return Promise.resolve({horizontal: 0, vertical: 0, width: 0, height: 0});
            }
            return new Promise<AnchorPosition & Dimensions>((resolve) => {
                element.measureInWindow((x, y, width, height) => {
                    const {horizontal, vertical} = computeAnchorPosition({x, y, width, height}, anchorAlignment);
                    resolve({horizontal, vertical, width, height});
                });
            });
        },
        [isSmallScreenWidth],
    );

    return {calculatePopoverPosition};
}

export default usePopoverPosition;
export {computeAnchorPosition};
export type {MeasurableRef};
