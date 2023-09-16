/* eslint-disable no-console */
import {ValueOf} from 'type-fest';
import {View} from 'react-native';
import CONST from '../CONST';

type AnchorOrigin = {
    horizontal: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;
    vertical: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_VERTICAL>;
    shiftVertical?: number;
};

type AnchorPosition = {
    horizontal: number;
    vertical: number;
};

/**
 * Gets the x,y position of the passed in component for the purpose of anchoring another component to it.
 */
export default function calculateAnchorPosition(anchorComponent: View, anchorOrigin?: AnchorOrigin): Promise<AnchorPosition> {
    return new Promise((resolve) => {
        if (!anchorComponent) {
            return resolve({horizontal: 0, vertical: 0});
        }
        anchorComponent.measureInWindow((x, y, width, height) => {
            if (anchorOrigin?.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP && anchorOrigin?.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT) {
                return resolve({horizontal: x, vertical: y + height + (anchorOrigin?.shiftVertical ?? 0)});
            }
            return resolve({horizontal: x + width, vertical: y});
        });
    });
}
